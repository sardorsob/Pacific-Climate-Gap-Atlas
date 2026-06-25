"""Country-level driver decomposition for EDA."""

from __future__ import annotations

from typing import Any

import pandas as pd


PRESSURE_PILLARS = {"climate_signal", "observed_stress"}
CAPACITY_PILLARS = {"adaptation_capacity"}
NON_CAUSAL_CAVEAT = (
    "Descriptive screen only; labels summarize available indicators and are not causal claims."
)
UNASSESSED_RANK_CAVEAT = (
    "Rank robustness was not joined for this row; treat ranking as exploratory."
)


def build_country_drivers(
    index: pd.DataFrame,
    indicator_trace: pd.DataFrame | None = None,
    coverage_by_geography: pd.DataFrame | None = None,
    rank_volatility: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """Create country-level labels that explain the adaptation-gap score."""

    drivers = index.copy()
    if "score_status" not in drivers:
        drivers["score_status"] = "scored"
    if "missingness_flag" not in drivers:
        drivers["missingness_flag"] = False

    for column in (
        "adaptation_gap_score",
        "climate_pressure_score",
        "capacity_score",
        "included_indicator_count",
    ):
        if column in drivers:
            drivers[column] = pd.to_numeric(drivers[column], errors="coerce")
    if "included_indicator_count" in drivers:
        drivers["included_indicator_count"] = drivers["included_indicator_count"].astype(
            "Int64"
        )

    drivers["pressure_capacity_difference"] = (
        drivers["climate_pressure_score"] - drivers["capacity_score"]
    )
    drivers["adaptation_gap_rank"] = (
        drivers["adaptation_gap_score"].rank(method="min", ascending=False).astype("Int64")
    )
    drivers["driver_label"] = drivers.apply(_driver_label, axis=1)
    drivers["reason_label"] = drivers["driver_label"]
    drivers["pressure_capacity_typology"] = drivers.apply(
        _pressure_capacity_typology,
        axis=1,
    )
    drivers["pressure_capacity_summary"] = drivers.apply(
        _pressure_capacity_summary,
        axis=1,
    )
    drivers["evidence_density_label"] = drivers["included_indicator_count"].apply(
        _evidence_density_label
    )
    drivers = drivers.merge(
        _signal_summary(indicator_trace),
        on="geo_code",
        how="left",
    )
    drivers = drivers.merge(
        _coverage_summary(coverage_by_geography),
        on="geo_code",
        how="left",
    )
    drivers = drivers.merge(
        _volatility_summary(rank_volatility),
        on="geo_code",
        how="left",
    )

    for column in ("pressure_signal_count", "capacity_signal_count", "trace_signal_count"):
        drivers[column] = drivers[column].fillna(0).astype("Int64")
    for column in ("top_pressure_signals", "top_capacity_signals", "coverage_flag"):
        drivers[column] = drivers[column].fillna("")
    for column in ("data_desert_flag", "monitoring_missing"):
        drivers[column] = drivers[column].fillna(False).apply(_bool_value)
    drivers["robustness_label"] = drivers["robustness_label"].fillna("not assessed")
    drivers["fragility_caveat"] = drivers["fragility_caveat"].fillna(UNASSESSED_RANK_CAVEAT)
    drivers["non_causal_caveat"] = NON_CAUSAL_CAVEAT
    drivers["story_label"] = drivers.apply(_story_label, axis=1)
    drivers["story_priority"] = drivers.apply(_story_priority, axis=1)
    drivers["exemplar_flag"] = drivers.apply(_exemplar_flag, axis=1)

    columns = [
        "geo_code",
        "score_status",
        "adaptation_gap_rank",
        "adaptation_gap_score",
        "climate_pressure_score",
        "capacity_score",
        "pressure_capacity_difference",
        "driver_label",
        "reason_label",
        "story_label",
        "story_priority",
        "pressure_capacity_typology",
        "pressure_capacity_summary",
        "exemplar_flag",
        "included_indicator_count",
        "pressure_signal_count",
        "capacity_signal_count",
        "trace_signal_count",
        "evidence_density_label",
        "top_pressure_signals",
        "top_capacity_signals",
        "data_desert_flag",
        "monitoring_missing",
        "coverage_flag",
        "robustness_label",
        "rank_range",
        "fragility_caveat",
        "non_causal_caveat",
        "missingness_flag",
    ]
    return (
        drivers[columns]
        .sort_values(
            ["adaptation_gap_rank", "geo_code"],
            kind="mergesort",
            na_position="last",
        )
        .reset_index(drop=True)
    )


def build_country_story_labels(
    index: pd.DataFrame,
    indicator_trace: pd.DataFrame,
    coverage_by_geography: pd.DataFrame,
    rank_volatility: pd.DataFrame,
) -> pd.DataFrame:
    """Create compact app-ready country labels for side panels and story selection."""

    drivers = build_country_drivers(
        index,
        indicator_trace=indicator_trace,
        coverage_by_geography=coverage_by_geography,
        rank_volatility=rank_volatility,
    )
    scored = drivers[drivers["score_status"].astype(str).str.lower() == "scored"].copy()
    columns = [
        "geo_code",
        "adaptation_gap_rank",
        "story_label",
        "story_priority",
        "pressure_capacity_typology",
        "exemplar_flag",
        "reason_label",
        "pressure_capacity_summary",
        "included_indicator_count",
        "pressure_signal_count",
        "capacity_signal_count",
        "evidence_density_label",
        "top_pressure_signals",
        "top_capacity_signals",
        "data_desert_flag",
        "monitoring_missing",
        "coverage_flag",
        "robustness_label",
        "rank_range",
        "fragility_caveat",
        "non_causal_caveat",
    ]
    return (
        scored[columns]
        .sort_values(
            ["adaptation_gap_rank", "geo_code"],
            kind="mergesort",
            na_position="last",
        )
        .reset_index(drop=True)
    )


def _driver_label(row: pd.Series) -> str:
    if str(row.get("score_status", "")).lower() != "scored":
        return "insufficient data"

    gap = _float_value(row.get("adaptation_gap_score"))
    pressure = _float_value(row.get("climate_pressure_score"))
    capacity = _float_value(row.get("capacity_score"))
    if pressure >= 66 and capacity <= 33:
        return "high pressure + low visible capacity"
    if pressure >= 66:
        return "high pressure"
    if capacity <= 33:
        return "low visible capacity"
    if gap >= 66:
        return "elevated gap"
    if gap <= 33:
        return "lower relative gap"
    return "mixed signals"


def _pressure_capacity_typology(row: pd.Series) -> str:
    if str(row.get("score_status", "")).lower() != "scored":
        return "insufficient data"

    pressure = _score_bucket(_float_value(row.get("climate_pressure_score")), high_label="high")
    capacity = _score_bucket(
        _float_value(row.get("capacity_score")),
        low_label="low",
        high_label="high",
    )
    return f"{pressure} pressure / {capacity} capacity"


def _pressure_capacity_summary(row: pd.Series) -> str:
    if str(row.get("score_status", "")).lower() != "scored":
        return "Insufficient data for a scored pressure/capacity summary."

    pressure = _float_value(row.get("climate_pressure_score"))
    capacity = _float_value(row.get("capacity_score"))
    difference = pressure - capacity
    return (
        f"Pressure {pressure:.1f} vs capacity {capacity:.1f} "
        f"(difference {difference:+.1f})."
    )


def _evidence_density_label(value: Any) -> str:
    count = _float_value(value)
    if count >= 8:
        return "broad indicator evidence"
    if count >= 5:
        return "moderate indicator evidence"
    return "thin indicator evidence"


def _signal_summary(indicator_trace: pd.DataFrame | None) -> pd.DataFrame:
    columns = [
        "geo_code",
        "pressure_signal_count",
        "capacity_signal_count",
        "trace_signal_count",
        "top_pressure_signals",
        "top_capacity_signals",
    ]
    if indicator_trace is None or indicator_trace.empty:
        return pd.DataFrame(columns=columns)

    trace = indicator_trace.copy()
    for column in ("geo_code", "dataset_slug", "dataset_name", "pillar"):
        if column not in trace:
            trace[column] = ""
        trace[column] = trace[column].fillna("").astype(str).str.strip()
    if "indicator_score" not in trace:
        trace["indicator_score"] = pd.NA
    trace["indicator_score"] = pd.to_numeric(trace["indicator_score"], errors="coerce")

    rows: list[dict[str, object]] = []
    for geo_code, group in trace.groupby("geo_code", sort=True):
        pressure = group[group["pillar"].isin(PRESSURE_PILLARS)]
        capacity = group[group["pillar"].isin(CAPACITY_PILLARS)]
        rows.append(
            {
                "geo_code": geo_code,
                "pressure_signal_count": int(len(pressure)),
                "capacity_signal_count": int(len(capacity)),
                "trace_signal_count": int(len(pressure) + len(capacity)),
                "top_pressure_signals": _format_top_signals(pressure, ascending=False),
                "top_capacity_signals": _format_top_signals(capacity, ascending=True),
            }
        )
    return pd.DataFrame(rows, columns=columns)


def _coverage_summary(coverage_by_geography: pd.DataFrame | None) -> pd.DataFrame:
    columns = ["geo_code", "data_desert_flag", "monitoring_missing", "coverage_flag"]
    if coverage_by_geography is None or coverage_by_geography.empty:
        return pd.DataFrame(columns=columns)

    coverage = coverage_by_geography.copy()
    if "geo_code" not in coverage:
        return pd.DataFrame(columns=columns)
    if "data_desert_flag" not in coverage:
        coverage["data_desert_flag"] = False
    if "monitoring_network_missing_flag" not in coverage:
        coverage["monitoring_network_missing_flag"] = False
    if "coverage_flag" not in coverage:
        coverage["coverage_flag"] = ""

    coverage["data_desert_flag"] = coverage["data_desert_flag"].apply(_bool_value)
    coverage["monitoring_missing"] = coverage["monitoring_network_missing_flag"].apply(
        _bool_value
    )
    coverage["coverage_flag"] = coverage["coverage_flag"].fillna("").astype(str)
    return coverage[columns].drop_duplicates("geo_code", keep="first")


def _volatility_summary(rank_volatility: pd.DataFrame | None) -> pd.DataFrame:
    columns = ["geo_code", "robustness_label", "rank_range", "fragility_caveat"]
    if rank_volatility is None or rank_volatility.empty:
        return pd.DataFrame(columns=columns)

    volatility = rank_volatility.copy()
    if "geo_code" not in volatility:
        return pd.DataFrame(columns=columns)
    if "robustness_label" not in volatility:
        volatility["robustness_label"] = "not assessed"
    if "rank_range" not in volatility:
        volatility["rank_range"] = pd.NA
    if "rank_caveat" not in volatility:
        volatility["rank_caveat"] = UNASSESSED_RANK_CAVEAT

    volatility["rank_range"] = pd.to_numeric(volatility["rank_range"], errors="coerce")
    volatility["fragility_caveat"] = volatility["rank_caveat"].fillna(
        UNASSESSED_RANK_CAVEAT
    )
    return volatility[columns].drop_duplicates("geo_code", keep="first")


def _format_top_signals(signals: pd.DataFrame, *, ascending: bool) -> str:
    if signals.empty:
        return ""
    ordered = signals.sort_values(
        ["indicator_score", "dataset_name", "dataset_slug"],
        ascending=[ascending, True, True],
        kind="mergesort",
        na_position="last",
    ).head(2)
    labels = []
    for _, row in ordered.iterrows():
        label = str(row.get("dataset_name") or row.get("dataset_slug") or "").strip()
        if not label:
            continue
        score = row.get("indicator_score")
        if pd.isna(score):
            labels.append(label)
        else:
            labels.append(f"{label} ({float(score):.1f})")
    return "; ".join(labels)


def _story_label(row: pd.Series) -> str:
    if str(row.get("score_status", "")).lower() != "scored":
        return "Insufficient data"

    gap = _float_value(row.get("adaptation_gap_score"))
    if gap >= 66:
        prefix = "High gap"
    elif gap <= 33:
        prefix = "Lower gap"
    else:
        prefix = "Mixed gap"
    return f"{prefix}: {row.get('pressure_capacity_typology', 'mixed signals')}"


def _story_priority(row: pd.Series) -> str:
    if str(row.get("score_status", "")).lower() != "scored":
        return "withhold"

    gap = _float_value(row.get("adaptation_gap_score"))
    if gap >= 66:
        return "primary"
    if gap >= 50 or _bool_value(row.get("data_desert_flag")) or _bool_value(
        row.get("monitoring_missing")
    ):
        return "secondary"
    return "context"


def _exemplar_flag(row: pd.Series) -> bool:
    if str(row.get("score_status", "")).lower() != "scored":
        return False

    rank = _float_value(row.get("adaptation_gap_rank"))
    gap = _float_value(row.get("adaptation_gap_score"))
    return bool(rank <= 5 or gap <= 20 or _bool_value(row.get("data_desert_flag")))


def _score_bucket(
    value: float,
    *,
    low_label: str = "low",
    high_label: str = "high",
) -> str:
    if value >= 66:
        return high_label
    if value <= 33:
        return low_label
    return "moderate"


def _bool_value(value: Any) -> bool:
    if value is None or pd.isna(value):
        return False
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y"}
    return bool(value)


def _float_value(value: Any) -> float:
    if value is None or pd.isna(value):
        return 0.0
    return float(value)
