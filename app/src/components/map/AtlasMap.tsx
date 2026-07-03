import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, {
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
  buildGraticuleFeatureCollection,
  buildAtlasFeatureCollection,
  fitBoundsForPacific,
  type AtlasFeatureCollection,
} from "./atlasMapModel";

type AtlasMapProps = {
  geos: Geo[];
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
  selectedCode: string | null;
  compareCode: string | null;
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
};

const EMPTY_OVERLAY: OverlayState = { points: {}, subregions: {}, lonLines: [], latLines: [] };
const MAP_SOURCE_ID = "atlas-points";
const LAND_SOURCE_ID = "pacific-land-context";
const LAND_FILL_LAYER_ID = "pacific-land-context-fill";
const LAND_LINE_LAYER_ID = "pacific-land-context-line";
const GRATICULE_SOURCE_ID = "atlas-graticule";
const GRATICULE_LAYER_ID = "atlas-graticule-lines";
const GRATICULE_EQUATOR_LAYER_ID = "atlas-graticule-equator";
const PRIORITY_LAYER_ID = "atlas-priority-halos";
const POINT_LAYER_ID = "atlas-centroid-points";
const SELECTED_LAYER_ID = "atlas-selected-halos";

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

function shiftPacificLon(lon: number): number {
  return lon < 0 ? lon + 360 : lon;
}

function toMapLibreCollection(collection: AtlasFeatureCollection): AtlasFeatureCollection {
  return {
    ...collection,
    features: collection.features.map((feature) => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: [
          shiftPacificLon(feature.geometry.coordinates[0]),
          feature.geometry.coordinates[1],
        ],
      },
    })),
  };
}

function asGeoJson(collection: unknown): GeoJSON.FeatureCollection {
  return collection as unknown as GeoJSON.FeatureCollection;
}

function cameraForViewport(width: number): { center: [number, number]; zoom: number } {
  if (width < 520) return { center: [186, -7], zoom: 1.55 };
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

  if (!map.getLayer(POINT_LAYER_ID)) {
    map.addLayer({
      id: POINT_LAYER_ID,
      type: "circle",
      source: MAP_SOURCE_ID,
      paint: {
        "circle-radius": ["get", "radius"],
        "circle-color": ["get", "fillColor"],
        "circle-opacity": ["case", ["get", "withheld"], 0, ["get", "opacity"]],
        "circle-stroke-color": ["get", "strokeColor"],
        "circle-stroke-width": ["case", ["get", "withheld"], 1.4, 1.2],
      },
    });
  }

  if (!map.getLayer(SELECTED_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_LAYER_ID,
      type: "circle",
      source: MAP_SOURCE_ID,
      filter: ["==", ["get", "selected"], true],
      paint: {
        "circle-radius": ["+", ["get", "radius"], 13],
        "circle-color": "transparent",
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1.4,
        "circle-opacity": 0.95,
      },
    });
  }
}

function project(map: MapLibreMap, lon: number, lat: number): ScreenPoint {
  const point = map.project([shiftPacificLon(lon), lat]);
  return { x: point.x, y: point.y };
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

  return { points, subregions, lonLines, latLines };
}

export function AtlasMap({
  geos,
  activeScore,
  viewMode,
  outlookOn,
  selectedCode,
  compareCode,
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
      compareCode,
      priorityCodes,
    }),
    [activeScore, compareCode, geos, outlookOn, priorityCodes, selectedCode, viewMode],
  );
  const mapLibreFeatures = useMemo(() => toMapLibreCollection(atlasFeatures), [atlasFeatures]);
  const mapLibreFeaturesRef = useRef(mapLibreFeatures);
  const landContextRef = useRef<GeoJSON.FeatureCollection | null>(landContext);
  const geosRef = useRef(geos);

  const labelCodes = useMemo(() => {
    const codes = new Set<string>(viewMode === "coverage" ? priorityCodes : STORY_EXEMPLARS);
    if (selectedCode) codes.add(selectedCode);
    if (selectedCode && compareCode && compareCode !== selectedCode) codes.add(compareCode);
    return codes;
  }, [compareCode, priorityCodes, selectedCode, viewMode]);

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
    landContextRef.current = landContext;
  }, [landContext]);

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
      renderWorldCopies: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;

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
    syncLandContext(map, landContext);
  }, [landContext, mapReady]);

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
        Map of 22 Pacific geographies shown as centroid points over Natural Earth land context.
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
            const isSelected = geo.code === selectedCode;
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
                {isSelected && (
                  <g className="atlas-point__select">
                    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => {
                      const d = r + 8;
                      const len = 7;
                      return (
                        <path
                          key={i}
                          d={`M ${point.x + sx * d} ${point.y + sy * d - sy * len} L ${point.x + sx * d} ${point.y + sy * d} L ${point.x + sx * d - sx * len} ${point.y + sy * d}`}
                        />
                      );
                    })}
                  </g>
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
            const r = radiusFor(geo.indicators);
            const off = LABEL_OFFSETS[geo.code] ?? { dx: 0, dy: -22 };
            const lx = point.x + off.dx;
            const ly = point.y + off.dy;
            const isSelected = geo.code === selectedCode;
            const isCompare = geo.code === compareCode && geo.code !== selectedCode && hasSelection;
            const below = off.dy > 0;
            const anchorY = below ? point.y + r : point.y - r;
            const cls =
              "map-label" +
              (isSelected ? " map-label--selected" : "") +
              (isCompare ? " map-label--compare" : "");

            let tag = "";
            if (viewMode === "coverage") {
              if (geo.reportingStatus === "reported_zero_latest_count") tag = "reports 0";
              else if (geo.reportingStatus === "missing_monitoring_dataset_row") tag = "no rows";
            }

            return (
              <g key={`lbl-${geo.code}`} className={cls}>
                <line className="map-label__lead" x1={point.x} y1={anchorY} x2={lx} y2={ly + (below ? -4 : 4)} />
                <text x={lx} y={ly} textAnchor="middle" className="map-label__name">
                  {isCompare ? `vs ${geo.name}` : geo.name}
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
            (hasSelection && geo.code !== selectedCode && geo.code !== compareCode) ||
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
        Natural Earth land context under centroid points. Scored geographies are not boundary polygons.
      </p>
    </div>
  );
}
