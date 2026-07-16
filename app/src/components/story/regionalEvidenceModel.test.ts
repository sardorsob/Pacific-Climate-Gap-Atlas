import { describe, expect, it } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import { adaptGeographiesPayload } from "../../lib/atlasData";
import { buildRegionalEvidenceModel } from "./regionalEvidenceModel";

const geos = adaptGeographiesPayload(generatedGeographies);

describe("regional evidence model", () => {
  it("keeps a neutral code order and the complete movement distribution", () => {
    const model = buildRegionalEvidenceModel(geos);

    expect(model.codes).toEqual([...model.codes].sort());
    expect(model.movement.complete).toHaveLength(19);
    expect(model.movement.incomplete.map((geo) => geo.code)).toEqual(["GU", "PN", "TK"]);
    expect(model.movement.quadrantCounts).toEqual({
      waterUpRenewableDown: 7,
      bothUp: 6,
      bothDown: 3,
      waterDownRenewableUp: 3,
    });
    expect(model.movement.waterDomain[0]).toBeLessThanOrEqual(-11.23);
    expect(model.movement.waterDomain[1]).toBeGreaterThanOrEqual(18.49);
    expect(model.movement.renewableDomain[0]).toBeLessThanOrEqual(-27.94);
    expect(model.movement.renewableDomain[1]).toBeGreaterThanOrEqual(5.48);
  });

  it("preserves signed movement, zero, null, and separate clocks without imputation", () => {
    const withZero = geos.map((geo) => geo.code === "AS"
      ? {
          ...geo,
          regionalStory: {
            ...geo.regionalStory,
            water: { ...geo.regionalStory.water, changePercentagePoints: 0 },
          },
        }
      : geo);
    const model = buildRegionalEvidenceModel(withZero);
    const americanSamoa = model.movement.complete.find((geo) => geo.code === "AS")!;
    const guam = model.movement.incomplete.find((geo) => geo.code === "GU")!;

    expect(americanSamoa.water).toEqual({ firstYear: 2000, latestYear: 2021, changePercentagePoints: 0 });
    expect(americanSamoa.renewable).toEqual({ firstYear: 2000, latestYear: 2022, changePercentagePoints: 0.49 });
    expect(guam.water.changePercentagePoints).toBeNull();
    expect(guam.renewable).toEqual({ firstYear: 2000, latestYear: 2022, changePercentagePoints: 6.11 });
  });

  it("keeps all visibility cells, roles, years, and direct coverage facts", () => {
    const model = buildRegionalEvidenceModel(geos);

    expect(model.visibility.columns).toHaveLength(14);
    expect(model.visibility.rows).toHaveLength(22);
    expect(model.visibility.rows.flatMap((row) => row.cells)).toHaveLength(308);
    expect(model.visibility.presentCount).toBe(277);
    expect(model.visibility.absentCount).toBe(31);
    expect(model.visibility.coverageFacts.map(({ label, present }) => [label, present])).toEqual([
      ["Recorded direct disaster loss", 12],
      ["Meteorological monitoring network", 18],
      ["Power generation", 18],
      ["Safely managed drinking water", 19],
      ["Renewable energy share", 20],
    ]);
    expect(
      model.visibility.rows.find((row) => row.code === "CK")!.cells
        .find((cell) => cell.featureId === "meteorological-monitoring-network"),
    ).toMatchObject({ role: "reporting_presence", present: true, latestYear: 2026 });
  });
});
