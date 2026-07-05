import { ArrowRight, X } from "lucide-react";
import type { Geo } from "../../lib/atlasData";
import { reportingCaveat, reportingLabel } from "../../lib/encoding";
import { RankChip } from "../RankChip";

type CountryPanelProps = {
  geo: Geo | null;
  compareGeo: Geo | null;
  onClose: () => void;
  onCompare: (code: string) => void;
  onOpenMethod: () => void;
};

function EvidenceStrip({ geo, tone }: { geo: Geo; tone: string }) {
  const monShort =
    geo.reportingStatus === "reported_positive_latest_count"
      ? "Reported"
      : geo.reportingStatus === "reported_zero_latest_count"
        ? "Reports 0"
        : "No rows";
  return (
    <div className="profile-strip" aria-label="At a glance">
      <div className="profile-cell">
        <span className="profile-cell__k">Pressure</span>
        <span className="profile-cell__v">{geo.pressure.toFixed(0)}</span>
      </div>
      <div className="profile-cell">
        <span className="profile-cell__k">Capacity</span>
        <span className="profile-cell__v">{geo.capacity.toFixed(0)}</span>
      </div>
      <div className="profile-cell">
        <span className="profile-cell__k">Rank band</span>
        <span className="profile-cell__v">{geo.rankMin}-{geo.rankMax}</span>
      </div>
      <div className="profile-cell">
        <span className="profile-cell__k">Indicators</span>
        <span className="profile-cell__v">{geo.indicators}/9</span>
      </div>
      <div className={`profile-cell profile-cell--${tone}`}>
        <span className="profile-cell__k">Monitoring</span>
        <span className="profile-cell__v profile-cell__v--sm">{monShort}</span>
      </div>
    </div>
  );
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

export function CountryPanel({ geo, compareGeo, onClose, onCompare, onOpenMethod }: CountryPanelProps) {
  if (!geo) {
    return (
      <aside className="panel panel--intro" aria-label="Atlas detail panel">
        <p className="eyebrow">Pacific Adaptation Gap Atlas</p>
        <h1 className="panel__thesis">
          Where climate pressure and visible capacity are unevenly matched - and so is the official data behind the comparison.
        </h1>
        <p className="panel__lede">
          Tap any island mark to open a place: its score, how far the rank slides, what the monitoring
          record shows, and the official rows behind every number.
        </p>
        <p className="panel__hint">Concept for review - not final, not approved.</p>
        <button type="button" className="link-btn" onClick={onOpenMethod}>
          Methodology &amp; sources
        </button>
      </aside>
    );
  }

  const compare = compareGeo;
  const reportingTone =
    geo.reportingStatus === "reported_positive_latest_count" ? "ok" : "warn";

  return (
    <aside className="panel" aria-label={`${geo.name} detail`}>
      {/* group 1: the score - name and story label lead, no header needed */}
      <div className="panel__head">
        <div>
          <p className="eyebrow">{geo.subregion}</p>
          <h1 className="panel__name">{geo.name}</h1>
          <p className="panel__status">{geo.status}</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Close detail" onClick={onClose}>
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      <p className="panel__story">{geo.storyLabel}</p>

      <div className="score-block">
        <div className="score-block__num">
          <span className="score-block__value">{geo.gap.toFixed(0)}</span>
          <span className="score-block__unit">/100 gap</span>
        </div>
        <RankChip geo={geo} />
        <p className="score-block__caveat">
          A comparison screen, not a ranking of need. The band above is the honest way to read
          this position.
        </p>
      </div>

      <EvidenceStrip geo={geo} tone={reportingTone} />

      {/* group 2: the two sides */}
      <section className="panel__group">
        <h2 className="panel__h">The two sides of the score</h2>
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
            <ul>{geo.topPressure.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          <div>
            <span className="signals__cap">Strongest capacity signals</span>
            <ul>{geo.topCapacity.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        </div>
        <p className="signals__note">
          Numbers in parentheses are 0-100 percentile positions within the Pacific, not amounts.
        </p>
      </section>

      {/* group 3: the record */}
      <section className="panel__group">
        <h2 className="panel__h">What the record shows</h2>
        <div className={`reporting reporting--${reportingTone}`}>
          <p className="reporting__state">{reportingLabel(geo.reportingStatus)}</p>
          <p className="reporting__caveat">{reportingCaveat(geo.reportingStatus)}</p>
        </div>
        <p className="panel__evidence">
          <strong>{geo.indicators}</strong> of 9 indicators feed this score.
          {geo.indicators <= 5 && " Thin evidence - read this score with extra caution."}
        </p>
        <details className="trace">
          <summary>The official rows behind this score ({geo.indicatorRows.length || geo.indicators})</summary>
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

      {geo.similarityNeighbors.length > 0 && (
        <section className="panel__group">
          <h2 className="panel__h">Records with a similar shape</h2>
          <p className="panel__evidence">
            Jensen-Shannon distance compares official-data profiles. Lower means more alike.
          </p>
          <ul className="similarity-list">
            {geo.similarityNeighbors.map((neighbor) => (
              <li key={neighbor.code}>
                <span>
                  <b>{neighbor.name}</b>
                  <small>{neighbor.band}</small>
                </span>
                <span>JSD {neighbor.jsd.toFixed(3)}</span>
                <em>{neighbor.reason}</em>
              </li>
            ))}
          </ul>
          <p className="panel__fineprint">
            {geo.similarityNeighbors[0]?.caveat ||
              "Similarity here is about official-data profiles only, not shared vulnerability or policy need."}
          </p>
        </section>
      )}

      <div className="panel__actions">
        <button type="button" className="link-btn" onClick={onOpenMethod}>
          Methodology &amp; sources
        </button>
        {compare && compare.code !== geo.code && (
          <button type="button" className="link-btn link-btn--ghost" onClick={() => onCompare(compare.code)}>
            <ArrowRight aria-hidden="true" size={15} />
            Open {compare.name}
          </button>
        )}
      </div>
    </aside>
  );
}
