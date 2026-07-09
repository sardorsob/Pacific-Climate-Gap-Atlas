import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, {
  type FilterSpecification,
  type GeoJSONSource,
  type Map as MapLibreMap,
  type StyleSpecification,
} from "maplibre-gl";
import type { Geo } from "../../lib/atlasData";
import { LABEL_OFFSETS, STORY_EXEMPLARS, SUBREGION_ANCHORS } from "../../lib/atlasData";
import type { ScoreKey } from "../../lib/encoding";
import { radiusFor, ringVariant } from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";
import { GRATICULE_LATS, GRATICULE_LONS } from "../../lib/projection";
import {
  assignLandAnchors,
  buildGraticuleFeatureCollection,
  buildAtlasFeatureCollection,
  fitBoundsForPacific,
  shiftPacificLon,
  toMapLibreCollection,
  type AtlasFeatureCollection,
  type AtlasPointFeature,
} from "./atlasMapModel";

type AtlasMapProps = {
  geos: Geo[];
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
  selectedCode: string | null;
  priorityCodes: string[];
  onSelect: (code: string) => void;
  activeLayerLabel: string;
};

type ScreenPoint = { x: number; y: number };
type GraticuleLine = { id: string; label: string; x1: number; y1: number; x2: number; y2: number };
type OverlayState = {
  points: Record<string, ScreenPoint>;
  subregions: Record<string, ScreenPoint>;
  lonLines: GraticuleLine[];
  latLines: GraticuleLine[];
  pxPerDeg: { x: number; y: number };
};

const EMPTY_OVERLAY: OverlayState = {
  points: {},
  subregions: {},
  lonLines: [],
  latLines: [],
  pxPerDeg: { x: 0, y: 0 },
};
const MAP_SOURCE_ID = "atlas-points";
const LAND_SOURCE_ID = "pacific-land-context";
const LAND_FILL_LAYER_ID = "pacific-land-context-fill";
const LAND_LINE_LAYER_ID = "pacific-land-context-line";
const LAND_MARK_FILL_LAYER_ID = "pacific-land-selected-fill";
const LAND_MARK_GLOW_LAYER_ID = "pacific-land-selected-glow";
const LAND_MARK_SOLID_LAYER_ID = "pacific-land-selected-line-solid";
const LAND_MARK_ZERO_LAYER_ID = "pacific-land-selected-line-zero";
const LAND_MARK_MISSING_LAYER_ID = "pacific-land-selected-line-missing";
const NO_ANCHOR_FILTER: FilterSpecification = ["==", ["get", "anchorCode"], "__none__"];
const ANCHOR_FILTER: FilterSpecification = ["!=", "anchorCode", ""];

function anchorFilterFor(code: string | null): FilterSpecification {
  return code ? ["==", ["get", "anchorCode"], code] : NO_ANCHOR_FILTER;
}

function anchorStatusFilter(status: string): FilterSpecification {
  return ["all", ["!=", "anchorCode", ""], ["==", "reportingStatus", status]] as FilterSpecification;
}
const GRATICULE_SOURCE_ID = "atlas-graticule";
const GRATICULE_LAYER_ID = "atlas-graticule-lines";
const GRATICULE_EQUATOR_LAYER_ID = "atlas-graticule-equator";
const PRIORITY_LAYER_ID = "atlas-priority-halos";
const SELECTED_PRESENCE_LAYER_ID = "atlas-selected-presence";
const POINT_LAYER_ID = "atlas-centroid-points";

const PACIFIC_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "ocean",
      type: "background",
      paint: {
        "background-color": "#0a1d2a",
      },
    },
  ],
};

function lonLabel(shiftLon: number): string {
  const real = shiftLon > 180 ? shiftLon - 360 : shiftLon;
  if (real === 180 || real === -180) return "180\u00b0";
  if (real === 0) return "0\u00b0";
  return `${Math.abs(real)}\u00b0${real > 0 ? "E" : "W"}`;
}

function asGeoJson(collection: unknown): GeoJSON.FeatureCollection {
  return collection as unknown as GeoJSON.FeatureCollection;
}

function styleAnchoredLand(
  collection: GeoJSON.FeatureCollection | null,
  features: AtlasPointFeature[],
): GeoJSON.FeatureCollection | null {
  if (!collection) return null;
  const byCode = new Map(features.map((feature) => [feature.properties.code, feature.properties]));
  return {
    ...collection,
    features: collection.features.map((feature) => {
      const anchorCode = feature.properties?.anchorCode;
      const props = typeof anchorCode === "string" && anchorCode !== "" ? byCode.get(anchorCode) : null;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          fillColor: props?.fillColor ?? "transparent",
          markOpacity: props ? Math.min(0.34, props.opacity * 0.42) : 0,
          glowOpacity: props ? Math.min(0.28, props.opacity * 0.38) : 0,
          strokeColor: props?.strokeColor ?? "transparent",
          reportingStatus: props?.reportingStatus ?? null,
          selected: props?.selected ?? false,
        },
      };
    }),
  };
}

function cameraForViewport(width: number): { center: [number, number]; zoom: number } {
  // Mobile: bias the camera south so the point cluster sits in the map window
  // above the bottom sheet instead of behind it.
  if (width < 520) return { center: [182.5, -29], zoom: 1.38 };
  if (width < 900) return { center: [185, -7], zoom: 2.05 };
  return { center: [185, -6], zoom: 3.15 };
}

function fitPacificCamera(map: MapLibreMap, duration = 0) {
  const width = map.getContainer().clientWidth;
  map.easeTo({ ...cameraForViewport(width), duration });
}

function syncAtlasSource(map: MapLibreMap, collection: AtlasFeatureCollection) {
  const source = map.getSource(MAP_SOURCE_ID) as GeoJSONSource | undefined;
  if (source) source.setData(asGeoJson(collection));
}

function syncLandContext(map: MapLibreMap, collection: GeoJSON.FeatureCollection | null) {
  if (!collection) return;
  if (!map.isStyleLoaded()) {
    window.setTimeout(() => syncLandContext(map, collection), 50);
    return;
  }
  const source = map.getSource(LAND_SOURCE_ID) as GeoJSONSource | undefined;
  if (source) {
    source.setData(collection);
  } else {
    map.addSource(LAND_SOURCE_ID, {
      type: "geojson",
      data: collection,
    });
  }

  const beforeId = map.getLayer(GRATICULE_LAYER_ID) ? GRATICULE_LAYER_ID : undefined;
  if (!map.getLayer(LAND_FILL_LAYER_ID)) {
    map.addLayer({
      id: LAND_FILL_LAYER_ID,
      type: "fill",
      source: LAND_SOURCE_ID,
      paint: {
        "fill-color": "#173240",
        "fill-opacity": 0.74,
      },
    }, beforeId);
  }
  if (!map.getLayer(LAND_LINE_LAYER_ID)) {
    map.addLayer({
      id: LAND_LINE_LAYER_ID,
      type: "line",
      source: LAND_SOURCE_ID,
      paint: {
        "line-color": "rgba(205, 226, 233, 0.18)",
        "line-width": 0.7,
      },
    }, beforeId);
  }
  // Island texture stays secondary; centroid presence marks carry the data.
  if (!map.getLayer(LAND_MARK_FILL_LAYER_ID)) {
    map.addLayer({
      id: LAND_MARK_FILL_LAYER_ID,
      type: "fill",
      source: LAND_SOURCE_ID,
      filter: ANCHOR_FILTER,
      paint: {
        "fill-color": ["get", "fillColor"],
        "fill-opacity": ["get", "markOpacity"],
      },
    }, beforeId);
  }
  if (!map.getLayer(LAND_MARK_GLOW_LAYER_ID)) {
    map.addLayer({
      id: LAND_MARK_GLOW_LAYER_ID,
      type: "line",
      source: LAND_SOURCE_ID,
      filter: ANCHOR_FILTER,
      paint: {
        "line-color": ["get", "fillColor"],
        "line-width": ["case", ["==", ["get", "selected"], true], 6, 4],
        "line-blur": 1.4,
        "line-opacity": ["get", "glowOpacity"],
      },
    }, beforeId);
  }
  if (!map.getLayer(LAND_MARK_SOLID_LAYER_ID)) {
    map.addLayer({
      id: LAND_MARK_SOLID_LAYER_ID,
      type: "line",
      source: LAND_SOURCE_ID,
      filter: anchorStatusFilter("reported_positive_latest_count"),
      paint: {
        "line-color": ["get", "strokeColor"],
        "line-width": ["case", ["==", ["get", "selected"], true], 2.2, 1.3],
        "line-opacity": ["get", "markOpacity"],
      },
    }, beforeId);
  }
  if (!map.getLayer(LAND_MARK_ZERO_LAYER_ID)) {
    map.addLayer({
      id: LAND_MARK_ZERO_LAYER_ID,
      type: "line",
      source: LAND_SOURCE_ID,
      filter: anchorStatusFilter("reported_zero_latest_count"),
      paint: {
        "line-color": ["get", "strokeColor"],
        "line-width": ["case", ["==", ["get", "selected"], true], 2.2, 1.3],
        "line-dasharray": [2, 2],
        "line-opacity": ["get", "markOpacity"],
      },
    }, beforeId);
  }
  if (!map.getLayer(LAND_MARK_MISSING_LAYER_ID)) {
    map.addLayer({
      id: LAND_MARK_MISSING_LAYER_ID,
      type: "line",
      source: LAND_SOURCE_ID,
      filter: anchorStatusFilter("missing_monitoring_dataset_row"),
      paint: {
        "line-color": ["get", "strokeColor"],
        "line-width": ["case", ["==", ["get", "selected"], true], 2.2, 1.3],
        "line-dasharray": [1, 2],
        "line-opacity": ["get", "markOpacity"],
      },
    }, beforeId);
  }
}

function addGraticuleLayers(map: MapLibreMap) {
  if (!map.getSource(GRATICULE_SOURCE_ID)) {
    map.addSource(GRATICULE_SOURCE_ID, {
      type: "geojson",
      data: asGeoJson(buildGraticuleFeatureCollection()),
    });
  }

  if (!map.getLayer(GRATICULE_LAYER_ID)) {
    map.addLayer({
      id: GRATICULE_LAYER_ID,
      type: "line",
      source: GRATICULE_SOURCE_ID,
      filter: ["!=", ["get", "value"], 0],
      paint: {
        "line-color": "rgba(150, 190, 205, 0.16)",
        "line-width": 1,
      },
    });
  }

  if (!map.getLayer(GRATICULE_EQUATOR_LAYER_ID)) {
    map.addLayer({
      id: GRATICULE_EQUATOR_LAYER_ID,
      type: "line",
      source: GRATICULE_SOURCE_ID,
      filter: ["all", ["==", ["get", "kind"], "latitude"], ["==", ["get", "value"], 0]],
      paint: {
        "line-color": "rgba(150, 190, 205, 0.3)",
        "line-dasharray": [2, 5],
        "line-width": 1,
      },
    });
  }
}

function addAtlasLayers(map: MapLibreMap, collection: AtlasFeatureCollection) {
  if (!map.getSource(MAP_SOURCE_ID)) {
    map.addSource(MAP_SOURCE_ID, {
      type: "geojson",
      data: asGeoJson(collection),
    });
  }

  if (!map.getLayer(PRIORITY_LAYER_ID)) {
    map.addLayer({
      id: PRIORITY_LAYER_ID,
      type: "circle",
      source: MAP_SOURCE_ID,
      filter: ["==", ["get", "priority"], true],
      paint: {
        "circle-radius": ["+", ["get", "radius"], 9],
        "circle-color": "rgba(255, 213, 138, 0.03)",
        "circle-stroke-color": "#ffd58a",
        "circle-stroke-width": 2,
        "circle-opacity": ["get", "opacity"],
      },
    });
  }

  if (!map.getLayer(SELECTED_PRESENCE_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_PRESENCE_LAYER_ID,
      type: "circle",
      source: MAP_SOURCE_ID,
      filter: ["==", ["get", "selected"], true],
      paint: {
        "circle-radius": ["+", ["get", "radius"], 10],
        "circle-color": ["get", "fillColor"],
        "circle-opacity": ["case", ["==", ["get", "withheld"], true], 0, 0.34],
        "circle-blur": 0.45,
        "circle-stroke-color": "rgba(255, 255, 255, 0.72)",
        "circle-stroke-width": 1.2,
      },
    });
  }

  if (!map.getLayer(POINT_LAYER_ID)) {
    map.addLayer({
      id: POINT_LAYER_ID,
      type: "circle",
      source: MAP_SOURCE_ID,
      paint: {
        "circle-radius": ["get", "radius"],
        "circle-color": ["get", "fillColor"],
        "circle-opacity": [
          "case",
          ["==", ["get", "withheld"], true],
          0,
          ["get", "opacity"],
        ],
        "circle-stroke-color": ["get", "strokeColor"],
        "circle-stroke-width": ["case", ["get", "withheld"], 1.4, 1.2],
      },
    });
  }
}

function project(map: MapLibreMap, lon: number, lat: number): ScreenPoint {
  // Shifted Pacific longitudes can project onto a far antimeridian world copy;
  // snap x to the copy nearest the viewport so overlays track the visible map.
  const shifted = shiftPacificLon(lon);
  const point = map.project([shifted, lat]);
  const world = map.project([shifted + 360, lat]).x - point.x;
  const mid = map.getContainer().clientWidth / 2;
  let x = point.x;
  if (world > 0) {
    while (x - mid > world / 2) x -= world;
    while (mid - x > world / 2) x += world;
  }
  return { x, y: point.y };
}

function buildOverlayState(map: MapLibreMap, geos: Geo[]): OverlayState {
  const bounds = fitBoundsForPacific();
  const points = Object.fromEntries(geos.map((geo) => [geo.code, project(map, geo.lon, geo.lat)]));
  const subregions = Object.fromEntries(
    SUBREGION_ANCHORS.map((anchor) => [anchor.name, project(map, anchor.lon, anchor.lat)]),
  );
  const lonLines = GRATICULE_LONS.map((lon) => {
    const top = project(map, lon, bounds[1][1]);
    const bottom = project(map, lon, bounds[0][1]);
    return {
      id: `lon-${lon}`,
      label: lonLabel(lon),
      x1: top.x,
      y1: top.y,
      x2: bottom.x,
      y2: bottom.y,
    };
  });
  const latLines = GRATICULE_LATS.map((lat) => {
    const left = project(map, bounds[0][0], lat);
    const right = project(map, bounds[1][0], lat);
    return {
      id: `lat-${lat}`,
      label: lat === 0 ? "0\u00b0" : `${Math.abs(lat)}\u00b0${lat > 0 ? "N" : "S"}`,
      x1: left.x,
      y1: left.y,
      x2: right.x,
      y2: right.y,
    };
  });

  const origin = map.project([180, 0]);
  const pxPerDeg = {
    x: map.project([181, 0]).x - origin.x,
    y: origin.y - map.project([180, 1]).y,
  };

  return { points, subregions, lonLines, latLines, pxPerDeg };
}

export function AtlasMap({
  geos,
  activeScore,
  viewMode,
  outlookOn,
  selectedCode,
  priorityCodes,
  onSelect,
  activeLayerLabel,
}: AtlasMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const [mapReady, setMapReady] = useState(false);
  const [landContext, setLandContext] = useState<GeoJSON.FeatureCollection | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>(EMPTY_OVERLAY);
  const hasSelection = selectedCode !== null;

  const atlasFeatures = useMemo(
    () => buildAtlasFeatureCollection(geos, {
      activeScore,
      viewMode,
      outlookOn,
      selectedCode,
      priorityCodes,
    }),
    [activeScore, geos, outlookOn, priorityCodes, selectedCode, viewMode],
  );
  // Land tagged with nearest-centroid anchor codes so selection can halo a
  // place's island shapes. Distance grouping for highlighting, not boundaries.
  const anchoredLand = useMemo(
    () => (landContext && geos.length > 0 ? assignLandAnchors(landContext, geos) : landContext),
    [landContext, geos],
  );
  const styledLand = useMemo(() => styleAnchoredLand(anchoredLand, atlasFeatures.features), [anchoredLand, atlasFeatures]);
  const mapLibreFeatures = useMemo(() => toMapLibreCollection(atlasFeatures), [atlasFeatures]);
  const mapLibreFeaturesRef = useRef(mapLibreFeatures);
  const landContextRef = useRef<GeoJSON.FeatureCollection | null>(styledLand);
  const geosRef = useRef(geos);

  const labelCodes = useMemo(() => {
    const codes = new Set<string>(viewMode === "coverage" ? priorityCodes : STORY_EXEMPLARS);
    if (selectedCode) codes.add(selectedCode);
    return codes;
  }, [priorityCodes, selectedCode, viewMode]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    mapLibreFeaturesRef.current = mapLibreFeatures;
  }, [mapLibreFeatures]);

  useEffect(() => {
    geosRef.current = geos;
  }, [geos]);

  useEffect(() => {
    landContextRef.current = styledLand;
  }, [styledLand]);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/pacific_land_context.geojson")
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load land context: ${response.status}`);
        return response.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .then((data) => {
        if (!cancelled) setLandContext(data);
      })
      .catch(() => {
        if (!cancelled) setLandContext(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: PACIFIC_STYLE,
      center: [185, -7],
      zoom: 3.15,
      minZoom: 1.25,
      maxZoom: 7,
      attributionControl: false,
      renderWorldCopies: true,
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;
    if (import.meta.env.DEV) {
      // Dev-only handle for browser-smoke QA (camera, layers, queryRenderedFeatures).
      (window as unknown as { __atlasMap?: MapLibreMap }).__atlasMap = map;
    }

    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    fitPacificCamera(map);

    const handlePointClick = (event: maplibregl.MapLayerMouseEvent) => {
      const code = event.features?.[0]?.properties?.code;
      if (typeof code === "string") onSelectRef.current(code);
    };
    const handlePointEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handlePointLeave = () => {
      map.getCanvas().style.cursor = "";
    };
    const refreshOverlay = () => {
      map.resize();
      setOverlay(buildOverlayState(map, geosRef.current));
    };
    const refitOnResize = () => {
      map.resize();
      fitPacificCamera(map);
      setOverlay(buildOverlayState(map, geosRef.current));
    };
    const handleLoad = () => {
      addGraticuleLayers(map);
      syncLandContext(map, landContextRef.current);
      addAtlasLayers(map, mapLibreFeaturesRef.current);
      map.on("click", POINT_LAYER_ID, handlePointClick);
      map.on("mouseenter", POINT_LAYER_ID, handlePointEnter);
      map.on("mouseleave", POINT_LAYER_ID, handlePointLeave);
      setMapReady(true);
      refreshOverlay();
      requestAnimationFrame(refreshOverlay);
    };
    map.on("load", handleLoad);
    window.addEventListener("resize", refitOnResize);

    return () => {
      setMapReady(false);
      setOverlay(EMPTY_OVERLAY);
      map.off("load", handleLoad);
      window.removeEventListener("resize", refitOnResize);
      if (map.getLayer(POINT_LAYER_ID)) {
        map.off("click", POINT_LAYER_ID, handlePointClick);
        map.off("mouseenter", POINT_LAYER_ID, handlePointEnter);
        map.off("mouseleave", POINT_LAYER_ID, handlePointLeave);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    syncAtlasSource(map, mapLibreFeatures);
  }, [mapLibreFeatures, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    syncLandContext(map, styledLand);
  }, [styledLand, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !map.getLayer(LAND_MARK_FILL_LAYER_ID)) return;
    const handleLandClick = (event: maplibregl.MapLayerMouseEvent) => {
      const code = event.features?.[0]?.properties?.anchorCode;
      if (typeof code === "string") onSelectRef.current(code);
    };
    const handleLandEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleLandLeave = () => {
      map.getCanvas().style.cursor = "";
    };
    map.on("click", LAND_MARK_FILL_LAYER_ID, handleLandClick);
    map.on("click", LAND_MARK_GLOW_LAYER_ID, handleLandClick);
    map.on("click", LAND_MARK_SOLID_LAYER_ID, handleLandClick);
    map.on("click", LAND_MARK_ZERO_LAYER_ID, handleLandClick);
    map.on("click", LAND_MARK_MISSING_LAYER_ID, handleLandClick);
    map.on("mouseenter", LAND_MARK_FILL_LAYER_ID, handleLandEnter);
    map.on("mouseenter", LAND_MARK_GLOW_LAYER_ID, handleLandEnter);
    map.on("mouseenter", LAND_MARK_SOLID_LAYER_ID, handleLandEnter);
    map.on("mouseenter", LAND_MARK_ZERO_LAYER_ID, handleLandEnter);
    map.on("mouseenter", LAND_MARK_MISSING_LAYER_ID, handleLandEnter);
    map.on("mouseleave", LAND_MARK_FILL_LAYER_ID, handleLandLeave);
    map.on("mouseleave", LAND_MARK_GLOW_LAYER_ID, handleLandLeave);
    map.on("mouseleave", LAND_MARK_SOLID_LAYER_ID, handleLandLeave);
    map.on("mouseleave", LAND_MARK_ZERO_LAYER_ID, handleLandLeave);
    map.on("mouseleave", LAND_MARK_MISSING_LAYER_ID, handleLandLeave);
    return () => {
      map.off("click", LAND_MARK_FILL_LAYER_ID, handleLandClick);
      map.off("click", LAND_MARK_GLOW_LAYER_ID, handleLandClick);
      map.off("click", LAND_MARK_SOLID_LAYER_ID, handleLandClick);
      map.off("click", LAND_MARK_ZERO_LAYER_ID, handleLandClick);
      map.off("click", LAND_MARK_MISSING_LAYER_ID, handleLandClick);
      map.off("mouseenter", LAND_MARK_FILL_LAYER_ID, handleLandEnter);
      map.off("mouseenter", LAND_MARK_GLOW_LAYER_ID, handleLandEnter);
      map.off("mouseenter", LAND_MARK_SOLID_LAYER_ID, handleLandEnter);
      map.off("mouseenter", LAND_MARK_ZERO_LAYER_ID, handleLandEnter);
      map.off("mouseenter", LAND_MARK_MISSING_LAYER_ID, handleLandEnter);
      map.off("mouseleave", LAND_MARK_FILL_LAYER_ID, handleLandLeave);
      map.off("mouseleave", LAND_MARK_GLOW_LAYER_ID, handleLandLeave);
      map.off("mouseleave", LAND_MARK_SOLID_LAYER_ID, handleLandLeave);
      map.off("mouseleave", LAND_MARK_ZERO_LAYER_ID, handleLandLeave);
      map.off("mouseleave", LAND_MARK_MISSING_LAYER_ID, handleLandLeave);
    };
  }, [styledLand, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    const updateOverlay = () => setOverlay(buildOverlayState(map, geos));
    updateOverlay();
    map.on("move", updateOverlay);
    map.on("resize", updateOverlay);
    return () => {
      map.off("move", updateOverlay);
      map.off("resize", updateOverlay);
    };
  }, [geos, mapReady]);

  return (
    <div className="map-canvas">
      <div ref={containerRef} className="maplibre-canvas" aria-hidden="true" />
      <p className="sr-only">
        Map of 22 Pacific geographies shown as presence marks over Natural Earth land context.
        Active layer: {activeLayerLabel}. The map is a comparative screen, not a definitive ranking.
      </p>

      <svg className="map-overlay-svg" aria-hidden="true">
        <defs>
          <pattern id="hatchOverlay" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#a8bdc7" strokeWidth="1.4" />
          </pattern>
        </defs>

        <g className="graticule-labels">
          {overlay.lonLines.map((line) => (
            <text key={`lonlab-${line.id}`} x={line.x2} y={line.y2 + 16} textAnchor="middle">
              {line.label}
            </text>
          ))}
          {overlay.latLines.map((line) => (
            <text key={`latlab-${line.id}`} x={line.x1 - 8} y={line.y1 + 3} textAnchor="end">
              {line.label}
            </text>
          ))}
        </g>

        <g className="subregion-labels">
          {SUBREGION_ANCHORS.map((s) => {
            const point = overlay.subregions[s.name];
            if (!point) return null;
            return (
              <text key={s.name} x={point.x} y={point.y} textAnchor="middle">
                {s.name}
              </text>
            );
          })}
        </g>

        <g className="atlas-status-overlay">
          {geos.map((geo) => {
            const point = overlay.points[geo.code];
            if (!point) return null;
            const r = radiusFor(geo.indicators);
            const variant = ringVariant(geo.reportingStatus);
            const isPriority = viewMode === "coverage" && priorityCodes.includes(geo.code);

            return (
              <g key={`status-${geo.code}`}>
                {isPriority && <circle cx={point.x} cy={point.y} r={r + 9} className="atlas-point__priority" />}
                {variant === "hatch" && (
                  <circle cx={point.x} cy={point.y} r={r} fill="url(#hatchOverlay)" className="atlas-point__hatch" />
                )}
                {variant === "dashed" && (
                  <circle cx={point.x} cy={point.y} r={r + 1} className="atlas-point__dash" />
                )}
              </g>
            );
          })}
        </g>

        <g className="map-labels">
          {geos.map((geo) => {
            if (!labelCodes.has(geo.code)) return null;
            const point = overlay.points[geo.code];
            if (!point) return null;
            const r = geo.code === selectedCode ? 0 : radiusFor(geo.indicators);
            const off = LABEL_OFFSETS[geo.code] ?? { dx: 0, dy: -22 };
            // Clamp middle-anchored labels inside the map so edge exemplars stay readable.
            const mapWidth = mapRef.current?.getContainer().clientWidth ?? 0;
            const halfLabel = geo.name.length * 3.4 + 4;
            const rawLx = point.x + off.dx;
            const lx = mapWidth > 0 ? Math.min(Math.max(rawLx, halfLabel), mapWidth - halfLabel) : rawLx;
            const ly = point.y + off.dy;
            const isSelected = geo.code === selectedCode;
            const below = off.dy > 0;
            const anchorY = below ? point.y + r : point.y - r;
            const cls = "map-label" + (isSelected ? " map-label--selected" : "");

            let tag = "";
            if (viewMode === "coverage") {
              if (geo.reportingStatus === "reported_zero_latest_count") tag = "reports 0";
              else if (geo.reportingStatus === "missing_monitoring_dataset_row") tag = "no rows";
            }

            return (
              <g key={`lbl-${geo.code}`} className={cls}>
                <line className="map-label__lead" x1={point.x} y1={anchorY} x2={lx} y2={ly + (below ? -4 : 4)} />
                <text x={lx} y={ly} textAnchor="middle" className="map-label__name">
                  {geo.name}
                </text>
                {tag && (
                  <text x={lx} y={ly + 13} textAnchor="middle" className="map-label__tag">
                    {tag}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="map-a11y-layer" role="group" aria-label={`Selectable Pacific geographies. Active layer: ${activeLayerLabel}.`}>
        {geos.map((geo) => {
          const point = overlay.points[geo.code];
          if (!point) return null;
          const r = radiusFor(geo.indicators) + 10;
          const dimmed =
            (hasSelection && geo.code !== selectedCode) ||
            (viewMode === "coverage" && !priorityCodes.includes(geo.code) && geo.storyPriority > 3);

          return (
            <button
              key={`hit-${geo.code}`}
              type="button"
              className="map-a11y-point"
              style={{
                left: point.x,
                top: point.y,
                width: Math.max(44, r * 2),
                height: Math.max(44, r * 2),
              }}
              aria-label={`${geo.name}. ${geo.storyLabel}. Rank moves ${geo.rankMin} to ${geo.rankMax}.`}
              aria-pressed={geo.code === selectedCode}
              data-dimmed={dimmed ? "true" : "false"}
              onClick={() => onSelect(geo.code)}
            />
          );
        })}
      </div>

      <p className="map-note">
        Natural Earth island texture is grouped by nearest centroid. Scored geographies are not boundary polygons.
      </p>
    </div>
  );
}
