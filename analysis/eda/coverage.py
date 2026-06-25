"""Coverage and monitoring-gap EDA tables."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd


MONITORING_DATASET_SLUG = "meteorological-monitoring-network"
HIGH_GAP_THRESHOLD = 66.0
HIGH_PRESSURE_THRESHOLD = 66.0
LOW_CAPACITY_THRESHOLD = 33.0
MONITORING_PROXY_CAVEAT = (
    "Monitoring count is proxy coverage from latest official monitoring-network rows; "
    "it is not normalized by population, land area, coastline, station quality, or "
    "reporting completeness."
)
COVERAGE_PILLARS = (
    "adaptation_capacity",
    "climate_signal",
    "observed_stress",
    "responsibility_context",
)
TIMESERIES_COVERAGE_CAVEAT = (
    "High row counts can reflect long time series rather than better spatial coverage; "
    "compare dataset counts, geography counts, missing fields, and year spans before "
    "interpreting official data coverage."
)
COVERAGE_ONLY_CAVEAT = (
    "Coverage flags describe official data availability only; they are separate from "
    "climate, adaptation, or responsibility outcome rankings."
)


def build_coverage_by_geography(
    observations: pd.DataFrame,
    geography_lookup: pd.DataFrame | None = None,
    dataset_profile: pd.DataFrame | None = None,
    expected_pillars: tuple[str, ...] | None = None,
) -> pd.DataFrame:
    """Build TASK-011 geography-level official-data coverage diagnostics."""

    normalized = _normalize_observations(observations)
    geographies = _all_geographies(normalized, geography_lookup, dataset_profile)
    all_datasets = _all_dataset_slugs(normalized, dataset_profile)
    all_pillars = _expected_pillars(normalized, dataset_profile, expected_pillars)
    total_dataset_count = len(all_datasets)

    rows: list[dict[str, object]] = []
    for geo_code in geographies:
        geo_observations = normalized[normalized["geo_code"] == geo_code]
        datasets = _sorted_unique(geo_observations, "dataset_slug")
        pillars = _sorted_unique(geo_observations, "pillar")
        years = geo_observations["year"].dropna()
        missing_datasets = [slug for slug in all_datasets if slug not in datasets]
        missing_pillars = [pillar for pillar in all_pillars if pillar not in pillars]
        row_count = int(len(geo_observations))
        dataset_count = len(datasets)
        pillar_count = len(pillars)

        data_desert_flag = _task011_data_desert_flag(
            dataset_count=dataset_count,
            total_dataset_count=total_dataset_count,
            pillar_count=pillar_count,
        )
        row = {
            "geo_code": geo_code,
            "row_count": row_count,
            "dataset_count": dataset_count,
            "total_dataset_count": total_dataset_count,
            "missing_dataset_count": len(missing_datasets),
            "first_observation_year": _first_year(years),
            "last_observation_year": _last_year(years),
            "observation_year_count": int(years.nunique()),
            "year_span": _year_span(years),
            "pillar_count": pillar_count,
            "missing_pillar_count": len(missing_pillars),
            "missing_pillars": " ".join(missing_pillars),
            "partial_dataset_coverage_flag": bool(missing_datasets),
            "data_desert_flag": data_desert_flag,
            "monitoring_network_missing_flag": MONITORING_DATASET_SLUG not in datasets,
            "coverage_flag": _geography_coverage_flag(data_desert_flag, missing_datasets),
            "coverage_caveat": _coverage_caveat(),
            "datasets": " ".join(datasets),
            "missing_datasets": " ".join(missing_datasets),
            "pillars": " ".join(pillars),
        }
        for pillar in all_pillars:
            row[f"missing_{pillar}_flag"] = pillar not in pillars
        rows.append(row)

    columns = [
        "geo_code",
        "row_count",
        "dataset_count",
        "total_dataset_count",
        "missing_dataset_count",
        "first_observation_year",
        "last_observation_year",
        "observation_year_count",
        "year_span",
        "pillar_count",
        "missing_pillar_count",
        "missing_pillars",
        "missing_adaptation_capacity_flag",
        "missing_climate_signal_flag",
        "missing_observed_stress_flag",
        "missing_responsibility_context_flag",
        "partial_dataset_coverage_flag",
        "data_desert_flag",
        "monitoring_network_missing_flag",
        "coverage_flag",
        "coverage_caveat",
        "datasets",
        "missing_datasets",
        "pillars",
    ]
    table = pd.DataFrame(rows)
    if table.empty:
        return pd.DataFrame(columns=columns)
    return (
        table[columns]
        .sort_values(
            ["data_desert_flag", "dataset_count", "row_count", "geo_code"],
            ascending=[False, True, True, True],
            kind="mergesort",
        )
        .reset_index(drop=True)
    )


def build_coverage_by_dataset(
    observations: pd.DataFrame,
    dataset_profile: pd.DataFrame | None = None,
    geography_lookup: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """Build TASK-011 dataset-level official-data coverage diagnostics."""

    normalized = _normalize_observations(observations)
    geographies = _all_geographies(normalized, geography_lookup, dataset_profile)
    all_datasets = _all_dataset_slugs(normalized, dataset_profile)
    profiles = _profile_records_by_slug(dataset_profile)
    total_geography_count = len(geographies)

    rows: list[dict[str, object]] = []
    for dataset_slug in all_datasets:
        dataset_observations = normalized[normalized["dataset_slug"] == dataset_slug]
        years = dataset_observations["year"].dropna()
        covered_geographies = _sorted_unique(dataset_observations, "geo_code")
        missing_geographies = [geo for geo in geographies if geo not in covered_geographies]
        profile = profiles.get(dataset_slug, {})
        row_count = int(len(dataset_observations))
        geography_count = len(covered_geographies)
        missing_geography_count = len(missing_geographies)
        thin_geography_coverage_flag = _thin_geography_coverage_flag(
            geography_count=geography_count,
            total_geography_count=total_geography_count,
        )

        rows.append(
            {
                "dataset_slug": dataset_slug,
                "dataset_name": _dataset_label(
                    dataset_observations, profile, "dataset_name", "name"
                ),
                "pillar": _dataset_label(dataset_observations, profile, "pillar", "pillar"),
                "story_role": _dataset_label(
                    dataset_observations, profile, "story_role", "story_role"
                ),
                "row_count": row_count,
                "dataset_count": 1,
                "geography_count": geography_count,
                "total_geography_count": total_geography_count,
                "geography_coverage_pct": _coverage_pct(
                    geography_count, total_geography_count
                ),
                "missing_geography_count": missing_geography_count,
                "first_observation_year": _first_year(years),
                "last_observation_year": _last_year(years),
                "observation_year_count": int(years.nunique()),
                "year_span": _year_span(years),
                "average_rows_per_geography": _average_rows(row_count, geography_count),
                "full_geography_coverage_flag": bool(
                    total_geography_count and missing_geography_count == 0
                ),
                "partial_geography_coverage_flag": bool(missing_geography_count),
                "thin_geography_coverage_flag": thin_geography_coverage_flag,
                "long_timeseries_flag": bool(row_count > geography_count),
                "coverage_flag": _dataset_coverage_flag(
                    missing_geography_count=missing_geography_count,
                    thin_geography_coverage_flag=thin_geography_coverage_flag,
                ),
                "coverage_caveat": _coverage_caveat(),
                "covered_geographies": " ".join(covered_geographies),
                "missing_geographies": " ".join(missing_geographies),
                "profile_row_count": _profile_number(profile, "row_count"),
                "profile_geography_count": _profile_number(profile, "geography_count"),
                "profile_year_start": _profile_number(profile, "year_start"),
                "profile_year_end": _profile_number(profile, "year_end"),
                "profile_caveat_notes": _profile_text(profile, "caveat_notes"),
            }
        )

    columns = [
        "dataset_slug",
        "dataset_name",
        "pillar",
        "story_role",
        "row_count",
        "dataset_count",
        "geography_count",
        "total_geography_count",
        "geography_coverage_pct",
        "missing_geography_count",
        "first_observation_year",
        "last_observation_year",
        "observation_year_count",
        "year_span",
        "average_rows_per_geography",
        "full_geography_coverage_flag",
        "partial_geography_coverage_flag",
        "thin_geography_coverage_flag",
        "long_timeseries_flag",
        "coverage_flag",
        "coverage_caveat",
        "covered_geographies",
        "missing_geographies",
        "profile_row_count",
        "profile_geography_count",
        "profile_year_start",
        "profile_year_end",
        "profile_caveat_notes",
    ]
    table = pd.DataFrame(rows)
    if table.empty:
        return pd.DataFrame(columns=columns)
    return (
        table[columns]
        .sort_values(
            ["geography_count", "row_count", "dataset_slug"],
            ascending=[True, True, True],
            kind="mergesort",
        )
        .reset_index(drop=True)
    )


def build_task011_coverage_tables(
    observations: pd.DataFrame,
    geography_lookup: pd.DataFrame,
    dataset_profile: pd.DataFrame,
) -> dict[str, pd.DataFrame]:
    """Build both TASK-011 coverage tables for runner integration."""

    return {
        "eda_coverage_by_geography.csv": build_coverage_by_geography(
            observations, geography_lookup, dataset_profile
        ),
        "eda_coverage_by_dataset.csv": build_coverage_by_dataset(
            observations, dataset_profile, geography_lookup
        ),
    }


def build_data_coverage(lookup: pd.DataFrame) -> pd.DataFrame:
    """Summarize geography-level data coverage from the processed lookup table."""

    coverage = lookup.copy()
    coverage["dataset_count"] = pd.to_numeric(coverage["dataset_count"], errors="coerce")
    coverage["row_count"] = pd.to_numeric(coverage["row_count"], errors="coerce")
    coverage["first_year"] = pd.to_numeric(coverage["first_year"], errors="coerce")
    coverage["last_year"] = pd.to_numeric(coverage["last_year"], errors="coerce")
    coverage["years_observed"] = coverage["last_year"] - coverage["first_year"] + 1
    coverage["coverage_tier"] = coverage.apply(_coverage_tier, axis=1)
    coverage["data_desert_flag"] = coverage.apply(_data_desert_flag, axis=1)

    columns = [
        "geo_code",
        "dataset_count",
        "row_count",
        "first_year",
        "last_year",
        "years_observed",
        "coverage_tier",
        "data_desert_flag",
        "datasets",
    ]
    return coverage[columns].sort_values("geo_code", kind="mergesort").reset_index(drop=True)


def build_monitoring_gap(index: pd.DataFrame, observations: pd.DataFrame) -> pd.DataFrame:
    """Compare adaptation-gap scores with latest monitoring-network coverage."""

    scored = index.copy()
    if "geo_code" not in scored.columns:
        scored["geo_code"] = pd.NA
    scored["geo_code"] = scored["geo_code"].fillna("").astype(str).str.strip()
    scored["adaptation_gap_score"] = pd.to_numeric(
        scored["adaptation_gap_score"], errors="coerce"
    )
    scored["climate_pressure_score"] = pd.to_numeric(
        scored["climate_pressure_score"], errors="coerce"
    )
    scored["capacity_score"] = pd.to_numeric(scored["capacity_score"], errors="coerce")

    latest = _latest_monitoring_by_geography(observations)

    merged = scored.merge(latest, on="geo_code", how="left")
    merged = _merge_geography_context(merged)
    merged["monitoring_observation_count"] = (
        pd.to_numeric(merged["monitoring_observation_count"], errors="coerce")
        .fillna(0)
        .astype(int)
    )
    merged["monitoring_count"] = pd.to_numeric(
        merged["monitoring_count"], errors="coerce"
    ).fillna(0)
    monitoring_median = _float_value(merged["monitoring_count"].median())
    merged["adaptation_gap_rank"] = _rank_scores(
        merged["adaptation_gap_score"], ascending=False
    )
    merged["climate_pressure_rank"] = _rank_scores(
        merged["climate_pressure_score"], ascending=False
    )
    merged["low_capacity_rank"] = _rank_scores(merged["capacity_score"], ascending=True)
    merged["monitoring_count_rank"] = _rank_scores(merged["monitoring_count"], ascending=True)
    merged["monitoring_reporting_status"] = merged.apply(
        _monitoring_reporting_status, axis=1
    )
    merged["monitoring_coverage_tier"] = merged.apply(
        lambda row: _monitoring_coverage_tier(row, monitoring_median), axis=1
    )
    merged["adaptation_gap_tier"] = merged["adaptation_gap_score"].apply(
        _adaptation_gap_tier
    )
    merged["climate_pressure_tier"] = merged["climate_pressure_score"].apply(
        _climate_pressure_tier
    )
    merged["capacity_tier"] = merged["capacity_score"].apply(_capacity_tier)
    merged["monitoring_quadrant"] = merged.apply(
        lambda row: _monitoring_quadrant(row, monitoring_median), axis=1
    )
    merged["pressure_monitoring_quadrant"] = merged.apply(
        lambda row: _pressure_monitoring_quadrant(row, monitoring_median), axis=1
    )
    merged["capacity_monitoring_quadrant"] = merged.apply(
        lambda row: _capacity_monitoring_quadrant(row, monitoring_median), axis=1
    )
    priority = merged.apply(lambda row: _story_priority(row, monitoring_median), axis=1)
    merged["story_priority_rank"] = priority.apply(lambda value: value[0]).astype(int)
    merged["story_priority"] = priority.apply(lambda value: value[1])
    merged["monitoring_gap_label"] = merged.apply(
        lambda row: _monitoring_gap_label(row, monitoring_median), axis=1
    )
    merged["monitoring_story_flag"] = (
        merged["monitoring_gap_label"] == "high gap + low monitoring"
    )
    merged["proxy_caveat"] = MONITORING_PROXY_CAVEAT
    merged["missing_reporting_caveat"] = merged.apply(
        _missing_reporting_caveat, axis=1
    )

    columns = [
        "geo_code",
        "geography_name",
        "subregion",
        "adaptation_gap_score",
        "climate_pressure_score",
        "capacity_score",
        "adaptation_gap_rank",
        "climate_pressure_rank",
        "low_capacity_rank",
        "monitoring_count_rank",
        "first_monitoring_year",
        "latest_monitoring_year",
        "monitoring_count",
        "monitoring_observation_count",
        "monitoring_reporting_status",
        "monitoring_coverage_tier",
        "adaptation_gap_tier",
        "climate_pressure_tier",
        "capacity_tier",
        "monitoring_quadrant",
        "pressure_monitoring_quadrant",
        "capacity_monitoring_quadrant",
        "story_priority_rank",
        "story_priority",
        "monitoring_gap_label",
        "monitoring_story_flag",
        "proxy_caveat",
        "missing_reporting_caveat",
    ]
    return (
        merged[columns]
        .sort_values(
            [
                "story_priority_rank",
                "adaptation_gap_score",
                "climate_pressure_score",
                "monitoring_count",
                "geo_code",
            ],
            ascending=[True, False, False, True, True],
            kind="mergesort",
        )
        .reset_index(drop=True)
    )


def _latest_monitoring_by_geography(observations: pd.DataFrame) -> pd.DataFrame:
    normalized = _normalize_observations(observations)
    monitoring = normalized[
        normalized["dataset_slug"] == MONITORING_DATASET_SLUG
    ].copy()
    columns = [
        "geo_code",
        "first_monitoring_year",
        "latest_monitoring_year",
        "monitoring_count",
        "monitoring_observation_count",
    ]
    if monitoring.empty:
        return pd.DataFrame(columns=columns)

    monitoring["value"] = pd.to_numeric(monitoring["value"], errors="coerce")
    summary = (
        monitoring.groupby("geo_code", as_index=False)
        .agg(
            first_monitoring_year=("year", "min"),
            monitoring_observation_count=("geo_code", "size"),
        )
        .reset_index(drop=True)
    )
    latest = (
        monitoring.dropna(subset=["year"])
        .sort_values(["geo_code", "year"], ascending=[True, False], kind="mergesort")
        .drop_duplicates("geo_code", keep="first")
        .rename(columns={"year": "latest_monitoring_year", "value": "monitoring_count"})
    )[["geo_code", "latest_monitoring_year", "monitoring_count"]]
    return summary.merge(latest, on="geo_code", how="left")[columns]


def _merge_geography_context(scored: pd.DataFrame) -> pd.DataFrame:
    context = _safe_geography_context(_default_geography_context())
    if context.empty:
        enriched = scored.copy()
        enriched["geography_name"] = ""
        enriched["subregion"] = ""
        return enriched
    return scored.merge(context, on="geo_code", how="left").assign(
        geography_name=lambda frame: frame["geography_name"].fillna(""),
        subregion=lambda frame: frame["subregion"].fillna(""),
    )


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


def _safe_geography_context(context: pd.DataFrame) -> pd.DataFrame:
    columns = ["geo_code", "geography_name", "subregion"]
    if context.empty or "geo_code" not in context.columns:
        return pd.DataFrame(columns=columns)
    normalized = context.copy()
    normalized["geo_code"] = normalized["geo_code"].fillna("").astype(str).str.strip()
    if "geography_name" not in normalized.columns:
        normalized["geography_name"] = ""
    if "pacific_subregion" in normalized.columns:
        normalized = normalized.rename(columns={"pacific_subregion": "subregion"})
    elif "subregion" not in normalized.columns:
        normalized["subregion"] = ""

    safe = normalized[~normalized["geo_code"].duplicated(keep=False)].copy()
    safe = safe[safe["geo_code"] != ""]
    for column in columns:
        safe[column] = safe[column].fillna("").astype(str).str.strip()
    return safe[columns].reset_index(drop=True)


def _normalize_observations(observations: pd.DataFrame) -> pd.DataFrame:
    normalized = observations.copy()
    for column in [
        "dataset_slug",
        "dataset_name",
        "pillar",
        "story_role",
        "geo_code",
        "year",
        "value",
    ]:
        if column not in normalized.columns:
            normalized[column] = pd.NA
    for column in ["dataset_slug", "dataset_name", "pillar", "story_role", "geo_code"]:
        normalized[column] = normalized[column].fillna("").astype(str).str.strip()
    normalized["year"] = pd.to_numeric(normalized["year"], errors="coerce")
    return normalized


def _all_geographies(
    observations: pd.DataFrame,
    geography_lookup: pd.DataFrame | None,
    dataset_profile: pd.DataFrame | None,
) -> list[str]:
    geographies = set(_sorted_unique(observations, "geo_code"))
    if geography_lookup is not None and "geo_code" in geography_lookup.columns:
        geographies.update(_sorted_unique(geography_lookup, "geo_code"))
    if dataset_profile is not None and "geography_codes" in dataset_profile.columns:
        for codes in dataset_profile["geography_codes"].dropna():
            geographies.update(str(codes).split())
    return sorted(geo for geo in geographies if geo)


def _all_dataset_slugs(
    observations: pd.DataFrame,
    dataset_profile: pd.DataFrame | None,
) -> list[str]:
    dataset_slugs = set(_sorted_unique(observations, "dataset_slug"))
    if dataset_profile is not None:
        profile_slug_column = _profile_slug_column(dataset_profile)
        if profile_slug_column:
            dataset_slugs.update(_sorted_unique(dataset_profile, profile_slug_column))
    return sorted(slug for slug in dataset_slugs if slug)


def _expected_pillars(
    observations: pd.DataFrame,
    dataset_profile: pd.DataFrame | None,
    expected_pillars: tuple[str, ...] | None,
) -> list[str]:
    pillars = set(expected_pillars or COVERAGE_PILLARS)
    pillars.update(_sorted_unique(observations, "pillar"))
    if dataset_profile is not None and "pillar" in dataset_profile.columns:
        pillars.update(_sorted_unique(dataset_profile, "pillar"))
    return sorted(pillar for pillar in pillars if pillar)


def _profile_records_by_slug(dataset_profile: pd.DataFrame | None) -> dict[str, dict[str, object]]:
    if dataset_profile is None:
        return {}
    profile_slug_column = _profile_slug_column(dataset_profile)
    if not profile_slug_column:
        return {}
    profiles: dict[str, dict[str, object]] = {}
    for _, row in dataset_profile.iterrows():
        slug = row.get(profile_slug_column)
        if pd.isna(slug):
            continue
        profiles[str(slug).strip()] = row.to_dict()
    return profiles


def _profile_slug_column(dataset_profile: pd.DataFrame) -> str | None:
    for column in ["slug", "dataset_slug"]:
        if column in dataset_profile.columns:
            return column
    return None


def _sorted_unique(frame: pd.DataFrame, column: str) -> list[str]:
    if column not in frame.columns:
        return []
    return sorted(
        {
            str(value).strip()
            for value in frame[column].dropna()
            if str(value).strip() and str(value).strip().lower() != "nan"
        }
    )


def _dataset_label(
    dataset_observations: pd.DataFrame,
    profile: dict[str, object],
    observation_column: str,
    profile_column: str,
) -> str:
    values = _sorted_unique(dataset_observations, observation_column)
    if values:
        return values[0]
    return _profile_text(profile, profile_column)


def _profile_text(profile: dict[str, object], column: str) -> str:
    value = profile.get(column, "")
    if value is None or pd.isna(value):
        return ""
    return str(value).strip()


def _profile_number(profile: dict[str, object], column: str) -> int | pd.NA:
    value = profile.get(column)
    if value is None or pd.isna(value):
        return pd.NA
    numeric = pd.to_numeric(value, errors="coerce")
    if pd.isna(numeric):
        return pd.NA
    return int(numeric)


def _first_year(years: pd.Series) -> int | pd.NA:
    years = years.dropna()
    if years.empty:
        return pd.NA
    return int(years.min())


def _last_year(years: pd.Series) -> int | pd.NA:
    years = years.dropna()
    if years.empty:
        return pd.NA
    return int(years.max())


def _year_span(years: pd.Series) -> int | pd.NA:
    years = years.dropna()
    if years.empty:
        return pd.NA
    return int(years.max() - years.min() + 1)


def _task011_data_desert_flag(
    *,
    dataset_count: int,
    total_dataset_count: int,
    pillar_count: int,
) -> bool:
    if dataset_count == 0 or pillar_count <= 1:
        return True
    return bool(total_dataset_count and dataset_count <= max(1, total_dataset_count // 2))


def _thin_geography_coverage_flag(
    *,
    geography_count: int,
    total_geography_count: int,
) -> bool:
    if geography_count == 0:
        return True
    return bool(total_geography_count and geography_count <= max(1, total_geography_count // 2))


def _geography_coverage_flag(data_desert_flag: bool, missing_datasets: list[str]) -> str:
    if data_desert_flag:
        return "data_desert"
    if missing_datasets:
        return "partial_dataset_coverage"
    return "complete_dataset_coverage"


def _dataset_coverage_flag(
    *,
    missing_geography_count: int,
    thin_geography_coverage_flag: bool,
) -> str:
    if thin_geography_coverage_flag:
        return "thin_geography_coverage"
    if missing_geography_count:
        return "partial_geography_coverage"
    return "full_geography_coverage"


def _coverage_pct(count: int, total_count: int) -> float:
    if not total_count:
        return 0.0
    return round((count / total_count) * 100, 2)


def _average_rows(row_count: int, denominator: int) -> float:
    if not denominator:
        return 0.0
    return round(row_count / denominator, 2)


def _coverage_caveat() -> str:
    return f"{TIMESERIES_COVERAGE_CAVEAT} {COVERAGE_ONLY_CAVEAT}"


def _coverage_tier(row: pd.Series) -> str:
    dataset_count = _float_value(row.get("dataset_count"))
    row_count = _float_value(row.get("row_count"))
    if dataset_count >= 8 and row_count >= 500:
        return "broad"
    if dataset_count >= 5:
        return "moderate"
    return "thin"


def _data_desert_flag(row: pd.Series) -> bool:
    dataset_count = _float_value(row.get("dataset_count"))
    row_count = _float_value(row.get("row_count"))
    return dataset_count < 5 or row_count < 100


def _rank_scores(values: pd.Series, *, ascending: bool) -> pd.Series:
    return values.rank(method="min", ascending=ascending).astype("Int64")


def _monitoring_reporting_status(row: pd.Series) -> str:
    observation_count = int(_float_value(row.get("monitoring_observation_count")))
    if observation_count == 0:
        return "missing_monitoring_dataset_row"
    if _float_value(row.get("monitoring_count")) == 0:
        return "reported_zero_latest_count"
    return "reported_positive_latest_count"


def _monitoring_coverage_tier(row: pd.Series, monitoring_median: float) -> str:
    status = _monitoring_reporting_status(row)
    if status == "missing_monitoring_dataset_row":
        return "missing_reporting"
    if status == "reported_zero_latest_count":
        return "reported_zero_proxy_coverage"
    if _low_monitoring(row, monitoring_median):
        return "low_proxy_coverage"
    return "visible_proxy_coverage"


def _adaptation_gap_tier(value: Any) -> str:
    if _float_value(value) >= HIGH_GAP_THRESHOLD:
        return "high_gap"
    return "lower_gap"


def _climate_pressure_tier(value: Any) -> str:
    if _float_value(value) >= HIGH_PRESSURE_THRESHOLD:
        return "high_pressure"
    return "lower_pressure"


def _capacity_tier(value: Any) -> str:
    if _float_value(value) <= LOW_CAPACITY_THRESHOLD:
        return "low_capacity"
    return "higher_capacity"


def _monitoring_quadrant(row: pd.Series, monitoring_median: float) -> str:
    gap_label = "high gap" if _high_gap(row) else "lower gap"
    monitoring_label = "low monitoring" if _low_monitoring(row, monitoring_median) else (
        "visible monitoring"
    )
    return f"{gap_label} / {monitoring_label}"


def _pressure_monitoring_quadrant(row: pd.Series, monitoring_median: float) -> str:
    pressure_label = "high pressure" if _high_pressure(row) else "lower pressure"
    monitoring_label = "low monitoring" if _low_monitoring(row, monitoring_median) else (
        "visible monitoring"
    )
    return f"{pressure_label} / {monitoring_label}"


def _capacity_monitoring_quadrant(row: pd.Series, monitoring_median: float) -> str:
    capacity_label = "low capacity" if _low_capacity(row) else "higher capacity"
    monitoring_label = "low monitoring" if _low_monitoring(row, monitoring_median) else (
        "visible monitoring"
    )
    return f"{capacity_label} / {monitoring_label}"


def _story_priority(row: pd.Series, monitoring_median: float) -> tuple[int, str]:
    low_monitoring = _low_monitoring(row, monitoring_median)
    if _high_gap(row) and low_monitoring:
        return 1, "priority_1_high_gap_low_monitoring"
    if (_high_pressure(row) or _low_capacity(row)) and low_monitoring:
        return 2, "priority_2_pressure_or_capacity_monitoring_gap"
    if _high_gap(row):
        return 3, "priority_3_high_gap_visible_monitoring"
    if low_monitoring:
        return 4, "priority_4_monitoring_gap_context"
    return 5, "priority_5_monitoring_context"


def _monitoring_gap_label(row: pd.Series, monitoring_median: float) -> str:
    high_gap = _high_gap(row)
    low_monitoring = _low_monitoring(row, monitoring_median)
    if high_gap and low_monitoring:
        return "high gap + low monitoring"
    if high_gap:
        return "high gap + visible monitoring"
    if low_monitoring:
        return "low monitoring"
    return "monitoring less urgent"


def _missing_reporting_caveat(row: pd.Series) -> str:
    status = row.get("monitoring_reporting_status")
    if status == "missing_monitoring_dataset_row":
        return (
            "No meteorological-monitoring-network rows in processed observations; "
            "treat the zero proxy count as a reporting gap, not confirmed absence "
            "of infrastructure."
        )
    if status == "reported_zero_latest_count":
        return (
            "Latest meteorological-monitoring-network row reports 0; verify source "
            "semantics before interpreting this as no monitoring infrastructure."
        )
    return (
        "Latest meteorological-monitoring-network row is present; count may still "
        "omit station quality, continuity, siting, and reporting completeness."
    )


def _high_gap(row: pd.Series) -> bool:
    return _float_value(row.get("adaptation_gap_score")) >= HIGH_GAP_THRESHOLD


def _high_pressure(row: pd.Series) -> bool:
    return _float_value(row.get("climate_pressure_score")) >= HIGH_PRESSURE_THRESHOLD


def _low_capacity(row: pd.Series) -> bool:
    return _float_value(row.get("capacity_score")) <= LOW_CAPACITY_THRESHOLD


def _low_monitoring(row: pd.Series, monitoring_median: float) -> bool:
    return _float_value(row.get("monitoring_count")) <= monitoring_median


def _float_value(value: Any) -> float:
    if value is None or pd.isna(value):
        return 0.0
    return float(value)
