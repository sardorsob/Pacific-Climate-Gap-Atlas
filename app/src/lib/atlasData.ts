export type ReportingStatus =
  | "reported_positive_latest_count"
  | "reported_zero_latest_count"
  | "missing_monitoring_dataset_row";

export type OutlookDisplay = "show" | "show_with_strong_caveat" | "withhold";

export type Geo = {
  code: string;
  name: string;
  subregion: string;
  status: string;
  lon: number;
  lat: number;
  gap: number;
  pressure: number;
  capacity: number;
  indicators: number;
  reportingStatus: ReportingStatus;
  monitoringCount: number | null;
  latestMonitoringYear: number | null;
  storyPriority: 1 | 2 | 3 | 4 | 5;
  rankMin: number;
  rankMax: number;
  rankRange: number;
  robustness: "stable" | "sensitive" | "fragile";
  storyLabel: string;
  topPressure: string[];
  topCapacity: string[];
  indicatorRows: IndicatorRow[];
  outlook2030Flat: number;
  outlookDisplay: OutlookDisplay;
};

export type IndicatorRow = {
  datasetName: string;
  pillar: string;
  latestYear: number | null;
  latestValue: number | null;
  scoringValue: number | null;
  unit: string;
  indicatorScore: number | null;
  sourceRowHash: string;
};

type AppSignal = {
  label?: string;
  score?: number | null;
};

type AppGeography = {
  geo_code: string;
  name: string;
  centroid: { lon: number | null; lat: number | null };
  adaptation_gap_score: number | null;
  climate_pressure_score: number | null;
  capacity_score: number | null;
  included_indicator_count: number | null;
  outlook_2030_flat_gap_score: number | null;
  monitoring?: {
    reporting_status?: string;
    latest_value?: number | null;
    latest_year?: number | null;
    story_priority_rank?: number | null;
  };
  rank?: {
    scenario_rank_min?: number | null;
    scenario_rank_max?: number | null;
    rank_range?: number | null;
    robustness_label?: string;
  };
  story?: {
    story_label?: string;
    top_pressure_signals?: AppSignal[];
    top_capacity_signals?: AppSignal[];
  };
  context?: {
    subregion?: string;
    political_status?: string;
    context_quality?: string;
  };
  outlook_display?: Record<string, Record<string, { display_recommendation?: string }>>;
};

type GeographiesPayload = {
  geographies: AppGeography[];
};

type DetailIndicator = {
  dataset_name?: string;
  pillar?: string;
  latest_year?: number | null;
  latest_value?: number | null;
  scoring_value?: number | null;
  unit?: string;
  indicator_score?: number | null;
  source_row_hash?: string;
};

type DetailRecord = {
  indicators?: DetailIndicator[];
};

type CountryDetailsPayload = {
  details?: Record<string, DetailRecord>;
};

export const DEFAULT_SELECTED = "NR";
export const STORY_EXEMPLARS = ["PN", "NR", "AS", "WF", "TV"];

export const LABEL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  PN: { dx: 0, dy: -22 },
  NR: { dx: 0, dy: -22 },
  TV: { dx: 14, dy: -20 },
  WF: { dx: -34, dy: -28 },
  AS: { dx: 34, dy: 30 },
  MH: { dx: 0, dy: -22 },
};

// Faint orientation labels. Descriptive UN M49 groupings, not boundaries.
export const SUBREGION_ANCHORS = [
  { name: "MICRONESIA", lon: 150, lat: 12 },
  { name: "MELANESIA", lon: 156, lat: -15 },
  { name: "POLYNESIA", lon: -160, lat: -22 },
];

export async function loadAtlasData(): Promise<Geo[]> {
  const [geographiesResponse, detailsResponse] = await Promise.all([
    fetch("/data/geographies.json"),
    fetch("/data/country_details.json"),
  ]);
  if (!geographiesResponse.ok) {
    throw new Error(`Failed to load atlas data: ${geographiesResponse.status}`);
  }
  if (!detailsResponse.ok) {
    throw new Error(`Failed to load country details: ${detailsResponse.status}`);
  }
  return adaptGeographiesPayload(
    (await geographiesResponse.json()) as GeographiesPayload,
    (await detailsResponse.json()) as CountryDetailsPayload,
  );
}

export function adaptGeographiesPayload(
  payload: GeographiesPayload,
  detailsPayload?: CountryDetailsPayload,
): Geo[] {
  return payload.geographies
    .map((record) => adaptGeography(record, detailsPayload?.details?.[record.geo_code]))
    .sort((a, b) => b.gap - a.gap || a.code.localeCompare(b.code));
}

export function getGeo(geos: Geo[], code: string): Geo | undefined {
  return geos.find((geo) => geo.code === code);
}

export function priorityOneCodes(geos: Geo[]): string[] {
  return geos.filter((geo) => geo.storyPriority === 1).map((geo) => geo.code);
}

function adaptGeography(record: AppGeography, details?: DetailRecord): Geo {
  const reportingStatus = asReportingStatus(record.monitoring?.reporting_status);
  const outlookDisplay = asOutlookDisplay(
    record.outlook_display?.["2030"]?.capacity_flat?.display_recommendation,
  );
  return {
    code: record.geo_code,
    name: record.name,
    subregion: record.context?.subregion ?? "Pacific",
    status: statusLabel(record.context?.political_status, record.context?.context_quality),
    lon: asNumber(record.centroid.lon),
    lat: asNumber(record.centroid.lat),
    gap: asNumber(record.adaptation_gap_score),
    pressure: asNumber(record.climate_pressure_score),
    capacity: asNumber(record.capacity_score),
    indicators: asNumber(record.included_indicator_count),
    reportingStatus,
    monitoringCount: reportingStatus === "missing_monitoring_dataset_row"
      ? null
      : asNullableNumber(record.monitoring?.latest_value),
    latestMonitoringYear: reportingStatus === "missing_monitoring_dataset_row"
      ? null
      : asNullableNumber(record.monitoring?.latest_year),
    storyPriority: asStoryPriority(record.monitoring?.story_priority_rank),
    rankMin: asNumber(record.rank?.scenario_rank_min),
    rankMax: asNumber(record.rank?.scenario_rank_max),
    rankRange: asNumber(record.rank?.rank_range),
    robustness: asRobustness(record.rank?.robustness_label),
    storyLabel: record.story?.story_label || "Evidence profile available",
    topPressure: formatSignals(record.story?.top_pressure_signals),
    topCapacity: formatSignals(record.story?.top_capacity_signals),
    indicatorRows: formatIndicators(details?.indicators),
    outlook2030Flat: asNumber(record.outlook_2030_flat_gap_score),
    outlookDisplay,
  };
}

function formatIndicators(indicators: DetailIndicator[] | undefined): IndicatorRow[] {
  return (indicators ?? []).map((indicator) => ({
    datasetName: indicator.dataset_name ?? "Official dataset",
    pillar: indicator.pillar ?? "unknown",
    latestYear: asNullableNumber(indicator.latest_year),
    latestValue: asNullableNumber(indicator.latest_value),
    scoringValue: asNullableNumber(indicator.scoring_value),
    unit: indicator.unit ?? "",
    indicatorScore: asNullableNumber(indicator.indicator_score),
    sourceRowHash: indicator.source_row_hash ?? "",
  }));
}

function formatSignals(signals: AppSignal[] | undefined): string[] {
  return (signals ?? []).map((signal) => {
    if (typeof signal.score === "number") return `${signal.label ?? "Signal"} (${signal.score.toFixed(1)})`;
    return signal.label ?? "Signal";
  });
}

function statusLabel(status: string | undefined, quality: string | undefined): string {
  if (!status) return "Status wording in review";
  if (quality?.includes("needs_review") || status.toLowerCase().includes("territory")) {
    return `${titleCase(status)} (wording in review)`;
  }
  return titleCase(status);
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .map((part) => (part.length > 0 ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ");
}

function asNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asNullableNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStoryPriority(value: number | null | undefined): 1 | 2 | 3 | 4 | 5 {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) return value;
  return 5;
}

function asReportingStatus(value: string | undefined): ReportingStatus {
  if (value === "reported_positive_latest_count") return value;
  if (value === "reported_zero_latest_count") return value;
  return "missing_monitoring_dataset_row";
}

function asOutlookDisplay(value: string | undefined): OutlookDisplay {
  if (value === "show" || value === "show_with_strong_caveat" || value === "withhold") return value;
  return "withhold";
}

function asRobustness(value: string | undefined): "stable" | "sensitive" | "fragile" {
  if (value === "stable" || value === "sensitive" || value === "fragile") return value;
  return "fragile";
}

export type FingerprintNeighbor = {
  code: string;
  name: string;
  jsd: number;
  band: string;
  reason: string;
};

export const FINGERPRINT_PREVIEW: {
  anchor: string;
  anchorLeans: string;
  neighbors: FingerprintNeighbor[];
  caveat: string;
} = {
  anchor: "NR",
  anchorLeans: "data visibility",
  neighbors: [
    { code: "MP", name: "Northern Mariana Is.", jsd: 0.08, band: "similar", reason: "leans toward a monitoring reporting gap" },
    { code: "GU", name: "Guam", jsd: 0.081, band: "similar", reason: "leans toward a monitoring reporting gap" },
    { code: "NU", name: "Niue", jsd: 0.089, band: "similar", reason: "also leans toward data visibility" },
  ],
  caveat:
    "Similarity means the official-data profiles look alike under this method; it does not mean the places share the same vulnerability, lived experience, or policy need.",
};
