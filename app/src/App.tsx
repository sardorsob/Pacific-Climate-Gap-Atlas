import { useEffect, useState } from "react";
import { BookOpen, ChevronUp, Compass, Layers } from "lucide-react";
import { AtlasMap } from "./components/map/AtlasMap";
import { MapLegend } from "./components/map/MapLegend";
import { LayerControls } from "./components/controls/LayerControls";
import { CountryPanel } from "./components/panels/CountryPanel";
import { DataQuietCallout } from "./components/panels/DataQuietCallout";
import { FingerprintPreview } from "./components/panels/FingerprintPreview";
import { MethodDrawer } from "./components/MethodDrawer";
import { StoryRail } from "./components/story/StoryRail";
import { BEATS, type Beat } from "./lib/tour";
import { atlasLayers } from "./lib/layers";
import type { ScoreKey } from "./lib/encoding";
import type { ViewMode } from "./lib/types";
import {
  getGeo,
  loadAtlasData,
  priorityOneCodes,
  type Geo,
} from "./lib/atlasData";

function monShort(geo: Geo): string {
  if (geo.reportingStatus === "reported_positive_latest_count") return "Reported";
  if (geo.reportingStatus === "reported_zero_latest_count") return "Reports 0";
  return "No rows";
}

// Compact two-column "same score, different story" profile used inside beat 3.
function MiniProfile({ geo }: { geo: Geo }) {
  return (
    <div className="mini">
      <p className="mini__name">{geo.name}</p>
      <p className="mini__gap">
        <b>{geo.gap.toFixed(0)}</b> gap
      </p>
      <dl className="mini__rows">
        <div><dt>Pressure</dt><dd>{geo.pressure.toFixed(0)}</dd></div>
        <div><dt>Capacity</dt><dd>{geo.capacity.toFixed(0)}</dd></div>
        <div><dt>Rank</dt><dd>{geo.rankMin}-{geo.rankMax}</dd></div>
        <div><dt>Monitoring</dt><dd>{monShort(geo)}</dd></div>
      </dl>
    </div>
  );
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
  const [beatIndex, setBeatIndex] = useState(0);

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
  const priorityCount = priorityCodes.length;
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
    const s = BEATS[beatIndex].state;
    if (s.score !== undefined) setActiveScore(s.score);
    if (s.view !== undefined) setViewMode(s.view);
    if (s.outlook !== undefined) setOutlookOn(s.outlook);
    if (s.selected !== undefined) setSelectedCode(s.selected);
  }, [beatIndex, mode]);

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
    if (mode === "explore") setSheetExpanded(true);
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

  // Beat-specific in-card controls (kept in App so they drive shared state).
  const renderExtra = (beat: Beat) => {
    if (beat.id === "pillars") {
      return (
        <div className="seg-inline" role="group" aria-label="Pressure or capacity">
          <button type="button" aria-pressed={activeScore === "pressure"} onClick={() => setActiveScore("pressure")}>
            Climate pressure
          </button>
          <button type="button" aria-pressed={activeScore === "capacity"} onClick={() => setActiveScore("capacity")}>
            Visible capacity
          </button>
        </div>
      );
    }
    if (beat.id === "anchor") {
      const tv = getGeo(geos, "TV");
      const nauru = getGeo(geos, "NR");
      return (
        <div className="beat-compare">
          <div className="seg-inline" role="group" aria-label="Anchor geography">
            <button type="button" aria-pressed={selectedCode === "NR"} onClick={() => setSelectedCode("NR")}>Nauru</button>
            <button type="button" aria-pressed={selectedCode === "TV"} onClick={() => setSelectedCode("TV")}>Tuvalu</button>
          </div>
          <div className="beat-compare__grid">
            {nauru && <MiniProfile geo={nauru} />}
            {tv && <MiniProfile geo={tv} />}
          </div>
        </div>
      );
    }
    if (beat.id === "quiet") {
      const picked = selectedGeo && priorityCodes.includes(selectedGeo.code) ? selectedGeo : null;
      return (
        <div className="quiet-mini">
          <div className="quiet-mini__keys">
            <span className="qk qk--zero">
              <span className="qk__ring qk__ring--zero" aria-hidden="true" /> reports 0
            </span>
            <span className="qk qk--missing">
              <span className="qk__ring qk__ring--missing" aria-hidden="true" /> no rows
            </span>
          </div>
          <div className="quiet-mini__chips">
            {priorityCodes.map((code) => {
              const g = getGeo(geos, code);
              if (!g) return null;
              const kind = g.reportingStatus === "reported_zero_latest_count" ? "zero" : "missing";
              return (
                <button
                  key={code}
                  type="button"
                  className={`chip chip--${kind}`}
                  aria-pressed={selectedCode === code}
                  onClick={() => setSelectedCode(code)}
                >
                  {g.code}
                </button>
              );
            })}
          </div>
          {picked && (
            <div className="quiet-mini__explain">
              <b>{picked.name}</b>
              <span>{monShort(picked)}</span>
              <p>
                {picked.reportingStatus === "reported_zero_latest_count"
                  ? "The latest official monitoring row reports zero. Keep it as a reported-zero value, not a missing row."
                  : "No processed monitoring-network row is present. Treat this as a reporting gap, not proof of absent infrastructure."}
              </p>
            </div>
          )}
        </div>
      );
    }
    if (beat.id === "fragility") {
      return <RankUncertaintyCallout geos={geos} onPick={setSelectedCode} />;
    }
    if (beat.id === "fingerprint") {
      return <FingerprintPreview geos={geos} />;
    }
    if (beat.id === "explore") {
      return (
        <button type="button" className="link-btn" onClick={() => setMode("explore")}>
          Open the full atlas controls
        </button>
      );
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
        compareGeo={null}
        onClose={closePanel}
        onCompare={handleSelect}
        onOpenMethod={() => setDrawerOpen(true)}
      />
    );

  const shellClass =
    `atlas-shell atlas-shell--${mode}` + (panelOpen ? " atlas-shell--panel" : "");

  return (
    <div className={shellClass}>
      <div className="atlas-map-region">
        <AtlasMap
          geos={geos}
          activeScore={activeScore}
          viewMode={viewMode}
          outlookOn={outlookOn}
          selectedCode={selectedCode}
          compareCode={null}
          priorityCodes={priorityCodes}
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
          {mode === "explore" && (
            <div className="map-header__actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setBeatIndex(0);
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

        {mode === "explore" && (
          <div className="dock dock--metrics" role="status">
            <span className="metric"><b>{geos.length}</b> geographies</span>
            <span className="metric metric--flag"><b>{priorityCount}</b> high-gap / low-monitoring</span>
            {!panelOpen && <span className="metric metric--hint">Select a point to inspect</span>}
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

        {mode === "guided" && (
          <StoryRail
            beats={BEATS}
            index={beatIndex}
            onBeat={setBeatIndex}
            onExplore={() => setMode("explore")}
            onOpenMethod={() => setDrawerOpen(true)}
            renderExtra={renderExtra}
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
