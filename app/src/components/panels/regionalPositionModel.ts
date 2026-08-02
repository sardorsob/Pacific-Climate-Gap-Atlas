import type { Geo } from "../../lib/atlasData";

export type RegionalPositionStripId = "water" | "renewable" | "visibility";

export type RegionalPositionObservation = {
  code: string;
  name: string;
  value: number;
  lane: number;
  firstYear: number | null;
  latestYear: number | null;
};

export type RegionalPositionGroup = {
  value: number;
  observations: RegionalPositionObservation[];
};

export type RegionalPositionStrip = {
  id: RegionalPositionStripId;
  applicable: RegionalPositionObservation[];
  groups: RegionalPositionGroup[];
  extent: [number, number] | null;
  scaleExtent: [number, number] | null;
  median: number | null;
  unavailableCount: number;
  denominator?: 14;
  selected: {
    code: string;
    value: number | null;
    state: "available" | "unavailable" | "unknown";
  };
};

function median(values: number[]): number | null {
  if (!values.length) return null;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}

function collisionLane(index: number): number {
  if (!index) return 0;
  return index % 2 ? -Math.ceil(index / 2) : index / 2;
}

type RegionalPositionValue = {
  value: number | null;
  firstYear: number | null;
  latestYear: number | null;
};

function buildStrip(
  id: RegionalPositionStripId,
  geos: Geo[],
  selectedCode: string,
  valueFor: (geo: Geo) => RegionalPositionValue,
  denominator?: 14,
): RegionalPositionStrip {
  const selectedGeo = geos.find((geo) => geo.code === selectedCode);
  const selectedValue = selectedGeo ? valueFor(selectedGeo).value : null;
  const applicable = geos
    .flatMap((geo) => {
      const { value, firstYear, latestYear } = valueFor(geo);
      return value === null ? [] : [{ code: geo.code, name: geo.name, value, lane: 0, firstYear, latestYear }];
    })
    .sort((a, b) => a.value - b.value || a.code.localeCompare(b.code));

  const groups: RegionalPositionGroup[] = [];
  for (let index = 0; index < applicable.length;) {
    let end = index + 1;
    while (end < applicable.length && applicable[end].value === applicable[index].value) end += 1;
    for (let laneIndex = index; laneIndex < end; laneIndex += 1) {
      applicable[laneIndex].lane = collisionLane(laneIndex - index);
    }
    groups.push({ value: applicable[index].value, observations: applicable.slice(index, end) });
    index = end;
  }

  const values = applicable.map((observation) => observation.value);
  const extent = values.length ? [values[0], values.at(-1)!] as [number, number] : null;
  const scaleExtent = extent
    ? denominator
      ? [0, denominator] as [number, number]
      : (() => {
          const padding = (extent[1] - extent[0]) * 0.05 || 0.5;
          return [Math.min(0, extent[0]) - padding, Math.max(0, extent[1]) + padding] as [number, number];
        })()
    : null;

  return {
    id,
    applicable,
    groups,
    extent,
    scaleExtent,
    median: median(values),
    unavailableCount: geos.length - applicable.length,
    ...(denominator ? { denominator } : {}),
    selected: {
      code: selectedCode,
      value: selectedValue,
      state: selectedGeo ? selectedValue === null ? "unavailable" : "available" : "unknown",
    },
  };
}

export function buildRegionalPositionModel(geos: Geo[], selectedCode: string): RegionalPositionStrip[] {
  return [
    buildStrip("water", geos, selectedCode, (geo) => ({
      value: geo.regionalStory.water.changePercentagePoints,
      firstYear: geo.regionalStory.water.firstYear,
      latestYear: geo.regionalStory.water.latestYear,
    })),
    buildStrip("renewable", geos, selectedCode, (geo) => ({
      value: geo.regionalStory.renewable.changePercentagePoints,
      firstYear: geo.regionalStory.renewable.firstYear,
      latestYear: geo.regionalStory.renewable.latestYear,
    })),
    buildStrip("visibility", geos, selectedCode, (geo) => ({
      value: geo.regionalStory.visibility.filter((position) => position.present).length,
      firstYear: null,
      latestYear: null,
    }), 14),
  ];
}
