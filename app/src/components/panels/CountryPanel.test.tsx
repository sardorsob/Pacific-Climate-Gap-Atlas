import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import { CountryPanel } from "./CountryPanel";

const geo = {
  code: "NR",
  name: "Nauru",
  subregion: "Micronesia",
  status: "Country",
  lon: 166.93,
  lat: -0.52,
  gap: 89,
  pressure: 62,
  capacity: 27,
  scoreInputCount: 8,
  contextCount: 1,
  traceCount: 9,
  scoreInputPresence: [],
  regionalStory: {
    water: { firstYear: null, latestYear: null, changePercentagePoints: null },
    renewable: { firstYear: null, latestYear: null, changePercentagePoints: null },
    completeOverlap: false,
    quadrant: "missing_overlap",
    visibility: [],
  },
  reportingStatus: "reported_zero_latest_count",
  monitoringCount: 0,
  latestMonitoringYear: 2026,
  storyPriority: 1,
  rankMin: 1,
  rankMax: 7,
  rankRange: 6,
  robustness: "fragile",
  storyLabel: "High gap with a reporting caveat.",
  topPressure: ["Sea level (75.0)"],
  topCapacity: ["Monitoring (0.0)"],
  indicatorRows: [],
  similarityNeighbors: [
    { code: "MP", name: "Northern Mariana Islands", rank: 1, jsd: 0.0797, band: "similar profile", reason: "First reason.", caveat: "Profile caveat." },
    { code: "GU", name: "Guam", rank: 2, jsd: 0.0809, band: "similar profile", reason: "Second reason.", caveat: "Profile caveat." },
  ],
  outlook2030Flat: 70,
  outlookDisplay: "show_with_strong_caveat",
} satisfies Geo;

describe("CountryPanel", () => {
  it("keeps the empty panel free of temporary review copy", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={null} onOpenMethod={() => undefined} />,
    );

    expect(html).not.toContain("Concept for review");
    expect(html).not.toContain("panel__hint");
  });

  it("keeps the complete nearest-neighbor evidence in the panel", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={geo}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("Northern Mariana Islands");
    expect(html).toContain("JSD 0.080");
    expect(html).toContain("Guam");
    expect(html).toContain("JSD 0.081");
    expect(html).toContain("official-data profile shape only");
    expect(html).toContain("physical connection, shared risk, lived experience, or shared policy need");
  });

  it("labels score inputs separately from context-only trace data", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={geo}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("<strong>8</strong> of 8 possible score inputs are present.");
    expect(html).toContain("1 context-only dataset");
    expect(html).not.toContain("of 9 indicators feed this score");
  });
});
