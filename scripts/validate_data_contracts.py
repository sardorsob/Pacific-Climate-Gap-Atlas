"""Validate processed data contracts."""

from __future__ import annotations

import json
from pathlib import Path

VALIDATED_JSON_FILES = ("geographies.json", "layers.json")
PUBLIC_COPY_FILES = (
    "geographies.json",
    "atlas_geographies.geojson",
    "monitoring_network.geojson",
    "layers.json",
    "country_details.json",
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
)
REQUIRED_CENTROID_FIELDS = ("lon", "lat")
REQUIRED_SOURCE_REF_FIELDS = ("index", "indicator_trace")
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
REQUIRED_LAYER_FIELDS = ("id", "label", "type", "source_file", "fields")
REQUIRED_LAYER_IDS = (
    "adaptation_gap",
    "climate_pressure",
    "capacity",
    "outlook_2030_flat",
    "outlook_2050_flat",
)


def validate_root(root: Path | str = Path(".")) -> list[str]:
    base = Path(root)
    errors: list[str] = []

    geographies = _load_app_json(base, "geographies.json", errors)
    layers = _load_app_json(base, "layers.json", errors)

    if geographies is not None:
        errors.extend(_validate_geographies(geographies))
    if layers is not None:
        errors.extend(_validate_layers(layers))

    for file_name in PUBLIC_COPY_FILES:
        errors.extend(
            _validate_public_copy(
                base, file_name, require_processed=file_name not in VALIDATED_JSON_FILES
            )
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


def _validate_layers(payload: object) -> list[str]:
    errors: list[str] = []
    if not isinstance(payload, dict):
        return ["layers.json must contain a top-level object"]

    errors.extend(_require_fields(payload, ("schema_version", "layers"), "layers.json"))
    layers = payload.get("layers")
    if not isinstance(layers, list):
        errors.append("layers must be an array")
        return errors

    seen_ids: set[str] = set()
    for index, layer in enumerate(layers):
        label = f"layers[{index}]"
        if not isinstance(layer, dict):
            errors.append(f"{label} must be an object")
            continue

        errors.extend(_require_fields(layer, REQUIRED_LAYER_FIELDS, label))
        layer_id = layer.get("id")
        if isinstance(layer_id, str):
            seen_ids.add(layer_id)
        if "fields" in layer and not isinstance(layer.get("fields"), list):
            errors.append(f"{label}.fields must be an array")

    for layer_id in REQUIRED_LAYER_IDS:
        if layer_id not in seen_ids:
            errors.append(f"layers missing required id: {layer_id}")

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
