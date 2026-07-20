"""Indicator-level forensics for the draft Adaptation Gap Index."""

from __future__ import annotations

from typing import Any

import pandas as pd

TRACE_COLUMNS = [
    "geo_code",
    "dataset_slug",
    "dataset_name",
    "pillar",
    "latest_year",
    "latest_value",
    "scoring_value",
    "unit",
    "indicator_score",
    "source_row_hash",
]
OPTIONAL_TRACE_COLUMNS = ["indicator_weight"]
SCORE_INPUT_PILLARS = {"adaptation_capacity", "climate_signal", "observed_stress"}
OUTLIER_METHOD = "dataset_iqr_1_5x_on_scoring_value"
OUTLIER_CAVEAT = (
    "Outliers are flagged within each dataset using 1.5x IQR fences on scoring_value; "
    "units and denominators differ across datasets, so compare within an indicator rather "
    "than across indicators."
)
SMALL_SAMPLE_CAVEAT = (
    "Fewer than four numeric scoring values are available for this dataset; no outlier "
    "flag is assigned. "
    + OUTLIER_CAVEAT
)


def build_indicator_forensics(indicator_trace: pd.DataFrame) -> pd.DataFrame:
    """Add indicator-level rank, grouping, and outlier context to trace rows."""

    trace = _normalize_trace(indicator_trace)
    if trace.empty:
        return pd.DataFrame(columns=_forensics_columns())

    trace["rank_within_indicator"] = (
        trace.groupby("dataset_slug")["indicator_score"]
        .rank(method="min", ascending=False)
        .astype("Int64")
    )
    trace["score_percentile"] = (
        trace.groupby("dataset_slug")["indicator_score"]
        .transform(lambda values: values.rank(method="max", pct=True))
        .round(4)
    )
    trace["score_percentile_group"] = trace["score_percentile"].apply(
        _score_percentile_group
    )
    trace["score_input_role"] = trace["pillar"].apply(_score_input_role)

    outlier_stats = _dataset_outlier_stats(trace)
    trace = trace.merge(outlier_stats, on="dataset_slug", how="left")
    trace["high_outlier_flag"] = (
        trace["scoring_value"].notna()
        & trace["outlier_upper_fence"].notna()
        & (trace["scoring_value"] > trace["outlier_upper_fence"])
    )
    trace["low_outlier_flag"] = (
        trace["scoring_value"].notna()
        & trace["outlier_lower_fence"].notna()
        & (trace["scoring_value"] < trace["outlier_lower_fence"])
    )
    trace["outlier_direction"] = trace.apply(_outlier_direction, axis=1)
    trace["outlier_label"] = trace["outlier_direction"].apply(_outlier_label)

    columns = _forensics_columns()
    return (
        trace[columns]
        .sort_values(
            ["dataset_slug", "rank_within_indicator", "geo_code"],
            kind="mergesort",
        )
        .reset_index(drop=True)
    )


def build_indicator_outliers(indicator_trace: pd.DataFrame) -> pd.DataFrame:
    """Return the subset of indicator rows flagged by the dataset-level outlier method."""

    forensics = build_indicator_forensics(indicator_trace)
    if forensics.empty:
        return pd.DataFrame(columns=_outlier_columns())

    outliers = forensics[
        forensics["high_outlier_flag"] | forensics["low_outlier_flag"]
    ].copy()
    outliers["outlier_direction_order"] = outliers["outlier_direction"].map(
        {"low": 0, "high": 1}
    )
    columns = _outlier_columns()
    return (
        outliers.sort_values(
            [
                "dataset_slug",
                "outlier_direction_order",
                "scoring_value",
                "rank_within_indicator",
                "geo_code",
            ],
            kind="mergesort",
        )[columns]
        .reset_index(drop=True)
    )


def build_indicator_forensics_tables(
    indicator_trace: pd.DataFrame,
) -> dict[str, pd.DataFrame]:
    """Build TASK-012 indicator forensics tables for runner integration."""

    return {
        "eda_indicator_forensics.csv": build_indicator_forensics(indicator_trace),
        "eda_indicator_outliers.csv": build_indicator_outliers(indicator_trace),
    }


def _normalize_trace(indicator_trace: pd.DataFrame) -> pd.DataFrame:
    missing = sorted(set(TRACE_COLUMNS).difference(indicator_trace.columns))
    if missing:
        raise ValueError(f"indicator_trace is missing columns: {missing}")

    trace = indicator_trace.copy()
    for column in OPTIONAL_TRACE_COLUMNS:
        if column not in trace.columns:
            trace[column] = pd.NA

    for column in ["geo_code", "dataset_slug", "dataset_name", "pillar", "unit"]:
        trace[column] = trace[column].fillna("").astype(str).str.strip()
    trace["source_row_hash"] = trace["source_row_hash"].fillna("").astype(str).str.strip()
    for column in ["latest_year", "latest_value", "scoring_value", "indicator_score"]:
        trace[column] = pd.to_numeric(trace[column], errors="coerce")
    trace["indicator_weight"] = pd.to_numeric(trace["indicator_weight"], errors="coerce")
    return trace


def _dataset_outlier_stats(trace: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, object]] = []
    for dataset_slug, group in trace.groupby("dataset_slug", sort=True):
        scoring_values = group["scoring_value"].dropna()
        count = int(scoring_values.count())
        if count >= 4:
            q1 = float(scoring_values.quantile(0.25))
            q3 = float(scoring_values.quantile(0.75))
            iqr = q3 - q1
            lower_fence = q1 - (1.5 * iqr)
            upper_fence = q3 + (1.5 * iqr)
            caveat = OUTLIER_CAVEAT
        else:
            q1 = float("nan")
            q3 = float("nan")
            iqr = float("nan")
            lower_fence = float("nan")
            upper_fence = float("nan")
            caveat = SMALL_SAMPLE_CAVEAT

        rows.append(
            {
                "dataset_slug": dataset_slug,
                "dataset_observation_count": count,
                "outlier_method": OUTLIER_METHOD,
                "outlier_q1": q1,
                "outlier_q3": q3,
                "outlier_iqr": iqr,
                "outlier_lower_fence": lower_fence,
                "outlier_upper_fence": upper_fence,
                "outlier_caveat": caveat,
            }
        )
    return pd.DataFrame(rows)


def _score_percentile_group(value: Any) -> str:
    if value is None or pd.isna(value):
        return "score_missing"
    percentile = float(value)
    if percentile >= 0.75:
        return "top_quartile"
    if percentile >= 0.50:
        return "upper_middle"
    if percentile >= 0.25:
        return "lower_middle"
    return "bottom_quartile"


def _score_input_role(pillar: Any) -> str:
    return "score_input" if str(pillar).strip() in SCORE_INPUT_PILLARS else "context_only"


def _outlier_direction(row: pd.Series) -> str:
    if bool(row.get("high_outlier_flag")):
        return "high"
    if bool(row.get("low_outlier_flag")):
        return "low"
    return "not_outlier"


def _outlier_label(direction: str) -> str:
    if direction == "high":
        return "high scoring-value outlier"
    if direction == "low":
        return "low scoring-value outlier"
    return "not flagged"


def _forensics_columns() -> list[str]:
    return [
        "geo_code",
        "dataset_slug",
        "dataset_name",
        "pillar",
        "latest_year",
        "latest_value",
        "scoring_value",
        "unit",
        "indicator_score",
        "indicator_weight",
        "source_row_hash",
        "rank_within_indicator",
        "score_percentile",
        "score_percentile_group",
        "score_input_role",
        "dataset_observation_count",
        "high_outlier_flag",
        "low_outlier_flag",
        "outlier_direction",
        "outlier_label",
        "outlier_method",
        "outlier_q1",
        "outlier_q3",
        "outlier_iqr",
        "outlier_lower_fence",
        "outlier_upper_fence",
        "outlier_caveat",
    ]


def _outlier_columns() -> list[str]:
    return _forensics_columns()
