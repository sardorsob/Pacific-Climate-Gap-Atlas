import type { Geo, RegionalStoryMeasure, RegionalVisibilityPosition } from "../../lib/atlasData";

type CompleteMovementPlace = {
  geo: Geo;
  code: string;
  name: string;
  quadrant: string;
  water: RegionalStoryMeasure & { changePercentagePoints: number };
  renewable: RegionalStoryMeasure & { changePercentagePoints: number };
};

type IncompleteMovementPlace = {
  geo: Geo;
  code: string;
  name: string;
  quadrant: string;
  water: RegionalStoryMeasure;
  renewable: RegionalStoryMeasure;
};

type VisibilityRow = {
  geo: Geo;
  code: string;
  name: string;
  cells: RegionalVisibilityPosition[];
};

const COVERAGE_FEATURE_IDS = [
  "direct-disaster-economic-loss",
  "meteorological-monitoring-network",
  "power-generation",
  "proportion-of-population-using-safely-managed-drinking-water-services",
  "renewable-energy-share-in-the-total-final-energy-consumption",
] as const;

function signedDomain(values: number[]): [number, number] {
  return [Math.min(0, ...values), Math.max(0, ...values)];
}

export function buildRegionalEvidenceModel(geos: Geo[]) {
  const ordered = [...geos].sort((a, b) => a.code.localeCompare(b.code));
  const complete: CompleteMovementPlace[] = [];
  const incomplete: IncompleteMovementPlace[] = [];

  for (const geo of ordered) {
    const { water, renewable } = geo.regionalStory;
    if (
      geo.regionalStory.completeOverlap
      && water.changePercentagePoints !== null
      && renewable.changePercentagePoints !== null
    ) {
      complete.push({ geo, code: geo.code, name: geo.name, quadrant: geo.regionalStory.quadrant, water: { ...water, changePercentagePoints: water.changePercentagePoints }, renewable: { ...renewable, changePercentagePoints: renewable.changePercentagePoints } });
    } else {
      incomplete.push({ geo, code: geo.code, name: geo.name, quadrant: geo.regionalStory.quadrant, water, renewable });
    }
  }

  const columns = (ordered[0]?.regionalStory.visibility ?? []).map((cell, index) => ({
    index: index + 1,
    featureId: cell.featureId,
    label: cell.label,
    role: cell.role,
  }));
  const rows: VisibilityRow[] = ordered.map((geo) => ({
    geo,
    code: geo.code,
    name: geo.name,
    cells: [...geo.regionalStory.visibility],
  }));
  const cells = rows.flatMap((row) => row.cells);
  const presentCount = cells.filter((cell) => cell.present).length;
  const coverageFacts = COVERAGE_FEATURE_IDS.map((featureId) => {
    const matching = cells.filter((cell) => cell.featureId === featureId);
    return {
      featureId,
      label: matching[0]?.label ?? featureId,
      present: matching.filter((cell) => cell.present).length,
      total: rows.length,
    };
  });

  return {
    codes: ordered.map((geo) => geo.code),
    movement: {
      complete,
      incomplete,
      waterDomain: signedDomain(complete.map((place) => place.water.changePercentagePoints)),
      renewableDomain: signedDomain(complete.map((place) => place.renewable.changePercentagePoints)),
      quadrantCounts: {
        waterUpRenewableDown: complete.filter((place) => place.quadrant === "water_up_renewable_down").length,
        bothUp: complete.filter((place) => place.quadrant === "both_up").length,
        bothDown: complete.filter((place) => place.quadrant === "both_down").length,
        waterDownRenewableUp: complete.filter((place) => place.quadrant === "water_down_renewable_up").length,
      },
    },
    visibility: {
      columns,
      rows,
      presentCount,
      absentCount: cells.length - presentCount,
      coverageFacts,
    },
  };
}

export type RegionalEvidenceModel = ReturnType<typeof buildRegionalEvidenceModel>;
