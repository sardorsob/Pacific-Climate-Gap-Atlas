import type { Geo } from "../../lib/atlasData";
import { scoreColor } from "../../lib/encoding";
import { EvidenceMark } from "../map/EvidenceMark";
import { buildEvidenceMark } from "../map/evidenceMarkModel";

type PressureCapacitySceneProps = {
  geos: Geo[];
};

function lobePath(side: "pressure" | "capacity", value: number): string {
  const span = 26 + Math.max(0, Math.min(100, value)) * 0.58;
  const center = 136;
  if (side === "pressure") {
    const edge = center - span;
    return `M ${center - 8} 60 C ${center - 26} 22, ${edge + 12} 22, ${edge} 60 C ${edge + 12} 98, ${center - 26} 98, ${center - 8} 60 Z`;
  }
  const edge = center + span;
  return `M ${center + 8} 60 C ${center + 26} 22, ${edge - 12} 22, ${edge} 60 C ${edge - 12} 98, ${center + 26} 98, ${center + 8} 60 Z`;
}

export function PressureCapacityScene({ geos }: PressureCapacitySceneProps) {
  return (
    <figure className="pressure-capacity-figure">
      <div className="pressure-capacity-figure__legend" aria-hidden="true">
        <span className="pressure-capacity-figure__key pressure-capacity-figure__key--pressure">Climate pressure</span>
        <span className="pressure-capacity-figure__key pressure-capacity-figure__key--capacity">Visible capacity</span>
      </div>
      <div className="pressure-capacity-figure__rows">
        {geos.slice(0, 2).map((geo) => (
          <div className="pressure-capacity-figure__row" key={geo.code}>
            <div className="pressure-capacity-figure__anchor">
              <EvidenceMark
                model={buildEvidenceMark(geo, { scoreKey: "gap", selected: false })}
                label={`${geo.name} gap anchor`}
                size={44}
                scoreFill={scoreColor("gap", geo.gap)}
              />
              <figcaption>{geo.name}</figcaption>
            </div>
            <div
              className="pressure-capacity-figure__lobes"
              role="img"
              aria-label={`${geo.name}: climate pressure ${geo.pressure.toFixed(0)}, visible capacity ${geo.capacity.toFixed(0)}`}
            >
              <svg viewBox="0 0 260 120" aria-hidden="true" focusable="false">
                <path className="pressure-capacity-figure__lobe pressure-capacity-figure__lobe--pressure" d={lobePath("pressure", geo.pressure)} />
                <path className="pressure-capacity-figure__lobe pressure-capacity-figure__lobe--capacity" d={lobePath("capacity", geo.capacity)} />
                <circle className="pressure-capacity-figure__anchor-dot" cx="136" cy="60" r="3" />
                <text x="61" y="114" textAnchor="middle">{geo.pressure.toFixed(0)}</text>
                <text x="211" y="114" textAnchor="middle">{geo.capacity.toFixed(0)}</text>
              </svg>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="pressure-capacity-figure__caption">The gap is the visible distance between these two records.</figcaption>
    </figure>
  );
}
