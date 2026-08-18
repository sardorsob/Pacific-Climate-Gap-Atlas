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

function regionalGeo(name: string, quadrant: string, completeOverlap = true): Geo {
  return {
    ...geo,
    code: name.slice(0, 2).toUpperCase(),
    name,
    regionalStory: {
      ...geo.regionalStory,
      completeOverlap,
      quadrant,
    },
  };
}

function renderPanel(selected: Geo, geos: Geo[]) {
  return renderToStaticMarkup(
    <CountryPanel geo={selected} geos={geos} onOpenMethod={() => undefined} />,
  );
}

describe("CountryPanel", () => {
  it("derives the selected place regional reading from loaded quadrants", () => {
    const bothUp = regionalGeo("Nauru", "both_up");
    const bothDown = regionalGeo("Tuvalu", "both_down");
    const waterUpRenewableDown = regionalGeo("Kiribati", "water_up_renewable_down");
    const waterDownRenewableUp = regionalGeo("Samoa", "water_down_renewable_up");
    const missingOverlap = regionalGeo("Guam", "missing_overlap", false);
    const complete = [
      ...Array.from({ length: 6 }, () => regionalGeo("Nauru", "both_up")),
      ...Array.from({ length: 3 }, () => regionalGeo("Tuvalu", "both_down")),
      ...Array.from({ length: 7 }, () => regionalGeo("Kiribati", "water_up_renewable_down")),
      ...Array.from({ length: 3 }, () => regionalGeo("Samoa", "water_down_renewable_up")),
    ];
    const incomplete = [
      missingOverlap,
      regionalGeo("Palau", "missing_overlap", false),
      regionalGeo("Tonga", "missing_overlap", false),
    ];
    const geos = [...complete, ...incomplete];

    expect(renderPanel(bothUp, geos)).toContain("For Nauru, both measures increased between their first and latest available records. That combination appears in 6 of the 19 complete comparisons.");
    expect(renderPanel(bothDown, geos)).toContain("For Tuvalu, both measures decreased between their first and latest available records. That combination appears in 3 of the 19 complete comparisons.");
    expect(renderPanel(waterUpRenewableDown, geos)).toContain("For Kiribati, safely managed drinking-water access increased between its first and latest available records, while renewable-energy share decreased. That combination appears in 7 of the 19 complete comparisons.");
    expect(renderPanel(waterDownRenewableUp, geos)).toContain("For Samoa, safely managed drinking-water access decreased between its first and latest available records, while renewable-energy share increased. That combination appears in 3 of the 19 complete comparisons.");
    expect(renderPanel(missingOverlap, geos)).toContain("Guam is not included in the four-direction comparison because one or both measures lack comparable first-to-latest records. Three of the 22 places have an incomplete comparison.");
    expect(renderPanel(bothUp, geos)).not.toContain(geo.storyLabel);
  });

  it("derives comparison counts from a deliberately non-production collection", () => {
    const firstBothUp = regionalGeo("Alpha", "both_up");
    const secondBothUp = regionalGeo("Bravo", "both_up");
    const bothDown = regionalGeo("Charlie", "both_down");
    const incomplete = regionalGeo("Delta", "missing_overlap", false);
    const geos = [firstBothUp, secondBothUp, bothDown, incomplete];

    expect(renderPanel(firstBothUp, geos)).toContain("For Alpha, both measures increased between their first and latest available records. That combination appears in 2 of the 3 complete comparisons.");
    expect(renderPanel(incomplete, geos)).toContain("Delta is not included in the four-direction comparison because one or both measures lack comparable first-to-latest records. One of the 4 places has an incomplete comparison.");
  });

  it("keeps unknown complete directions distinct from incomplete records and uses singular grammar", () => {
    const unknown = regionalGeo("Unknown", "unreviewed_direction");
    const incomplete = regionalGeo("Guam", "missing_overlap", false);

    expect(renderPanel(unknown, [unknown])).toContain("For Unknown, both measures have comparable first-to-latest records, but their direction combination is unavailable in this view.");
    expect(renderPanel(incomplete, [incomplete])).toContain("Guam is not included in the four-direction comparison because one or both measures lack comparable first-to-latest records. The one loaded place has an incomplete comparison.");
  });

  it("keeps the regional reading after place identity and before the regional lens", () => {
    const selected = regionalGeo("Nauru", "both_up");
    const html = renderPanel(selected, [selected]);

    expect(html.indexOf("For Nauru")).toBeGreaterThan(html.indexOf('class="panel__name"'));
    expect(html.indexOf("For Nauru")).toBeLessThan(html.indexOf("Regional position"));
    expect(html.indexOf("Regional position")).toBeLessThan(html.indexOf("Nauru in the Pacific record"));
    expect(html.indexOf("Nauru in the Pacific record")).toBeLessThan(html.indexOf("Ring marks"));
    expect(html.indexOf("Ring marks")).toBeLessThan(html.indexOf("Safely managed drinking water"));
  });

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

    expect(html).toContain("Nauru in the Pacific record");
    expect(html).toContain("Ring marks</span> Nauru");
    expect(html).toContain("Safely managed drinking water");
    expect(html).toContain("+1.92 percentage points");
    expect(html).toContain("Renewable energy share");
    expect(html).toContain("+1.75 percentage points");
    expect(html).toContain('<strong class="regional-lens__value">13 of 14</strong>');
    expect(html).toContain("Selected Nauru 13 of 14");
    expect(html).toContain("Gap 89 · Pressure 62 · Capacity 27");
    expect(html.indexOf("Nauru in the Pacific record")).toBeLessThan(html.indexOf("Gap 89 · Pressure 62 · Capacity 27"));
    expect(html).not.toContain("Where Nauru sits in the Pacific");
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
    const record = html.slice(html.indexOf("Nauru in the Pacific record"), html.indexOf("Gap 89 · Pressure 62 · Capacity 27"));

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
