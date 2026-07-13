"""Profile official datasets for coverage, years, and missingness."""

from __future__ import annotations

import argparse
from datetime import UTC, datetime
import json
from pathlib import Path
import sys

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from analysis.io.dataset_config import load_dataset_config  # noqa: E402
from analysis.io.dataset_profile import (  # noqa: E402
    DatasetProfile,
    error_profile,
    profile_csv_text,
    profile_to_contract,
    profile_to_csv_row,
    slugify,
)
from analysis.io.official_data import OfficialDataset, read_official_inventory  # noqa: E402
from analysis.io.sdmx import DEFAULT_ACCEPT_HEADER, fetch_sdmx_csv_text  # noqa: E402


DEFAULT_CONFIG = ROOT / "configs" / "datasets.yml"
DEFAULT_OUTPUT = ROOT / "artifacts" / "tables" / "dataset_profile.csv"
DEFAULT_CONTRACTS_DIR = ROOT / "data" / "contracts"
DEFAULT_RAW_DIR = ROOT / "data" / "raw" / "official"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG,
        help="Path to dataset profiling config.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Path for the profile CSV artifact.",
    )
    parser.add_argument(
        "--contracts-dir",
        type=Path,
        default=DEFAULT_CONTRACTS_DIR,
        help="Directory for per-dataset JSON contracts.",
    )
    parser.add_argument(
        "--raw-dir",
        type=Path,
        default=DEFAULT_RAW_DIR,
        help="Directory containing raw SDMX CSV cache files.",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=30.0,
        help="HTTP timeout in seconds for each SDMX CSV request.",
    )
    parser.add_argument(
        "--generated-at",
        default="",
        help="Override generated/profiled UTC timestamp for deterministic regeneration.",
    )
    return parser.parse_args()


def profile_priority_datasets(
    *,
    config: dict[str, object],
    timeout: float,
    raw_dir: Path | None = None,
) -> list[DatasetProfile]:
    inventory_path = ROOT / str(config.get("official_inventory", "research/official_datasets_2026.csv"))
    accept_header = str(config.get("api_accept_header", DEFAULT_ACCEPT_HEADER))
    inventory = {dataset.name: dataset for dataset in read_official_inventory(inventory_path)}

    profiles: list[DatasetProfile] = []
    for entry in config["priority_datasets"]:
        if not isinstance(entry, dict):
            raise ValueError("Each priority dataset entry must be a mapping.")

        name = str(entry["name"])
        pillar = str(entry["pillar"])
        metadata = _profile_metadata(entry)
        inventory_row = inventory.get(name)
        if inventory_row is None:
            profiles.append(
                error_profile(
                    name=name,
                    pillar=pillar,
                    story_role="",
                    official_url="",
                    sdmx_csv_api_url="",
                    status="missing_inventory_row",
                    caveat_notes="Dataset is listed in config but not found in official inventory.",
                    **metadata,
                )
            )
            continue

        raw_path = raw_dir / f"{slugify(name)}.csv" if raw_dir is not None else None
        if raw_path is not None and raw_path.exists():
            profiles.append(
                profile_csv_text(
                    name=inventory_row.name,
                    pillar=pillar,
                    story_role=inventory_row.story_role,
                    official_url=inventory_row.official_url,
                    sdmx_csv_api_url=inventory_row.sdmx_csv_api_url,
                    csv_text=raw_path.read_text(encoding="utf-8"),
                    **metadata,
                )
            )
            continue

        profiles.append(
            profile_inventory_row(
                inventory_row=inventory_row,
                pillar=pillar,
                accept_header=accept_header,
                timeout=timeout,
                **metadata,
            )
        )

    return profiles


def profile_inventory_row(
    *,
    inventory_row: OfficialDataset,
    pillar: str,
    accept_header: str,
    timeout: float,
    candidate: bool = False,
    denominator: str = "not stated",
    grain: str = "not stated",
    source_semantics: str = "not stated",
    licence: str = "not stated",
    processing_decision: str = "not stated",
    decision_reason: str = "not stated",
) -> DatasetProfile:
    if not inventory_row.sdmx_csv_api_url:
        return error_profile(
            name=inventory_row.name,
            pillar=pillar,
            story_role=inventory_row.story_role,
            official_url=inventory_row.official_url,
            sdmx_csv_api_url="",
            status="no_api_url",
            caveat_notes="Official inventory has no SDMX CSV API URL.",
            candidate=candidate,
            denominator=denominator,
            grain=grain,
            source_semantics=source_semantics,
            licence=licence,
            processing_decision=processing_decision,
            decision_reason=decision_reason,
        )

    csv_text, error_status, caveat_notes = fetch_sdmx_csv_text(
        url=inventory_row.sdmx_csv_api_url,
        accept_header=accept_header,
        timeout=timeout,
    )
    if error_status:
        return error_profile(
            name=inventory_row.name,
            pillar=pillar,
            story_role=inventory_row.story_role,
            official_url=inventory_row.official_url,
            sdmx_csv_api_url=inventory_row.sdmx_csv_api_url,
            status=error_status,
            caveat_notes=caveat_notes,
            candidate=candidate,
            denominator=denominator,
            grain=grain,
            source_semantics=source_semantics,
            licence=licence,
            processing_decision=processing_decision,
            decision_reason=decision_reason,
        )

    return profile_csv_text(
        name=inventory_row.name,
        pillar=pillar,
        story_role=inventory_row.story_role,
        official_url=inventory_row.official_url,
        sdmx_csv_api_url=inventory_row.sdmx_csv_api_url,
        csv_text=csv_text or "",
        candidate=candidate,
        denominator=denominator,
        grain=grain,
        source_semantics=source_semantics,
        licence=licence,
        processing_decision=processing_decision,
        decision_reason=decision_reason,
    )


def _profile_metadata(entry: dict[str, object]) -> dict[str, object]:
    return {
        "candidate": str(entry.get("candidate", "false")).lower() == "true",
        "denominator": str(entry.get("denominator", "not stated")),
        "grain": str(entry.get("grain", "not stated")),
        "source_semantics": str(entry.get("source_semantics", "not stated")),
        "licence": str(entry.get("licence", "not stated")),
        "processing_decision": str(entry.get("processing_decision", "not stated")),
        "decision_reason": str(entry.get("decision_reason", "not stated")),
    }


def write_outputs(
    *,
    profiles: list[DatasetProfile],
    output_path: Path,
    contracts_dir: Path,
    generated_at_utc: str,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    contracts_dir.mkdir(parents=True, exist_ok=True)

    rows = [profile_to_csv_row(profile, generated_at_utc=generated_at_utc) for profile in profiles]
    pd.DataFrame(rows).to_csv(output_path, index=False)

    for profile in profiles:
        contract = profile_to_contract(profile, generated_at_utc=generated_at_utc)
        contract_path = contracts_dir / f"{profile.slug}.json"
        contract_path.write_text(
            json.dumps(contract, indent=2, ensure_ascii=True) + "\n",
            encoding="utf-8",
        )


def print_summary(profiles: list[DatasetProfile], output_path: Path, contracts_dir: Path) -> None:
    ok_count = sum(1 for profile in profiles if profile.status == "ok")
    print(f"Profiled {len(profiles)} priority datasets ({ok_count} ok).")
    print(f"Wrote profile table: {output_path}")
    print(f"Wrote contracts: {contracts_dir}")

    for profile in profiles:
        years = (
            ""
            if profile.year_start is None or profile.year_end is None
            else f"{profile.year_start}-{profile.year_end}"
        )
        print(
            f"- {profile.name}: {profile.status}, rows={profile.row_count}, "
            f"geographies={profile.geography_count}, years={years}"
        )


def main() -> int:
    args = parse_args()
    config_path = ROOT / args.config if not args.config.is_absolute() else args.config
    output_path = ROOT / args.output if not args.output.is_absolute() else args.output
    contracts_dir = ROOT / args.contracts_dir if not args.contracts_dir.is_absolute() else args.contracts_dir
    raw_dir = ROOT / args.raw_dir if not args.raw_dir.is_absolute() else args.raw_dir

    config = load_dataset_config(config_path)
    profiles = profile_priority_datasets(config=config, timeout=args.timeout, raw_dir=raw_dir)
    generated_at_utc = args.generated_at or datetime.now(UTC).replace(microsecond=0).isoformat().replace(
        "+00:00",
        "Z",
    )

    write_outputs(
        profiles=profiles,
        output_path=output_path,
        contracts_dir=contracts_dir,
        generated_at_utc=generated_at_utc,
    )
    print_summary(profiles, output_path, contracts_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
