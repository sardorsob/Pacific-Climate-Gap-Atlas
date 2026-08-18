import type { Geo } from "../../lib/atlasData";
import { reportingCaveat, reportingLabel } from "../../lib/encoding";
import { RankChip } from "../RankChip";
import { RegionalPositionLens } from "./RegionalPositionLens";

const JSD_CAVEAT = "Similarity describes official-data profile shape only. It does not imply physical connection, shared risk, lived experience, or shared policy need.";

type CountryPanelProps = {
  geo: Geo | null;
  geos: Geo[];
  onOpenMethod: () => void;
};

function regionalReading(geo: Geo, geos: Geo[]) {
  const complete = geos.filter(({ regionalStory }) => regionalStory.completeOverlap);
  const completeCount = complete.length;
  const comparisonLabel = completeCount === 1 ? "complete comparison" : "complete comparisons";

  if (!geo.regionalStory.completeOverlap) {
    const incompleteCount = geos.length - completeCount;
    const incompleteLabel = incompleteCount === 1 ? "One" : incompleteCount === 3 ? "Three" : String(incompleteCount);
    const verb = incompleteCount === 1 ? "has" : "have";
    const incompleteSummary = geos.length === 1
      ? "The one loaded place has an incomplete comparison."
      : `${incompleteLabel} of the ${geos.length} places ${verb} an incomplete comparison.`;
    return `${geo.name} is not included in the four-direction comparison because one or both measures lack comparable first-to-latest records. ${incompleteSummary}`;
  }

  const matchingCount = complete.filter(({ regionalStory }) => regionalStory.quadrant === geo.regionalStory.quadrant).length;
  const count = `That combination appears in ${matchingCount} of the ${completeCount} ${comparisonLabel}.`;

  switch (geo.regionalStory.quadrant) {
    case "both_up":
      return `For ${geo.name}, both measures increased between their first and latest available records. ${count}`;
    case "both_down":
      return `For ${geo.name}, both measures decreased between their first and latest available records. ${count}`;
    case "water_up_renewable_down":
      return `For ${geo.name}, safely managed drinking-water access increased between its first and latest available records, while renewable-energy share decreased. ${count}`;
    case "water_down_renewable_up":
      return `For ${geo.name}, safely managed drinking-water access decreased between its first and latest available records, while renewable-energy share increased. ${count}`;
    default:
      return `For ${geo.name}, both measures have comparable first-to-latest records, but their direction combination is unavailable in this view.`;
  }
}

function PillarBar({ label, value, kind, caveat }: { label: string; value: number; kind: string; caveat?: string }) {
  return (
    <div className="pillar">
      <div className="pillar__row">
        <span className="pillar__label">{label}</span>
        <span className="pillar__value">{value.toFixed(0)}</span>
      </div>
      <span className="pillar__track" aria-hidden="true">
        <span className={`pillar__fill pillar__fill--${kind}`} style={{ width: `${value}%` }} />
      </span>
      {caveat && <span className="pillar__caveat">{caveat}</span>}
    </div>
  );
}

export function CountryPanel({ geo, geos, onOpenMethod }: CountryPanelProps) {
  if (!geo) {
    return (
      <aside className="panel panel--intro" aria-label="Atlas detail panel">
        <p className="eyebrow">Pacific Climate Evidence Atlas</p>
        <h1 className="panel__thesis">How conditions and official records differ across 22 Pacific places.</h1>
        <p className="panel__lede">Select a place to inspect its data, sources, gaps, and optional score evidence.</p>
        <button type="button" className="link-btn" onClick={onOpenMethod}>Methodology &amp; sources</button>
      </aside>
    );
  }

  const reportingTone = geo.reportingStatus === "reported_positive_latest_count" ? "ok" : "warn";

  return (
    <aside className="panel" aria-label={`${geo.name} detail`}>
      <div>
        <p className="eyebrow">{geo.subregion}</p>
        <h1 className="panel__name">{geo.name}</h1>
        <p className="panel__status">{geo.status}{geo.placeNote && <> · {geo.placeNote}</>}</p>
        <p className="panel__fineprint">Political status is descriptive context from cited public sources; it is not used in any score.</p>
      </div>
      <p className="panel__story">{regionalReading(geo, geos)}</p>
      <RegionalPositionLens geo={geo} geos={geos} />
      <div className="reporting reporting--warn">
        <p className="reporting__caveat">
          These measures can use different clocks. {geo.nonCausalCaveat ?? "This comparison is descriptive and non-causal."}{" "}
          Dataset presence does not establish quality, completeness, preparedness, vulnerability,
          need, conditions, or local knowledge.
        </p>
      </div>
      <div className="panel__actions">
        <button type="button" className="link-btn" onClick={onOpenMethod}>Methodology &amp; sources</button>
      </div>
      <p className="panel__score-line">Gap {geo.gap.toFixed(0)} · Pressure {geo.pressure.toFixed(0)} · Capacity {geo.capacity.toFixed(0)}</p>
      <section className="panel__group">
        <h2 className="panel__h">What the record shows</h2>
        <RankChip geo={geo} />
        <p className="panel__fineprint">
          {geo.rankCaveat ?? "A comparison screen, not a ranking of need. The band above is the honest way to read this position."}
        </p>
        <div className={`reporting reporting--${reportingTone}`}>
          <p className="reporting__state">{reportingLabel(geo.reportingStatus)}</p>
          <p className="reporting__caveat">{geo.monitoringCaveat ?? reportingCaveat(geo.reportingStatus)}</p>
        </div>
        <p className="panel__evidence">
          <strong>{geo.scoreInputCount}</strong> of 8 possible score inputs are present.
          {geo.scoreInputCount <= 4 && " Thin score-input evidence - read this score with extra caution."}
          {geo.contextCount > 0 && (
            <span> {geo.contextCount} context-only dataset{geo.contextCount === 1 ? " is" : "s are"} available and {geo.contextCount === 1 ? "does" : "do"} not feed the score.</span>
          )}
        </p>
        <details className="trace">
          <summary>The official trace rows ({geo.indicatorRows.length || geo.traceCount})</summary>
          <p className="trace__note">
            Each row is the latest official record behind one indicator: year, value, unit, its
            0-100 score, and a short hash of the source row.
          </p>
          {geo.indicatorRows.length > 0 && (
            <ul className="trace__list">
              {geo.indicatorRows.map((row) => (
                <li key={`${row.datasetName}-${row.sourceRowHash || row.latestYear}`}>
                  <b>{row.datasetName}</b>
                  <span>
                    {row.latestYear ?? "n/a"} · {row.latestValue ?? "n/a"} {row.unit}
                    {row.indicatorScore !== null ? ` · score ${row.indicatorScore.toFixed(1)}` : ""}
                  </span>
                  <code>{row.sourceRowHash ? row.sourceRowHash.slice(0, 10) : "no hash"}</code>
                </li>
              ))}
            </ul>
          )}
        </details>
      </section>
      <details className="panel-disclosure">
        <summary>How the modeled score is composed</summary>
        <PillarBar label="Climate pressure" value={geo.pressure} kind="pressure" />
        <PillarBar
          label="Visible capacity"
          value={geo.capacity}
          kind="capacity"
          caveat="Capacity is measured through official proxies, not full readiness."
        />
        <div className="signals">
          <div>
            <span className="signals__cap">Strongest pressure signals</span>
            <ul>{geo.topPressure.map((signal) => <li key={signal}>{signal}</li>)}</ul>
          </div>
          <div>
            <span className="signals__cap">Strongest capacity signals</span>
            <ul>{geo.topCapacity.map((signal) => <li key={signal}>{signal}</li>)}</ul>
          </div>
        </div>
        <p className="signals__note">Numbers in parentheses are 0-100 percentile positions within the Pacific, not amounts.</p>
      </details>
      {geo.similarityNeighbors.length > 0 && (
        <details className="panel-disclosure">
          <summary>Records with a similar shape</summary>
          <p className="panel__evidence">Similarity describes official-data profile shape only. Lower Jensen-Shannon distance means more alike.</p>
          <ul className="similarity-list">
            {geo.similarityNeighbors.map((neighbor) => (
              <li key={neighbor.code}>
                <span><b>{neighbor.name}</b><small>{neighbor.band}</small></span>
                <span>JSD {neighbor.jsd.toFixed(3)}</span>
                <em>{neighbor.reason}</em>
              </li>
            ))}
          </ul>
          <p className="panel__fineprint">{JSD_CAVEAT}</p>
        </details>
      )}
    </aside>
  );
}
