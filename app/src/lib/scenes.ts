import type { ScoreKey } from "./encoding";
import type { ViewMode } from "./types";

export type SceneVisual = "premise" | "presence" | "movement" | "visibility";
export type SceneStage = "map-immersive" | "figure-takeover";

export type Scene = {
  id: string;
  short: string;
  title: string;
  claim: string;
  caveat: string;
  source: string;
  visual: SceneVisual;
  stage: SceneStage;
  state: {
    score?: ScoreKey;
    view?: ViewMode;
    selected?: string | null;
  };
};

export const SCENES: Scene[] = [
  {
    id: "what-the-records-show",
    short: "What the records show",
    title: "Across the Pacific, safely managed drinking-water access and renewable-energy share have changed in different ways.",
    claim: "Official records provide 19 complete comparisons across 22 Pacific places. They also leave gaps that limit the comparison.",
    caveat: "These figures compare the first and latest available values. The years differ, and the figures do not show what happened between those dates or why they changed.",
    source: "eda_regional_crosscurrents.csv; generated geography records",
    visual: "premise",
    stage: "map-immersive",
    state: { score: "gap", view: "overview", selected: null },
  },
  {
    id: "twenty-two-pacific-places",
    short: "Twenty-two places",
    title: "This story covers 22 Pacific places.",
    claim: "Each place stays visible throughout. Guam, Pitcairn, and Tokelau remain visible even though their comparisons are incomplete.",
    caveat: "Natural Earth land is visual context. Each selectable record is a centroid point, not a reviewed boundary.",
    source: "generated geography records; centroid map context",
    visual: "presence",
    stage: "map-immersive",
    state: { score: "gap", view: "overview", selected: null },
  },
  {
    id: "different-directions",
    short: "Different directions",
    title: "The 19 complete comparisons split four ways.",
    claim: "Safely managed drinking-water access rose while renewable-energy share fell in 7 places; both rose in 6; both fell in 3; and water fell while renewable share rose in 3.",
    caveat: "Both changes are measured in percentage points, but the measures have different meanings and denominators, and their first and latest years differ. The records do not show why the values changed.",
    source: "eda_regional_crosscurrents.csv",
    visual: "movement",
    stage: "figure-takeover",
    state: { score: "gap", view: "overview", selected: null },
  },
  {
    id: "unequal-visibility",
    short: "Unequal visibility",
    title: "The official record is uneven across the 22 places.",
    claim: "Across 14 reviewed datasets, 277 place-and-dataset entries are present and 31 are absent. Direct loss is present for 12 places; monitoring and power for 18 each; water for 19; and renewable share for 20.",
    caveat: "A present dataset means a reviewed official record exists. It does not show what conditions are like in a place.",
    source: "eda_regional_feature_matrix.csv (evidence_visibility); source trace rows",
    visual: "visibility",
    stage: "figure-takeover",
    state: { score: "gap", view: "overview", selected: null },
  },
];

/** Stable scene ids used by the shareable URL contract. */
export const SCENE_IDS = SCENES.map((scene) => scene.id);

export const HANDOFF_COPY = "The records for these 22 places do not show one shared direction of change, and they do not cover every place evenly. This atlas compares official records; it does not rank need, readiness, or vulnerability.";
