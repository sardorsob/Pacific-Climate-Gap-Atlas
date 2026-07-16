import type { ScoreKey } from "./encoding";
import { SCENE_IDS, SCENES } from "./scenes";
import type { ViewMode } from "./types";

export type AtlasMode = "guided" | "explore";

export type AtlasUrlState = {
  mode: AtlasMode;
  scene: string;
  layer: ScoreKey;
  view: ViewMode;
  place: string | null;
  outlook: boolean;
};

export const DEFAULT_ATLAS_URL_STATE: AtlasUrlState = {
  mode: "guided",
  scene: SCENES[0].id,
  layer: "gap",
  view: "overview",
  place: null,
  outlook: false,
};

const MODES = new Set<AtlasMode>(["guided", "explore"]);
const LAYERS = new Set<ScoreKey>(["gap", "pressure", "capacity"]);
const VIEWS = new Set<ViewMode>(["overview", "default", "coverage", "uncertainty"]);
const APPROVED_SCENE_IDS = new Set(SCENE_IDS);
const RETIRED_SCENE_FALLBACKS = new Map([
  ["what-this-atlas-is-asking", "what-the-records-show"],
  ["what-the-map-can-see", "twenty-two-pacific-places"],
  ["where-the-record-breaks", "unequal-visibility"],
  ["the-gap-has-two-sides", "different-directions"],
  ["similar-scores-different-records", "unequal-visibility"],
  ["the-order-does-not-hold-still", "unequal-visibility"],
]);

export function ownScrollRestoration(history: Pick<History, "scrollRestoration">): void {
  history.scrollRestoration = "manual";
}

function paramsFor(input: string): URLSearchParams {
  if (input.startsWith("?")) return new URLSearchParams(input.slice(1));
  try {
    return new URL(input, "https://atlas.invalid").searchParams;
  } catch {
    return new URLSearchParams(input);
  }
}

export function parseAtlasUrl(input: string, geographyCodes: readonly string[]): AtlasUrlState {
  const params = paramsFor(input);
  const modeValue = params.get("mode");
  const sceneValue = params.get("scene");
  const layerValue = params.get("layer");
  const viewValue = params.get("view");
  const placeValue = params.get("place");
  const mode = modeValue && MODES.has(modeValue as AtlasMode) ? (modeValue as AtlasMode) : DEFAULT_ATLAS_URL_STATE.mode;
  const approvedScene = sceneValue && APPROVED_SCENE_IDS.has(sceneValue);
  const scene = approvedScene
    ? sceneValue
    : (sceneValue && RETIRED_SCENE_FALLBACKS.get(sceneValue)) ?? DEFAULT_ATLAS_URL_STATE.scene;
  const guidedFallback = mode === "guided" && sceneValue !== null && !approvedScene;
  const canonicalScene = SCENES.find((item) => item.id === scene) ?? SCENES[0];
  const view = guidedFallback
    ? canonicalScene.state.view ?? DEFAULT_ATLAS_URL_STATE.view
    : viewValue && VIEWS.has(viewValue as ViewMode)
      ? (viewValue as ViewMode)
      : DEFAULT_ATLAS_URL_STATE.view;

  return {
    mode,
    scene,
    layer: guidedFallback
      ? canonicalScene.state.score ?? DEFAULT_ATLAS_URL_STATE.layer
      : layerValue && LAYERS.has(layerValue as ScoreKey)
        ? (layerValue as ScoreKey)
        : DEFAULT_ATLAS_URL_STATE.layer,
    view,
    place: guidedFallback
      ? canonicalScene.state.selected ?? DEFAULT_ATLAS_URL_STATE.place
      : placeValue && geographyCodes.includes(placeValue)
        ? placeValue
        : DEFAULT_ATLAS_URL_STATE.place,
    outlook: guidedFallback || view === "overview" ? false : params.get("outlook") === "1",
  };
}

export function serializeAtlasUrl(state: AtlasUrlState): string {
  const params = new URLSearchParams();
  if (state.mode !== DEFAULT_ATLAS_URL_STATE.mode) params.set("mode", state.mode);
  if (state.scene !== DEFAULT_ATLAS_URL_STATE.scene) params.set("scene", state.scene);
  if (state.layer !== DEFAULT_ATLAS_URL_STATE.layer) params.set("layer", state.layer);
  params.set("view", state.view);
  if (state.place) params.set("place", state.place);
  if (state.outlook) params.set("outlook", "1");
  const search = params.toString();
  return search ? `?${search}` : "";
}
