import type { ScoreKey } from "../../lib/encoding";
import { rampStops, UNCERTAINTY_STOPS } from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";
import { EvidenceMark } from "./EvidenceMark";
import type { EvidenceMarkModel } from "./evidenceMarkModel";

type MapLegendProps = {
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
};

function rampCss(stops: string[]): string {
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

const LEGEND_MARK: EvidenceMarkModel = {
  score: 58,
  inputs: Array.from({ length: 8 }, (_, index) => ({
    datasetSlug: `legend-input-${index}`,
    datasetName: `Score input ${index + 1}`,
    pillar: "climate_signal" as const,
    present: index < 5,
    index,
    angle: -90 + index * 45,
  })),
  context: { kind: "context-only", present: true, angle: 112.5 },
  reportingEdge: "solid",
  selected: true,
};

const SCORE_TITLES: Record<ScoreKey, string> = {
  gap: "Adaptation gap (low to high)",
  pressure: "Climate pressure (low to high)",
  capacity: "Visible capacity (low to high)",
};

export function MapLegend({ activeScore, viewMode, outlookOn }: MapLegendProps) {
  if (viewMode === "overview") {
    return (
      <section className="legend" aria-label="Map legend">
        <h2 className="legend__title">Regional overview</h2>
        <div className="legend__block">
          <span className="legend__label">Stable place identity</span>
          <div className="legend__portrait-key">
            <EvidenceMark model={LEGEND_MARK} neutral label="Neutral overview mark" size={44} />
            <span>Each neutral mark identifies one selectable Pacific place. All 22 marks use the same encoding until a layer is chosen.</span>
          </div>
        </div>
        <p className="legend__note">Island texture is grouped by nearest centroid; it is not an official boundary.</p>
      </section>
    );
  }

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
        <span className="legend__label">Evidence portrait</span>
        <div className="legend__portrait-key">
          <EvidenceMark model={LEGEND_MARK} label="Example evidence portrait" size={44} scoreFill={rampStops(outlookOn ? "gap" : activeScore)[2]} />
          <span>Inner field = active score. Eight fixed ticks = score inputs available; crisp outline = selected place.</span>
        </div>
        <span className="legend__note">The detached tick is responsibility context only; it never feeds the score.</span>
      </div>

      <div className="legend__block">
        <span className="legend__label">Outer edge - monitoring / reporting status</span>
        <ul className="legend__rings">
          <li><span className="ring-key ring-key--solid" aria-hidden="true" /> Solid edge - reported monitoring</li>
          <li><span className="ring-key ring-key--dashed" aria-hidden="true" /> Open-dash edge - latest row reports 0</li>
          <li><span className="ring-key ring-key--hatch" aria-hidden="true" /> Broken-dot edge - no processed row</li>
        </ul>
      </div>

      <p className="legend__note">Island texture is grouped by nearest centroid; it is not an official boundary.</p>
    </section>
  );
}
