import { useMemo, useRef } from "react";
import type { Geo } from "../../lib/atlasData";
import { LABEL_OFFSETS, STORY_EXEMPLARS, SUBREGION_ANCHORS } from "../../lib/atlasData";
import type { ScoreKey } from "../../lib/encoding";
import { PRESENCE_RADIUS } from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";
import type { SceneVisual } from "../../lib/scenes";
import { buildGraticuleFeatureCollection, fitBoundsForPacific, type AtlasFeatureCollection } from "./atlasMapModel";
import type { AtlasMapProjection } from "./useAtlasMap";
import { EvidenceMark } from "./EvidenceMark";
import { buildEvidenceMark } from "./evidenceMarkModel";

type MapOverlayProps = {
  geos: Geo[];
  project: AtlasMapProjection;
  selectedCode: string | null;
  activeScore: ScoreKey;
  sceneVisual: SceneVisual | null;
  onSelect: (code: string) => void;
  atlasFeatures: AtlasFeatureCollection;
  viewMode: ViewMode;
  priorityCodes: string[];
  activeLayerLabel: string;
};

type ScreenPoint = { x: number; y: number };
type GraticuleLine = { id: string; label: string; x1: number; y1: number; x2: number; y2: number };
type OverlayState = { points: Record<string, ScreenPoint>; subregions: Record<string, ScreenPoint>; lonLines: GraticuleLine[]; latLines: GraticuleLine[] };

const EMPTY_OVERLAY: OverlayState = { points: {}, subregions: {}, lonLines: [], latLines: [] };

function lonLabel(shiftLon: number): string {
  const real = shiftLon > 180 ? shiftLon - 360 : shiftLon;
  if (real === 180 || real === -180) return "180\u00b0";
  if (real === 0) return "0\u00b0";
  return `${Math.abs(real)}\u00b0${real > 0 ? "E" : "W"}`;
}

function buildOverlayState(project: AtlasMapProjection, geos: Geo[]): OverlayState {
  const bounds = fitBoundsForPacific();
  const points: Record<string, ScreenPoint> = {};
  for (const geo of geos) {
    const point = project(geo.lon, geo.lat);
    if (point) points[geo.code] = point;
  }
  const subregions: Record<string, ScreenPoint> = {};
  for (const anchor of SUBREGION_ANCHORS) {
    const point = project(anchor.lon, anchor.lat);
    if (point) subregions[anchor.name] = point;
  }
  const lonLines = buildGraticuleFeatureCollection().features
    .filter((feature) => feature.properties.kind === "longitude")
    .map((feature) => {
      const lon = feature.properties.value;
      const top = project(lon, bounds[1][1]);
      const bottom = project(lon, bounds[0][1]);
      if (!top || !bottom) return null;
      return { id: `lon-${lon}`, label: lonLabel(lon), x1: top.x, y1: top.y, x2: bottom.x, y2: bottom.y };
    })
    .filter((line): line is GraticuleLine => line !== null);
  const latLines = buildGraticuleFeatureCollection().features
    .filter((feature) => feature.properties.kind === "latitude")
    .map((feature) => {
      const lat = feature.properties.value;
      const left = project(bounds[0][0], lat);
      const right = project(bounds[1][0], lat);
      if (!left || !right) return null;
      return { id: `lat-${lat}`, label: lat === 0 ? "0\u00b0" : `${Math.abs(lat)}\u00b0${lat > 0 ? "N" : "S"}`, x1: left.x, y1: left.y, x2: right.x, y2: right.y };
    })
    .filter((line): line is GraticuleLine => line !== null);
  return { points, subregions, lonLines, latLines };
}

export function MapOverlay({ geos, project, selectedCode, activeScore, sceneVisual, onSelect, atlasFeatures, viewMode, priorityCodes, activeLayerLabel }: MapOverlayProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const overlay = useMemo(() => buildOverlayState(project, geos), [geos, project]);
  const hasSelection = selectedCode !== null;
  const labelCodes = useMemo(() => {
    const codes = new Set<string>(viewMode === "coverage" ? priorityCodes : STORY_EXEMPLARS);
    if (selectedCode) codes.add(selectedCode);
    return codes;
  }, [priorityCodes, selectedCode, viewMode]);
  const featureByCode = useMemo(() => new Map(atlasFeatures.features.map((feature) => [feature.properties.code, feature])), [atlasFeatures]);
  const mapWidth = svgRef.current?.clientWidth ?? 0;

  return (
    <>
      <svg ref={svgRef} className="map-overlay-svg" aria-hidden="true" data-scene-visual={sceneVisual ?? undefined}>
        <g className="graticule-labels">
          {overlay.lonLines.map((line) => <text key={`lonlab-${line.id}`} x={line.x2} y={line.y2 + 16} textAnchor="middle">{line.label}</text>)}
          {overlay.latLines.map((line) => <text key={`latlab-${line.id}`} x={line.x1 - 8} y={line.y1 + 3} textAnchor="end">{line.label}</text>)}
        </g>
        <g className="subregion-labels">
          {SUBREGION_ANCHORS.map((s) => {
            const point = overlay.subregions[s.name];
            return point ? <text key={s.name} x={point.x} y={point.y} textAnchor="middle">{s.name}</text> : null;
          })}
        </g>
        <g className="atlas-evidence-marks">
          {geos.map((geo) => {
            const point = overlay.points[geo.code];
            if (!point) return null;
            const feature = featureByCode.get(geo.code);
            return (
              <g key={`status-${geo.code}`}>
                <EvidenceMark x={point.x - 22} y={point.y - 22} size={44} model={buildEvidenceMark(geo, { scoreKey: activeScore, selected: geo.code === selectedCode })} scoreFill={feature?.properties.fillColor} decorative className="map-evidence-mark" />
              </g>
            );
          })}
        </g>
        <g className="map-labels">
          {geos.map((geo) => {
            if (!labelCodes.has(geo.code)) return null;
            const point = overlay.points[geo.code];
            if (!point) return null;
            const r = geo.code === selectedCode ? 0 : 22;
            const off = LABEL_OFFSETS[geo.code] ?? { dx: 0, dy: -22 };
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
                <text x={lx} y={ly} textAnchor="middle" className="map-label__name">{geo.name}</text>
                {tag && <text x={lx} y={ly + 13} textAnchor="middle" className="map-label__tag">{tag}</text>}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="map-a11y-layer" role="group" aria-label={`Selectable Pacific geographies. Active layer: ${activeLayerLabel}.`}>
        {geos.map((geo) => {
          const point = overlay.points[geo.code];
          if (!point) return null;
          const r = PRESENCE_RADIUS + 10;
          const dimmed = (hasSelection && geo.code !== selectedCode) || (viewMode === "coverage" && !priorityCodes.includes(geo.code) && geo.storyPriority > 3);
          return <button key={`hit-${geo.code}`} type="button" className="map-a11y-point" style={{ left: point.x, top: point.y, width: Math.max(44, r * 2), height: Math.max(44, r * 2) }} aria-label={`${geo.name}. ${geo.storyLabel}. Rank moves ${geo.rankMin} to ${geo.rankMax}.`} aria-pressed={geo.code === selectedCode} data-dimmed={dimmed ? "true" : "false"} onClick={() => onSelect(geo.code)} />;
        })}
      </div>
      <p className="map-note">Natural Earth island texture is grouped by nearest centroid. Scored geographies are not boundary polygons.</p>
    </>
  );
}
