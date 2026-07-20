"""Export app-ready JSON and GeoJSON files."""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from analysis.preprocessing.app_data import (  # noqa: E402
    build_geographies_payload,
    build_geography_records,
    summarize_regional_story,
)

DEFAULT_INDEX = ROOT / "artifacts" / "tables" / "adaptation_gap_index.csv"
DEFAULT_TRACE = ROOT / "artifacts" / "tables" / "adaptation_gap_indicator_trace.csv"
DEFAULT_LOOKUP = ROOT / "data" / "processed" / "geography_lookup.csv"
DEFAULT_OUTLOOK = ROOT / "artifacts" / "tables" / "adaptation_gap_outlook.csv"
DEFAULT_MONITORING_GAP = ROOT / "artifacts" / "tables" / "eda_monitoring_gap.csv"
DEFAULT_RANK_VOLATILITY = ROOT / "artifacts" / "tables" / "eda_rank_volatility.csv"
DEFAULT_COUNTRY_STORY = ROOT / "artifacts" / "tables" / "eda_country_story_labels.csv"
DEFAULT_SPATIAL_TYPOLOGIES = ROOT / "artifacts" / "tables" / "eda_spatial_typologies.csv"
DEFAULT_OUTLOOK_INTERPRETATION = ROOT / "artifacts" / "tables" / "eda_outlook_interpretation.csv"
DEFAULT_SIMILARITY_NEIGHBORS = ROOT / "artifacts" / "tables" / "eda_similarity_neighbors.csv"
DEFAULT_REGIONAL_CROSSCURRENTS = (
    ROOT / "artifacts" / "tables" / "eda_regional_crosscurrents.csv"
)
DEFAULT_REGIONAL_FEATURE_MATRIX = (
    ROOT / "artifacts" / "tables" / "eda_regional_feature_matrix.csv"
)
DEFAULT_PROCESSED_APP_DIR = ROOT / "data" / "processed" / "app"
DEFAULT_PUBLIC_DATA_DIR = ROOT / "app" / "public" / "data"
DEFAULT_SUMMARY_OUTPUT = ROOT / "artifacts" / "provenance" / "app_data_summary.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--index", type=Path, default=DEFAULT_INDEX)
    parser.add_argument("--indicator-trace", type=Path, default=DEFAULT_TRACE)
    parser.add_argument("--geography-lookup", type=Path, default=DEFAULT_LOOKUP)
    parser.add_argument("--outlook", type=Path, default=DEFAULT_OUTLOOK)
    parser.add_argument("--monitoring-gap", type=Path, default=DEFAULT_MONITORING_GAP)
    parser.add_argument("--rank-volatility", type=Path, default=DEFAULT_RANK_VOLATILITY)
    parser.add_argument("--country-story", type=Path, default=DEFAULT_COUNTRY_STORY)
    parser.add_argument("--spatial-typologies", type=Path, default=DEFAULT_SPATIAL_TYPOLOGIES)
    parser.add_argument(
        "--outlook-interpretation",
        type=Path,
        default=DEFAULT_OUTLOOK_INTERPRETATION,
    )
    parser.add_argument("--similarity-neighbors", type=Path, default=DEFAULT_SIMILARITY_NEIGHBORS)
    parser.add_argument(
        "--regional-crosscurrents", type=Path, default=DEFAULT_REGIONAL_CROSSCURRENTS
    )
    parser.add_argument(
        "--regional-feature-matrix", type=Path, default=DEFAULT_REGIONAL_FEATURE_MATRIX
    )
    parser.add_argument("--processed-app-dir", type=Path, default=DEFAULT_PROCESSED_APP_DIR)
    parser.add_argument("--public-data-dir", type=Path, default=DEFAULT_PUBLIC_DATA_DIR)
    parser.add_argument("--summary-output", type=Path, default=DEFAULT_SUMMARY_OUTPUT)
    return parser.parse_args()


def export_app_data(
    *,
    index_path: Path,
    trace_path: Path,
    lookup_path: Path,
    outlook_path: Path,
    monitoring_gap_path: Path,
    rank_volatility_path: Path,
    country_story_path: Path,
    spatial_typologies_path: Path,
    outlook_interpretation_path: Path,
    similarity_neighbors_path: Path,
    regional_crosscurrents_path: Path,
    regional_feature_matrix_path: Path,
    processed_app_dir: Path,
    public_data_dir: Path,
    summary_output: Path,
) -> dict[str, object]:
    index = pd.read_csv(index_path)
    lookup = pd.read_csv(lookup_path)
    trace = pd.read_csv(trace_path)
    outlook = pd.read_csv(outlook_path)
    monitoring_gap = pd.read_csv(monitoring_gap_path)
    rank_volatility = pd.read_csv(rank_volatility_path)
    country_story = pd.read_csv(country_story_path)
    spatial_typologies = pd.read_csv(spatial_typologies_path)
    outlook_interpretation = pd.read_csv(outlook_interpretation_path)
    similarity_neighbors = pd.read_csv(similarity_neighbors_path)
    regional_crosscurrents = pd.read_csv(regional_crosscurrents_path)
    regional_feature_matrix = pd.read_csv(regional_feature_matrix_path)

    records = build_geography_records(
        index=index,
        lookup=lookup,
        outlook=outlook,
        monitoring=monitoring_gap,
        rank=rank_volatility,
        story=country_story,
        spatial=spatial_typologies,
        outlook_display=outlook_interpretation,
        similarity_neighbors=similarity_neighbors,
        trace=trace,
        regional_crosscurrents=regional_crosscurrents,
        regional_feature_matrix=regional_feature_matrix,
    )
    geographies_payload = build_geographies_payload(records)
    country_details_payload = build_country_details_payload(records, trace=trace)

    processed_app_dir.mkdir(parents=True, exist_ok=True)
    public_data_dir.mkdir(parents=True, exist_ok=True)

    outputs = {
        "geographies.json": geographies_payload,
        "country_details.json": country_details_payload,
    }

    for filename, payload in outputs.items():
        write_json(processed_app_dir / filename, payload)
        shutil.copyfile(processed_app_dir / filename, public_data_dir / filename)

    summary = {
        "schema_version": 2,
        "geography_count": len(records),
        "processed_outputs": sorted(
            str((processed_app_dir / name).relative_to(ROOT)).replace("\\", "/")
            for name in outputs
        ),
        "public_outputs": sorted(
            str((public_data_dir / name).relative_to(ROOT)).replace("\\", "/") for name in outputs
        ),
        "source_refs": {
            "index": index_path.relative_to(ROOT).as_posix(),
            "indicator_trace": trace_path.relative_to(ROOT).as_posix(),
            "geography_lookup": lookup_path.relative_to(ROOT).as_posix(),
            "outlook": outlook_path.relative_to(ROOT).as_posix(),
            "monitoring_gap": monitoring_gap_path.relative_to(ROOT).as_posix(),
            "rank_volatility": rank_volatility_path.relative_to(ROOT).as_posix(),
            "country_story": country_story_path.relative_to(ROOT).as_posix(),
            "spatial_typologies": spatial_typologies_path.relative_to(ROOT).as_posix(),
            "outlook_interpretation": outlook_interpretation_path.relative_to(ROOT).as_posix(),
            "similarity_neighbors": similarity_neighbors_path.relative_to(ROOT).as_posix(),
            "regional_crosscurrents": regional_crosscurrents_path.relative_to(ROOT).as_posix(),
            "regional_feature_matrix": regional_feature_matrix_path.relative_to(ROOT).as_posix(),
        },
        "geometry_policy": "centroid_fallback_until_boundary_join",
        "evidence_count_contract": {
            "score_input_indicator_count": "score inputs only; maximum 8",
            "context_indicator_count": "context-only inputs; currently maximum 1",
            "trace_indicator_count": "all trace datasets",
        },
        "regional_story_contract": summarize_regional_story(records),
        "summary_output": summary_output.relative_to(ROOT).as_posix(),
    }
    write_json(summary_output, summary)
    return summary


def build_country_details_payload(
    records: list[dict[str, object]], *, trace: pd.DataFrame
) -> dict[str, object]:
    details = {record["geo_code"]: dict(record) for record in records}
    for geo_code, group in trace.groupby("geo_code", sort=True):
        indicators = []
        for row in group.sort_values("dataset_slug", kind="mergesort").to_dict(orient="records"):
            indicators.append(
                {
                    "dataset_slug": row["dataset_slug"],
                    "dataset_name": row["dataset_name"],
                    "pillar": row["pillar"],
                    "latest_year": int(row["latest_year"]),
                    "latest_value": nullable_float(row["latest_value"]),
                    "scoring_value": nullable_float(row.get("scoring_value")),
                    "unit": nullable_text(row.get("unit")),
                    "indicator_score": nullable_float(row["indicator_score"]),
                    "source_row_hash": row["source_row_hash"],
                }
            )
        if geo_code in details:
            details[geo_code]["indicators"] = indicators

    return {
        "schema_version": 2,
        "details": details,
        "source_refs": {
            "indicator_trace": "artifacts/tables/adaptation_gap_indicator_trace.csv",
        },
    }


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def nullable_float(value: object) -> float | None:
    if value is None or pd.isna(value) or value == "":
        return None
    return round(float(value), 4)


def nullable_text(value: object) -> str:
    if value is None or pd.isna(value):
        return ""
    return str(value)


def main() -> int:
    args = parse_args()
    index_path = ROOT / args.index if not args.index.is_absolute() else args.index
    trace_path = (
        ROOT / args.indicator_trace
        if not args.indicator_trace.is_absolute()
        else args.indicator_trace
    )
    lookup_path = (
        ROOT / args.geography_lookup
        if not args.geography_lookup.is_absolute()
        else args.geography_lookup
    )
    outlook_path = ROOT / args.outlook if not args.outlook.is_absolute() else args.outlook
    monitoring_gap_path = (
        ROOT / args.monitoring_gap if not args.monitoring_gap.is_absolute() else args.monitoring_gap
    )
    rank_volatility_path = (
        ROOT / args.rank_volatility
        if not args.rank_volatility.is_absolute()
        else args.rank_volatility
    )
    country_story_path = (
        ROOT / args.country_story if not args.country_story.is_absolute() else args.country_story
    )
    spatial_typologies_path = (
        ROOT / args.spatial_typologies
        if not args.spatial_typologies.is_absolute()
        else args.spatial_typologies
    )
    outlook_interpretation_path = (
        ROOT / args.outlook_interpretation
        if not args.outlook_interpretation.is_absolute()
        else args.outlook_interpretation
    )
    similarity_neighbors_path = (
        ROOT / args.similarity_neighbors
        if not args.similarity_neighbors.is_absolute()
        else args.similarity_neighbors
    )
    regional_crosscurrents_path = (
        ROOT / args.regional_crosscurrents
        if not args.regional_crosscurrents.is_absolute()
        else args.regional_crosscurrents
    )
    regional_feature_matrix_path = (
        ROOT / args.regional_feature_matrix
        if not args.regional_feature_matrix.is_absolute()
        else args.regional_feature_matrix
    )
    processed_app_dir = (
        ROOT / args.processed_app_dir
        if not args.processed_app_dir.is_absolute()
        else args.processed_app_dir
    )
    public_data_dir = (
        ROOT / args.public_data_dir
        if not args.public_data_dir.is_absolute()
        else args.public_data_dir
    )
    summary_output = (
        ROOT / args.summary_output if not args.summary_output.is_absolute() else args.summary_output
    )

    summary = export_app_data(
        index_path=index_path,
        trace_path=trace_path,
        lookup_path=lookup_path,
        outlook_path=outlook_path,
        monitoring_gap_path=monitoring_gap_path,
        rank_volatility_path=rank_volatility_path,
        country_story_path=country_story_path,
        spatial_typologies_path=spatial_typologies_path,
        outlook_interpretation_path=outlook_interpretation_path,
        similarity_neighbors_path=similarity_neighbors_path,
        regional_crosscurrents_path=regional_crosscurrents_path,
        regional_feature_matrix_path=regional_feature_matrix_path,
        processed_app_dir=processed_app_dir,
        public_data_dir=public_data_dir,
        summary_output=summary_output,
    )

    print(
        f"Exported app data: geographies={summary['geography_count']}, "
        f"country_details={summary['geography_count']}"
    )
    print(f"Wrote processed app data: {processed_app_dir}")
    print(f"Wrote public app data: {public_data_dir}")
    print(f"Wrote summary: {summary_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
