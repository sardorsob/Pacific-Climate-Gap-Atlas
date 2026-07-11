import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import maplibregl, {
  type FilterSpecification,
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
  type StyleSpecification,
} from "maplibre-gl";
import type { Geo } from "../../lib/atlasData";
import { assignLandAnchors, buildGraticuleFeatureCollection, mapMotionDuration, shiftPacificLon, toMapLibreCollection, type AtlasFeatureCollection } from "./atlasMapModel";

export type AtlasMapProjection = (lon: number, lat: number) => { x: number; y: number } | null;

export type UseAtlasMapOptions = {
  geos: Geo[];
  atlasFeatures: AtlasFeatureCollection;
  selectedCode: string | null;
  focusSelection: boolean;
  panelOpen: boolean;
  panelExpanded: boolean;
  onSelect: (code: string) => void;
  reducedMotion: boolean;
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
const GRATICULE_SOURCE_ID = "atlas-graticule";
const GRATICULE_LAYER_ID = "atlas-graticule-lines";
const GRATICULE_EQUATOR_LAYER_ID = "atlas-graticule-equator";
const PRIORITY_LAYER_ID = "atlas-priority-halos";
const SELECTED_PRESENCE_LAYER_ID = "atlas-selected-presence";
const POINT_LAYER_ID = "atlas-centroid-points";
const ANCHOR_FILTER: FilterSpecification = ["!=", "anchorCode", ""];
const MOTION_TARGETS = [
  { layer: PRIORITY_LAYER_ID, paint: ["circle-radius", "circle-opacity", "circle-stroke-width"] },
  { layer: SELECTED_PRESENCE_LAYER_ID, paint: ["circle-radius", "circle-opacity", "circle-color"] },
  { layer: POINT_LAYER_ID, paint: ["circle-radius", "circle-color", "circle-opacity", "circle-stroke-color"] },
  { layer: LAND_MARK_FILL_LAYER_ID, paint: ["fill-color", "fill-opacity"] },
  { layer: LAND_MARK_GLOW_LAYER_ID, paint: ["line-color", "line-width", "line-opacity"] },
  { layer: LAND_MARK_SOLID_LAYER_ID, paint: ["line-color", "line-width", "line-opacity"] },
  { layer: LAND_MARK_ZERO_LAYER_ID, paint: ["line-color", "line-width", "line-opacity"] },
  { layer: LAND_MARK_MISSING_LAYER_ID, paint: ["line-color", "line-width", "line-opacity"] },
] as const;
const PACIFIC_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: "ocean", type: "background", paint: { "background-color": "#0a1d2a" } }],
};

function anchorStatusFilter(status: string): FilterSpecification {
  return ["all", ["!=", "anchorCode", ""], ["==", "reportingStatus", status]] as FilterSpecification;
}

function cameraForViewport(width: number): { center: [number, number]; zoom: number } {
  if (width < 520) return { center: [182.5, -29], zoom: 1.38 };
  if (width < 900) return { center: [185, -7], zoom: 2.05 };
  return { center: [185, -6], zoom: 3.15 };
}

function selectedCameraForViewport(width: number, geo: Geo): { center: [number, number]; zoom: number } {
  const base = cameraForViewport(width);
  return { center: [shiftPacificLon(geo.lon), geo.lat], zoom: width < 520 ? base.zoom : Math.min(base.zoom + 0.2, 3.45) };
}

function fitPacificCamera(map: MapLibreMap, duration = 0) {
  map.stop();
  map.easeTo({ ...cameraForViewport(map.getContainer().clientWidth), duration });
}

function focusSelectedCamera(map: MapLibreMap, geo: Geo, reducedMotion: boolean) {
  map.stop();
  map.easeTo({
    ...selectedCameraForViewport(map.getContainer().clientWidth, geo),
    duration: mapMotionDuration(reducedMotion),
  });
}

function asGeoJson(collection: unknown): GeoJSON.FeatureCollection {
  return collection as GeoJSON.FeatureCollection;
}

function styleAnchoredLand(collection: GeoJSON.FeatureCollection | null, features: AtlasFeatureCollection["features"]): GeoJSON.FeatureCollection | null {
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

function syncAtlasSource(map: MapLibreMap, collection: AtlasFeatureCollection) {
  const source = map.getSource(MAP_SOURCE_ID) as GeoJSONSource | undefined;
  if (source) source.setData(asGeoJson(collection));
}

function syncMapMotion(map: MapLibreMap, reducedMotion: boolean) {
  const transition = { duration: mapMotionDuration(reducedMotion), delay: 0 };
  for (const target of MOTION_TARGETS) {
    if (!map.getLayer(target.layer)) continue;
    for (const property of target.paint) map.setPaintProperty(target.layer, `${property}-transition`, transition);
  }
}

function syncLandContext(map: MapLibreMap, collection: GeoJSON.FeatureCollection | null, reducedMotion: boolean) {
  if (!collection) return;
  if (!map.isStyleLoaded()) {
    window.setTimeout(() => syncLandContext(map, collection, reducedMotion), 50);
    return;
  }
  const source = map.getSource(LAND_SOURCE_ID) as GeoJSONSource | undefined;
  if (source) source.setData(collection);
  else map.addSource(LAND_SOURCE_ID, { type: "geojson", data: collection });

  const beforeId = map.getLayer(GRATICULE_LAYER_ID) ? GRATICULE_LAYER_ID : undefined;
  if (!map.getLayer(LAND_FILL_LAYER_ID)) map.addLayer({ id: LAND_FILL_LAYER_ID, type: "fill", source: LAND_SOURCE_ID, paint: { "fill-color": "#173240", "fill-opacity": 0.74 } }, beforeId);
  if (!map.getLayer(LAND_LINE_LAYER_ID)) map.addLayer({ id: LAND_LINE_LAYER_ID, type: "line", source: LAND_SOURCE_ID, paint: { "line-color": "rgba(205, 226, 233, 0.18)", "line-width": 0.7 } }, beforeId);
  if (!map.getLayer(LAND_MARK_FILL_LAYER_ID)) map.addLayer({ id: LAND_MARK_FILL_LAYER_ID, type: "fill", source: LAND_SOURCE_ID, filter: ANCHOR_FILTER, paint: { "fill-color": ["get", "fillColor"], "fill-opacity": ["get", "markOpacity"] } }, beforeId);
  if (!map.getLayer(LAND_MARK_GLOW_LAYER_ID)) map.addLayer({ id: LAND_MARK_GLOW_LAYER_ID, type: "line", source: LAND_SOURCE_ID, filter: ANCHOR_FILTER, paint: { "line-color": ["get", "fillColor"], "line-width": ["case", ["==", ["get", "selected"], true], 6, 4], "line-blur": 1.4, "line-opacity": ["get", "glowOpacity"] } }, beforeId);
  if (!map.getLayer(LAND_MARK_SOLID_LAYER_ID)) map.addLayer({ id: LAND_MARK_SOLID_LAYER_ID, type: "line", source: LAND_SOURCE_ID, filter: anchorStatusFilter("reported_positive_latest_count"), paint: { "line-color": ["get", "strokeColor"], "line-width": ["case", ["==", ["get", "selected"], true], 2.2, 1.3], "line-opacity": ["get", "markOpacity"] } }, beforeId);
  if (!map.getLayer(LAND_MARK_ZERO_LAYER_ID)) map.addLayer({ id: LAND_MARK_ZERO_LAYER_ID, type: "line", source: LAND_SOURCE_ID, filter: anchorStatusFilter("reported_zero_latest_count"), paint: { "line-color": ["get", "strokeColor"], "line-width": ["case", ["==", ["get", "selected"], true], 2.2, 1.3], "line-dasharray": [2, 2], "line-opacity": ["get", "markOpacity"] } }, beforeId);
  if (!map.getLayer(LAND_MARK_MISSING_LAYER_ID)) map.addLayer({ id: LAND_MARK_MISSING_LAYER_ID, type: "line", source: LAND_SOURCE_ID, filter: anchorStatusFilter("missing_monitoring_dataset_row"), paint: { "line-color": ["get", "strokeColor"], "line-width": ["case", ["==", ["get", "selected"], true], 2.2, 1.3], "line-dasharray": [1, 2], "line-opacity": ["get", "markOpacity"] } }, beforeId);
  syncMapMotion(map, reducedMotion);
}

function addGraticuleLayers(map: MapLibreMap) {
  if (!map.getSource(GRATICULE_SOURCE_ID)) map.addSource(GRATICULE_SOURCE_ID, { type: "geojson", data: asGeoJson(buildGraticuleFeatureCollection()) });
  if (!map.getLayer(GRATICULE_LAYER_ID)) map.addLayer({ id: GRATICULE_LAYER_ID, type: "line", source: GRATICULE_SOURCE_ID, filter: ["!=", ["get", "value"], 0], paint: { "line-color": "rgba(150, 190, 205, 0.16)", "line-width": 1 } });
  if (!map.getLayer(GRATICULE_EQUATOR_LAYER_ID)) map.addLayer({ id: GRATICULE_EQUATOR_LAYER_ID, type: "line", source: GRATICULE_SOURCE_ID, filter: ["all", ["==", ["get", "kind"], "latitude"], ["==", ["get", "value"], 0]], paint: { "line-color": "rgba(150, 190, 205, 0.3)", "line-dasharray": [2, 5], "line-width": 1 } });
}

function addAtlasLayers(map: MapLibreMap, collection: AtlasFeatureCollection, reducedMotion: boolean) {
  if (!map.getSource(MAP_SOURCE_ID)) map.addSource(MAP_SOURCE_ID, { type: "geojson", data: asGeoJson(collection) });
  if (!map.getLayer(PRIORITY_LAYER_ID)) map.addLayer({ id: PRIORITY_LAYER_ID, type: "circle", source: MAP_SOURCE_ID, filter: ["==", ["get", "priority"], true], paint: { "circle-radius": ["+", ["get", "radius"], 9], "circle-color": "rgba(255, 213, 138, 0.03)", "circle-stroke-color": "#ffd58a", "circle-stroke-width": 2, "circle-opacity": ["get", "opacity"] } });
  if (!map.getLayer(SELECTED_PRESENCE_LAYER_ID)) map.addLayer({ id: SELECTED_PRESENCE_LAYER_ID, type: "circle", source: MAP_SOURCE_ID, filter: ["==", ["get", "selected"], true], paint: { "circle-radius": ["+", ["get", "radius"], 10], "circle-color": ["get", "fillColor"], "circle-opacity": 0, "circle-blur": 0.45, "circle-stroke-color": "rgba(255, 255, 255, 0.72)", "circle-stroke-width": 1.2 } });
  if (!map.getLayer(POINT_LAYER_ID)) map.addLayer({ id: POINT_LAYER_ID, type: "circle", source: MAP_SOURCE_ID, paint: { "circle-radius": ["get", "radius"], "circle-color": ["get", "fillColor"], "circle-opacity": 0, "circle-stroke-color": "transparent", "circle-stroke-width": 0 } });
  syncMapMotion(map, reducedMotion);
}

function projectMap(map: MapLibreMap, lon: number, lat: number): { x: number; y: number } {
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

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReduced(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);
  return reduced;
}

export function useAtlasMap(options: UseAtlasMapOptions): {
  containerRef: RefObject<HTMLDivElement>;
  project: AtlasMapProjection;
  mapReady: boolean;
} {
  const { geos, atlasFeatures, selectedCode, focusSelection, panelOpen, panelExpanded, onSelect, reducedMotion: reducedMotionProp } = options;
  const prefersReducedMotion = usePrefersReducedMotion();
  const reducedMotion = reducedMotionProp || prefersReducedMotion;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const reducedMotionRef = useRef(reducedMotion);
  const [mapReady, setMapReady] = useState(false);
  const [landContext, setLandContext] = useState<GeoJSON.FeatureCollection | null>(null);
  const [projectRevision, setProjectRevision] = useState(0);
  const mapLibreFeatures = useMemo(() => toMapLibreCollection(atlasFeatures), [atlasFeatures]);
  const anchoredLand = useMemo(() => (landContext && geos.length > 0 ? assignLandAnchors(landContext, geos) : landContext), [landContext, geos]);
  const styledLand = useMemo(() => styleAnchoredLand(anchoredLand, atlasFeatures.features), [anchoredLand, atlasFeatures.features]);
  const mapLibreFeaturesRef = useRef(mapLibreFeatures);
  const landContextRef = useRef<GeoJSON.FeatureCollection | null>(styledLand);
  const geosRef = useRef(geos);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { reducedMotionRef.current = reducedMotion; }, [reducedMotion]);
  useEffect(() => { mapLibreFeaturesRef.current = mapLibreFeatures; }, [mapLibreFeatures]);
  useEffect(() => { landContextRef.current = styledLand; }, [styledLand]);
  useEffect(() => { geosRef.current = geos; }, [geos]);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/pacific_land_context.geojson")
      .then((response) => { if (!response.ok) throw new Error(`Failed to load land context: ${response.status}`); return response.json() as Promise<GeoJSON.FeatureCollection>; })
      .then((data) => { if (!cancelled) setLandContext(data); })
      .catch(() => { if (!cancelled) setLandContext(null); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: containerRef.current, style: PACIFIC_STYLE, center: [185, -7], zoom: 3.15, minZoom: 1.25, maxZoom: 7, attributionControl: false, renderWorldCopies: true, dragRotate: false, pitchWithRotate: false });
    mapRef.current = map;
    if (import.meta.env.DEV) (window as unknown as { __atlasMap?: MapLibreMap }).__atlasMap = map;
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    fitPacificCamera(map);
    const handlePointClick = (event: MapLayerMouseEvent) => { const code = event.features?.[0]?.properties?.code; if (typeof code === "string") onSelectRef.current(code); };
    const handlePointEnter = () => { map.getCanvas().style.cursor = "pointer"; };
    const handlePointLeave = () => { map.getCanvas().style.cursor = ""; };
    const refreshProjection = () => setProjectRevision((value) => value + 1);
    const refitOnResize = () => { map.resize(); fitPacificCamera(map); refreshProjection(); };
    const handleLoad = () => {
      addGraticuleLayers(map);
      syncLandContext(map, landContextRef.current, reducedMotionRef.current);
      addAtlasLayers(map, mapLibreFeaturesRef.current, reducedMotionRef.current);
      map.on("click", POINT_LAYER_ID, handlePointClick);
      map.on("mouseenter", POINT_LAYER_ID, handlePointEnter);
      map.on("mouseleave", POINT_LAYER_ID, handlePointLeave);
      setMapReady(true);
      refreshProjection();
      requestAnimationFrame(refreshProjection);
    };
    map.on("load", handleLoad);
    map.on("move", refreshProjection);
    map.on("resize", refreshProjection);
    window.addEventListener("resize", refitOnResize);
    return () => {
      setMapReady(false);
      map.off("load", handleLoad);
      map.off("move", refreshProjection);
      map.off("resize", refreshProjection);
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

  useEffect(() => { const map = mapRef.current; if (!mapReady || !map) return; syncAtlasSource(map, mapLibreFeatures); }, [mapLibreFeatures, mapReady]);
  useEffect(() => { const map = mapRef.current; if (!mapReady || !map) return; syncLandContext(map, styledLand, reducedMotion); }, [styledLand, mapReady, reducedMotion]);
  useEffect(() => { const map = mapRef.current; if (!mapReady || !map) return; syncMapMotion(map, reducedMotion); }, [mapReady, reducedMotion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !map.getLayer(LAND_MARK_FILL_LAYER_ID)) return;
    const handleLandClick = (event: MapLayerMouseEvent) => { const code = event.features?.[0]?.properties?.anchorCode; if (typeof code === "string") onSelectRef.current(code); };
    const handleLandEnter = () => { map.getCanvas().style.cursor = "pointer"; };
    const handleLandLeave = () => { map.getCanvas().style.cursor = ""; };
    const layers = [LAND_MARK_FILL_LAYER_ID, LAND_MARK_GLOW_LAYER_ID, LAND_MARK_SOLID_LAYER_ID, LAND_MARK_ZERO_LAYER_ID, LAND_MARK_MISSING_LAYER_ID];
    for (const layer of layers) { map.on("click", layer, handleLandClick); map.on("mouseenter", layer, handleLandEnter); map.on("mouseleave", layer, handleLandLeave); }
    return () => { for (const layer of layers) { map.off("click", layer, handleLandClick); map.off("mouseenter", layer, handleLandEnter); map.off("mouseleave", layer, handleLandLeave); } };
  }, [styledLand, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const selectedGeo = selectedCode ? geos.find((geo) => geo.code === selectedCode) : null;
    if (!selectedGeo) { fitPacificCamera(map, mapMotionDuration(reducedMotion)); return; }
    const width = map.getContainer().clientWidth;
    const height = map.getContainer().clientHeight;
    const point = projectMap(map, selectedGeo.lon, selectedGeo.lat);
    const pointVisible = point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;
    const panelTop = width < 760 ? height - (panelExpanded ? height * 0.7 : 60) : height;
    const pointCoveredByPanel = panelOpen && (width < 760 ? point.y >= panelTop : point.x >= width - 400);
    const shouldReframe = !pointVisible || pointCoveredByPanel;
    if (focusSelection || shouldReframe) focusSelectedCamera(map, selectedGeo, reducedMotion);
  }, [focusSelection, geos, mapReady, panelExpanded, panelOpen, reducedMotion, selectedCode]);

  const project = useCallback<AtlasMapProjection>((lon, lat) => {
    const map = mapRef.current;
    return map ? projectMap(map, lon, lat) : null;
  }, [mapReady, projectRevision]);

  return { containerRef, project, mapReady };
}
