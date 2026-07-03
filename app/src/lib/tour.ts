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
    title: "Start with the gap",
    claim: "Each circle is one of 22 Pacific places. The warmer its color, the wider the distance between the climate pressure in its official record and the adaptation capacity that same record can show against it.",
    caveat: "A comparison screen, not a ranking of need. Most ranks move under stress tests, so no position here is settled.",
    source: "adaptation_gap_index.csv",
    action: "Scroll to follow the argument, or jump straight to Explore freely.",
    state: { score: "gap", view: "default", outlook: false, selected: null },
  },
  {
    id: "pillars",
    short: "Pressure vs capacity",
    title: "Two readings make one gap",
    claim: "The score is plain subtraction. One side gathers climate pressure: temperature, rainfall, sea level, disaster tolls. The other gathers the capacity official datasets can see: monitoring stations, power generation, fisheries management. Pressure minus capacity, nothing fancier.",
    caveat: "Capacity here is only what the official record can see. A seawall no dataset logs is real, but invisible to this screen.",
    source: "eda_country_drivers.csv",
    action: "Toggle between the two readings.",
    state: { score: "pressure", view: "default", outlook: false, selected: null },
  },
  {
    id: "anchor",
    short: "Nauru / Tuvalu",
    title: "Put Nauru beside Tuvalu",
    claim: "Both islands read as high-gap. But Tuvalu's monitoring record is present and reporting, while Nauru's latest monitoring row says zero. Two places can share a headline number and stand on very different records.",
    caveat: "Nauru's rank alone moves between 1 and 7 under stress tests. The ordering is the least settled part of this picture.",
    source: "eda_monitoring_gap.csv, eda_rank_volatility.csv",
    action: "Switch the anchor between Nauru and Tuvalu.",
    state: { score: "gap", view: "default", outlook: false, selected: "NR" },
  },
  {
    id: "quiet",
    short: "Data quiet",
    title: "Where the data goes quiet",
    claim: "Four of the highest-gap places sit where the record thins. Pitcairn and Nauru have monitoring rows whose latest value is zero. American Samoa and Wallis and Futuna have no processed monitoring rows at all. Those are two different kinds of quiet, and the map draws them differently.",
    caveat: "Quiet in the record is not absence on the ground. Stations can exist without ever reaching the processed data.",
    source: "eda_monitoring_gap.csv",
    action: "Tap a marked point, or pick one below.",
    state: { view: "coverage", outlook: false, selected: null },
  },
  {
    id: "fragility",
    short: "Rank fragility",
    title: "The ranking does not hold still",
    claim: "Remove any single indicator and the order rearranges. Nineteen of 22 places move enough to be called fragile, and Marshall Islands alone can shift by fifteen positions. The atlas shows that movement because hiding it would make the map look more certain than it is.",
    caveat: "The movement is the finding. A rank that swings this much says more about the evidence than about the islands.",
    source: "eda_rank_volatility.csv",
    action: "See how far each rank can move.",
    state: { view: "uncertainty", outlook: false, selected: "MH" },
  },
  {
    id: "fingerprint",
    short: "Fingerprint",
    title: "Which records look alike",
    claim: "Every place leaves a kind of fingerprint in the data: how much of its story is pressure, how much is capacity, how much is silence. Read that way, Nauru's nearest matches are Northern Mariana Islands, Guam, and Niue. Their records lean the same way, whatever their scores say.",
    caveat: "A preview from the analysis files, not a live map layer yet. Records that look alike do not mean places that share the same risks or need the same things.",
    source: "eda_similarity_neighbors.csv",
    action: "See what similarity does and does not mean.",
    state: { score: "gap", view: "default", outlook: false, selected: "NR" },
  },
  {
    id: "explore",
    short: "Explore",
    title: "Explore freely",
    claim: "That is the tour. The full atlas plays by the rules you just watched: every score keeps its caveat, every claim keeps its source. The layer, the place, and the question are yours now.",
    caveat: "The legend, sources, and caveats stay one tap away.",
    source: "",
    action: "The atlas keeps this view when you switch.",
    state: { score: "gap", view: "default", outlook: false, selected: null },
  },
];
