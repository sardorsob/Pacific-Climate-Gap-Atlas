import type { ScoreKey } from "./encoding";
import type { ViewMode } from "./types";

// Canonical map state a beat asks the atlas to enter. Any field left undefined
// is not changed, so beats can carry prior state forward (e.g. "Explore freely").
export type BeatState = {
  score?: ScoreKey;
  view?: ViewMode;
  outlook?: boolean;
  selected?: string | null;
};

// A guided story beat. The same beat list drives the desktop scroll rail, the
// mobile beat sheet, the keyboard stepper, and the progress rail.
export type Beat = {
  id: string;
  short: string; // progress-rail label
  title: string;
  claim: string;
  caveat: string;
  source: string;
  action: string;
  state: BeatState;
};

export function shouldShowSimilarityArcs({
  hasSelection,
  viewMode,
  outlookOn,
  mode,
  beatId,
}: {
  hasSelection: boolean;
  viewMode: ViewMode;
  outlookOn: boolean;
  mode: "guided" | "explore";
  beatId: string;
}): boolean {
  return hasSelection && viewMode === "default" && !outlookOn && (mode === "explore" || beatId === "fingerprint");
}

// Seven-beat spine (approved plan). Regional texture and outlook are kept OUT of
// the guided spine and remain available in free exploration.
export const BEATS: Beat[] = [
  {
    id: "gap",
    short: "What shows up",
    title: "What the map can see",
    claim: "Every presence mark is one of 22 Pacific places. Warmer color means the official records show a wider mismatch between climate pressure and the adaptation capacity those same records can show.",
    caveat: "The catch is that the record itself is uneven. This is a comparison tool, not a ranking of who needs help most.",
    source: "adaptation_gap_index.csv",
    action: "Start with the map, then look for where the record gets thin.",
    state: { score: "gap", view: "default", outlook: false, selected: null },
  },
  {
    id: "quiet",
    short: "Thin records",
    title: "Some places barely show up",
    claim: "Four of the highest-scoring places are also hard to read in the monitoring record. Pitcairn and Nauru have monitoring rows, but the latest number in them is zero. American Samoa and Wallis and Futuna have no processed monitoring rows at all.",
    caveat: "Those are two different situations. Missing numbers mean the record is thin, not that nothing is out there.",
    source: "eda_monitoring_gap.csv",
    action: "The map marks reported-zero and missing-row cases differently.",
    state: { view: "coverage", outlook: false, selected: null },
  },
  {
    id: "pillars",
    short: "The formula",
    title: "How the score works",
    claim: "The score is still simple. We add up climate pressure: temperature, rainfall, sea level, disaster counts. Then we subtract the capacity official datasets can see: monitoring stations, power generation, fisheries management.",
    caveat: "Capacity only counts if it shows up in official data. A seawall nobody logged is still real; this screen just can't see it.",
    source: "eda_country_drivers.csv",
    action: "Flip between pressure and capacity.",
    state: { score: "pressure", view: "default", outlook: false, selected: null },
  },
  {
    id: "anchor",
    short: "Nauru / Tuvalu",
    title: "Nauru and Tuvalu make the point",
    claim: "Both score high. But look underneath: Tuvalu's monitoring record is there and reporting, while the latest row for Nauru says zero. Similar-looking scores can sit on very different records.",
    caveat: "Nauru's rank alone swings between 1 and 7 when we stress-test it. The order is the shakiest part of all this.",
    source: "eda_monitoring_gap.csv, eda_rank_volatility.csv",
    action: "Swap the anchor between Nauru and Tuvalu.",
    state: { score: "gap", view: "default", outlook: false, selected: "NR" },
  },
  {
    id: "fragility",
    short: "Rank fragility",
    title: "Don't read the order too literally",
    claim: "If we drop any single indicator and recalculate, the ranking rearranges itself. Nineteen of the 22 places move enough that we call them fragile, and Marshall Islands alone can land fifteen positions apart. We'd rather show you that wobble than pretend it isn't there.",
    caveat: "When a rank swings like that, it's telling you about the evidence underneath, not about the islands themselves.",
    source: "eda_rank_volatility.csv",
    action: "See how far each rank can move.",
    state: { view: "uncertainty", outlook: false, selected: "MH" },
  },
  {
    id: "fingerprint",
    short: "Similar records",
    title: "One more way to compare the records",
    claim: "Once a place is selected, the panel can also ask which official-data profiles have a similar shape. For Nauru, the closest records belong to Northern Mariana Islands, Guam, and Niue.",
    caveat: "Similarity here only means the official-data profiles look alike under this method. It does not mean the places face the same risks, lived experience, or policy need.",
    source: "eda_similarity_neighbors.csv",
    action: "The exact JSD distances stay in the selected-place panel.",
    state: { score: "gap", view: "default", outlook: false, selected: "NR" },
  },
  {
    id: "explore",
    short: "Explore",
    title: "Now it's your turn",
    claim: "That's the whole story as we can tell it from official data. Everything you just saw stays in place: every score keeps its caveat, every claim keeps its source. Pick a layer, pick a place, and ask your own questions.",
    caveat: "The legend, sources, and caveats stay one tap away.",
    source: "",
    action: "The atlas keeps this view when you switch.",
    state: { score: "gap", view: "default", outlook: false, selected: null },
  },
];
