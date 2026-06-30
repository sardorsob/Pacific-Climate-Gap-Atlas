import type { KeyboardEvent } from "react";
import type { Geo } from "../../mock/mockAtlasData";
import { LABEL_OFFSETS, PRIORITY_ONE, STORY_EXEMPLARS, SUBREGION_ANCHORS } from "../../mock/mockAtlasData";
import type { ScoreKey } from "../../lib/encoding";
import {
  radiusFor,
  ringVariant,
  scoreColor,
  uncertaintyColor,
  valueForScore,
} from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";
import { GRATICULE_LATS, GRATICULE_LONS, gridX, gridY, projectPoint } from "../../lib/projection";

const W = 1000;
const H = 600;
const PAD = 54;

type AtlasMapProps = {
  geos: Geo[];
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
  selectedCode: string | null;
  compareCode: string | null;
  onSelect: (code: string) => void;
  activeLayerLabel: string;
};

function fillFor(geo: Geo, activeScore: ScoreKey, viewMode: ViewMode, outlookOn: boolean): string {
  if (outlookOn) {
    if (geo.outlookDisplay === "withhold") return "transparent";
    return scoreColor("gap", geo.outlook2030Flat);
  }
  if (viewMode === "uncertainty") return uncertaintyColor(geo.rankRange);
  if (viewMode === "coverage") return "#64777f"; // neutral: coverage reads status via rings, not score
  return scoreColor(activeScore, valueForScore(geo, activeScore));
}

function lonLabel(shiftLon: number): string {
  const real = shiftLon > 180 ? shiftLon - 360 : shiftLon;
  if (real === 180 || real === -180) return "180\u00b0";
  if (real === 0) return "0\u00b0";
  return `${Math.abs(real)}\u00b0${real > 0 ? "E" : "W"}`;
}

export function AtlasMap({
  geos,
  activeScore,
  viewMode,
  outlookOn,
  selectedCode,
  compareCode,
  onSelect,
  activeLayerLabel,
}: AtlasMapProps) {
  const hasSelection = selectedCode !== null;

  // Which geographies carry a direct map label.
  const labelCodes = new Set<string>(viewMode === "coverage" ? PRIORITY_ONE : STORY_EXEMPLARS);
  if (selectedCode) labelCodes.add(selectedCode);
  if (selectedCode && compareCode && compareCode !== selectedCode) labelCodes.add(compareCode);

  const onKey = (event: KeyboardEvent<SVGGElement>, code: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(code);
    }
  };

  return (
    <div className="map-canvas">
      <svg
        className="map-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Map of 22 Pacific geographies as centroid points. Active layer: ${activeLayerLabel}. A comparative screen, not a definitive ranking.`}
      >
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#22323b" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#88a3b1" strokeWidth="1.6" />
          </pattern>
          <radialGradient id="oceanGlow" cx="62%" cy="14%" r="85%">
            <stop offset="0%" stopColor="#15384a" />
            <stop offset="60%" stopColor="#0d2535" />
            <stop offset="100%" stopColor="#0a1d2a" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#oceanGlow)" />

        {/* graticule + tick labels for GIS flavour */}
        <g className="graticule" aria-hidden="true">
          {GRATICULE_LONS.map((lon) => (
            <line key={`lon-${lon}`} x1={gridX(lon, W, PAD)} y1={PAD} x2={gridX(lon, W, PAD)} y2={H - PAD} />
          ))}
          {GRATICULE_LATS.map((lat) => (
            <line
              key={`lat-${lat}`}
              className={lat === 0 ? "graticule__equator" : undefined}
              x1={PAD}
              y1={gridY(lat, H, PAD)}
              x2={W - PAD}
              y2={gridY(lat, H, PAD)}
            />
          ))}
        </g>
        <g className="graticule-labels" aria-hidden="true">
          {GRATICULE_LONS.map((lon) => (
            <text key={`lonlab-${lon}`} x={gridX(lon, W, PAD)} y={H - PAD + 16} textAnchor="middle">
              {lonLabel(lon)}
            </text>
          ))}
          {GRATICULE_LATS.map((lat) => (
            <text key={`latlab-${lat}`} x={PAD - 8} y={gridY(lat, H, PAD) + 3} textAnchor="end">
              {lat === 0 ? "0\u00b0" : `${Math.abs(lat)}\u00b0${lat > 0 ? "N" : "S"}`}
            </text>
          ))}
        </g>

        {/* faint subregion orientation (descriptive groupings, not boundaries) */}
        <g className="subregion-labels" aria-hidden="true">
          {SUBREGION_ANCHORS.map((s) => {
            const { x, y } = projectPoint(s.lon, s.lat, W, H, PAD);
            return (
              <text key={s.name} x={x} y={y} textAnchor="middle">
                {s.name}
              </text>
            );
          })}
        </g>

        {/* points */}
        {geos.map((geo) => {
          const { x, y } = projectPoint(geo.lon, geo.lat, W, H, PAD);
          const r = radiusFor(geo.indicators);
          const variant = ringVariant(geo.reportingStatus);
          const fill = fillFor(geo, activeScore, viewMode, outlookOn);
          const isSelected = geo.code === selectedCode;
          const isPriority = viewMode === "coverage" && PRIORITY_ONE.includes(geo.code);
          const withheld = outlookOn && geo.outlookDisplay === "withhold";
          const dimmed =
            (hasSelection && !isSelected && geo.code !== compareCode) ||
            (viewMode === "coverage" && !isPriority && geo.storyPriority > 3);

          return (
            <g
              key={geo.code}
              className={`atlas-point${dimmed ? " atlas-point--dim" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${geo.name}. ${geo.storyLabel}. Rank moves ${geo.rankMin} to ${geo.rankMax}.`}
              onClick={() => onSelect(geo.code)}
              onKeyDown={(e) => onKey(e, geo.code)}
            >
              {isPriority && <circle cx={x} cy={y} r={r + 9} className="atlas-point__priority" />}

              {variant === "hatch" ? (
                <circle cx={x} cy={y} r={r} fill="url(#hatch)" stroke="#9fb4bf" strokeWidth={1.6} strokeDasharray="2 3" />
              ) : variant === "dashed" ? (
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={withheld ? "transparent" : fill}
                  fillOpacity={withheld ? 0 : 0.4}
                  stroke="#d4dde2"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
              ) : (
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={withheld ? "transparent" : fill}
                  stroke={withheld ? "#9fb4bf" : "rgba(6,16,24,0.6)"}
                  strokeWidth={withheld ? 1.4 : 1.2}
                  strokeDasharray={withheld ? "2 3" : undefined}
                />
              )}

              {isSelected && (
                <g className="atlas-point__select" aria-hidden="true">
                  {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => {
                    const d = r + 8;
                    const len = 7;
                    return (
                      <path
                        key={i}
                        d={`M ${x + sx * d} ${y + sy * d - sy * len} L ${x + sx * d} ${y + sy * d} L ${x + sx * d - sx * len} ${y + sy * d}`}
                      />
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}

        {/* direct labels layer (drawn on top so they read above marks) */}
        <g className="map-labels" aria-hidden="true">
          {geos.map((geo) => {
            if (!labelCodes.has(geo.code)) return null;
            const { x, y } = projectPoint(geo.lon, geo.lat, W, H, PAD);
            const r = radiusFor(geo.indicators);
            const off = LABEL_OFFSETS[geo.code] ?? { dx: 0, dy: -22 };
            const lx = x + off.dx;
            const ly = y + off.dy;
            const isSelected = geo.code === selectedCode;
            const isCompare = geo.code === compareCode && geo.code !== selectedCode && hasSelection;
            const below = off.dy > 0;
            const anchorY = below ? y + r : y - r;
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
                <line className="map-label__lead" x1={x} y1={anchorY} x2={lx} y2={ly + (below ? -4 : 4)} />
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

      <p className="map-note">Centroid fallback, not boundary geometry. Mockup composition - not a true projection.</p>
    </div>
  );
}
