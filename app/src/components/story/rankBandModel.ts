import type { Geo } from "../../lib/atlasData";

export type RankBandRow = {
  code: string;
  name: string;
  min: number;
  max: number;
  span: number;
  midpoint: number;
  robustness: Geo["robustness"];
  highlight: boolean;
};

export function buildRankBandRows(geos: Geo[]): RankBandRow[] {
  return geos
    .map((geo) => ({
      code: geo.code,
      name: geo.name,
      min: geo.rankMin,
      max: geo.rankMax,
      span: geo.rankMax - geo.rankMin,
      midpoint: (geo.rankMin + geo.rankMax) / 2,
      robustness: geo.robustness,
      highlight: geo.code === "MH",
    }))
    .sort((a, b) => a.midpoint - b.midpoint || a.code.localeCompare(b.code));
}

export function rankBandTransition(reducedMotion: boolean): {
  duration: number;
  mode: "static" | "rearrange";
} {
  return reducedMotion
    ? { duration: 0, mode: "static" }
    : { duration: 560, mode: "rearrange" };
}
