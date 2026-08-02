import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import { adaptGeographiesPayload, type Geo } from "../../lib/atlasData";
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
  placeNote: "single raised coral island",
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
  monitoringCaveat: "Latest meteorological-monitoring-network row reports 0; verify source semantics before interpreting this as no monitoring infrastructure.",
  monitoringCount: 0,
  latestMonitoringYear: 2026,
  storyPriority: 1,
  rankMin: 1,
  rankMax: 7,
  rankRange: 6,
  robustness: "fragile",
  rankCaveat: "Small sample stress test; rank movement frames uncertainty and should not be read as a definitive ranking.",
  storyLabel: "High gap with a reporting caveat.",
  nonCausalCaveat: "Descriptive screen only; labels summarize available indicators and are not causal claims.",
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
const canonicalGeos = adaptGeographiesPayload(generatedGeographies);

describe("CountryPanel", () => {
  it("keeps the visible source action at the 44px minimum target", () => {
    const css = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.link-btn\s*\{[^}]*min-height:\s*44px;/);
  });

  it("keeps the empty panel free of temporary review copy", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={null} geos={[]} onOpenMethod={() => undefined} />,
    );

    expect(html).not.toContain("Concept for review");
    expect(html).not.toContain("panel__hint");
  });

  it("keeps similar-profile evidence collapsed by default", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={geo}
        geos={[geo]}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain('<details class="panel-disclosure">');
    expect(html).toContain("Records with a similar shape");
    expect(html).toContain("Northern Mariana Islands");
    expect(html).toContain("JSD 0.080");
    expect(html).toContain("Guam");
    expect(html).toContain("JSD 0.081");
    expect(html).toContain("official-data profile shape only");
    expect(html).toContain("physical connection, shared risk, lived experience, or shared policy need");
  });

  it("uses reviewed place, monitoring, rank, and non-causal language without duplication", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={geo} geos={[geo]} onOpenMethod={() => undefined} />,
    );

    expect(html).toContain("Country · single raised coral island");
    expect(html).toContain(geo.monitoringCaveat);
    expect(html).toContain(geo.rankCaveat);
    expect(html).toContain(geo.nonCausalCaveat);
    expect(html.match(/meteorological-monitoring-network row reports 0/g) ?? []).toHaveLength(1);
    expect(html.match(/not causal claims/g) ?? []).toHaveLength(1);
    expect(html).not.toContain("The band above is the honest way to read this position");
    expect(html).not.toContain("This comparison is descriptive and non-causal");
  });

  it("falls back to the established generic caveats when reviewed strings are absent", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={{
          ...geo,
          placeNote: null,
          monitoringCaveat: null,
          rankCaveat: null,
          nonCausalCaveat: null,
        }}
        geos={[geo]}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("Latest official monitoring row reports 0");
    expect(html).toContain("The band above is the honest way to read this position");
    expect(html).toContain("This comparison is descriptive and non-causal");
    expect(html).not.toContain("single raised coral island");
  });

  it("labels score inputs separately from context-only trace data", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={geo}
        geos={[geo]}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("<strong>8</strong> of 8 possible score inputs are present.");
    expect(html).toContain("1 context-only dataset");
    expect(html).not.toContain("of 9 indicators feed this score");
  });

  it("puts the regional lens before the quiet modeled score", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={geo} geos={[geo]} onOpenMethod={() => undefined} />,
    );

    expect(html).toContain("Where Nauru sits in the Pacific");
    expect(html).toContain("Safely managed drinking-water change");
    expect(html).toContain("+1.92 percentage points");
    expect(html).toContain("Renewable-energy-share change");
    expect(html).toContain("+1.75 percentage points");
    expect(html).toContain('<strong class="regional-lens__value">13 of 14</strong>');
    expect(html).toContain("Selected Nauru 13 of 14");
    expect(html).toContain("Gap 89 · Pressure 62 · Capacity 27");
    expect(html.indexOf("Where Nauru sits in the Pacific")).toBeLessThan(html.indexOf("Gap 89 · Pressure 62 · Capacity 27"));
  });

  it("places the existing source action immediately after the regional caveat", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={geo} geos={[geo]} onOpenMethod={() => undefined} />,
    );

    expect(html.indexOf("Methodology &amp; sources")).toBeGreaterThan(html.indexOf("local knowledge"));
    expect(html.indexOf("Methodology &amp; sources")).toBeLessThan(html.indexOf("Gap 89 · Pressure 62 · Capacity 27"));
  });

  it("preserves positive and negative signs for a complete cross-current", () => {
    const papuaNewGuinea = {
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
    } satisfies Geo;
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={papuaNewGuinea}
        geos={[papuaNewGuinea]}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("+18.49 percentage points");
    expect(html).toContain("−15.60 percentage points");
    expect(html).toContain('<strong class="regional-lens__value">14 of 14</strong>');
    expect(html).toContain("Selected Papua New Guinea 14 of 14");
  });

  it("keeps null comparisons unavailable and never presents their years or zero", () => {
    const guam = {
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
    } satisfies Geo;
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={guam}
        geos={[guam]}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("Guam unavailable for a comparable period in the reviewed regional series");
    expect(html).toContain("Selected: Guam +6.11 percentage points");
    expect(html).toContain('<strong class="regional-lens__value">11 of 14</strong>');
    expect(html).toContain("Selected Guam 11 of 14");
    expect(html).not.toContain("null");
  });

  it("shows the observed six-of-fourteen visibility minimum", () => {
    const pitcairn = canonicalGeos.find((candidate) => candidate.code === "PN")!;
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={pitcairn}
        geos={canonicalGeos}
        onOpenMethod={() => undefined}
      />,
    );
    const water = html.slice(html.indexOf('data-regional-strip="water"'), html.indexOf('data-regional-strip="renewable"'));
    const renewable = html.slice(html.indexOf('data-regional-strip="renewable"'), html.indexOf('data-regional-strip="visibility"'));

    expect(html).toContain('<strong class="regional-lens__value">6 of 14</strong>');
    expect(html).toContain("Selected Pitcairn 6 of 14");
    expect(water).toContain("3 unavailable");
    expect(renewable).toContain("2 unavailable");
    expect(water).not.toContain("data-selected-mark");
    expect(renewable).not.toContain("data-selected-mark");
  });

  it("formats both zero and negative zero as unsigned zero", () => {
    const zeroes = {
      ...geo,
      regionalStory: {
        water: { firstYear: 2000, latestYear: 2022, changePercentagePoints: 0 },
        renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: -0 },
        completeOverlap: true,
        quadrant: "both_up",
        visibility: visibility(14),
      },
    } satisfies Geo;
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={zeroes}
        geos={[zeroes]}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html.match(/Selected: Nauru 0.00 percentage points/g) ?? []).toHaveLength(2);
    expect(html).not.toContain("+0.00 percentage points");
    expect(html).not.toContain("−0.00 percentage points");
  });

  it("keeps the interpretation limits adjacent to the regional lens", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={geo} geos={[geo]} onOpenMethod={() => undefined} />,
    );
    const record = html.slice(html.indexOf("Where Nauru sits in the Pacific"), html.indexOf("Gap 89 · Pressure 62 · Capacity 27"));

    expect(record).toContain("measures can use different clocks");
    expect(record).toContain("not causal claims");
    expect(record).toContain("quality");
    expect(record).toContain("completeness");
    expect(record).toContain("preparedness");
    expect(record).toContain("vulnerability");
    expect(record).toContain("need");
    expect(record).toContain("condition");
    expect(record).toContain("local knowledge");
  });

  it("omits the secondary disclosure when no similar profile is available", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={{ ...geo, similarityNeighbors: [] }} geos={[geo]} onOpenMethod={() => undefined} />,
    );

    expect(html).not.toContain("Records with a similar shape");
  });
});
