"""Build the baseline Pacific Adaptation Gap Index."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from analysis.features.gap_index import build_gap_index  # noqa: E402


DEFAULT_CONFIG = ROOT / "configs" / "gap_index.yml"
DEFAULT_OBSERVATIONS = ROOT / "data" / "processed" / "official_observations.csv"
DEFAULT_INDEX = ROOT / "artifacts" / "tables" / "adaptation_gap_index.csv"
DEFAULT_TRACE = ROOT / "artifacts" / "tables" / "adaptation_gap_indicator_trace.csv"
DEFAULT_SUMMARY = ROOT / "artifacts" / "provenance" / "gap_index_summary.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--observations", type=Path, default=DEFAULT_OBSERVATIONS)
    parser.add_argument("--index-output", type=Path, default=DEFAULT_INDEX)
    parser.add_argument("--trace-output", type=Path, default=DEFAULT_TRACE)
    parser.add_argument("--summary-output", type=Path, default=DEFAULT_SUMMARY)
    return parser.parse_args()


def build_outputs(
    *,
    observations_path: Path,
    index_output: Path,
    trace_output: Path,
    summary_output: Path,
    config_path: Path,
) -> dict[str, object]:
    observations = pd.read_csv(observations_path)
    index, trace = build_gap_index(observations)

    index_output.parent.mkdir(parents=True, exist_ok=True)
    trace_output.parent.mkdir(parents=True, exist_ok=True)
    summary_output.parent.mkdir(parents=True, exist_ok=True)

    index.to_csv(index_output, index=False)
    trace.to_csv(trace_output, index=False)
    summary = build_summary(
        index=index,
        trace=trace,
        observations_path=observations_path,
        index_output=index_output,
        trace_output=trace_output,
        config_path=config_path,
    )
    summary_output.write_text(json.dumps(summary, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    return summary


def build_summary(
    *,
    index: pd.DataFrame,
    trace: pd.DataFrame,
    observations_path: Path,
    index_output: Path,
    trace_output: Path,
    config_path: Path,
) -> dict[str, object]:
    scored = index[index["score_status"] == "scored"].copy()
    top_gap = scored.sort_values("adaptation_gap_score", ascending=False).head(5)
    lowest_gap = scored.sort_values("adaptation_gap_score", ascending=True).head(5)
    return {
        "schema_version": 1,
        "pipeline_task": "TASK-003",
        "method": (
            "latest-observation percentile ranks, anomaly magnitudes for anomaly datasets, "
            "pressure minus capacity rescaled 0-100"
        ),
        "config": config_path.relative_to(ROOT).as_posix(),
        "inputs": {
            "observations": observations_path.relative_to(ROOT).as_posix(),
        },
        "outputs": {
            "index": index_output.relative_to(ROOT).as_posix(),
            "indicator_trace": trace_output.relative_to(ROOT).as_posix(),
        },
        "geography_count": int(len(index)),
        "scored_geography_count": int(len(scored)),
        "insufficient_data_count": int((index["score_status"] != "scored").sum()),
        "indicator_trace_rows": int(len(trace)),
        "top_gap_geographies": top_gap[
            ["geo_code", "adaptation_gap_score", "climate_pressure_score", "capacity_score"]
        ].to_dict(orient="records"),
        "lowest_gap_geographies": lowest_gap[
            ["geo_code", "adaptation_gap_score", "climate_pressure_score", "capacity_score"]
        ].to_dict(orient="records"),
        "caveats": [
            "Scores are comparative percentile ranks within the available Pacific geographies.",
            "The baseline uses latest available observations and equal weights within available pillars.",
            "Anomaly datasets are scored by absolute anomaly magnitude while raw values remain in the trace.",
            "Directly affected persons are raw counts, not population-normalized exposure.",
            "Missing values are not imputed; geographies lacking required pillars are not scored.",
            "Capacity indicators are proxies, not a complete measure of adaptation readiness.",
        ],
    }


def main() -> int:
    args = parse_args()
    config_path = ROOT / args.config if not args.config.is_absolute() else args.config
    observations_path = (
        ROOT / args.observations if not args.observations.is_absolute() else args.observations
    )
    index_output = ROOT / args.index_output if not args.index_output.is_absolute() else args.index_output
    trace_output = ROOT / args.trace_output if not args.trace_output.is_absolute() else args.trace_output
    summary_output = (
        ROOT / args.summary_output if not args.summary_output.is_absolute() else args.summary_output
    )

    summary = build_outputs(
        observations_path=observations_path,
        index_output=index_output,
        trace_output=trace_output,
        summary_output=summary_output,
        config_path=config_path,
    )
    print(
        f"Built gap index: geographies={summary['geography_count']}, "
        f"scored={summary['scored_geography_count']}, "
        f"insufficient={summary['insufficient_data_count']}"
    )
    print(f"Wrote index: {index_output}")
    print(f"Wrote indicator trace: {trace_output}")
    print(f"Wrote summary: {summary_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
