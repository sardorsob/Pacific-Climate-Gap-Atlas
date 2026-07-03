import { EyeOff, Shuffle, TrendingUp } from "lucide-react";
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
        <p className="controls__caveat">{outlookOn ? "Stress-test interpretation, not a forecast." : activeLayer.caveat}</p>
      </div>

      <div className="controls__group">
        <span className="controls__heading">Overlays</span>
        <button
          type="button"
          className="controls__toggle"
          aria-pressed={viewMode === "coverage"}
          onClick={() => onViewMode(viewMode === "coverage" ? "default" : "coverage")}
        >
          <EyeOff aria-hidden="true" size={16} />
          Where the data goes quiet
        </button>
        <button
          type="button"
          className="controls__toggle"
          aria-pressed={viewMode === "uncertainty"}
          onClick={() => onViewMode(viewMode === "uncertainty" ? "default" : "uncertainty")}
        >
          <Shuffle aria-hidden="true" size={16} />
          Rank uncertainty
        </button>
        <button
          type="button"
          className="controls__toggle"
          aria-pressed={outlookOn}
          onClick={onToggleOutlook}
        >
          <TrendingUp aria-hidden="true" size={16} />
          Outlook - stress test {outlookOn ? "(on)" : "(off)"}
        </button>
      </div>
    </div>
  );
}
