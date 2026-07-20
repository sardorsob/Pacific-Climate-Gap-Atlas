import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import { buildEvidenceMark } from "./evidenceMarkModel";
import { EvidenceMark } from "./EvidenceMark";

const geo = {
  code: "TV",
  name: "Tuvalu",
  subregion: "Polynesia",
  status: "Country",
  placeNote: null,
  lon: 179.2,
  lat: -8.5,
  gap: 72,
  pressure: 66,
  capacity: 41,
  scoreInputCount: 3,
  contextCount: 0,
  traceCount: 3,
  scoreInputPresence: Array.from({ length: 8 }, (_, index) => ({
    datasetSlug: `input-${index}`,
    datasetName: `Input ${index}`,
    pillar: "climate_signal" as const,
    present: index < 3,
  })),
  regionalStory: {
    water: { firstYear: null, latestYear: null, changePercentagePoints: null },
    renewable: { firstYear: null, latestYear: null, changePercentagePoints: null },
    completeOverlap: false,
    quadrant: "missing_overlap",
    visibility: [],
  },
  reportingStatus: "reported_zero_latest_count" as const,
  monitoringCount: 0,
  latestMonitoringYear: 2024,
  monitoringCaveat: null,
  storyPriority: 2 as const,
  rankMin: 4,
  rankMax: 12,
  rankRange: 8,
  robustness: "fragile" as const,
  rankCaveat: null,
  storyLabel: "Thin monitoring",
  nonCausalCaveat: null,
  topPressure: [],
  topCapacity: [],
  indicatorRows: [],
  similarityNeighbors: [],
  outlook2030Flat: 70,
  outlookDisplay: "show_with_strong_caveat" as const,
} satisfies Geo;

describe("EvidenceMark", () => {
  it("renders the score field, eight input ticks, detached context, and edge semantics", () => {
    const html = renderToStaticMarkup(
      <EvidenceMark
        model={buildEvidenceMark(geo, { scoreKey: "gap", selected: true })}
        label="Tuvalu evidence portrait"
        size={44}
      />,
    );

    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Tuvalu evidence portrait"');
    expect((html.match(/data-kind="score-input"/g) ?? []).length).toBe(8);
    expect(html).toContain('data-kind="context-only"');
    expect(html).toContain('data-reporting-edge="open-dash"');
    expect(html).toContain('data-selected="true"');
  });

  it("adds a neutral stable identity without changing the default score mark", () => {
    const model = buildEvidenceMark(geo, { scoreKey: "gap", selected: false });
    const defaultHtml = renderToStaticMarkup(<EvidenceMark model={model} />);
    const neutralHtml = renderToStaticMarkup(
      <EvidenceMark model={model} neutral dataCode="TV" label="Tuvalu stable identity" />,
    );
    const divergentNeutralHtml = renderToStaticMarkup(
      <EvidenceMark
        model={{
          ...model,
          score: 1,
          selected: true,
          reportingEdge: "solid",
          inputs: model.inputs.map((input) => ({ ...input, present: !input.present })),
          context: { ...model.context, present: true },
        }}
        neutral
        dataCode="TV"
        label="Tuvalu stable identity"
      />,
    );

    expect(defaultHtml).toContain('class="evidence-mark__score"');
    expect(defaultHtml).not.toContain('data-scoreless="true"');
    expect(neutralHtml).toContain('data-code="TV"');
    expect(neutralHtml).toContain('data-scoreless="true"');
    expect(neutralHtml).toContain('class="evidence-mark evidence-mark--neutral"');
    expect(neutralHtml).not.toContain('class="evidence-mark__score"');
    expect(neutralHtml).not.toContain("data-reporting-edge");
    expect(neutralHtml).not.toContain("data-selected");
    expect(neutralHtml).not.toContain("data-kind");
    expect(neutralHtml).not.toContain("data-present");
    expect(neutralHtml).not.toContain("evidence-mark__context");
    expect((neutralHtml.match(/class="evidence-mark__tick evidence-mark__anchor-ray"/g) ?? [])).toHaveLength(8);
    expect(divergentNeutralHtml).toBe(neutralHtml);
  });
});
