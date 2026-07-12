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
  view: "default",
  place: null,
  outlook: false,
};

const MODES = new Set<AtlasMode>(["guided", "explore"]);
const LAYERS = new Set<ScoreKey>(["gap", "pressure", "capacity"]);
const VIEWS = new Set<ViewMode>(["default", "coverage", "uncertainty"]);
const APPROVED_SCENE_IDS = new Set(SCENE_IDS);

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

  return {
    mode: modeValue && MODES.has(modeValue as AtlasMode) ? (modeValue as AtlasMode) : DEFAULT_ATLAS_URL_STATE.mode,
    scene: sceneValue && APPROVED_SCENE_IDS.has(sceneValue) ? sceneValue : DEFAULT_ATLAS_URL_STATE.scene,
    layer:
      layerValue && LAYERS.has(layerValue as ScoreKey)
        ? (layerValue as ScoreKey)
        : DEFAULT_ATLAS_URL_STATE.layer,
    view:
      viewValue && VIEWS.has(viewValue as ViewMode)
        ? (viewValue as ViewMode)
        : DEFAULT_ATLAS_URL_STATE.view,
    place: placeValue && geographyCodes.includes(placeValue) ? placeValue : DEFAULT_ATLAS_URL_STATE.place,
    outlook: params.get("outlook") === "1",
  };
}

export function serializeAtlasUrl(state: AtlasUrlState): string {
  const params = new URLSearchParams();
  if (state.mode !== DEFAULT_ATLAS_URL_STATE.mode) params.set("mode", state.mode);
  if (state.scene !== DEFAULT_ATLAS_URL_STATE.scene) params.set("scene", state.scene);
  if (state.layer !== DEFAULT_ATLAS_URL_STATE.layer) params.set("layer", state.layer);
  if (state.view !== DEFAULT_ATLAS_URL_STATE.view) params.set("view", state.view);
  if (state.place) params.set("place", state.place);
  if (state.outlook) params.set("outlook", "1");
  const search = params.toString();
  return search ? `?${search}` : "";
}
