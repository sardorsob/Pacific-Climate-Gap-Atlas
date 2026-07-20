"""Transparent baseline models for the Adaptation Gap Outlook."""

from __future__ import annotations

import math
from dataclasses import dataclass

import pandas as pd

CAPACITY_IMPROVEMENT_RATES = {
    "capacity_flat": {2030: 0.0, 2050: 0.0},
    "capacity_gradual_improvement": {2030: 0.05, 2050: 0.15},
}


@dataclass(frozen=True)
class TrendFit:
    """Simple linear trend fit for one geography/indicator series."""

    n_obs: int
    first_year: int
    last_year: int
    slope_per_year: float
    intercept: float
    residual_std: float
    holdout_linear_mae: float | None
    holdout_naive_mae: float | None
    projections: dict[int, float]


def latest_value_baseline(
    frame: pd.DataFrame, *, group_col: str, time_col: str, value_col: str
) -> pd.DataFrame:
    """Return the latest observed value per group as a no-change baseline."""

    if frame.empty:
        return frame[[group_col, time_col, value_col]].copy()
    ordered = frame.sort_values([group_col, time_col])
    return ordered.groupby(group_col, as_index=False).tail(1)[[group_col, time_col, value_col]]


def fit_linear_trend(
    series: pd.DataFrame,
    *,
    horizons: list[int],
    holdout_points: int = 3,
) -> TrendFit:
    """Fit a deterministic least-squares linear trend and holdout diagnostic."""

    frame = series[["year", "scoring_value"]].dropna().sort_values("year").copy()
    if len(frame) < 2:
        raise ValueError("At least two observations are required for a linear trend.")

    slope, intercept = _fit_slope_intercept(frame["year"], frame["scoring_value"])
    predictions = intercept + slope * frame["year"]
    residuals = frame["scoring_value"] - predictions
    residual_std = _sample_std(residuals)

    holdout_linear_mae: float | None = None
    holdout_naive_mae: float | None = None
    if len(frame) > holdout_points + 2:
        train = frame.iloc[:-holdout_points].copy()
        test = frame.iloc[-holdout_points:].copy()
        train_slope, train_intercept = _fit_slope_intercept(train["year"], train["scoring_value"])
        linear_predictions = train_intercept + train_slope * test["year"]
        naive_predictions = pd.Series(
            [train["scoring_value"].iloc[-1]] * len(test),
            index=test.index,
        )
        holdout_linear_mae = _mean_absolute_error(test["scoring_value"], linear_predictions)
        holdout_naive_mae = _mean_absolute_error(test["scoring_value"], naive_predictions)

    projections = {horizon: max(0.0, intercept + slope * horizon) for horizon in horizons}
    return TrendFit(
        n_obs=int(len(frame)),
        first_year=int(frame["year"].min()),
        last_year=int(frame["year"].max()),
        slope_per_year=float(slope),
        intercept=float(intercept),
        residual_std=float(residual_std),
        holdout_linear_mae=holdout_linear_mae,
        holdout_naive_mae=holdout_naive_mae,
        projections=projections,
    )


def make_climate_trend_diagnostics(
    observations: pd.DataFrame,
    *,
    horizons: list[int],
    minimum_points: int,
) -> pd.DataFrame:
    """Fit climate-signal trend diagnostics for geography/dataset series."""

    climate = observations[observations["pillar"] == "climate_signal"].copy()
    if climate.empty:
        return pd.DataFrame()

    climate["scoring_value"] = _scoring_value(climate)
    rows: list[dict[str, object]] = []
    for (geo_code, dataset_slug), group in climate.groupby(["geo_code", "dataset_slug"], sort=True):
        group = group.dropna(subset=["scoring_value", "year"])
        if len(group) < minimum_points:
            continue

        fit = fit_linear_trend(group, horizons=horizons)
        row: dict[str, object] = {
            "geo_code": geo_code,
            "dataset_slug": dataset_slug,
            "dataset_name": str(group["dataset_name"].iloc[0]),
            "n_obs": fit.n_obs,
            "first_year": fit.first_year,
            "last_year": fit.last_year,
            "slope_per_year": round(fit.slope_per_year, 8),
            "slope_per_decade": round(fit.slope_per_year * 10, 8),
            "residual_std": round(fit.residual_std, 8),
            "holdout_linear_mae": _round_optional(fit.holdout_linear_mae),
            "holdout_naive_mae": _round_optional(fit.holdout_naive_mae),
            "backtest_beats_naive": _beats_naive(fit),
        }
        for horizon, value in fit.projections.items():
            row[f"projected_{horizon}"] = round(value, 8)
        rows.append(row)

    return pd.DataFrame(rows)


def build_outlook_projection(
    *,
    diagnostics: pd.DataFrame,
    current_index: pd.DataFrame,
    horizons: list[int],
) -> pd.DataFrame:
    """Build scenario-level outlook scores from climate diagnostics and current capacity."""

    if diagnostics.empty:
        return pd.DataFrame()

    projection_scores = _score_projected_climate(diagnostics, horizons=horizons)
    current_capacity = current_index[["geo_code", "capacity_score"]].drop_duplicates("geo_code")
    rows: list[pd.DataFrame] = []
    for horizon in horizons:
        horizon_projection = projection_scores[projection_scores["horizon"] == horizon].copy()
        for scenario, improvements in CAPACITY_IMPROVEMENT_RATES.items():
            scenario_rows = horizon_projection.merge(current_capacity, on="geo_code", how="left")
            capacity = scenario_rows["capacity_score"].fillna(0)
            improvement_rate = improvements.get(horizon, 0.0)
            scenario_rows["scenario"] = scenario
            scenario_rows["capacity_projection_score"] = (
                capacity + (100 - capacity) * improvement_rate
            ).clip(upper=100)
            scenario_rows["projected_gap_difference"] = (
                scenario_rows["projected_climate_pressure_score"]
                - scenario_rows["capacity_projection_score"]
            )
            scenario_rows["outlook_gap_score"] = _rescale_by_group(
                scenario_rows["projected_gap_difference"]
            )
            scenario_rows["caveat_notes"] = scenario_rows.apply(_projection_caveats, axis=1)
            rows.append(scenario_rows)

    combined = pd.concat(rows, ignore_index=True)
    return combined[
        [
            "geo_code",
            "horizon",
            "scenario",
            "outlook_gap_score",
            "projected_climate_pressure_score",
            "capacity_projection_score",
            "projected_gap_difference",
            "trend_indicator_count",
            "mean_residual_std",
            "linear_beats_naive_count",
            "linear_backtest_count",
            "caveat_notes",
        ]
    ].sort_values(["horizon", "scenario", "geo_code"], kind="mergesort")


def _score_projected_climate(diagnostics: pd.DataFrame, *, horizons: list[int]) -> pd.DataFrame:
    rows: list[pd.DataFrame] = []
    for horizon in horizons:
        projection_column = f"projected_{horizon}"
        frame = diagnostics[["geo_code", "dataset_slug", projection_column, "residual_std"]].copy()
        frame = frame.rename(columns={projection_column: "projected_value"})
        frame["horizon"] = horizon
        scored_frames: list[pd.DataFrame] = []
        for _dataset_slug, group in frame.groupby("dataset_slug", sort=True):
            scored = group.copy()
            scored["indicator_projection_score"] = scored["projected_value"].rank(pct=True) * 100
            scored_frames.append(scored)
        scored_all = pd.concat(scored_frames, ignore_index=True)
        summary = (
            scored_all.groupby("geo_code", as_index=False)
            .agg(
                projected_climate_pressure_score=("indicator_projection_score", "mean"),
                trend_indicator_count=("dataset_slug", "nunique"),
                mean_residual_std=("residual_std", "mean"),
            )
            .assign(horizon=horizon)
        )

        backtest = diagnostics.copy()
        backtest["linear_backtest_available"] = backtest["holdout_linear_mae"].notna()
        if "backtest_beats_naive" in backtest.columns:
            backtest["linear_beats_naive"] = backtest["backtest_beats_naive"].eq(True)
        else:
            backtest["linear_beats_naive"] = (
                backtest["holdout_linear_mae"] <= backtest["holdout_naive_mae"]
            )
        backtest_summary = (
            backtest.groupby("geo_code", as_index=False)
            .agg(
                linear_beats_naive_count=("linear_beats_naive", "sum"),
                linear_backtest_count=("linear_backtest_available", "sum"),
            )
        )
        rows.append(summary.merge(backtest_summary, on="geo_code", how="left"))

    return pd.concat(rows, ignore_index=True)


def _projection_caveats(row: pd.Series) -> str:
    caveats = ["not an operational prediction"]
    if int(row["trend_indicator_count"]) < 4:
        caveats.append("limited climate trend coverage")
    if int(row["linear_backtest_count"]) > 0 and int(row["linear_beats_naive_count"]) == 0:
        caveats.append("linear trend did not beat naive baseline")
    return "; ".join(caveats)


def _scoring_value(frame: pd.DataFrame) -> pd.Series:
    values = pd.to_numeric(frame["value"], errors="coerce")
    slugs = frame["dataset_slug"].astype(str)
    anomaly_mask = slugs.str.contains("anomal", case=False, na=False)
    return values.where(~anomaly_mask, values.abs())


def _fit_slope_intercept(x: pd.Series, y: pd.Series) -> tuple[float, float]:
    x_values = pd.to_numeric(x, errors="coerce")
    y_values = pd.to_numeric(y, errors="coerce")
    x_mean = x_values.mean()
    y_mean = y_values.mean()
    denominator = ((x_values - x_mean) ** 2).sum()
    if denominator == 0:
        return 0.0, float(y_mean)

    slope = ((x_values - x_mean) * (y_values - y_mean)).sum() / denominator
    intercept = y_mean - slope * x_mean
    return float(slope), float(intercept)


def _sample_std(values: pd.Series) -> float:
    if len(values) <= 2:
        return 0.0
    return float(math.sqrt(((values - values.mean()) ** 2).sum() / (len(values) - 2)))


def _mean_absolute_error(actual: pd.Series, predicted: pd.Series) -> float:
    return float((actual - predicted).abs().mean())


def _beats_naive(fit: TrendFit) -> bool | None:
    if fit.holdout_linear_mae is None or fit.holdout_naive_mae is None:
        return None
    return fit.holdout_linear_mae <= fit.holdout_naive_mae


def _round_optional(value: float | None) -> float | None:
    return None if value is None else round(float(value), 8)


def _rescale_by_group(values: pd.Series) -> pd.Series:
    min_value = values.min()
    max_value = values.max()
    if min_value == max_value:
        return pd.Series([50.0] * len(values), index=values.index)

    return ((values - min_value) / (max_value - min_value) * 100).round(4)
