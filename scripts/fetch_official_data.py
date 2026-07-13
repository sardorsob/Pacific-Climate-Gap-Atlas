"""Fetch official Pacific Data Hub datasets into ignored raw cache files."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from analysis.io.dataset_config import load_dataset_config  # noqa: E402
from analysis.io.dataset_profile import slugify  # noqa: E402
from analysis.io.official_data import read_official_inventory  # noqa: E402
from analysis.io.sdmx import DEFAULT_ACCEPT_HEADER, fetch_sdmx_csv_text  # noqa: E402


DEFAULT_CONFIG = ROOT / "configs" / "datasets.yml"
DEFAULT_RAW_DIR = ROOT / "data" / "raw" / "official"
DEFAULT_MANIFEST = DEFAULT_RAW_DIR / "manifest.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_RAW_DIR)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--timeout", type=float, default=30.0)
    return parser.parse_args()


def fetch_to_raw_cache(
    *,
    config_path: Path,
    output_dir: Path,
    manifest_path: Path,
    timeout: float,
) -> dict[str, object]:
    config = load_dataset_config(config_path)
    inventory_path = ROOT / str(config.get("official_inventory", "research/official_datasets_2026.csv"))
    accept_header = str(config.get("api_accept_header", DEFAULT_ACCEPT_HEADER))
    inventory = {dataset.name: dataset for dataset in read_official_inventory(inventory_path)}

    output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    dataset_entries: list[dict[str, object]] = []
    for entry in config["priority_datasets"]:
        name = str(entry["name"])
        pillar = str(entry["pillar"])
        dataset = inventory.get(name)
        if dataset is None:
            dataset_entries.append(
                {
                    "name": name,
                    "slug": slugify(name),
                    "pillar": pillar,
                    "status": "missing_inventory_row",
                    "caveat_notes": "Dataset is listed in config but not found in official inventory.",
                }
            )
            continue

        slug = slugify(dataset.name)
        text, status, caveat_notes = fetch_sdmx_csv_text(
            url=dataset.sdmx_csv_api_url,
            accept_header=accept_header,
            timeout=timeout,
        )
        raw_path = output_dir / f"{slug}.csv"
        content_hash = ""
        byte_count = 0
        if status is None and text is not None:
            raw_path.write_text(text, encoding="utf-8")
            content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
            byte_count = len(text.encode("utf-8"))

        dataset_entries.append(
            {
                "name": dataset.name,
                "slug": slug,
                "pillar": pillar,
                "story_role": dataset.story_role,
                "status": status or "ok",
                "raw_path": (
                    raw_path.relative_to(ROOT).as_posix()
                    if status is None and text is not None
                    else ""
                ),
                "byte_count": byte_count,
                "source_content_sha256": content_hash,
                "official_url": dataset.official_url,
                "sdmx_csv_api_url": dataset.sdmx_csv_api_url,
                "caveat_notes": caveat_notes,
            }
        )

    manifest = {
        "schema_version": 1,
        "source": "Pacific Data Hub SDMX CSV API",
        "dataset_count": len(dataset_entries),
        "ok_count": sum(1 for item in dataset_entries if item["status"] == "ok"),
        "datasets": dataset_entries,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    return manifest


def main() -> int:
    args = parse_args()
    config_path = ROOT / args.config if not args.config.is_absolute() else args.config
    output_dir = ROOT / args.output_dir if not args.output_dir.is_absolute() else args.output_dir
    manifest_path = ROOT / args.manifest if not args.manifest.is_absolute() else args.manifest

    manifest = fetch_to_raw_cache(
        config_path=config_path,
        output_dir=output_dir,
        manifest_path=manifest_path,
        timeout=args.timeout,
    )
    print(
        f"Fetched {manifest['ok_count']}/{manifest['dataset_count']} official datasets "
        f"to {output_dir}"
    )
    print(f"Wrote raw manifest: {manifest_path}")
    return 0 if manifest["ok_count"] == manifest["dataset_count"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
