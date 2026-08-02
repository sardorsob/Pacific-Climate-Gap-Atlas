import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Geo } from "../../lib/atlasData";
import { signedChange } from "../../lib/encoding";
import {
  buildRegionalPositionModel,
  type RegionalPositionObservation,
  type RegionalPositionStrip,
} from "./regionalPositionModel";

const METRICS = {
  water: "Safely managed drinking-water change",
  renewable: "Renewable-energy-share change",
  visibility: "Reviewed datasets represented",
} as const;

function valueLabel(strip: RegionalPositionStrip, value: number) {
  return strip.denominator ? `${value} of ${strip.denominator}` : `${signedChange(value)} percentage points`;
}

function position(value: number, [min, max]: [number, number]) {
  return 16 + ((value - min) / (max - min)) * 288;
}

function stripSummary(strip: RegionalPositionStrip, name: string, clock: string | null) {
  const selected = strip.selected.value === null
    ? `${name} unavailable for a comparable period in the reviewed regional series`
    : `${strip.id === "visibility" ? "Selected" : "Selected:"} ${name} ${valueLabel(strip, strip.selected.value)}`;
  const range = strip.extent
    ? `observed range ${valueLabel(strip, strip.extent[0])} to ${valueLabel(strip, strip.extent[1])}`
    : "no observed range";
  const median = strip.median === null ? "no regional median" : `regional median ${valueLabel(strip, strip.median)}`;
  return `${METRICS[strip.id]}. ${selected}; ${range}${clock ? `; reviewed clock ${clock}` : ""}; ${median}; ${strip.applicable.length} applicable; ${strip.unavailableCount} unavailable.`;
}

function VisibilityStrip({ strip, name }: { strip: RegionalPositionStrip; name: string }) {
  const extent = strip.extent;
  const scale = strip.scaleExtent;
  const summary = stripSummary(strip, name, null);
  const selectedAvailable = strip.selected.state === "available" && strip.selected.value !== null;

  return (
    <section className="regional-lens__strip" data-regional-strip={strip.id} role="img" aria-label={summary}>
      <div className="regional-lens__label" aria-hidden="true">
        <strong>{METRICS[strip.id]}</strong>
        <span>{selectedAvailable ? <>Selected: {name} {valueLabel(strip, strip.selected.value!)}</> : `${name} unavailable for a comparable period in the reviewed regional series`}</span>
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

function nearestObservation(strip: RegionalPositionStrip, x: number) {
  return strip.applicable.reduce((nearest, observation) => {
    if (!strip.scaleExtent) return nearest;
    return Math.abs(position(observation.value, strip.scaleExtent) - x)
      < Math.abs(position(nearest.value, strip.scaleExtent) - x)
      ? observation
      : nearest;
  });
}

function inspectedLabel(observation: RegionalPositionObservation) {
  const clock = observation.firstYear !== null && observation.latestYear !== null
    ? `${observation.firstYear} to ${observation.latestYear}`
    : "years unavailable";
  return `${observation.name}: ${signedChange(observation.value)} points · ${clock}`;
}

function ContinuousStrip({ strip, name, clock }: { strip: RegionalPositionStrip; name: string; clock: string | null }) {
  const plotRef = useRef<SVGSVGElement>(null);
  const [inspected, setInspected] = useState<RegionalPositionObservation | null>(null);
  const [sticky, setSticky] = useState(false);
  const extent = strip.extent;
  const scale = strip.scaleExtent;
  const selectedAvailable = strip.selected.state === "available" && strip.selected.value !== null;
  const selectedObservation = strip.applicable.find((observation) => observation.code === strip.selected.code);
  const summary = stripSummary(strip, name, clock);
  const inspectorId = `${strip.id}-inspector`;
  const instructionsId = `${strip.id}-inspector-instructions`;

  const clearInspection = () => {
    setInspected(null);
    setSticky(false);
  };

  useEffect(clearInspection, [strip.selected.code]);

  useEffect(() => {
    const clearOutside = (event: globalThis.PointerEvent) => {
      if (!plotRef.current?.contains(event.target as Node)) clearInspection();
    };
    document.addEventListener("pointerdown", clearOutside, true);
    return () => document.removeEventListener("pointerdown", clearOutside, true);
  }, []);

  const observationAtPointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return nearestObservation(strip, ((event.clientX - bounds.left) / bounds.width) * 320);
  };

  const inspectByKeyboard = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key === "Escape") {
      clearInspection();
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const inspectedIndex = inspected ? strip.applicable.findIndex(({ code }) => code === inspected.code) : -1;
    const selectedIndex = selectedObservation ? strip.applicable.indexOf(selectedObservation) : -1;
    const start = inspectedIndex >= 0 ? inspectedIndex : selectedIndex >= 0 ? selectedIndex : direction > 0 ? -1 : strip.applicable.length;
    const next = Math.max(0, Math.min(strip.applicable.length - 1, start + direction));
    setInspected(strip.applicable[next]);
    setSticky(false);
  };

  return (
    <section
      className="regional-lens__strip regional-lens__strip--continuous"
      data-regional-strip={strip.id}
    >
      <div className="regional-lens__head">
        <h3 className="regional-lens__title">{METRICS[strip.id]}</h3>
        {selectedAvailable ? (
          <p className="regional-lens__readout">
            <strong className="regional-lens__value">{signedChange(strip.selected.value!)}</strong><span>points</span>
            {clock && <span className="regional-lens__clock">{clock}</span>}
          </p>
        ) : (
          <p className="regional-lens__readout regional-lens__readout--unavailable" aria-label={extent ? undefined : summary}>
            <strong className="regional-lens__unavailable">Unavailable</strong>{" "}
            <span>No comparable period in the reviewed regional series</span>
          </p>
        )}
      </div>
      <span id={instructionsId} className="sr-only">Use Left and Right to inspect regional peers; Escape clears inspection.</span>
      {extent && scale && <svg
        ref={plotRef}
        data-continuous-plot
        className="regional-lens__plot regional-lens__plot--continuous"
        viewBox="0 0 320 80"
        role="img"
        aria-label={summary}
        aria-describedby={`${instructionsId} ${inspectorId}`}
        tabIndex={0}
        focusable="true"
        style={{ touchAction: "manipulation" }}
        onKeyDown={inspectByKeyboard}
        onBlur={clearInspection}
        onPointerMove={(event) => {
          if (event.pointerType !== "touch") setInspected(observationAtPointer(event));
        }}
        onPointerLeave={() => {
          if (!sticky) setInspected(null);
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "touch") {
            setInspected(observationAtPointer(event));
            setSticky(true);
          }
        }}
      >
        <rect className="regional-lens__hit-band" x="8" y="22" width="304" height="44" fill="transparent" style={{ pointerEvents: "all" }} aria-hidden="true" />
        <line className="regional-lens__axis" x1="16" x2="304" y1="44" y2="44" aria-hidden="true" />
        <line data-zero-reference className="regional-lens__axis" x1={position(0, scale)} x2={position(0, scale)} y1="28" y2="58" aria-hidden="true" />
        <text className="regional-lens__zero-label" x={position(0, scale)} y="24" textAnchor="middle" aria-hidden="true">0</text>
        {strip.applicable.map((observation) => (
          <circle
            key={observation.code}
            data-peer-mark
            className="regional-lens__peer"
            cx={position(observation.value, scale)}
            cy={44 - observation.lane * 3}
            r="2.8"
            aria-hidden="true"
          />
        ))}
        {strip.median !== null && (
          <>
            <line data-continuous-median className="regional-lens__median" x1={position(strip.median, scale)} x2={position(strip.median, scale)} y1="18" y2="58" aria-hidden="true" />
            <text className="regional-lens__median-label" x={position(strip.median, scale)} y="13" textAnchor="middle" aria-hidden="true">regional median {signedChange(strip.median)}</text>
          </>
        )}
        {inspected && <line data-inspection-cursor className="regional-lens__median regional-lens__cursor" x1={position(inspected.value, scale)} x2={position(inspected.value, scale)} y1="30" y2="58" aria-hidden="true" />}
        {selectedAvailable && <circle data-selected-mark className="regional-lens__selected" cx={position(strip.selected.value!, scale)} cy={44 - (selectedObservation?.lane ?? 0) * 3} r="5" aria-hidden="true" />}
        <text data-endpoint="low" x={position(extent[0], scale)} y="78" textAnchor="start" aria-hidden="true">{signedChange(extent[0])}</text>
        <text data-endpoint="high" x={position(extent[1], scale)} y="78" textAnchor="end" aria-hidden="true">{signedChange(extent[1])}</text>
      </svg>}
      <p id={inspectorId} className="regional-lens__meta regional-lens__inspector" aria-live="polite" aria-atomic="true">
        {inspected ? inspectedLabel(inspected) : `${strip.applicable.length} recorded · ${strip.unavailableCount} unavailable`}
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
        return strip.id === "visibility"
          ? <VisibilityStrip key={strip.id} strip={strip} name={geo.name} />
          : <ContinuousStrip key={strip.id} strip={strip} name={geo.name} clock={clock} />;
      })}
    </section>
  );
}
