"""Simple rank-sensitivity checks for the draft Adaptation Gap Index."""

from __future__ import annotations

import pandas as pd

PRESSURE_PILLARS = {"climate_signal", "observed_stress"}
CAPACITY_PILLARS = {"adaptation_capacity"}
REQUIRED_PILLARS = {"climate_signal", "adaptation_capacity"}
SCORED_PILLARS = PRESSURE_PILLARS | CAPACITY_PILLARS
RANK_CAVEAT = (
    "Small sample stress test; rank movement frames uncertainty and should not be "
    "read as a definitive ranking."
)
INSUFFICIENT_CAVEAT = (
    "Small sample stress test; at least one leave-one-indicator scenario becomes "
    "insufficient, so rank movement frames uncertainty rather than a definitive ranking."
)


def build_weight_sensitivity(index: pd.DataFrame) -> pd.DataFrame:
    """Compare baseline ranks with pressure-heavy and capacity-heavy score variants."""

    scores = index.copy()
    for column in ("adaptation_gap_score", "climate_pressure_score", "capacity_score"):
        scores[column] = pd.to_numeric(scores[column], errors="coerce")

    scores["baseline_rank"] = _rank_desc(scores["adaptation_gap_score"])
    scores["pressure_heavy_score"] = (
        (0.7 * scores["climate_pressure_score"]) - (0.3 * scores["capacity_score"])
    )
    scores["capacity_heavy_score"] = (
        (0.3 * scores["climate_pressure_score"]) - (0.7 * scores["capacity_score"])
    )
    scores["pressure_heavy_rank"] = _rank_desc(scores["pressure_heavy_score"])
    scores["capacity_heavy_rank"] = _rank_desc(scores["capacity_heavy_score"])

    rank_columns = ["baseline_rank", "pressure_heavy_rank", "capacity_heavy_rank"]
    scores["rank_range"] = scores[rank_columns].max(axis=1) - scores[rank_columns].min(axis=1)
    scores["robustness_label"] = scores["rank_range"].apply(_robustness_label)

    columns = [
        "geo_code",
        "adaptation_gap_score",
        "baseline_rank",
        "pressure_heavy_score",
        "pressure_heavy_rank",
        "capacity_heavy_score",
        "capacity_heavy_rank",
        "rank_range",
        "robustness_label",
    ]
    return (
        scores[columns]
        .sort_values(["baseline_rank", "geo_code"], kind="mergesort")
        .reset_index(drop=True)
    )


def build_leave_one_indicator_sensitivity(
    index: pd.DataFrame,
    indicator_trace: pd.DataFrame,
) -> pd.DataFrame:
    """Rank geographies after omitting each scored indicator once."""

    _require_columns(
        index,
        ["geo_code", "adaptation_gap_score", "climate_pressure_score", "capacity_score"],
        "index",
    )
    _require_columns(
        indicator_trace,
        ["geo_code", "dataset_slug", "pillar", "indicator_score"],
        "indicator_trace",
    )

    baseline = _baseline_frame(index)
    trace = indicator_trace[indicator_trace["pillar"].isin(SCORED_PILLARS)].copy()
    trace["indicator_score"] = pd.to_numeric(trace["indicator_score"], errors="coerce")
    trace = trace[trace["indicator_score"].notna()].copy()
    indicator_slugs = sorted(trace["dataset_slug"].dropna().astype(str).unique().tolist())

    frames: list[pd.DataFrame] = []
    for indicator_slug in indicator_slugs:
        scenario_trace = trace[trace["dataset_slug"].astype(str) != indicator_slug]
        scenario = _score_from_trace(
            baseline["geo_code"],
            scenario_trace,
            scenario=f"drop_{indicator_slug}",
            scenario_type="leave_one_indicator",
            dropped_indicator=indicator_slug,
        )
        frames.append(scenario)

    if not frames:
        return pd.DataFrame(
            columns=[
                "geo_code",
                "baseline_rank",
                "scenario",
                "scenario_type",
                "dropped_indicator",
                "scenario_score",
                "scenario_rank",
                "rank_shift",
                "scenario_status",
            ]
        )

    scenarios = pd.concat(frames, ignore_index=True)
    scenarios = scenarios.merge(
        baseline[["geo_code", "baseline_rank"]],
        on="geo_code",
        how="left",
    )
    scenarios["rank_shift"] = scenarios["scenario_rank"] - scenarios["baseline_rank"]
    columns = [
        "geo_code",
        "baseline_rank",
        "scenario",
        "scenario_type",
        "dropped_indicator",
        "scenario_score",
        "scenario_rank",
        "rank_shift",
        "scenario_status",
    ]
    return (
        scenarios[columns]
        .sort_values(["scenario", "geo_code"], kind="mergesort")
        .reset_index(drop=True)
    )


def build_rank_volatility(index: pd.DataFrame, indicator_trace: pd.DataFrame) -> pd.DataFrame:
    """Summarize weight and leave-one-indicator rank movement by geography."""

    baseline = _baseline_frame(index)
    scenarios = pd.concat(
        [
            _weight_scenarios_long(index),
            build_leave_one_indicator_sensitivity(index, indicator_trace),
        ],
        ignore_index=True,
    )

    rows: list[dict[str, object]] = []
    ordered_baseline = baseline.sort_values(["baseline_rank", "geo_code"], kind="mergesort")
    for _, baseline_row in ordered_baseline.iterrows():
        geo_code = baseline_row["geo_code"]
        baseline_rank = baseline_row["baseline_rank"]
        geo_scenarios = scenarios[scenarios["geo_code"] == geo_code].sort_values(
            ["scenario", "scenario_type"],
            kind="mergesort",
        )
        numeric_ranks = pd.concat(
            [
                pd.Series([baseline_rank], dtype="Int64"),
                geo_scenarios["scenario_rank"].dropna().astype("Int64"),
            ],
            ignore_index=True,
        )
        rank_min, rank_max, rank_range = _rank_bounds(numeric_ranks)
        insufficient_count = int((geo_scenarios["scenario_status"] != "scored").sum())

        weight_rank_range = _rank_range_for_type(baseline_rank, geo_scenarios, "weight")
        leave_one_rank_range = _rank_range_for_type(
            baseline_rank,
            geo_scenarios,
            "leave_one_indicator",
        )
        largest_rank_shift = _largest_abs_shift(geo_scenarios)

        rows.append(
            {
                "geo_code": geo_code,
                "baseline_score": baseline_row["baseline_score"],
                "baseline_rank": baseline_rank,
                "scenario_count": int(len(geo_scenarios)),
                "scored_scenario_count": int(
                    (geo_scenarios["scenario_status"] == "scored").sum()
                ),
                "insufficient_scenario_count": insufficient_count,
                "scenario_rank_min": rank_min,
                "scenario_rank_max": rank_max,
                "rank_range": rank_range,
                "largest_rank_shift": largest_rank_shift,
                "weight_rank_range": weight_rank_range,
                "leave_one_indicator_rank_range": leave_one_rank_range,
                "worst_case_scenario": _worst_case_scenario(geo_scenarios),
                "scenario_rank_summary": _scenario_rank_summary(baseline_rank, geo_scenarios),
                "robustness_label": _volatility_label(rank_range, insufficient_count),
                "rank_caveat": INSUFFICIENT_CAVEAT if insufficient_count else RANK_CAVEAT,
            }
        )

    columns = [
        "geo_code",
        "baseline_score",
        "baseline_rank",
        "scenario_count",
        "scored_scenario_count",
        "insufficient_scenario_count",
        "scenario_rank_min",
        "scenario_rank_max",
        "rank_range",
        "largest_rank_shift",
        "weight_rank_range",
        "leave_one_indicator_rank_range",
        "worst_case_scenario",
        "scenario_rank_summary",
        "robustness_label",
        "rank_caveat",
    ]
    return (
        pd.DataFrame(rows, columns=columns)
        .sort_values(["baseline_rank", "geo_code"], kind="mergesort")
        .reset_index(drop=True)
    )


def _rank_desc(series: pd.Series) -> pd.Series:
    return series.rank(method="min", ascending=False).astype("Int64")


def _robustness_label(rank_range: int | float) -> str:
    if rank_range <= 1:
        return "stable"
    if rank_range <= 3:
        return "sensitive"
    return "fragile"


def _baseline_frame(index: pd.DataFrame) -> pd.DataFrame:
    baseline = index.copy()
    baseline["baseline_score"] = pd.to_numeric(
        baseline["adaptation_gap_score"],
        errors="coerce",
    )
    baseline["baseline_rank"] = _rank_desc(baseline["baseline_score"])
    return baseline[["geo_code", "baseline_score", "baseline_rank"]].sort_values(
        ["baseline_rank", "geo_code"],
        kind="mergesort",
    )


def _weight_scenarios_long(index: pd.DataFrame) -> pd.DataFrame:
    weight_sensitivity = build_weight_sensitivity(index)
    frames: list[pd.DataFrame] = []
    for score_column, rank_column, scenario in [
        ("pressure_heavy_score", "pressure_heavy_rank", "weight_pressure_heavy"),
        ("capacity_heavy_score", "capacity_heavy_rank", "weight_capacity_heavy"),
    ]:
        frame = weight_sensitivity[
            ["geo_code", "baseline_rank", score_column, rank_column]
        ].copy()
        frame = frame.rename(
            columns={
                score_column: "scenario_score",
                rank_column: "scenario_rank",
            }
        )
        frame["scenario"] = scenario
        frame["scenario_type"] = "weight"
        frame["dropped_indicator"] = ""
        frame["rank_shift"] = frame["scenario_rank"] - frame["baseline_rank"]
        frame["scenario_status"] = "scored"
        frames.append(frame)

    columns = [
        "geo_code",
        "baseline_rank",
        "scenario",
        "scenario_type",
        "dropped_indicator",
        "scenario_score",
        "scenario_rank",
        "rank_shift",
        "scenario_status",
    ]
    return pd.concat(frames, ignore_index=True)[columns]


def _score_from_trace(
    baseline_geographies: pd.Series,
    trace: pd.DataFrame,
    *,
    scenario: str,
    scenario_type: str,
    dropped_indicator: str,
) -> pd.DataFrame:
    geographies = pd.DataFrame(
        {"geo_code": baseline_geographies.drop_duplicates().tolist()}
    )
    if trace.empty:
        geographies["scenario_score"] = pd.NA
        geographies["scenario_rank"] = pd.Series([pd.NA] * len(geographies), dtype="Int64")
        geographies["scenario_status"] = "insufficient_data"
        return _scenario_columns(geographies, scenario, scenario_type, dropped_indicator)

    pillar_scores = (
        trace.groupby(["geo_code", "pillar"], as_index=False)["indicator_score"]
        .mean()
        .rename(columns={"indicator_score": "pillar_score"})
    )
    pressure_scores = _mean_score_for_pillars(
        pillar_scores,
        PRESSURE_PILLARS,
        "climate_pressure_score",
    )
    capacity_scores = _mean_score_for_pillars(
        pillar_scores,
        CAPACITY_PILLARS,
        "capacity_score",
    )
    scenario_scores = geographies.merge(pressure_scores, on="geo_code", how="left").merge(
        capacity_scores,
        on="geo_code",
        how="left",
    )
    scenario_scores = scenario_scores.merge(
        _available_pillars(trace),
        on="geo_code",
        how="left",
    )
    scenario_scores["available_pillars"] = scenario_scores["available_pillars"].fillna("")
    scenario_scores["raw_gap_difference"] = (
        scenario_scores["climate_pressure_score"] - scenario_scores["capacity_score"]
    )
    scored = scenario_scores["available_pillars"].apply(_has_required_pillars)
    scenario_scores["scenario_score"] = pd.NA
    scenario_scores.loc[scored, "scenario_score"] = _rescale_0_100(
        scenario_scores.loc[scored, "raw_gap_difference"]
    )
    scenario_scores["scenario_score"] = pd.to_numeric(
        scenario_scores["scenario_score"],
        errors="coerce",
    )
    scenario_scores["scenario_rank"] = _rank_desc(scenario_scores["scenario_score"])
    scenario_scores["scenario_status"] = "scored"
    scenario_scores.loc[~scored, "scenario_status"] = "insufficient_data"
    return _scenario_columns(scenario_scores, scenario, scenario_type, dropped_indicator)


def _scenario_columns(
    frame: pd.DataFrame,
    scenario: str,
    scenario_type: str,
    dropped_indicator: str,
) -> pd.DataFrame:
    scenario_frame = frame[
        ["geo_code", "scenario_score", "scenario_rank", "scenario_status"]
    ].copy()
    scenario_frame["scenario"] = scenario
    scenario_frame["scenario_type"] = scenario_type
    scenario_frame["dropped_indicator"] = dropped_indicator
    return scenario_frame


def _mean_score_for_pillars(
    pillar_scores: pd.DataFrame,
    included_pillars: set[str],
    output_column: str,
) -> pd.DataFrame:
    subset = pillar_scores[pillar_scores["pillar"].isin(included_pillars)]
    return (
        subset.groupby("geo_code", as_index=False)["pillar_score"]
        .mean()
        .rename(columns={"pillar_score": output_column})
    )


def _available_pillars(trace: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, object]] = []
    for geo_code, group in trace.groupby("geo_code", sort=True):
        pillars = sorted(group["pillar"].dropna().astype(str).unique().tolist())
        rows.append({"geo_code": geo_code, "available_pillars": " ".join(pillars)})
    return pd.DataFrame(rows)


def _has_required_pillars(available_pillars: str) -> bool:
    pillars = set(str(available_pillars).split())
    return REQUIRED_PILLARS.issubset(pillars)


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


def _rank_range_for_type(
    baseline_rank: int,
    scenarios: pd.DataFrame,
    scenario_type: str,
) -> int:
    ranks = pd.concat(
        [
            pd.Series([baseline_rank], dtype="Int64"),
            scenarios.loc[
                scenarios["scenario_type"] == scenario_type,
                "scenario_rank",
            ].dropna().astype("Int64"),
        ],
        ignore_index=True,
    )
    _, _, rank_range = _rank_bounds(ranks)
    return 0 if pd.isna(rank_range) else int(rank_range)


def _rank_bounds(ranks: pd.Series) -> tuple[object, object, object]:
    numeric_ranks = pd.to_numeric(ranks, errors="coerce").dropna()
    if numeric_ranks.empty:
        return pd.NA, pd.NA, pd.NA

    rank_min = int(numeric_ranks.min())
    rank_max = int(numeric_ranks.max())
    return rank_min, rank_max, int(rank_max - rank_min)


def _largest_abs_shift(scenarios: pd.DataFrame) -> int:
    shifts = pd.to_numeric(scenarios["rank_shift"], errors="coerce").dropna().abs()
    return int(shifts.max()) if not shifts.empty else 0


def _worst_case_scenario(scenarios: pd.DataFrame) -> str:
    scored = scenarios[scenarios["rank_shift"].notna()].copy()
    if scored.empty:
        insufficient = scenarios[scenarios["scenario_status"] != "scored"]
        if insufficient.empty:
            return ""
        return str(insufficient.sort_values("scenario", kind="mergesort").iloc[0]["scenario"])

    scored["abs_shift"] = pd.to_numeric(scored["rank_shift"], errors="coerce").abs()
    worst = scored.sort_values(
        ["abs_shift", "scenario"],
        ascending=[False, True],
        kind="mergesort",
    ).iloc[0]
    return str(worst["scenario"])


def _scenario_rank_summary(baseline_rank: int, scenarios: pd.DataFrame) -> str:
    parts = [f"baseline={_rank_to_text(baseline_rank)}"]
    for _, row in scenarios.sort_values("scenario", kind="mergesort").iterrows():
        parts.append(f"{row['scenario']}={_rank_to_text(row['scenario_rank'])}")
    return "; ".join(parts)


def _rank_to_text(rank: object) -> str:
    if pd.isna(rank):
        return "insufficient_data"
    return str(int(rank))


def _volatility_label(rank_range: int | float, insufficient_scenario_count: int) -> str:
    if insufficient_scenario_count:
        return "fragile"
    return _robustness_label(rank_range)


def _require_columns(frame: pd.DataFrame, columns: list[str], frame_name: str) -> None:
    missing = sorted(set(columns).difference(frame.columns))
    if missing:
        raise ValueError(f"{frame_name} is missing columns: {missing}")
