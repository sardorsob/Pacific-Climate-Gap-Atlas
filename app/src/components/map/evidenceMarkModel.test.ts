import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import { buildEvidenceMark } from "./evidenceMarkModel";

const geo = {
  code: "NR",
  name: "Nauru",
  subregion: "Micronesia",
  status: "Republic",
  placeNote: null,
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
    pillar: index < 3 ? "climate_signal" : index < 5 ? "observed_stress" : "adaptation_capacity",
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
  monitoringCaveat: null,
  storyPriority: 1,
  rankMin: 2,
  rankMax: 8,
  rankRange: 6,
  robustness: "sensitive",
  rankCaveat: null,
  storyLabel: "High gap, thin monitoring",
  nonCausalCaveat: null,
  topPressure: [],
  topCapacity: [],
  indicatorRows: [],
  similarityNeighbors: [],
  outlook2030Flat: 64,
  outlookDisplay: "show_with_strong_caveat",
} satisfies Geo;

describe("evidence mark", () => {
  it("keeps eight stable score-input positions and separates context", () => {
    const model = buildEvidenceMark(geo, { scoreKey: "gap", selected: false });

    expect(model.inputs).toHaveLength(8);
    expect(model.inputs.map((input) => input.angle)).toEqual([-90, -45, 0, 45, 90, 135, 180, 225]);
    expect(model.inputs.filter((input) => input.present)).toHaveLength(geo.scoreInputCount);
    expect(model.context.present).toBe(geo.contextCount > 0);
    expect(model.context.kind).toBe("context-only");
    expect(model.context.angle).toBe(112.5);
  });

  it.each([
    ["reported_positive_latest_count", "solid"],
    ["reported_zero_latest_count", "open-dash"],
    ["missing_monitoring_dataset_row", "broken-dot"],
  ] as const)("maps %s to %s", (status, edge) => {
    expect(buildEvidenceMark({ ...geo, reportingStatus: status }, {
      scoreKey: "gap",
      selected: true,
    }).reportingEdge).toBe(edge);
  });
});
