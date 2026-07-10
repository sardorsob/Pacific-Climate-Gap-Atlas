import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import { PlaceComparisonScene } from "./PlaceComparisonScene";
import { PressureCapacityScene } from "./PressureCapacityScene";

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

describe("story figures", () => {
  it("renders aligned Nauru and Tuvalu evidence portraits", () => {
    const html = renderToStaticMarkup(<PlaceComparisonScene nauru={nauru} tuvalu={tuvalu} />);

    expect(html).toContain("Nauru");
    expect(html).toContain("Tuvalu");
    expect(html).toContain("Reported zero");
    expect(html).toContain("Reported monitoring");
    expect(html).toContain("Score inputs");
    expect(html).toContain("Rank band");
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
});
