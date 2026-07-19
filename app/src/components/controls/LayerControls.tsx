import type { AtlasLayer } from "../../lib/layers";
import type { ScoreKey } from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";

type LayerControlsProps = {
  layers: AtlasLayer[];
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
  onScore: (id: ScoreKey) => void;
  onViewMode: (mode: ViewMode) => void;
  onToggleOutlook: () => void;
};

export function LayerControls({
  layers,
  activeScore,
  viewMode,
  outlookOn,
  onScore,
  onViewMode,
  onToggleOutlook,
}: LayerControlsProps) {
  const activeLayer = layers.find((l) => l.id === activeScore) ?? layers[0];

  return (
    <div className="controls">
      <div className="controls__group" role="group" aria-label="Score layer">
        <span className="controls__heading">Score layer</span>
        <div className="controls__segment">
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              aria-pressed={layer.id === activeScore && viewMode === "default" && !outlookOn}
              className="controls__seg-btn"
              onClick={() => onScore(layer.id)}
              title={layer.description}
            >
              {layer.label}
            </button>
          ))}
        </div>
        <p className="controls__caveat">{
          viewMode === "overview"
            ? "Overview is neutral. Choose a score layer to color the marks."
            : outlookOn
              ? "Stress-test interpretation, not a forecast."
              : activeLayer.caveat
        }</p>
      </div>

      <div className="controls__group" role="group" aria-label="Evidence views">
        <span className="controls__heading">Evidence views</span>
        <div className="controls__segment controls__segment--views">
          <button
            type="button"
            className="controls__toggle"
            aria-label="Data coverage: show where official records are missing or sparse"
            title="Show where official records are missing or sparse."
            aria-pressed={viewMode === "coverage"}
            onClick={() => onViewMode(viewMode === "coverage" ? "overview" : "coverage")}
          >
            Data coverage
          </button>
          <button
            type="button"
            className="controls__toggle"
            aria-label="Rank ranges: show uncertainty across valid indicator choices"
            title="Show rank uncertainty across valid indicator choices."
            aria-pressed={viewMode === "uncertainty"}
            onClick={() => onViewMode(viewMode === "uncertainty" ? "overview" : "uncertainty")}
          >
            Rank ranges
          </button>
          <button
            type="button"
            className="controls__toggle"
            aria-label="2030 stress test: explore a directional scenario, not a forecast"
            title="Explore a directional 2030 stress test; this is not a forecast."
            aria-pressed={outlookOn}
            onClick={onToggleOutlook}
          >
            2030 stress test
          </button>
        </div>
      </div>
    </div>
  );
}
