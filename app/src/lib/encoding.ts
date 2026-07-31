// Color-role ledger + encoding helpers for the atlas mockup.
// Roles are kept separate on purpose (see DESIGN_BRIEF.md "Color Role Ledger"):
// score magnitude is COLOR, evidence density is SIZE, reporting status is the
// RING/PATTERN. Missingness is never communicated by color alone.

import type { Geo, ReportingStatus } from "./atlasData";

export type ScoreKey = "gap" | "pressure" | "capacity";

export function signedChange(value: number): string {
  if (Object.is(value, -0) || value === 0) return "0.00";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}`;
}

// Sequential ramps (light to dark) per score role.
const RAMPS: Record<ScoreKey, string[]> = {
  // warm sand -> coral -> maroon (not alarm-red dominant)
  gap: ["#fbeede", "#f4c98a", "#e8895a", "#b5462f"],
  // cool blue
  pressure: ["#e8effb", "#9db9e3", "#4f74c4", "#27408b"],
  // teal/green (capacity is not "safe" without caveat)
  capacity: ["#e7f4ec", "#a4d4ae", "#4fa873", "#1f6b46"],
};

// Uncertainty ramp: neutral -> purple (rank range, 0..15ish).
const UNCERTAINTY_RAMP = ["#e9e9ee", "#b9a8d6", "#6b4fa3"];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

// Interpolate a 0..1 fraction across an arbitrary list of hex stops.
function rampAt(stops: string[], frac: number): string {
  const f = Math.max(0, Math.min(1, frac));
  const seg = f * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(seg));
  const t = seg - i;
  const [r1, g1, b1] = hexToRgb(stops[i]);
  const [r2, g2, b2] = hexToRgb(stops[i + 1]);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export function scoreColor(key: ScoreKey, value: number): string {
  return rampAt(RAMPS[key], value / 100);
}

export function rampStops(key: ScoreKey): string[] {
  return RAMPS[key];
}

export function uncertaintyColor(rankRange: number): string {
  // 0..15 mapped across the ramp; most geos are fragile, so keep it readable.
  return rampAt(UNCERTAINTY_RAMP, rankRange / 15);
}

export const UNCERTAINTY_STOPS = UNCERTAINTY_RAMP;

// Primary presence marks keep a stable footprint; evidence completeness is encoded by ticks.
export const PRESENCE_RADIUS = 12;

export type RingVariant = "solid" | "dashed" | "hatch";

export function ringVariant(status: ReportingStatus): RingVariant {
  switch (status) {
    case "reported_positive_latest_count":
      return "solid";
    case "reported_zero_latest_count":
      return "dashed";
    case "missing_monitoring_dataset_row":
      return "hatch";
  }
}

export function reportingLabel(status: ReportingStatus): string {
  switch (status) {
    case "reported_positive_latest_count":
      return "Reported monitoring";
    case "reported_zero_latest_count":
      return "Latest row reports 0";
    case "missing_monitoring_dataset_row":
      return "No rows in processed data";
  }
}

// Load-bearing caveat copy, kept verbatim to the briefs.
export function reportingCaveat(status: ReportingStatus): string {
  switch (status) {
    case "reported_positive_latest_count":
      return "Latest official monitoring row is present; count may still omit station quality, continuity, siting, and reporting completeness.";
    case "reported_zero_latest_count":
      return "Latest official monitoring row reports 0; verify source semantics before interpreting this as no monitoring infrastructure.";
    case "missing_monitoring_dataset_row":
      return "No monitoring rows in processed official data; treat as a reporting gap, not confirmed absence.";
  }
}

export function rankChipText(geo: Geo): string {
  return `Rank moves ${geo.rankMin}-${geo.rankMax} of 22 under stress tests`;
}

export function valueForScore(geo: Geo, key: ScoreKey): number {
  if (key === "gap") return geo.gap;
  if (key === "pressure") return geo.pressure;
  return geo.capacity;
}
