// Mockup-only fixture for the Pacific Adaptation Gap Atlas concept review.
//
// Values are REAL where it matters for honest critique:
// - lon/lat, gap/pressure/capacity scores, and included-indicator counts come
//   from app/public/data/atlas_geographies.geojson.
// - reporting status / quadrant / story priority come from
//   artifacts/tables/eda_monitoring_gap.csv.
// - rank range / robustness come from artifacts/tables/eda_rank_volatility.csv.
// - story labels + top signals come from
//   artifacts/tables/eda_country_story_labels.csv.
// - outlook2030Flat (projected score) + outlookDisplay come from
//   artifacts/tables/eda_outlook_interpretation.csv (capacity_flat, 2030).
//
// This file exists so visual states are reviewable WITHOUT wiring a data
// pipeline. It does not change any methodology or generated artifact.

export type ReportingStatus =
  | "reported_positive_latest_count"
  | "reported_zero_latest_count"
  | "missing_monitoring_dataset_row";

export type OutlookDisplay = "show" | "show_with_strong_caveat" | "withhold";

export type Subregion = "Polynesia" | "Micronesia" | "Melanesia";

export type Geo = {
  code: string;
  name: string;
  subregion: Subregion;
  status: string; // short political-status note, flagged for review before publish
  lon: number;
  lat: number;
  gap: number;
  pressure: number;
  capacity: number;
  indicators: number; // included_indicator_count (evidence density)
  reportingStatus: ReportingStatus;
  monitoringCount: number;
  latestMonitoringYear: number | null;
  storyPriority: 1 | 2 | 3 | 4 | 5;
  rankMin: number;
  rankMax: number;
  rankRange: number;
  robustness: "fragile" | "sensitive";
  storyLabel: string;
  topPressure: string[];
  topCapacity: string[];
  outlook2030Flat: number;
  outlookDisplay: OutlookDisplay;
};

export const ATLAS_GEOS: Geo[] = [
  {
    code: "PN", name: "Pitcairn", subregion: "Polynesia", status: "British Overseas Territory",
    lon: -128.3, lat: -24.4, gap: 100.0, pressure: 53.4, capacity: 10.1, indicators: 4,
    reportingStatus: "reported_zero_latest_count", monitoringCount: 0, latestMonitoringYear: 2026,
    storyPriority: 1, rankMin: 1, rankMax: 3, rankRange: 2, robustness: "sensitive",
    storyLabel: "High gap: moderate pressure / low capacity",
    topPressure: ["Mean surface temp (56.8)", "Rainfall anomalies (50.0)"],
    topCapacity: ["Fisheries measures (9.1)", "Met monitoring (11.1)"],
    outlook2030Flat: 68.5, outlookDisplay: "withhold",
  },
  {
    code: "NR", name: "Nauru", subregion: "Micronesia", status: "Sovereign state (status wording in review)",
    lon: 166.9, lat: -0.5, gap: 88.9, pressure: 61.6, capacity: 26.9, indicators: 9,
    reportingStatus: "reported_zero_latest_count", monitoringCount: 0, latestMonitoringYear: 2026,
    storyPriority: 1, rankMin: 1, rankMax: 7, rankRange: 6, robustness: "fragile",
    storyLabel: "High gap: moderate pressure / low capacity",
    topPressure: ["Rainfall anomalies (100.0)", "Directly affected persons (81.0)"],
    topCapacity: ["Met monitoring (11.1)", "Power generation (33.3)"],
    outlook2030Flat: 100.0, outlookDisplay: "show",
  },
  {
    code: "AS", name: "American Samoa", subregion: "Polynesia", status: "U.S. territory (wording in review)",
    lon: -170.7, lat: -14.3, gap: 85.0, pressure: 49.7, capacity: 18.2, indicators: 7,
    reportingStatus: "missing_monitoring_dataset_row", monitoringCount: 0, latestMonitoringYear: null,
    storyPriority: 1, rankMin: 2, rankMax: 8, rankRange: 6, robustness: "fragile",
    storyLabel: "High gap: moderate pressure / low capacity",
    topPressure: ["Rainfall anomalies (68.2)", "Directly affected persons (52.4)"],
    topCapacity: ["Fisheries measures (18.2)"],
    outlook2030Flat: 49.6, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "WF", name: "Wallis and Futuna", subregion: "Polynesia", status: "French overseas collectivity (wording in review)",
    lon: -176.2, lat: -13.8, gap: 82.6, pressure: 34.1, capacity: 4.5, indicators: 6,
    reportingStatus: "missing_monitoring_dataset_row", monitoringCount: 0, latestMonitoringYear: null,
    storyPriority: 1, rankMin: 1, rankMax: 11, rankRange: 10, robustness: "fragile",
    storyLabel: "High gap: moderate pressure / low capacity",
    topPressure: ["Rainfall anomalies (77.3)", "Sea level anomalies (50.0)"],
    topCapacity: ["Fisheries measures (4.5)"],
    outlook2030Flat: 71.3, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "TV", name: "Tuvalu", subregion: "Polynesia", status: "Sovereign state (status wording in review)",
    lon: 179.2, lat: -8.5, gap: 77.7, pressure: 66.5, capacity: 40.7, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 3, latestMonitoringYear: 2026,
    storyPriority: 3, rankMin: 2, rankMax: 9, rankRange: 7, robustness: "fragile",
    storyLabel: "High gap: high pressure / moderate capacity",
    topPressure: ["Rainfall anomalies (86.4)", "Directly affected persons (85.7)"],
    topCapacity: ["Power generation (16.7)", "Fisheries measures (50.0)"],
    outlook2030Flat: 72.1, outlookDisplay: "show",
  },
  {
    code: "MH", name: "Marshall Islands", subregion: "Micronesia", status: "Sovereign state (Compact of Free Association)",
    lon: 171.2, lat: 7.1, gap: 66.0, pressure: 67.1, capacity: 50.5, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 2, latestMonitoringYear: 2026,
    storyPriority: 2, rankMin: 4, rankMax: 19, rankRange: 15, robustness: "fragile",
    storyLabel: "Mixed gap: high pressure / moderate capacity",
    topPressure: ["Directly affected persons (100.0)", "Mean sea-surface temp (52.4)"],
    topCapacity: ["Met monitoring (38.9)", "Power generation (44.4)"],
    outlook2030Flat: 11.4, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "NU", name: "Niue", subregion: "Polynesia", status: "Self-governing, free association with NZ",
    lon: -169.9, lat: -19.1, gap: 63.2, pressure: 32.4, capacity: 18.0, indicators: 8,
    reportingStatus: "reported_zero_latest_count", monitoringCount: 0, latestMonitoringYear: 2026,
    storyPriority: 2, rankMin: 5, rankMax: 14, rankRange: 9, robustness: "fragile",
    storyLabel: "Mixed gap: low pressure / low capacity",
    topPressure: ["Rainfall anomalies (63.6)", "Sea level anomalies (50.0)"],
    topCapacity: ["Met monitoring (11.1)", "Power generation (11.1)"],
    outlook2030Flat: 79.1, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "PW", name: "Palau", subregion: "Micronesia", status: "Sovereign state (Compact of Free Association)",
    lon: 134.6, lat: 7.5, gap: 62.6, pressure: 65.0, capacity: 51.0, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 1, latestMonitoringYear: 2026,
    storyPriority: 4, rankMin: 5, rankMax: 13, rankRange: 8, robustness: "fragile",
    storyLabel: "Mixed gap: moderate pressure / moderate capacity",
    topPressure: ["Mean sea-surface temp (85.7)", "Mean surface temp (81.8)"],
    topCapacity: ["Met monitoring (25.0)", "Fisheries measures (61.4)"],
    outlook2030Flat: 41.1, outlookDisplay: "withhold",
  },
  {
    code: "FM", name: "Micronesia (Fed. States)", subregion: "Micronesia", status: "Sovereign state (Compact of Free Association)",
    lon: 158.2, lat: 6.9, gap: 58.4, pressure: 76.4, capacity: 65.8, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 3, latestMonitoringYear: 2026,
    storyPriority: 5, rankMin: 5, rankMax: 12, rankRange: 7, robustness: "fragile",
    storyLabel: "Mixed gap: high pressure / moderate capacity",
    topPressure: ["Directly affected persons (90.5)", "Mean sea-surface temp (85.7)"],
    topCapacity: ["Met monitoring (55.6)", "Power generation (55.6)"],
    outlook2030Flat: 40.6, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "SB", name: "Solomon Islands", subregion: "Melanesia", status: "Sovereign state (status wording in review)",
    lon: 160.2, lat: -9.6, gap: 58.1, pressure: 81.1, capacity: 70.7, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 3, latestMonitoringYear: 2026,
    storyPriority: 5, rankMin: 1, rankMax: 14, rankRange: 13, robustness: "fragile",
    storyLabel: "Mixed gap: high pressure / high capacity",
    topPressure: ["Mean surface temp (95.5)", "Directly affected persons (95.2)"],
    topCapacity: ["Met monitoring (55.6)", "Power generation (61.1)"],
    outlook2030Flat: 50.2, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "TK", name: "Tokelau", subregion: "Polynesia", status: "Non-self-governing territory of NZ",
    lon: -171.8, lat: -9.2, gap: 55.7, pressure: 23.3, capacity: 14.7, indicators: 8,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 1, latestMonitoringYear: 2026,
    storyPriority: 2, rankMin: 6, rankMax: 18, rankRange: 12, robustness: "fragile",
    storyLabel: "Mixed gap: low pressure / low capacity",
    topPressure: ["Sea level anomalies (50.0)", "Rainfall anomalies (27.3)"],
    topCapacity: ["Power generation (5.6)", "Fisheries measures (13.6)"],
    outlook2030Flat: 70.1, outlookDisplay: "show",
  },
  {
    code: "MP", name: "Northern Mariana Is.", subregion: "Micronesia", status: "U.S. commonwealth (wording in review)",
    lon: 145.7, lat: 15.1, gap: 51.1, pressure: 45.8, capacity: 40.9, indicators: 7,
    reportingStatus: "missing_monitoring_dataset_row", monitoringCount: 0, latestMonitoringYear: null,
    storyPriority: 4, rankMin: 3, rankMax: 12, rankRange: 9, robustness: "fragile",
    storyLabel: "Mixed gap: moderate pressure / moderate capacity",
    topPressure: ["Mean sea-surface temp (85.7)", "Mean surface temp (81.8)"],
    topCapacity: ["Fisheries measures (40.9)"],
    outlook2030Flat: 38.5, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "VU", name: "Vanuatu", subregion: "Melanesia", status: "Sovereign state (status wording in review)",
    lon: 167.7, lat: -16.2, gap: 38.4, pressure: 65.3, capacity: 70.4, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 6, latestMonitoringYear: 2026,
    storyPriority: 5, rankMin: 10, rankMax: 17, rankRange: 7, robustness: "fragile",
    storyLabel: "Mixed gap: moderate pressure / high capacity",
    topPressure: ["Sea level anomalies (100.0)", "Mean surface temp (81.8)"],
    topCapacity: ["Power generation (50.0)", "Fisheries measures (75.0)"],
    outlook2030Flat: 28.6, outlookDisplay: "show",
  },
  {
    code: "WS", name: "Samoa", subregion: "Polynesia", status: "Sovereign state (status wording in review)",
    lon: -172.1, lat: -13.8, gap: 37.0, pressure: 49.0, capacity: 55.2, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 2, latestMonitoringYear: 2026,
    storyPriority: 4, rankMin: 13, rankMax: 16, rankRange: 3, robustness: "sensitive",
    storyLabel: "Mixed gap: moderate pressure / moderate capacity",
    topPressure: ["Rainfall anomalies (81.8)", "Sea level anomalies (50.0)"],
    topCapacity: ["Met monitoring (38.9)", "Fisheries measures (54.5)"],
    outlook2030Flat: 18.7, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "KI", name: "Kiribati", subregion: "Micronesia", status: "Sovereign state (spans central Pacific)",
    lon: -157.4, lat: 1.9, gap: 31.1, pressure: 47.9, capacity: 58.8, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 4, latestMonitoringYear: 2026,
    storyPriority: 5, rankMin: 10, rankMax: 22, rankRange: 12, robustness: "fragile",
    storyLabel: "Lower gap: moderate pressure / moderate capacity",
    topPressure: ["Rainfall anomalies (95.5)", "Directly affected persons (57.1)"],
    topCapacity: ["Power generation (22.2)", "Met monitoring (72.2)"],
    outlook2030Flat: 61.4, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "CK", name: "Cook Islands", subregion: "Polynesia", status: "Self-governing, free association with NZ",
    lon: -159.8, lat: -21.2, gap: 29.0, pressure: 30.2, capacity: 42.7, indicators: 8,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 2, latestMonitoringYear: 2026,
    storyPriority: 4, rankMin: 11, rankMax: 21, rankRange: 10, robustness: "fragile",
    storyLabel: "Lower gap: low pressure / moderate capacity",
    topPressure: ["Sea level anomalies (50.0)", "Rainfall anomalies (45.5)"],
    topCapacity: ["Power generation (27.8)", "Met monitoring (38.9)"],
    outlook2030Flat: 22.7, outlookDisplay: "show",
  },
  {
    code: "TO", name: "Tonga", subregion: "Polynesia", status: "Sovereign state (status wording in review)",
    lon: -175.2, lat: -21.2, gap: 26.2, pressure: 52.7, capacity: 67.3, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 4, latestMonitoringYear: 2026,
    storyPriority: 5, rankMin: 12, rankMax: 20, rankRange: 8, robustness: "fragile",
    storyLabel: "Lower gap: moderate pressure / high capacity",
    topPressure: ["Rainfall anomalies (90.9)", "Mean surface temp (56.8)"],
    topCapacity: ["Power generation (38.9)", "Met monitoring (72.2)"],
    outlook2030Flat: 30.4, outlookDisplay: "show",
  },
  {
    code: "PG", name: "Papua New Guinea", subregion: "Melanesia", status: "Sovereign state (status wording in review)",
    lon: 145.0, lat: -6.3, gap: 23.5, pressure: 76.7, capacity: 93.5, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 6, latestMonitoringYear: 2026,
    storyPriority: 5, rankMin: 9, rankMax: 21, rankRange: 12, robustness: "fragile",
    storyLabel: "Lower gap: high pressure / high capacity",
    topPressure: ["Mean sea-surface temp (100.0)", "Mean surface temp (100.0)"],
    topCapacity: ["Met monitoring (86.1)", "Power generation (94.4)"],
    outlook2030Flat: 3.1, outlookDisplay: "withhold",
  },
  {
    code: "GU", name: "Guam", subregion: "Micronesia", status: "U.S. territory (wording in review)",
    lon: 144.8, lat: 13.4, gap: 19.9, pressure: 38.4, capacity: 58.1, indicators: 8,
    reportingStatus: "missing_monitoring_dataset_row", monitoringCount: 0, latestMonitoringYear: null,
    storyPriority: 4, rankMin: 8, rankMax: 20, rankRange: 12, robustness: "fragile",
    storyLabel: "Lower gap: moderate pressure / moderate capacity",
    topPressure: ["Mean sea-surface temp (85.7)", "Mean surface temp (81.8)"],
    topCapacity: ["Fisheries measures (27.3)", "Power generation (88.9)"],
    outlook2030Flat: 23.3, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "NC", name: "New Caledonia", subregion: "Melanesia", status: "French sui generis collectivity (sensitive status)",
    lon: 165.6, lat: -21.3, gap: 12.7, pressure: 47.3, capacity: 72.6, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 4, latestMonitoringYear: 2026,
    storyPriority: 5, rankMin: 15, rankMax: 22, rankRange: 7, robustness: "fragile",
    storyLabel: "Lower gap: moderate pressure / high capacity",
    topPressure: ["Mean sea-surface temp (69.0)", "Mean surface temp (65.9)"],
    topCapacity: ["Fisheries measures (45.5)", "Met monitoring (72.2)"],
    outlook2030Flat: 16.3, outlookDisplay: "show_with_strong_caveat",
  },
  {
    code: "FJ", name: "Fiji", subregion: "Melanesia", status: "Sovereign state (status wording in review)",
    lon: 178.1, lat: -17.7, gap: 10.5, pressure: 59.1, capacity: 86.1, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 8, latestMonitoringYear: 2026,
    storyPriority: 5, rankMin: 16, rankMax: 22, rankRange: 6, robustness: "fragile",
    storyLabel: "Lower gap: moderate pressure / high capacity",
    topPressure: ["Directly affected persons (71.4)", "Mean surface temp (65.9)"],
    topCapacity: ["Fisheries measures (75.0)", "Power generation (83.3)"],
    outlook2030Flat: 19.7, outlookDisplay: "show",
  },
  {
    code: "PF", name: "French Polynesia", subregion: "Polynesia", status: "French overseas collectivity (sensitive status)",
    lon: -149.4, lat: -17.7, gap: 0.0, pressure: 29.7, capacity: 65.0, indicators: 9,
    reportingStatus: "reported_positive_latest_count", monitoringCount: 7, latestMonitoringYear: 2026,
    storyPriority: 5, rankMin: 19, rankMax: 22, rankRange: 3, robustness: "sensitive",
    storyLabel: "Lower gap: low pressure / moderate capacity",
    topPressure: ["Mean sea-surface temp (52.4)", "Sea level anomalies (50.0)"],
    topCapacity: ["Fisheries measures (22.7)", "Power generation (77.8)"],
    outlook2030Flat: 0.0, outlookDisplay: "withhold",
  },
];

export const DEFAULT_SELECTED = "NR";
export const COMPARE_SUGGESTION = "TV";

// The high-gap / low-monitoring priority group surfaced by the signature view.
export const PRIORITY_ONE = ["PN", "NR", "AS", "WF"];

// Story exemplars labelled directly on the default map so the first read is
// map-anchored, not panel-anchored (Pudding-style direct labels).
export const STORY_EXEMPLARS = ["PN", "NR", "AS", "WF", "TV"];

// Per-code label nudges (SVG units) to keep direct labels from colliding in the
// dense western cluster. Positive dy pushes the label below the point.
export const LABEL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  PN: { dx: 0, dy: -22 },
  NR: { dx: 0, dy: -22 },
  TV: { dx: 14, dy: -20 },
  WF: { dx: -10, dy: -22 },
  AS: { dx: 6, dy: 26 },
  MH: { dx: 0, dy: -22 },
};

// Faint orientation labels. Descriptive UN M49 groupings, not boundaries.
export const SUBREGION_ANCHORS = [
  { name: "MICRONESIA", lon: 150, lat: 12 },
  { name: "MELANESIA", lon: 156, lat: -15 },
  { name: "POLYNESIA", lon: -160, lat: -22 },
];

export function getGeo(code: string): Geo | undefined {
  return ATLAS_GEOS.find((g) => g.code === code);
}
