import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const controlsSource = readFileSync(
  new URL("./components/controls/LayerControls.tsx", import.meta.url),
  "utf8",
);
const documentShell = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const baseCss = readFileSync(new URL("./styles/base.css", import.meta.url), "utf8");
const faviconUrl = new URL("../public/favicon.svg", import.meta.url);

function sourceBlock(start: string, end: string) {
  const startMarker = `const ${start} =`;
  const endMarker = `\n  const ${end} =`;
  const startIndex = appSource.indexOf(startMarker);
  const endIndex = appSource.indexOf(endMarker, startIndex + startMarker.length);
  if (startIndex < 0 || endIndex <= startIndex) throw new Error(`Could not find ${start} block`);
  return appSource.slice(startIndex, endIndex);
}

describe("regional story integration", () => {
  it("fences selection history to handleSelect and evidence entry to handleViewMode", () => {
    const handleSelect = sourceBlock("handleSelect", "handleScore");
    const handleViewMode = sourceBlock("handleViewMode", "handleToggleOutlook");

    expect(handleSelect).toContain('const diagnosticView = viewMode === "coverage" || viewMode === "uncertainty"');
    expect(handleSelect).toContain('commitUrlState(diagnosticView ? "replaceState" : "pushState", { place: code })');
    expect(handleSelect).not.toContain("setViewMode");
    expect(handleViewMode).toContain('commitUrlState("pushState", { view: m, place: nextPlace, outlook: nextOutlook })');
  });

  it("fences Back to the exact parent-only transition", () => {
    const returnToDiagnostic = sourceBlock("returnToDiagnostic", "dismissPanel");

    expect(returnToDiagnostic).toContain("setSelectedCode(null)");
    expect(returnToDiagnostic).toContain("setSheetExpanded(true)");
    expect(returnToDiagnostic).toContain('commitUrlState("replaceState", { place: null, view: viewMode })');
    expect(returnToDiagnostic).not.toContain("setViewMode");
    expect(returnToDiagnostic).not.toContain("setOutlookOn");
  });

  it("fences Close to diagnostic overview replacement", () => {
    const dismissPanel = sourceBlock("dismissPanel", "handleSceneChange");

    expect(dismissPanel).toContain('const diagnosticView = viewMode === "coverage" || viewMode === "uncertainty"');
    expect(dismissPanel).toContain("setSelectedCode(null)");
    expect(dismissPanel).toContain("setSheetExpanded(false)");
    expect(dismissPanel).toContain('const nextView = diagnosticView ? "overview" : viewMode');
    expect(dismissPanel).toContain("setViewMode(nextView)");
    expect(dismissPanel).toContain('commitUrlState("replaceState", {');
    expect(dismissPanel).toContain("place: null");
    expect(dismissPanel).toContain("view: nextView");
    expect(dismissPanel).toContain('outlook: nextView === "overview" ? false : outlookOn');
  });

  it("fences CountryPanel JSX to navigation-owned Close", () => {
    const panelContent = sourceBlock("panelContent", "shellClass");
    const countryPanel = panelContent.match(/<CountryPanel[\s\S]*?\/>/)?.[0] ?? "";

    expect(appSource).toContain('from "./components/panels/ExplorerPanelNav"');
    expect(appSource).toContain("<ExplorerPanelNav");
    expect(countryPanel).toMatch(/^<CountryPanel\s+geo=\{selectedGeo\}\s+geos=\{geos\}\s+onOpenMethod=\{\(\) => setDrawerOpen\(true\)\}\s*\/>$/);
  });

  it("restores panel and map focus without a separate focus manager", () => {
    expect(appSource).toMatch(/const focusPanelClose[\s\S]*?requestAnimationFrame[\s\S]*?\.panel-nav__close/);
    expect(appSource).toContain('?? document.querySelector<HTMLButtonElement>(".map-a11y-point")');
  });

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

  it("exposes the approved static Night Watch favicon before React starts", () => {
    expect(documentShell).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');

    const faviconSource = readFileSync(faviconUrl, "utf8");
    expect(faviconSource).toContain('viewBox="0 0 32 32"');
    expect(faviconSource).toContain('<rect width="32" height="32" rx="8" fill="#071923" />');
    expect(faviconSource).toContain('stroke="#f6f4ed"');
    expect([...faviconSource.matchAll(/<path d="([^"]+)" \/>/g)].map((match) => match[1])).toEqual([
      "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    ]);
    expect(faviconSource).not.toMatch(/<(?:script|foreignObject)\b/i);
  });

  it("does not ship temporary review chrome", () => {
    expect(appSource).not.toContain("Concept for review");
    expect(appSource).not.toContain("map-header__concept");
  });

  it("keeps the Methods close control touch-sized", () => {
    expect(baseCss).toMatch(/\.icon-btn\s*\{[^}]*padding:\s*12px;/);
  });

  it("keeps every visible Explorer header action touch-sized", () => {
    expect(baseCss).toMatch(/(?:^|\n)\.ghost-btn\s*\{[^}]*min-height:\s*44px;/);
  });

  it("keeps the panel controls transition inside the desktop media block", () => {
    const desktopStart = baseCss.indexOf("@media (min-width: 881px)");
    const desktopEnd = baseCss.indexOf("/* ================= native document-scroll story ================= */", desktopStart);
    const desktopCss = baseCss.slice(desktopStart, desktopEnd);
    const outsideDesktopCss = `${baseCss.slice(0, desktopStart)}${baseCss.slice(desktopEnd)}`;

    expect(outsideDesktopCss).not.toMatch(/\.dock--controls\s*\{[^}]*transition:/);
    expect(desktopCss).toMatch(/\.dock--controls\s*\{[^}]*transition:\s*right 0\.25s ease;/);
    const panelControlsRules = desktopCss.match(/\.atlas-shell--panel \.dock--controls\s*\{[^}]*\}/g) ?? [];
    const [panelControlsRule] = panelControlsRules;

    expect(panelControlsRules).toHaveLength(1);
    expect(panelControlsRule).toContain("right: calc(var(--panel-w) + 18px);");
  });
});
