import { useEffect, useState } from "react";
import { BookOpen, ChevronUp, Compass, Layers } from "lucide-react";
import { AtlasMap } from "./components/map/AtlasMap";
import { MapLegend } from "./components/map/MapLegend";
import { LayerControls } from "./components/controls/LayerControls";
import { CountryPanel } from "./components/panels/CountryPanel";
import { DataQuietCallout } from "./components/panels/DataQuietCallout";
import { MethodDrawer } from "./components/MethodDrawer";
import { PlaceComparisonScene } from "./components/story/PlaceComparisonScene";
import { PressureCapacityScene } from "./components/story/PressureCapacityScene";
import { RankBandScene } from "./components/story/RankBandScene";
import { StoryScrolly } from "./components/story/StoryScrolly";
import { HANDOFF_COPY, SCENES } from "./lib/scenes";
import { atlasLayers } from "./lib/layers";
import type { ScoreKey } from "./lib/encoding";
import type { ViewMode } from "./lib/types";
import {
  getGeo,
  loadAtlasData,
  priorityOneCodes,
  type Geo,
} from "./lib/atlasData";

function isCompactViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 760;
}

function RankUncertaintyCallout({ geos, onPick }: { geos: Geo[]; onPick: (code: string) => void }) {
  const examples = ["MH", "FJ", "AS"]
    .map((code) => getGeo(geos, code))
    .filter((geo): geo is Geo => Boolean(geo));
  return (
    <aside className="panel panel--intro" aria-label="Rank uncertainty explanation">
      <p className="eyebrow">Rank uncertainty</p>
      <h1 className="panel__thesis">Bands, not a fixed scoreboard.</h1>
      <p className="panel__lede">
        Leave-one-indicator checks move most ranks. This view exists so the gap map cannot be read
        as a definitive order.
      </p>
      <div className="rank-examples">
        {examples.map((geo) => (
          <button key={geo.code} type="button" className="rank-example" onClick={() => onPick(geo.code)}>
            <span>{geo.code}</span>
            <b>{geo.rankMin}-{geo.rankMax}</b>
            <small>{geo.robustness}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}

export function App() {
  const [geos, setGeos] = useState<Geo[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [mode, setMode] = useState<"guided" | "explore">("guided");
  const [sceneIndex, setSceneIndex] = useState(0);

  const [activeScore, setActiveScore] = useState<ScoreKey>("gap");
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [outlookOn, setOutlookOn] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadAtlasData()
      .then((loaded) => {
        if (!cancelled) setGeos(loaded);
      })
      .catch((error: unknown) => {
        if (!cancelled) setDataError(error instanceof Error ? error.message : "Failed to load atlas data");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeLayer = atlasLayers.find((l) => l.id === activeScore) ?? atlasLayers[0];
  const selectedGeo = selectedCode ? getGeo(geos, selectedCode) ?? null : null;
  const priorityCodes = priorityOneCodes(geos);
  const panelOpen = mode === "explore" && (selectedGeo !== null || viewMode === "coverage" || viewMode === "uncertainty");
  const controlsVisible = mode === "explore";

  const meta = outlookOn
    ? { title: "Outlook - 2030 stress test", caveat: "Stress-test interpretation, not a forecast." }
    : viewMode === "coverage"
      ? { title: "Where the data goes quiet", caveat: "A reporting gap is not proof that infrastructure is absent." }
      : viewMode === "uncertainty"
        ? { title: "Rank uncertainty", caveat: "Shown so the gap map cannot be read as a fixed scoreboard." }
        : { title: activeLayer.label, caveat: activeLayer.caveat };

  // Guided mode: each beat writes the canonical map state. Undefined fields are
  // left untouched so state carries forward into Explore freely.
  useEffect(() => {
    if (mode !== "guided") return;
    const s = SCENES[sceneIndex].state;
    if (s.score !== undefined) setActiveScore(s.score);
    if (s.view !== undefined) setViewMode(s.view);
    setOutlookOn(false);
    if (s.selected !== undefined) setSelectedCode(s.selected);
  }, [sceneIndex, mode]);

  if (dataError) {
    return (
      <div className="app-state" role="alert">
        <p className="eyebrow">Atlas data unavailable</p>
        <h1>Could not load the generated app data.</h1>
        <p>{dataError}</p>
      </div>
    );
  }

  if (geos.length === 0) {
    return (
      <div className="app-state" role="status">
        <p className="eyebrow">Pacific Adaptation Gap Atlas</p>
        <h1>Loading atlas data...</h1>
      </div>
    );
  }

  const handleSelect = (code: string) => {
    setSelectedCode(code);
    if (mode === "explore") setSheetExpanded(!isCompactViewport());
  };

  const handleScore = (id: ScoreKey) => {
    setActiveScore(id);
    setViewMode("default");
    setOutlookOn(false);
  };

  const handleViewMode = (m: ViewMode) => {
    setViewMode(m);
    if (m !== "default") setOutlookOn(false);
    if (m === "coverage") {
      setSelectedCode(null);
      setSheetExpanded(true);
    } else if (m === "uncertainty") {
      setSelectedCode(null);
      setSheetExpanded(true);
    } else if (viewMode === "coverage" || viewMode === "uncertainty") {
      setSheetExpanded(false);
    }
  };

  const handleToggleOutlook = () => {
    setOutlookOn((prev) => {
      const next = !prev;
      if (next) setViewMode("default");
      return next;
    });
  };

  const closePanel = () => {
    setSelectedCode(null);
    setSheetExpanded(false);
    if (viewMode === "coverage") setViewMode("default");
  };

  const storyNauru = getGeo(geos, "NR") ?? geos[0];
  const storyTuvalu = getGeo(geos, "TV") ?? geos[1] ?? geos[0];
  const renderStoryFigure = (scene: (typeof SCENES)[number]) => {
    if (!storyNauru || !storyTuvalu) return null;
    if (scene.id === "the-gap-has-two-sides") {
      return <PressureCapacityScene geos={[storyNauru, storyTuvalu]} />;
    }
    if (scene.id === "similar-scores-different-records") {
      return <PlaceComparisonScene nauru={storyNauru} tuvalu={storyTuvalu} />;
    }
    if (scene.id === "the-order-does-not-hold-still") {
      return <RankBandScene geos={geos} />;
    }
    return null;
  };

  const panelContent =
    viewMode === "coverage" && !selectedGeo ? (
      <DataQuietCallout geos={geos} priorityCodes={priorityCodes} onPick={handleSelect} />
    ) : viewMode === "uncertainty" && !selectedGeo ? (
      <RankUncertaintyCallout geos={geos} onPick={handleSelect} />
    ) : (
      <CountryPanel
        geo={selectedGeo}
        onClose={closePanel}
        onOpenMethod={() => setDrawerOpen(true)}
      />
    );

  const shellClass =
    `atlas-shell atlas-shell--${mode}` + (panelOpen ? " atlas-shell--panel" : "");

  return (
    <div className={shellClass}>
      <div className="guided-atlas">
        <div className="guided-map">
          <div className="atlas-map-region">
            <AtlasMap
          geos={geos}
          activeScore={activeScore}
          viewMode={viewMode}
          outlookOn={outlookOn}
          selectedCode={selectedCode}
          priorityCodes={priorityCodes}
          focusSelection={mode === "guided" && sceneIndex === 3}
          panelOpen={panelOpen}
          panelExpanded={sheetExpanded}
              onSelect={handleSelect}
              activeLayerLabel={meta.title}
              sceneVisual={mode === "guided" ? SCENES[sceneIndex].visual : null}
            />

        <header className="map-header">
          <p className="map-header__wordmark">
            <Compass aria-hidden="true" size={15} /> Pacific Adaptation Gap Atlas
          </p>
          <p className="map-header__layer">
            {meta.title}
            <span className="map-header__caveat">{meta.caveat}</span>
          </p>
          {mode === "explore" && (
            <div className="map-header__actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setSceneIndex(0);
                  setMode("guided");
                }}
              >
                <Compass aria-hidden="true" size={14} /> Guided tour
              </button>
              <button type="button" className="ghost-btn" onClick={() => setDrawerOpen(true)}>
                <BookOpen aria-hidden="true" size={14} /> Methods &amp; sources
              </button>
            </div>
          )}
          <p className="map-header__concept">Concept for review - not final or approved.</p>
        </header>

        {controlsVisible && (
          <div className="dock dock--controls">
            <LayerControls
              layers={atlasLayers}
              activeScore={activeScore}
              viewMode={viewMode}
              outlookOn={outlookOn}
              onScore={handleScore}
              onViewMode={handleViewMode}
              onToggleOutlook={handleToggleOutlook}
            />
          </div>
        )}

        <div className="dock dock--legend">
          <button
            type="button"
            className="legend-toggle"
            aria-expanded={legendOpen}
            aria-controls="map-legend-body"
            onClick={() => setLegendOpen((v) => !v)}
          >
            <Layers aria-hidden="true" size={14} /> Legend
          </button>
          <div id="map-legend-body" className="legend-body" data-open={legendOpen ? "true" : "false"}>
            <MapLegend activeScore={activeScore} viewMode={viewMode} outlookOn={outlookOn} />
          </div>
        </div>

        {mode === "explore" && outlookOn && (
          <p className="outlook-banner" role="status">
            Stress test, not a forecast. Withheld for weak diagnostics: PN, PG, PW are not shown as
            outlook marks.
          </p>
        )}

          </div>
        </div>

        {mode === "guided" && (
          <StoryScrolly
            scenes={SCENES}
            handoffCopy={HANDOFF_COPY}
            index={sceneIndex}
            onActiveChange={setSceneIndex}
            onExplore={() => {
              setSelectedCode(null);
              setMode("explore");
            }}
            onOpenMethod={() => setDrawerOpen(true)}
            renderExtra={renderStoryFigure}
          />
        )}
      </div>

      {panelOpen && (
        <section
          className={`panel-dock${sheetExpanded ? " panel-dock--open" : ""}`}
          aria-label="Detail"
        >
          <button
            type="button"
            className="panel-dock__handle"
            aria-expanded={sheetExpanded}
            onClick={() => setSheetExpanded((v) => !v)}
          >
            <ChevronUp aria-hidden="true" size={16} />
            {selectedGeo ? selectedGeo.name : viewMode === "coverage" ? "Where the data goes quiet" : "Details"}
          </button>
          <div className="panel-dock__body">{panelContent}</div>
        </section>
      )}

      <MethodDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
