import type { Geo } from "../../lib/atlasData";

export type RankBandRow = {
  code: string;
  name: string;
  min: number;
  max: number;
  span: number;
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
      robustness: geo.robustness,
      highlight: geo.code === "MH",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function rankToPercent(rank: number): number {
  const clamped = Math.max(1, Math.min(22, rank));
  return ((clamped - 1) / 21) * 100;
}

export function rankBandTransition(reducedMotion: boolean): {
  duration: number;
  mode: "static" | "rearrange";
} {
  return reducedMotion
    ? { duration: 0, mode: "static" }
    : { duration: 560, mode: "rearrange" };
}
