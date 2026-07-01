import { ArrowLeftRight, X } from "lucide-react";
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
        <span className="profile-cell__k">Rank move</span>
        <span className="profile-cell__v">{geo.rankMin}-{geo.rankMax}</span>
      </div>
      <div className="profile-cell">
        <span className="profile-cell__k">Evidence</span>
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
          Tap any point to inspect a geography: its gap score, how fragile the rank is, what the
          monitoring record reports, and the indicators behind every number.
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
      <div className="panel__head">
        <div>
          {/* 1. name + context */}
          <p className="eyebrow">{geo.subregion}</p>
          <h1 className="panel__name">{geo.name}</h1>
          <p className="panel__status">{geo.status}</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Close detail" onClick={onClose}>
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      {/* 2. active story label */}
      <p className="panel__story">{geo.storyLabel}</p>

      {/* 3. gap score + rank chip (never bare) */}
      <div className="score-block">
        <div className="score-block__num">
          <span className="score-block__value">{geo.gap.toFixed(0)}</span>
          <span className="score-block__unit">/100 gap</span>
        </div>
        <RankChip geo={geo} />
        <p className="score-block__caveat">
          Comparative screen, not a ranking of need. Rank movement frames uncertainty and should not be read as definitive.
        </p>
      </div>

      {/* at-a-glance evidence strip (scan before reading detail) */}
      <EvidenceStrip geo={geo} tone={reportingTone} />

      {/* 4. pressure vs capacity */}
      <section className="panel__section">
        <h2 className="panel__h">Pressure vs visible capacity</h2>
        <PillarBar label="Climate pressure" value={geo.pressure} kind="pressure" />
        <PillarBar
          label="Visible capacity"
          value={geo.capacity}
          kind="capacity"
          caveat="Capacity is measured through official proxies, not full readiness."
        />
      </section>

      {/* 5. evidence density */}
      <section className="panel__section">
        <h2 className="panel__h">Evidence density</h2>
        <p className="panel__evidence">
          <strong>{geo.indicators}</strong> of 9 indicators contribute to this score.
          {geo.indicators <= 5 && " Thin evidence - read this score with extra caution."}
        </p>
      </section>

      {/* 6. monitoring / reporting status + caveat */}
      <section className={`panel__section reporting reporting--${reportingTone}`}>
        <h2 className="panel__h">Monitoring / reporting status</h2>
        <p className="reporting__state">{reportingLabel(geo.reportingStatus)}</p>
        <p className="reporting__caveat">{reportingCaveat(geo.reportingStatus)}</p>
      </section>

      {/* 7. top signals */}
      <section className="panel__section">
        <h2 className="panel__h">Top signals</h2>
        <div className="signals">
          <div>
            <span className="signals__cap">Pressure</span>
            <ul>{geo.topPressure.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          <div>
            <span className="signals__cap">Capacity</span>
            <ul>{geo.topCapacity.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* 8. indicator trace teaser */}
      <details className="trace">
        <summary>Indicator trace ({geo.indicators} rows)</summary>
        <p className="trace__note">
          Every score traces back to the latest official rows behind it - values, units, scoring
          values, and a source-row hash - so nothing here is a black box.
        </p>
      </details>

      {/* 9. sources / compare */}
      <div className="panel__actions">
        <button type="button" className="link-btn" onClick={onOpenMethod}>
          Methodology &amp; sources
        </button>
        {compare && compare.code !== geo.code && (
          <button type="button" className="link-btn link-btn--ghost" onClick={() => onCompare(compare.code)}>
            <ArrowLeftRight aria-hidden="true" size={15} />
            Compare with {compare.name}
          </button>
        )}
      </div>
    </aside>
  );
}
