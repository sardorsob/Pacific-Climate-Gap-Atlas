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

// Seven-beat spine (approved plan). Regional texture and outlook are kept OUT of
// the guided spine and remain available in free exploration.
export const BEATS: Beat[] = [
  {
    id: "gap",
    short: "The gap",
    title: "What you're looking at",
    claim: "Every island mark is a Pacific place, 22 of them. Warmer color means a bigger mismatch between the climate pressure in that place's official records and the adaptation capacity those same records can show against it.",
    caveat: "This is a comparison tool, not a ranking of who needs help most. Most positions move around under stress tests, so don't treat any of them as settled.",
    source: "adaptation_gap_index.csv",
    action: "Scroll on, or skip ahead and explore on your own.",
    state: { score: "gap", view: "default", outlook: false, selected: null },
  },
  {
    id: "pillars",
    short: "Pressure vs capacity",
    title: "How the score works",
    claim: "It's a subtraction. We add up climate pressure: temperature, rainfall, sea level, disaster counts. Then we subtract the capacity official datasets can see: monitoring stations, power generation, fisheries management. That's the whole formula.",
    caveat: "Capacity only counts if it shows up in official data. A seawall nobody logged is still real; this screen just can't see it.",
    source: "eda_country_drivers.csv",
    action: "Flip between pressure and capacity.",
    state: { score: "pressure", view: "default", outlook: false, selected: null },
  },
  {
    id: "anchor",
    short: "Nauru / Tuvalu",
    title: "Take Nauru and Tuvalu",
    claim: "Both score high. But look underneath: Tuvalu's monitoring record is there and reporting, while the latest row for Nauru says zero. Two places can end up with similar numbers sitting on very different records.",
    caveat: "Nauru's rank alone swings between 1 and 7 when we stress-test it. The order is the shakiest part of all this.",
    source: "eda_monitoring_gap.csv, eda_rank_volatility.csv",
    action: "Swap the anchor between Nauru and Tuvalu.",
    state: { score: "gap", view: "default", outlook: false, selected: "NR" },
  },
  {
    id: "quiet",
    short: "Data quiet",
    title: "Some places barely show up",
    claim: "Four of the highest-scoring places are also the hardest to see. Pitcairn and Nauru have monitoring rows, but the latest number in them is zero. American Samoa and Wallis and Futuna have no processed monitoring rows at all. Those are two different situations, and the map marks them differently.",
    caveat: "Missing numbers mean the record is thin, not that nothing is out there. Stations can exist and never make it into the processed data.",
    source: "eda_monitoring_gap.csv",
    action: "Tap one of the marked places, or pick one below.",
    state: { view: "coverage", outlook: false, selected: null },
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
    short: "Fingerprint",
    title: "Some records look alike",
    claim: "You can also compare places by the shape of their evidence: how much of the story comes from pressure, how much from capacity, and how much from data that just isn't there. Measured that way, the records closest to Nauru's belong to Northern Mariana Islands, Guam, and Niue.",
    caveat: "The map itself does not turn into a similarity layer. The selected-place panel shows the nearest records and exact JSD values, with the caveat that records that look alike don't mean the places face the same risks or need the same things.",
    source: "eda_similarity_neighbors.csv",
    action: "See what similarity does and doesn't mean.",
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
