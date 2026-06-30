import { useEffect, useState } from "react";
import { BookOpen, ChevronUp, Compass, Layers } from "lucide-react";
import { AtlasMap } from "./components/map/AtlasMap";
import { MapLegend } from "./components/map/MapLegend";
import { LayerControls } from "./components/controls/LayerControls";
import { CountryPanel } from "./components/panels/CountryPanel";
import { DataQuietCallout } from "./components/panels/DataQuietCallout";
import { MethodDrawer } from "./components/MethodDrawer";
import { TourStepper, type TourStep } from "./components/TourStepper";
import { atlasLayers } from "./lib/layers";
import type { ScoreKey } from "./lib/encoding";
import type { ViewMode } from "./lib/types";
import { ATLAS_GEOS, COMPARE_SUGGESTION, getGeo } from "./mock/mockAtlasData";

type StepState = {
  score?: ScoreKey;
  view?: ViewMode;
  outlook?: boolean;
  selected?: string | null;
};

const TOUR: (TourStep & { state: StepState })[] = [
  {
    title: "Open on the gap",
    body: "The atlas opens on the adaptation-gap map: climate pressure minus visible capacity, ranked within the Pacific. It is an invitation to inspect mismatches, not a verdict.",
    source: "adaptation_gap_index.csv",
    state: { score: "gap", view: "default", outlook: false, selected: null },
  },
  {
    title: "Pull pressure and capacity apart",
    body: "Switch the score layer to see each side of the gap. Some places carry high pressure with high visible capacity; others show little visible capacity. Capacity is a proxy, not full readiness.",
    source: "eda_country_drivers.csv",
    state: { score: "pressure", view: "default", outlook: false, selected: null },
  },
  {
    title: "Inspect Nauru",
    body: "Nauru is a broad-evidence high-gap case whose latest monitoring row reports zero. The rank chip shows how far the rank moves under stress tests.",
    source: "country_details.json, eda_rank_volatility.csv",
    state: { score: "gap", view: "default", outlook: false, selected: "NR" },
  },
  {
    title: "Contrast with Tuvalu",
    body: "Tuvalu is also high-gap but has visible monitoring - so high gap is not the same as data silence.",
    source: "eda_monitoring_gap.csv",
    state: { score: "gap", view: "default", outlook: false, selected: "TV" },
  },
  {
    title: "Where the data goes quiet",
    body: "Surface the high-gap / low-monitoring group: PN, NR, AS, WF. Reported-zero and missing rows look different on the map. A reporting gap is not confirmed absence of infrastructure.",
    source: "eda_monitoring_gap.csv",
    state: { view: "coverage", outlook: false, selected: null },
  },
  {
    title: "Show rank fragility",
    body: "Re-encode points by rank movement. Marshall Islands alone can move 15 places. This view exists so the gap map cannot be read as a fixed scoreboard.",
    source: "eda_rank_volatility.csv",
    state: { view: "uncertainty", outlook: false, selected: "MH" },
  },
  {
    title: "Regional texture",
    body: "Polynesia has the highest mean gap and most low-capacity cases; Melanesia reads high-pressure with higher visible capacity; Micronesia is mixed and fragile. UN M49 statistical groupings, not cultural or political boundaries.",
    source: "eda_subregion_comparisons.csv",
    state: { view: "default", score: "gap", outlook: false, selected: null },
  },
  {
    title: "Optional outlook stress test",
    body: "Turn on the 2030 stress test. It is not a forecast. Weak-diagnostic places (PN, PG, PW) are withheld, not shown as normal marks.",
    source: "eda_outlook_interpretation.csv",
    state: { outlook: true, view: "default", selected: null },
  },
];

const PRIORITY_COUNT = ATLAS_GEOS.filter((g) => g.storyPriority === 1).length;

export function App() {
  const [activeScore, setActiveScore] = useState<ScoreKey>("gap");
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [outlookOn, setOutlookOn] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  const activeLayer = atlasLayers.find((l) => l.id === activeScore) ?? atlasLayers[0];
  const selectedGeo = selectedCode ? getGeo(selectedCode) ?? null : null;
  const panelOpen = selectedGeo !== null || viewMode === "coverage";

  const meta = outlookOn
    ? { title: "Outlook - 2030 stress test", caveat: "Stress-test interpretation, not a forecast." }
    : viewMode === "coverage"
      ? { title: "Where the data goes quiet", caveat: "A reporting gap is not proof that infrastructure is absent." }
      : viewMode === "uncertainty"
        ? { title: "Rank uncertainty", caveat: "Shown so the gap map cannot be read as a fixed scoreboard." }
        : { title: activeLayer.label, caveat: activeLayer.caveat };

  useEffect(() => {
    if (!tourOpen) return;
    const s = TOUR[tourIndex].state;
    if (s.score !== undefined) setActiveScore(s.score);
    if (s.view !== undefined) setViewMode(s.view);
    if (s.outlook !== undefined) setOutlookOn(s.outlook);
    if (s.selected !== undefined) {
      setSelectedCode(s.selected);
      setSheetExpanded(Boolean(s.selected) || s.view === "coverage");
    }
  }, [tourOpen, tourIndex]);

  const handleSelect = (code: string) => {
    setSelectedCode(code);
    setSheetExpanded(true);
  };

  const handleScore = (id: ScoreKey) => {
    setActiveScore(id);
    setViewMode("default");
    setOutlookOn(false);
  };

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode !== "default") setOutlookOn(false);
    if (mode === "coverage") {
      setSelectedCode(null);
      setSheetExpanded(true);
    } else if (viewMode === "coverage") {
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

  const panelContent =
    viewMode === "coverage" && !selectedGeo ? (
      <DataQuietCallout onPick={handleSelect} />
    ) : (
      <CountryPanel
        geo={selectedGeo}
        compareCode={COMPARE_SUGGESTION}
        onClose={closePanel}
        onCompare={handleSelect}
        onOpenMethod={() => setDrawerOpen(true)}
      />
    );

  return (
    <div className={`atlas-shell${panelOpen ? " atlas-shell--panel" : ""}`}>
      <div className="atlas-map-region">
        <AtlasMap
          geos={ATLAS_GEOS}
          activeScore={activeScore}
          viewMode={viewMode}
          outlookOn={outlookOn}
          selectedCode={selectedCode}
          compareCode={COMPARE_SUGGESTION}
          onSelect={handleSelect}
          activeLayerLabel={meta.title}
        />

        <header className="map-header">
          <p className="map-header__wordmark">
            <Compass aria-hidden="true" size={15} /> Pacific Adaptation Gap Atlas
          </p>
          <p className="map-header__layer">
            {meta.title}
            <span className="map-header__caveat">{meta.caveat}</span>
          </p>
          <div className="map-header__actions">
            {!tourOpen && (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setTourOpen(true);
                  setTourIndex(0);
                }}
              >
                <Compass aria-hidden="true" size={14} /> Tour
              </button>
            )}
            <button type="button" className="ghost-btn" onClick={() => setDrawerOpen(true)}>
              <BookOpen aria-hidden="true" size={14} /> Methods &amp; sources
            </button>
          </div>
          <p className="map-header__concept">Concept for review - not final or approved.</p>
        </header>

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

        <div className="dock dock--metrics" role="status">
          <span className="metric">
            <b>{ATLAS_GEOS.length}</b> geographies
          </span>
          <span className="metric metric--flag">
            <b>{PRIORITY_COUNT}</b> high-gap / low-monitoring
          </span>
          {!panelOpen && <span className="metric metric--hint">Select a point to inspect</span>}
        </div>

        <div className="dock dock--legend">
          <button
            type="button"
            className="legend-toggle"
            aria-expanded={legendOpen}
            onClick={() => setLegendOpen((v) => !v)}
          >
            <Layers aria-hidden="true" size={14} /> Legend
          </button>
          <div className="legend-body" data-open={legendOpen ? "true" : "false"}>
            <MapLegend activeScore={activeScore} viewMode={viewMode} outlookOn={outlookOn} />
          </div>
        </div>

        {tourOpen && (
          <div className="dock dock--tour">
            <TourStepper steps={TOUR} index={tourIndex} onStep={setTourIndex} onClose={() => setTourOpen(false)} />
          </div>
        )}

        {outlookOn && (
          <p className="outlook-banner" role="status">
            Stress test, not a forecast. Withheld for weak diagnostics: PN, PG, PW are not shown as
            outlook marks.
          </p>
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
            {selectedGeo ? selectedGeo.name : "Where the data goes quiet"}
          </button>
          <div className="panel-dock__body">{panelContent}</div>
        </section>
      )}

      <MethodDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
