import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SCENES } from "../../lib/scenes";
import { isStoryNavigationControl, StoryScrolly } from "./StoryScrolly";

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
    expect(html).toContain('id="what-this-atlas-is-asking"');
    expect(html).toContain('data-stage-mode="map-immersive"');
    expect(html).toContain('id="similar-scores-different-records"');
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

  it("identifies interactive controls that must keep their own key handling", () => {
    const control = { closest: () => ({}) } as unknown as EventTarget;
    const section = { closest: () => null } as unknown as EventTarget;

    expect(isStoryNavigationControl(control)).toBe(true);
    expect(isStoryNavigationControl(section)).toBe(false);
  });
});
