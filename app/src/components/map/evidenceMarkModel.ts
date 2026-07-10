import type { Geo, ReportingStatus, ScoreInputPresence } from "../../lib/atlasData";
import type { ScoreKey } from "../../lib/encoding";
import { valueForScore } from "../../lib/encoding";

const SCORE_INPUT_SLOT_COUNT = 8;

export type EvidenceReportingEdge = "solid" | "open-dash" | "broken-dot";

export type EvidenceInput = ScoreInputPresence & {
  index: number;
  angle: number;
};

export type EvidenceMarkModel = {
  score: number;
  inputs: EvidenceInput[];
  context: {
    kind: "context-only";
    present: boolean;
    angle: number;
  };
  reportingEdge: EvidenceReportingEdge;
  selected: boolean;
};

function inputAt(geo: Geo, index: number): ScoreInputPresence {
  return geo.scoreInputPresence[index] ?? {
    datasetSlug: `score-input-${index + 1}`,
    datasetName: "Official score input",
    pillar: "climate_signal",
    present: false,
  };
}

function edgeForReportingStatus(status: ReportingStatus): EvidenceReportingEdge {
  if (status === "reported_positive_latest_count") return "solid";
  if (status === "reported_zero_latest_count") return "open-dash";
  return "broken-dot";
}

export function buildEvidenceMark(
  geo: Geo,
  options: { scoreKey: ScoreKey; selected: boolean },
): EvidenceMarkModel {
  return {
    score: valueForScore(geo, options.scoreKey),
    inputs: Array.from({ length: SCORE_INPUT_SLOT_COUNT }, (_, index) => ({
      ...inputAt(geo, index),
      index,
      angle: -90 + index * 45,
    })),
    context: {
      kind: "context-only",
      present: geo.contextCount > 0,
      angle: 112.5,
    },
    reportingEdge: edgeForReportingStatus(geo.reportingStatus),
    selected: options.selected,
  };
}

export { SCORE_INPUT_SLOT_COUNT };
