"""Evidence fingerprint divergence helpers for official-data EDA artifacts."""

from __future__ import annotations

from itertools import combinations
import math
from pathlib import Path
from typing import Any, Iterable, Sequence

import pandas as pd


PRESSURE_PILLARS = {"climate_signal", "observed_stress"}
CAPACITY_PILLARS = {"adaptation_capacity"}
EXPECTED_PROFILE_PILLARS = ("adaptation_capacity", "climate_signal", "observed_stress")
JSD_LOG_BASE = 2
DIVERGENCE_CAVEAT = (
    "Similarity means official-data profiles look alike under this method; it does not "
    "mean the places share the same vulnerability, lived experience, or policy need."
)
ZERO_POLICY = (
    "JSD uses normalized nonnegative vectors. Zero components remain zero; smoothing is "
    "explicit and is not used for public artifacts unless a zero-total vector requires it."
)
COMPONENTS: tuple[tuple[str, str], ...] = (
    (
        "pressure",
        "Climate-pressure evidence from climate-signal and observed-stress scores.",
    ),
    (
        "capacity",
        "Visible adaptation-capacity evidence from scored capacity indicators.",
    ),
    (
        "data_visibility",
        "Relative amount of included official indicator evidence.",
    ),
    (
        "rank_fragility",
        "Rank movement under sensitivity checks, retained as uncertainty evidence.",
    ),
    (
        "missing_data",
        "Explicit missingness, data-desert, and partial-coverage status.",
    ),
    (
        "monitoring_reporting_gap",
        "Explicit reported-zero or missing monitoring-data status.",
    ),
)
FINGERPRINT_COMPONENT_COLUMNS = [f"fingerprint_{name}" for name, _ in COMPONENTS]
RAW_COMPONENT_COLUMNS = [f"component_{name}" for name, _ in COMPONENTS]


def normalize_vector(
    values: Sequence[Any],
    *,
    component_names: Sequence[str] | None = None,
    smoothing: float = 0.0,
) -> dict[str, float]:
    """Normalize nonnegative values into a distribution without implicit smoothing."""

    numbers = [_nonnegative_float(value) for value in values]
    if component_names is None:
        names = [f"component_{index + 1}" for index in range(len(numbers))]
    else:
        names = list(component_names)
    if len(names) != len(numbers):
        raise ValueError("component_names length must match values length")
    if smoothing < 0:
        raise ValueError("smoothing must be nonnegative")

    smoothed = [value + float(smoothing) for value in numbers]
    total = sum(smoothed)
    if total <= 0:
        raise ValueError("Cannot normalize vector with zero total without smoothing")
    return {name: value / total for name, value in zip(names, smoothed, strict=True)}


def jensen_shannon_divergence(
    left: Sequence[Any],
    right: Sequence[Any],
    *,
    log_base: float = JSD_LOG_BASE,
    smoothing: float = 0.0,
) -> float:
    """Return base-2 Jensen-Shannon divergence, bounded from 0 to 1."""

    if len(left) != len(right):
        raise ValueError("JSD vectors must have the same length")
    names = [f"component_{index + 1}" for index in range(len(left))]
    left_dist = list(
        normalize_vector(left, component_names=names, smoothing=smoothing).values()
    )
    right_dist = list(
        normalize_vector(right, component_names=names, smoothing=smoothing).values()
    )
    midpoint = [
        (left_value + right_value) / 2
        for left_value, right_value in zip(left_dist, right_dist, strict=True)
    ]
    jsd = 0.5 * _kl_divergence(left_dist, midpoint, log_base) + 0.5 * _kl_divergence(
        right_dist,
        midpoint,
        log_base,
    )
    if log_base == 2:
        return min(1.0, max(0.0, jsd))
    return max(0.0, jsd)


def build_evidence_fingerprints(
    *,
    country_drivers: pd.DataFrame,
    indicator_trace: pd.DataFrame,
    rank_volatility: pd.DataFrame,
    monitoring_gap: pd.DataFrame,
) -> pd.DataFrame:
    """Build one normalized official-data evidence fingerprint per geography."""

    _require_columns(country_drivers, ["geo_code"], "country_drivers")
    drivers = country_drivers.copy()
    trace_summary = _trace_summary(indicator_trace)
    rank_summary = _rank_summary(rank_volatility)
    monitoring_summary = _monitoring_summary(monitoring_gap)

    fingerprints = (
        drivers.merge(trace_summary, on="geo_code", how="left")
        .merge(rank_summary, on="geo_code", how="left", suffixes=("", "_rank"))
        .merge(monitoring_summary, on="geo_code", how="left")
    )
    for column in (
        "adaptation_gap_score",
        "climate_pressure_score",
        "capacity_score",
        "included_indicator_count",
        "rank_range",
        "pressure_indicator_mean",
        "capacity_indicator_mean",
        "scored_indicator_count",
    ):
        if column not in fingerprints:
            fingerprints[column] = pd.NA
        fingerprints[column] = pd.to_numeric(fingerprints[column], errors="coerce")

    max_indicator_count = _positive_max(fingerprints["included_indicator_count"])
    max_rank_range = _positive_max(fingerprints["rank_range"])

    fingerprints["component_pressure"] = fingerprints.apply(_pressure_component, axis=1)
    fingerprints["component_capacity"] = fingerprints.apply(_capacity_component, axis=1)
    fingerprints["component_data_visibility"] = (
        fingerprints["included_indicator_count"].fillna(0).clip(lower=0)
        / max_indicator_count
        * 100
    )
    fingerprints["component_rank_fragility"] = (
        fingerprints["rank_range"].fillna(0).clip(lower=0) / max_rank_range * 100
    )
    fingerprints["component_missing_data"] = fingerprints.apply(_missing_component, axis=1)
    fingerprints["component_monitoring_reporting_gap"] = fingerprints.apply(
        _monitoring_component,
        axis=1,
    )

    for index, row in fingerprints.iterrows():
        if sum(_nonnegative_float(row[column]) for column in RAW_COMPONENT_COLUMNS) <= 0:
            fingerprints.loc[index, "component_missing_data"] = 100.0

    normalized_rows = []
    component_names = [name for name, _ in COMPONENTS]
    for _, row in fingerprints.iterrows():
        normalized = normalize_vector(
            [row[column] for column in RAW_COMPONENT_COLUMNS],
            component_names=component_names,
        )
        normalized_rows.append(normalized)
    normalized_frame = pd.DataFrame(normalized_rows).rename(
        columns={name: f"fingerprint_{name}" for name in component_names}
    )
    fingerprints = pd.concat(
        [fingerprints.reset_index(drop=True), normalized_frame.reset_index(drop=True)],
        axis=1,
    )
    fingerprints["fingerprint_total"] = fingerprints[FINGERPRINT_COMPONENT_COLUMNS].sum(axis=1)
    fingerprints["fingerprint_total"] = fingerprints["fingerprint_total"].round(10)
    for column in RAW_COMPONENT_COLUMNS + FINGERPRINT_COMPONENT_COLUMNS:
        fingerprints[column] = pd.to_numeric(fingerprints[column], errors="coerce").round(10)

    fingerprints["component_labels"] = " ".join(component_names)
    fingerprints["jsd_log_base"] = JSD_LOG_BASE
    fingerprints["zero_smoothing_policy"] = ZERO_POLICY
    fingerprints["divergence_caveat"] = DIVERGENCE_CAVEAT
    fingerprints["missingness_status"] = fingerprints.apply(_missingness_status, axis=1)

    columns = [
        "geo_code",
        "geography_name",
        "subregion",
        "score_status",
        "adaptation_gap_rank",
        "adaptation_gap_score",
        "climate_pressure_score",
        "capacity_score",
        "included_indicator_count",
        "scored_indicator_count",
        "pressure_indicator_count",
        "capacity_indicator_count",
        "available_profile_pillars",
        "missing_profile_pillars",
        "rank_range",
        "robustness_label",
        "coverage_flag",
        "missingness_status",
        "monitoring_reporting_status",
        "monitoring_coverage_tier",
        "monitoring_count",
        "monitoring_observation_count",
        *RAW_COMPONENT_COLUMNS,
        *FINGERPRINT_COMPONENT_COLUMNS,
        "fingerprint_total",
        "component_labels",
        "jsd_log_base",
        "zero_smoothing_policy",
        "divergence_caveat",
    ]
    return (
        _ensure_columns(fingerprints, columns)[columns]
        .sort_values(
            ["adaptation_gap_rank", "geo_code"],
            kind="mergesort",
            na_position="last",
        )
        .reset_index(drop=True)
    )


def build_pairwise_jsd(
    fingerprints: pd.DataFrame,
    *,
    component_columns: Sequence[str] | None = None,
) -> pd.DataFrame:
    """Build unordered pairwise base-2 JSD rows for geography fingerprints."""

    columns = list(
        component_columns
        or [column for column in FINGERPRINT_COMPONENT_COLUMNS if column in fingerprints.columns]
    )
    if not columns:
        raise ValueError("fingerprints must include at least one fingerprint component column")
    _require_columns(fingerprints, ["geo_code", *columns], "fingerprints")
    rows: list[dict[str, object]] = []
    ordered = fingerprints.sort_values("geo_code", kind="mergesort").reset_index(drop=True)
    for left_index, right_index in combinations(range(len(ordered)), 2):
        left = ordered.iloc[left_index]
        right = ordered.iloc[right_index]
        left_vector = [left[column] for column in columns]
        right_vector = [right[column] for column in columns]
        jsd = jensen_shannon_divergence(left_vector, right_vector)
        largest_difference = _largest_component_difference(left, right, columns)
        rows.append(
            {
                "geo_code_a": left["geo_code"],
                "geo_code_b": right["geo_code"],
                "jsd_distance": round(jsd, 10),
                "jsd_log_base": JSD_LOG_BASE,
                "similarity_band": _similarity_band(jsd),
                "largest_component_difference": largest_difference,
                "component_difference_summary": _difference_summary(largest_difference),
                "pairwise_convention": "unordered_geo_code_pairs",
                "divergence_caveat": DIVERGENCE_CAVEAT,
            }
        )
    return pd.DataFrame(
        rows,
        columns=[
            "geo_code_a",
            "geo_code_b",
            "jsd_distance",
            "jsd_log_base",
            "similarity_band",
            "largest_component_difference",
            "component_difference_summary",
            "pairwise_convention",
            "divergence_caveat",
        ],
    ).sort_values(["geo_code_a", "geo_code_b"], kind="mergesort").reset_index(drop=True)


def build_similarity_neighbors(
    pairwise_jsd: pd.DataFrame,
    fingerprints: pd.DataFrame,
    *,
    neighbor_count: int = 3,
) -> pd.DataFrame:
    """Build nearest-neighbor rows for each selected geography anchor."""

    _require_columns(
        pairwise_jsd,
        ["geo_code_a", "geo_code_b", "jsd_distance", "similarity_band"],
        "pairwise_jsd",
    )
    metadata = _fingerprint_metadata(fingerprints)
    directed_rows: list[dict[str, object]] = []
    for _, row in pairwise_jsd.iterrows():
        directed_rows.append(_neighbor_row(row, row["geo_code_a"], row["geo_code_b"], metadata))
        directed_rows.append(_neighbor_row(row, row["geo_code_b"], row["geo_code_a"], metadata))
    directed = pd.DataFrame(directed_rows)
    if directed.empty:
        return pd.DataFrame(
            columns=[
                "geo_code",
                "neighbor_geo_code",
                "similarity_rank",
                "jsd_distance",
                "jsd_log_base",
                "similarity_band",
                "anchor_primary_component",
                "neighbor_primary_component",
                "reason_label",
                "anchor_missingness_status",
                "neighbor_missingness_status",
                "anchor_monitoring_reporting_status",
                "neighbor_monitoring_reporting_status",
                "neighbor_caveat",
            ]
        )

    directed = directed.sort_values(
        ["geo_code", "jsd_distance", "neighbor_geo_code"],
        kind="mergesort",
    ).reset_index(drop=True)
    directed["similarity_rank"] = directed.groupby("geo_code").cumcount() + 1
    directed = directed[directed["similarity_rank"] <= neighbor_count].copy()
    columns = [
        "geo_code",
        "neighbor_geo_code",
        "similarity_rank",
        "jsd_distance",
        "jsd_log_base",
        "similarity_band",
        "anchor_primary_component",
        "neighbor_primary_component",
        "reason_label",
        "anchor_missingness_status",
        "neighbor_missingness_status",
        "anchor_monitoring_reporting_status",
        "neighbor_monitoring_reporting_status",
        "neighbor_caveat",
    ]
    return directed[columns].reset_index(drop=True)


def build_divergence_artifacts(
    *,
    country_drivers: pd.DataFrame,
    indicator_trace: pd.DataFrame,
    rank_volatility: pd.DataFrame,
    monitoring_gap: pd.DataFrame,
    neighbor_count: int = 3,
) -> dict[str, pd.DataFrame]:
    """Build all TASK-019 divergence tables."""

    fingerprints = build_evidence_fingerprints(
        country_drivers=country_drivers,
        indicator_trace=indicator_trace,
        rank_volatility=rank_volatility,
        monitoring_gap=monitoring_gap,
    )
    pairwise = build_pairwise_jsd(fingerprints)
    neighbors = build_similarity_neighbors(pairwise, fingerprints, neighbor_count=neighbor_count)
    return {
        "eda_evidence_fingerprints.csv": fingerprints,
        "eda_pairwise_jsd.csv": pairwise,
        "eda_similarity_neighbors.csv": neighbors,
    }


def build_divergence_summary(
    *,
    fingerprints: pd.DataFrame,
    pairwise_jsd: pd.DataFrame,
    similarity_neighbors: pd.DataFrame,
    input_paths: dict[str, Path] | None = None,
    output_paths: dict[str, Path] | None = None,
    root: Path | None = None,
) -> dict[str, object]:
    """Build provenance metadata for evidence fingerprint divergence artifacts."""

    exemplars = ["NR", "TV", "PN", "AS", "WF", "MH"]
    return {
        "schema_version": 1,
        "pipeline_task": "TASK-019",
        "status": "evidence_fingerprint_divergence_ready",
        "method": {
            "public_metric": "Jensen-Shannon divergence",
            "jsd_log_base": JSD_LOG_BASE,
            "jsd_bounds": [0, 1],
            "pairwise_convention": "unordered_geo_code_pairs",
            "smoothing": "none for public JSD artifacts; zero components remain visible",
            "kl_public_status": "not_required",
        },
        "components": [
            {"component": name, "definition": definition} for name, definition in COMPONENTS
        ],
        "inputs": _relative_paths(input_paths or {}, root),
        "outputs": _relative_paths(output_paths or {}, root),
        "row_counts": {
            "eda_evidence_fingerprints.csv": int(len(fingerprints)),
            "eda_pairwise_jsd.csv": int(len(pairwise_jsd)),
            "eda_similarity_neighbors.csv": int(len(similarity_neighbors)),
        },
        "geography_count": (
            int(fingerprints["geo_code"].nunique()) if "geo_code" in fingerprints else 0
        ),
        "pairwise_distance": {
            "min": _summary_number(pairwise_jsd.get("jsd_distance"), "min"),
            "max": _summary_number(pairwise_jsd.get("jsd_distance"), "max"),
            "mean": _summary_number(pairwise_jsd.get("jsd_distance"), "mean"),
        },
        "similarity_band_counts": (
            pairwise_jsd["similarity_band"].value_counts().sort_index().to_dict()
            if "similarity_band" in pairwise_jsd
            else {}
        ),
        "missingness_status_counts": (
            fingerprints["missingness_status"].value_counts().sort_index().to_dict()
            if "missingness_status" in fingerprints
            else {}
        ),
        "exemplar_neighbors": _exemplar_neighbors(similarity_neighbors, exemplars),
        "caveats": [
            DIVERGENCE_CAVEAT,
            "JSD compares normalized evidence patterns; it does not explain causality.",
            "Sparse or missing data can make profiles look similar for the wrong reason.",
            "Do not read nearest neighbors as clusters of identical needs.",
            "KL divergence is not required for public UI interpretation.",
        ],
    }


def _kl_divergence(left: Sequence[float], right: Sequence[float], log_base: float) -> float:
    total = 0.0
    for left_value, right_value in zip(left, right, strict=True):
        if left_value == 0:
            continue
        if right_value == 0:
            return math.inf
        total += left_value * math.log(left_value / right_value, log_base)
    return total


def _trace_summary(indicator_trace: pd.DataFrame) -> pd.DataFrame:
    columns = [
        "geo_code",
        "scored_indicator_count",
        "pressure_indicator_count",
        "capacity_indicator_count",
        "pressure_indicator_mean",
        "capacity_indicator_mean",
        "available_profile_pillars",
        "missing_profile_pillars",
    ]
    if indicator_trace is None or indicator_trace.empty:
        return pd.DataFrame(columns=columns)
    _require_columns(indicator_trace, ["geo_code", "pillar", "indicator_score"], "indicator_trace")
    trace = indicator_trace.copy()
    trace["pillar"] = trace["pillar"].fillna("").astype(str)
    trace["indicator_score"] = pd.to_numeric(trace["indicator_score"], errors="coerce")
    trace = trace[trace["indicator_score"].notna()].copy()
    rows = []
    for geo_code, group in trace.groupby("geo_code", sort=True):
        pressure = group[group["pillar"].isin(PRESSURE_PILLARS)]
        capacity = group[group["pillar"].isin(CAPACITY_PILLARS)]
        pillars = sorted(
            set(group.loc[group["pillar"].isin(EXPECTED_PROFILE_PILLARS), "pillar"].tolist())
        )
        missing_pillars = [
            pillar for pillar in EXPECTED_PROFILE_PILLARS if pillar not in set(pillars)
        ]
        rows.append(
            {
                "geo_code": geo_code,
                "scored_indicator_count": int(len(pressure) + len(capacity)),
                "pressure_indicator_count": int(len(pressure)),
                "capacity_indicator_count": int(len(capacity)),
                "pressure_indicator_mean": _mean_or_na(pressure["indicator_score"]),
                "capacity_indicator_mean": _mean_or_na(capacity["indicator_score"]),
                "available_profile_pillars": " ".join(pillars),
                "missing_profile_pillars": " ".join(missing_pillars),
            }
        )
    return pd.DataFrame(rows, columns=columns)


def _rank_summary(rank_volatility: pd.DataFrame) -> pd.DataFrame:
    columns = ["geo_code", "rank_range", "robustness_label"]
    if rank_volatility is None or rank_volatility.empty or "geo_code" not in rank_volatility:
        return pd.DataFrame(columns=columns)
    rank = rank_volatility.copy()
    for column in columns:
        if column not in rank:
            rank[column] = pd.NA
    return rank[columns].drop_duplicates("geo_code", keep="first")


def _monitoring_summary(monitoring_gap: pd.DataFrame) -> pd.DataFrame:
    columns = [
        "geo_code",
        "geography_name",
        "subregion",
        "monitoring_reporting_status",
        "monitoring_coverage_tier",
        "monitoring_count",
        "monitoring_observation_count",
    ]
    if monitoring_gap is None or monitoring_gap.empty or "geo_code" not in monitoring_gap:
        return pd.DataFrame(columns=columns)
    monitoring = monitoring_gap.copy()
    for column in columns:
        if column not in monitoring:
            monitoring[column] = pd.NA
    return monitoring[columns].drop_duplicates("geo_code", keep="first")


def _pressure_component(row: pd.Series) -> float:
    return _first_numeric(row, ["pressure_indicator_mean", "climate_pressure_score"])


def _capacity_component(row: pd.Series) -> float:
    return _first_numeric(row, ["capacity_indicator_mean", "capacity_score"])


def _missing_component(row: pd.Series) -> float:
    coverage_flag = str(row.get("coverage_flag", "")).lower()
    missingness = 0.0
    if _bool_value(row.get("data_desert_flag")) or "data_desert" in coverage_flag:
        missingness = max(missingness, 100.0)
    elif _bool_value(row.get("missingness_flag")) or "partial" in coverage_flag:
        missingness = max(missingness, 50.0)

    missing_pillars = str(row.get("missing_profile_pillars", "") or "").split()
    if missing_pillars:
        missingness = max(
            missingness,
            len(missing_pillars) / len(EXPECTED_PROFILE_PILLARS) * 100,
        )
    return missingness


def _monitoring_component(row: pd.Series) -> float:
    status = str(row.get("monitoring_reporting_status", "")).lower()
    if status == "missing_monitoring_dataset_row" or _bool_value(row.get("monitoring_missing")):
        return 100.0
    if status == "reported_zero_latest_count":
        return 70.0
    return 0.0


def _missingness_status(row: pd.Series) -> str:
    if _nonnegative_float(row.get("component_missing_data")) >= 100:
        return "data_desert_or_missing_pillars"
    if _nonnegative_float(row.get("component_missing_data")) > 0:
        return "partial_or_thin_profile"
    return "profile_components_present"


def _fingerprint_metadata(fingerprints: pd.DataFrame) -> dict[str, dict[str, object]]:
    metadata: dict[str, dict[str, object]] = {}
    for _, row in fingerprints.iterrows():
        geo_code = str(row["geo_code"])
        metadata[geo_code] = {
            "primary_component": _primary_component(row),
            "missingness_status": row.get("missingness_status", ""),
            "monitoring_reporting_status": row.get("monitoring_reporting_status", ""),
        }
    return metadata


def _neighbor_row(
    pair: pd.Series,
    anchor: str,
    neighbor: str,
    metadata: dict[str, dict[str, object]],
) -> dict[str, object]:
    anchor_meta = metadata.get(str(anchor), {})
    neighbor_meta = metadata.get(str(neighbor), {})
    anchor_component = str(anchor_meta.get("primary_component", "unknown"))
    neighbor_component = str(neighbor_meta.get("primary_component", "unknown"))
    return {
        "geo_code": anchor,
        "neighbor_geo_code": neighbor,
        "jsd_distance": pair["jsd_distance"],
        "jsd_log_base": JSD_LOG_BASE,
        "similarity_band": pair["similarity_band"],
        "anchor_primary_component": anchor_component,
        "neighbor_primary_component": neighbor_component,
        "reason_label": _neighbor_reason(anchor_component, neighbor_component),
        "anchor_missingness_status": anchor_meta.get("missingness_status", ""),
        "neighbor_missingness_status": neighbor_meta.get("missingness_status", ""),
        "anchor_monitoring_reporting_status": anchor_meta.get(
            "monitoring_reporting_status",
            "",
        ),
        "neighbor_monitoring_reporting_status": neighbor_meta.get(
            "monitoring_reporting_status",
            "",
        ),
        "neighbor_caveat": DIVERGENCE_CAVEAT,
    }


def _primary_component(row: pd.Series) -> str:
    component_values = {
        name: _nonnegative_float(row.get(f"fingerprint_{name}")) for name, _ in COMPONENTS
    }
    return sorted(component_values.items(), key=lambda item: (-item[1], item[0]))[0][0]


def _neighbor_reason(anchor_component: str, neighbor_component: str) -> str:
    if anchor_component == neighbor_component:
        return f"Both profiles lean most toward {anchor_component} evidence."
    return (
        f"Selected profile leans toward {anchor_component}; neighbor leans toward "
        f"{neighbor_component}."
    )


def _largest_component_difference(
    left: pd.Series,
    right: pd.Series,
    columns: Sequence[str],
) -> str:
    differences = []
    for column in columns:
        label = column.removeprefix("fingerprint_")
        differences.append(
            (
                label,
                abs(_nonnegative_float(left[column]) - _nonnegative_float(right[column])),
            )
        )
    return sorted(differences, key=lambda item: (-item[1], item[0]))[0][0]


def _difference_summary(component: str) -> str:
    return f"Largest normalized profile difference is {component}."


def _similarity_band(jsd: float) -> str:
    if jsd <= 0.05:
        return "very_similar_profile"
    if jsd <= 0.15:
        return "similar_profile"
    if jsd <= 0.3:
        return "different_profile"
    return "highly_different_profile"


def _exemplar_neighbors(
    similarity_neighbors: pd.DataFrame,
    exemplars: Iterable[str],
) -> dict[str, list[dict[str, object]]]:
    if similarity_neighbors.empty or "geo_code" not in similarity_neighbors:
        return {}
    rows: dict[str, list[dict[str, object]]] = {}
    for geo_code in exemplars:
        subset = similarity_neighbors[similarity_neighbors["geo_code"] == geo_code].head(3)
        if subset.empty:
            continue
        rows[geo_code] = [
            {
                "neighbor_geo_code": row["neighbor_geo_code"],
                "similarity_rank": int(row["similarity_rank"]),
                "jsd_distance": float(row["jsd_distance"]),
                "similarity_band": row["similarity_band"],
                "reason_label": row["reason_label"],
            }
            for _, row in subset.iterrows()
        ]
    return rows


def _relative_paths(paths: dict[str, Path], root: Path | None) -> dict[str, str]:
    relative: dict[str, str] = {}
    for name, path in paths.items():
        path = Path(path)
        if root is not None:
            try:
                relative[name] = path.relative_to(root).as_posix()
                continue
            except ValueError:
                pass
        relative[name] = path.as_posix()
    return relative


def _summary_number(series: pd.Series | None, operation: str) -> float | None:
    if series is None:
        return None
    numeric = pd.to_numeric(series, errors="coerce").dropna()
    if numeric.empty:
        return None
    if operation == "min":
        return round(float(numeric.min()), 10)
    if operation == "max":
        return round(float(numeric.max()), 10)
    if operation == "mean":
        return round(float(numeric.mean()), 10)
    raise ValueError(f"Unsupported summary operation: {operation}")


def _mean_or_na(series: pd.Series) -> float | object:
    numeric = pd.to_numeric(series, errors="coerce").dropna()
    if numeric.empty:
        return pd.NA
    return float(numeric.mean())


def _positive_max(series: pd.Series) -> float:
    numeric = pd.to_numeric(series, errors="coerce").dropna()
    if numeric.empty or numeric.max() <= 0:
        return 1.0
    return float(numeric.max())


def _first_numeric(row: pd.Series, columns: Sequence[str]) -> float:
    for column in columns:
        value = pd.to_numeric(pd.Series([row.get(column)]), errors="coerce").iloc[0]
        if not pd.isna(value):
            return max(0.0, float(value))
    return 0.0


def _nonnegative_float(value: Any) -> float:
    if value is None or pd.isna(value):
        return 0.0
    number = float(value)
    if number < 0:
        raise ValueError("Vector components must be nonnegative")
    return number


def _bool_value(value: Any) -> bool:
    if value is None or pd.isna(value):
        return False
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y"}
    return bool(value)


def _require_columns(frame: pd.DataFrame, columns: Sequence[str], frame_name: str) -> None:
    missing = sorted(set(columns).difference(frame.columns))
    if missing:
        raise ValueError(f"{frame_name} is missing columns: {missing}")


def _ensure_columns(frame: pd.DataFrame, columns: Sequence[str]) -> pd.DataFrame:
    output = frame.copy()
    for column in columns:
        if column not in output:
            output[column] = pd.NA
    return output
