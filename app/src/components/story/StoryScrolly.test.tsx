import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SCENES } from "../../lib/scenes";
import { isStoryNavigationControl, StoryScrolly } from "./StoryScrolly";

const styles = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

const props = {
  scenes: SCENES,
  handoffCopy: "Explore freely",
  onActiveChange: () => undefined,
  onHandoffActive: () => undefined,
  onExplore: () => undefined,
  onOpenMethod: () => undefined,
  renderExtra: () => null,
};

describe("fullscreen story shell", () => {
  it("publishes active visual and per-scene stage ownership", () => {
    const html = renderToStaticMarkup(<StoryScrolly {...props} index={0} />);

    expect(html).toContain('data-active-visual="premise"');
    expect(html).toContain('class="story-handoff"');
    expect(html).toContain('data-story-handoff="true"');
    expect(html).toContain('id="what-the-records-show"');
    expect(html).toContain('data-stage-mode="map-immersive"');
    expect(html).toContain('id="different-directions"');
    expect(html).toContain('data-stage-mode="figure-takeover"');
  });

  it("omits story chrome from the premise DOM and restores it afterward", () => {
    const premise = renderToStaticMarkup(<StoryScrolly {...props} index={0} />);
    const evidenceScene = renderToStaticMarkup(<StoryScrolly {...props} index={1} />);

    expect(premise).not.toContain('class="story-scrolly__top"');
    expect(premise).not.toContain('aria-label="Story progress"');
    expect(evidenceScene).toContain('class="story-scrolly__top"');
    expect(evidenceScene).toContain('aria-label="Story progress"');
  });

  it("keeps the toolbar and progress controls in one reachable chrome region", () => {
    const evidenceScene = renderToStaticMarkup(<StoryScrolly {...props} index={1} />);

    expect(evidenceScene).toContain('class="story-scrolly__chrome"');
    expect(evidenceScene).toMatch(
      /story-scrolly__chrome[\s\S]*story-scrolly__top[\s\S]*aria-label="Story progress"/,
    );
  });

  it("hands the story off with a compact Explore the map action", () => {
    const html = renderToStaticMarkup(<StoryScrolly {...props} index={3} />);
    const action = html.match(/<button[^>]*story-handoff__action[^>]*>[\s\S]*?<\/button>/)?.[0] ?? "";

    expect(action).toContain("Explore the map");
    expect(action).not.toContain("Explore freely");
  });

  it("identifies interactive controls that must keep their own key handling", () => {
    const control = { closest: () => ({}) } as unknown as EventTarget;
    const section = { closest: () => null } as unknown as EventTarget;

    expect(isStoryNavigationControl(control)).toBe(true);
    expect(isStoryNavigationControl(section)).toBe(false);
  });

  it("keeps the reduced-motion override after story progress transitions", () => {
    const progressTransition = styles.indexOf(
      ".scene-progress__dot { width: 9px; height: 9px;",
    );
    const regionalEvidence = styles.indexOf(
      "/* ---------- regional evidence field (TASK-075) ---------- */",
    );
    const reducedMotion = styles.indexOf(
      "@media (prefers-reduced-motion: reduce) {",
      progressTransition,
    );

    expect(progressTransition).toBeGreaterThan(-1);
    expect(reducedMotion).toBeGreaterThan(progressTransition);
    expect(regionalEvidence).toBeGreaterThan(reducedMotion);
    expect(styles.slice(reducedMotion, regionalEvidence)).toContain(
      ".scene-progress__dot { transition: none; }",
    );
    expect(styles.slice(reducedMotion, regionalEvidence)).toContain(
      ".map-labels .map-label__lead, .map-label__name, .map-label__tag,",
    );
  });

  it("scopes premise protection to the opening without reskinning Explore", () => {
    const start = styles.indexOf(
      "/* ---------- premise legibility (TASK-086) ---------- */",
    );
    const end = styles.indexOf(
      "/* ---------- end premise legibility ---------- */",
      start,
    );

    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const premiseRules = styles.slice(start, end);
    expect(premiseRules).toContain(
      '.map-overlay-svg[data-scene-visual="premise"]',
    );
    expect(premiseRules).toContain(".map-labels");
    expect(premiseRules).toContain(".subregion-labels");
    expect(premiseRules).toContain(".graticule-labels");
    expect(premiseRules).toMatch(/\.map-labels[\s\S]{0,180}opacity:\s*0;/);
    expect(premiseRules).toContain(
      '.map-overlay-svg[data-scene-visual="premise"] .map-evidence-mark',
    );
    expect(premiseRules).toContain(
      ".evidence-mark--neutral .evidence-mark__edge--neutral",
    );
    expect(premiseRules).not.toContain(".atlas-shell--explore");
  });

  it("contains decorative edge geometry without creating page-width scroll", () => {
    expect(styles).toMatch(/\.atlas-shell\s*\{[^}]*overflow-x:\s*clip;/);
  });

  it("defines low-light chrome roles while keeping the map and evidence marks flat", () => {
    const root = styles.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";
    const protectedRules = (styles.match(/[^{}]+\{[^{}]*\}/g) ?? [])
      .filter((rule) => /\.map-evidence-mark|\.regional-evidence__movement-point|\.regional-evidence__cell|\[data-cell-state\]/.test(rule.split("{")[0]))
      .join("\n");

    expect(root).toContain("--ocean: #071923;");
    expect(root).toContain("--paper: #f6f4ed;");
    expect(root).toContain("--paper-2: #e9efed;");
    expect(root).toContain("--chrome-bg: #102832;");
    expect(root).toContain("--chrome-bg-soft: #17343e;");
    expect(root).toContain("--chrome-ink: #eef6f3;");
    expect(root).toContain("--ui-light: #66c8c5;");
    expect(root).toContain("--focus-ring: #008386;");
    expect(styles).toMatch(/\.controls, \.legend, \.map-header\s*\{[^}]*color:\s*var\(--chrome-ink\);[^}]*background:\s*var\(--chrome-bg\);/);
    expect(styles).toMatch(/\.story-scrolly__top\s*\{[^}]*background:\s*var\(--chrome-bg\);/);
    expect(styles).toMatch(/\.story-scene\[data-stage-mode="figure-takeover"\]\s*\{[^}]*background:\s*var\(--paper\);/);
    expect(styles).toMatch(/\.regional-evidence__movement-plot\s*\{[^}]*background:\s*var\(--paper-2\);/);
    expect(styles).toMatch(/:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--focus-ring\)/);
    expect(styles).toMatch(/\.map-canvas\s*\{[^}]*background:\s*var\(--ocean\);/);
    expect(styles).toMatch(/\.story-scene\[data-stage-mode="map-immersive"\]\s*\{[^}]*background:\s*linear-gradient\([^;}]+\) bottom\/100% calc\(100% - 72px\) no-repeat;/);
    expect(styles).toMatch(/@media \(max-width: 880px\)[\s\S]*?\.story-scene\[data-stage-mode="map-immersive"\]\s*\{[^}]*background:\s*linear-gradient\(0deg,[^;}]+\);/);
    expect(protectedRules).toContain(".map-evidence-mark");
    expect(protectedRules).toContain(".regional-evidence__movement-point");
    expect(protectedRules).toContain(".regional-evidence__cell");
    expect(protectedRules).not.toMatch(/(?:background(?:-image)?\s*:[^;}]*gradient|(?:box-shadow|text-shadow|(?:-webkit-)?(?:backdrop-)?filter|animation(?:-[\w-]+)?|background-image)\s*:|transition(?:-property)?\s*:[^;}]*\b(?:all|background|color|fill|stroke|filter|shadow)\b|var\(--ui-light\))/i);
  });
});
