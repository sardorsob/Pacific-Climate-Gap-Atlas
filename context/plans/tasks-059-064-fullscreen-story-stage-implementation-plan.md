# Fullscreen Story Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the undersized guided-story rail with one fullscreen premise, three map-immersive evidence scenes, two readable figure takeovers, and a clean return to the existing atlas explorer.

**Architecture:** Reuse the current `StoryScrolly`, sticky `guided-map`, `IntersectionObserver`, URL state, and scene-specific figure components. Add stage ownership directly to the `Scene` contract and let normal document sections plus CSS determine whether the sticky map remains visible or an opaque editorial figure takes over; no new stage component or scroll controller is needed.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, MapLibre GL 4, native `IntersectionObserver`, native `URLSearchParams`, CSS, HTML, and SVG only where it remains readable.

## Global Constraints

- Follow `context/ARTISTIC_REDESIGN_BRIEF.md`; `TASK-058` is approved and done.
- Keep one native document scroll owner and one observer-confirmed active-scene writer.
- Do not add a router, animation library, chart library, canvas particle system, state library, or runtime dependency.
- Keep the first viewport evidence-bearing: the Pacific map remains visible behind the premise.
- Preserve the existing five evidence scenes after the new premise.
- Keep all 22 geographies at equal visual presence; missingness never changes overall mark size.
- Use `visible capacity`, never `readiness`, for the capacity proxy.
- Keep JSD selected-place and panel-only; do not restore map connectors or guided JSD.
- Natural Earth remains orientation context, not official scored territory geometry.
- Rank bands remain sensitivity diagnostics, not confidence intervals or a leaderboard.
- Preserve the existing 560ms `cubic-bezier(0.22, 1, 0.36, 1)` evidence transition and provide a complete reduced-motion equivalent.
- Use generated app data and existing EDA artifacts; concept-board labels, values, photographs, and boundaries are never implementation inputs.
- Each task follows TDD where logic/markup changes, runs its own verification gate, receives a separate Checker pass, and ends in its own commit without `Co-authored-by` trailers.

## Binding Preflight Corrections

These corrections supersede any narrower code sample below where the two conflict.

- TASK-059 replaces the hard-coded `sceneIndex === 3` comparison-camera condition in `App.tsx` with the stable comparison scene id or visual. Adding the premise must not move named-place focus to scene 3.
- TASK-060 removes premise chrome from layout, focus order, and the accessibility tree by conditionally omitting the existing top/progress wrapper while the premise is active. Opacity alone is insufficient. The existing observer thresholds include `0`, and story-level keyboard navigation ignores events originating inside buttons or links.
- TASK-060 also verifies the existing map scene operations rather than treating `data-scene-visual` as decoration: presence keeps all 22 footprints equal, missingness uses the existing coverage state and evidence breaks, and split uses the existing pressure state plus the pressure/capacity figure. No second map renderer is added.
- TASK-061 and TASK-062 remain sequential because they share `storyFigures.test.tsx` and `base.css`.
- TASK-061 stacks portraits only in portrait orientation. Landscape keeps the two-column comparison, removes the unexplained Nauru-only selection bloom, and aligns each portrait's header/stat/caveat tracks.
- TASK-062 uses stable alphabetical geography order and an unordered list, removes the synthetic midpoint dot, uses mathematically aligned `1 / 8 / 15 / 22` ticks, and allows full geography names to wrap. No ellipsis may hide a name. Portrait and landscape both use normal document scroll rather than a nested chart scroller.
- TASK-063 uses the existing observer to detect the handoff and restore `{ score: "gap", view: "default", selected: null }`; `handleExplore()` repeats that reset before changing mode so Explore and its URL never inherit scene-5 uncertainty.
- Stable `data-code` identity, the reused `EvidenceMark`, per-mark CSS transitions, and chamber motion provide continuity. A cross-DOM FLIP/shared-element engine is deliberately excluded under Ponytail/YAGNI; TASK-064 records this implementation interpretation and the owner may accept it or return TASK-063 to `needs-fix`.
- Reduced motion disables transitions on the animated elements themselves, including `.story-scene`, `.story-scrolly__top`, `.story-handoff`, evidence marks, and descendants.
- TASK-064 may advance only to `in-review` after automated and delegated Checker evidence. It requires the owner's visual/accessibility acceptance before `in-review -> done`; TASK-057 remains `needs-fix` until then.
- Stage exact touched paths for every commit. Do not use broad `git add context`, `git add app`, or equivalent directory-wide staging.

---

## Target File Structure

- `app/src/lib/scenes.ts`: six ordered guided scenes, including the premise; each scene declares `stage` ownership.
- `app/src/lib/scenes.test.ts`: ordered IDs, premise copy, stage modes, caveats, and source contract.
- `app/src/lib/urlState.test.ts`: new default premise and copied-scene fallback behavior.
- `app/src/components/story/StoryScene.tsx`: premise eyebrow plus five-scene numbering.
- `app/src/components/story/StoryScrolly.tsx`: observer owner, active visual/stage data attributes, progress, and transparent return handoff.
- `app/src/components/story/StoryScrolly.test.tsx`: static semantic/stage markup contract.
- `app/src/components/story/PlaceComparisonScene.tsx`: stage-sized Nauru/Tuvalu comparison wrapper.
- `app/src/components/story/EvidencePortrait.tsx`: aligned evidence fields and stable geography identity.
- `app/src/components/story/RankBandScene.tsx`: responsive HTML interval field.
- `app/src/components/story/rankBandModel.ts`: interval rows, percentages, and reduced-motion transition.
- `app/src/components/story/storyFigures.test.tsx`: comparison/rank markup, labels, and caveats.
- `app/src/components/map/MapOverlay.tsx`: stable geography identity on map marks.
- `app/src/App.tsx`: active visual attribute and existing figure routing; no new state store.
- `app/src/styles/base.css`: fullscreen sticky composition, figure takeovers, readable intervals, transitions, responsive behavior, and reduced motion.

---

### TASK-059: Add The Premise And Validate The Six-Scene Contract

**Files:**

- Modify: `app/src/lib/scenes.ts:4-78`
- Modify: `app/src/lib/scenes.test.ts:1-18`
- Modify: `app/src/lib/urlState.test.ts:17-39`
- Modify: `app/src/components/story/StoryScene.tsx:11-22`
- Modify: `app/src/App.tsx` comparison-scene camera condition
- Modify after verification: `context/TASKS.md`, `context/STORY_BRIEF.md`, `context/logs/Progress Log.md`, `context/logs/Handoff Notes.md`

**Interfaces:**

- Consumes: existing `ScoreKey`, `ViewMode`, five evidence scenes, and URL parsing derived from `SCENE_IDS`.
- Produces: `SceneStage = "map-immersive" | "figure-takeover"`; six stable scene IDs with `what-this-atlas-is-asking` first; premise-aware scene numbering.

- [ ] **Step 1: Move TASK-059 from pending to in-progress**

Edit only the TASK-059 status and attempt log in `context/TASKS.md`, then run:

```bash
python scripts/validate_task_statuses.py
```

Expected: `Task status check passed (65 statuses).`

- [ ] **Step 2: Write the failing six-scene tests**

Replace `app/src/lib/scenes.test.ts` with:

```typescript
import { describe, expect, it } from "vitest";
import { HANDOFF_COPY, SCENES } from "./scenes";

describe("fullscreen guided story", () => {
  it("uses one premise followed by the approved five-scene spine", () => {
    expect(SCENES.map((scene) => scene.id)).toEqual([
      "what-this-atlas-is-asking",
      "what-the-map-can-see",
      "where-the-record-breaks",
      "the-gap-has-two-sides",
      "similar-scores-different-records",
      "the-order-does-not-hold-still",
    ]);
    expect(SCENES).toHaveLength(6);
    expect(SCENES[0]).toMatchObject({
      visual: "premise",
      stage: "map-immersive",
      title: "Climate pressure is not the same as adaptation capacity.",
    });
    expect(SCENES.slice(1, 4).every((scene) => scene.stage === "map-immersive")).toBe(true);
    expect(SCENES.slice(4).every((scene) => scene.stage === "figure-takeover")).toBe(true);
    expect(SCENES.every((scene) => scene.source.length > 0)).toBe(true);
    expect(SCENES.every((scene) => scene.caveat.length > 0)).toBe(true);
    expect(SCENES.some((scene) => scene.id.includes("fingerprint"))).toBe(false);
    expect(HANDOFF_COPY).toContain("Explore freely");
  });
});
```

Update the invalid-value expectation in `app/src/lib/urlState.test.ts` so the default scene is:

```typescript
scene: "what-this-atlas-is-asking",
```

Update the default serialization case to use the same premise ID.

- [ ] **Step 3: Run the focused tests and confirm red**

Run:

```bash
npm --prefix app run test -- scenes.test.ts urlState.test.ts
```

Expected: failure because the premise and `Scene.stage` do not exist and the current default remains `what-the-map-can-see`.

- [ ] **Step 4: Extend the scene contract and add the premise**

In `app/src/lib/scenes.ts`, use these exact type additions:

```typescript
export type SceneVisual = "premise" | "presence" | "missingness" | "split" | "comparison" | "rank-bands";
export type SceneStage = "map-immersive" | "figure-takeover";

export type Scene = {
  id: string;
  short: string;
  title: string;
  claim: string;
  caveat: string;
  source: string;
  visual: SceneVisual;
  stage: SceneStage;
  state: {
    score?: ScoreKey;
    view?: ViewMode;
    selected?: string | null;
  };
};
```

Insert this object first in `SCENES`:

```typescript
{
  id: "what-this-atlas-is-asking",
  short: "The question",
  title: "Climate pressure is not the same as adaptation capacity.",
  claim: "Across 22 Pacific places, official records show both unevenly. This atlas maps the gap between them—and makes the missing evidence visible.",
  caveat: "Visible capacity is what the available official datasets can show, not full readiness or lived adaptive capacity.",
  source: "adaptation_gap_index.csv; generated geography records",
  visual: "premise",
  stage: "map-immersive",
  state: { score: "gap", view: "default", selected: null },
},
```

Add `stage: "map-immersive"` to the next three scene objects and `stage: "figure-takeover"` to the Nauru/Tuvalu and rank-band objects. Keep the five approved evidence claims, caveats, sources, and IDs. Replace the comparison camera's hard-coded numeric scene index in `App.tsx` with the stable `similar-scores-different-records` id so the premise insertion cannot shift it.

- [ ] **Step 5: Make StoryScene distinguish premise from evidence scenes**

Replace the function body in `StoryScene.tsx` with:

```tsx
export function StoryScene({ scene, index, total, children }: StorySceneProps) {
  const premise = scene.visual === "premise";
  const eyebrow = premise
    ? "What this atlas is asking"
    : `Scene ${index} of ${total - 1} · ${scene.short}`;

  return (
    <article className="story-scene__content">
      <p className="story-scene__eyebrow">{eyebrow}</p>
      <h2 className="story-scene__title">{scene.title}</h2>
      <p className="story-scene__claim">{scene.claim}</p>
      <p className="story-scene__caveat">{scene.caveat}</p>
      {children && <div className="story-scene__extra">{children}</div>}
      {scene.source && <p className="story-scene__source">Evidence: {scene.source}</p>}
    </article>
  );
}
```

- [ ] **Step 6: Run focused and full frontend checks**

Run:

```bash
npm --prefix app run test -- scenes.test.ts urlState.test.ts
npm --prefix app run test
npm --prefix app run build
```

Expected: all tests pass; build completes with only the already-recorded large-chunk warning.

- [ ] **Step 7: Complete the task-specific Checker gate and commit**

Cross-check the premise against `context/ARTISTIC_REDESIGN_BRIEF.md`, then run:

```bash
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
git diff --check
```

Move TASK-059 `in-progress -> in-review`; after the separate Checker pass, move it `in-review -> done`, update existing logs, and commit:

```bash
git add app/src/lib/scenes.ts app/src/lib/scenes.test.ts app/src/lib/urlState.test.ts app/src/components/story/StoryScene.tsx app/src/App.tsx context/TASKS.md context/STORY_BRIEF.md "context/logs/Progress Log.md" "context/logs/Handoff Notes.md" context/plans/tasks-059-064-fullscreen-story-stage-implementation-plan.md
git commit -m "feat(story): TASK-059 add fullscreen premise"
```

---

### TASK-060: Replace The Grid Rail With The Fullscreen Native-Scroll Composition

**Files:**

- Create: `app/src/components/story/StoryScrolly.test.tsx`
- Modify: `app/src/components/story/StoryScrolly.tsx:70-110`
- Modify: `app/src/App.tsx:333-430`
- Modify: `app/src/styles/base.css:399-568`
- Modify after verification: existing task, project, handoff, and progress context

**Interfaces:**

- Consumes: `Scene.visual`, `Scene.stage`, existing observer-owned `index`, sticky `.guided-map`, and `renderExtra(scene)`.
- Produces: `data-active-visual` on the story root; `data-stage-mode` on each section; transparent map-immersive sections and opaque figure-takeover sections.

- [ ] **Step 1: Move TASK-060 to in-progress and write the failing markup test**

Create `app/src/components/story/StoryScrolly.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SCENES } from "../../lib/scenes";
import { StoryScrolly } from "./StoryScrolly";

describe("fullscreen story shell", () => {
  it("publishes active visual and per-scene stage ownership", () => {
    const html = renderToStaticMarkup(
      <StoryScrolly
        scenes={SCENES}
        handoffCopy="Explore freely"
        index={0}
        onActiveChange={() => undefined}
        onExplore={() => undefined}
        onOpenMethod={() => undefined}
        renderExtra={() => null}
      />,
    );

    expect(html).toContain('data-active-visual="premise"');
    expect(html).toContain('id="what-this-atlas-is-asking"');
    expect(html).toContain('data-stage-mode="map-immersive"');
    expect(html).toContain('id="similar-scores-different-records"');
    expect(html).toContain('data-stage-mode="figure-takeover"');
  });
});
```

Run:

```bash
npm --prefix app run test -- StoryScrolly.test.tsx
```

Expected: failure because the data attributes are absent.

- [ ] **Step 2: Add semantic stage attributes without adding state**

Change the opening `<main>` in `StoryScrolly.tsx` to:

```tsx
<main
  className="story-scrolly"
  aria-label="Guided atlas story"
  data-active-visual={scenes[index]?.visual}
  tabIndex={0}
  onKeyDown={onKeyDown}
>
```

Add this attribute to every mapped scene `<section>`:

```tsx
data-stage-mode={scene.stage}
```

Render the existing `.story-scrolly__top` wrapper only when `scenes[index]?.visual !== "premise"`; this removes its buttons and progress controls from layout and focus order during the premise. Add `0` to the existing observer thresholds. In `onKeyDown`, return without story navigation when the event target is inside `button`, `a`, `input`, `select`, or `textarea`.

Do not add a `StoryStage` component, a second observer, or stage state in `App`.

- [ ] **Step 3: Expose the active visual on the existing app shell**

Change the root in `App.tsx` to:

```tsx
<div
  className={shellClass}
  data-scene-visual={mode === "guided" ? SCENES[sceneIndex]?.visual : undefined}
>
```

Keep the existing map, URL, observer, and `renderStoryFigure` ownership unchanged.

- [ ] **Step 4: Replace only the story-layout CSS block**

Replace the current `.guided-atlas` through `.story-scene__extra` layout rules with:

```css
.guided-atlas {
  position: relative;
  display: block;
  min-height: 100vh;
  background: var(--ocean);
}
.guided-map {
  position: sticky;
  top: 0;
  z-index: 0;
  height: 100svh;
  min-height: 540px;
  overflow: hidden;
}
.guided-map .atlas-map-region { position: absolute; inset: 0; }
.atlas-shell--explore .guided-atlas { min-height: 100vh; }
.atlas-shell--explore .guided-map { position: absolute; inset: 0; height: 100vh; }
.atlas-shell--guided .dock--legend { display: none; }
.atlas-shell--guided .map-header { left: 18px; right: auto; max-width: 300px; }
.atlas-shell--guided .map-header__layer,
.atlas-shell--guided .map-header__concept { display: none; }
.atlas-shell--guided .map-note { display: none; }

.story-scrolly {
  position: relative;
  z-index: 8;
  margin-top: -100svh;
  min-width: 0;
  color: #f6f3eb;
  outline: none;
}
.story-scrolly__top {
  position: sticky;
  top: 0;
  z-index: 12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 13px 15px;
  background: rgba(7, 27, 41, 0.82);
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10px);
  transition: opacity 200ms ease;
}
.story-scrolly__brand { display: inline-flex; align-items: center; gap: 6px; font-weight: 800; font-size: 12px; color: #f6f3eb; }
.story-scrolly__actions { display: flex; gap: 6px; }
.story-scrolly__sections { position: relative; }
.story-scene {
  min-height: 100svh;
  display: grid;
  align-items: center;
  padding: 12svh clamp(1rem, 5vw, 5rem);
  scroll-margin-top: 58px;
}
.story-scene[data-stage-mode="map-immersive"] {
  background: linear-gradient(90deg, rgba(7, 27, 41, 0.86) 0%, rgba(7, 27, 41, 0.38) 46%, transparent 72%);
}
.story-scene[data-stage-mode="figure-takeover"] {
  background: var(--paper);
  color: var(--ink);
}
.story-scene__content {
  width: min(42rem, 100%);
  display: grid;
  gap: 12px;
}
.story-scene[data-stage-mode="figure-takeover"] .story-scene__content {
  width: min(86rem, 100%);
  margin-inline: auto;
  grid-template-columns: minmax(16rem, 24rem) minmax(0, 1fr);
  column-gap: clamp(2rem, 5vw, 6rem);
}
.story-scene[data-stage-mode="figure-takeover"] .story-scene__extra {
  grid-column: 2;
  grid-row: 1 / span 6;
  align-self: center;
}
.story-scene__eyebrow { margin: 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); }
.story-scene__title { margin: 0; font-size: clamp(32px, 4vw, 62px); line-height: 1.02; text-wrap: balance; }
.story-scene__claim { margin: 0; font: 600 clamp(18px, 2vw, 26px)/1.42 Georgia, serif; }
.story-scene__caveat { margin: 0; padding-left: 12px; border-left: 2px solid #e9c98f; font-size: 13px; line-height: 1.45; }
.story-scene__source { margin: 0; font: 500 11px/1.5 ui-monospace, "SF Mono", Menlo, monospace; opacity: 0.78; }
.story-scene__extra { display: grid; gap: 12px; }
```

Replace the story portion of the `max-width: 880px` media query with:

```css
@media (max-width: 880px) {
  .guided-map { height: 100svh; min-height: 100svh; }
  .atlas-shell--explore .guided-map { position: absolute; height: 100vh; }
  .atlas-shell--guided .map-header { left: 10px; right: 10px; max-width: none; }
  .story-scrolly { margin-top: -100svh; }
  .story-scene { min-height: 100svh; padding: 14svh 1rem 10svh; }
  .story-scene[data-stage-mode="map-immersive"] {
    align-items: end;
    background: linear-gradient(0deg, rgba(7, 27, 41, 0.94) 0%, rgba(7, 27, 41, 0.56) 52%, transparent 80%);
  }
  .story-scene[data-stage-mode="figure-takeover"] {
    min-height: auto;
    padding-block: 6rem;
  }
  .story-scene[data-stage-mode="figure-takeover"] .story-scene__content {
    display: grid;
    grid-template-columns: 1fr;
  }
  .story-scene[data-stage-mode="figure-takeover"] .story-scene__extra {
    grid-column: 1;
    grid-row: auto;
  }
  .story-scene__title { font-size: clamp(30px, 10vw, 44px); }
  .story-scene__claim { font-size: 18px; }
  .story-handoff { min-height: 100svh; padding: 5rem 1rem 7rem; }
  .scene-progress { overflow-x: auto; flex-wrap: nowrap; }
  .scene-progress__item { min-height: 44px; white-space: nowrap; }
}

@media (max-width: 880px) and (orientation: landscape) {
  .story-scene[data-stage-mode="figure-takeover"] .story-scene__content {
    grid-template-columns: minmax(14rem, 20rem) minmax(0, 1fr);
  }
  .story-scene[data-stage-mode="figure-takeover"] .story-scene__extra {
    grid-column: 2;
    grid-row: 1 / span 6;
  }
}
```

Do not delete existing evidence-mark, figure, panel, explorer, or reduced-motion rules in this task.

- [ ] **Step 5: Run focused tests, full tests, and build**

```bash
npm --prefix app run test -- StoryScrolly.test.tsx sceneState.test.ts scenes.test.ts urlState.test.ts
npm --prefix app run test
npm --prefix app run build
```

Expected: all tests pass and the build completes.

- [ ] **Step 6: Browser-check the shell before task acceptance**

At 1440×900 and 390×844 verify:

- premise fills the first viewport over the map;
- story/progress chrome is absent on the premise and returns afterward;
- scenes 1–3 reveal the sticky map behind transparent sections;
- scenes 4–5 cover the map with warm paper;
- there is no horizontal overflow or nested scrolling;
- copied premise and scene-5 URLs settle on the correct section.

- [ ] **Step 7: Complete Checker gate and commit**

Run the standard frontend/status/secret/whitespace gate, update existing context only, and stage exact paths before committing:

```bash
git add app/src/App.tsx app/src/components/story/StoryScrolly.tsx app/src/components/story/StoryScrolly.test.tsx app/src/styles/base.css context/TASKS.md context/PROJECT.md context/HANDOVER.md "context/logs/Progress Log.md" "context/logs/Handoff Notes.md"
git commit -m "feat(story): TASK-060 add fullscreen story composition"
```

---

### TASK-061: Promote Nauru And Tuvalu Into The Scene-Four Takeover

**Files:**

- Modify: `app/src/components/story/PlaceComparisonScene.tsx`
- Modify: `app/src/components/story/EvidencePortrait.tsx`
- Modify: `app/src/components/story/storyFigures.test.tsx`
- Modify: `app/src/styles/base.css`
- Modify after verification: existing task/story/design/log context

**Interfaces:**

- Consumes: real Nauru/Tuvalu `Geo` records, existing `EvidenceMark`, `monitoringShort()`, and figure routing from `App.renderStoryFigure()`.
- Produces: one `data-stage-figure="comparison"` figure with two aligned, full-width evidence portraits and stable `data-code` identity.

- [ ] **Step 1: Move TASK-061 to in-progress and write the failing markup assertions**

Extend the first story-figure test with:

```typescript
expect(html).toContain('data-stage-figure="comparison"');
expect(html).toContain('data-code="NR"');
expect(html).toContain('data-code="TV"');
expect((html.match(/class="evidence-portrait/g) ?? []).length).toBe(2);
```

Run:

```bash
npm --prefix app run test -- storyFigures.test.tsx
```

Expected: failure because stage and geography data attributes are absent.

- [ ] **Step 2: Add stage semantics without changing evidence**

Change the `PlaceComparisonScene` opening tag to:

```tsx
<figure
  className="place-comparison-figure"
  data-stage-figure="comparison"
  aria-label="Nauru and Tuvalu official-evidence comparison"
>
```

Change the `EvidencePortrait` opening tag to:

```tsx
<figure
  className={`evidence-portrait${compact ? " evidence-portrait--compact" : ""}`}
  data-code={geo.code}
>
```

Render both portraits without `selected`; the comparison scene has no user selection and must not give Nauru an unexplained bloom. Do not add new values, prose fields, JSD, photographs, or comparison controls.

- [ ] **Step 3: Replace the compact comparison styles with stage-scale styles**

Use:

```css
.place-comparison-figure { margin: 0; display: grid; gap: 18px; }
.place-comparison-figure__portraits {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.5rem, 4vw, 4rem);
}
.evidence-portrait {
  margin: 0;
  padding: clamp(1.25rem, 3vw, 2.5rem);
  border-top: 3px solid var(--line);
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 18px;
  background: var(--paper-2);
}
.evidence-portrait__head { display: flex; align-items: center; gap: 14px; }
.evidence-portrait__head figcaption { min-width: 0; }
.evidence-portrait__head h3 { margin: 0; font: 700 clamp(22px, 2.2vw, 34px) var(--font-sans); }
.evidence-portrait__head p { margin: 4px 0 0; color: var(--ink-soft); font-size: 13px; line-height: 1.4; }
.evidence-portrait__stats { margin: 0; display: grid; gap: 9px; }
.evidence-portrait__stats > div { display: flex; justify-content: space-between; gap: 14px; font-size: 14px; }
.evidence-portrait__stats dt { color: var(--ink-soft); }
.evidence-portrait__stats dd { margin: 0; text-align: right; font-weight: 800; }
.evidence-portrait__caveat { margin: 0; color: var(--caveat-ink); font-size: 12px; line-height: 1.45; }
.place-comparison-figure__caption { margin: 0; color: var(--ink-soft); font-size: 12px; font-style: italic; }

@media (max-width: 880px) and (orientation: portrait) {
  .place-comparison-figure__portraits { grid-template-columns: 1fr; gap: 2rem; }
  .evidence-portrait { min-height: min(60svh, 34rem); align-content: center; }
}
```

- [ ] **Step 4: Run tests/build and browser matrix**

```bash
npm --prefix app run test -- storyFigures.test.tsx
npm --prefix app run test
npm --prefix app run build
```

Inspect scene 4 at 1440×900, 1280×800, 1024×768, 430×932, 390×844, 360×800, and landscape mobile. Every label/value must be readable without zoom; portrait mobile must use normal page scroll, not nested scrolling or swipe-only navigation.

- [ ] **Step 5: Complete Checker gate and commit**

After claims, accessibility, status, secret, and whitespace review:

```bash
git add app/src/components/story/PlaceComparisonScene.tsx app/src/components/story/EvidencePortrait.tsx app/src/components/story/storyFigures.test.tsx app/src/styles/base.css context/TASKS.md context/STORY_BRIEF.md context/DESIGN_BRIEF.md "context/logs/Progress Log.md" "context/logs/Handoff Notes.md"
git commit -m "feat(story): TASK-061 enlarge place comparison"
```

---

### TASK-062: Replace The Miniature SVG With A Responsive Interval Field

**Files:**

- Modify: `app/src/components/story/rankBandModel.ts`
- Modify: `app/src/components/story/rankBandModel.test.ts`
- Modify: `app/src/components/story/RankBandScene.tsx`
- Modify: `app/src/components/story/storyFigures.test.tsx`
- Modify: `app/src/styles/base.css`
- Modify after verification: existing task/design/log context

**Interfaces:**

- Consumes: `RankBandRow[]` from generated `Geo.rankMin/rankMax`, existing 560ms reduced-motion contract.
- Produces: `rankToPercent(rank): number`; 22 alphabetically ordered HTML rows on one 1–22 scale; CSS variables `--rank-start` and `--rank-width`.

- [ ] **Step 1: Write failing percentage and HTML-row tests**

Add to `rankBandModel.test.ts`:

```typescript
import { buildRankBandRows, rankBandTransition, rankToPercent } from "./rankBandModel";

it("maps the shared 1 to 22 scale to percentages", () => {
  expect(rankToPercent(1)).toBe(0);
  expect(rankToPercent(11.5)).toBe(50);
  expect(rankToPercent(22)).toBe(100);
  expect(rankToPercent(99)).toBe(100);
});

it("uses stable alphabetical order instead of implying a leaderboard", () => {
  const rows = buildRankBandRows([
    makeGeo("NR", 1, 7, "sensitive"),
    makeGeo("MH", 4, 19, "fragile"),
  ]);
  expect(rows.map((row) => row.name)).toEqual(["Marshall Islands", "Nauru"]);
});
```

Extend the rank-band markup test:

```typescript
expect(html).toContain('data-stage-figure="rank-bands"');
expect(html).toContain('class="rank-band-figure__rows"');
expect(html).toContain('style="--rank-start:');
expect(html).not.toContain("<svg");
```

Run:

```bash
npm --prefix app run test -- rankBandModel.test.ts storyFigures.test.tsx
```

Expected: failure because `rankToPercent`, HTML rows, and CSS variables do not exist.

- [ ] **Step 2: Add the shared-scale helper**

Append to `rankBandModel.ts`:

```typescript
export function rankToPercent(rank: number): number {
  const clamped = Math.max(1, Math.min(22, rank));
  return ((clamped - 1) / 21) * 100;
}
```

- [ ] **Step 3: Replace RankBandScene with responsive HTML**

Use this component body and imports:

```tsx
import { useEffect, useState, type CSSProperties } from "react";
import type { Geo } from "../../lib/atlasData";
import { buildRankBandRows, rankBandTransition, rankToPercent } from "./rankBandModel";

type RankStyle = CSSProperties & {
  "--rank-start": string;
  "--rank-width": string;
};

export function RankBandScene({ geos, reducedMotion }: RankBandSceneProps) {
  const mediaReducedMotion = usePrefersReducedMotion();
  const transition = rankBandTransition(reducedMotion ?? mediaReducedMotion);
  const rows = buildRankBandRows(geos);

  return (
    <figure
      className="rank-band-figure"
      data-stage-figure="rank-bands"
      data-motion-mode={transition.mode}
      style={{ "--rank-band-duration": `${transition.duration}ms` } as CSSProperties}
      aria-label="Sensitivity rank bands for the 22 Pacific geographies"
    >
      <div className="rank-band-figure__sticky-head">
        <p className="rank-band-figure__intro">Sensitivity bands, not a fixed scoreboard</p>
        <div className="rank-band-figure__axis" aria-hidden="true">
          <span>1</span><span>8</span><span>15</span><span>22</span>
        </div>
      </div>
      <ul className="rank-band-figure__rows">
        {rows.map((row) => {
          const start = rankToPercent(row.min);
          const end = rankToPercent(row.max);
          const style = {
            "--rank-start": `${start}%`,
            "--rank-width": `${Math.max(0, end - start)}%`,
          } as RankStyle;
          return (
            <li
              key={row.code}
              className={`rank-band-figure__row${row.highlight ? " rank-band-figure__row--highlight" : ""}`}
              data-code={row.code}
              data-highlight={row.highlight ? "true" : "false"}
              aria-label={`${row.name}, sensitivity band ${row.min} to ${row.max}`}
            >
              <span className="rank-band-figure__name">{row.name}</span>
              <span className="rank-band-figure__plot" style={style} aria-hidden="true">
                <span className="rank-band-figure__band" />
                {row.highlight && <span className="rank-band-figure__value">4–19</span>}
              </span>
            </li>
          );
        })}
      </ul>
      <figcaption className="rank-band-figure__caption">
        The bands are sensitivity diagnostics, not confidence intervals or a definitive leaderboard.
      </figcaption>
    </figure>
  );
}
```

Keep the existing `usePrefersReducedMotion`, prop type, and transition behavior. Update `buildRankBandRows()` to sort by `name.localeCompare()` and remove its unused synthetic midpoint field.

- [ ] **Step 4: Replace the SVG-specific rank CSS**

Use:

```css
.rank-band-figure { margin: 0; display: grid; gap: 12px; width: 100%; }
.rank-band-figure__intro { margin: 0; color: var(--ink-soft); font-size: 13px; font-weight: 800; }
.rank-band-figure__sticky-head { position: sticky; top: 56px; z-index: 1; display: grid; gap: 6px; background: var(--paper); }
.rank-band-figure__axis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-left: clamp(7rem, 18vw, 15rem);
  padding: 6px 0;
  color: var(--ink-soft);
  background: var(--paper);
  font-size: 12px;
}
.rank-band-figure__axis span:not(:first-child):not(:last-child) { text-align: center; }
.rank-band-figure__axis span:last-child { text-align: right; }
.rank-band-figure__rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.rank-band-figure__row {
  min-height: 28px;
  display: grid;
  grid-template-columns: clamp(7rem, 18vw, 15rem) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}
.rank-band-figure__name { min-width: 0; color: var(--ink-soft); font-size: 13px; font-weight: 650; line-height: 1.15; overflow-wrap: anywhere; }
.rank-band-figure__plot { position: relative; height: 18px; border-bottom: 1px solid rgba(82, 105, 116, 0.18); }
.rank-band-figure__band {
  position: absolute;
  left: var(--rank-start);
  top: 8px;
  width: var(--rank-width);
  height: 4px;
  border-radius: 999px;
  background: #8095a0;
  transition: left var(--rank-band-duration) var(--motion-ease-evidence), width var(--rank-band-duration) var(--motion-ease-evidence);
}
.rank-band-figure__row--highlight .rank-band-figure__band { height: 6px; top: 7px; background: #e8895a; }
.rank-band-figure__value { position: absolute; left: calc(var(--rank-start) + var(--rank-width) + 8px); top: 1px; color: #9a4a34; font-size: 12px; font-weight: 800; white-space: nowrap; }
.rank-band-figure__caption { margin: 0; color: var(--ink-soft); font-size: 12px; font-style: italic; line-height: 1.4; }

@media (max-width: 880px) and (orientation: portrait) {
  .rank-band-figure__row { grid-template-columns: 7rem minmax(0, 1fr); gap: 8px; min-height: 34px; }
  .rank-band-figure__axis { margin-left: 7rem; }
  .rank-band-figure__name { font-size: 13px; }
}
```

- [ ] **Step 5: Verify all 22 rows at target sizes**

Run tests/build, then inspect all seven standard viewports plus mobile landscape. Confirm:

- 22 names and 22 bands render;
- labels are at least 13px CSS size;
- MH reads 4–19;
- one 1–22 scale remains aligned;
- portrait mobile grows in page flow with no nested scroll;
- reduced motion yields `data-motion-mode="static"` and zero-duration transitions.

- [ ] **Step 6: Complete Checker gate and commit**

```bash
git add app/src/components/story/RankBandScene.tsx app/src/components/story/rankBandModel.ts app/src/components/story/rankBandModel.test.ts app/src/components/story/storyFigures.test.tsx app/src/styles/base.css context/TASKS.md context/DESIGN_BRIEF.md "context/logs/Progress Log.md" "context/logs/Handoff Notes.md"
git commit -m "feat(story): TASK-062 enlarge rank interval field"
```

---

### TASK-063: Connect Evidence Identity, Transitions, And The Explore Handoff

**Files:**

- Modify: `app/src/components/map/MapOverlay.tsx:97-107`
- Modify: `app/src/components/story/EvidencePortrait.tsx`
- Modify: `app/src/components/story/StoryScrolly.tsx:104-110`
- Modify: `app/src/components/story/StoryScrolly.test.tsx`
- Modify: `app/src/components/story/storyFigures.test.tsx`
- Modify: `app/src/App.tsx` handoff and Explore state reset
- Modify: `app/src/styles/base.css`
- Modify after verification: existing task/design/log context

**Interfaces:**

- Consumes: stable `Geo.code`, current `data-active`, 560ms evidence token, existing reduced-motion media query, and `handleExplore()`.
- Produces: `data-code` across map/portrait/rank forms; an observer-confirmed transparent handoff that restores gap/default map state; interruptible text/chamber transitions.

- [ ] **Step 1: Write failing identity and handoff assertions**

In `StoryScrolly.test.tsx`, add:

```typescript
expect(html).toContain('class="story-handoff"');
expect(html).toContain('data-stage-mode="map-immersive"');
expect(html).toContain('data-story-handoff="true"');
```

In `storyFigures.test.tsx`, retain the comparison `data-code` assertions and add:

```typescript
expect(html).toContain('data-code="MH"');
```

Run the focused tests and confirm the handoff assertion fails.

- [ ] **Step 2: Publish stable geography identity on the map and handoff**

Change the map mark wrapper in `MapOverlay.tsx` to:

```tsx
<g key={`status-${geo.code}`} data-code={geo.code}>
```

Change the handoff opening tag in `StoryScrolly.tsx` to:

```tsx
<section
  className="story-handoff"
  data-stage-mode="map-immersive"
  data-story-handoff="true"
  aria-label="Return to the Pacific"
>
```

Add `onHandoffActive` to `StoryScrollyProps`, attach a ref to this section, and observe it with the same `IntersectionObserver` used for scenes. When the handoff crosses the existing active threshold, call `onHandoffActive()` without inventing a seventh scene id. In `App.tsx`, that callback restores gap/default/no-selection state; `handleExplore()` repeats the reset before switching mode and commits `layer=gap`, `view=default`, and `place=null` so the Explore URL cannot inherit scene 5.

`EvidencePortrait` and rank rows already expose `data-code` from TASK-061 and TASK-062. Do not build a DOM shared-element engine; stable identity, reused evidence marks, per-mark transitions, and the existing chamber components are the deliberate minimal continuity mechanism.

- [ ] **Step 3: Add evidence-bearing CSS transitions**

Add:

```css
.story-scene__content {
  opacity: 0.34;
  transform: translateY(18px);
  transition: opacity 220ms ease, transform 220ms ease;
}
.story-scene[data-active="true"] .story-scene__content {
  opacity: 1;
  transform: translateY(0);
}
.story-scene[data-stage-mode="figure-takeover"] {
  transition: background-color 560ms var(--motion-ease-evidence);
}
.story-handoff {
  min-height: 100svh;
  display: grid;
  align-content: center;
  gap: 14px;
  padding: 12svh clamp(1rem, 5vw, 5rem);
  color: #f6f3eb;
  background: linear-gradient(90deg, rgba(7, 27, 41, 0.84), rgba(7, 27, 41, 0.18) 65%, transparent);
}
.story-handoff__copy { max-width: 42rem; margin: 0; font: 600 clamp(24px, 3vw, 42px)/1.35 Georgia, serif; }
```

Ensure the existing reduced-motion block includes `.story-scene`, `.story-scrolly__top`, `.story-handoff`, `.story-handoff *`, and evidence-mark elements themselves; force their transitions to `0ms !important`.

- [ ] **Step 4: Verify navigation converges on the latest state**

Run full tests/build. In the browser:

- scroll slowly through all scenes;
- jump premise → rank → missingness;
- use Arrow/Page/Home/End;
- enter Explore from the handoff;
- use Back, then reopen Guided;
- repeat with reduced motion.

Expected: no stale scene, camera, caption, paper chamber, selection, or URL wins after the latest navigation; the handoff reveals the map and Explore removes story chrome.

- [ ] **Step 5: Complete Checker gate, budget check, and commit**

```bash
python scripts/check_app_bundle_budget.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
git diff --check
git add app/src/components/map/MapOverlay.tsx app/src/components/story/EvidencePortrait.tsx app/src/components/story/StoryScrolly.tsx app/src/components/story/StoryScrolly.test.tsx app/src/components/story/storyFigures.test.tsx app/src/App.tsx app/src/styles/base.css context/TASKS.md context/DESIGN_BRIEF.md context/HANDOVER.md "context/logs/Progress Log.md" "context/logs/Handoff Notes.md"
git commit -m "feat(story): TASK-063 connect stage transitions"
```

---

### TASK-064: Run The Full Repair QA And Reconcile TASK-057

**Files:**

- Create screenshots only: `artifacts/design/task-064/*.png`
- Modify only if a concrete failure requires it: focused app source/test files
- Modify: `context/TASKS.md`, `context/PROJECT.md`, `context/HANDOVER.md`, `context/docs/submission-notes.md`, `context/logs/Progress Log.md`, `context/logs/Handoff Notes.md`, `context/memory/patterns.md`

**Interfaces:**

- Consumes: completed TASK-059–063 commits and the accepted scientific/runtime baseline.
- Produces: cross-viewport evidence, accessibility, URL/history, transition, performance, and owner-taste results; legal TASK-057 reconciliation.

- [ ] **Step 1: Move TASK-064 to in-progress and run the complete automated gate**

```bash
python -m unittest discover -s tests -t . -v
python scripts/validate_data_contracts.py
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
npm --prefix app run test
npm --prefix app run build
python scripts/check_app_bundle_budget.py
git diff --check
```

Expected: all commands pass. Record exact test counts and JS/CSS bytes in TASK-064 QA notes.

- [ ] **Step 2: Run the visual viewport matrix**

Capture premise, scene 4, scene 5, and Explore at:

- 1440×900
- 1280×800
- 1024×768
- 430×932
- 390×844
- 360×800
- 844×390 landscape mobile for scene 5

Record screenshots under `artifacts/design/task-064/`; put findings in existing TASKS and progress logs, not a new Markdown report.

Pass conditions:

- premise communicates the project without opening methods;
- scene 4 fields are readable without zoom;
- scene 5 has all 22 names/bands, at least 13px labels, no 330px cap, and no nested scroll;
- no horizontal overflow or fixed-chrome overlap;
- Explore restores all accepted controls and panels.

- [ ] **Step 3: Run interaction, URL, and motion checks**

Verify progress clicks, Arrow/Page/Home/End, rapid 1→6→2 jumps, copied premise/comparison/rank URLs, invalid URL fallback, explicit push, passive replace, Back/Forward, Guided re-entry, reduced motion, and interrupted camera transitions.

Expected: one observer-confirmed final scene and matching URL/state after every sequence.

- [ ] **Step 4: Run evidence and accessibility checks**

Confirm:

- 22 marks and eight score-input positions;
- separate context tick;
- PN/NR reported zero versus AS/WF missing monitoring row;
- exact Nauru/Tuvalu fields;
- MH 4–19 and 19/22 fragility;
- panel-only JSD caveat and no map connectors;
- Natural Earth geometry caveat;
- outlook remains a stress test, not a forecast;
- keyboard focus order, visible focus, 44px controls, screen-reader reading order, contrast, grayscale/color-deficiency distinction, and reduced-motion equivalence.

- [ ] **Step 5: Apply the legal task transitions**

If any acceptance condition fails, move TASK-064 `in-progress -> in-review -> needs-fix` with exact file-level notes and leave TASK-057 `needs-fix`.

If every automated, delegated Checker, and local browser condition passes:

1. Move TASK-064 `in-progress -> in-review` after the Maker pass.
2. Run a separate Checker pass and record its evidence, but leave TASK-064 `in-review` for the required owner visual/accessibility decision.
3. After the owner accepts the viewport matrix, move TASK-064 `in-review -> done`.
4. Only then move TASK-057 `needs-fix -> in-progress`, record the completed repair batch, rerun its release gate, and move it `in-progress -> in-review` for final owner deployment/submission actions.

Do not mark TASK-057 done and do not claim deployment or submission.

- [ ] **Step 6: Commit the QA reconciliation**

```bash
git add artifacts/design/task-064 context/TASKS.md context/PROJECT.md context/HANDOVER.md context/docs/submission-notes.md "context/logs/Progress Log.md" "context/logs/Handoff Notes.md" context/memory/patterns.md
git commit -m "test(release): TASK-064 verify fullscreen story repair"
```

The pre-owner commit records QA evidence and the `in-review` state. It must contain only QA-driven fixes, screenshots, and durable existing-context updates; it must not create another per-task Markdown report. If QA found an app fix, stage that exact file explicitly rather than staging the `app` directory.

---

## Plan Self-Review Checklist

- TASK-059 covers the premise, six stable IDs, source/caveat copy, and URL default.
- TASK-060 covers the fullscreen native-scroll shell without a new abstraction or dependency.
- TASK-061 covers readable scene-4 desktop/mobile comparison.
- TASK-062 covers readable 22-row desktop/mobile rank intervals and reduced motion.
- TASK-063 covers stable geography identity, text/chamber transitions, rapid navigation, and Explore return.
- TASK-064 covers all target viewports, accessibility, evidence claims, URL/history, performance, and legal TASK-057 reconciliation.
- Function/type names are consistent across tasks: `Scene.stage`, `SceneVisual`, `rankToPercent`, `data-stage-mode`, `data-stage-figure`, and `data-code`.
- No task creates a per-task Markdown file; durable results update existing context and this one batch plan.
