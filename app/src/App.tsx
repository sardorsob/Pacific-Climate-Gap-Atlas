import { useEffect, useRef, useState } from "react";
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
import { parseAtlasUrl, serializeAtlasUrl, type AtlasUrlState } from "./lib/urlState";
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

function writeAtlasUrl(state: AtlasUrlState, method: "pushState" | "replaceState") {
  if (typeof window === "undefined") return;
  const search = serializeAtlasUrl(state);
  window.history[method]({}, "", `${window.location.pathname}${search}${window.location.hash}`);
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
  const applyingHistoryRef = useRef(false);
  const initialUrlAppliedRef = useRef(false);
  const skipGuidedSyncRef = useRef(false);
  const skipInitialSceneObservationRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadAtlasData()
      .then((loaded) => {
        if (cancelled) return;
        setGeos(loaded);
        if (initialUrlAppliedRef.current) return;
        const parsed = parseAtlasUrl(
          typeof window === "undefined" ? "" : window.location.search,
          loaded.map((geo) => geo.code),
        );
        applyingHistoryRef.current = true;
        skipGuidedSyncRef.current = parsed.mode === "guided";
        skipInitialSceneObservationRef.current = parsed.mode === "guided";
        setMode(parsed.mode);
        setSceneIndex(Math.max(0, SCENES.findIndex((scene) => scene.id === parsed.scene)));
        setActiveScore(parsed.layer);
        setViewMode(parsed.view);
        setSelectedCode(parsed.place);
        setOutlookOn(parsed.outlook);
        applyingHistoryRef.current = false;
        initialUrlAppliedRef.current = true;
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
    if (skipGuidedSyncRef.current) {
      skipGuidedSyncRef.current = false;
      return;
    }
    const s = SCENES[sceneIndex].state;
    if (s.score !== undefined) setActiveScore(s.score);
    if (s.view !== undefined) setViewMode(s.view);
    setOutlookOn(false);
    if (s.selected !== undefined) setSelectedCode(s.selected);
  }, [sceneIndex, mode]);

  useEffect(() => {
    if (geos.length === 0 || typeof window === "undefined") return;
    const onPopState = () => {
      const parsed = parseAtlasUrl(window.location.search, geos.map((geo) => geo.code));
      applyingHistoryRef.current = true;
      skipGuidedSyncRef.current = parsed.mode === "guided";
      skipInitialSceneObservationRef.current = parsed.mode === "guided";
      setMode(parsed.mode);
      setSceneIndex(Math.max(0, SCENES.findIndex((scene) => scene.id === parsed.scene)));
      setActiveScore(parsed.layer);
      setViewMode(parsed.view);
      setSelectedCode(parsed.place);
      setOutlookOn(parsed.outlook);
      applyingHistoryRef.current = false;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [geos]);

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

  const currentUrlState = (overrides: Partial<AtlasUrlState> = {}): AtlasUrlState => ({
    mode,
    scene: SCENES[sceneIndex]?.id ?? SCENES[0].id,
    layer: activeScore,
    view: viewMode,
    place: selectedCode,
    outlook: outlookOn,
    ...overrides,
  });

  const commitUrlState = (method: "pushState" | "replaceState", overrides: Partial<AtlasUrlState> = {}) => {
    if (applyingHistoryRef.current) return;
    writeAtlasUrl(currentUrlState(overrides), method);
  };

  const handleSelect = (code: string) => {
    setSelectedCode(code);
    if (mode === "explore") setSheetExpanded(!isCompactViewport());
    commitUrlState("pushState", { place: code });
  };

  const handleScore = (id: ScoreKey) => {
    setActiveScore(id);
    setViewMode("default");
    setOutlookOn(false);
    commitUrlState("pushState", { layer: id, view: "default", outlook: false });
  };

  const handleViewMode = (m: ViewMode) => {
    const nextPlace = m === "coverage" || m === "uncertainty" ? null : selectedCode;
    const nextOutlook = m === "default" ? outlookOn : false;
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
    commitUrlState("pushState", { view: m, place: nextPlace, outlook: nextOutlook });
  };

  const handleToggleOutlook = () => {
    const next = !outlookOn;
    setOutlookOn(next);
    if (next) setViewMode("default");
    commitUrlState("pushState", { outlook: next, view: next ? "default" : viewMode });
  };

  const closePanel = () => {
    setSelectedCode(null);
    setSheetExpanded(false);
    if (viewMode === "coverage") setViewMode("default");
    commitUrlState("pushState", { place: null, view: viewMode === "coverage" ? "default" : viewMode });
  };

  const handleSceneChange = (nextIndex: number) => {
    if (skipInitialSceneObservationRef.current) {
      skipInitialSceneObservationRef.current = false;
      return;
    }
    const next = Math.max(0, Math.min(SCENES.length - 1, nextIndex));
    setSceneIndex(next);
    if (mode === "guided") {
      const sceneState = SCENES[next].state;
      commitUrlState("replaceState", {
        mode: "guided",
        scene: SCENES[next].id,
        layer: sceneState.score ?? activeScore,
        view: sceneState.view ?? viewMode,
        place: sceneState.selected === undefined ? selectedCode : sceneState.selected,
        outlook: sceneState.view === undefined ? outlookOn : false,
      });
    }
  };

  const handleExplore = () => {
    setSelectedCode(null);
    setMode("explore");
    commitUrlState("pushState", { mode: "explore", place: null });
  };

  const handleGuidedTour = () => {
    setSceneIndex(0);
    setMode("guided");
    setActiveScore("gap");
    setViewMode("default");
    setOutlookOn(false);
    setSelectedCode(null);
    commitUrlState("pushState", {
      mode: "guided",
      scene: SCENES[0].id,
      layer: "gap",
      view: "default",
      place: null,
      outlook: false,
    });
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
                onClick={handleGuidedTour}
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
            onActiveChange={handleSceneChange}
            onExplore={handleExplore}
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
