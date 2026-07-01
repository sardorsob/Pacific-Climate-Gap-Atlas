import { HelpCircle } from "lucide-react";
import type { Geo } from "../../lib/atlasData";

// Shown in the "Where the data goes quiet" view when nothing is selected.
// Makes data absence an inspectable finding, never "no data = no infrastructure".
export function DataQuietCallout({
  geos,
  priorityCodes,
  onPick,
}: {
  geos: Geo[];
  priorityCodes: string[];
  onPick: (code: string) => void;
}) {
  const zero = geos.filter((g) => g.reportingStatus === "reported_zero_latest_count");
  const missing = geos.filter((g) => g.reportingStatus === "missing_monitoring_dataset_row");
  const priority = priorityCodes.join(", ");

  return (
    <aside className="panel" aria-label="Where the data goes quiet">
      <p className="eyebrow">Signature view</p>
      <h1 className="panel__name">Where the data goes quiet</h1>
      <p className="panel__lede">
        Where the adaptation gap looks widest, the official monitoring record often thins out. This
        high-gap / low-monitoring group - <strong>{priority}</strong> - goes quiet in two different
        ways.
      </p>

      <section className="quiet-card quiet-card--zero">
        <h2 className="panel__h"><HelpCircle aria-hidden="true" size={16} /> What does zero mean?</h2>
        <p className="quiet-card__geos">{zero.map((g) => g.name).join(", ")}</p>
        <p className="quiet-card__caveat">
          Their latest official monitoring row reports 0. Verify what that value means at the source
          before reading it as no monitoring stations.
        </p>
        <div className="quiet-card__chips">
          {zero.map((g) => (
            <button key={g.code} type="button" className="chip" onClick={() => onPick(g.code)}>{g.code}</button>
          ))}
        </div>
      </section>

      <section className="quiet-card quiet-card--missing">
        <h2 className="panel__h"><HelpCircle aria-hidden="true" size={16} /> Why is this blank?</h2>
        <p className="quiet-card__geos">{missing.map((g) => g.name).join(", ")}</p>
        <p className="quiet-card__caveat">
          No monitoring rows reached the processed official data. Treat it as a reporting gap, not
          confirmed absence.
        </p>
        <div className="quiet-card__chips">
          {missing.map((g) => (
            <button key={g.code} type="button" className="chip" onClick={() => onPick(g.code)}>{g.code}</button>
          ))}
        </div>
      </section>

      <p className="quiet-card__footer">
        A reporting gap is a gap in the record, not proof that stations are absent. Monitoring counts
        are unnormalized proxy coverage.
      </p>
    </aside>
  );
}
