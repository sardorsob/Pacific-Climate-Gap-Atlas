import { describe, expect, it } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import { adaptGeographiesPayload } from "../../lib/atlasData";
import { buildRegionalPositionModel } from "./regionalPositionModel";

const geos = adaptGeographiesPayload(generatedGeographies);

function withWaterValues(values: number[]) {
  return geos.slice(0, values.length).map((geo, index) => ({
    ...geo,
    regionalStory: {
      ...geo.regionalStory,
      water: { ...geo.regionalStory.water, changePercentagePoints: values[index] },
    },
  }));
}

function strip(model: ReturnType<typeof buildRegionalPositionModel>, id: "water" | "renewable" | "visibility") {
  return model.find((candidate) => candidate.id === id)!;
}

describe("regional position model", () => {
  it("builds exactly three observed-record strips for Nauru from all 22 current records", () => {
    const model = buildRegionalPositionModel(geos, "NR");
    const water = strip(model, "water");
    const renewable = strip(model, "renewable");
    const visibility = strip(model, "visibility");

    expect(model).toHaveLength(3);
    expect(model.map((candidate) => candidate.id)).toEqual(["water", "renewable", "visibility"]);
    expect(water).toMatchObject({
      applicable: expect.any(Array),
      extent: [-11.23, 18.49],
      median: 0.67,
      unavailableCount: 3,
      selected: { code: "NR", value: 1.92, state: "available" },
    });
    expect(water.applicable).toHaveLength(19);
    expect(renewable).toMatchObject({
      extent: [-27.94, 6.11],
      unavailableCount: 2,
      selected: { code: "NR", value: 1.75, state: "available" },
    });
    expect(renewable.applicable).toHaveLength(20);
    expect(renewable.median).toBeCloseTo(0.01, 8);
    expect(visibility).toMatchObject({
      extent: [6, 14],
      scaleExtent: [0, 14],
      median: 14,
      unavailableCount: 0,
      denominator: 14,
      selected: { code: "NR", value: 13, state: "available" },
    });
    expect(visibility.applicable).toHaveLength(22);
  });

  it("excludes nulls from numeric summaries and reports a selected null as unavailable", () => {
    const selected = geos.find((geo) => geo.code === "GU")!;
    const model = buildRegionalPositionModel(geos, selected.code);
    const water = strip(model, "water");
    const renewable = strip(model, "renewable");

    expect(water.applicable.map((observation) => observation.code)).not.toContain("GU");
    expect(water.unavailableCount).toBe(3);
    expect(water.selected).toEqual({ code: "GU", value: null, state: "unavailable" });
    expect(renewable.selected).toEqual({ code: "GU", value: 6.11, state: "available" });
  });

  it("uses numeric median, signed padded scales, and deterministic collision lanes", () => {
    const sample = withWaterValues([-2, 0, 0, 4]);
    const [firstZero, secondZero] = [sample[1].code, sample[2].code].sort();
    const water = strip(buildRegionalPositionModel(sample, sample[1].code), "water");

    expect(water.extent).toEqual([-2, 4]);
    expect(water.median).toBe(0);
    expect(water.scaleExtent).toEqual([-2.3, 4.3]);
    expect(water.applicable.map(({ code, value, lane }) => ({ code, value, lane }))).toEqual([
      { code: sample[0].code, value: -2, lane: 0 },
      { code: firstZero, value: 0, lane: 0 },
      { code: secondZero, value: 0, lane: -1 },
      { code: sample[3].code, value: 4, lane: 0 },
    ]);
  });

  it("keeps a single all-equal observation visible with a padded signed scale", () => {
    const [only] = withWaterValues([3]);
    const water = strip(buildRegionalPositionModel([only], only.code), "water");

    expect(water.extent).toEqual([3, 3]);
    expect(water.scaleExtent).toEqual([-0.5, 3.5]);
    expect(water.median).toBe(3);
    expect(water.applicable).toEqual([{ code: only.code, name: only.name, value: 3, lane: 0 }]);
  });

  it("is deterministic across input order and leaves source records untouched", () => {
    const before = JSON.stringify(geos);
    const original = buildRegionalPositionModel(geos, "NR");
    const reordered = buildRegionalPositionModel([...geos].reverse(), "NR");

    expect(reordered).toEqual(original);
    expect(JSON.stringify(geos)).toBe(before);
  });

  it("returns empty, unknown selected strips without inventing a zero", () => {
    const model = buildRegionalPositionModel([], "XX");

    expect(model).toHaveLength(3);
    for (const candidate of model) {
      expect(candidate.applicable).toEqual([]);
      expect(candidate.extent).toBeNull();
      expect(candidate.scaleExtent).toBeNull();
      expect(candidate.median).toBeNull();
      expect(candidate.unavailableCount).toBe(0);
      expect(candidate.selected).toEqual({ code: "XX", value: null, state: "unknown" });
    }
  });
});
