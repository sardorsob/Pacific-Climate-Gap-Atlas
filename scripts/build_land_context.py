"""Build a compact Pacific land-context GeoJSON for the web atlas."""

from __future__ import annotations

import argparse
import json
import shutil
import urllib.request
from pathlib import Path
from typing import Any

SOURCE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson"
SOURCE_PAGE = "https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-land/"
TERMS_URL = "https://www.naturalearthdata.com/about/terms-of-use/"
PACIFIC_BOUNDS = ((120.0, -36.0), (250.0, 26.0))
MAX_CONTEXT_SPAN_DEGREES = 55.0

DEFAULT_SOURCE_PATH = Path("data/raw/gis/ne_10m_land.geojson")
DEFAULT_OUTPUT_PATH = Path("data/processed/app/pacific_land_context.geojson")
DEFAULT_PUBLIC_OUTPUT_PATH = Path("app/public/data/pacific_land_context.geojson")
DEFAULT_PROVENANCE_PATH = Path("artifacts/provenance/land_context_summary.json")


def shift_pacific_lon(lon: float) -> float:
    return lon + 360 if lon < 0 else lon


def _is_position(value: Any) -> bool:
    return (
        isinstance(value, list)
        and len(value) >= 2
        and isinstance(value[0], int | float)
        and isinstance(value[1], int | float)
    )


def _iter_positions(coords: Any):
    if _is_position(coords):
        yield coords
        return
    if isinstance(coords, list):
        for item in coords:
            yield from _iter_positions(item)


def _shift_coordinates(coords: Any) -> Any:
    if _is_position(coords):
        shifted = [round(shift_pacific_lon(float(coords[0])), 6), round(float(coords[1]), 6)]
        if len(coords) > 2:
            shifted.extend(coords[2:])
        return shifted
    if isinstance(coords, list):
        return [_shift_coordinates(item) for item in coords]
    return coords


def feature_bounds(feature: dict[str, Any]) -> tuple[float, float, float, float] | None:
    geometry = feature.get("geometry") or {}
    positions = list(_iter_positions(geometry.get("coordinates")))
    if not positions:
        return None

    lons = [shift_pacific_lon(float(position[0])) for position in positions]
    lats = [float(position[1]) for position in positions]
    return min(lons), min(lats), max(lons), max(lats)


def _bounds_intersect(
    a: tuple[float, float, float, float],
    b: tuple[tuple[float, float], tuple[float, float]],
) -> bool:
    a_min_lon, a_min_lat, a_max_lon, a_max_lat = a
    (b_min_lon, b_min_lat), (b_max_lon, b_max_lat) = b
    return not (
        a_max_lon < b_min_lon
        or a_min_lon > b_max_lon
        or a_max_lat < b_min_lat
        or a_min_lat > b_max_lat
    )


def _within_context_span(bbox: tuple[float, float, float, float]) -> bool:
    min_lon, min_lat, max_lon, max_lat = bbox
    return (
        max_lon - min_lon <= MAX_CONTEXT_SPAN_DEGREES
        and max_lat - min_lat <= MAX_CONTEXT_SPAN_DEGREES
    )


def feature_intersects_bounds(
    feature: dict[str, Any],
    bounds: tuple[tuple[float, float], tuple[float, float]],
) -> bool:
    bbox = feature_bounds(feature)
    return bbox is not None and _bounds_intersect(bbox, bounds)


def _polygon_bounds(polygon_coords: Any) -> tuple[float, float, float, float] | None:
    positions = list(_iter_positions(polygon_coords))
    if not positions:
        return None
    lons = [shift_pacific_lon(float(position[0])) for position in positions]
    lats = [float(position[1]) for position in positions]
    return min(lons), min(lats), max(lons), max(lats)


def _context_geometries(feature: dict[str, Any]) -> list[dict[str, Any]]:
    geometry = feature.get("geometry") or {}
    geometry_type = geometry.get("type")
    coordinates = geometry.get("coordinates")
    if geometry_type == "Polygon":
        candidates = [coordinates]
    elif geometry_type == "MultiPolygon":
        candidates = coordinates
    else:
        candidates = []
    geometries = []
    for polygon in candidates or []:
        bbox = _polygon_bounds(polygon)
        if bbox is None or not _bounds_intersect(bbox, PACIFIC_BOUNDS):
            continue
        if not _within_context_span(bbox):
            continue
        geometries.append({
            "type": "Polygon",
            "coordinates": _shift_coordinates(polygon),
        })
    return geometries


def _context_features(feature: dict[str, Any]) -> list[dict[str, Any]]:
    properties = feature.get("properties") or {}
    return [
        {
            "type": "Feature",
            "geometry": geometry,
            "properties": {
                "source": "Natural Earth 10m land",
                "source_role": "visual_land_context",
                "geometry_role": "island_or_regional_land_context",
                "featurecla": properties.get("featurecla", "Land"),
                "scalerank": properties.get("scalerank"),
                "min_zoom": properties.get("min_zoom"),
            },
        }
        for geometry in _context_geometries(feature)
    ]


def ensure_source(source_path: Path, source_url: str = SOURCE_URL) -> None:
    if source_url != SOURCE_URL:
        raise ValueError("source_url must match the approved Natural Earth source")
    if source_path.exists():
        return
    source_path.parent.mkdir(parents=True, exist_ok=True)
    # The exact HTTPS source is checked above before transport.
    with urllib.request.urlopen(source_url, timeout=60) as response:  # nosemgrep
        source_path.write_bytes(response.read())


def build_land_context(
    source_path: Path = DEFAULT_SOURCE_PATH,
    output_path: Path = DEFAULT_OUTPUT_PATH,
    public_output_path: Path | None = DEFAULT_PUBLIC_OUTPUT_PATH,
    provenance_path: Path = DEFAULT_PROVENANCE_PATH,
) -> dict[str, Any]:
    source = json.loads(source_path.read_text(encoding="utf-8"))
    source_features = source.get("features", [])
    features = [
        context_feature
        for feature in source_features
        for context_feature in _context_features(feature)
    ]

    collection = {
        "type": "FeatureCollection",
        "schema_version": 1,
        "source": "Natural Earth 10m land",
        "source_url": SOURCE_URL,
        "source_page": SOURCE_PAGE,
        "terms_url": TERMS_URL,
        "geometry_policy": "natural_earth_visual_land_context",
        "score_input_role": "visual_context_only_not_score_input",
        "bounds_shifted_lonlat": PACIFIC_BOUNDS,
        "max_context_span_degrees": MAX_CONTEXT_SPAN_DEGREES,
        "caveat": (
            "Natural Earth land polygons are visual context only. Scored geographies "
            "remain centroid features and this layer must not be treated as official "
            "territorial boundaries or a polygon choropleth."
        ),
        "features": features,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(collection, separators=(",", ":")), encoding="utf-8")
    if public_output_path is not None:
        public_output_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(output_path, public_output_path)

    summary = {
        "source": "Natural Earth 10m land",
        "source_url": SOURCE_URL,
        "source_page": SOURCE_PAGE,
        "terms_url": TERMS_URL,
        "license_status": "public_domain",
        "geometry_policy": "natural_earth_visual_land_context",
        "score_input_role": "visual_context_only_not_score_input",
        "source_features": len(source_features),
        "features_written": len(features),
        "bounds_shifted_lonlat": PACIFIC_BOUNDS,
        "outputs": {
            "processed": str(output_path),
            "public": str(public_output_path) if public_output_path is not None else None,
        },
        "caveats": [
            "Visual land context only; not a scored or selectable geography boundary layer.",
            "Natural Earth 10m land is generalized and should not be used for territorial "
            "precision.",
            "Atlas scores and selections remain tied to generated centroid geography records.",
        ],
    }
    provenance_path.parent.mkdir(parents=True, exist_ok=True)
    provenance_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE_PATH)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH)
    parser.add_argument("--public-output", type=Path, default=DEFAULT_PUBLIC_OUTPUT_PATH)
    parser.add_argument("--provenance", type=Path, default=DEFAULT_PROVENANCE_PATH)
    args = parser.parse_args()

    ensure_source(args.source)
    summary = build_land_context(
        source_path=args.source,
        output_path=args.output,
        public_output_path=args.public_output,
        provenance_path=args.provenance,
    )
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
