import type { Geo, ReportingStatus } from "../../lib/atlasData";
import type { ScoreKey } from "../../lib/encoding";
import {
  PRESENCE_RADIUS,
  ringVariant,
  scoreColor,
  uncertaintyColor,
  valueForScore,
} from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";

export const GRATICULE_LONS = [140, 160, 180, 200, 220];
export const GRATICULE_LATS = [-20, -10, 0, 10];

export type AtlasMapState = {
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
  selectedCode: string | null;
  priorityCodes: string[];
};

export type AtlasPointProperties = {
  code: string;
  name: string;
  storyLabel: string;
  scoreValue: number | null;
  fillColor: string;
  strokeColor: string;
  radius: number;
  opacity: number;
  selected: boolean;
  priority: boolean;
  dimmed: boolean;
  withheld: boolean;
  reportingStatus: ReportingStatus;
  ringVariant: ReturnType<typeof ringVariant>;
  strokeDasharray: number[] | null;
  hatch: boolean;
  geometryStatus: "centroid_fallback";
};

export type AtlasPointFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: AtlasPointProperties;
};

export type AtlasFeatureCollection = {
  type: "FeatureCollection";
  features: AtlasPointFeature[];
};

export type GraticuleFeature = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [[number, number], [number, number]];
  };
  properties: {
    kind: "longitude" | "latitude";
    value: number;
  };
};

export type GraticuleFeatureCollection = {
  type: "FeatureCollection";
  features: GraticuleFeature[];
};

const MAP_MOTION_MS = 560;
const OVERVIEW_FILL = "#64777f";
const OVERVIEW_STROKE = "#d4dde2";
// Render-only sentinel that makes every overview land outline solid. It does
// not mutate or reinterpret the geography's source reporting status.
const OVERVIEW_RENDERING_STATUS: ReportingStatus = "reported_positive_latest_count";

export function mapMotionDuration(reducedMotion: boolean): number {
  return reducedMotion ? 0 : MAP_MOTION_MS;
}

export function shouldReframeSelection({
  pointVisible,
  pointCoveredByPanel,
}: {
  pointVisible: boolean;
  pointCoveredByPanel: boolean;
}): boolean {
  return !pointVisible || pointCoveredByPanel;
}

export function fitBoundsForPacific(): [[number, number], [number, number]] {
  return [[130, -30], [240, 20]];
}

export function shiftPacificLon(lon: number): number {
  return lon < 0 ? lon + 360 : lon;
}

export function toMapLibreCollection(collection: AtlasFeatureCollection): AtlasFeatureCollection {
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

export function buildGraticuleFeatureCollection(options?: {
  longitudes?: number[];
  latitudes?: number[];
  bounds?: [[number, number], [number, number]];
}): GraticuleFeatureCollection {
  const longitudes = options?.longitudes ?? GRATICULE_LONS;
  const latitudes = options?.latitudes ?? GRATICULE_LATS;
  const bounds = options?.bounds ?? fitBoundsForPacific();
  const [[minLon, minLat], [maxLon, maxLat]] = bounds;

  return {
    type: "FeatureCollection",
    features: [
      ...longitudes.map((lon) => ({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: [[lon, minLat], [lon, maxLat]] as [[number, number], [number, number]],
        },
        properties: { kind: "longitude" as const, value: lon },
      })),
      ...latitudes.map((lat) => ({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: [[minLon, lat], [maxLon, lat]] as [[number, number], [number, number]],
        },
        properties: { kind: "latitude" as const, value: lat },
      })),
    ],
  };
}

export function markerPaintFor(status: ReportingStatus): {
  strokeColor: string;
  strokeDasharray: number[] | null;
  hatch: boolean;
} {
  const variant = ringVariant(status);
  if (variant === "hatch") {
    return { strokeColor: "#9fb4bf", strokeDasharray: [1, 2], hatch: true };
  }
  if (variant === "dashed") {
    return { strokeColor: "#d4dde2", strokeDasharray: [2, 2], hatch: false };
  }
  return { strokeColor: "rgba(6,16,24,0.62)", strokeDasharray: null, hatch: false };
}

export function buildAtlasFeatureCollection(geos: Geo[], state: AtlasMapState): AtlasFeatureCollection {
  const hasSelection = state.selectedCode !== null;

  return {
    type: "FeatureCollection",
    features: geos.map((geo) => {
      const overview = state.viewMode === "overview";
      const isSelected = geo.code === state.selectedCode;
      const isPriority = state.viewMode === "coverage" && state.priorityCodes.includes(geo.code);
      const withheld = !overview && state.outlookOn && geo.outlookDisplay === "withhold";
      const dimmed =
        (hasSelection && !isSelected) ||
        (state.viewMode === "coverage" && !isPriority && geo.storyPriority > 3);
      const scoreValue = scoreValueFor(geo, state, withheld);
      const paint = overview
        ? { strokeColor: OVERVIEW_STROKE, strokeDasharray: null, hatch: false }
        : markerPaintFor(geo.reportingStatus);
      const reportingStatus = overview ? OVERVIEW_RENDERING_STATUS : geo.reportingStatus;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [geo.lon, geo.lat],
        },
        properties: {
          code: geo.code,
          name: geo.name,
          storyLabel: geo.storyLabel,
          scoreValue,
          fillColor: overview ? OVERVIEW_FILL : markerFillFor(geo, state),
          strokeColor: withheld ? "#9fb4bf" : paint.strokeColor,
          radius: PRESENCE_RADIUS,
          opacity: dimmed ? 0.32 : 1,
          selected: isSelected,
          priority: isPriority,
          dimmed,
          withheld,
          reportingStatus,
          ringVariant: ringVariant(reportingStatus),
          strokeDasharray: withheld ? [1, 2] : paint.strokeDasharray,
          hatch: paint.hatch,
          geometryStatus: "centroid_fallback",
        },
      };
    }),
  };
}

function scoreValueFor(geo: Geo, state: AtlasMapState, withheld: boolean): number | null {
  if (state.viewMode === "overview") return null;
  if (withheld) return null;
  if (state.outlookOn) return geo.outlook2030Flat;
  if (state.viewMode === "uncertainty") return geo.rankRange;
  if (state.viewMode === "coverage") return null;
  return valueForScore(geo, state.activeScore);
}

function markerFillFor(geo: Geo, state: AtlasMapState): string {
  if (state.viewMode === "overview") return OVERVIEW_FILL;
  if (state.outlookOn) {
    if (geo.outlookDisplay === "withhold") return "transparent";
    return scoreColor("gap", geo.outlook2030Flat);
  }
  if (state.viewMode === "uncertainty") return uncertaintyColor(geo.rankRange);
  if (state.viewMode === "coverage") return "#64777f";
  return scoreColor(state.activeScore, valueForScore(geo, state.activeScore));
}

// Tag each visual land feature with the geo code of its nearest scored
// centroid so selection can halo a place's island shapes. This is a distance
// grouping for highlighting only - not a boundary, territory, or area source.
// Features beyond the cutoff stay unassigned, which by construction leaves
// far context land (Hawaii, New Zealand, Australia) and the disputed
// Matthew & Hunter islands without an anchor.
export function assignLandAnchors(
  land: GeoJSON.FeatureCollection,
  geos: Pick<Geo, "code" | "lon" | "lat">[],
  maxDeg = 3.5,
): GeoJSON.FeatureCollection {
  const centroids = geos.map((geo) => ({
    code: geo.code,
    lon: geo.lon < 0 ? geo.lon + 360 : geo.lon,
    lat: geo.lat,
  }));
  const maxSq = maxDeg * maxDeg;

  return {
    ...land,
    features: land.features.map((feature) => {
      const geometry = feature.geometry;
      let anchorCode: string | null = null;
      if (geometry && (geometry.type === "Polygon" || geometry.type === "MultiPolygon")) {
        const ring =
          geometry.type === "Polygon" ? geometry.coordinates[0] : geometry.coordinates[0]?.[0];
        if (ring && ring.length > 0) {
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;
          for (const [x, y] of ring) {
            const sx = x < 0 ? x + 360 : x;
            if (sx < minX) minX = sx;
            if (sx > maxX) maxX = sx;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;
          let bestSq = Infinity;
          for (const c of centroids) {
            const dSq = (c.lon - cx) ** 2 + (c.lat - cy) ** 2;
            if (dSq < bestSq) {
              bestSq = dSq;
              anchorCode = c.code;
            }
          }
          if (bestSq > maxSq) anchorCode = null;
        }
      }
      return {
        ...feature,
        properties: { ...feature.properties, anchorCode: anchorCode ?? "" },
      };
    }),
  };
}
