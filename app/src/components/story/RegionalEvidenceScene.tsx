import type { CSSProperties } from "react";
import type { Geo, RegionalStoryMeasure } from "../../lib/atlasData";
import { signedChange } from "../../lib/encoding";
import { EvidenceMark } from "../map/EvidenceMark";
import { buildEvidenceMark } from "../map/evidenceMarkModel";
import { buildRegionalEvidenceModel, type RegionalEvidenceModel } from "./regionalEvidenceModel";

export type RegionalEvidenceMode = "movement" | "visibility";

type RegionalEvidenceSceneProps = {
  geos: Geo[];
  mode: RegionalEvidenceMode;
};

const LABEL_OFFSETS: Record<string, readonly [number, number]> = {
  AS: [-24, -18],
  CK: [-24, -18],
  FM: [24, -18],
  MP: [24, 18],
  NC: [24, -18],
  NR: [24, -18],
  NU: [24, 18],
  PW: [24, 22],
  TO: [-24, 18],
  WF: [-26, 22],
};

function years(measure: RegionalStoryMeasure): string {
  return measure.firstYear === null || measure.latestYear === null
    ? "years unavailable"
    : `${measure.firstYear}–${measure.latestYear}`;
}

function shortMeasure(label: string, measure: RegionalStoryMeasure): string {
  return measure.changePercentagePoints === null
    ? `${label} unavailable`
    : `${label} ${signedChange(measure.changePercentagePoints)} pp, ${years(measure)}`;
}

function fullMeasure(label: string, measure: RegionalStoryMeasure): string {
  return measure.changePercentagePoints === null
    ? `${label} unavailable`
    : `${label} ${signedChange(measure.changePercentagePoints)} percentage points, ${years(measure)}`;
}

function scale(value: number, domain: [number, number], reverse = false): number {
  const [start, end] = domain;
  const ratio = start === end ? 0.5 : (value - start) / (end - start);
  const percent = 7 + ratio * 86;
  return reverse ? 100 - percent : percent;
}

function tick(value: number): string {
  return Number.isInteger(value) ? value.toFixed(0) : signedChange(value);
}

function readableRole(role: string): string {
  return role.replace(/_/g, " ");
}

function dataHooks(model: RegionalEvidenceModel, mode: RegionalEvidenceMode) {
  return {
    "data-mode": mode,
    "data-complete-count": model.movement.complete.length,
    "data-incomplete-count": model.movement.incomplete.length,
    "data-present-count": model.visibility.presentCount,
    "data-absent-count": model.visibility.absentCount,
  };
}

function MovementField({ model }: { model: RegionalEvidenceModel }) {
  const { movement } = model;
  const zeroX = scale(0, movement.renewableDomain);
  const zeroY = scale(0, movement.waterDomain, true);
  const quadrantFacts = [
    ["Water up, renewable down", movement.quadrantCounts.waterUpRenewableDown],
    ["Both up", movement.quadrantCounts.bothUp],
    ["Both down", movement.quadrantCounts.bothDown],
    ["Water down, renewable up", movement.quadrantCounts.waterDownRenewableUp],
  ] as const;

  return (
    <figure
      className="regional-evidence regional-evidence--movement"
      data-stage-figure="regional-movement"
      {...dataHooks(model, "movement")}
      aria-label="Regional movement evidence for 22 Pacific geographies"
    >
      <div className="regional-evidence__summary">
        <strong>{movement.complete.length} complete</strong>
        <span>{movement.incomplete.length} incomplete</span>
      </div>
      <ul className="regional-evidence__quadrants" aria-label="Movement direction counts">
        {quadrantFacts.map(([label, count]) => (
          <li key={label}><span>{label}</span><strong>{count}</strong></li>
        ))}
      </ul>
      <div
        className="regional-evidence__movement-plot"
        aria-label={`Signed comparison field. Renewable energy share ranges from ${tick(movement.renewableDomain[0])} to ${tick(movement.renewableDomain[1])} percentage points. Safely managed drinking water ranges from ${tick(movement.waterDomain[0])} to ${tick(movement.waterDomain[1])} percentage points.`}
      >
        <span className="regional-evidence__axis-label regional-evidence__axis-label--water">Safely managed drinking water change (percentage points)</span>
        <span className="regional-evidence__axis-label regional-evidence__axis-label--renewable">Renewable energy share change (percentage points)</span>
        {[movement.renewableDomain[0], 0, movement.renewableDomain[1]].map((value) => (
          <span
            className="regional-evidence__axis-tick regional-evidence__axis-tick--x"
            key={`x-${value}`}
            style={{ left: `${scale(value, movement.renewableDomain)}%` }}
          >{tick(value)}</span>
        ))}
        {[movement.waterDomain[0], 0, movement.waterDomain[1]].map((value) => (
          <span
            className="regional-evidence__axis-tick regional-evidence__axis-tick--y"
            key={`y-${value}`}
            style={{ top: `${scale(value, movement.waterDomain, true)}%` }}
          >{tick(value)}</span>
        ))}
        <span className="regional-evidence__zero regional-evidence__zero--water" data-zero-line="water" style={{ top: `${zeroY}%` }} />
        <span className="regional-evidence__zero regional-evidence__zero--renewable" data-zero-line="renewable" style={{ left: `${zeroX}%` }} />
        {movement.complete.map((place) => {
          const [labelX, labelY] = LABEL_OFFSETS[place.code] ?? [18, -18];
          const style = {
            left: `${scale(place.renewable.changePercentagePoints, movement.renewableDomain)}%`,
            top: `${scale(place.water.changePercentagePoints, movement.waterDomain, true)}%`,
            "--label-x": `${labelX}px`,
            "--label-y": `${labelY}px`,
          } as CSSProperties;
          const label = `${place.name}: ${fullMeasure("safely managed drinking water", place.water)}; ${fullMeasure("renewable energy share", place.renewable)}`;
          return (
            <div className="regional-evidence__movement-point" key={place.code} data-code={place.code} data-region-kind="complete" style={style}>
              <EvidenceMark model={buildEvidenceMark(place.geo, { scoreKey: "gap", selected: false })} neutral dataCode={place.code} label={label} size={14} />
              <svg className="regional-evidence__leader" viewBox="0 0 100 100" aria-hidden="true">
                <line x1="50" y1="50" x2={50 + labelX * 0.7} y2={50 + labelY * 0.7} />
              </svg>
              <span className="regional-evidence__code" aria-hidden="true">{place.code}</span>
            </div>
          );
        })}
      </div>
      <div className="regional-evidence__incomplete">
        <p>Incomplete comparisons</p>
        <ul>
          {movement.incomplete.map((place) => {
            const label = `${place.name}: ${fullMeasure("safely managed drinking water", place.water)}; ${fullMeasure("renewable energy share", place.renewable)}`;
            return (
              <li key={place.code} data-code={place.code} data-region-kind="incomplete">
                <EvidenceMark model={buildEvidenceMark(place.geo, { scoreKey: "gap", selected: false })} neutral dataCode={place.code} label={label} size={32} />
                <b>{place.code}</b>
                <span>{place.name}</span>
                <small>{shortMeasure("water", place.water)} · {shortMeasure("renewable", place.renewable)}</small>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}

function VisibilityField({ model }: { model: RegionalEvidenceModel }) {
  const { visibility } = model;
  return (
    <figure
      className="regional-evidence regional-evidence--visibility"
      data-stage-figure="regional-visibility"
      {...dataHooks(model, "visibility")}
      aria-label="Official-record visibility for 22 Pacific geographies across 14 reviewed features"
    >
      <div className="regional-evidence__summary">
        <strong>{visibility.presentCount} present</strong>
        <span>{visibility.absentCount} absent</span>
        <span>{visibility.columns.length} positions per place</span>
      </div>
      <ul className="regional-evidence__coverage" aria-label="Direct dataset coverage facts">
        {visibility.coverageFacts.map((fact) => (
          <li key={fact.featureId}>{fact.label} {fact.present}/{fact.total}</li>
        ))}
      </ul>
      <div className="regional-evidence__visibility-table" role="table" aria-rowcount={visibility.rows.length + 1} aria-colcount={visibility.columns.length + 1}>
        <div className="regional-evidence__visibility-row regional-evidence__visibility-head" role="row">
          <span role="columnheader">Place</span>
          {visibility.columns.map((column) => <span role="columnheader" key={column.featureId}>{column.index}</span>)}
        </div>
        {visibility.rows.map((row) => (
          <div className="regional-evidence__visibility-row" role="row" key={row.code} data-code={row.code} data-region-kind="visibility">
            <span className="regional-evidence__row-head" role="rowheader">
              <EvidenceMark model={buildEvidenceMark(row.geo, { scoreKey: "gap", selected: false })} neutral dataCode={row.code} label={`${row.name} stable identity`} size={28} />
              <b>{row.code}</b>
              <span className="sr-only">{row.name}</span>
            </span>
            {row.cells.map((cell) => {
              const state = cell.present ? "present" : "absent";
              const latestYear = cell.latestYear === null ? "latest year unavailable" : `latest year ${cell.latestYear}`;
              return (
                <span
                  className={`regional-evidence__cell regional-evidence__cell--${state}`}
                  role="cell"
                  key={cell.featureId}
                  data-visibility-cell={`${row.code}-${cell.featureId}`}
                  data-cell-state={state}
                  data-role={cell.role}
                  aria-label={`${row.name} — ${cell.label}: ${state}; role ${readableRole(cell.role)}; ${latestYear}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <ol className="regional-evidence__key" aria-label="Visibility position key">
        {visibility.columns.map((column) => (
          <li key={column.featureId} data-key-position={column.index}>
            <b>{column.index}</b><span>{column.label}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function RegionalEvidenceScene({ geos, mode }: RegionalEvidenceSceneProps) {
  const model = buildRegionalEvidenceModel(geos);
  return mode === "movement" ? <MovementField model={model} /> : <VisibilityField model={model} />;
}
