"""Build app-ready atlas data from processed analysis artifacts."""

from __future__ import annotations

from collections import Counter
from typing import Any

import pandas as pd

GEOGRAPHY_REFERENCE: dict[str, dict[str, float | str]] = {
    "AS": {"name": "American Samoa", "lon": -170.7, "lat": -14.3},
    "CK": {"name": "Cook Islands", "lon": -159.8, "lat": -21.2},
    "FJ": {"name": "Fiji", "lon": 178.1, "lat": -17.7},
    "FM": {"name": "Federated States of Micronesia", "lon": 158.2, "lat": 6.9},
    "GU": {"name": "Guam", "lon": 144.8, "lat": 13.4},
    "KI": {"name": "Kiribati", "lon": -157.4, "lat": 1.9},
    "MH": {"name": "Marshall Islands", "lon": 171.2, "lat": 7.1},
    "MP": {"name": "Northern Mariana Islands", "lon": 145.7, "lat": 15.1},
    "NC": {"name": "New Caledonia", "lon": 165.6, "lat": -21.3},
    "NR": {"name": "Nauru", "lon": 166.9, "lat": -0.5},
    "NU": {"name": "Niue", "lon": -169.9, "lat": -19.1},
    "PF": {"name": "French Polynesia", "lon": -149.4, "lat": -17.7},
    "PG": {"name": "Papua New Guinea", "lon": 145.0, "lat": -6.3},
    "PN": {"name": "Pitcairn", "lon": -128.3, "lat": -24.4},
    "PW": {"name": "Palau", "lon": 134.6, "lat": 7.5},
    "SB": {"name": "Solomon Islands", "lon": 160.2, "lat": -9.6},
    "TK": {"name": "Tokelau", "lon": -171.8, "lat": -9.2},
    "TO": {"name": "Tonga", "lon": -175.2, "lat": -21.2},
    "TV": {"name": "Tuvalu", "lon": 179.2, "lat": -8.5},
    "VU": {"name": "Vanuatu", "lon": 167.7, "lat": -16.2},
    "WF": {"name": "Wallis and Futuna", "lon": -176.2, "lat": -13.8},
    "WS": {"name": "Samoa", "lon": -172.1, "lat": -13.8},
}

SOURCE_REFS = {
    "index": "artifacts/tables/adaptation_gap_index.csv",
    "indicator_trace": "artifacts/tables/adaptation_gap_indicator_trace.csv",
    "outlook": "artifacts/tables/adaptation_gap_outlook.csv",
    "geography_lookup": "data/processed/geography_lookup.csv",
    "monitoring_gap": "artifacts/tables/eda_monitoring_gap.csv",
    "rank_volatility": "artifacts/tables/eda_rank_volatility.csv",
    "country_story_labels": "artifacts/tables/eda_country_story_labels.csv",
    "spatial_typologies": "artifacts/tables/eda_spatial_typologies.csv",
    "outlook_interpretation": "artifacts/tables/eda_outlook_interpretation.csv",
    "similarity_neighbors": "artifacts/tables/eda_similarity_neighbors.csv",
    "regional_crosscurrents": "artifacts/tables/eda_regional_crosscurrents.csv",
    "regional_feature_matrix": "artifacts/tables/eda_regional_feature_matrix.csv",
}

SCORE_INPUT_PILLAR_ORDER = {
    "climate_signal": 0,
    "observed_stress": 1,
    "adaptation_capacity": 2,
}


def build_geography_records(
    *,
    index: pd.DataFrame,
    lookup: pd.DataFrame,
    outlook: pd.DataFrame,
    monitoring: pd.DataFrame | None = None,
    rank: pd.DataFrame | None = None,
    story: pd.DataFrame | None = None,
    spatial: pd.DataFrame | None = None,
    outlook_display: pd.DataFrame | None = None,
    similarity_neighbors: pd.DataFrame | None = None,
    trace: pd.DataFrame | None = None,
    regional_crosscurrents: pd.DataFrame | None = None,
    regional_feature_matrix: pd.DataFrame | None = None,
) -> list[dict[str, Any]]:
    """Join score, coverage, centroid, and outlook fields into app geography records."""

    lookup_by_geo = lookup.set_index("geo_code").to_dict(orient="index") if not lookup.empty else {}
    outlook_by_geo = _build_outlook_lookup(outlook)
    monitoring_by_geo = _lookup_by_geo(monitoring)
    rank_by_geo = _lookup_by_geo(rank)
    story_by_geo = _lookup_by_geo(story)
    spatial_by_geo = _lookup_by_geo(spatial)
    outlook_display_by_geo = _build_outlook_display_lookup(outlook_display)
    similarity_by_geo = _build_similarity_lookup(similarity_neighbors)
    score_input_presence_by_geo = build_score_input_presence(trace)
    regional_crosscurrents_by_geo = _lookup_by_geo(regional_crosscurrents)
    visibility_by_geo = _build_regional_visibility_lookup(regional_feature_matrix)
    records: list[dict[str, Any]] = []

    for row in index.sort_values("geo_code", kind="mergesort").to_dict(orient="records"):
        geo_code = str(row["geo_code"])
        reference = GEOGRAPHY_REFERENCE.get(geo_code, {"name": geo_code, "lon": None, "lat": None})
        coverage = lookup_by_geo.get(geo_code, {})
        geo_outlook = outlook_by_geo.get(geo_code, {})
        record = {
            "geo_code": geo_code,
            "geography_code": geo_code,
            "name": reference["name"],
            "geography_name": reference["name"],
            "centroid": {"lon": reference["lon"], "lat": reference["lat"]},
            "geometry_status": "centroid_fallback",
            "score_status": _clean_text(row.get("score_status")),
            "adaptation_gap_score": _nullable_float(row.get("adaptation_gap_score")),
            "climate_pressure_score": _nullable_float(row.get("climate_pressure_score")),
            "capacity_score": _nullable_float(row.get("capacity_score")),
            "raw_gap_difference": _nullable_float(row.get("raw_gap_difference")),
            "outlook_2030_flat_gap_score": _lookup_outlook_gap(
                geo_outlook, horizon="2030", scenario="capacity_flat"
            ),
            "outlook_2050_flat_gap_score": _lookup_outlook_gap(
                geo_outlook, horizon="2050", scenario="capacity_flat"
            ),
            "available_pillars": _clean_text(row.get("available_pillars")),
            "missing_pillars": _clean_text(row.get("missing_pillars")),
            "score_input_indicator_count": _nullable_int(row.get("score_input_indicator_count")),
            "context_indicator_count": _nullable_int(row.get("context_indicator_count")),
            "trace_indicator_count": _nullable_int(row.get("trace_indicator_count")),
            "score_input_presence": score_input_presence_by_geo.get(geo_code, []),
            "missingness_flag": _bool(row.get("missingness_flag")),
            "dataset_count": _nullable_int(coverage.get("dataset_count")),
            "row_count": _nullable_int(coverage.get("row_count")),
            "first_year": _nullable_int(coverage.get("first_year")),
            "last_year": _nullable_int(coverage.get("last_year")),
            "datasets": _clean_text(coverage.get("datasets")),
            "outlook": geo_outlook,
            "monitoring": _build_monitoring_payload(monitoring_by_geo.get(geo_code, {})),
            "rank": _build_rank_payload(rank_by_geo.get(geo_code, {})),
            "story": _build_story_payload(story_by_geo.get(geo_code, {})),
            "context": _build_context_payload(spatial_by_geo.get(geo_code, {})),
            "outlook_display": outlook_display_by_geo.get(geo_code, {}),
            "similarity_neighbors": similarity_by_geo.get(geo_code, []),
            "regional_story": _build_regional_story_payload(
                regional_crosscurrents_by_geo.get(geo_code, {}),
                visibility_by_geo.get(geo_code, []),
            ),
            "source_refs": SOURCE_REFS.copy(),
        }
        records.append(record)

    return records


def summarize_regional_story(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Summarize the exported regional-story contract for provenance."""

    stories = [record.get("regional_story", {}) for record in records]
    complete = [story for story in stories if story.get("complete_overlap") is True]
    visibility = [position for story in stories for position in story.get("visibility", [])]
    return {
        "geography_count": len(records),
        "complete_comparison_count": len(complete),
        "incomplete_geo_codes": sorted(
            str(record["geo_code"])
            for record in records
            if record.get("regional_story", {}).get("complete_overlap") is not True
        ),
        "quadrant_counts": dict(
            sorted(Counter(str(story.get("quadrant")) for story in complete).items())
        ),
        "visibility_positions_per_geography": sorted(
            {len(story.get("visibility", [])) for story in stories}
        ),
        "visibility_present_count": sum(position.get("present") is True for position in visibility),
        "visibility_absent_count": sum(position.get("present") is False for position in visibility),
    }


def build_geographies_payload(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Build the app JSON geography payload."""

    return {
        "schema_version": 2,
        "geometry_policy": "centroid_fallback_until_boundary_join",
        "geographies": records,
        "source_refs": SOURCE_REFS.copy(),
    }


def build_score_input_presence(trace: pd.DataFrame | None) -> dict[str, list[dict[str, Any]]]:
    """Build a stable score-input universe and geography-level presence flags."""

    fields = ["dataset_slug", "dataset_name", "pillar", "geo_code"]
    if trace is None or trace.empty or any(field not in trace.columns for field in fields):
        return {}

    inputs = trace[trace["pillar"].isin(SCORE_INPUT_PILLAR_ORDER)].copy()
    universe = (
        inputs[["dataset_slug", "dataset_name", "pillar"]]
        .drop_duplicates()
        .assign(pillar_order=lambda frame: frame["pillar"].map(SCORE_INPUT_PILLAR_ORDER))
        .sort_values(["pillar_order", "dataset_name", "dataset_slug"], kind="mergesort")
    )
    present = set(
        zip(
            inputs["geo_code"].astype(str),
            inputs["dataset_slug"].astype(str),
            strict=False,
        )
    )
    geographies = sorted(trace["geo_code"].dropna().astype(str).unique())
    return {
        geo_code: [
            {
                "dataset_slug": str(row.dataset_slug),
                "dataset_name": str(row.dataset_name),
                "pillar": str(row.pillar),
                "present": (geo_code, str(row.dataset_slug)) in present,
            }
            for row in universe.itertuples(index=False)
        ]
        for geo_code in geographies
    }


def _build_regional_visibility_lookup(
    feature_matrix: pd.DataFrame | None,
) -> dict[str, list[dict[str, Any]]]:
    fields = {
        "geo_code",
        "feature_order",
        "feature_id",
        "feature_label",
        "feature_role",
        "present",
        "latest_year",
    }
    if (
        feature_matrix is None
        or feature_matrix.empty
        or not fields.issubset(feature_matrix.columns)
    ):
        return {}

    visibility = feature_matrix
    if "lane" in visibility.columns:
        visibility = visibility[visibility["lane"] == "evidence_visibility"]

    lookup: dict[str, list[dict[str, Any]]] = {}
    for row in visibility.sort_values(
        ["geo_code", "feature_order"], kind="mergesort"
    ).to_dict(orient="records"):
        lookup.setdefault(str(row["geo_code"]), []).append(
            {
                "feature_id": _clean_text(row.get("feature_id")),
                "label": _clean_text(row.get("feature_label")),
                "role": _clean_text(row.get("feature_role")),
                "present": _bool(row.get("present")),
                "latest_year": _nullable_int(row.get("latest_year")),
            }
        )
    return lookup


def _build_regional_story_payload(
    crosscurrent: dict[str, Any], visibility: list[dict[str, Any]]
) -> dict[str, Any]:
    return {
        "water": {
            "first_year": _nullable_int(crosscurrent.get("water_first_year")),
            "latest_year": _nullable_int(crosscurrent.get("water_latest_year")),
            "change_percentage_points": _nullable_float(
                crosscurrent.get("water_change_percentage_points")
            ),
        },
        "renewable": {
            "first_year": _nullable_int(crosscurrent.get("renewable_first_year")),
            "latest_year": _nullable_int(crosscurrent.get("renewable_latest_year")),
            "change_percentage_points": _nullable_float(
                crosscurrent.get("renewable_change_percentage_points")
            ),
        },
        "complete_overlap": _bool(crosscurrent.get("complete_overlap")),
        "quadrant": _clean_text(crosscurrent.get("quadrant")),
        "visibility": visibility,
    }


def _build_outlook_lookup(outlook: pd.DataFrame) -> dict[str, dict[str, dict[str, dict[str, Any]]]]:
    lookup: dict[str, dict[str, dict[str, dict[str, Any]]]] = {}
    if outlook.empty:
        return lookup

    for row in outlook.to_dict(orient="records"):
        geo_code = str(row["geo_code"])
        horizon = str(_nullable_int(row.get("horizon")))
        scenario = str(row["scenario"])
        lookup.setdefault(geo_code, {}).setdefault(horizon, {})[scenario] = {
            "outlook_gap_score": _nullable_float(row.get("outlook_gap_score")),
            "projected_climate_pressure_score": _nullable_float(
                row.get("projected_climate_pressure_score")
            ),
            "capacity_projection_score": _nullable_float(row.get("capacity_projection_score")),
            "trend_indicator_count": _nullable_int(row.get("trend_indicator_count")),
            "caveat_notes": _clean_text(row.get("caveat_notes")),
        }

    return lookup


def _lookup_by_geo(table: pd.DataFrame | None) -> dict[str, dict[str, Any]]:
    if table is None or table.empty or "geo_code" not in table.columns:
        return {}
    return {str(row["geo_code"]): row for row in table.to_dict(orient="records")}


def _build_monitoring_payload(row: dict[str, Any]) -> dict[str, Any]:
    status = _clean_text(row.get("monitoring_reporting_status")) or "missing_monitoring_dataset_row"
    is_missing_row = status == "missing_monitoring_dataset_row"
    return {
        "reporting_status": status,
        "latest_value": None if is_missing_row else _nullable_float(row.get("monitoring_count")),
        "latest_year": None if is_missing_row else _nullable_int(row.get("latest_monitoring_year")),
        "observation_count": _nullable_int(row.get("monitoring_observation_count")),
        "story_priority_rank": _nullable_int(row.get("story_priority_rank")),
        "story_priority": _clean_text(row.get("story_priority")),
        "monitoring_quadrant": _clean_text(row.get("monitoring_quadrant")),
        "proxy_caveat": _clean_text(row.get("proxy_caveat")),
        "missing_reporting_caveat": _clean_text(row.get("missing_reporting_caveat")),
    }


def _build_rank_payload(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "scenario_rank_min": _nullable_int(row.get("scenario_rank_min")),
        "scenario_rank_max": _nullable_int(row.get("scenario_rank_max")),
        "rank_range": _nullable_int(row.get("rank_range")),
        "robustness_label": _clean_text(row.get("robustness_label")),
        "rank_caveat": _clean_text(row.get("rank_caveat")),
    }


def _build_story_payload(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "story_label": _clean_text(row.get("story_label")),
        "story_priority": _clean_text(row.get("story_priority")),
        "evidence_density_label": _clean_text(row.get("evidence_density_label")),
        "top_pressure_signals": _parse_signal_list(row.get("top_pressure_signals")),
        "top_capacity_signals": _parse_signal_list(row.get("top_capacity_signals")),
        "non_causal_caveat": _clean_text(row.get("non_causal_caveat")),
    }


def _build_context_payload(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "subregion": _clean_text(row.get("subregion")),
        "political_status": _clean_text(row.get("political_status")),
        "island_group_or_region_note": _clean_text(row.get("island_group_or_region_note")),
        "context_quality": _clean_text(row.get("context_quality")),
        "regional_context_caveat": _clean_text(row.get("regional_context_caveat")),
    }


def _build_outlook_display_lookup(
    outlook_display: pd.DataFrame | None,
) -> dict[str, dict[str, dict[str, dict[str, Any]]]]:
    lookup: dict[str, dict[str, dict[str, dict[str, Any]]]] = {}
    if outlook_display is None or outlook_display.empty:
        return lookup

    for row in outlook_display.to_dict(orient="records"):
        geo_code = str(row["geo_code"])
        target_year = str(_nullable_int(row.get("target_year")))
        scenario = str(row["scenario"])
        lookup.setdefault(geo_code, {}).setdefault(target_year, {})[scenario] = {
            "display_recommendation": _clean_text(row.get("display_recommendation")),
            "diagnostic_quality_label": _clean_text(row.get("diagnostic_quality_label")),
            "projection_fragility_label": _clean_text(row.get("projection_fragility_label")),
            "caveat": _clean_text(row.get("caveat")),
        }
    return lookup


def _build_similarity_lookup(
    similarity_neighbors: pd.DataFrame | None,
) -> dict[str, list[dict[str, Any]]]:
    lookup: dict[str, list[dict[str, Any]]] = {}
    if similarity_neighbors is None or similarity_neighbors.empty:
        return lookup

    rows = similarity_neighbors.sort_values(
        ["geo_code", "similarity_rank"], kind="mergesort"
    ).to_dict(orient="records")
    for row in rows:
        geo_code = str(row["geo_code"])
        lookup.setdefault(geo_code, []).append(
            {
                "neighbor_geo_code": _clean_text(row.get("neighbor_geo_code")),
                "neighbor_name": _clean_text(
                    GEOGRAPHY_REFERENCE.get(str(row.get("neighbor_geo_code")), {}).get("name")
                ),
                "similarity_rank": _nullable_int(row.get("similarity_rank")),
                "jsd_distance": _nullable_float(row.get("jsd_distance")),
                "similarity_band": _clean_text(row.get("similarity_band")),
                "reason_label": _clean_text(row.get("reason_label")),
                "neighbor_caveat": _clean_text(row.get("neighbor_caveat")),
            }
        )
    return lookup


def _parse_signal_list(value: Any) -> list[dict[str, Any]]:
    text = _clean_text(value)
    if not text:
        return []

    signals: list[dict[str, Any]] = []
    for part in text.split(";"):
        item = part.strip()
        if not item:
            continue
        label = item
        score = None
        if item.endswith(")") and "(" in item:
            label_part, score_part = item.rsplit("(", 1)
            parsed_score = score_part[:-1].strip()
            try:
                score = round(float(parsed_score), 1)
                label = label_part.strip()
            except ValueError:
                label = item
        signals.append({"label": label, "score": score})
    return signals


def _clean_text(value: Any) -> str:
    if value is None or pd.isna(value):
        return ""
    return str(value)


def _lookup_outlook_gap(
    outlook: dict[str, dict[str, dict[str, Any]]], *, horizon: str, scenario: str
) -> float | None:
    scenario_values = outlook.get(horizon, {}).get(scenario, {})
    return _nullable_float(scenario_values.get("outlook_gap_score"))


def _nullable_float(value: Any) -> float | None:
    if value is None or pd.isna(value) or value == "":
        return None
    return round(float(value), 4)


def _nullable_int(value: Any) -> int | None:
    if value is None or pd.isna(value) or value == "":
        return None
    return int(float(value))


def _bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"true", "1", "yes"}
