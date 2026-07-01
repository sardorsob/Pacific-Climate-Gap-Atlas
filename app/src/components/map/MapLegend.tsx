import type { ScoreKey } from "../../lib/encoding";
import { rampStops, UNCERTAINTY_STOPS } from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";

type MapLegendProps = {
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
};

function rampCss(stops: string[]): string {
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

const SCORE_TITLES: Record<ScoreKey, string> = {
  gap: "Adaptation gap (low to high)",
  pressure: "Climate pressure (low to high)",
  capacity: "Visible capacity (low to high)",
};

export function MapLegend({ activeScore, viewMode, outlookOn }: MapLegendProps) {
  const fillTitle = outlookOn
    ? "2030 stress-test gap (low to high)"
    : viewMode === "uncertainty"
      ? "Rank movement (stable to volatile)"
      : viewMode === "coverage"
        ? "Score muted - read reporting status below"
        : SCORE_TITLES[activeScore];

  const fillRamp =
    viewMode === "uncertainty"
      ? rampCss(UNCERTAINTY_STOPS)
      : viewMode === "coverage"
        ? "linear-gradient(90deg, #64777f, #64777f)"
        : rampCss(rampStops(outlookOn ? "gap" : activeScore));

  return (
    <section className="legend" aria-label="Map legend">
      <h2 className="legend__title">Legend</h2>

      <div className="legend__block">
        <span className="legend__label">Fill color - {fillTitle}</span>
        <span className="legend__ramp" style={{ background: fillRamp }} />
      </div>

      <div className="legend__block">
        <span className="legend__label">Point size - indicators behind the score (4 to 9)</span>
        <span className="legend__sizes" aria-hidden="true">
          <span className="legend__dot" style={{ width: 12, height: 12 }} />
          <span className="legend__dot" style={{ width: 20, height: 20 }} />
          <span className="legend__dot" style={{ width: 28, height: 28 }} />
        </span>
      </div>

      <div className="legend__block">
        <span className="legend__label">Ring - monitoring / reporting status</span>
        <ul className="legend__rings">
          <li><span className="ring-key ring-key--solid" aria-hidden="true" /> Reported monitoring</li>
          <li><span className="ring-key ring-key--dashed" aria-hidden="true" /> Latest row reports 0</li>
          <li><span className="ring-key ring-key--hatch" aria-hidden="true" /> No rows in processed data</li>
        </ul>
      </div>

      <p className="legend__note">Natural Earth land context; scores use centroid points, not boundaries.</p>
    </section>
  );
}
