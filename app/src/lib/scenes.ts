import type { ScoreKey } from "./encoding";
import type { ViewMode } from "./types";

export type SceneVisual = "presence" | "missingness" | "split" | "comparison" | "rank-bands";

export type Scene = {
  id: string;
  short: string;
  title: string;
  claim: string;
  caveat: string;
  source: string;
  visual: SceneVisual;
  state: {
    score: ScoreKey;
    view: ViewMode;
    selected: string | null;
  };
};

export const SCENES: Scene[] = [
  {
    id: "what-the-map-can-see",
    short: "What the map can see",
    title: "Twenty-two places. Uneven light.",
    claim: "Twenty-two Pacific places appear here, but they do not appear with equal clarity. The map compares what the official record can show; it does not rank who needs help most.",
    caveat: "Every mark keeps the same footprint. Thin evidence is an interruption in the record, not a smaller place.",
    source: "adaptation_gap_index.csv; generated geography records",
    visual: "presence",
    state: { score: "gap", view: "default", selected: null },
  },
  {
    id: "where-the-record-breaks",
    short: "Where the record breaks",
    title: "Some places are difficult to read before we compare them.",
    claim: "The evidence record breaks unevenly. Some score inputs are missing, some monitoring rows report zero, and some monitoring rows are not present at all.",
    caveat: "Thin records describe official visibility, not conditions on the ground. A reported zero is not the same as a missing row.",
    source: "eda_monitoring_gap.csv; adaptation_gap_indicator_trace.csv",
    visual: "missingness",
    state: { score: "gap", view: "coverage", selected: null },
  },
  {
    id: "the-gap-has-two-sides",
    short: "The gap has two sides",
    title: "The gap is the distance between two records.",
    claim: "Climate pressure and visible capacity are different sides of the same comparison. The gap is what appears between what pressure shows and what capacity datasets can show.",
    caveat: "Visible capacity is an official-data proxy, not full readiness or lived adaptive capacity.",
    source: "eda_country_drivers.csv; adaptation_gap_indicator_trace.csv",
    visual: "split",
    state: { score: "pressure", view: "default", selected: null },
  },
  {
    id: "similar-scores-different-records",
    short: "Nauru / Tuvalu",
    title: "Similar scores. Different records.",
    claim: "Nauru and Tuvalu arrive at similar-looking scores through different records. Align the evidence portraits and the difference becomes easier to see.",
    caveat: "This compares official evidence, not either place's full lived reality. Similarity is not physical connection or shared policy need.",
    source: "generated geography records; eda_monitoring_gap.csv; eda_rank_volatility.csv",
    visual: "comparison",
    state: { score: "gap", view: "default", selected: "NR" },
  },
  {
    id: "the-order-does-not-hold-still",
    short: "The order moves",
    title: "Change one ingredient, and most of the order moves.",
    claim: "Leave out one indicator and the ranking rearranges itself. Nineteen of 22 places are labeled fragile, and Marshall Islands can span ranks 4–19.",
    caveat: "These bands show sensitivity to analytical choices. They are not confidence intervals or a definitive leaderboard.",
    source: "eda_rank_volatility.csv",
    visual: "rank-bands",
    state: { score: "gap", view: "uncertainty", selected: "MH" },
  },
];

export const HANDOFF_COPY =
  "The evidence has a shape, and now the map is yours. Explore freely, keep the caveats close, and ask what the record can support.";
