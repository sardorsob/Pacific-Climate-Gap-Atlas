import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import { LayerControls } from "../controls/LayerControls";
import { adaptGeographiesPayload } from "../../lib/atlasData";
import { atlasLayers } from "../../lib/layers";
import { buildAtlasFeatureCollection } from "./atlasMapModel";
import { MapLegend } from "./MapLegend";
import { MapOverlay } from "./MapOverlay";

describe("neutral overview presentation", () => {
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
});
