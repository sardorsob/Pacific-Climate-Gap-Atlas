import type { Geo } from "../../lib/atlasData";
import { buildRegionalPositionModel, type RegionalPositionStrip } from "./regionalPositionModel";

const METRICS = {
  water: "Safely managed drinking-water change",
  renewable: "Renewable-energy-share change",
  visibility: "Reviewed datasets represented",
} as const;

function signed(value: number) {
  if (Object.is(value, -0) || value === 0) return "0.00";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}`;
}

function valueLabel(strip: RegionalPositionStrip, value: number) {
  return strip.denominator ? `${value} of ${strip.denominator}` : `${signed(value)} percentage points`;
}

function position(value: number, [min, max]: [number, number]) {
  return 16 + ((value - min) / (max - min)) * 288;
}

function stripSummary(strip: RegionalPositionStrip, name: string) {
  const selected = strip.selected.value === null
    ? `${name} unavailable for a comparable period in the reviewed regional series`
    : `Selected ${name} ${valueLabel(strip, strip.selected.value)}`;
  const median = strip.median === null ? "no regional median" : `regional median ${valueLabel(strip, strip.median)}`;
  return `${METRICS[strip.id]}. ${selected}; ${median}; ${strip.applicable.length} applicable; ${strip.unavailableCount} unavailable.`;
}

function Strip({ strip, name, clock }: { strip: RegionalPositionStrip; name: string; clock: string | null }) {
  const extent = strip.extent;
  const scale = strip.scaleExtent;
  const summary = stripSummary(strip, name);
  const selectedAvailable = strip.selected.state === "available" && strip.selected.value !== null;

  return (
    <section className="regional-lens__strip" data-regional-strip={strip.id} role="img" aria-label={summary}>
      <div className="regional-lens__label" aria-hidden="true">
        <strong>{METRICS[strip.id]}</strong>
        <span>{selectedAvailable ? <>Selected: {name} {valueLabel(strip, strip.selected.value!)}{clock && <> · <small>{clock}</small></>}</> : `${name} unavailable for a comparable period in the reviewed regional series`}</span>
      </div>
      {extent && scale && (
        <svg className="regional-lens__plot" viewBox="0 0 320 46" aria-hidden="true">
          <line className="regional-lens__axis" x1="16" x2="304" y1="20" y2="20" aria-hidden="true" />
          {strip.applicable.map((observation) => (
            <circle
              key={observation.code}
              data-peer-mark
              className="regional-lens__peer"
              cx={position(observation.value, scale)}
              cy={20 - observation.lane * 2}
              r="2.8"
              aria-hidden="true"
            />
          ))}
          {strip.median !== null && <line data-median-tick className="regional-lens__median" x1={position(strip.median, scale)} x2={position(strip.median, scale)} y1="8" y2="32" aria-hidden="true" />}
          {selectedAvailable && <circle data-selected-mark className="regional-lens__selected" cx={position(strip.selected.value!, scale)} cy={20 - (strip.applicable.find((observation) => observation.code === strip.selected.code)?.lane ?? 0) * 2} r="5" aria-hidden="true" />}
          <text x={position(extent[0], scale)} y="44" textAnchor="start" aria-hidden="true">{valueLabel(strip, extent[0])}</text>
          <text x={position(extent[1], scale)} y="44" textAnchor="end" aria-hidden="true">{valueLabel(strip, extent[1])}</text>
        </svg>
      )}
      <p className="regional-lens__meta" aria-hidden="true">
        {strip.median !== null && <span>regional median {valueLabel(strip, strip.median)}</span>}
        <span>{strip.applicable.length} applicable</span>
        {strip.unavailableCount > 0 && <span data-unavailable-count>{strip.unavailableCount} unavailable</span>}
      </p>
    </section>
  );
}

export function RegionalPositionLens({ geo, geos }: { geo: Geo; geos: Geo[] }) {
  return (
    <section className="regional-lens" aria-labelledby="regional-position-heading">
      <h2 className="panel__h" id="regional-position-heading">Where {geo.name} sits in the Pacific</h2>
      {buildRegionalPositionModel(geos, geo.code).map((strip) => {
        const measure = strip.id === "visibility" ? null : geo.regionalStory[strip.id];
        const clock = measure && measure.firstYear !== null && measure.latestYear !== null
          ? `${measure.firstYear} to ${measure.latestYear}`
          : null;
        return <Strip key={strip.id} strip={strip} name={geo.name} clock={clock} />;
      })}
    </section>
  );
}
