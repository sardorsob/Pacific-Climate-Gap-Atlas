"""Build normalized processed datasets from official source pulls."""

from __future__ import annotations

import argparse
import hashlib
from io import StringIO
import json
from pathlib import Path
import sys

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from analysis.io.dataset_config import load_dataset_config, select_processing_datasets  # noqa: E402
from analysis.io.dataset_profile import slugify  # noqa: E402
from analysis.io.official_data import (  # noqa: E402
    OfficialDataset,
    read_official_inventory,
    read_validated_raw_cache,
)
from analysis.io.sdmx import DEFAULT_ACCEPT_HEADER, fetch_sdmx_csv_text  # noqa: E402
from analysis.preprocessing.official_dataset import (  # noqa: E402
    build_app_dataset_summary,
    build_geography_lookup,
    build_pipeline_summary,
    normalize_official_frame,
)


DEFAULT_CONFIG = ROOT / "configs" / "datasets.yml"
DEFAULT_RAW_DIR = ROOT / "data" / "raw" / "official"
DEFAULT_OBSERVATIONS = ROOT / "data" / "processed" / "official_observations.csv"
DEFAULT_GEOGRAPHY_LOOKUP = ROOT / "data" / "processed" / "geography_lookup.csv"
DEFAULT_APP_SUMMARY = ROOT / "data" / "processed" / "app" / "atlas_dataset_summary.json"
DEFAULT_PROVENANCE = ROOT / "artifacts" / "provenance" / "dataset_pipeline_summary.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW_DIR)
    parser.add_argument("--observations", type=Path, default=DEFAULT_OBSERVATIONS)
    parser.add_argument("--geography-lookup", type=Path, default=DEFAULT_GEOGRAPHY_LOOKUP)
    parser.add_argument("--app-summary", type=Path, default=DEFAULT_APP_SUMMARY)
    parser.add_argument("--provenance", type=Path, default=DEFAULT_PROVENANCE)
    parser.add_argument("--timeout", type=float, default=30.0)
    return parser.parse_args()


def build_processed_dataset(
    *,
    config_path: Path,
    raw_dir: Path,
    observations_path: Path,
    geography_lookup_path: Path,
    app_summary_path: Path,
    provenance_path: Path,
    timeout: float,
) -> dict[str, object]:
    config = load_dataset_config(config_path)
    inventory_path = ROOT / str(config.get("official_inventory", "research/official_datasets_2026.csv"))
    accept_header = str(config.get("api_accept_header", DEFAULT_ACCEPT_HEADER))
    inventory = {dataset.name: dataset for dataset in read_official_inventory(inventory_path)}

    normalized_frames: list[pd.DataFrame] = []
    fetch_log: list[dict[str, object]] = []
    for entry in select_processing_datasets(config):
        name = str(entry["name"])
        pillar = str(entry["pillar"])
        dataset = inventory.get(name)
        if dataset is None:
            fetch_log.append(
                {
                    "name": name,
                    "slug": slugify(name),
                    "pillar": pillar,
                    "status": "missing_inventory_row",
                    "rows": 0,
                    "caveat_notes": "Dataset is listed in config but not found in official inventory.",
                }
            )
            continue

        csv_text, fetch_status, caveat_notes = load_or_fetch_csv_text(
            dataset=dataset,
            raw_dir=raw_dir,
            accept_header=accept_header,
            timeout=timeout,
        )
        content_hash = hashlib.sha256(csv_text.encode("utf-8")).hexdigest() if csv_text else ""
        if fetch_status != "ok":
            fetch_log.append(
                {
                    "name": dataset.name,
                    "slug": slugify(dataset.name),
                    "pillar": pillar,
                    "status": fetch_status,
                    "rows": 0,
                    "caveat_notes": caveat_notes,
                }
            )
            continue

        frame = pd.read_csv(StringIO(csv_text), dtype=str, keep_default_na=False)
        normalized = normalize_official_frame(
            frame=frame,
            dataset_name=dataset.name,
            dataset_slug=slugify(dataset.name),
            pillar=pillar,
            story_role=dataset.story_role,
            official_url=dataset.official_url,
            sdmx_csv_api_url=dataset.sdmx_csv_api_url,
            source_content_sha256=content_hash,
        )
        normalized_frames.append(normalized)
        fetch_log.append(
            {
                "name": dataset.name,
                "slug": slugify(dataset.name),
                "pillar": pillar,
                "status": fetch_status,
                "rows": int(len(normalized)),
                "source_content_sha256": content_hash,
                "caveat_notes": caveat_notes,
            }
        )

    if not normalized_frames:
        raise RuntimeError("No official datasets were processed successfully.")

    observations = pd.concat(normalized_frames, ignore_index=True)
    observations = observations.sort_values(
        ["dataset_slug", "geo_code", "year", "indicator_code"],
        kind="mergesort",
    ).reset_index(drop=True)
    geography_lookup = build_geography_lookup(observations)
    app_summary = build_app_dataset_summary(observations)
    provenance = build_pipeline_summary(observations)
    provenance["source_fetch_log"] = fetch_log
    provenance["outputs"] = {
        "observations": observations_path.relative_to(ROOT).as_posix(),
        "geography_lookup": geography_lookup_path.relative_to(ROOT).as_posix(),
        "app_summary": app_summary_path.relative_to(ROOT).as_posix(),
    }

    observations_path.parent.mkdir(parents=True, exist_ok=True)
    geography_lookup_path.parent.mkdir(parents=True, exist_ok=True)
    app_summary_path.parent.mkdir(parents=True, exist_ok=True)
    provenance_path.parent.mkdir(parents=True, exist_ok=True)

    observations.to_csv(observations_path, index=False)
    geography_lookup.to_csv(geography_lookup_path, index=False)
    app_summary_path.write_text(
        json.dumps(app_summary, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    provenance_path.write_text(
        json.dumps(provenance, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )

    return provenance


def load_or_fetch_csv_text(
    *,
    dataset: OfficialDataset,
    raw_dir: Path,
    accept_header: str,
    timeout: float,
) -> tuple[str, str, str]:
    slug = slugify(dataset.name)
    cached_text, _manifest_entry, cache_error = read_validated_raw_cache(
        raw_dir=raw_dir,
        slug=slug,
    )
    if cache_error:
        return "", "cache_manifest_error", cache_error
    if cached_text is not None:
        return cached_text, "ok", ""

    text, status, caveat_notes, _provenance = fetch_sdmx_csv_text(
        url=dataset.sdmx_csv_api_url,
        accept_header=accept_header,
        timeout=timeout,
    )
    if status is not None or text is None:
        return "", status or "fetch_error", caveat_notes

    raw_dir.mkdir(parents=True, exist_ok=True)
    raw_path = raw_dir / f"{slug}.csv"
    raw_path.write_bytes(text.encode("utf-8"))
    return text, "ok", ""


def main() -> int:
    args = parse_args()
    config_path = ROOT / args.config if not args.config.is_absolute() else args.config
    raw_dir = ROOT / args.raw_dir if not args.raw_dir.is_absolute() else args.raw_dir
    observations_path = ROOT / args.observations if not args.observations.is_absolute() else args.observations
    geography_lookup_path = (
        ROOT / args.geography_lookup
        if not args.geography_lookup.is_absolute()
        else args.geography_lookup
    )
    app_summary_path = ROOT / args.app_summary if not args.app_summary.is_absolute() else args.app_summary
    provenance_path = ROOT / args.provenance if not args.provenance.is_absolute() else args.provenance

    provenance = build_processed_dataset(
        config_path=config_path,
        raw_dir=raw_dir,
        observations_path=observations_path,
        geography_lookup_path=geography_lookup_path,
        app_summary_path=app_summary_path,
        provenance_path=provenance_path,
        timeout=args.timeout,
    )

    print(
        f"Built processed dataset: rows={provenance['total_rows']}, "
        f"datasets={provenance['dataset_count']}, geographies={provenance['geography_count']}"
    )
    print(f"Wrote observations: {observations_path}")
    print(f"Wrote geography lookup: {geography_lookup_path}")
    print(f"Wrote app summary: {app_summary_path}")
    print(f"Wrote provenance: {provenance_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
