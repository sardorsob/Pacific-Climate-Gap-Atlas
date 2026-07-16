import { useEffect, useRef } from "react";
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
  "Projected population growth",
  "Renewable energy share",
  "Safely managed drinking water",
  "Recorded direct disaster loss (reporting visibility only)",
  "Climate-altering land-cover index",
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
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    return () => {
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="drawer-scrim" role="presentation" onClick={onClose}>
      <aside
        ref={drawerRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Methodology and sources"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
            return;
          }
          if (e.key !== "Tab") return;
          const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }}
      >
        <div className="drawer__head">
          <h2>Methodology &amp; sources</h2>
          <button ref={closeButtonRef} type="button" className="icon-btn" aria-label="Close drawer" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <section className="drawer__section">
          <h3>Thesis</h3>
          <p>
            How conditions and official records differ across 22 Pacific places. Official records
            show different changes across Pacific places, and they do not show every place equally.
          </p>
        </section>

        <section className="drawer__section">
          <h3>Guided Act I: movement</h3>
          <p>
            Act I compares first-to-latest values within each place for safely managed drinking water
            and renewable energy share, expressed as separate percentage-point changes. Each measure
            keeps its own meaning, denominator, and reporting clock. The endpoint comparisons are
            descriptive and non-causal; they do not explain why values changed.
          </p>
        </section>

        <section className="drawer__section">
          <h3>Guided Act II: visibility</h3>
          <p>
            Act II shows whether each of 14 reviewed official datasets has a returned record for each
            place. Presence is not completeness, quality, currency, infrastructure, conditions, or
            local knowledge. Missing recorded direct disaster loss means no reviewed returned row; it
            does not mean zero loss.
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
          <h3>Evidence fingerprints</h3>
          <p>
            Jensen-Shannon divergence measures how alike two geographies' official-data profiles are.
            It is a likeness of evidence patterns, not of risk, need, or lived experience, and it is
            shown only as selected-place nearest neighbors, not as a global ranking or map layer.
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
