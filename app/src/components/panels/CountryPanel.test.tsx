import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import { CountryPanel } from "./CountryPanel";

const visibility = (represented: number) => Array.from({ length: 14 }, (_, index) => ({
  featureId: `feature-${String(index + 1).padStart(2, "0")}`,
  label: `Reviewed dataset ${index + 1}`,
  role: "reporting_presence",
  present: index < represented,
  latestYear: index < represented ? 2022 : null,
}));

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
    water: { firstYear: 2000, latestYear: 2020, changePercentagePoints: 1.92 },
    renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: 1.75 },
    completeOverlap: true,
    quadrant: "both_up",
    visibility: visibility(13),
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

  it("puts the regional record before the optional score with separate measure clocks", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={geo} onOpenMethod={() => undefined} />,
    );

    expect(html).toContain("Regional record");
    expect(html).toContain("Drinking water");
    expect(html).toContain("+1.92 percentage points");
    expect(html).toContain("2000 to 2020");
    expect(html).toContain("Renewable energy share");
    expect(html).toContain("+1.75 percentage points");
    expect(html).toContain("2000 to 2022");
    expect(html).toContain("13 of 14 reviewed datasets represented");
    expect(html.indexOf("Regional record")).toBeLessThan(html.indexOf("/100 gap"));
  });

  it("preserves positive and negative signs for a complete cross-current", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={{
          ...geo,
          code: "PG",
          name: "Papua New Guinea",
          regionalStory: {
            water: { firstYear: 2000, latestYear: 2022, changePercentagePoints: 18.49 },
            renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: -15.6 },
            completeOverlap: true,
            quadrant: "water_up_renewable_down",
            visibility: visibility(14),
          },
        }}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("+18.49 percentage points");
    expect(html).toContain("−15.60 percentage points");
    expect(html).toContain("14 of 14 reviewed datasets represented");
  });

  it("keeps null comparisons unavailable and never presents their years or zero", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={{
          ...geo,
          code: "GU",
          name: "Guam",
          regionalStory: {
            water: { firstYear: null, latestYear: null, changePercentagePoints: null },
            renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: 6.11 },
            completeOverlap: false,
            quadrant: "missing_overlap",
            visibility: visibility(11),
          },
        }}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("Unavailable for a comparable period in the reviewed regional series");
    expect(html).toContain("+6.11 percentage points");
    expect(html).toContain("11 of 14 reviewed datasets represented");
    expect(html).not.toContain("null");
  });

  it("shows the observed six-of-fourteen visibility minimum", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={{
          ...geo,
          code: "PN",
          name: "Pitcairn",
          regionalStory: {
            water: { firstYear: null, latestYear: null, changePercentagePoints: null },
            renewable: { firstYear: null, latestYear: null, changePercentagePoints: null },
            completeOverlap: false,
            quadrant: "missing_overlap",
            visibility: visibility(6),
          },
        }}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("6 of 14 reviewed datasets represented");
    expect(html.match(/Unavailable for a comparable period in the reviewed regional series/g) ?? []).toHaveLength(2);
  });

  it("formats both zero and negative zero as unsigned zero", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={{
          ...geo,
          regionalStory: {
            water: { firstYear: 2000, latestYear: 2022, changePercentagePoints: 0 },
            renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: -0 },
            completeOverlap: true,
            quadrant: "both_up",
            visibility: visibility(14),
          },
        }}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html.match(/0.00 percentage points/g) ?? []).toHaveLength(2);
    expect(html).not.toContain("+0.00 percentage points");
    expect(html).not.toContain("−0.00 percentage points");
  });

  it("keeps the interpretation limits adjacent to the regional values", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={geo} onOpenMethod={() => undefined} />,
    );
    const record = html.slice(html.indexOf("Regional record"), html.indexOf("score-block"));

    expect(record).toContain("measures can use different clocks");
    expect(record).toContain("descriptive and non-causal");
    expect(record).toContain("quality");
    expect(record).toContain("completeness");
    expect(record).toContain("preparedness");
    expect(record).toContain("vulnerability");
    expect(record).toContain("need");
    expect(record).toContain("condition");
    expect(record).toContain("local knowledge");
  });
});
