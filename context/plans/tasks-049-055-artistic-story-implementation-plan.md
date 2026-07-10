# Artistic Story Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the guided atlas as a five-scene native-scroll story whose visual grammar makes official-data visibility, score decomposition, and rank fragility legible through evidence-bearing form and motion.

**Architecture:** A single scene model drives document scroll, progress navigation, map state, and composed editorial figures. MapLibre remains the geographic substrate; focused React/SVG components render evidence marks, the Nauru/Tuvalu comparison, and the rank-band scene. Guided story and free exploration share generated data but have intentionally different visual compositions.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, MapLibre GL 4, CSS/SVG, existing static JSON data, image generation for concept frames only.

## Global Constraints

- Start only after `TASK-048` provides correct score-input/context semantics.
- Use the approved contract in `context/ARTISTIC_REDESIGN_BRIEF.md`.
- Concept approval in `TASK-049` is a hard gate before visual implementation.
- Keep the Pacific map visible in the first viewport.
- Every geography keeps a consistent overall mark footprint; evidence completeness is never encoded by overall mark size.
- Missingness uses breaks, open cuts, unlit positions, dash, or texture—not color alone.
- JSD does not appear in the guided five-scene spine and does not use map arcs.
- Natural Earth land remains context, not official scored geometry.
- Typical transitions are 450–650ms, interruptible, and disabled or replaced under reduced motion.
- No new animation dependency, global state library, charting library, or design-system dependency.
- Keep one clear source line and one necessary caveat per scene.
- Use TDD for pure scene/mark models and server-rendered component behavior.
- Each project task ends in its own reviewed commit.

---

## Target File Structure

- `app/src/lib/scenes.ts`: five-scene content and canonical state requests.
- `app/src/lib/sceneState.ts`: pure scene-state reducer and active-scene selection helper.
- `app/src/lib/sceneState.test.ts`: reducer, navigation, and latest-state tests.
- `app/src/components/story/StoryScrolly.tsx`: normal-flow sections and sticky progress/navigation shell.
- `app/src/components/story/SceneProgress.tsx`: buttons that scroll only; observer owns active scene.
- `app/src/components/story/StoryScene.tsx`: one claim, caveat, source, and optional figure slot.
- `app/src/components/map/EvidenceMark.tsx`: SVG mark renderer used on map and in portraits.
- `app/src/components/map/evidenceMarkModel.ts`: pure conversion from `Geo` to mark segments/edges.
- `app/src/components/map/evidenceMarkModel.test.ts`: all eight positions and reporting states.
- `app/src/components/story/PressureCapacityScene.tsx`: scene-three paired-side explanation.
- `app/src/components/story/EvidencePortrait.tsx`: reusable aligned geography portrait.
- `app/src/components/story/PlaceComparisonScene.tsx`: Nauru/Tuvalu composed comparison.
- `app/src/components/story/RankBandScene.tsx`: sensitivity interval figure.
- `app/src/components/story/storyFigures.test.tsx`: static markup tests for the three figures.
- `app/src/components/map/AtlasMap.tsx`: geographic substrate, mark anchors, and scene-aware map state.
- `app/src/components/map/atlasMapModel.ts`: retain projection, land, graticule, and geographic feature helpers only.
- `app/src/App.tsx`: top-level mode, active scene, selected geography, and explore handoff.
- `app/src/styles/base.css`: scene layout, evidence mark, portrait, interval, motion, mobile, and reduced-motion rules.

Files retired after replacements pass:

- `app/src/lib/tour.ts`
- `app/src/lib/tour.test.ts`
- `app/src/components/story/StoryRail.tsx`
- `app/src/components/story/BeatProgress.tsx`
- `app/src/components/story/StoryBeat.tsx`
- `app/src/components/panels/FingerprintPreview.tsx`
- `app/src/components/panels/FingerprintPreview.test.tsx`

---

### TASK-049: Approve Desktop And Mobile Concept Frames

**Files:**

- Create: `context/design-concepts/task-049-concept-review.md`
- Create: `artifacts/design/task-049/scene-01-desktop.png`
- Create: `artifacts/design/task-049/scene-02-desktop.png`
- Create: `artifacts/design/task-049/scene-04-desktop.png`
- Create: `artifacts/design/task-049/scene-05-desktop.png`
- Create: `artifacts/design/task-049/scene-01-mobile.png`
- Create: `artifacts/design/task-049/scene-04-mobile.png`
- Modify: `context/DESIGN_BRIEF.md`
- Modify: `context/TASKS.md`
- Modify: `context/logs/Progress Log.md`
- Modify: `context/logs/Handoff Notes.md`

**Interfaces:**

- Consumes: `context/ARTISTIC_REDESIGN_BRIEF.md` and current app screenshots.
- Produces: one owner-approved visual direction with recorded decisions for marks, typography, palette, density, and mobile composition.

- [ ] **Step 1: Capture the current baseline**

Run the app and save desktop `1440 × 900` and mobile `390 × 844` screenshots for the first view, data-quiet view, Nauru/Tuvalu beat, and rank-fragility beat. Record the exact commit hash and screenshot viewport in the concept-review file.

- [ ] **Step 2: Generate the six required concept frames**

Use the `imagegen` skill and the approved art direction. The generation prompt must include:

```text
Editorial scientific Pacific ocean atlas, near-black blue ocean, subdued cartographic land,
warm mineral-white typography, coral adaptation-gap inner marks, blue pressure, sea-glass
capacity, missing evidence as open cuts and broken strokes, fixed-size evidence glyphs,
no Indigenous or Polynesian decorative motifs, no dashboard cards, no glossy glassmorphism,
no physical route lines, no photorealism. Preserve a credible data-visualization interface.
```

Scene-specific additions:

- Scene 1 desktop/mobile: all 22 equal-presence marks and the opening claim.
- Scene 2 desktop: score color receded; missing ticks and reported-zero/missing-row outer edges dominant.
- Scene 4 desktop/mobile: aligned Nauru and Tuvalu evidence portraits with faint map anchors.
- Scene 5 desktop: marks rearranged into sensitivity intervals with Marshall Islands highlighted.

- [ ] **Step 3: Evaluate concepts against a fixed rubric**

Record `pass`, `revise`, or `reject` for:

- evidence semantics are legible without prose;
- no mark size/importance confusion;
- context-only tick is separate;
- reported zero and missing row differ in monochrome;
- map remains recognizably Pacific;
- scene claim and evidence figure have one dominant hierarchy;
- no cultural appropriation or borrowed publication identity;
- mobile comparison does not cover the map or copy;
- design is implementable with SVG/CSS/MapLibre and no new dependency.

- [ ] **Step 4: Record the chosen direction, not just the images**

The concept-review Markdown must specify exact decisions:

```markdown
## Approved Direction
- Evidence mark silhouette: 44px circular portrait; 20px inner field; eight 5px radial ticks.
- Score-input tick order from 12 o'clock clockwise: sea-surface temperature, surface temperature, rainfall, sea level, directly affected persons, monitoring network, power generation, fisheries management.
- Context tick position: detached at 4:30, outside the input radius.
- Reporting edge variants: continuous / two open dashes / four dotted broken segments.
- Desktop scene column width: 28rem maximum.
- Mobile map height: 46svh.
- Serif stack: Georgia, "Times New Roman", serif.
- Sans stack: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif.
- Motion duration/easing: 560ms; cubic-bezier(0.22, 1, 0.36, 1).
- Rejected ideas: variable-size bubbles, similarity routes, full-canvas fades, glass dashboard cards, and unsourced cultural ornament.
```

These are the recommended defaults. If owner review changes one, replace that line with the exact approved value and record the rejected default. No field may remain undecided before implementation begins.

- [ ] **Step 5: Owner approval gate**

Move `TASK-049` to `in-review` and present the frame set. Do not start `TASK-050` until the owner selects or explicitly approves one direction. Record the approval and any revisions in the task QA notes.

- [ ] **Step 6: Commit the approved concept package**

Run:

```bash
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
git diff --check
```

Then commit:

```bash
git add context artifacts/design/task-049
git commit -m "docs(design): TASK-049 approve artistic atlas concept"
```

The commit must not contain a `Co-authored-by` trailer.

---

### TASK-050: Replace Nested Story Scroll With One Native Scene Controller

**Files:**

- Create: `app/src/lib/sceneState.ts`
- Create: `app/src/lib/sceneState.test.ts`
- Create: `app/src/components/story/StoryScrolly.tsx`
- Create: `app/src/components/story/SceneProgress.tsx`
- Create: `app/src/components/story/StoryScene.tsx`
- Modify: `app/src/App.tsx`
- Modify: `app/src/styles/base.css`
- Delete after green tests: `app/src/components/story/StoryRail.tsx`
- Delete after green tests: `app/src/components/story/BeatProgress.tsx`
- Delete after green tests: `app/src/components/story/StoryBeat.tsx`

**Interfaces:**

- Consumes: ordered scene IDs and section intersection ratios.
- Produces: `activeSceneIndex`, `jumpToScene(index)`, and one observer-confirmed state update path.

- [ ] **Step 1: Write failing pure state tests**

Use a pure chooser so observer behavior is deterministic:

```typescript
import { describe, expect, it } from "vitest";
import { pickActiveScene, sceneIndexAfterKey } from "./sceneState";

describe("scene state", () => {
  it("chooses the most visible intersecting scene", () => {
    expect(pickActiveScene([
      { index: 1, ratio: 0.42, isIntersecting: true },
      { index: 2, ratio: 0.71, isIntersecting: true },
      { index: 3, ratio: 0.88, isIntersecting: false },
    ])).toBe(2);
  });

  it("clamps keyboard navigation", () => {
    expect(sceneIndexAfterKey(0, "ArrowUp", 5)).toBe(0);
    expect(sceneIndexAfterKey(4, "PageDown", 5)).toBe(4);
    expect(sceneIndexAfterKey(2, "Home", 5)).toBe(0);
    expect(sceneIndexAfterKey(2, "End", 5)).toBe(4);
  });
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run:

```bash
npm --prefix app run test -- sceneState.test.ts
```

Expected: failure because `sceneState.ts` does not exist.

- [ ] **Step 3: Implement the pure scene helpers**

Use:

```typescript
export type SceneIntersection = {
  index: number;
  ratio: number;
  isIntersecting: boolean;
};

export function pickActiveScene(entries: SceneIntersection[]): number | null {
  const visible = entries.filter((entry) => entry.isIntersecting);
  if (!visible.length) return null;
  return visible.reduce((best, entry) => entry.ratio > best.ratio ? entry : best).index;
}

export function sceneIndexAfterKey(index: number, key: string, total: number): number {
  if (key === "Home") return 0;
  if (key === "End") return total - 1;
  if (key === "ArrowDown" || key === "PageDown") return Math.min(total - 1, index + 1);
  if (key === "ArrowUp" || key === "PageUp") return Math.max(0, index - 1);
  return index;
}
```

- [ ] **Step 4: Build the normal-document story shell**

`StoryScrolly` renders a normal `<main>` or `<section>` flow. It observes the scene sections with `root: null`; there is no `.story-rail__scroll` container and no scrollable overflow region.

Progress buttons only perform:

```typescript
document.getElementById(scene.id)?.scrollIntoView({
  behavior: reducedMotion ? "auto" : "smooth",
  block: "start",
});
```

They must not call `setActiveSceneIndex()` directly. The observer confirms the active scene. Keyboard navigation calls the same `jumpToScene()` function.

- [ ] **Step 5: Add stable mobile/desktop layout rules**

Desktop:

```css
.guided-atlas { display: grid; grid-template-columns: minmax(0, 1fr) minmax(22rem, 30rem); }
.guided-map { position: sticky; top: 0; height: 100svh; }
.story-scrolly { position: relative; }
.story-scene { min-height: 100svh; display: grid; align-items: center; padding: 12svh 2rem; }
```

Mobile:

```css
@media (max-width: 760px) {
  .guided-atlas { display: block; }
  .guided-map { position: sticky; top: 0; height: 46svh; }
  .story-scene { min-height: auto; padding: 3rem 1rem 5rem; }
}
```

Do not add a fixed bottom control until measured QA proves it cannot cover content.

- [ ] **Step 6: Remove the old nested-scroll components and stale CSS**

Run:

```bash
rg -n "StoryRail|BeatProgress|StoryBeat|story-rail__scroll|overflow-y: auto" app/src
```

Expected: no source references to deleted story components and no nested story-scroll rule.

- [ ] **Step 7: Verify navigation behavior**

Run:

```bash
npm --prefix app run test
npm --prefix app run build
```

Manual QA at `1440 × 900` and `390 × 844`:

- click each progress item and confirm no snap-back;
- scroll rapidly across two scenes and confirm the latest visible scene wins;
- use Arrow/Page/Home/End keys;
- confirm mobile scene bottoms are not hidden;
- confirm the map remains visible on first load.

- [ ] **Step 8: Review and commit**

After legal status transitions and QA notes:

```bash
git add app context
git commit -m "refactor(story): TASK-050 use native scene scrolling"
```

---

### TASK-051: Replace Seven Beats With Five Scenes And A Handoff

**Files:**

- Create: `app/src/lib/scenes.ts`
- Create: `app/src/lib/scenes.test.ts`
- Modify: `app/src/App.tsx`
- Modify: `app/src/components/story/StoryScrolly.tsx`
- Modify: `app/src/components/story/StoryScene.tsx`
- Delete: `app/src/lib/tour.ts`
- Delete: `app/src/lib/tour.test.ts`
- Delete: `app/src/components/panels/FingerprintPreview.tsx`
- Delete: `app/src/components/panels/FingerprintPreview.test.tsx`
- Modify: `context/STORY_BRIEF.md`

**Interfaces:**

- Consumes: generated map/monitoring/rank data.
- Produces: `SCENES: Scene[]` with exactly five guided scenes plus a separate handoff action.

- [ ] **Step 1: Write the story-contract test**

```typescript
import { describe, expect, it } from "vitest";
import { SCENES } from "./scenes";

describe("five-scene story", () => {
  it("uses the approved ordered scene spine", () => {
    expect(SCENES.map((scene) => scene.id)).toEqual([
      "what-the-map-can-see",
      "where-the-record-breaks",
      "the-gap-has-two-sides",
      "similar-scores-different-records",
      "the-order-does-not-hold-still",
    ]);
    expect(SCENES).toHaveLength(5);
    expect(SCENES.some((scene) => scene.id.includes("fingerprint"))).toBe(false);
    expect(SCENES.every((scene) => scene.source.length > 0)).toBe(true);
    expect(SCENES.every((scene) => scene.caveat.length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run:

```bash
npm --prefix app run test -- scenes.test.ts
```

Expected: failure because `scenes.ts` does not exist.

- [ ] **Step 3: Implement the exact scene model**

Use this public interface:

```typescript
export type SceneVisual = "presence" | "missingness" | "split" | "comparison" | "rank-bands";

export type Scene = {
  id: string;
  short: string;
  title: string;
  claim: string;
  caveat: string;
  source: string;
  visual: SceneVisual;
  state: {
    score: "gap" | "pressure" | "capacity";
    view: "default" | "coverage" | "uncertainty";
    selected: string | null;
  };
};
```

Populate claims, caveats, evidence sources, and states from `context/ARTISTIC_REDESIGN_BRIEF.md`. Keep the closing line outside `SCENES` as `HANDOFF_COPY` so progress remains five scenes.

- [ ] **Step 4: Remove guided JSD and repeated uncertainty copy**

Delete the fingerprint figure from guided rendering. JSD stays in `CountryPanel` during exploration. Scene five contains one claim and one caveat; do not render the former uncertainty callout panel inside the story scene.

Use:

```bash
rg -n "fingerprint|One more way to compare|Don't read the order|RankUncertaintyCallout" app/src/components/story app/src/lib/scenes.ts app/src/App.tsx
```

Expected: no guided fingerprint content and no duplicated uncertainty callout in the story route.

- [ ] **Step 5: Verify content and build**

Run:

```bash
npm --prefix app run test
npm --prefix app run build
```

Manual read-through must confirm:

- five scene progress labels;
- one claim/caveat/source per scene;
- `Explore freely` appears after the closing line;
- JSD remains available only after selecting a geography in explore mode.

- [ ] **Step 6: Review and commit**

```bash
git add app context
git commit -m "feat(story): TASK-051 tell the atlas in five scenes"
```

---

### TASK-052: Build The Evidence-Mark Grammar

**Files:**

- Create: `app/src/components/map/evidenceMarkModel.ts`
- Create: `app/src/components/map/evidenceMarkModel.test.ts`
- Create: `app/src/components/map/EvidenceMark.tsx`
- Create: `app/src/components/map/EvidenceMark.test.tsx`
- Modify: `app/src/components/map/AtlasMap.tsx`
- Modify: `app/src/components/map/MapLegend.tsx`
- Modify: `app/src/styles/base.css`

**Interfaces:**

- Consumes: `Geo.scoreInputPresence`, active score value, `Geo.reportingStatus`, and selection state.
- Produces: eight fixed input segments, one detached context segment, one reporting-edge style, and one quiet interaction state.

- [ ] **Step 1: Write exhaustive mark-model tests**

```typescript
import { describe, expect, it } from "vitest";
import { buildEvidenceMark } from "./evidenceMarkModel";

describe("evidence mark", () => {
  it("keeps eight stable score-input positions and separates context", () => {
    const model = buildEvidenceMark(geo, { scoreKey: "gap", selected: false });
    expect(model.inputs).toHaveLength(8);
    expect(model.inputs.filter((input) => input.present)).toHaveLength(geo.scoreInputCount);
    expect(model.context.present).toBe(geo.contextCount > 0);
    expect(model.context.kind).toBe("context-only");
  });

  it.each([
    ["reported_positive_latest_count", "solid"],
    ["reported_zero_latest_count", "open-dash"],
    ["missing_monitoring_dataset_row", "broken-dot"],
  ] as const)("maps %s to %s", (status, edge) => {
    expect(buildEvidenceMark({ ...geo, reportingStatus: status }, {
      scoreKey: "gap",
      selected: false,
    }).reportingEdge).toBe(edge);
  });
});
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

```bash
npm --prefix app run test -- evidenceMarkModel.test.ts
```

Expected: failure because the model does not exist.

- [ ] **Step 3: Implement a pure mark model**

```typescript
export type EvidenceMarkModel = {
  score: number;
  inputs: Array<ScoreInputPresence & { index: number; angle: number }>;
  context: { kind: "context-only"; present: boolean; angle: number };
  reportingEdge: "solid" | "open-dash" | "broken-dot";
  selected: boolean;
};

export function buildEvidenceMark(
  geo: Geo,
  options: { scoreKey: ScoreKey; selected: boolean },
): EvidenceMarkModel {
  return {
    score: valueForScore(geo, options.scoreKey),
    inputs: geo.scoreInputPresence.map((input, index) => ({
      ...input,
      index,
      angle: -90 + index * 45,
    })),
    context: { kind: "context-only", present: geo.contextCount > 0, angle: 112.5 },
    reportingEdge: edgeForReportingStatus(geo.reportingStatus),
    selected: options.selected,
  };
}

function edgeForReportingStatus(status: ReportingStatus): EvidenceMarkModel["reportingEdge"] {
  if (status === "reported_positive_latest_count") return "solid";
  if (status === "reported_zero_latest_count") return "open-dash";
  return "broken-dot";
}
```

- [ ] **Step 4: Render one accessible SVG component**

`EvidenceMark` receives `size`, `model`, and an accessible label. It renders:

- an inner score field;
- eight equal-position tick paths with `data-present`;
- one detached context tick with `data-kind="context-only"`;
- a reporting edge with `data-reporting-edge`;
- a selection bloom behind the data layers.

Use a single `<svg>` with `role="img"` only in portrait/legend contexts. Map instances remain decorative because the existing button/hit target owns the accessible name.

- [ ] **Step 5: Integrate marks at all 22 map anchors**

Keep MapLibre land, ocean, graticule, and camera behavior. Use the React overlay’s existing projected coordinates to place `EvidenceMark` components. Disable or hide the old MapLibre score-circle paint when the SVG mark is ready so two primary marks do not overlap.

The accessible geography button must remain at least 44px. Mark artwork may be smaller but cannot shrink by evidence count.

- [ ] **Step 6: Replace the legend with a semantic key**

The legend must demonstrate:

- inner field = active score;
- eight ticks = score inputs available;
- detached tick = responsibility context, not in score;
- solid / open-dash / broken-dot edges = reporting / reported zero / no processed row;
- pale bloom = selection.

Do not reintroduce a bubble-size legend.

- [ ] **Step 7: Run model, component, app, and build verification**

Run:

```bash
npm --prefix app run test
npm --prefix app run build
```

Manual QA all 22 marks at desktop and mobile basin views. Specifically inspect NR, TV, KI, MH, PN, AS, and WF. Confirm mark positions persist in grayscale and with the score fill temporarily hidden.

- [ ] **Step 8: Review and commit**

```bash
git add app context
git commit -m "feat(map): TASK-052 add evidence portrait marks"
```

---

### TASK-053: Build The Split And Nauru/Tuvalu Editorial Scenes

**Files:**

- Create: `app/src/components/story/PressureCapacityScene.tsx`
- Create: `app/src/components/story/EvidencePortrait.tsx`
- Create: `app/src/components/story/PlaceComparisonScene.tsx`
- Create: `app/src/components/story/storyFigures.test.tsx`
- Modify: `app/src/components/story/StoryScrolly.tsx`
- Modify: `app/src/components/map/EvidenceMark.tsx`
- Modify: `app/src/App.tsx`
- Modify: `app/src/styles/base.css`

**Interfaces:**

- Consumes: `Geo` records for all geographies, with Nauru `NR` and Tuvalu `TV` required.
- Produces: a scene-three pressure/capacity split state and a scene-four aligned two-place comparison.

- [ ] **Step 1: Write static figure tests**

```typescript
it("renders aligned Nauru and Tuvalu evidence portraits", () => {
  const html = renderToStaticMarkup(<PlaceComparisonScene nauru={nauru} tuvalu={tuvalu} />);
  expect(html).toContain("Nauru");
  expect(html).toContain("Tuvalu");
  expect(html).toContain("Reported zero");
  expect(html).toContain("Reported monitoring");
  expect(html).toContain("Score inputs");
  expect(html).toContain("Rank band");
  expect(html).not.toContain("JSD");
});

it("labels capacity as visible capacity", () => {
  const html = renderToStaticMarkup(<PressureCapacityScene geos={[nauru, tuvalu]} />);
  expect(html).toContain("Climate pressure");
  expect(html).toContain("Visible capacity");
  expect(html).not.toContain(">Adaptation readiness<");
});
```

- [ ] **Step 2: Run the figure tests and confirm failure**

Run:

```bash
npm --prefix app run test -- storyFigures.test.tsx
```

Expected: missing component failures.

- [ ] **Step 3: Build a reusable evidence portrait**

`EvidencePortrait` renders one large `EvidenceMark` plus an aligned definition list:

```typescript
type EvidencePortraitProps = {
  geo: Geo;
  emphasis?: "primary" | "secondary";
};
```

Fields in order:

1. place name;
2. gap score;
3. pressure;
4. visible capacity;
5. score inputs as `n / 8`;
6. monitoring status label;
7. rank band `min–max`.

No new computed claim is added.

- [ ] **Step 4: Build the pressure/capacity split**

Use the same inner geometry as `EvidenceMark`, with two paired arcs or lobes. The component receives scores as 0–100 and uses SVG `strokeDasharray` or path length to show magnitude. The negative space between the sides remains visible; do not use a stacked bar that hides the conceptual separation.

The accessible label format is:

```text
Nauru: climate pressure 61.6, visible capacity 26.9.
```

- [ ] **Step 5: Place the two portraits without erasing the map relationship**

During scene four, keep the map visible but subdued. Keep faint `NR` and `TV` anchor marks and leaders. Render the comparison in the scene column or an overlay region that does not cover those anchors. On mobile, render portraits as two normal-flow steps or a scroll-snap row with visible labels; do not require a hidden horizontal gesture.

- [ ] **Step 6: Verify figures and responsive layout**

Run:

```bash
npm --prefix app run test
npm --prefix app run build
```

Manual QA at `1440 × 900`, `1024 × 768`, `390 × 844`, and `360 × 800`:

- both portrait names and aligned fields visible;
- no comparison row clipped;
- monitoring states understandable without color;
- map anchors remain visible;
- no JSD or physical connector language.

- [ ] **Step 7: Review and commit**

```bash
git add app context
git commit -m "feat(story): TASK-053 compose split and place comparison scenes"
```

---

### TASK-054: Build Rank-Band Rearrangement And The Shared Motion System

**Files:**

- Create: `app/src/components/story/RankBandScene.tsx`
- Create: `app/src/components/story/rankBandModel.ts`
- Create: `app/src/components/story/rankBandModel.test.ts`
- Modify: `app/src/components/story/storyFigures.test.tsx`
- Modify: `app/src/components/story/StoryScrolly.tsx`
- Modify: `app/src/components/map/AtlasMap.tsx`
- Modify: `app/src/components/map/atlasMapModel.ts`
- Modify: `app/src/styles/base.css`

**Interfaces:**

- Consumes: `Geo.rankMin`, `Geo.rankMax`, `Geo.robustness`, current scene, and reduced-motion preference.
- Produces: rank-band rows/positions and one shared motion token set.

- [ ] **Step 1: Write interval-model tests**

```typescript
it("sorts intervals by midpoint without presenting a definitive rank", () => {
  const rows = buildRankBandRows([marshallIslands, nauru]);
  expect(rows.find((row) => row.code === "MH")).toMatchObject({
    code: "MH",
    min: 4,
    max: 19,
    span: 15,
  });
  expect(rows.map((row) => row.code)).toEqual(["NR", "MH"]);
});

it("uses static layout under reduced motion", () => {
  expect(rankBandTransition(true)).toEqual({ duration: 0, mode: "static" });
  expect(rankBandTransition(false)).toEqual({ duration: 560, mode: "rearrange" });
});
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run:

```bash
npm --prefix app run test -- rankBandModel.test.ts
```

Expected: missing model failure.

- [ ] **Step 3: Implement the interval rows**

```typescript
export type RankBandRow = {
  code: string;
  name: string;
  min: number;
  max: number;
  span: number;
  midpoint: number;
  robustness: Geo["robustness"];
  highlight: boolean;
};

export function buildRankBandRows(geos: Geo[]): RankBandRow[] {
  return geos.map((geo) => ({
    code: geo.code,
    name: geo.name,
    min: geo.rankMin,
    max: geo.rankMax,
    span: geo.rankMax - geo.rankMin,
    midpoint: (geo.rankMin + geo.rankMax) / 2,
    robustness: geo.robustness,
    highlight: geo.code === "MH",
  })).sort((a, b) => a.midpoint - b.midpoint || a.code.localeCompare(b.code));
}

export function rankBandTransition(reducedMotion: boolean): {
  duration: number;
  mode: "static" | "rearrange";
} {
  return reducedMotion
    ? { duration: 0, mode: "static" }
    : { duration: 560, mode: "rearrange" };
}
```

The visual axis runs 1–22. Use interval strokes with end caps and a small identity mark. Do not show a numbered leaderboard list as the primary structure.

- [ ] **Step 4: Define shared motion tokens**

At `:root`:

```css
--motion-ease-evidence: cubic-bezier(0.22, 1, 0.36, 1);
--motion-duration-evidence: 560ms;
```

Every scene morph uses these tokens unless the approved `TASK-049` concept records a different exact value in the allowed 450–650ms range. Use transitions only on transform, opacity, stroke, fill, and path-length properties that convey state.

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .evidence-mark *,
  .rank-band *,
  .story-scene *,
  .maplibregl-canvas {
    animation: none !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 5: Make scene transitions latest-state-wins**

Do not queue timeouts per scene. Render from current React state and CSS/SVG transitions so a rapid change updates the target immediately. Camera transitions call `map.stop()` before the next `easeTo()`.

Use camera focus only in scene four; scenes one, two, three, five, and handoff keep or restore basin framing.

- [ ] **Step 6: Add the closing return transition**

After scene five, the handoff action restores geographic mark positions and basin camera before entering explore mode. Reduced motion switches immediately. The closing line remains readable before controls expand.

- [ ] **Step 7: Verify motion and static equivalence**

Run:

```bash
npm --prefix app run test
npm --prefix app run build
```

Manual QA:

- scroll slowly through all transitions;
- scrub rapidly scene 1 → 5 → 2 and confirm no stale animation wins;
- click progress items during transitions;
- emulate reduced motion and confirm every scene remains understandable as a static figure;
- confirm scene five labels Marshall Islands 4–19 and explains that bands are sensitivity diagnostics, not confidence intervals.

- [ ] **Step 8: Review and commit**

```bash
git add app context
git commit -m "feat(motion): TASK-054 rearrange marks into rank bands"
```

---

### TASK-055: Simplify Exploration, Mobile Controls, And Selection Behavior

**Files:**

- Modify: `app/src/App.tsx`
- Modify: `app/src/components/map/AtlasMap.tsx`
- Modify: `app/src/components/map/atlasMapModel.ts`
- Modify: `app/src/components/map/atlasMapModel.test.ts`
- Modify: `app/src/components/panels/CountryPanel.tsx`
- Modify: `app/src/components/panels/CountryPanel.test.tsx`
- Modify: `app/src/components/controls/LayerControls.tsx`
- Modify: `app/src/styles/base.css`
- Delete: similarity-arc builders, layers, copy, and tests
- Modify: `context/INFORMATION_DIVERGENCE_PLAN.md`
- Modify: `context/docs/design.md`

**Interfaces:**

- Consumes: exploration layer, selected geography, viewport width, and optional outlook state.
- Produces: a quiet explore toolbar, panel-only JSD neighbors, and basin-preserving selection behavior.

- [ ] **Step 1: Turn the current arc test into a failing no-arc contract**

Replace arc-builder tests with:

```typescript
it("does not produce physical connectors for evidence-profile similarity", () => {
  const collection = buildAtlasFeatureCollection(geos, defaultOptions);
  expect(collection.features.every((feature) => feature.geometry.type === "Point")).toBe(true);
});
```

In `CountryPanel.test.tsx`, keep the nearest-neighbor list assertion so removal of map arcs cannot remove panel evidence.

- [ ] **Step 2: Run frontend tests and confirm the old arc contract fails**

Run:

```bash
npm --prefix app run test
```

Expected: old similarity-arc tests or source behavior conflict with the no-connector contract.

- [ ] **Step 3: Remove the arc source, layer, gate, limit, and caveat**

Delete:

- `buildSimilarityArcCollection()`;
- `similarityArcLimitForWidth()`;
- `shouldShowSimilarityArcs()`;
- MapLibre similarity source/layer setup;
- dashed-arc map note;
- shared panel/map neighbor limit.

Keep the full generated nearest-neighbor list in the selected-place panel. Use this exact caveat near it:

```text
Similarity describes official-data profile shape only. It does not imply physical connection,
shared risk, lived experience, or shared policy need.
```

- [ ] **Step 4: Calm selection camera behavior**

Selection in explore mode should emphasize the mark and open the panel without automatically hiding the wider Pacific. Only ease the camera when the selected mark would otherwise be obscured by the panel or outside the safe viewport. Extract and test a pure decision:

```typescript
export function shouldReframeSelection({
  pointVisible,
  pointCoveredByPanel,
}: {
  pointVisible: boolean;
  pointCoveredByPanel: boolean;
}): boolean {
  return !pointVisible || pointCoveredByPanel;
}
```

- [ ] **Step 5: Replace mobile card stack with a compact toolbar**

At widths below 760px:

- keep layer selection in one horizontally scrollable or wrap-safe toolbar no taller than 56px plus safe area;
- keep legend and methods as explicit buttons;
- open country detail in a sheet whose collapsed state does not cover the map;
- show fewer map labels by default;
- keep all touch targets at least 44px;
- prevent fixed elements from covering the last panel or story row with measured bottom padding.

- [ ] **Step 6: Verify exploration states**

Run:

```bash
npm --prefix app run test
npm --prefix app run build
```

Manual QA:

- enter explore after scene five and confirm geographic positions return;
- switch gap, pressure, capacity, coverage, uncertainty, and outlook states;
- select NR, TV, FJ, AS, WF, and MH;
- confirm JSD neighbors appear in panel only;
- confirm no line/arc layer exists;
- confirm selection does not unnecessarily zoom away from the basin;
- verify mobile toolbar, legend, methods, and sheet at 390 × 844 and 360 × 800.

- [ ] **Step 7: Run the redesign integration gate**

Run:

```bash
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
npm --prefix app run test
npm --prefix app run build
git diff --check
```

Expected: all checks pass, build exits 0, and no whitespace errors exist.

- [ ] **Step 8: Review and commit**

```bash
git add app context
git commit -m "refactor(app): TASK-055 simplify atlas exploration"
```

The commit must not contain a `Co-authored-by` trailer.
