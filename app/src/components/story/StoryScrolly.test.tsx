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
  });
});
