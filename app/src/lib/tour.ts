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
    title: "Open on the adaptation gap",
    claim: "Across 22 Pacific geographies, this map reads where climate pressure and visible capacity sit furthest out of balance.",
    caveat: "A comparative screen, not a ranking of need. Most ranks are fragile, so read a position as a question, not a verdict.",
    source: "adaptation_gap_index.csv",
    action: "Scroll to follow the argument, or jump to Explore freely.",
    state: { score: "gap", view: "default", outlook: false, selected: null },
  },
  {
    id: "pillars",
    short: "Pressure vs capacity",
    title: "Pull climate pressure and visible capacity apart",
    claim: "The gap is one number built from two: current climate-pressure signals minus visible adaptation-capacity proxies in the official data.",
    caveat: "Visible capacity is a proxy from official datasets, not a full measure of readiness.",
    source: "eda_country_drivers.csv",
    action: "Toggle climate pressure and visible capacity.",
    state: { score: "pressure", view: "default", outlook: false, selected: null },
  },
  {
    id: "anchor",
    short: "Nauru / Tuvalu",
    title: "Anchor Nauru, compare Tuvalu",
    claim: "Nauru and Tuvalu both read as high-gap, but Nauru's latest monitoring row reports zero while Tuvalu's record is present. Same headline, different evidence.",
    caveat: "Nauru's rank alone moves 1-7 under stress tests. A shared gap score is not a shared story.",
    source: "eda_monitoring_gap.csv, eda_rank_volatility.csv",
    action: "Switch the anchor between Nauru and Tuvalu.",
    state: { score: "gap", view: "default", outlook: false, selected: "NR" },
  },
  {
    id: "quiet",
    short: "Data quiet",
    title: "Where the data goes quiet",
    claim: "Four high-gap places sit where the record thins: Pitcairn and Nauru report zero in their latest monitoring row; American Samoa and Wallis and Futuna have no processed monitoring rows at all.",
    caveat: "A reporting gap is a gap in the record, not proof that monitoring stations are absent.",
    source: "eda_monitoring_gap.csv",
    action: "Tap a marked point, or pick one below.",
    state: { view: "coverage", outlook: false, selected: null },
  },
  {
    id: "fragility",
    short: "Rank fragility",
    title: "Rank fragility, on purpose",
    claim: "Under leave-one-indicator stress tests, the order lurches: 19 of 22 geographies are fragile, and Marshall Islands can move 15 places. The atlas shows that movement instead of hiding it.",
    caveat: "Rank movement is uncertainty evidence. Read bands, not fixed positions.",
    source: "eda_rank_volatility.csv",
    action: "See how far each rank can move.",
    state: { view: "uncertainty", outlook: false, selected: "MH" },
  },
  {
    id: "fingerprint",
    short: "Fingerprint",
    title: "Evidence fingerprint preview",
    claim: "Two places can reach a similar gap score through different evidence. Nauru's nearest official-data profiles are Northern Mariana Islands, Guam, and Niue.",
    caveat: "Analysis-ready, not app-wired. Similar profiles mean the official data looks alike, not that places share risk, need, or lived experience.",
    source: "eda_similarity_neighbors.csv",
    action: "See what similarity does and does not mean.",
    state: { score: "gap", view: "default", outlook: false, selected: "NR" },
  },
  {
    id: "explore",
    short: "Explore",
    title: "Explore freely",
    claim: "That is the argument. The full atlas keeps the same evidence rules, and now you choose the layer, the place, and the question.",
    caveat: "The legend, sources, and caveats stay one tap away.",
    source: "",
    action: "Open the full atlas controls.",
    state: {},
  },
];
