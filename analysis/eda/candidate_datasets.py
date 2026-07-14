"""Comparability and story-signal tables for the five processed candidates."""

from __future__ import annotations

import pandas as pd

POPULATION_SLUG = "population-growth"
RENEWABLE_SLUG = "renewable-energy-share-in-the-total-final-energy-consumption"
WATER_SLUG = "proportion-of-population-using-safely-managed-drinking-water-services"
LOSS_SLUG = "direct-disaster-economic-loss"
LAND_SLUG = "climate-altering-land-cover-index"
CANDIDATE_SLUGS = (
    POPULATION_SLUG,
    RENEWABLE_SLUG,
    WATER_SLUG,
    LOSS_SLUG,
    LAND_SLUG,
)
TOTAL_GEOGRAPHIES = 22
BASELINE_EDA_PILLARS = (
    "adaptation_capacity",
    "climate_signal",
    "observed_stress",
    "responsibility_context",
)

CANDIDATE_SPECS = {
    POPULATION_SLUG: {
        "short_label": "Projected population growth",
        "measure_kind": "published estimated annual rate",
        "denominator": "prior-period population implied by the published rate",
        "comparison_unit": "PERCENT",
        "unit_conversion": "none",
        "comparability_judgment": "comparable_within_indicator",
        "trend_use": "published projection/estimated rates are demographic context only",
        "caveat": (
            "Published projection/estimated rate; not observed population change, "
            "population size, or climate vulnerability."
        ),
    },
    RENEWABLE_SLUG: {
        "short_label": "Renewable energy share",
        "measure_kind": "share",
        "denominator": "total final energy consumption",
        "comparison_unit": "PERCENT",
        "unit_conversion": "none",
        "comparability_judgment": "comparable_within_indicator",
        "trend_use": "compare annual shares within this indicator",
        "caveat": "The share does not measure energy access, reliability, or adaptation capacity.",
    },
    WATER_SLUG: {
        "short_label": "Safely managed drinking water",
        "measure_kind": "population share",
        "denominator": "population in the represented geography",
        "comparison_unit": "PERCENT",
        "unit_conversion": "none",
        "comparability_judgment": "comparable_with_latest_year_caution",
        "trend_use": "compare trends within geography and note latest-year spread",
        "caveat": "This is essential-service context, not a climate-attribution measure.",
    },
    LOSS_SLUG: {
        "short_label": "Recorded direct disaster loss",
        "measure_kind": "reported total",
        "denominator": "not applicable; no population or GDP denominator is supplied",
        "comparison_unit": "USD",
        "unit_conversion": "USD_MILLIONS multiplied by 1,000,000; USD unchanged",
        "comparability_judgment": "reporting_visibility_only",
        "trend_use": "show recorded event-years only; do not infer a continuous trend",
        "caveat": "Unreported years are missing records, not zero-loss years.",
    },
    LAND_SLUG: {
        "short_label": "Climate-altering land-cover index",
        "measure_kind": "published index",
        "denominator": "not applicable to the published index",
        "comparison_unit": "PERCENT",
        "unit_conversion": "none",
        "comparability_judgment": "direction_requires_source_review",
        "trend_use": "inspect trajectories, but do not label improvement or deterioration",
        "caveat": "The source direction and baseline need review before narrative interpretation.",
    },
}


def select_candidate_observations(observations: pd.DataFrame) -> pd.DataFrame:
    """Return numeric rows for the five accepted candidate datasets."""

    required = {"dataset_slug", "geo_code", "year", "value", "unit"}
    missing = required.difference(observations.columns)
    if missing:
        raise ValueError(f"Candidate observations are missing columns: {sorted(missing)}")
    frame = observations[observations["dataset_slug"].isin(CANDIDATE_SLUGS)].copy()
    frame["year"] = pd.to_numeric(frame["year"], errors="coerce")
    frame["value"] = pd.to_numeric(frame["value"], errors="coerce")
    frame = frame.dropna(subset=["geo_code", "year", "value"])
    frame["year"] = frame["year"].astype(int)
    return frame.sort_values(
        ["dataset_slug", "geo_code", "year", "unit"],
        kind="mergesort",
    ).reset_index(drop=True)


def select_baseline_observations(observations: pd.DataFrame) -> pd.DataFrame:
    """Keep candidate research rows out of the established EDA and app-evidence lane."""

    required = {"dataset_slug", "pillar"}
    missing = required.difference(observations.columns)
    if missing:
        raise ValueError(f"Baseline observations are missing columns: {sorted(missing)}")
    return observations[observations["pillar"].isin(BASELINE_EDA_PILLARS)].copy()


def normalize_direct_loss_units(loss_rows: pd.DataFrame) -> pd.DataFrame:
    """Convert the two explicit direct-loss units to one USD comparison field."""

    normalized = loss_rows.copy()
    units = normalized["unit"].fillna("").astype(str).str.strip()
    unexpected = sorted(set(units).difference({"USD", "USD_MILLIONS"}))
    if unexpected:
        raise ValueError(f"Unexpected direct-loss units: {unexpected}")
    values = pd.to_numeric(normalized["value"], errors="coerce")
    normalized["comparison_value"] = values.where(units.eq("USD"), values * 1_000_000)
    normalized["comparison_unit"] = "USD"
    return normalized


def latest_candidate_snapshot(observations: pd.DataFrame) -> pd.DataFrame:
    """Return each geography's latest row per candidate with a comparable value field."""

    candidates = select_candidate_observations(observations)
    latest = (
        candidates.sort_values(["dataset_slug", "geo_code", "year"], kind="mergesort")
        .drop_duplicates(["dataset_slug", "geo_code"], keep="last")
        .copy()
    )
    latest["comparison_value"] = latest["value"]
    latest["comparison_unit"] = latest["unit"]
    loss_mask = latest["dataset_slug"].eq(LOSS_SLUG)
    if loss_mask.any():
        loss = normalize_direct_loss_units(latest.loc[loss_mask])
        latest.loc[loss_mask, "comparison_value"] = loss["comparison_value"]
        latest.loc[loss_mask, "comparison_unit"] = loss["comparison_unit"]
    return latest.reset_index(drop=True)


def build_candidate_coverage(observations: pd.DataFrame) -> pd.DataFrame:
    """Summarize spatial, temporal, value, and latest-year coverage."""

    candidates = select_candidate_observations(observations)
    latest = latest_candidate_snapshot(candidates)
    rows: list[dict[str, object]] = []
    for slug in CANDIDATE_SLUGS:
        group = candidates[candidates["dataset_slug"].eq(slug)]
        latest_group = latest[latest["dataset_slug"].eq(slug)]
        year_start = int(group["year"].min())
        year_end = int(group["year"].max())
        geography_count = int(group["geo_code"].nunique())
        observed_geo_years = int(group[["geo_code", "year"]].drop_duplicates().shape[0])
        possible_geo_years = geography_count * (year_end - year_start + 1)
        latest_year_min = int(latest_group["year"].min())
        latest_year_max = int(latest_group["year"].max())
        rows.append(
            {
                "dataset_slug": slug,
                "short_label": CANDIDATE_SPECS[slug]["short_label"],
                "row_count": int(len(group)),
                "value_count": int(group["value"].notna().sum()),
                "geography_count": geography_count,
                "total_geography_count": TOTAL_GEOGRAPHIES,
                "geography_coverage_pct": round(geography_count / TOTAL_GEOGRAPHIES * 100, 1),
                "missing_geographies": " ".join(
                    sorted(set(candidates["geo_code"]).difference(group["geo_code"]))
                ),
                "year_start": year_start,
                "year_end": year_end,
                "year_count": int(group["year"].nunique()),
                "observed_geography_years": observed_geo_years,
                "possible_geography_years": possible_geo_years,
                "geography_year_coverage_pct": round(
                    observed_geo_years / possible_geo_years * 100, 1
                ),
                "units": " ".join(sorted(group["unit"].dropna().astype(str).unique())),
                "latest_year_min": latest_year_min,
                "latest_year_max": latest_year_max,
                "latest_year_spread": latest_year_max - latest_year_min,
                "coverage_caveat": (
                    "Returned-row coverage only; missing geography-years are not zero "
                    "values or no-event years."
                ),
            }
        )
    return pd.DataFrame(rows)


def build_candidate_comparability(observations: pd.DataFrame) -> pd.DataFrame:
    """Record the permitted comparison for every accepted candidate."""

    coverage = build_candidate_coverage(observations).set_index("dataset_slug")
    rows: list[dict[str, object]] = []
    for slug in CANDIDATE_SLUGS:
        spec = CANDIDATE_SPECS[slug]
        latest_min = int(coverage.loc[slug, "latest_year_min"])
        latest_max = int(coverage.loc[slug, "latest_year_max"])
        rows.append(
            {
                "dataset_slug": slug,
                "short_label": spec["short_label"],
                "measure_kind": spec["measure_kind"],
                "raw_units": coverage.loc[slug, "units"],
                "comparison_unit": spec["comparison_unit"],
                "unit_conversion": spec["unit_conversion"],
                "denominator": spec["denominator"],
                "comparability_judgment": spec["comparability_judgment"],
                "within_indicator_use": spec["trend_use"],
                "latest_year_basis": (
                    str(latest_min)
                    if latest_min == latest_max
                    else f"{latest_min}-{latest_max}; compare with caution"
                ),
                "cross_indicator_use": "do not compare raw magnitudes or sum into a score",
                "missingness_interpretation": (
                    "missing year means no returned record, not zero"
                    if slug == LOSS_SLUG
                    else "retain source gaps; do not impute"
                ),
                "caveat": spec["caveat"],
            }
        )
    return pd.DataFrame(rows)


def build_candidate_story_signals(
    observations: pd.DataFrame,
    geography_context: pd.DataFrame,
) -> pd.DataFrame:
    """Evaluate bounded story hypotheses without selecting a final narrative."""

    candidates = select_candidate_observations(observations)
    latest = latest_candidate_snapshot(candidates)
    names = _geography_names(geography_context)
    population_latest = latest[latest["dataset_slug"].eq(POPULATION_SLUG)]
    negative_population = population_latest[population_latest["value"].lt(0)]
    changes = first_latest_changes(candidates)
    pg_water = _change(changes, WATER_SLUG, "PG")
    pg_renewable = _change(changes, RENEWABLE_SLUG, "PG")
    ws_water = _change(changes, WATER_SLUG, "WS")
    ws_renewable = _change(changes, RENEWABLE_SLUG, "WS")
    latest_pivot = latest.pivot(index="geo_code", columns="dataset_slug", values="value")
    water_renewable_rank_correlation = (
        latest_pivot[[WATER_SLUG, RENEWABLE_SLUG]].rank().corr().iloc[0, 1]
    )
    loss = candidates[candidates["dataset_slug"].eq(LOSS_SLUG)]
    loss_possible = int(loss["geo_code"].nunique()) * (
        int(loss["year"].max()) - int(loss["year"].min()) + 1
    )
    latest_land = latest[latest["dataset_slug"].eq(LAND_SLUG)]
    land_min = latest_land.loc[latest_land["value"].idxmin()]
    land_max = latest_land.loc[latest_land["value"].idxmax()]
    land_min_name = names.get(str(land_min["geo_code"]), str(land_min["geo_code"]))
    land_max_name = names.get(str(land_max["geo_code"]), str(land_max["geo_code"]))

    rows = [
        _signal(
            1,
            "population_growth_turns_negative",
            "Several latest projected population-growth rates are below zero.",
            "supported",
            (
                f"{len(negative_population)} of {len(population_latest)} geographies have "
                "a negative latest published projection/estimated population-growth "
                "rate in 2025."
            ),
            _named_codes(negative_population["geo_code"].tolist(), names),
            POPULATION_SLUG,
            "latest 2025 published projection/estimated annual rate",
            "Keep as projected demographic context; do not treat it as observed change or size.",
            CANDIDATE_SPECS[POPULATION_SLUG]["caveat"],
        ),
        _signal(
            2,
            "service_and_energy_move_in_different_directions",
            "Essential-service and energy-transition measures do not move as one progress axis.",
            "supported",
            (
                f"Papua New Guinea water changed {pg_water:+.2f} points while renewable "
                f"share changed {pg_renewable:+.2f}; Samoa changed {ws_water:+.2f} and "
                f"{ws_renewable:+.2f}, respectively."
            ),
            _named_codes(["PG", "WS"], names),
            f"{WATER_SLUG} {RENEWABLE_SLUG}",
            "first-to-latest percentage-point changes within each indicator",
            "Audition a cross-current story while keeping the two measures on separate axes.",
            "The movements are descriptive and are not attributed to climate or policy causes.",
        ),
        _signal(
            3,
            "latest_service_access_is_uneven",
            "Latest safely managed drinking-water shares remain uneven.",
            "supported",
            _latest_evidence(latest, WATER_SLUG, ["PG", "SB", "WF", "TV"]),
            _named_codes(["PG", "SB", "WF", "TV"], names),
            WATER_SLUG,
            "latest returned value per geography; latest years span 2020-2022",
            "Use named-place contrasts with visible years, not a synchronized league table.",
            CANDIDATE_SPECS[WATER_SLUG]["caveat"],
        ),
        _signal(
            4,
            "loss_records_show_visibility_not_a_continuous_series",
            "Recorded disaster loss is evidence of reporting visibility, not a complete trend.",
            "supported",
            (
                f"The source returns {len(loss)} records across "
                f"{loss['geo_code'].nunique()} geographies and "
                f"{loss['year'].min()}-{loss['year'].max()} "
                f"({len(loss)}/{loss_possible} possible geography-years)."
            ),
            _named_codes(sorted(loss["geo_code"].unique()), names),
            LOSS_SLUG,
            "recorded event-years; USD_MILLIONS converted to USD",
            "Show a reporting raster and recorded events; reject a continuous loss trend.",
            CANDIDATE_SPECS[LOSS_SLUG]["caveat"],
        ),
        _signal(
            5,
            "land_cover_trajectories_need_semantic_review",
            (
                "The land-cover index varies sharply, but its direction cannot yet carry "
                "a public claim."
            ),
            "weak",
            (
                f"Latest 2022 values range from {land_min['value']:.1f} in {land_min_name} "
                f"to {land_max['value']:.1f} in {land_max_name}."
            ),
            _named_codes([str(land_min["geo_code"]), str(land_max["geo_code"])], names),
            LAND_SLUG,
            "published index trajectories and latest 2022 values",
            "Keep in the research atlas; do not label high/low as better/worse.",
            CANDIDATE_SPECS[LAND_SLUG]["caveat"],
        ),
        _signal(
            6,
            "one_candidate_progress_ladder",
            "The candidates form one coherent progress ladder.",
            "contradicted",
            (
                "Latest water and renewable within-indicator ranks correlate "
                f"{water_renewable_rank_correlation:.2f}; "
                "named trajectories also move in opposing directions."
            ),
            _named_codes(["PG", "WS", "TV", "SB"], names),
            f"{POPULATION_SLUG} {RENEWABLE_SLUG} {WATER_SLUG} {LAND_SLUG}",
            "within-indicator latest ranks; no raw cross-unit arithmetic",
            "Reject a new candidate composite and retain a profile/contrast form.",
            "Rank correlation is descriptive and latest years are not perfectly aligned.",
        ),
        _signal(
            7,
            "disaster_loss_per_capita",
            "Recorded disaster loss can be compared per person.",
            "unavailable",
            (
                "The processed candidate set contains a population-growth rate, not "
                "population-size denominators."
            ),
            "",
            f"{LOSS_SLUG} {POPULATION_SLUG}",
            "denominator audit",
            "Do not calculate loss per capita from the available candidate fields.",
            "A defensible population-size series would be required.",
        ),
        _signal(
            8,
            "candidate_changes_are_caused_by_climate",
            "Changes in services, energy, population, or land cover are caused by climate change.",
            "unavailable",
            "The official rows are descriptive indicators with no causal identification design.",
            "",
            " ".join(CANDIDATE_SLUGS),
            "observational descriptive data",
            "Use the candidates as conditions and responses, not causal proof.",
            "Attribution would require external design, controls, and domain evidence.",
        ),
    ]
    return pd.DataFrame(rows)


def build_candidate_tables(
    observations: pd.DataFrame,
    geography_context: pd.DataFrame,
) -> dict[str, pd.DataFrame]:
    """Build all TASK-067 candidate analysis tables."""

    return {
        "eda_candidate_dataset_coverage.csv": build_candidate_coverage(observations),
        "eda_candidate_comparability.csv": build_candidate_comparability(observations),
        "eda_candidate_story_signals.csv": build_candidate_story_signals(
            observations,
            geography_context,
        ),
    }


def first_latest_changes(candidates: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, object]] = []
    for (slug, geo_code), group in candidates.groupby(["dataset_slug", "geo_code"], sort=True):
        ordered = group.sort_values("year", kind="mergesort")
        first = ordered.iloc[0]
        latest = ordered.iloc[-1]
        rows.append(
            {
                "dataset_slug": slug,
                "geo_code": geo_code,
                "first_year": int(first["year"]),
                "latest_year": int(latest["year"]),
                "change": float(latest["value"] - first["value"]),
            }
        )
    return pd.DataFrame(rows)


def _change(changes: pd.DataFrame, slug: str, geo_code: str) -> float:
    row = changes[changes["dataset_slug"].eq(slug) & changes["geo_code"].eq(geo_code)]
    if row.empty:
        return float("nan")
    return float(row.iloc[0]["change"])


def _geography_names(context: pd.DataFrame) -> dict[str, str]:
    if not {"geo_code", "geography_name"}.issubset(context.columns):
        return {}
    return {
        str(row["geo_code"]): str(row["geography_name"])
        for _, row in context.drop_duplicates("geo_code").iterrows()
    }


def _named_codes(codes: list[str], names: dict[str, str]) -> str:
    return "; ".join(f"{names.get(code, code)} ({code})" for code in codes)


def _latest_evidence(latest: pd.DataFrame, slug: str, codes: list[str]) -> str:
    rows = latest[latest["dataset_slug"].eq(slug)].set_index("geo_code")
    evidence = []
    for code in codes:
        if code in rows.index:
            row = rows.loc[code]
            evidence.append(f"{code} {row['value']:.2f}% ({int(row['year'])})")
        else:
            evidence.append(f"{code} no returned row")
    return "; ".join(evidence) + "."


def _signal(
    order: int,
    signal_id: str,
    hypothesis: str,
    status: str,
    evidence_summary: str,
    named_geographies: str,
    datasets: str,
    time_basis: str,
    decision: str,
    caveat: str,
) -> dict[str, object]:
    return {
        "signal_order": order,
        "signal_id": signal_id,
        "hypothesis": hypothesis,
        "status": status,
        "evidence_summary": evidence_summary,
        "named_geographies": named_geographies,
        "datasets": datasets,
        "time_basis": time_basis,
        "decision": decision,
        "caveat": caveat,
    }
