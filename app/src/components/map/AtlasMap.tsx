import { useMemo } from "react";
import type { Geo } from "../../lib/atlasData";
import type { ScoreKey } from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";
import type { SceneVisual } from "../../lib/scenes";
import { buildAtlasFeatureCollection, type AtlasFeatureCollection } from "./atlasMapModel";
import { MapOverlay } from "./MapOverlay";
import { useAtlasMap } from "./useAtlasMap";

type AtlasMapProps = {
  geos: Geo[];
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
  selectedCode: string | null;
  priorityCodes: string[];
  focusSelection?: boolean;
  panelOpen?: boolean;
  panelExpanded?: boolean;
  onSelect: (code: string) => void;
  activeLayerLabel: string;
  sceneVisual?: SceneVisual | null;
};

export function AtlasMap({
  geos,
  activeScore,
  viewMode,
  outlookOn,
  selectedCode,
  priorityCodes,
  focusSelection = true,
  panelOpen = false,
  panelExpanded = false,
  onSelect,
  activeLayerLabel,
  sceneVisual = null,
}: AtlasMapProps) {
  const atlasFeatures = useMemo<AtlasFeatureCollection>(
    () => buildAtlasFeatureCollection(geos, { activeScore, viewMode, outlookOn, selectedCode, priorityCodes }),
    [activeScore, geos, outlookOn, priorityCodes, selectedCode, viewMode],
  );
  const { containerRef, project, mapReady } = useAtlasMap({
    geos,
    atlasFeatures,
    selectedCode,
    focusSelection,
    panelOpen,
    panelExpanded,
    onSelect,
    reducedMotion: false,
  });

  return (
    <div className="map-canvas" data-map-ready={mapReady ? "true" : "false"}>
      <div ref={containerRef} className="maplibre-canvas" aria-hidden="true" />
      <p className="sr-only">
        Map of 22 Pacific geographies shown as presence marks over Natural Earth land context.
        Active layer: {activeLayerLabel}. {viewMode === "overview"
          ? "All 22 places use the same neutral mark until a layer is chosen."
          : "The map is a comparative screen, not a definitive ranking."}
      </p>
      <MapOverlay
        geos={geos}
        project={project}
        selectedCode={selectedCode}
        activeScore={activeScore}
        sceneVisual={sceneVisual}
        onSelect={onSelect}
        atlasFeatures={atlasFeatures}
        viewMode={viewMode}
        priorityCodes={priorityCodes}
        activeLayerLabel={activeLayerLabel}
      />
    </div>
  );
}
