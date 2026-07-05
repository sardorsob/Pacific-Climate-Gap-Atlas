import type { Geo, ReportingStatus } from "../../lib/atlasData";
import type { ScoreKey } from "../../lib/encoding";
import {
  radiusFor,
  ringVariant,
  scoreColor,
  uncertaintyColor,
  valueForScore,
} from "../../lib/encoding";
import { GRATICULE_LATS, GRATICULE_LONS } from "../../lib/projection";
import type { ViewMode } from "../../lib/types";

export type AtlasMapState = {
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
  selectedCode: string | null;
  compareCode: string | null;
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
  compare: boolean;
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

export function fitBoundsForPacific(): [[number, number], [number, number]] {
  return [[130, -30], [240, 20]];
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
      const isSelected = geo.code === state.selectedCode;
      const isCompare = geo.code === state.compareCode && geo.code !== state.selectedCode;
      const isPriority = state.viewMode === "coverage" && state.priorityCodes.includes(geo.code);
      const withheld = state.outlookOn && geo.outlookDisplay === "withhold";
      const dimmed =
        (hasSelection && !isSelected && geo.code !== state.compareCode) ||
        (state.viewMode === "coverage" && !isPriority && geo.storyPriority > 3);
      const scoreValue = scoreValueFor(geo, state, withheld);
      const paint = markerPaintFor(geo.reportingStatus);

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
          fillColor: markerFillFor(geo, state),
          strokeColor: withheld ? "#9fb4bf" : paint.strokeColor,
          radius: radiusFor(geo.indicators),
          opacity: dimmed ? 0.32 : 1,
          selected: isSelected,
          compare: isCompare,
          priority: isPriority,
          dimmed,
          withheld,
          reportingStatus: geo.reportingStatus,
          ringVariant: ringVariant(geo.reportingStatus),
          strokeDasharray: withheld ? [1, 2] : paint.strokeDasharray,
          hatch: paint.hatch,
          geometryStatus: "centroid_fallback",
        },
      };
    }),
  };
}

function scoreValueFor(geo: Geo, state: AtlasMapState, withheld: boolean): number | null {
  if (withheld) return null;
  if (state.outlookOn) return geo.outlook2030Flat;
  if (state.viewMode === "uncertainty") return geo.rankRange;
  if (state.viewMode === "coverage") return null;
  return valueForScore(geo, state.activeScore);
}

function markerFillFor(geo: Geo, state: AtlasMapState): string {
  if (state.outlookOn) {
    if (geo.outlookDisplay === "withhold") return "transparent";
    return scoreColor("gap", geo.outlook2030Flat);
  }
  if (state.viewMode === "uncertainty") return uncertaintyColor(geo.rankRange);
  if (state.viewMode === "coverage") return "#64777f";
  return scoreColor(state.activeScore, valueForScore(geo, state.activeScore));
}

// Nearest visual land feature to a scored centroid, in shifted Pacific
// longitude space. Used only to draw an orientation tick; it is not a
// territorial attribution or boundary join.
export function nearestLandCenter(
  lon: number,
  lat: number,
  land: GeoJSON.FeatureCollection,
): { lon: number; lat: number } | null {
  const shifted = lon < 0 ? lon + 360 : lon;
  let best: { lon: number; lat: number } | null = null;
  let bestDist = Infinity;
  for (const feature of land.features) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    const polygons =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.type === "MultiPolygon"
          ? geometry.coordinates
          : [];
    for (const polygon of polygons) {
      const ring = polygon[0];
      if (!ring || ring.length === 0) continue;
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
      const dist = (cx - shifted) ** 2 + (cy - lat) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        best = { lon: cx, lat: cy };
      }
    }
  }
  return best;
}

export type ViewfinderGeometry = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cornerLen: number;
  tick: { x1: number; y1: number; x2: number; y2: number } | null;
};

// Screen geometry for the selection viewfinder: a fixed +/-1.6 deg window
// clamped to sane pixel sizes, plus an optional tick to the nearest island.
// Pure so the clamp and tick-suppression rules stay unit-testable.
export function viewfinderGeometry(options: {
  point: { x: number; y: number };
  pxPerDeg: { x: number; y: number };
  minViewportSide: number;
  geoLon: number;
  geoLat: number;
  pointRadius: number;
  landCenter: { lon: number; lat: number } | null;
}): ViewfinderGeometry {
  const { point, pxPerDeg, minViewportSide, geoLon, geoLat, pointRadius, landCenter } = options;
  const half = Math.min(Math.max(1.6 * pxPerDeg.x, 45), minViewportSide * 0.17);
  const cornerLen = Math.min(14, half * 0.3);

  let tick: ViewfinderGeometry["tick"] = null;
  if (landCenter) {
    const shifted = geoLon < 0 ? geoLon + 360 : geoLon;
    const tx = point.x + (landCenter.lon - shifted) * pxPerDeg.x;
    const ty = point.y - (landCenter.lat - geoLat) * pxPerDeg.y;
    const dist = Math.hypot(tx - point.x, ty - point.y);
    if (dist > pointRadius + 8) {
      const ux = (tx - point.x) / dist;
      const uy = (ty - point.y) / dist;
      tick = {
        x1: point.x + ux * (pointRadius + 3),
        y1: point.y + uy * (pointRadius + 3),
        x2: tx,
        y2: ty,
      };
    }
  }

  return {
    x0: point.x - half,
    y0: point.y - half,
    x1: point.x + half,
    y1: point.y + half,
    cornerLen,
    tick,
  };
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
        properties: { ...feature.properties, anchorCode },
      };
    }),
  };
}
