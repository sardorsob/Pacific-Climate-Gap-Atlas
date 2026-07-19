# Reversible Explorer UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended when independent review capacity exists) or `superpowers:executing-plans` to implement this plan task by task. Use `superpowers:test-driven-development` for every behavior change and `superpowers:verification-before-completion` before every commit.

**Goal:** Make the accepted Explorer easy to enter, navigate backward, close, and use at narrow widths while continuing the reviewed regional evidence story inside selected-place detail.

**Architecture:** Keep the existing React state and dependency-free URL adapter. Add one shared panel-navigation component, make dismissal a history replacement, restack the existing control groups at narrow widths, and render already-generated `Geo.regionalStory` values in `CountryPanel`. No router, reducer, state manager, chart library, data pipeline, renderer, or design-system change is permitted.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, React server rendering tests, MapLibre GL, Lucide React, the existing CSS/token system, and the current Python/Node validation scripts.

## Global Constraints

- Preserve the approved palette, typography, MapLibre map, evidence marks, story scenes, fullscreen composition, panels, source/method drawer, and interaction language.
- Use the current `viewMode`, `selectedCode`, `sheetExpanded`, `currentUrlState`, and `commitUrlState` seams. Do not add parallel navigation state.
- Keep evidence-view entry and ordinary place selection as `pushState`. Use `replaceState` for diagnostic child selection, Back-within-panel, and Close dismissal.
- Do not change any source data, score, candidate-data processing, JSON schema, map geometry, or scientific claim.
- Keep water and renewable measures on separate year windows and preserve `null` as unavailable, never zero or no change.
- Keep dataset presence distinct from quality, completeness, preparedness, vulnerability, need, condition, or local knowledge.
- Use failing tests before production edits. Keep tests close to existing SSR/source-test patterns rather than adding a DOM-test dependency.
- Run focused tests after each red/green cycle, then the full frontend/build/budget/context gates before each task commit.
- Commit each task separately with the specified subject and no `Co-authored-by` trailer. Do not push without a separate explicit owner request.
- QA must use quiet/headless or in-app inspection. Do not open visible external Brave or Chrome tabs in front of the owner.

## File Structure

### New files

- `app/src/components/panels/ExplorerPanelNav.tsx`: shared panel Back/Close/expand row and its tiny presentation model.
- `app/src/components/panels/ExplorerPanelNav.test.tsx`: SSR tests for diagnostic root, diagnostic child, and ordinary detail states.
- `app/src/components/controls/LayerControls.test.tsx`: SSR/source contract for complete score and evidence-view groups.
- `artifacts/design/task-082/`: settled QA screenshots only.
- `artifacts/provenance/task_082_qa.json`: exact state, viewport, evidence, accessibility, and gate results.

### Existing files with bounded edits

- `app/src/App.tsx`: owns state transitions, history method, shared panel-nav wiring, and temporary-copy removal.
- `app/src/App.test.tsx`: interaction/source contract for Back, Close, and history replacement.
- `app/src/components/panels/CountryPanel.tsx`: loses local Close ownership and gains the regional-record summary.
- `app/src/components/panels/CountryPanel.test.tsx`: complete/incomplete/visibility evidence tests.
- `app/src/components/controls/LayerControls.tsx`: semantic grouping and shorter visible mobile labels with full accessible names.
- `app/src/components/story/StoryScrolly.tsx`: intrinsic handoff action and plain label.
- `app/src/components/story/StoryScrolly.test.tsx`: handoff label/class contract.
- `app/src/styles/base.css`: shared panel-nav, handoff action, responsive control rows, and place-summary styles using existing tokens.
- `app/src/lib/urlState.test.ts`: direct child URL and canonical serialization regression coverage only if existing coverage does not already prove it.
- Existing context ledgers: status, QA evidence, handoff, and release truth after review.

---

## Task 079 (TASK-079): Reversible Panel Navigation And URL Dismissal

### Step 1: Record the exact state matrix in failing tests

Create `app/src/components/panels/ExplorerPanelNav.test.tsx` and render the component with `renderToStaticMarkup`.

Cover these states:

```tsx
it("shows Close only for a diagnostic root", () => {
  const html = renderToStaticMarkup(
    <ExplorerPanelNav
      title="Data coverage"
      expanded
      onClose={() => undefined}
      onToggleExpanded={() => undefined}
    />,
  );

  expect(html).toContain("Close");
  expect(html).not.toContain("Back to");
});

it("adds a contextual Back action for a diagnostic child", () => {
  const html = renderToStaticMarkup(
    <ExplorerPanelNav
      title="Nauru"
      backLabel="Back to data coverage"
      expanded
      onBack={() => undefined}
      onClose={() => undefined}
      onToggleExpanded={() => undefined}
    />,
  );

  expect(html).toContain("Back to data coverage");
  expect(html).toContain("Close");
});
```

Add a third case proving ordinary selected-place detail has Close but no Back. Assert `aria-label="Panel navigation"`, `aria-expanded`, and explicit button labels. Do not test Lucide SVG markup.

In `app/src/App.test.tsx`, add source-level regression assertions that:

- diagnostic child selection retains `viewMode` and commits with `replaceState`;
- panel Back clears only `place`, retains `viewMode`, and commits with `replaceState`;
- Close clears `place`, maps diagnostic parents to `overview`, and commits with `replaceState`;
- `CountryPanel` no longer receives an `onClose` prop;
- ordinary selection and evidence-view entry remain `pushState`.

Run the focused tests and confirm they fail because the component and new transition contract do not yet exist:

```bash
npm --prefix app run test -- ExplorerPanelNav.test.tsx App.test.tsx CountryPanel.test.tsx urlState.test.ts
```

### Step 2: Add the smallest shared navigation component

Create `ExplorerPanelNav.tsx` with this public contract:

```ts
type ExplorerPanelNavProps = {
  title: string;
  backLabel?: string;
  expanded: boolean;
  onBack?: () => void;
  onClose: () => void;
  onToggleExpanded: () => void;
};
```

Render one `<nav aria-label="Panel navigation">` containing:

- an optional labelled Back button;
- a mobile expand/collapse button with `aria-expanded` and the current panel title;
- a visible labelled Close button.

Use `ArrowLeft`, `ChevronUp`, and `X` from the already-installed Lucide package. On desktop, show the title as text and hide only the expand affordance; on mobile, the same row replaces the current separate 50px handle. Every button keeps a 44px minimum target. Do not create separate desktop and mobile components.

Remove the `X` import, `onClose` prop, and local close button from `CountryPanel`. Its header continues to own place identity only.

Run the component tests until green:

```bash
npm --prefix app run test -- ExplorerPanelNav.test.tsx CountryPanel.test.tsx
```

### Step 3: Wire state without a new state machine

In `App.tsx`, derive the contextual parent from existing state:

```ts
const diagnosticParent =
  selectedGeo && (viewMode === "coverage" || viewMode === "uncertainty")
    ? viewMode
    : null;
```

Add two handlers with distinct semantics:

```ts
const returnToDiagnostic = () => {
  setSelectedCode(null);
  setSheetExpanded(true);
  commitUrlState("replaceState", { place: null, view: viewMode });
};

const dismissPanel = () => {
  const nextView =
    viewMode === "coverage" || viewMode === "uncertainty"
      ? "overview"
      : viewMode;
  setSelectedCode(null);
  setSheetExpanded(false);
  setViewMode(nextView);
  commitUrlState("replaceState", {
    place: null,
    view: nextView,
    outlook: nextView === "overview" ? false : outlookOn,
  });
};
```

Update `handleSelect` so an ordinary map selection pushes history while a selection made inside `coverage` or `uncertainty` replaces the current diagnostic-root entry:

```ts
const diagnosticView = viewMode === "coverage" || viewMode === "uncertainty";
commitUrlState(diagnosticView ? "replaceState" : "pushState", { place: code });
```

This distinction is required: if diagnostic child selection pushed a second entry, replacing only the child on Close would still leave the diagnostic root immediately behind it and browser Back would reopen the dismissed path.

If live testing exposes outlook state during an ordinary selected-place close, preserve it exactly; the handler must not silently toggle an unrelated layer.

Render `ExplorerPanelNav` once above `panel-dock__body`. Use these labels:

- `Back to data coverage` for `coverage` children;
- `Back to rank ranges` for `uncertainty` children;
- the selected geography name for detail title;
- `Data coverage` and `Rank ranges` for diagnostic roots.

Remove the old `panel-dock__handle`. Keep `sheetExpanded` as the sole expand/collapse state.

For focus restoration, use existing controls instead of a new focus manager:

- Back should leave focus on the newly rendered panel-navigation row or its Close control;
- Close should restore focus to the matching active evidence control when closing a diagnostic path, or the selected map button (`.map-a11y-point[aria-pressed="true"]`) before selection state is cleared when available;
- if neither opener is available, focus the map region's first selectable geography.

Implement this with a small ref/helper in `App.tsx`; do not add a library or global focus registry.

### Step 4: Make the navigation row sticky and responsive

In `base.css`:

- make `.panel-dock` a column container and move scrolling to `.panel-dock__body`;
- keep `.panel-nav` sticky at the top with the existing `--paper`, `--line`, and focus tokens;
- show Back and Close labels, not icon-only controls;
- hide `.panel-nav__toggle` on desktop and show it on mobile;
- when the mobile sheet is collapsed, keep the navigation row visible so Close and expand remain available;
- preserve the existing sheet height, rounded corners, shadow, and reduced-motion transition behavior.

Do not change the panel width, map palette, or content typography.

### Step 5: Prove URL and interaction behavior

Run:

```bash
npm --prefix app run test -- ExplorerPanelNav.test.tsx CountryPanel.test.tsx App.test.tsx urlState.test.ts
npm --prefix app run test
npm --prefix app run build
python scripts/check_app_bundle_budget.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
git diff --check
```

Quietly inspect:

1. overview -> place -> Close;
2. Data coverage -> place -> Back -> Close;
3. Rank ranges -> place -> Back -> Close;
4. copied `mode=explore&view=coverage&place=...` URL -> Back;
5. browser Back after each Close;
6. keyboard-only and collapsed/expanded mobile sheet.

Record exact results in TASK-079. Move `pending -> in-progress -> in-review -> done` only after independent state review. Commit:

```bash
git commit -m "feat(app): TASK-079 add reversible panel navigation"
```

---

## Task 080 (TASK-080): Handoff And Responsive Control Hierarchy

### Step 1: Write failing handoff and control-group tests

Extend `StoryScrolly.test.tsx` to require:

- visible text `Explore the map`;
- a dedicated `story-handoff__action` class;
- absence of `Explore freely` from the button.

Create `LayerControls.test.tsx` and render the component with the existing three layers. Assert:

- the score layer is one labelled group with three buttons;
- the evidence views are one labelled group with three buttons;
- visible labels are `Data coverage`, `Rank ranges`, and `2030 stress test`;
- full accessible names explain data quiet, rank uncertainty, and forecast caveat;
- all buttons preserve `aria-pressed` behavior.

Extend `App.test.tsx` to reject `Concept for review` and `map-header__concept`.

Run and observe the expected failures:

```bash
npm --prefix app run test -- StoryScrolly.test.tsx LayerControls.test.tsx App.test.tsx
```

### Step 2: Repair the handoff action and temporary chrome

In `StoryScrolly.tsx`, change only the action label and modifier class:

```tsx
<button
  type="button"
  className="ghost-btn ghost-btn--accent story-handoff__action"
  onClick={onExplore}
>
  Explore the map
</button>
```

In `base.css`, add:

```css
.story-handoff__action {
  justify-self: start;
  width: fit-content;
  min-height: 44px;
}
```

Remove the temporary concept paragraph from `App.tsx`, the temporary hint from the empty `CountryPanel`, and their now-unused CSS selectors. Do not rewrite the accepted story or permanent caveats.

### Step 3: Give the evidence actions a real sibling group

In `LayerControls.tsx`:

- keep the score group and its caveat unchanged on desktop;
- label the second group `Evidence views`;
- wrap its three buttons in `controls__segment controls__segment--views`;
- use the concise visible labels `Data coverage`, `Rank ranges`, and `2030 stress test`;
- put the full current meaning in `aria-label` and keep descriptive `title` text when useful;
- do not change callbacks, `ViewMode`, outlook logic, or scientific caveats.

Do not introduce viewport detection in React. CSS owns the sibling layouts.

### Step 4: Replace mobile overflow with two sibling layouts

Keep the existing desktop CSS above 880px.

For portrait at `max-width: 880px`:

- set the control dock height to two 44px rows plus the existing compact gaps/padding;
- render `.controls` as a two-row grid with `overflow: visible`;
- make both `.controls__segment` groups three equal columns;
- keep score and evidence headings/caveats visually hidden but retain group labels in the accessibility tree;
- allow compact two-line visible text only when it remains within the 44px target and does not overlap;
- move the legend/panel offsets only by the measured amount needed to avoid collision.

For landscape at `max-width: 880px` and `orientation: landscape`:

- use one compact six-action row;
- keep all actions visible without horizontal scrolling;
- retain full accessible names even when visible labels are shortened;
- verify the map remains the dominant surface at 844x390.

Do not add JavaScript breakpoint state or duplicate button markup.

### Step 5: Verify and commit

Run:

```bash
npm --prefix app run test -- StoryScrolly.test.tsx LayerControls.test.tsx App.test.tsx
npm --prefix app run test
npm --prefix app run build
python scripts/check_app_bundle_budget.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
git diff --check
```

Quietly inspect 1440x900, 1024x768, 430x932, 390x844, 360x800, and 844x390. Measure `scrollWidth === clientWidth` for the primary control region and at least 44px target height. Inspect panel open/collapsed, legend open, 200% zoom, keyboard focus, and reduced motion.

Record results in TASK-080 and move through legal statuses only after accessibility review. Commit:

```bash
git commit -m "fix(app): TASK-080 repair explorer control hierarchy"
```

---

## Task 081 (TASK-081): Regional Evidence In Selected-Place Detail

### Step 1: Expand the panel fixtures and write failing evidence tests

Update the existing `CountryPanel.test.tsx` fixture so `regionalStory.visibility` contains 14 ordered cells and complete water/renewable values.

Add tests for:

1. a complete place with positive water and negative renewable change;
2. an incomplete place with a `null` water or renewable change;
3. represented-dataset counts at the observed low/high extremes;
4. caveat language and reading order before the optional score.

Expected contracts:

```ts
expect(html).toContain("+1.92 percentage points");
expect(html).toContain("2010 to 2022");
expect(html).toContain("−3.79 percentage points");
expect(html).toContain("12 of 14 represented datasets");
expect(html).toContain("Unavailable for a comparable period");
expect(html.indexOf("Regional record")).toBeLessThan(html.indexOf("/100 gap"));
```

Use the fixture's actual numbers rather than the sample values if they differ. Require the caveat to include different clocks, descriptive/non-causal, and presence-not-preparedness semantics.

Run:

```bash
npm --prefix app run test -- CountryPanel.test.tsx atlasData.test.ts
```

Confirm the new panel tests fail while the existing data adapter tests remain green.

### Step 2: Add local formatting helpers, not a new utility layer

Keep the formatting in `CountryPanel.tsx` because it has one consumer:

```ts
function signedPercentagePoints(value: number): string {
  if (Object.is(value, -0) || value === 0) return "0.00 percentage points";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(2)} percentage points`;
}

function representedDatasetCount(geo: Geo): number {
  return geo.regionalStory.visibility.filter((position) => position.present).length;
}
```

Render a small `RegionalRecordSummary` inside the same file unless the JSX becomes harder to scan than the current panel. Do not create a general formatting module, hook, chart, or new data model.

### Step 3: Render the regional-record section first

Place the section after geography identity/story label and before `score-block`.

Show:

- `Drinking water`: signed change and `{firstYear} to {latestYear}`;
- `Renewable energy share`: signed change and its own years;
- explicit `Unavailable for a comparable period` for null values;
- `{represented} of 14 represented datasets`;
- one adjacent caveat: endpoints use different clocks; this is a descriptive, non-causal comparison; presence does not establish quality, completeness, preparedness, vulnerability, need, condition, or local knowledge.

Use semantic headings and ordinary text, not a chart. Preserve the existing score, evidence strip, pillars, trace, JSD neighbors, and methodology control below it.

Add only bounded styles under the existing panel section: two compact measure rows, tabular numerals, quiet year text, and the current caveat surface/token. Let rows stack naturally on mobile; do not set a fixed panel height.

### Step 4: Trace representative records and verify

Compare the generated JSON and rendered markup for:

- one water-up/renewable-down place;
- one water-down/renewable-up place;
- Guam, Pitcairn, or Tokelau as incomplete;
- one 6/14 visibility record;
- one 14/14 visibility record.

Run:

```bash
npm --prefix app run test -- CountryPanel.test.tsx atlasData.test.ts
npm --prefix app run test
npm --prefix app run build
python scripts/validate_data_contracts.py
python scripts/check_app_bundle_budget.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
git diff --check
```

Quietly inspect desktop, 390x844, 844x390, keyboard order, 200% zoom, and a collapsed/expanded sheet. Record exact source values and results in TASK-081. Move through legal statuses only after scientific/copy review. Commit:

```bash
git commit -m "feat(app): TASK-081 add regional evidence to place detail"
```

---

## Task 082 (TASK-082): Independent UX, Evidence, And Release QA

### Step 1: Freeze scope and begin read-only

Record the reviewed TASK-079 through TASK-081 commit hashes before inspection. Do not edit production code in TASK-082. If QA finds a defect:

1. record it against its owning task;
2. move that task through a legal repair transition;
3. write a failing regression test there;
4. amend or commit the repair under the owning task;
5. restart the affected QA slice.

### Step 2: Run the automated release gates

Run and record exact counts/bytes/findings, including pre-existing failures:

```bash
python -m unittest discover -s tests -t . -v
python scripts/validate_data_contracts.py
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
ruff check analysis scripts tests
python -m compileall -q analysis scripts tests
npm --prefix app run test
npm --prefix app run build
python scripts/check_app_bundle_budget.py
semgrep scan --config auto
osv-scanner scan source -r .
git diff --check
```

Do not describe Ruff, Semgrep, or OSV findings as resolved unless TASK-057 has actually fixed and reverified them.

### Step 3: Verify the state and history matrix

Capture exact URL, visible panel title/actions, and result after each step:

| Start | Action | Required result |
| --- | --- | --- |
| Overview | Select place -> Close | Selection clears; overview remains; browser Back does not reopen detail |
| Score layer | Select place -> Close | Selection clears; chosen score remains |
| Data coverage root | Close | Neutral overview |
| Data coverage root | Select place -> Back | Data coverage parent restored |
| Data coverage child | Close | Neutral overview |
| Rank ranges root | Close | Neutral overview |
| Rank ranges root | Select place -> Back | Rank ranges parent restored |
| Rank ranges child | Close | Neutral overview |
| Copied diagnostic-child URL | Reload -> Back | Exact parent restored without error |
| Any valid path | Browser Back/Forward | Deterministic state; no loop or stale reopened dismissal |

Repeat rapid Back/Close and expand/collapse input. Verify focus location after Back and Close with keyboard only.

### Step 4: Verify responsive, accessibility, and failure states

Use the established seven viewports:

- 1440x900
- 1280x800
- 1024x768
- 430x932
- 390x844
- 360x800
- 844x390

For each, capture neutral Explore, controls, diagnostic root, diagnostic child, selected-place summary, and handoff where relevant. Measure page and control-region overflow. Verify:

- all six primary controls are visible;
- handoff action is content-width and at least 44px high;
- panel Back/Close/expand controls are visible and at least 44px;
- no action or evidence row is covered by the panel, legend, safe area, or viewport edge;
- keyboard focus is visible and follows reading order;
- 200% zoom/reflow preserves controls and evidence;
- reduced motion removes transition duration without removing state;
- color-deficiency rendering retains non-color distinctions;
- offline/generated-data error remains an explicit alert;
- source/method access remains reachable.

Use quiet/headless or in-app browser tooling only. Do not launch or foreground external Brave/Chrome windows.

### Step 5: Verify the evidence trace and cold read

Trace source JSON -> `atlasData.ts` -> rendered panel for PG, WS, MH, NR, GU, PN, and TK, covering positive, negative, incomplete, and visibility-extreme records. Record exact values and confirm:

- signed percentage-point changes and years match;
- null remains unavailable;
- represented counts derive from 14 ordered positions;
- different clocks remain visible;
- no causal, quality, preparedness, vulnerability, need, condition, forecast, boundary, or local-knowledge claim appears.

Ask a cold reader to state the handoff and selected-place meaning without methodology help. The acceptable paraphrase is: the regional story can be explored place by place, but the measures use different periods and official-data presence limits what can responsibly be compared.

### Step 6: Record evidence, reconcile readiness, and commit

Create `artifacts/provenance/task_082_qa.json` with:

- commit hashes;
- automated command, exit status, counts, bytes, and findings;
- state/history matrix;
- viewport measurements and screenshot paths;
- accessibility/reduced-motion/offline results;
- source-to-panel values;
- defects returned to owning tasks;
- owner decision;
- truthful TASK-057 relationship.

Update existing context/log files only. Do not create a Markdown file per QA slice.

TASK-082 may move `pending -> in-progress -> in-review -> done` only after its product contract passes and the owner accepts the matrix. TASK-057 remains `needs-fix` until its pre-existing Ruff, Semgrep, and OSV release findings are separately handled and reverified.

Commit:

```bash
git commit -m "test(qa): TASK-082 verify explorer UX repair"
```

## Completion Boundary

This batch is complete when TASK-079 through TASK-082 are done, the owner accepts the Explorer QA matrix, and the existing visual/scientific contracts remain intact. It does not itself claim deployment, submission, or resolution of TASK-057's pre-existing release findings.
