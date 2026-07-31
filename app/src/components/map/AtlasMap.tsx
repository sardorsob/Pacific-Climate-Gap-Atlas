import { useMemo } from "react";
import type { Geo } from "../../lib/atlasData";
import type { ScoreKey } from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";
import type { SceneVisual } from "../../lib/scenes";
import { buildAtlasFeatureCollection, mapStatusDescription, type AtlasFeatureCollection } from "./atlasMapModel";
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
  const { containerRef, project, mapReady, mapError } = useAtlasMap({
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
      {mapError ? (
        <div className="app-state" role="alert">
          <p className="eyebrow">Map unavailable</p>
          <h2>The interactive map is unavailable.</h2>
          <p className="sr-only">{mapStatusDescription(true, activeLayerLabel, viewMode)}</p>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="maplibre-canvas" aria-hidden="true" />
          <p className="sr-only">{mapStatusDescription(false, activeLayerLabel, viewMode)}</p>
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
        </>
      )}
    </div>
  );
}
