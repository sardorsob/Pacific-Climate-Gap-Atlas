import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const controlsSource = readFileSync(
  new URL("./components/controls/LayerControls.tsx", import.meta.url),
  "utf8",
);
const documentShell = readFileSync(new URL("../index.html", import.meta.url), "utf8");

describe("regional story integration", () => {
  it("routes only movement and visibility through the shared regional figure", () => {
    expect(appSource).toContain('from "./components/story/RegionalEvidenceScene"');
    expect(appSource).toMatch(/scene\.visual === "movement"[\s\S]*mode="movement"/);
    expect(appSource).toMatch(/scene\.visual === "visibility"[\s\S]*mode="visibility"/);
    const figureWiring = appSource.match(/const renderStoryFigure[\s\S]*?const panelContent/)?.[0] ?? "";
    expect(figureWiring).not.toContain("scene.id");
  });

  it("returns handoff, Explore, and Guided re-entry to overview", () => {
    for (const handler of ["handleHandoffActive", "handleExplore", "handleGuidedTour"]) {
      expect(appSource).toMatch(
        new RegExp(`const ${handler} = \\(\\) => \\{[\\s\\S]*?setViewMode\\(\"overview\"\\)`, "m"),
      );
    }
  });

  it("returns dismissed overlays and outlook to overview without silently restoring gap", () => {
    expect(controlsSource).toContain('viewMode === "coverage" ? "overview" : "coverage"');
    expect(controlsSource).toContain('viewMode === "uncertainty" ? "overview" : "uncertainty"');
    expect(appSource).toMatch(/const handleToggleOutlook[\s\S]*view: next \? "default" : "overview"/);
  });

  it("uses the approved public title and direct subtitle", () => {
    expect(appSource).toContain("Pacific Climate Evidence Atlas");
    expect(appSource).toContain("How conditions and official records differ across 22 Pacific places.");
    expect(appSource).not.toContain("Pacific Adaptation Gap Atlas");
    expect(documentShell).toContain("<title>Pacific Climate Evidence Atlas</title>");
  });
});
