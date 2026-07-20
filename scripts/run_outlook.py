"""Run the Adaptation Gap Outlook baseline."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from analysis.modeling.outlook import (  # noqa: E402
    build_outlook_projection,
    make_climate_trend_diagnostics,
)

DEFAULT_CONFIG = ROOT / "configs" / "outlook.yml"
DEFAULT_OBSERVATIONS = ROOT / "data" / "processed" / "official_observations.csv"
DEFAULT_INDEX = ROOT / "artifacts" / "tables" / "adaptation_gap_index.csv"
DEFAULT_PROJECTION = ROOT / "artifacts" / "tables" / "adaptation_gap_outlook.csv"
DEFAULT_DIAGNOSTICS = ROOT / "artifacts" / "tables" / "climate_trend_diagnostics.csv"
DEFAULT_SUMMARY = ROOT / "artifacts" / "provenance" / "outlook_summary.json"
DEFAULT_RUN_DIR = ROOT / "artifacts" / "logs" / "runs" / "task-004-outlook-baseline"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--observations", type=Path, default=DEFAULT_OBSERVATIONS)
    parser.add_argument("--index", type=Path, default=DEFAULT_INDEX)
    parser.add_argument("--projection-output", type=Path, default=DEFAULT_PROJECTION)
    parser.add_argument("--diagnostics-output", type=Path, default=DEFAULT_DIAGNOSTICS)
    parser.add_argument("--summary-output", type=Path, default=DEFAULT_SUMMARY)
    parser.add_argument("--run-dir", type=Path, default=DEFAULT_RUN_DIR)
    return parser.parse_args()


def run_outlook(
    *,
    config_path: Path,
    observations_path: Path,
    index_path: Path,
    projection_output: Path,
    diagnostics_output: Path,
    summary_output: Path,
    run_dir: Path,
) -> dict[str, object]:
    config = load_outlook_config(config_path)
    observations = pd.read_csv(observations_path)
    current_index = pd.read_csv(index_path)

    diagnostics = make_climate_trend_diagnostics(
        observations,
        horizons=config["horizons"],
        minimum_points=config["minimum_points"],
    )
    projection = build_outlook_projection(
        diagnostics=diagnostics,
        current_index=current_index,
        horizons=config["horizons"],
    )
    summary = build_summary(
        config=config,
        diagnostics=diagnostics,
        projection=projection,
        observations_path=observations_path,
        index_path=index_path,
        projection_output=projection_output,
        diagnostics_output=diagnostics_output,
    )

    projection_output.parent.mkdir(parents=True, exist_ok=True)
    diagnostics_output.parent.mkdir(parents=True, exist_ok=True)
    summary_output.parent.mkdir(parents=True, exist_ok=True)
    run_dir.mkdir(parents=True, exist_ok=True)

    diagnostics.to_csv(diagnostics_output, index=False)
    projection.to_csv(projection_output, index=False)
    summary_output.write_text(
        json.dumps(summary, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    (run_dir / "metrics.json").write_text(
        json.dumps(summary["metrics"], indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    projection.to_csv(run_dir / "projection.csv", index=False)
    diagnostics.to_csv(run_dir / "diagnostics.csv", index=False)
    return summary


def load_outlook_config(path: Path) -> dict[str, object]:
    horizons: list[int] = []
    minimum_points = 8
    in_horizons = False
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if not raw_line.startswith(" "):
            in_horizons = stripped == "horizons:"
            continue
        if in_horizons and stripped.startswith("- "):
            horizons.append(int(stripped[2:].strip()))
        if "minimum_points:" in stripped:
            _, _, value = stripped.partition(":")
            minimum_points = int(value.strip())

    if not horizons:
        horizons = [2030, 2050]

    return {"horizons": horizons, "minimum_points": minimum_points}


def build_summary(
    *,
    config: dict[str, object],
    diagnostics: pd.DataFrame,
    projection: pd.DataFrame,
    observations_path: Path,
    index_path: Path,
    projection_output: Path,
    diagnostics_output: Path,
) -> dict[str, object]:
    metrics = build_metrics(diagnostics=diagnostics, projection=projection)
    return {
        "schema_version": 1,
        "pipeline_task": "TASK-004",
        "status": "methodology_ready_app_optional",
        "stance": "transparent outlook baseline, not operational prediction",
        "horizons": config["horizons"],
        "minimum_points": config["minimum_points"],
        "inputs": {
            "observations": observations_path.relative_to(ROOT).as_posix(),
            "current_index": index_path.relative_to(ROOT).as_posix(),
        },
        "outputs": {
            "projection": projection_output.relative_to(ROOT).as_posix(),
            "diagnostics": diagnostics_output.relative_to(ROOT).as_posix(),
        },
        "metrics": metrics,
        "caveats": [
            "Climate trends are simple linear baselines over available historical observations.",
            "Capacity scenarios use current capacity scores carried forward or modestly improved.",
            "The outlook is useful for exploration and communication, not operational forecasting.",
            "Rows include caveat_notes and should not appear in the app without visible "
            "methodology.",
        ],
    }


def build_metrics(*, diagnostics: pd.DataFrame, projection: pd.DataFrame) -> dict[str, object]:
    backtest = diagnostics[diagnostics["holdout_linear_mae"].notna()].copy()
    beats_naive = int(backtest["backtest_beats_naive"].eq(True).sum()) if not backtest.empty else 0
    mean_linear_mae = (
        None if backtest.empty else round(float(backtest["holdout_linear_mae"].mean()), 4)
    )
    mean_naive_mae = (
        None if backtest.empty else round(float(backtest["holdout_naive_mae"].mean()), 4)
    )
    return {
        "trend_series_count": int(len(diagnostics)),
        "trend_geography_count": (
            int(diagnostics["geo_code"].nunique()) if not diagnostics.empty else 0
        ),
        "projection_rows": int(len(projection)),
        "backtested_series_count": int(len(backtest)),
        "linear_beats_naive_count": beats_naive,
        "mean_linear_holdout_mae": mean_linear_mae,
        "mean_naive_holdout_mae": mean_naive_mae,
    }


def main() -> int:
    args = parse_args()
    config_path = ROOT / args.config if not args.config.is_absolute() else args.config
    observations_path = (
        ROOT / args.observations if not args.observations.is_absolute() else args.observations
    )
    index_path = ROOT / args.index if not args.index.is_absolute() else args.index
    projection_output = (
        ROOT / args.projection_output
        if not args.projection_output.is_absolute()
        else args.projection_output
    )
    diagnostics_output = (
        ROOT / args.diagnostics_output
        if not args.diagnostics_output.is_absolute()
        else args.diagnostics_output
    )
    summary_output = (
        ROOT / args.summary_output if not args.summary_output.is_absolute() else args.summary_output
    )
    run_dir = ROOT / args.run_dir if not args.run_dir.is_absolute() else args.run_dir

    summary = run_outlook(
        config_path=config_path,
        observations_path=observations_path,
        index_path=index_path,
        projection_output=projection_output,
        diagnostics_output=diagnostics_output,
        summary_output=summary_output,
        run_dir=run_dir,
    )
    metrics = summary["metrics"]
    print(
        f"Built outlook baseline: trend_series={metrics['trend_series_count']}, "
        f"projection_rows={metrics['projection_rows']}, "
        f"backtests={metrics['backtested_series_count']}"
    )
    print(f"Wrote projection: {projection_output}")
    print(f"Wrote diagnostics: {diagnostics_output}")
    print(f"Wrote summary: {summary_output}")
    print(f"Wrote local run bundle: {run_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
