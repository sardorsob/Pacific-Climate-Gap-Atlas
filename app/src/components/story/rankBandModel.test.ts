import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import { buildRankBandRows, rankBandTransition } from "./rankBandModel";

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
  it("sorts intervals by midpoint without presenting a definitive rank", () => {
    const rows = buildRankBandRows([makeGeo("MH", 4, 19, "fragile"), makeGeo("NR", 1, 7, "sensitive")]);

    expect(rows.find((row) => row.code === "MH")).toMatchObject({
      code: "MH",
      min: 4,
      max: 19,
      span: 15,
      midpoint: 11.5,
      highlight: true,
    });
    expect(rows.map((row) => row.code)).toEqual(["NR", "MH"]);
  });

  it("uses static layout under reduced motion", () => {
    expect(rankBandTransition(true)).toEqual({ duration: 0, mode: "static" });
    expect(rankBandTransition(false)).toEqual({ duration: 560, mode: "rearrange" });
  });
});
