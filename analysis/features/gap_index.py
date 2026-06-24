"""Baseline adaptation-gap index helpers."""

from __future__ import annotations

import pandas as pd


PRESSURE_PILLARS = {"climate_signal", "observed_stress"}
CAPACITY_PILLARS = {"adaptation_capacity"}
REQUIRED_PILLARS = {"climate_signal", "adaptation_capacity"}
INDEX_COLUMNS = [
    "geo_code",
    "score_status",
    "adaptation_gap_score",
    "climate_pressure_score",
    "capacity_score",
    "raw_gap_difference",
    "available_pillars",
    "missing_pillars",
    "included_indicator_count",
    "missingness_flag",
]


def percentile_rank(values: pd.Series, *, higher_is_more_pressure: bool = True) -> pd.Series:
    """Return 0-100 percentile ranks, preserving missing values."""

    ranked = values.rank(pct=True, na_option="keep") * 100
    if higher_is_more_pressure:
        return ranked
    return 100 - ranked


def latest_indicator_snapshot(observations: pd.DataFrame) -> pd.DataFrame:
    """Keep the latest non-missing observation per geography and dataset."""

    required = {"dataset_slug", "dataset_name", "pillar", "geo_code", "year", "value"}
    missing = required.difference(observations.columns)
    if missing:
        raise ValueError(f"Observations table is missing columns: {sorted(missing)}")

    frame = observations.copy()
    frame = frame[frame["value"].notna()].copy()
    frame["year"] = pd.to_numeric(frame["year"], errors="coerce")
    frame["value"] = pd.to_numeric(frame["value"], errors="coerce")
    frame = frame[frame["year"].notna() & frame["value"].notna()].copy()
    frame = frame.sort_values(
        ["dataset_slug", "geo_code", "year"],
        ascending=[True, True, False],
        kind="mergesort",
    )
    snapshot = frame.drop_duplicates(["dataset_slug", "geo_code"], keep="first")
    return snapshot.sort_values(["dataset_slug", "geo_code"], kind="mergesort").reset_index(drop=True)


def build_indicator_trace(snapshot: pd.DataFrame) -> pd.DataFrame:
    """Score each latest indicator value against peer geographies."""

    scored_frames: list[pd.DataFrame] = []
    for dataset_slug, group in snapshot.groupby("dataset_slug", sort=True):
        scored = group.copy()
        scored["scoring_value"] = _scoring_value(scored)
        scored["indicator_score"] = percentile_rank(
            scored["scoring_value"],
            higher_is_more_pressure=True,
        )
        scored["indicator_weight"] = 1.0
        scored_frames.append(scored)

    if not scored_frames:
        return pd.DataFrame()

    trace = pd.concat(scored_frames, ignore_index=True)
    trace = trace.rename(columns={"year": "latest_year", "value": "latest_value"})
    columns = [
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
    ]
    optional_columns = [column for column in columns if column in trace.columns]
    return trace[optional_columns].sort_values(["geo_code", "dataset_slug"], kind="mergesort")


def _scoring_value(frame: pd.DataFrame) -> pd.Series:
    """Return the value used for percentile scoring while preserving raw values separately."""

    values = pd.to_numeric(frame["value"], errors="coerce")
    slugs = frame["dataset_slug"].astype(str)
    anomaly_mask = slugs.str.contains("anomal", case=False, na=False)
    return values.where(~anomaly_mask, values.abs())


def build_gap_index(observations: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Build geography-level Adaptation Gap Index and indicator trace tables."""

    snapshot = latest_indicator_snapshot(observations)
    trace = build_indicator_trace(snapshot)
    if trace.empty:
        return pd.DataFrame(columns=INDEX_COLUMNS), trace

    pillar_scores = (
        trace.groupby(["geo_code", "pillar"], as_index=False)["indicator_score"]
        .mean()
        .rename(columns={"indicator_score": "pillar_score"})
    )
    pressure_scores = _mean_score_for_pillars(
        pillar_scores,
        included_pillars=PRESSURE_PILLARS,
        output_column="climate_pressure_score",
    )
    capacity_scores = _mean_score_for_pillars(
        pillar_scores,
        included_pillars=CAPACITY_PILLARS,
        output_column="capacity_score",
    )

    geographies = pd.DataFrame({"geo_code": sorted(trace["geo_code"].dropna().unique().tolist())})
    index = geographies.merge(pressure_scores, on="geo_code", how="left").merge(
        capacity_scores,
        on="geo_code",
        how="left",
    )
    index = index.merge(
        _availability_summary(trace),
        on="geo_code",
        how="left",
    )
    index["raw_gap_difference"] = index["climate_pressure_score"] - index["capacity_score"]
    scorable = index["missing_pillars"].eq("")
    index.loc[scorable, "adaptation_gap_score"] = _rescale_0_100(
        index.loc[scorable, "raw_gap_difference"]
    )
    index.loc[~scorable, "adaptation_gap_score"] = pd.NA
    index["score_status"] = "scored"
    index.loc[~scorable, "score_status"] = "insufficient_data"
    index["missingness_flag"] = ~scorable

    return index[INDEX_COLUMNS].sort_values("geo_code", kind="mergesort").reset_index(drop=True), trace


def _mean_score_for_pillars(
    pillar_scores: pd.DataFrame,
    *,
    included_pillars: set[str],
    output_column: str,
) -> pd.DataFrame:
    subset = pillar_scores[pillar_scores["pillar"].isin(included_pillars)]
    return (
        subset.groupby("geo_code", as_index=False)["pillar_score"]
        .mean()
        .rename(columns={"pillar_score": output_column})
    )


def _availability_summary(trace: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, object]] = []
    for geo_code, group in trace.groupby("geo_code", sort=True):
        available_pillars = sorted(group["pillar"].dropna().unique().tolist())
        missing_pillars = sorted(REQUIRED_PILLARS.difference(available_pillars))
        rows.append(
            {
                "geo_code": geo_code,
                "available_pillars": " ".join(available_pillars),
                "missing_pillars": " ".join(missing_pillars),
                "included_indicator_count": int(group["dataset_slug"].nunique()),
            }
        )

    return pd.DataFrame(rows)


def _rescale_0_100(values: pd.Series) -> pd.Series:
    if values.empty:
        return values

    min_value = values.min()
    max_value = values.max()
    if pd.isna(min_value) or pd.isna(max_value):
        return values * pd.NA
    if min_value == max_value:
        return pd.Series([50.0] * len(values), index=values.index)

    return ((values - min_value) / (max_value - min_value) * 100).round(4)
