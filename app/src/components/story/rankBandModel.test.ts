import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import { buildRankBandRows, rankBandTransition, rankToPercent } from "./rankBandModel";

function makeGeo(code: string, min: number, max: number, robustness: Geo["robustness"]): Geo {
  return {
    code,
    name: code === "MH" ? "Marshall Islands" : "Nauru",
    subregion: "Micronesia",
    status: "Country",
    lon: 0,
    lat: 0,
    gap: 50,
    pressure: 50,
    capacity: 50,
    scoreInputCount: 8,
    contextCount: 0,
    traceCount: 8,
    scoreInputPresence: [],
    regionalStory: {
      water: { firstYear: null, latestYear: null, changePercentagePoints: null },
      renewable: { firstYear: null, latestYear: null, changePercentagePoints: null },
      completeOverlap: false,
      quadrant: "missing_overlap",
      visibility: [],
    },
    reportingStatus: "reported_positive_latest_count",
    monitoringCount: 1,
    latestMonitoringYear: 2024,
    storyPriority: 1,
    rankMin: min,
    rankMax: max,
    rankRange: max - min,
    robustness,
    storyLabel: "Evidence profile",
    topPressure: [],
    topCapacity: [],
    indicatorRows: [],
    similarityNeighbors: [],
    outlook2030Flat: 50,
    outlookDisplay: "show",
  };
}

describe("rank band model", () => {
  it("uses stable alphabetical order instead of implying a leaderboard", () => {
    const rows = buildRankBandRows([makeGeo("MH", 4, 19, "fragile"), makeGeo("NR", 1, 7, "sensitive")]);

    expect(rows.find((row) => row.code === "MH")).toMatchObject({
      code: "MH",
      min: 4,
      max: 19,
      span: 15,
      highlight: true,
    });
    expect(rows.map((row) => row.name)).toEqual(["Marshall Islands", "Nauru"]);
  });

  it("maps the shared 1 to 22 scale to percentages", () => {
    expect(rankToPercent(1)).toBe(0);
    expect(rankToPercent(11.5)).toBe(50);
    expect(rankToPercent(22)).toBe(100);
    expect(rankToPercent(99)).toBe(100);
  });

  it("uses static layout under reduced motion", () => {
    expect(rankBandTransition(true)).toEqual({ duration: 0, mode: "static" });
    expect(rankBandTransition(false)).toEqual({ duration: 560, mode: "rearrange" });
  });
});
