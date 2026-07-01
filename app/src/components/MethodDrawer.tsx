import { X } from "lucide-react";

const DATASETS = [
  "Mean sea-surface temperature anomalies",
  "Mean surface temperature anomalies",
  "Rainfall anomalies",
  "Sea level anomalies",
  "Directly affected persons (disasters)",
  "Meteorological monitoring network",
  "Power generation",
  "Fisheries management measures",
  "GHG emissions per capita (responsibility context)",
];

const WONT = [
  "These are the most vulnerable Pacific geographies.",
  "This geography needs the most funding.",
  "No monitoring rows means there is no monitoring infrastructure.",
  "The outlook predicts the future adaptation gap.",
  "Emissions context proves blame at the geography level.",
  "The map shows exact island boundaries.",
];

export function MethodDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="drawer-scrim" role="presentation" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Methodology and sources"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer__head">
          <h2>Methodology &amp; sources</h2>
          <button type="button" className="icon-btn" aria-label="Close drawer" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <section className="drawer__section">
          <h3>Thesis</h3>
          <p>
            Across 22 Pacific geographies, climate pressure and visible adaptation capacity are
            unevenly matched, and so is the official data behind the comparison. This atlas maps where
            the gap looks widest and is honest about where the record falls silent.
          </p>
        </section>

        <section className="drawer__section">
          <h3>Score method</h3>
          <p>
            A comparative screen: latest official observations are percentile-ranked within the
            Pacific, averaged into climate-pressure and visible-capacity scores, then differenced
            (pressure minus capacity). No imputation. Equal weights in the baseline.
          </p>
        </section>

        <section className="drawer__section">
          <h3>Geometry policy</h3>
          <p>
            Natural Earth land context helps orient the map, but scores and selections use centroid
            points. No official scored-boundary polygons are joined yet.
          </p>
        </section>

        <section className="drawer__section">
          <h3>Monitoring proxy &amp; missingness</h3>
          <p>
            Monitoring counts are unnormalized proxy coverage. Reported-zero and missing rows are
            reporting gaps in the record, not confirmed absence of monitoring stations.
          </p>
        </section>

        <section className="drawer__section">
          <h3>Rank fragility</h3>
          <p>
            Leave-one-indicator stress tests label 19 of 22 geographies fragile and 3 sensitive
            (max rank range 15). Ranks are shown with ranges, never as a fixed leaderboard.
          </p>
        </section>

        <section className="drawer__section">
          <h3>Outlook</h3>
          <p>
            A stress test, not a forecast: it asks what recent trends imply, not what will happen. Off
            by default, and weak or sparse rows are withheld rather than shown.
          </p>
        </section>

        <section className="drawer__section">
          <h3>Evidence fingerprints (analysis-ready)</h3>
          <p>
            Jensen-Shannon divergence measures how alike two geographies' official-data profiles are.
            It is a likeness of evidence patterns, not of risk, need, or lived experience, and it is
            not yet wired into the live map.
          </p>
        </section>

        <section className="drawer__section">
          <h3>Datasets</h3>
          <ul className="drawer__list">{DATASETS.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>

        <section className="drawer__section">
          <h3>Claims this atlas will not make</h3>
          <ul className="drawer__list">{WONT.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>
      </aside>
    </div>
  );
}
