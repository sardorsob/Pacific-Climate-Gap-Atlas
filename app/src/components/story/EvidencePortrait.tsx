import type { Geo, ReportingStatus } from "../../lib/atlasData";
import { reportingCaveat } from "../../lib/encoding";
import { scoreColor, valueForScore, type ScoreKey } from "../../lib/encoding";
import { EvidenceMark } from "../map/EvidenceMark";
import { buildEvidenceMark } from "../map/evidenceMarkModel";

type EvidencePortraitProps = {
  geo: Geo;
  scoreKey?: ScoreKey;
  selected?: boolean;
  compact?: boolean;
};

function monitoringShort(status: ReportingStatus): string {
  if (status === "reported_positive_latest_count") return "Reported monitoring";
  if (status === "reported_zero_latest_count") return "Reported zero";
  return "No processed row";
}

export function EvidencePortrait({ geo, scoreKey = "gap", selected = false, compact = false }: EvidencePortraitProps) {
  const score = valueForScore(geo, scoreKey);
  return (
    <figure className={`evidence-portrait${compact ? " evidence-portrait--compact" : ""}`}>
      <div className="evidence-portrait__head">
        <EvidenceMark
          model={buildEvidenceMark(geo, { scoreKey, selected })}
          label={`${geo.name} evidence portrait`}
          size={compact ? 38 : 44}
          scoreFill={scoreColor(scoreKey, score)}
        />
        <figcaption>
          <h3>{geo.name}</h3>
          <p>{geo.storyLabel}</p>
        </figcaption>
      </div>
      <dl className="evidence-portrait__stats">
        <div><dt>Gap</dt><dd>{geo.gap.toFixed(0)}</dd></div>
        <div><dt>Climate pressure</dt><dd>{geo.pressure.toFixed(0)}</dd></div>
        <div><dt>Visible capacity</dt><dd>{geo.capacity.toFixed(0)}</dd></div>
        <div><dt>Score inputs</dt><dd>{geo.scoreInputCount} of 8</dd></div>
        <div><dt>Monitoring</dt><dd>{monitoringShort(geo.reportingStatus)}</dd></div>
        <div><dt>Rank band</dt><dd>{geo.rankMin}–{geo.rankMax}</dd></div>
      </dl>
      <p className="evidence-portrait__caveat">{reportingCaveat(geo.reportingStatus)}</p>
    </figure>
  );
}

export { monitoringShort };
