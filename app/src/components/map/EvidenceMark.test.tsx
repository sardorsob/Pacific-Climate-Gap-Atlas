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
  storyPriority: 2 as const,
  rankMin: 4,
  rankMax: 12,
  rankRange: 8,
  robustness: "fragile" as const,
  storyLabel: "Thin monitoring",
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
});
