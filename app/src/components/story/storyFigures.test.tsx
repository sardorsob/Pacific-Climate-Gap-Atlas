import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import type { Geo } from "../../lib/atlasData";
import { adaptGeographiesPayload } from "../../lib/atlasData";
import { PlaceComparisonScene } from "./PlaceComparisonScene";
import { PressureCapacityScene } from "./PressureCapacityScene";
import { RankBandScene } from "./RankBandScene";
import { RegionalEvidenceScene } from "./RegionalEvidenceScene";

function makeGeo(overrides: Partial<Geo> = {}): Geo {
  return {
    code: "NR",
    name: "Nauru",
    subregion: "Micronesia",
    status: "Country",
    lon: 166.93,
    lat: -0.53,
    gap: 62,
    pressure: 54,
    capacity: 38,
    scoreInputCount: 5,
    contextCount: 1,
    traceCount: 6,
    scoreInputPresence: Array.from({ length: 8 }, (_, index) => ({
      datasetSlug: `input-${index}`,
      datasetName: `Input ${index}`,
      pillar: "climate_signal" as const,
      present: index < 5,
    })),
    regionalStory: {
      water: { firstYear: null, latestYear: null, changePercentagePoints: null },
      renewable: { firstYear: null, latestYear: null, changePercentagePoints: null },
      completeOverlap: false,
      quadrant: "missing_overlap",
      visibility: [],
    },
    reportingStatus: "reported_positive_latest_count",
    monitoringCount: 2,
    latestMonitoringYear: 2024,
    storyPriority: 1,
    rankMin: 2,
    rankMax: 8,
    rankRange: 6,
    robustness: "sensitive",
    storyLabel: "High gap, thin monitoring",
    topPressure: [],
    topCapacity: [],
    indicatorRows: [],
    similarityNeighbors: [],
    outlook2030Flat: 64,
    outlookDisplay: "show_with_strong_caveat",
    ...overrides,
  };
}

const nauru = makeGeo();
const tuvalu = makeGeo({
  code: "TV",
  name: "Tuvalu",
  lon: 179.2,
  lat: -8.5,
  gap: 68,
  pressure: 66,
  capacity: 41,
  scoreInputCount: 3,
  contextCount: 0,
  traceCount: 3,
  reportingStatus: "reported_zero_latest_count",
  monitoringCount: 0,
});
const regionalGeos = adaptGeographiesPayload(generatedGeographies);

describe("story figures", () => {
  it("renders aligned Nauru and Tuvalu evidence portraits", () => {
    const html = renderToStaticMarkup(<PlaceComparisonScene nauru={nauru} tuvalu={tuvalu} />);

    expect(html).toContain("Nauru");
    expect(html).toContain("Tuvalu");
    expect(html).toContain("Reported zero");
    expect(html).toContain("Reported monitoring");
    expect(html).toContain("Score inputs");
    expect(html).toContain("Rank band");
    expect(html).toContain('data-stage-figure="comparison"');
    expect(html).toContain('data-code="NR"');
    expect(html).toContain('data-code="TV"');
    expect((html.match(/<figure class="evidence-portrait/g) ?? []).length).toBe(2);
    expect(html).not.toContain('data-selected="true"');
    expect(html).not.toContain("JSD");
  });

  it("labels capacity as visible capacity", () => {
    const html = renderToStaticMarkup(<PressureCapacityScene geos={[nauru, tuvalu]} />);

    expect(html).toContain("Climate pressure");
    expect(html).toContain("Visible capacity");
    expect((html.match(/class="pressure-capacity-figure__lobe /g) ?? []).length).toBe(4);
    expect((html.match(/evidence-mark/g) ?? []).length).toBeGreaterThan(1);
    expect(html).not.toContain("Adaptation readiness");
  });

  it("shows rank bands as sensitivity intervals and highlights Marshall Islands", () => {
    const marshall = makeGeo({ code: "MH", name: "Marshall Islands", rankMin: 4, rankMax: 19, rankRange: 15, robustness: "fragile" });
    const html = renderToStaticMarkup(<RankBandScene geos={[marshall, nauru]} reducedMotion />);

    expect(html).toContain("Marshall Islands");
    expect(html).toContain("4–19");
    expect(html).toContain("Sensitivity bands, not a fixed scoreboard");
    expect(html).toContain('data-stage-figure="rank-bands"');
    expect(html).toContain('data-motion-mode="static"');
    expect(html).toContain('data-code="MH"');
    expect(html).toContain('class="rank-band-figure__rows"');
    expect(html).toContain('style="--rank-start:');
    expect(html).toContain("not confidence intervals");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("midpoint");
  });

  it("renders the complete signed movement field with an explicit incomplete rail", () => {
    const html = renderToStaticMarkup(<RegionalEvidenceScene geos={regionalGeos} mode="movement" />);

    expect(html).toContain('data-mode="movement"');
    expect(html).toContain('data-complete-count="19"');
    expect(html).toContain('data-incomplete-count="3"');
    expect(html).toContain('data-present-count="277"');
    expect(html).toContain('data-absent-count="31"');
    expect((html.match(/data-region-kind="complete"/g) ?? [])).toHaveLength(19);
    expect((html.match(/data-region-kind="incomplete"/g) ?? [])).toHaveLength(3);
    expect((html.match(/class="evidence-mark evidence-mark--neutral" width="14" height="14"/g) ?? [])).toHaveLength(19);
    expect(html).toContain('data-zero-line="water"');
    expect(html).toContain('data-zero-line="renewable"');
    expect(html).toContain("Safely managed drinking water change (percentage points)");
    expect(html).toContain("Renewable energy share change (percentage points)");
    expect(html).toContain("Water up, renewable down");
    expect(html).toContain(">7<");
    expect(html).toContain("Both up");
    expect(html).toContain(">6<");
    expect(html).toContain("Guam");
    expect(html).toContain("renewable +6.11 pp, 2000–2022");
    expect(html).toContain("American Samoa: safely managed drinking water +9.27 percentage points, 2000–2021; renewable energy share +0.49 percentage points, 2000–2022");
  });

  it("renders all 308 visibility cells, the numbered key, and direct coverage facts", () => {
    const html = renderToStaticMarkup(<RegionalEvidenceScene geos={regionalGeos} mode="visibility" />);

    expect(html).toContain('data-mode="visibility"');
    expect((html.match(/data-region-kind="visibility"/g) ?? [])).toHaveLength(22);
    expect((html.match(/data-visibility-cell=/g) ?? [])).toHaveLength(308);
    expect((html.match(/data-cell-state="present"/g) ?? [])).toHaveLength(277);
    expect((html.match(/data-cell-state="absent"/g) ?? [])).toHaveLength(31);
    expect((html.match(/data-key-position=/g) ?? [])).toHaveLength(14);
    expect(html).toContain("277 present");
    expect(html).toContain("31 absent");
    expect(html).toContain("Recorded direct disaster loss 12/22");
    expect(html).toContain("Meteorological monitoring network 18/22");
    expect(html).toContain("Power generation 18/22");
    expect(html).toContain("Safely managed drinking water 19/22");
    expect(html).toContain("Renewable energy share 20/22");
    expect(html).toContain('data-visibility-cell="AS-direct-disaster-economic-loss" data-cell-state="absent" data-role="reporting_visibility_only"');
    expect(html).toContain("American Samoa — Recorded direct disaster loss: absent; role reporting visibility only; latest year unavailable");
    expect(html).toContain('data-visibility-cell="CK-meteorological-monitoring-network" data-cell-state="present" data-role="reporting_presence"');
    expect(html).toContain("Cook Islands — Meteorological monitoring network: present; role reporting presence; latest year 2026");
    expect(html).toContain('class="regional-evidence__cell regional-evidence__cell--absent"');
  });
});
