import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import { LayerControls } from "../controls/LayerControls";
import { adaptGeographiesPayload } from "../../lib/atlasData";
import { atlasLayers } from "../../lib/layers";
import { AtlasMap } from "./AtlasMap";
import { buildAtlasFeatureCollection } from "./atlasMapModel";
import { MapLegend } from "./MapLegend";
import { MapOverlay } from "./MapOverlay";

const mapSource = readFileSync(new URL("./useAtlasMap.ts", import.meta.url), "utf8");
const baseCss = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

const mapHookState = vi.hoisted(() => ({ mapReady: false, mapError: true }));
vi.mock("./useAtlasMap", () => ({
  useAtlasMap: () => ({
    containerRef: { current: null },
    project: () => ({ x: 120, y: 120 }),
    ...mapHookState,
  }),
}));

describe("neutral overview presentation", () => {
  it("replaces both map renderers with an in-region alert after failure", () => {
    const geos = adaptGeographiesPayload(generatedGeographies);
    const html = renderToStaticMarkup(
      <AtlasMap
        geos={geos}
        activeScore="gap"
        viewMode="default"
        outlookOn={false}
        selectedCode={null}
        priorityCodes={[]}
        onSelect={() => undefined}
        activeLayerLabel="Gap"
      />,
    );

    expect(html).toContain('class="map-canvas"');
    expect(html).toContain('class="app-state"');
    expect(html).toContain('role="alert"');
    expect(html).toContain("Map unavailable");
    expect(html).toContain("The interactive map is unavailable.");
    expect(html).not.toContain("Could not start the interactive map.");
    expect(html).toContain('<p class="sr-only">Interactive map unavailable. No map evidence is displayed.');
    expect(html).not.toContain('class="maplibre-canvas"');
    expect(html).not.toContain('class="map-overlay-svg"');
    expect(html).not.toContain('class="map-a11y-layer"');
  });

  it("shows a scoreless overview legend without rank or reporting encodings", () => {
    const html = renderToStaticMarkup(
      <MapLegend activeScore="capacity" viewMode="overview" outlookOn={false} />,
    );

    expect(html).toContain("Regional overview");
    expect(html).toContain('data-scoreless="true"');
    expect(html).not.toContain("Fill color");
    expect(html).not.toContain("Inner field = active score");
    expect(html).not.toContain("Outer edge");
    expect(html).not.toContain("rank");
  });

  it("leaves every score control unpressed and names the neutral state", () => {
    const html = renderToStaticMarkup(
      <LayerControls
        layers={atlasLayers}
        activeScore="gap"
        viewMode="overview"
        outlookOn={false}
        onScore={() => undefined}
        onViewMode={() => undefined}
        onToggleOutlook={() => undefined}
      />,
    );

    expect((html.match(/aria-pressed="false"/g) ?? [])).toHaveLength(6);
    expect(html).toContain("Overview is neutral");
    expect(html).not.toContain("Comparative screen, not a ranking of need");
  });

  it("renders all overview React marks with one invariant identity and neutral hit copy", () => {
    const geos = adaptGeographiesPayload(generatedGeographies);
    const atlasFeatures = buildAtlasFeatureCollection(geos, {
      activeScore: "pressure",
      viewMode: "overview",
      outlookOn: false,
      selectedCode: null,
      priorityCodes: geos.map((geo) => geo.code),
    });
    const html = renderToStaticMarkup(
      <MapOverlay
        geos={geos}
        project={() => ({ x: 120, y: 120 })}
        selectedCode={null}
        activeScore="pressure"
        sceneVisual="presence"
        onSelect={() => undefined}
        atlasFeatures={atlasFeatures}
        viewMode="overview"
        priorityCodes={geos.map((geo) => geo.code)}
        activeLayerLabel="Regional overview"
      />,
    );

    expect((html.match(/data-scoreless="true"/g) ?? [])).toHaveLength(22);
    expect((html.match(/Neutral overview mark\. Select to inspect this place\./g) ?? [])).toHaveLength(22);
    expect(html).not.toContain("data-reporting-edge");
    expect(html).not.toContain("evidence-mark__score");
    expect(html).not.toContain("Rank moves");
    expect(html).toContain("Selectable place records are centroid points, not boundary polygons.");
    expect(html).not.toContain("Scored geographies");
  });

  it("uses crisp selection outlines and removes the data-dependent glow machinery", () => {
    const selectedLayer = mapSource.match(/if \(!map\.getLayer\(SELECTED_PRESENCE_LAYER_ID\)\)[^\n]+/)?.[0] ?? "";

    expect(mapSource).not.toContain("LAND_MARK_GLOW_LAYER_ID");
    expect(mapSource).not.toContain("glowOpacity");
    expect(mapSource).not.toContain('"line-blur"');
    expect(mapSource).not.toContain('"circle-blur"');
    expect(selectedLayer).toContain('"circle-color": "transparent"');
    expect(selectedLayer).toContain('"circle-stroke-color": "#ffffff"');
    expect(selectedLayer).toContain('"circle-stroke-width": 2');
    expect(selectedLayer).not.toContain('"circle-opacity"');
    expect(baseCss).toMatch(/\.evidence-mark__bloom\s*\{[^}]*fill:\s*none;[^}]*stroke:\s*#fff;[^}]*stroke-width:\s*1\.75;/);
  });

  it("keeps Explorer chrome graphite and reading, callout, and drawer surfaces mineral", () => {
    expect(baseCss).toMatch(/\.controls, \.legend, \.map-header\s*\{[^}]*color:\s*var\(--chrome-ink\);[^}]*background:\s*var\(--chrome-bg\);/);
    expect(baseCss).toMatch(/\.panel-dock\s*\{[^}]*background:\s*var\(--paper\);/);
    expect(baseCss).toMatch(/\.panel-nav\s*\{[^}]*background:\s*var\(--chrome-bg\);[^}]*color:\s*var\(--chrome-ink\);/);
    expect(baseCss).toMatch(/\.quiet-card--missing\s*\{[^}]*background:\s*var\(--paper-2\);/);
    expect(baseCss).toMatch(/\.drawer\s*\{[^}]*background:\s*var\(--paper\);[^}]*border-left:\s*2px solid var\(--ui-light\);/);
    expect(baseCss).toMatch(/\.app-state\s*\{[^}]*background:\s*var\(--ocean\);[^}]*color:\s*#f3f7f8;/);
    expect(baseCss).toMatch(/\.outlook-banner\s*\{[^}]*background:\s*var\(--caveat-bg\);[^}]*color:\s*var\(--caveat-ink\);/);
  });
});
