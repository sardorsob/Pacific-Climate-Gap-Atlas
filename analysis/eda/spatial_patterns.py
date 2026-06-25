"""Rule-based spatial typologies and subregion comparison tables."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd


HIGH_GAP_THRESHOLD = 66.0
ELEVATED_GAP_THRESHOLD = 50.0
HIGH_PRESSURE_THRESHOLD = 66.0
LOW_PRESSURE_THRESHOLD = 33.0
LOW_CAPACITY_THRESHOLD = 33.0
HIGH_CAPACITY_THRESHOLD = 66.0
TYPOLOGY_CAVEAT = (
    "Rule-based descriptive typology using score thresholds, coverage flags, and "
    "subregion context; not causal inference."
)
CLUSTER_CAVEAT = (
    "Story cluster labels are descriptive rule groups for 22 Pacific geographies; "
    "they are not statistical clusters."
)
DISTANCE_CAVEAT = (
    "No centroid-distance or land-adjacency inference is used; ocean distances should "
    "not be treated like land adjacency."
)
REGIONAL_CAVEAT = (
    "Regional means summarize descriptive scores across small subregion groups; do "
    "not read them as statistical inference or as a replacement for country context."
)


def build_spatial_typologies(
    country_drivers: pd.DataFrame,
    geography_context: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """Join driver labels to GIS context and assign interpretable spatial typologies."""

    drivers = _normalize_drivers(country_drivers)
    context = _safe_geography_context(
        _default_geography_context() if geography_context is None else geography_context
    )
    if not context.empty:
        context_columns = [column for column in context.columns if column != "geo_code"]
        drivers = drivers.drop(
            columns=[c for c in context_columns if c in drivers],
            errors="ignore",
        )
    enriched = drivers.merge(context, on="geo_code", how="left")

    for column in _context_columns():
        if column not in enriched:
            enriched[column] = ""
        enriched[column] = enriched[column].fillna("").astype(str).str.strip()
    enriched["geography_name"] = enriched["geography_name"].where(
        enriched["geography_name"] != "",
        enriched["geo_code"],
    )
    enriched["subregion"] = enriched["subregion"].where(
        enriched["subregion"] != "",
        "Unspecified",
    )

    enriched["adaptation_gap_tier"] = enriched["adaptation_gap_score"].apply(_gap_tier)
    enriched["climate_pressure_tier"] = enriched["climate_pressure_score"].apply(
        _pressure_tier
    )
    enriched["capacity_tier"] = enriched["capacity_score"].apply(_capacity_tier)
    enriched["spatial_typology"] = enriched.apply(_spatial_typology, axis=1)
    enriched["story_cluster_label"] = enriched.apply(_story_cluster_label, axis=1)
    enriched["regional_story_role"] = enriched.apply(_regional_story_role, axis=1)
    enriched["coverage_monitoring_gap_flag"] = enriched.apply(
        lambda row: bool(row["data_desert_flag"] or row["monitoring_missing"]),
        axis=1,
    )
    enriched["fragile_rank_flag"] = enriched["robustness_label"].apply(
        lambda value: str(value).strip().lower() == "fragile"
    )
    enriched["rank_uncertainty_flag"] = enriched.apply(_rank_uncertainty_flag, axis=1)
    enriched["typology_caveat"] = TYPOLOGY_CAVEAT
    enriched["cluster_caveat"] = CLUSTER_CAVEAT
    enriched["distance_caveat"] = DISTANCE_CAVEAT
    enriched["regional_context_caveat"] = enriched["context_note"].where(
        enriched["context_note"] != "",
        "Geography context is descriptive only and is not used in score calculation.",
    )

    columns = [
        "geo_code",
        "geography_name",
        "subregion",
        "political_status",
        "island_group_or_region_note",
        "context_quality",
        "score_status",
        "adaptation_gap_rank",
        "adaptation_gap_score",
        "climate_pressure_score",
        "capacity_score",
        "adaptation_gap_tier",
        "climate_pressure_tier",
        "capacity_tier",
        "pressure_capacity_typology",
        "spatial_typology",
        "story_cluster_label",
        "regional_story_role",
        "story_priority",
        "story_label",
        "driver_label",
        "data_desert_flag",
        "monitoring_missing",
        "coverage_monitoring_gap_flag",
        "robustness_label",
        "rank_range",
        "fragile_rank_flag",
        "rank_uncertainty_flag",
        "coverage_flag",
        "evidence_density_label",
        "top_pressure_signals",
        "top_capacity_signals",
        "typology_caveat",
        "cluster_caveat",
        "distance_caveat",
        "regional_context_caveat",
        "fragility_caveat",
        "non_causal_caveat",
    ]
    return (
        enriched[columns]
        .sort_values(
            ["adaptation_gap_rank", "geo_code"],
            kind="mergesort",
            na_position="last",
        )
        .reset_index(drop=True)
    )


def build_subregion_comparisons(spatial_typologies: pd.DataFrame) -> pd.DataFrame:
    """Aggregate geography-level typologies into small-sample regional summaries."""

    spatial = _normalize_spatial_typologies(spatial_typologies)
    if spatial.empty:
        return pd.DataFrame(columns=_subregion_columns())

    rows: list[dict[str, object]] = []
    for subregion, group in spatial.groupby("subregion", sort=True):
        ordered = group.sort_values(
            ["adaptation_gap_rank", "geo_code"],
            kind="mergesort",
            na_position="last",
        )
        high_gap = group["adaptation_gap_score"] >= HIGH_GAP_THRESHOLD
        low_capacity = group["capacity_score"] <= LOW_CAPACITY_THRESHOLD
        high_pressure = group["climate_pressure_score"] >= HIGH_PRESSURE_THRESHOLD
        rows.append(
            {
                "subregion": subregion,
                "geography_count": int(len(group)),
                "geography_codes": " ".join(sorted(group["geo_code"].astype(str))),
                "mean_adaptation_gap_score": _rounded_mean(group["adaptation_gap_score"]),
                "mean_climate_pressure_score": _rounded_mean(group["climate_pressure_score"]),
                "mean_capacity_score": _rounded_mean(group["capacity_score"]),
                "median_adaptation_gap_rank": _rounded_median(group["adaptation_gap_rank"]),
                "high_gap_count": int(high_gap.sum()),
                "low_capacity_count": int(low_capacity.sum()),
                "high_pressure_count": int(high_pressure.sum()),
                "data_desert_count": int(group["data_desert_flag"].sum()),
                "monitoring_missing_count": int(group["monitoring_missing"].sum()),
                "coverage_monitoring_gap_count": int(
                    group["coverage_monitoring_gap_flag"].sum()
                ),
                "fragile_rank_count": int(group["fragile_rank_flag"].sum()),
                "sensitive_rank_count": int(
                    (group["robustness_label"].str.lower() == "sensitive").sum()
                ),
                "rank_uncertainty_count": int(group["rank_uncertainty_flag"].sum()),
                "primary_story_count": int((group["story_priority"] == "primary").sum()),
                "secondary_story_count": int((group["story_priority"] == "secondary").sum()),
                "context_story_count": int((group["story_priority"] == "context").sum()),
                "dominant_spatial_typology": _dominant_label(group["spatial_typology"]),
                "dominant_pressure_capacity_typology": _dominant_label(
                    group["pressure_capacity_typology"]
                ),
                "dominant_story_cluster_label": _dominant_label(
                    group["story_cluster_label"]
                ),
                "typology_mix": _label_mix(group["spatial_typology"]),
                "regional_comparison_label": _regional_comparison_label(
                    subregion,
                    group["spatial_typology"],
                ),
                "top_gap_geo_codes": " ".join(ordered["geo_code"].head(3).astype(str)),
                "regional_caveat": REGIONAL_CAVEAT,
                "distance_caveat": DISTANCE_CAVEAT,
                "cluster_caveat": CLUSTER_CAVEAT,
            }
        )

    return (
        pd.DataFrame(rows, columns=_subregion_columns())
        .sort_values(
            ["mean_adaptation_gap_score", "subregion"],
            ascending=[False, True],
            kind="mergesort",
            na_position="last",
        )
        .reset_index(drop=True)
    )


def build_spatial_pattern_tables(
    country_drivers: pd.DataFrame,
    geography_context: pd.DataFrame,
) -> dict[str, pd.DataFrame]:
    """Build TASK-015 spatial typology tables for runner integration."""

    typologies = build_spatial_typologies(country_drivers, geography_context)
    return {
        "eda_spatial_typologies.csv": typologies,
        "eda_subregion_comparisons.csv": build_subregion_comparisons(typologies),
    }


def _normalize_drivers(country_drivers: pd.DataFrame) -> pd.DataFrame:
    _require_columns(country_drivers, ["geo_code"], "country_drivers")
    drivers = country_drivers.copy()
    drivers["geo_code"] = drivers["geo_code"].fillna("").astype(str).str.strip()
    drivers = drivers[drivers["geo_code"] != ""].drop_duplicates("geo_code", keep="first")

    for column in [
        "adaptation_gap_rank",
        "adaptation_gap_score",
        "climate_pressure_score",
        "capacity_score",
        "rank_range",
    ]:
        if column not in drivers:
            drivers[column] = pd.NA
        drivers[column] = pd.to_numeric(drivers[column], errors="coerce")

    for column, default in _text_defaults().items():
        if column not in drivers:
            drivers[column] = default
        drivers[column] = drivers[column].fillna(default).astype(str).str.strip()

    for column in ["data_desert_flag", "monitoring_missing"]:
        if column not in drivers:
            drivers[column] = False
        drivers[column] = drivers[column].apply(_bool_value)

    return drivers.reset_index(drop=True)


def _normalize_spatial_typologies(spatial_typologies: pd.DataFrame) -> pd.DataFrame:
    columns = _subregion_columns()
    if spatial_typologies.empty:
        return pd.DataFrame(columns=columns)
    _require_columns(spatial_typologies, ["geo_code", "subregion"], "spatial_typologies")
    spatial = spatial_typologies.copy()
    spatial["geo_code"] = spatial["geo_code"].fillna("").astype(str).str.strip()
    spatial["subregion"] = spatial["subregion"].fillna("").astype(str).str.strip()
    spatial["subregion"] = spatial["subregion"].where(spatial["subregion"] != "", "Unspecified")
    spatial = spatial[spatial["geo_code"] != ""].copy()

    for column in [
        "adaptation_gap_rank",
        "adaptation_gap_score",
        "climate_pressure_score",
        "capacity_score",
    ]:
        if column not in spatial:
            spatial[column] = pd.NA
        spatial[column] = pd.to_numeric(spatial[column], errors="coerce")
    for column in [
        "story_priority",
        "pressure_capacity_typology",
        "spatial_typology",
        "story_cluster_label",
        "robustness_label",
    ]:
        if column not in spatial:
            spatial[column] = ""
        spatial[column] = spatial[column].fillna("").astype(str).str.strip()
    for column in [
        "data_desert_flag",
        "monitoring_missing",
        "coverage_monitoring_gap_flag",
        "fragile_rank_flag",
        "rank_uncertainty_flag",
    ]:
        if column not in spatial:
            spatial[column] = False
        spatial[column] = spatial[column].apply(_bool_value)
    return spatial.reset_index(drop=True)


def _safe_geography_context(context: pd.DataFrame) -> pd.DataFrame:
    columns = ["geo_code", *_context_columns()]
    if context.empty or "geo_code" not in context:
        return pd.DataFrame(columns=columns)
    normalized = context.copy()
    normalized["geo_code"] = normalized["geo_code"].fillna("").astype(str).str.strip()
    if "pacific_subregion" in normalized.columns:
        normalized = normalized.rename(columns={"pacific_subregion": "subregion"})
    for column in _context_columns():
        if column not in normalized:
            normalized[column] = ""
        normalized[column] = normalized[column].fillna("").astype(str).str.strip()
    normalized = normalized[normalized["geo_code"] != ""]
    normalized = normalized.drop_duplicates("geo_code", keep="first")
    return normalized[columns].reset_index(drop=True)


def _default_geography_context() -> pd.DataFrame:
    context_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "external"
        / "geography_context.csv"
    )
    try:
        return pd.read_csv(context_path)
    except (FileNotFoundError, OSError, pd.errors.ParserError):
        return pd.DataFrame()


def _gap_tier(value: Any) -> str:
    score = _float_value(value)
    if score >= HIGH_GAP_THRESHOLD:
        return "high gap"
    if score >= ELEVATED_GAP_THRESHOLD:
        return "moderate gap"
    return "lower gap"


def _pressure_tier(value: Any) -> str:
    score = _float_value(value)
    if score >= HIGH_PRESSURE_THRESHOLD:
        return "high pressure"
    if score <= LOW_PRESSURE_THRESHOLD:
        return "low pressure"
    return "moderate pressure"


def _capacity_tier(value: Any) -> str:
    score = _float_value(value)
    if score <= LOW_CAPACITY_THRESHOLD:
        return "low capacity"
    if score >= HIGH_CAPACITY_THRESHOLD:
        return "high capacity"
    return "moderate capacity"


def _spatial_typology(row: pd.Series) -> str:
    if str(row.get("score_status", "")).lower() != "scored":
        return "insufficient data"
    gap = _float_value(row.get("adaptation_gap_score"))
    pressure = _float_value(row.get("climate_pressure_score"))
    capacity = _float_value(row.get("capacity_score"))
    if gap >= HIGH_GAP_THRESHOLD and capacity <= LOW_CAPACITY_THRESHOLD:
        return "high gap / low visible capacity"
    if gap >= HIGH_GAP_THRESHOLD and pressure >= HIGH_PRESSURE_THRESHOLD:
        return "high gap / high climate pressure"
    if gap >= HIGH_GAP_THRESHOLD:
        return "high gap / mixed drivers"
    if pressure >= HIGH_PRESSURE_THRESHOLD and capacity >= HIGH_CAPACITY_THRESHOLD:
        return "high pressure / higher visible capacity"
    if capacity <= LOW_CAPACITY_THRESHOLD:
        return "low capacity / monitoring watch"
    if gap <= LOW_PRESSURE_THRESHOLD:
        return "lower gap / context benchmark"
    return "mixed gap / regional context"


def _story_cluster_label(row: pd.Series) -> str:
    if str(row.get("score_status", "")).lower() != "scored":
        return "Insufficient data"
    subregion = str(row.get("subregion", "") or "Unspecified").strip()
    gap = _float_value(row.get("adaptation_gap_score"))
    pressure = _float_value(row.get("climate_pressure_score"))
    capacity = _float_value(row.get("capacity_score"))
    if gap >= HIGH_GAP_THRESHOLD and capacity <= LOW_CAPACITY_THRESHOLD:
        return f"{subregion} high-gap capacity constraint"
    if gap >= HIGH_GAP_THRESHOLD:
        return f"{subregion} high-gap priority"
    if _bool_value(row.get("data_desert_flag")) or _bool_value(row.get("monitoring_missing")):
        return f"{subregion} data and monitoring watch"
    if pressure >= HIGH_PRESSURE_THRESHOLD:
        return f"{subregion} pressure comparison"
    if gap <= LOW_PRESSURE_THRESHOLD:
        return f"{subregion} lower-gap benchmark"
    return f"{subregion} mixed-context comparison"


def _regional_story_role(row: pd.Series) -> str:
    if str(row.get("story_priority", "")).lower() == "primary":
        return "subregion_priority"
    if _bool_value(row.get("data_desert_flag")) or _bool_value(row.get("monitoring_missing")):
        return "coverage_context"
    if _float_value(row.get("climate_pressure_score")) >= HIGH_PRESSURE_THRESHOLD:
        return "pressure_context"
    return "comparison_context"


def _rank_uncertainty_flag(row: pd.Series) -> bool:
    robustness = str(row.get("robustness_label", "")).strip().lower()
    rank_range = _float_value(row.get("rank_range"))
    return bool(robustness in {"fragile", "sensitive"} or rank_range >= 4)


def _dominant_label(values: pd.Series) -> str:
    ranked = _label_counts(values)
    if ranked.empty:
        return ""
    return str(ranked.iloc[0]["label"])


def _label_mix(values: pd.Series) -> str:
    ranked = _label_counts(values)
    return "; ".join(f"{row.label} ({int(row.count)})" for row in ranked.itertuples())


def _label_counts(values: pd.Series) -> pd.DataFrame:
    labels = values.fillna("").astype(str).str.strip()
    labels = labels[labels != ""]
    if labels.empty:
        return pd.DataFrame(columns=["label", "count"])
    return (
        labels.value_counts()
        .rename_axis("label")
        .reset_index(name="count")
        .sort_values(["count", "label"], ascending=[False, True], kind="mergesort")
        .reset_index(drop=True)
    )


def _regional_comparison_label(subregion: str, typologies: pd.Series) -> str:
    dominant = _dominant_label(typologies)
    if not dominant:
        return f"{subregion}: no dominant typology"
    return f"{subregion}: {dominant}"


def _rounded_mean(values: pd.Series) -> float:
    numeric = pd.to_numeric(values, errors="coerce").dropna()
    if numeric.empty:
        return float("nan")
    return round(float(numeric.mean()), 4)


def _rounded_median(values: pd.Series) -> float:
    numeric = pd.to_numeric(values, errors="coerce").dropna()
    if numeric.empty:
        return float("nan")
    return round(float(numeric.median()), 4)


def _context_columns() -> list[str]:
    return [
        "geography_name",
        "subregion",
        "political_status",
        "island_group_or_region_note",
        "context_quality",
        "context_note",
    ]


def _text_defaults() -> dict[str, str]:
    return {
        "score_status": "scored",
        "driver_label": "",
        "story_label": "",
        "story_priority": "context",
        "pressure_capacity_typology": "",
        "coverage_flag": "",
        "robustness_label": "not assessed",
        "evidence_density_label": "",
        "top_pressure_signals": "",
        "top_capacity_signals": "",
        "fragility_caveat": "",
        "non_causal_caveat": "",
    }


def _subregion_columns() -> list[str]:
    return [
        "subregion",
        "geography_count",
        "geography_codes",
        "mean_adaptation_gap_score",
        "mean_climate_pressure_score",
        "mean_capacity_score",
        "median_adaptation_gap_rank",
        "high_gap_count",
        "low_capacity_count",
        "high_pressure_count",
        "data_desert_count",
        "monitoring_missing_count",
        "coverage_monitoring_gap_count",
        "fragile_rank_count",
        "sensitive_rank_count",
        "rank_uncertainty_count",
        "primary_story_count",
        "secondary_story_count",
        "context_story_count",
        "dominant_spatial_typology",
        "dominant_pressure_capacity_typology",
        "dominant_story_cluster_label",
        "typology_mix",
        "regional_comparison_label",
        "top_gap_geo_codes",
        "regional_caveat",
        "distance_caveat",
        "cluster_caveat",
    ]


def _require_columns(frame: pd.DataFrame, columns: list[str], frame_name: str) -> None:
    missing = [column for column in columns if column not in frame.columns]
    if missing:
        raise ValueError(f"{frame_name} missing required columns: {', '.join(missing)}")


def _bool_value(value: Any) -> bool:
    if value is None:
        return False
    missing = pd.isna(value)
    if isinstance(missing, bool) and missing:
        return False
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y"}
    return bool(value)


def _float_value(value: Any) -> float:
    if value is None:
        return 0.0
    missing = pd.isna(value)
    if isinstance(missing, bool) and missing:
        return 0.0
    return float(value)
