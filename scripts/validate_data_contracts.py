"""Validate processed data contracts."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

PUBLIC_APP_FILES = (
    "geographies.json",
    "country_details.json",
    "pacific_land_context.geojson",
)
REQUIRED_GEOGRAPHY_FIELDS = (
    "geo_code",
    "geography_code",
    "name",
    "geography_name",
    "centroid",
    "score_status",
    "adaptation_gap_score",
    "climate_pressure_score",
    "capacity_score",
    "score_input_indicator_count",
    "context_indicator_count",
    "trace_indicator_count",
    "score_input_presence",
    "missingness_flag",
    "source_refs",
    "monitoring",
    "rank",
    "story",
    "context",
    "outlook_display",
    "regional_story",
)
REQUIRED_CENTROID_FIELDS = ("lon", "lat")
REQUIRED_SOURCE_REF_FIELDS = (
    "index",
    "indicator_trace",
    "regional_crosscurrents",
    "regional_feature_matrix",
)
REQUIRED_MONITORING_FIELDS = (
    "reporting_status",
    "latest_value",
    "latest_year",
    "observation_count",
    "story_priority_rank",
    "story_priority",
    "monitoring_quadrant",
    "proxy_caveat",
    "missing_reporting_caveat",
)
REQUIRED_RANK_FIELDS = (
    "scenario_rank_min",
    "scenario_rank_max",
    "rank_range",
    "robustness_label",
    "rank_caveat",
)
REQUIRED_STORY_FIELDS = (
    "story_label",
    "story_priority",
    "evidence_density_label",
    "top_pressure_signals",
    "top_capacity_signals",
    "non_causal_caveat",
)
REQUIRED_CONTEXT_FIELDS = (
    "subregion",
    "political_status",
    "island_group_or_region_note",
    "context_quality",
    "regional_context_caveat",
)
REQUIRED_SCORE_INPUT_PRESENCE_FIELDS = (
    "dataset_slug",
    "dataset_name",
    "pillar",
    "present",
)
SCORE_INPUT_PILLARS = {"climate_signal", "observed_stress", "adaptation_capacity"}
REQUIRED_REGIONAL_STORY_FIELDS = (
    "water",
    "renewable",
    "complete_overlap",
    "quadrant",
    "visibility",
)
REQUIRED_REGIONAL_MEASURE_FIELDS = ("first_year", "latest_year", "change_percentage_points")
REQUIRED_VISIBILITY_FIELDS = ("feature_id", "label", "role", "present", "latest_year")
REGIONAL_QUADRANT_COUNTS = {
    "water_up_renewable_down": 7,
    "both_up": 6,
    "both_down": 3,
    "water_down_renewable_up": 3,
}
INCOMPLETE_REGIONAL_GEOS = {"GU", "PN", "TK"}


def validate_root(root: Path | str = Path(".")) -> list[str]:
    base = Path(root)
    errors: list[str] = []

    geographies = _load_app_json(base, "geographies.json", errors)
    country_details = _load_app_json(base, "country_details.json", errors)

    if geographies is not None:
        errors.extend(_validate_geographies(geographies))
    if country_details is not None:
        errors.extend(_validate_country_details(country_details))
    if geographies is not None and country_details is not None:
        errors.extend(_validate_regional_story_mirrors(geographies, country_details))

    for file_name in PUBLIC_APP_FILES:
        errors.extend(
            _validate_public_copy(base, file_name, require_processed=True)
        )

    return errors


def main(root: Path | str = Path(".")) -> int:
    errors = validate_root(root)
    if errors:
        print(f"FAIL app data contracts: {len(errors)} error(s)")
        for error in errors:
            print(f"- {error}")
        return 1

    print("PASS app data contracts")
    return 0


def _load_app_json(base: Path, file_name: str, errors: list[str]) -> object | None:
    path = base / "data" / "processed" / "app" / file_name
    label = _relative_label(path, base)
    if not path.exists():
        errors.append(f"{label} does not exist")
        return None

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"{label} is not valid JSON: {exc.msg}")
        return None


def _validate_geographies(payload: object) -> list[str]:
    errors: list[str] = []
    if not isinstance(payload, dict):
        return ["geographies.json must contain a top-level object"]

    errors.extend(_require_fields(payload, ("schema_version", "geographies"), "geographies.json"))
    geographies = payload.get("geographies")
    if not isinstance(geographies, list):
        errors.append("geographies must be an array")
        return errors

    for index, geography in enumerate(geographies):
        label = f"geographies[{index}]"
        if not isinstance(geography, dict):
            errors.append(f"{label} must be an object")
            continue

        errors.extend(_require_fields(geography, REQUIRED_GEOGRAPHY_FIELDS, label))
        errors.extend(_validate_score_input_presence(geography, label))
        centroid = geography.get("centroid")
        if isinstance(centroid, dict):
            errors.extend(_require_fields(centroid, REQUIRED_CENTROID_FIELDS, f"{label}.centroid"))
        elif "centroid" in geography:
            errors.append(f"{label}.centroid must be an object")

        source_refs = geography.get("source_refs")
        if isinstance(source_refs, dict):
            errors.extend(
                _require_fields(source_refs, REQUIRED_SOURCE_REF_FIELDS, f"{label}.source_refs")
            )
        elif "source_refs" in geography:
            errors.append(f"{label}.source_refs must be an object")

        errors.extend(
            _validate_nested_object(
                geography, "monitoring", REQUIRED_MONITORING_FIELDS, f"{label}.monitoring"
            )
        )
        errors.extend(
            _validate_nested_object(geography, "rank", REQUIRED_RANK_FIELDS, f"{label}.rank")
        )
        errors.extend(
            _validate_nested_object(geography, "story", REQUIRED_STORY_FIELDS, f"{label}.story")
        )
        errors.extend(
            _validate_nested_object(
                geography, "context", REQUIRED_CONTEXT_FIELDS, f"{label}.context"
            )
        )
        outlook_display = geography.get("outlook_display")
        if "outlook_display" in geography and not isinstance(outlook_display, dict):
            errors.append(f"{label}.outlook_display must be an object")

    errors.extend(_validate_regional_story_contract(geographies))
    return errors


def _validate_regional_story_contract(geographies: list[object]) -> list[str]:
    errors: list[str] = []
    stories: list[tuple[str, dict[str, object]]] = []
    expected_feature_ids: list[object] | None = None

    if len(geographies) != 22:
        errors.append(f"regional_story geography count must be 22; found {len(geographies)}")

    for index, geography in enumerate(geographies):
        if not isinstance(geography, dict):
            continue
        label = f"geographies[{index}].regional_story"
        story = geography.get("regional_story")
        if not isinstance(story, dict):
            if "regional_story" in geography:
                errors.append(f"{label} must be an object")
            continue

        errors.extend(_require_fields(story, REQUIRED_REGIONAL_STORY_FIELDS, label))
        for measure_name in ("water", "renewable"):
            errors.extend(
                _validate_nested_object(
                    story,
                    measure_name,
                    REQUIRED_REGIONAL_MEASURE_FIELDS,
                    f"{label}.{measure_name}",
                )
            )

        if "complete_overlap" in story and not isinstance(story["complete_overlap"], bool):
            errors.append(f"{label}.complete_overlap must be boolean")

        quadrant = story.get("quadrant")
        valid_quadrants = set(REGIONAL_QUADRANT_COUNTS) | {"missing_overlap"}
        if quadrant not in valid_quadrants:
            errors.append(f"{label}.quadrant has invalid value: {quadrant}")

        visibility = story.get("visibility")
        if not isinstance(visibility, list):
            if "visibility" in story:
                errors.append(f"{label}.visibility must be an array")
            continue
        if len(visibility) != 14:
            errors.append(f"{label}.visibility must contain 14 positions; found {len(visibility)}")

        feature_ids: list[object] = []
        for position, item in enumerate(visibility):
            item_label = f"{label}.visibility[{position}]"
            if not isinstance(item, dict):
                errors.append(f"{item_label} must be an object")
                continue
            errors.extend(_require_fields(item, REQUIRED_VISIBILITY_FIELDS, item_label))
            feature_ids.append(item.get("feature_id"))
            if "present" in item and not isinstance(item["present"], bool):
                errors.append(f"{item_label}.present must be boolean")
            latest_year = item.get("latest_year")
            if latest_year is not None and not isinstance(latest_year, int):
                errors.append(f"{item_label}.latest_year must be integer or null")

        if len(set(feature_ids)) != len(feature_ids):
            errors.append(f"{label}.visibility feature IDs must be unique")
        if expected_feature_ids is None and len(feature_ids) == 14:
            expected_feature_ids = feature_ids
        elif expected_feature_ids is not None and feature_ids != expected_feature_ids:
            errors.append(f"{label}.visibility feature order differs from the stable contract")

        stories.append((str(geography.get("geo_code", "")), story))

    complete = [
        (geo_code, story)
        for geo_code, story in stories
        if story.get("complete_overlap") is True
    ]
    if len(complete) != 19:
        errors.append(f"regional_story complete comparison count must be 19; found {len(complete)}")

    incomplete_codes = {
        geo_code
        for geo_code, story in stories
        if story.get("complete_overlap") is False
    }
    if incomplete_codes != INCOMPLETE_REGIONAL_GEOS:
        errors.append(
            "regional_story incomplete geography codes must be GU, PN, TK; found "
            + ", ".join(sorted(incomplete_codes))
        )

    quadrant_counts = Counter(story.get("quadrant") for _, story in complete)
    if dict(quadrant_counts) != REGIONAL_QUADRANT_COUNTS:
        errors.append(
            f"regional_story quadrant counts must be {REGIONAL_QUADRANT_COUNTS}; "
            f"found {dict(quadrant_counts)}"
        )

    visibility = [
        position
        for _, story in stories
        for position in story.get("visibility", [])
        if isinstance(position, dict)
    ]
    present_count = sum(position.get("present") is True for position in visibility)
    absent_count = sum(position.get("present") is False for position in visibility)
    if present_count != 277:
        errors.append(f"regional_story visibility present count must be 277; found {present_count}")
    if absent_count != 31:
        errors.append(f"regional_story visibility absent count must be 31; found {absent_count}")

    return errors


def _validate_score_input_presence(
    geography: dict[str, object], label: str
) -> list[str]:
    presence = geography.get("score_input_presence")
    if not isinstance(presence, list):
        if "score_input_presence" in geography:
            return [f"{label}.score_input_presence must be an array"]
        return []

    errors: list[str] = []
    seen_slugs: set[str] = set()
    for index, item in enumerate(presence):
        item_label = f"{label}.score_input_presence[{index}]"
        if not isinstance(item, dict):
            errors.append(f"{item_label} must be an object")
            continue
        errors.extend(_require_fields(item, REQUIRED_SCORE_INPUT_PRESENCE_FIELDS, item_label))
        slug = item.get("dataset_slug")
        if isinstance(slug, str):
            if slug in seen_slugs:
                errors.append(f"{item_label} duplicates dataset_slug: {slug}")
            seen_slugs.add(slug)
        pillar = item.get("pillar")
        if pillar not in SCORE_INPUT_PILLARS:
            errors.append(f"{item_label} has invalid score-input pillar: {pillar}")
        if "present" in item and not isinstance(item["present"], bool):
            errors.append(f"{item_label}.present must be boolean")
    return errors


def _validate_country_details(payload: object) -> list[str]:
    errors: list[str] = []
    if not isinstance(payload, dict):
        return ["country_details.json must contain a top-level object"]
    errors.extend(_require_fields(payload, ("schema_version", "details"), "country_details.json"))
    if "details" in payload and not isinstance(payload["details"], dict):
        errors.append("country_details.json.details must be an object")
    elif isinstance(payload.get("details"), dict):
        for geo_code, detail in payload["details"].items():
            if not isinstance(detail, dict):
                errors.append(f"country_details.json.details.{geo_code} must be an object")
            elif "regional_story" not in detail:
                errors.append(
                    f"country_details.json.details.{geo_code} "
                    "missing required field: regional_story"
                )

    return errors


def _validate_regional_story_mirrors(
    geographies_payload: object, country_details_payload: object
) -> list[str]:
    if not isinstance(geographies_payload, dict) or not isinstance(country_details_payload, dict):
        return []
    geographies = geographies_payload.get("geographies")
    details = country_details_payload.get("details")
    if not isinstance(geographies, list) or not isinstance(details, dict):
        return []

    errors: list[str] = []
    for geography in geographies:
        if not isinstance(geography, dict):
            continue
        geo_code = geography.get("geo_code")
        detail = details.get(geo_code) if isinstance(geo_code, str) else None
        if isinstance(detail, dict) and detail.get("regional_story") != geography.get(
            "regional_story"
        ):
            errors.append(
                f"country_details.json.details.{geo_code} regional_story does not match "
                "geographies.json"
            )
    return errors


def _validate_public_copy(base: Path, file_name: str, *, require_processed: bool) -> list[str]:
    processed = base / "data" / "processed" / "app" / file_name
    public = base / "app" / "public" / "data" / file_name
    errors: list[str] = []

    if require_processed and not processed.exists():
        errors.append(f"{_relative_label(processed, base)} does not exist")

    if not public.exists():
        errors.append(f"{_relative_label(public, base)} does not exist")
        return errors

    if processed.exists() and processed.read_bytes() != public.read_bytes():
        errors.append(
            f"{_relative_label(public, base)} does not match "
            f"{_relative_label(processed, base)} byte-for-byte"
        )

    return errors


def _require_fields(payload: dict[str, object], fields: tuple[str, ...], label: str) -> list[str]:
    return [f"{label} missing required field: {field}" for field in fields if field not in payload]


def _validate_nested_object(
    payload: dict[str, object],
    field: str,
    required_fields: tuple[str, ...],
    label: str,
) -> list[str]:
    value = payload.get(field)
    if isinstance(value, dict):
        return _require_fields(value, required_fields, label)
    if field in payload:
        return [f"{label} must be an object"]
    return []


def _relative_label(path: Path, base: Path) -> str:
    try:
        return path.relative_to(base).as_posix()
    except ValueError:
        return path.as_posix()


if __name__ == "__main__":
    raise SystemExit(main())
