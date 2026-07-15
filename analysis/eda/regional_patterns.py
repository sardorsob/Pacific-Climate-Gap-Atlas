"""Reviewed regional evidence tables for TASK-068 exploratory analysis."""

from __future__ import annotations

from itertools import combinations

import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import leaves_list, linkage

from analysis.eda.candidate_datasets import (
    CANDIDATE_SLUGS,
    CANDIDATE_SPECS,
    LAND_SLUG,
    LOSS_SLUG,
    POPULATION_SLUG,
    RENEWABLE_SLUG,
    WATER_SLUG,
    first_latest_changes,
    latest_candidate_snapshot,
    select_candidate_observations,
)

TOTAL_GEOGRAPHIES = 22
MIN_PAIRWISE_N = 8
STABILITY_SPEARMAN_THRESHOLD = 0.80
MONITORING_SLUG = "meteorological-monitoring-network"
REGIONAL_TABLE_FILENAMES = (
    "eda_regional_feature_matrix.csv",
    "eda_regional_distribution_summary.csv",
    "eda_regional_crosscurrents.csv",
    "eda_regional_pairwise_relationships.csv",
    "eda_regional_cluster_stability.csv",
)


def build_regional_tables(
    observations: pd.DataFrame,
    index: pd.DataFrame,
    indicator_trace: pd.DataFrame,
    coverage: pd.DataFrame,
    monitoring_gap: pd.DataFrame,
) -> dict[str, pd.DataFrame]:
    """Build the five reviewed regional tables without condition-value imputation."""

    codes = sorted(index["geo_code"].dropna().astype(str).unique())
    if len(codes) != TOTAL_GEOGRAPHIES:
        raise ValueError(f"Regional EDA requires {TOTAL_GEOGRAPHIES} index geographies")
    names = _geography_names(codes, monitoring_gap)
    condition = _condition_features(codes, names, observations, indicator_trace)
    visibility = _visibility_features(
        codes,
        names,
        observations,
        indicator_trace,
        coverage,
        monitoring_gap,
    )
    condition_order = _seriation_order(condition)
    visibility_order = _seriation_order(visibility)
    feature_matrix = pd.concat(
        [
            _add_order(condition, condition_order, "measured_condition"),
            _add_order(visibility, visibility_order, "evidence_visibility"),
        ],
        ignore_index=True,
    ).sort_values(
        ["lane", "order_position", "feature_order"],
        kind="mergesort",
    )
    feature_matrix = feature_matrix.reset_index(drop=True)

    tables = {
        REGIONAL_TABLE_FILENAMES[0]: feature_matrix,
        REGIONAL_TABLE_FILENAMES[1]: _distribution_summary(condition),
        REGIONAL_TABLE_FILENAMES[2]: _crosscurrents(codes, names, observations),
        REGIONAL_TABLE_FILENAMES[3]: _pairwise_relationships(
            codes,
            observations,
            index,
            indicator_trace,
            coverage,
            monitoring_gap,
        ),
        REGIONAL_TABLE_FILENAMES[4]: _cluster_stability(condition, condition_order),
    }
    return tables


def _condition_features(
    codes: list[str],
    names: dict[str, str],
    observations: pd.DataFrame,
    indicator_trace: pd.DataFrame,
) -> pd.DataFrame:
    required = {
        "geo_code",
        "dataset_slug",
        "dataset_name",
        "pillar",
        "latest_year",
        "latest_value",
        "unit",
        "indicator_score",
        "source_row_hash",
    }
    missing = required.difference(indicator_trace.columns)
    if missing:
        raise ValueError(f"Indicator trace is missing columns: {sorted(missing)}")

    trace = indicator_trace.copy()
    trace["geo_code"] = trace["geo_code"].astype(str)
    trace_features = (
        trace[["dataset_slug", "dataset_name", "pillar"]]
        .drop_duplicates()
        .sort_values("dataset_slug", kind="mergesort")
    )
    rows: list[dict[str, object]] = []
    for feature_order, feature in enumerate(trace_features.itertuples(index=False), start=1):
        lookup = trace[trace["dataset_slug"].eq(feature.dataset_slug)].set_index("geo_code")
        for code in codes:
            source = lookup.loc[code] if code in lookup.index else None
            raw_value = _number(source["latest_value"]) if source is not None else np.nan
            display_value = _number(source["indicator_score"]) if source is not None else np.nan
            rows.append(
                _feature_row(
                    lane="measured_condition",
                    code=code,
                    name=names[code],
                    feature_order=feature_order,
                    feature_id=feature.dataset_slug,
                    feature_label=feature.dataset_name,
                    feature_role=feature.pillar,
                    raw_value=raw_value,
                    display_value=display_value,
                    unit=str(source["unit"]) if source is not None else _unit(lookup),
                    latest_year=_number(source["latest_year"]) if source is not None else np.nan,
                    time_basis="latest returned indicator trace row; source years vary",
                    present=source is not None and pd.notna(raw_value),
                    denominator=_indicator_denominator(feature.dataset_slug),
                    source_row_hash=(
                        str(source["source_row_hash"]) if source is not None else np.nan
                    ),
                    caveat=_condition_caveat(feature.dataset_slug, feature.pillar),
                )
            )

    latest = latest_candidate_snapshot(observations)
    candidate_slugs = (POPULATION_SLUG, RENEWABLE_SLUG, WATER_SLUG, LAND_SLUG)
    for offset, slug in enumerate(candidate_slugs, start=len(trace_features) + 1):
        group = latest[latest["dataset_slug"].eq(slug)].copy()
        group["display_value"] = group["comparison_value"].rank(
            method="average", pct=True
        ) * 100
        lookup = group.set_index("geo_code")
        for code in codes:
            source = lookup.loc[code] if code in lookup.index else None
            raw_value = _number(source["comparison_value"]) if source is not None else np.nan
            rows.append(
                _feature_row(
                    lane="measured_condition",
                    code=code,
                    name=names[code],
                    feature_order=offset,
                    feature_id=slug,
                    feature_label=CANDIDATE_SPECS[slug]["short_label"],
                    feature_role="candidate_context",
                    raw_value=raw_value,
                    display_value=(
                        _number(source["display_value"]) if source is not None else np.nan
                    ),
                    unit=(
                        str(source["comparison_unit"])
                        if source is not None
                        else str(CANDIDATE_SPECS[slug]["comparison_unit"])
                    ),
                    latest_year=_number(source["year"]) if source is not None else np.nan,
                    time_basis="latest returned candidate row; source years vary",
                    present=source is not None and pd.notna(raw_value),
                    denominator=str(CANDIDATE_SPECS[slug]["denominator"]),
                    source_row_hash=(
                        str(source["source_row_hash"]) if source is not None else np.nan
                    ),
                    caveat=str(CANDIDATE_SPECS[slug]["caveat"]),
                )
            )
    return pd.DataFrame(rows)


def _visibility_features(
    codes: list[str],
    names: dict[str, str],
    observations: pd.DataFrame,
    indicator_trace: pd.DataFrame,
    coverage: pd.DataFrame,
    monitoring_gap: pd.DataFrame,
) -> pd.DataFrame:
    trace_features = (
        indicator_trace[["dataset_slug", "dataset_name"]]
        .drop_duplicates()
        .sort_values("dataset_slug", kind="mergesort")
    )
    coverage_lookup = coverage.assign(geo_code=coverage["geo_code"].astype(str)).set_index(
        "geo_code"
    )
    monitoring_lookup = monitoring_gap.assign(
        geo_code=monitoring_gap["geo_code"].astype(str)
    ).set_index("geo_code")
    rows: list[dict[str, object]] = []
    feature_order = 0
    for feature in trace_features.itertuples(index=False):
        feature_order += 1
        for code in codes:
            if feature.dataset_slug == MONITORING_SLUG:
                status = (
                    str(monitoring_lookup.loc[code, "monitoring_reporting_status"])
                    if code in monitoring_lookup.index
                    else "missing_monitoring_dataset_row"
                )
                observed = status != "missing_monitoring_dataset_row"
                year = (
                    _number(monitoring_lookup.loc[code, "latest_monitoring_year"])
                    if observed
                    else np.nan
                )
                time_basis = "latest official monitoring reporting status"
            else:
                datasets = (
                    set(str(coverage_lookup.loc[code, "datasets"]).split())
                    if code in coverage_lookup.index
                    else set()
                )
                observed = feature.dataset_slug in datasets
                year = np.nan
                time_basis = "any baseline row represented in reviewed coverage table"
            rows.append(
                _feature_row(
                    lane="evidence_visibility",
                    code=code,
                    name=names[code],
                    feature_order=feature_order,
                    feature_id=feature.dataset_slug,
                    feature_label=feature.dataset_name,
                    feature_role="reporting_presence",
                    raw_value=float(observed),
                    display_value=float(observed) * 100,
                    unit="binary reporting presence",
                    latest_year=year,
                    time_basis=time_basis,
                    present=observed,
                    denominator="not applicable; binary reporting presence",
                    source_row_hash="not_applicable_aggregate_visibility",
                    caveat=(
                        "Reporting presence is a partial monitoring proxy, not preparedness."
                        if feature.dataset_slug == MONITORING_SLUG
                        else "Reporting presence describes evidence visibility, not conditions."
                    ),
                )
            )

    candidates = select_candidate_observations(observations)
    for slug in CANDIDATE_SLUGS:
        feature_order += 1
        group = candidates[candidates["dataset_slug"].eq(slug)]
        present_codes = set(group["geo_code"].astype(str))
        year_min = int(group["year"].min())
        year_max = int(group["year"].max())
        for code in codes:
            observed = code in present_codes
            rows.append(
                _feature_row(
                    lane="evidence_visibility",
                    code=code,
                    name=names[code],
                    feature_order=feature_order,
                    feature_id=slug,
                    feature_label=CANDIDATE_SPECS[slug]["short_label"],
                    feature_role=(
                        "reporting_visibility_only"
                        if slug == LOSS_SLUG
                        else "reporting_presence"
                    ),
                    raw_value=float(observed),
                    display_value=float(observed) * 100,
                    unit="binary reporting presence",
                    latest_year=np.nan,
                    time_basis=f"any returned row, {year_min}-{year_max}",
                    present=observed,
                    denominator="not applicable; binary reporting presence",
                    source_row_hash="not_applicable_aggregate_visibility",
                    caveat=(
                        "Direct-loss presence is reporting visibility only; "
                        "absence is not zero loss."
                        if slug == LOSS_SLUG
                        else "Reporting presence describes evidence visibility, not conditions."
                    ),
                )
            )
    return pd.DataFrame(rows)


def _feature_row(
    *,
    lane: str,
    code: str,
    name: str,
    feature_order: int,
    feature_id: str,
    feature_label: str,
    feature_role: str,
    raw_value: float,
    display_value: float,
    unit: str,
    latest_year: float,
    time_basis: str,
    present: bool,
    denominator: str,
    source_row_hash: object,
    caveat: str,
) -> dict[str, object]:
    return {
        "lane": lane,
        "geo_code": code,
        "geography_name": name,
        "feature_order": feature_order,
        "feature_id": feature_id,
        "feature_label": feature_label,
        "feature_role": feature_role,
        "raw_value": raw_value,
        "display_value": display_value,
        "unit": unit,
        "latest_year": latest_year,
        "time_basis": time_basis,
        "present": bool(present),
        "denominator": denominator,
        "source_row_hash": source_row_hash,
        "source": "Pacific Data Hub official SDMX rows",
        "caveat": caveat,
    }


def _seriation_order(rows: pd.DataFrame) -> list[str]:
    pivot = rows.pivot(index="geo_code", columns="feature_id", values="display_value").sort_index()
    values = pivot.to_numpy(dtype=float)
    distances = []
    for left, right in combinations(range(len(pivot)), 2):
        shared = np.isfinite(values[left]) & np.isfinite(values[right])
        if not shared.any():
            raise ValueError("Cannot order geographies with no shared observed feature")
        squared_difference = (values[left, shared] - values[right, shared]) ** 2
        distances.append(float(np.sqrt(np.mean(squared_difference))))
    tree = linkage(np.asarray(distances), method="average", optimal_ordering=True)
    return pivot.index[leaves_list(tree)].tolist()


def _add_order(rows: pd.DataFrame, order: list[str], lane: str) -> pd.DataFrame:
    output = rows.copy()
    positions = {code: position for position, code in enumerate(order, start=1)}
    output["order_position"] = output["geo_code"].map(positions).astype(int)
    output["ordering_method"] = (
        f"{lane}: average-linkage seriation over pairwise shared features; no imputation"
    )
    return output


def _distribution_summary(condition: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for feature_id, group in condition.groupby("feature_id", sort=False):
        observed = group[group["present"]].copy()
        values = observed["raw_value"].astype(float)
        years = observed["latest_year"].dropna().astype(int)
        first = group.iloc[0]
        rows.append(
            {
                "feature_order": int(first["feature_order"]),
                "feature_id": feature_id,
                "feature_label": first["feature_label"],
                "feature_role": first["feature_role"],
                "geography_count": int(len(observed)),
                "total_geography_count": TOTAL_GEOGRAPHIES,
                "missing_geography_count": TOTAL_GEOGRAPHIES - int(len(observed)),
                "unit": first["unit"],
                "denominator": first["denominator"],
                "latest_year_min": int(years.min()),
                "latest_year_max": int(years.max()),
                "minimum": float(values.min()),
                "p25": float(values.quantile(0.25)),
                "median": float(values.median()),
                "p75": float(values.quantile(0.75)),
                "maximum": float(values.max()),
                "time_basis": first["time_basis"],
                "source": first["source"],
                "caveat": first["caveat"],
                "display_rule": (
                    "Raw distribution summary; percentiles appear only in the condition "
                    "heatmap for display/order and are never averaged into a score."
                ),
            }
        )
    return pd.DataFrame(rows).sort_values("feature_order", kind="mergesort").reset_index(drop=True)


def _crosscurrents(
    codes: list[str], names: dict[str, str], observations: pd.DataFrame
) -> pd.DataFrame:
    candidates = select_candidate_observations(observations)
    changes = first_latest_changes(candidates).set_index(["dataset_slug", "geo_code"])
    rows = []
    for code in codes:
        water = _change_record(changes, WATER_SLUG, code)
        renewable = _change_record(changes, RENEWABLE_SLUG, code)
        complete = water is not None and renewable is not None
        rows.append(
            {
                "geo_code": code,
                "geography_name": names[code],
                "water_first_year": water["first_year"] if water else np.nan,
                "water_latest_year": water["latest_year"] if water else np.nan,
                "water_change_percentage_points": water["change"] if water else np.nan,
                "renewable_first_year": renewable["first_year"] if renewable else np.nan,
                "renewable_latest_year": renewable["latest_year"] if renewable else np.nan,
                "renewable_change_percentage_points": (
                    renewable["change"] if renewable else np.nan
                ),
                "complete_overlap": complete,
                "quadrant": (
                    _crosscurrent_quadrant(water["change"], renewable["change"])
                    if complete
                    else "missing_overlap"
                ),
                "time_basis": (
                    "first-to-latest returned percentage-point change within each indicator"
                ),
                "source": "Pacific Data Hub official SDMX rows",
                "caveat": (
                    "Descriptive cross-current only; endpoints and clocks differ and movement "
                    "is not attributed to climate or policy causes."
                ),
            }
        )
    return pd.DataFrame(rows)


def _change_record(
    changes: pd.DataFrame, slug: str, code: str
) -> dict[str, float | int] | None:
    if (slug, code) not in changes.index:
        return None
    row = changes.loc[(slug, code)]
    return {
        "first_year": int(row["first_year"]),
        "latest_year": int(row["latest_year"]),
        "change": float(row["change"]),
    }


def _crosscurrent_quadrant(water: float, renewable: float) -> str:
    if water > 0 and renewable < 0:
        return "water_up_renewable_down"
    if water > 0 and renewable > 0:
        return "both_up"
    if water < 0 and renewable < 0:
        return "both_down"
    if water < 0 and renewable > 0:
        return "water_down_renewable_up"
    return "flat_axis"


def _pairwise_relationships(
    codes: list[str],
    observations: pd.DataFrame,
    index: pd.DataFrame,
    indicator_trace: pd.DataFrame,
    coverage: pd.DataFrame,
    monitoring_gap: pd.DataFrame,
) -> pd.DataFrame:
    frame = pd.DataFrame(index=codes)
    index_lookup = index.assign(geo_code=index["geo_code"].astype(str)).set_index("geo_code")
    for column in ("adaptation_gap_score", "climate_pressure_score", "capacity_score"):
        frame[column] = pd.to_numeric(index_lookup[column], errors="coerce").reindex(codes)

    latest = latest_candidate_snapshot(observations)
    latest_pivot = latest.pivot(index="geo_code", columns="dataset_slug", values="comparison_value")
    for variable_id, slug in (
        ("water_latest_share", WATER_SLUG),
        ("renewable_latest_share", RENEWABLE_SLUG),
        ("projected_population_growth_latest", POPULATION_SLUG),
    ):
        frame[variable_id] = pd.to_numeric(latest_pivot.get(slug), errors="coerce").reindex(codes)

    coverage_lookup = coverage.assign(geo_code=coverage["geo_code"].astype(str)).set_index(
        "geo_code"
    )
    frame["baseline_dataset_count"] = pd.to_numeric(
        coverage_lookup["dataset_count"], errors="coerce"
    ).reindex(codes)
    monitoring_lookup = monitoring_gap.assign(
        geo_code=monitoring_gap["geo_code"].astype(str)
    ).set_index("geo_code")
    frame["monitoring_latest_count"] = pd.to_numeric(
        monitoring_lookup["monitoring_count"], errors="coerce"
    ).reindex(codes)
    missing_monitoring = (
        monitoring_lookup["monitoring_reporting_status"]
        .eq("missing_monitoring_dataset_row")
        .reindex(codes, fill_value=True)
    )
    frame.loc[missing_monitoring, "monitoring_latest_count"] = np.nan
    loss_codes = set(
        observations.loc[observations["dataset_slug"].eq(LOSS_SLUG), "geo_code"].astype(str)
    )
    frame["direct_loss_reporting_presence"] = [float(code in loss_codes) for code in codes]

    trace_years = pd.to_numeric(indicator_trace["latest_year"], errors="coerce").dropna()
    metadata = _relationship_metadata(latest, trace_years, coverage, monitoring_gap)
    dependencies = {
        "adaptation_gap_score": {
            "climate_pressure_score",
            "capacity_score",
            "monitoring_latest_count",
        },
        "climate_pressure_score": set(),
        "capacity_score": {"monitoring_latest_count"},
    }
    rows = []
    for left, right in combinations(metadata, 2):
        overlap = frame[[left, right]].dropna()
        pairwise_n = int(len(overlap))
        circular = right in dependencies.get(left, set()) or left in dependencies.get(right, set())
        if pairwise_n < MIN_PAIRWISE_N:
            rho = np.nan
            status = "withheld_underpowered"
        elif overlap[left].nunique() < 2 or overlap[right].nunique() < 2:
            rho = np.nan
            status = "withheld_no_variation"
        else:
            rho = round(float(overlap[left].corr(overlap[right], method="spearman")), 4)
            status = "reported_with_dependency_warning" if circular else "reported_descriptive"
        left_meta = metadata[left]
        right_meta = metadata[right]
        rows.append(
            {
                "pair_id": f"{left}__{right}",
                "variable_x": left,
                "variable_x_label": left_meta["label"],
                "variable_y": right,
                "variable_y_label": right_meta["label"],
                "spearman_rho": rho,
                "pairwise_n": pairwise_n,
                "minimum_pairwise_n": MIN_PAIRWISE_N,
                "relationship_status": status,
                "x_unit": left_meta["unit"],
                "y_unit": right_meta["unit"],
                "x_denominator": left_meta["denominator"],
                "y_denominator": right_meta["denominator"],
                "x_latest_year_min": left_meta["year_min"],
                "x_latest_year_max": left_meta["year_max"],
                "y_latest_year_min": right_meta["year_min"],
                "y_latest_year_max": right_meta["year_max"],
                "time_basis": f"X: {left_meta['time_basis']}; Y: {right_meta['time_basis']}",
                "circularity_flag": circular,
                "dependency_warning": _dependency_warning(left, right, circular),
                "source": "Pacific Data Hub official SDMX rows and derived TASK-003 index",
                "caveat": (
                    "Spearman relationship is descriptive, pairwise-complete, and non-causal; "
                    "withheld cells do not meet the declared overlap/variation rule."
                ),
            }
        )
    return pd.DataFrame(rows)


def _relationship_metadata(
    latest: pd.DataFrame,
    trace_years: pd.Series,
    coverage: pd.DataFrame,
    monitoring_gap: pd.DataFrame,
) -> dict[str, dict[str, object]]:
    def candidate(slug: str) -> tuple[int, int]:
        years = latest.loc[latest["dataset_slug"].eq(slug), "year"].astype(int)
        return int(years.min()), int(years.max())

    water_years = candidate(WATER_SLUG)
    renewable_years = candidate(RENEWABLE_SLUG)
    population_years = candidate(POPULATION_SLUG)
    monitoring_years = pd.to_numeric(
        monitoring_gap["latest_monitoring_year"], errors="coerce"
    ).dropna()
    return {
        "adaptation_gap_score": {
            "label": "Adaptation gap score (derived)",
            "unit": "0-100 derived score",
            "denominator": "not applicable; derived comparative score",
            "year_min": int(trace_years.min()),
            "year_max": int(trace_years.max()),
            "time_basis": "latest input rows; years vary",
        },
        "climate_pressure_score": {
            "label": "Climate pressure score (derived)",
            "unit": "0-100 derived score",
            "denominator": "not applicable; derived comparative score",
            "year_min": int(trace_years.min()),
            "year_max": int(trace_years.max()),
            "time_basis": "latest pressure-input rows; years vary",
        },
        "capacity_score": {
            "label": "Capacity proxy score (derived)",
            "unit": "0-100 derived score",
            "denominator": "not applicable; derived comparative score",
            "year_min": int(trace_years.min()),
            "year_max": int(trace_years.max()),
            "time_basis": "latest capacity-input rows; years vary",
        },
        "water_latest_share": {
            "label": "Safely managed water, latest",
            "unit": "percent",
            "denominator": CANDIDATE_SPECS[WATER_SLUG]["denominator"],
            "year_min": water_years[0],
            "year_max": water_years[1],
            "time_basis": f"latest returned {water_years[0]}-{water_years[1]}",
        },
        "renewable_latest_share": {
            "label": "Renewable energy share, latest",
            "unit": "percent",
            "denominator": CANDIDATE_SPECS[RENEWABLE_SLUG]["denominator"],
            "year_min": renewable_years[0],
            "year_max": renewable_years[1],
            "time_basis": f"latest returned {renewable_years[0]}-{renewable_years[1]}",
        },
        "projected_population_growth_latest": {
            "label": "Projected population growth, latest",
            "unit": "percent",
            "denominator": CANDIDATE_SPECS[POPULATION_SLUG]["denominator"],
            "year_min": population_years[0],
            "year_max": population_years[1],
            "time_basis": f"latest published estimate/projection {population_years[0]}",
        },
        "baseline_dataset_count": {
            "label": "Baseline datasets represented",
            "unit": "dataset count",
            "denominator": "not applicable; reviewed dataset count",
            "year_min": int(coverage["first_observation_year"].min()),
            "year_max": int(coverage["last_observation_year"].max()),
            "time_basis": "reviewed baseline coverage across all returned years",
        },
        "monitoring_latest_count": {
            "label": "Monitoring proxy, latest count",
            "unit": "reported count proxy",
            "denominator": "not supplied in processed official row",
            "year_min": int(monitoring_years.min()),
            "year_max": int(monitoring_years.max()),
            "time_basis": "latest returned monitoring row; missing rows remain missing",
        },
        "direct_loss_reporting_presence": {
            "label": "Direct-loss reporting presence",
            "unit": "binary reporting presence",
            "denominator": "not applicable; reporting-presence flag",
            "year_min": 2007,
            "year_max": 2020,
            "time_basis": "any recorded direct-loss row, 2007-2020; visibility only",
        },
    }


def _dependency_warning(left: str, right: str, circular: bool) -> str:
    if not circular:
        return "No direct formula dependency declared; interpretation remains non-causal."
    if {left, right} == {"adaptation_gap_score", "monitoring_latest_count"}:
        return (
            "Transitive derived-score lineage: monitoring latest count contributes to the "
            "capacity score, which contributes to the adaptation gap score; rho is not "
            "independent confirmation."
        )
    if {left, right} == {"capacity_score", "monitoring_latest_count"}:
        return (
            "Circular/derived dependency: monitoring latest count contributes to the derived "
            "capacity score; rho is not independent confirmation of capacity."
        )
    return (
        "Circular/derived dependency: one compared field contributes directly to the other; "
        "rho is not independent confirmation."
    )


def _cluster_stability(condition: pd.DataFrame, baseline_order: list[str]) -> pd.DataFrame:
    pivot = condition.pivot(index="geo_code", columns="feature_id", values="display_value")
    baseline_positions = {code: position for position, code in enumerate(baseline_order)}
    records: list[dict[str, object]] = [
        {
            "omitted_feature_id": "none_baseline",
            "feature_count": int(pivot.shape[1]),
            "position_spearman": 1.0,
            "maximum_position_shift": 0,
            "mean_absolute_position_shift": 0.0,
            "sensitivity_status": "baseline",
            "sensitivity_order": " ".join(baseline_order),
        }
    ]
    for feature_id in pivot.columns:
        reduced = condition[~condition["feature_id"].eq(feature_id)]
        order = _seriation_order(reduced)
        positions = {code: position for position, code in enumerate(order)}
        baseline = np.asarray([baseline_positions[code] for code in sorted(baseline_positions)])
        sensitivity = np.asarray([positions[code] for code in sorted(positions)])
        shifts = np.abs(baseline - sensitivity)
        rho = float(np.corrcoef(baseline, sensitivity)[0, 1])
        records.append(
            {
                "omitted_feature_id": feature_id,
                "feature_count": int(pivot.shape[1] - 1),
                "position_spearman": round(rho, 4),
                "maximum_position_shift": int(shifts.max()),
                "mean_absolute_position_shift": round(float(shifts.mean()), 4),
                "sensitivity_status": (
                    "stable_seriation"
                    if rho >= STABILITY_SPEARMAN_THRESHOLD
                    else "unstable_seriation"
                ),
                "sensitivity_order": " ".join(order),
            }
        )
    minimum_rho = min(record["position_spearman"] for record in records[1:])
    final_decision = (
        "retain_exploratory_seriation"
        if minimum_rho >= STABILITY_SPEARMAN_THRESHOLD
        else "reject_stable_regional_structure"
    )
    for record in records:
        record.update(
            {
                "analysis_lane": "measured_condition",
                "baseline_order": " ".join(baseline_order),
                "stability_spearman_threshold": STABILITY_SPEARMAN_THRESHOLD,
                "minimum_leave_one_spearman": minimum_rho,
                "ordering_decision": (
                    "retain_exploratory_seriation"
                    if record["omitted_feature_id"] == "none_baseline"
                    or record["position_spearman"] >= STABILITY_SPEARMAN_THRESHOLD
                    else "reject_stable_regional_structure"
                ),
                "overall_ordering_decision": final_decision,
                "public_grouping_decision": "reject_public_grouping",
                "cluster_labels_emitted": False,
                "method": (
                    "average-linkage seriation over NaN-aware pairwise shared-feature RMS "
                    "distance; no imputation"
                ),
                "caveat": (
                    "Exploratory row ordering only; no natural groups, readiness classes, "
                    "vulnerability types, or policy clusters are inferred."
                ),
            }
        )
    columns = [
        "analysis_lane",
        "omitted_feature_id",
        "feature_count",
        "position_spearman",
        "maximum_position_shift",
        "mean_absolute_position_shift",
        "sensitivity_status",
        "stability_spearman_threshold",
        "minimum_leave_one_spearman",
        "ordering_decision",
        "overall_ordering_decision",
        "public_grouping_decision",
        "cluster_labels_emitted",
        "baseline_order",
        "sensitivity_order",
        "method",
        "caveat",
    ]
    return pd.DataFrame(records)[columns]


def _geography_names(codes: list[str], monitoring_gap: pd.DataFrame) -> dict[str, str]:
    lookup = (
        monitoring_gap[["geo_code", "geography_name"]]
        .drop_duplicates("geo_code")
        .assign(geo_code=lambda frame: frame["geo_code"].astype(str))
        .set_index("geo_code")["geography_name"]
        .astype(str)
        .to_dict()
    )
    return {code: lookup.get(code, code) for code in codes}


def _condition_caveat(slug: str, pillar: str) -> str:
    if slug in {MONITORING_SLUG, "power-generation"} or slug.startswith("fisheries-"):
        return "Partial proxy only; it does not establish preparedness or adaptation readiness."
    if pillar == "responsibility_context":
        return "Responsibility context only; it is not a blame, vulnerability, or score input."
    return "Measured latest condition; descriptive, non-causal, and comparable within indicator."


def _indicator_denominator(slug: str) -> str:
    if slug == "greenhouse-gas-emissions-per-capita":
        return "population denominator implied by per-capita indicator; size not supplied"
    if slug in {
        "mean-sea-surface-temperature-anomalies",
        "mean-surface-temperature-anomalies",
        "rainfall-anomalies",
        "sea-level-anomalies",
    }:
        return "not applicable; published anomaly measure"
    return "not supplied in processed official row"


def _number(value: object) -> float:
    return float(pd.to_numeric(pd.Series([value]), errors="coerce").iloc[0])


def _unit(rows: pd.DataFrame) -> str:
    units = sorted(rows["unit"].dropna().astype(str).unique())
    return " ".join(units)
