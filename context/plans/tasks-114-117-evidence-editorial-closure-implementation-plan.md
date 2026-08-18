# Evidence-Editorial Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` task by task. Use `superpowers:test-driven-development` before every behavior change, `ponytail:ponytail` before widening scope, and `superpowers:verification-before-completion` before every review handoff or commit.

**Goal:** Connect the accepted regional story to selected-place exploration with one evidence-bound reading, make the existing lens easy to enter and decode, conclude the guided story honestly, and preserve name-based place entry as a separate design-only host decision whose runtime implementation remains post-QA.

**Architecture:** Reuse the current React/Vite application and loaded `Geo[]`. TASK-114 changes one `CountryPanel` sentence through a private deterministic helper. TASK-115 changes only the `RegionalPositionLens` entry markup and scoped CSS. TASK-116 changes one existing handoff constant. These three tasks are the release-critical implementation. The original plan placed design-only TASK-117 after release QA because neutral Explore does not mount the empty `CountryPanel`. The owner's later sequence completed that host decision before the held TASK-110/TASK-100 gates without shipping a name-based control; TASK-118 is the separate runtime implementation and remains after those gates. No data export, model output, route, state machine, renderer, dependency, font payload, visualization family, or dashboard shell is added.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, React server-rendering tests, current MapLibre shell, existing CSS/token system, cached quiet/headless browser workflow, and current Python/Node repository validators.

**Approved concept:** `artifacts/design/task-113/desktop-panel-concept.png` and `artifacts/design/task-113/mobile-panel-concept.png`. These are semantic composition references only. The running application is authoritative for palette, type metrics, components, data, marks, plots, controls, and interaction.

## Dependency And Commit Map

```text
TASK-113 owner approval
├── TASK-114 selected-place reading
│   └── TASK-115 lens entry hierarchy
│       └── TASK-110 attempt 2 (existing owner-gated lens QA)
└── TASK-116 guided ending

Original sequence (superseded for the design gate only):
TASK-095 owner gate + TASK-110 + TASK-116
└── TASK-100 existing frozen release QA
    └── TASK-117 reachable name-entry host design

Later owner sequence (executed/current):
TASK-116
└── TASK-117 reachable name-entry host design (complete; no runtime change)

TASK-095 owner gate + TASK-110
└── TASK-100 existing frozen release QA
    └── TASK-118 approved name-entry implementation (pending)
```

- TASK-114 and TASK-115 are sequential because they share the panel hierarchy and `CountryPanel.test.tsx`.
- TASK-116 is code-independent and may run in an isolated worktree in parallel with TASK-114/TASK-115 after TASK-113 owner approval. The Orchestrator must serialize task-ledger/log edits and the final commit boundary.
- The original sequence began TASK-117 only after TASK-100. The owner's later instruction superseded that timing for the design gate only: TASK-117 is complete and non-blocking, changed no runtime, and TASK-118 remains the sole implementation task after held TASK-110/TASK-100. The accepted direction may not add a chooser to the unmounted `CountryPanel` null branch or broaden `panelOpen` outside TASK-118.
- Every task receives its own independent review and commit with no `Co-authored-by` trailer. Do not push without a separate owner request.

## Global Constraints

- Preserve the current Night Watch palette, graphite/mineral surfaces, system-sans/Georgia roles, map, 22 marks, three regional-position plots, selected-ring semantics, inspector behavior, Methods, sources, optional score/JSD sections, controls, URL/history behavior, and Explore transition.
- Keep the 24px selected values and every plot viewBox, visible coordinate, scale, group, clock, mark, interaction band, live-region behavior, and null/zero distinction unless a task explicitly says otherwise. These tasks do not.
- Derive regional direction counts from loaded `Geo[]`; do not hardcode `7/6/3/3` in production, add a per-place prose table, or create a new data/model layer.
- Treat water and renewable records as separate first-to-latest comparisons with potentially different clocks. Do not say trajectory, progress, decline, trend, cause, shared period, best/worst, preparedness, need, quality, vulnerability, or rank.
- Dataset visibility remains the existing 14-position presence record. Do not add a second gaps-only chart or claim that absence measures conditions, local knowledge, infrastructure, or need.
- Add no `@font-face`, remote font, self-hosted font payload, global font-variable change, highlight card, chapter rail, colored KPI, custom select/menu, search library, clipboard flow, or fifth story scene.
- Use strict RED -> mutation check -> GREEN. Keep tests close to existing SSR/source-contract patterns; add no DOM-test or visual-regression dependency.
- After each task, run focused tests, full frontend tests, production build, internal bundle diagnostic, task validation, secret scan, and whitespace. Run data validation only if a diff unexpectedly touches data; the expected result is no data diff.
- Browser QA must be quiet/headless or in-app. Do not open visible external Brave or Chrome tabs in front of the owner.
- Do not treat the internal 97,500-byte CSS / 1,050,000-byte JavaScript diagnostics as Challenge rules. Prefer deletion/reuse when it improves clarity, but do not obscure or weaken the product to chase bytes.

## Protected Baseline Before Production Work

Before TASK-114 starts:

```bash
git status --short
python scripts/validate_task_statuses.py
npm --prefix app run test -- CountryPanel.test.tsx RegionalPositionLens.test.tsx StoryScrolly.test.tsx App.test.tsx
npm --prefix app run build
python scripts/check_app_bundle_budget.py
```

Record the exact commit and bundle measurements in TASK-114's start note. If TASK-113 is still `in-review`, stop: production remains frozen until the owner approves both concepts and the contract.

---

## TASK-114: Replace The Modeled Gap Sentence With A Regional Record Reading

### Step 1: Pin the five meaning states in failing tests

In `app/src/components/panels/CountryPanel.test.tsx`, add small `Geo` fixtures for:

- `both_up`;
- `both_down`;
- `water_up_renewable_down`;
- `water_down_renewable_up`;
- `missing_overlap`.
- one `completeOverlap: true` record with an unknown quadrant for the neutral fallback;
- a one-record collection to prove singular noun grammar.

Use deliberately non-production counts in at least one fixture collection so tests prove the sentence is derived from `geos`, not copied from the known `7/6/3/3` totals.

Expected grammar:

```text
For Nauru, both measures increased between their first and latest available records. That combination appears in 6 of the 19 complete comparisons.

For Kiribati, safely managed drinking-water access increased between its first and latest available records, while renewable-energy share decreased. That combination appears in 7 of the 19 complete comparisons.

Guam is not included in the four-direction comparison because one or both measures lack comparable first-to-latest records. Three of the 22 places have an incomplete comparison.
```

Use the analogous direct templates for both down and water down / renewable up. Assert the former fixture `storyLabel` does not render in the prominent `panel__story` seam. Keep one order assertion proving the new sentence remains after place identity and before `RegionalPositionLens`.

Run RED:

```bash
npm --prefix app run test -- CountryPanel.test.tsx
```

The expected failure is old `geo.storyLabel` output and missing templates. Existing lens/score/source/JSD assertions must remain green.

### Step 2: Add one private deterministic helper

In `CountryPanel.tsx`, add no exported type or new file. Keep one small switch over the four reviewed direction strings plus an honest default; use `regionalStory.completeOverlap` directly for availability.

Implementation shape:

```ts
function regionalRecordReading(geo: Geo, geos: Geo[]): string {
  const complete = geos.filter((item) => item.regionalStory.completeOverlap);
  const incompleteCount = geos.length - complete.length;
  const matchingCount = complete.filter(
    (item) => item.regionalStory.quadrant === geo.regionalStory.quadrant,
  ).length;
  // Switch on geo.regionalStory.quadrant and interpolate live counts.
}
```

Use `completeOverlap` as the availability contract. If the selected record is complete but its quadrant is unknown, state that both measures are available but the direction combination is unavailable in this view; do not reclassify it as incomplete. Use a tiny noun helper or grammar-neutral sentence so one comparison/place does not render with a plural noun. Do not infer direction from numeric signs again: `regionalStory.quadrant` is the existing reviewed classification. Do not mutate or sort `geos`.

Replace only:

```tsx
<p className="panel__story">{geo.storyLabel}</p>
```

with the helper result. Retain `Geo.storyLabel` in the data adapter and type because other consumers may use it.

### Step 3: Prove derivation and restraint

Run GREEN, then make two temporary mutations one at a time:

1. change one direction verb (`increased` -> `decreased`);
2. replace the live quadrant count with a constant.

Each must fail its focused assertion. Restore production after each mutation and rerun:

```bash
npm --prefix app run test -- CountryPanel.test.tsx RegionalPositionLens.test.tsx publicCopy.test.tsx
```

Search the changed source for prohibited language:

```bash
rg -n 'trajectory|progress|decline|best|worst|rank|prepared|vulnerab|caus|typical|shared clock' app/src/components/panels/CountryPanel.tsx
```

The command may find existing caveat terms outside the new helper; inspect occurrences rather than deleting scientifically required text.

### Step 4: Quiet visual and source-to-render QA

Inspect one loaded place from every complete quadrant and one incomplete place at 1440x900 and 390x844. Record:

- source code/name/quadrant;
- complete and quadrant counts from loaded data;
- exact rendered sentence;
- sentence wrap/height;
- lens, caveat, source action, and score still in the same order;
- zero document/panel horizontal overflow;
- unchanged URL, selected code, map camera, and interaction state.

Do not style the sentence in this task unless an existing regression is reproduced; TASK-115 owns the hierarchy around it.

### Step 5: Verify, independently review, and commit

```bash
npm --prefix app run test -- CountryPanel.test.tsx RegionalPositionLens.test.tsx publicCopy.test.tsx
npm --prefix app run test
npm --prefix app run build
python scripts/check_app_bundle_budget.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
git diff --check
```

Move TASK-114 through `pending -> in-progress -> in-review -> done` only after independent scientific/content review. Commit subject:

```text
feat(app): TASK-114 add regional place readings
```

---

## TASK-115: Give The Regional Lens An Editorial Entry Point

### Step 1: Write focused hierarchy and scope failures

In `RegionalPositionLens.test.tsx` and the bounded `CountryPanel.test.tsx` order assertions, require:

- visible kicker `Regional position`;
- one h2 with `[place] in the Pacific record` and the existing heading ID;
- visible text `Ring marks [place]`;
- one decorative ring element with `aria-hidden="true"`;
- a centered `min(100%, 320px)` intro column matching the three measure columns;
- `--ink-soft` kicker treatment with teal reserved for the ring;
- the heading and key before all three metric sections;
- semibold system-sans metric-title styling;
- selected values still 24px sans;
- current SVG viewBoxes, hit rectangles, zero/median/cursor/selection hooks, and mark counts unchanged;
- no retired `Where [place] sits in the Pacific` heading;
- no `@font-face`, remote font URL, local global-font-token change, highlight/card/rail/divider class, or new wrapper surface.

Run RED:

```bash
npm --prefix app run test -- RegionalPositionLens.test.tsx CountryPanel.test.tsx
```

### Step 2: Add the smallest semantic markup

In `RegionalPositionLens.tsx`, replace only the current h2 entry with:

```tsx
<header className="regional-lens__intro">
  <p className="regional-lens__kicker">Regional position</p>
  <h2 className="regional-lens__heading" id="regional-position-heading">
    {geo.name} in the Pacific record
  </h2>
  <p className="regional-lens__key">
    <span className="regional-lens__key-ring" aria-hidden="true" />
    Ring marks {geo.name}
  </p>
</header>
```

The exact element around the decorative ring may change if a simpler valid span works, but the h2/id/visible text/aria semantics are locked. Do not change `buildRegionalPositionModel`, strip order, inspection state, SVGs, or plot labels.

### Step 3: Scope the type and spacing to the existing lens

In the current regional-lens section of `base.css`:

- add `.regional-lens__intro` to the existing centered `min(100%, 320px)` column contract (or apply the equivalent scoped declarations directly);
- use approximately 10px uppercase/letter-spaced system sans for the kicker with `var(--ink-soft)`, never teal;
- use approximately 16–17px Georgia/600, sentence case, for the lens h2;
- use approximately 10–11px system sans for the ring key;
- draw the key ring with the existing teal selected stroke, no fill, glow, shadow, or animation; use a wrapping flex/inline-flex key so the ring remains beside **Ring marks** on the first line;
- set only `.regional-lens__title` to semibold system sans as an evidence-label role;
- preserve the 24px value, centered 320px measure column, accepted gaps unless the new intro needs one measured local adjustment, and all current mobile rules;
- add no new breakpoint, global type token, background, border/divider rail, card, badge, or color role.

Ponytail checkpoint: the five bounded hooks in the sample (`intro`, `kicker`, `heading`, `key`, `key-ring`) are the ceiling. Prefer child selectors before adding another class. Do not create a shared typography component or token system for this one lens.

### Step 4: Mutation and responsive proof

Temporarily remove `Ring marks` and change the heading back to the retired wording; each mutation must fail the focused test. Restore and rerun GREEN.

Quietly capture and measure Nauru plus **Federated States of Micronesia** at:

- 1440x900;
- 390x844;
- 844x390;
- 320x568;
- effective 200% reflow.

Record heading/key wraps, metric/value computed styles, panel/document overflow, plot boxes/viewBoxes/selected centers, interaction-band heights, contrast, grayscale/deuteranopia recognition, and focus order. The intro should orient without outshouting the first 24px value. Natural two- or three-line long-name wrapping is acceptable; do not truncate, force `nowrap`, move the key beside the heading, or shrink below the approved 16px floor.

### Step 5: Verify, independently review, and commit

```bash
npm --prefix app run test -- RegionalPositionLens.test.tsx CountryPanel.test.tsx regionalPositionModel.test.ts
npm --prefix app run test
npm --prefix app run build
python scripts/check_app_bundle_budget.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
git diff --check
```

Move TASK-115 through legal statuses only after independent visualization/accessibility review. Commit subject:

```text
feat(app): TASK-115 clarify lens entry hierarchy
```

After TASK-115 closes, the existing TASK-110 may begin attempt 2 (`needs-fix -> in-progress`) against the final selected-panel state.

---

## TASK-116: End The Guided Story With The Finding And Its Boundary

### Step 1: Pin exact copy and unchanged behavior in RED

In `app/src/lib/scenes.test.ts`, require the exact new handoff:

```text
The records for these 22 places do not show one shared direction of change, and they do not cover every place evenly. This atlas compares official records; it does not rank need, readiness, or vulnerability.
```

Also assert in `scenes.test.ts`:

- old `Select a place to inspect...` copy is absent;
- `SCENES` still contains the exact four IDs in the same order;
- the four scene IDs/order and neutral states remain exact.

Keep `StoryScrolly.test.tsx` on the component's supplied `handoffCopy` rendering plus `data-story-handoff="true"` and unchanged `Explore the map` action. Keep the existing callback and neutral Explore state contract in `App.test.tsx`; do not expect changing `HANDOFF_COPY` to alter the test fixture's deliberate `handoffCopy: "Explore freely"` prop.

Run RED:

```bash
npm --prefix app run test -- scenes.test.ts StoryScrolly.test.tsx App.test.tsx
```

### Step 2: Change only the existing constant

In `app/src/lib/scenes.ts`, replace the `HANDOFF_COPY` string. Do not edit `SCENES`, `StoryScrolly.tsx`, `App.tsx`, CSS, data, or handoff action unless a real responsive regression is reproduced in Step 4.

### Step 3: Mutation proof and full story regression

Temporarily delete the refusal clause after the semicolon; the exact-copy test must fail. Restore and run:

```bash
npm --prefix app run test -- scenes.test.ts StoryScrolly.test.tsx storyFigures.test.tsx App.test.tsx
```

### Step 4: Quiet handoff QA

Capture 1440x900, 390x844, and 844x390 with the handoff fully visible. Verify:

- complete copy with no clipping or horizontal overflow;
- current eyebrow and button hierarchy;
- button remains intrinsic, at least 44px, keyboard accessible;
- action still returns neutral `view=overview`, clears selection/outlook as before, and preserves URL/history behavior;
- reduced motion and direct scene URL remain correct.

If copy wraps but remains fully readable in native flow, that is not a defect. Do not shrink it into microtype to fit one viewport.

### Step 5: Verify, independently review, and commit

```bash
npm --prefix app run test -- scenes.test.ts StoryScrolly.test.tsx storyFigures.test.tsx App.test.tsx
npm --prefix app run test
npm --prefix app run build
python scripts/check_app_bundle_budget.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
git diff --check
```

Move TASK-116 through legal statuses after independent narrative/scientific review. Commit subject:

```text
feat(story): TASK-116 close the regional argument
```

---

## TASK-117: Resolve A Reachable Name-Based Place Entry (Design Gate)

TASK-117 is a design gate, not a production task. The original plan said not to begin it before TASK-100; the owner's later batch sequence explicitly moved this design-only decision ahead of the held TASK-110/TASK-100 gates. That override did not authorize runtime work: TASK-117 is complete, and TASK-118 remains the only implementation successor after those gates.

### Step 1: Prove the host problem against the live shell

Trace and record these current facts from `App.tsx` and live desktop/mobile states:

- `panelOpen` is false in neutral Explore;
- `panelContent` can construct `CountryPanel geo={null}`, but the surrounding panel dock is not mounted;
- broadening `panelOpen` would reserve the 400px desktop panel and currently give neutral state the fallback nav title `Rank ranges`;
- `handleSelect` is the correct reusable state/history path after a later control is activated;
- the map header is already visible in neutral Explore and has an existing actions row;
- selected and diagnostic panels already own distinct Back/Close/focus semantics.

Capture the real neutral shell at 1440x900, 390x844, 844x390, and 320x568 before drawing any proposal. No production file changes.

### Step 2: Compare only two reachable directions

Produce matched desktop/mobile concepts and a state-impact table for:

1. **Visible header entry.** A compact native name control or Places action within the already visible Explore map-header family, preserving map area and current controls.
2. **Explicit Places panel.** A visible **Places** action that opens a correctly titled/focused neutral panel, with a complete contract for desktop reservation, mobile sheet, Close, history, and focus restoration.

Record continued map-only selection as the rejected/no-change baseline. Do not design a hidden empty-panel select, custom combobox, search library, list grid, second drawer, or peer-navigation control.

Every concept must show how a later selection calls the existing `handleSelect`; it may not invent another selected code, URL writer, history path, camera controller, or panel stack.

### Step 3: Run the Ponytail and accessibility comparison

For each direction, estimate exact production files/classes/state changes and review:

- live mount point and discoverability;
- desktop map-area loss;
- portrait/landscape/320px placement;
- 44px control and native keyboard/touch behavior;
- long names and alphabetical semantics;
- selected/direct-URL/diagnostic Back/Close/history behavior;
- focus entry and restoration;
- loading/error/zero-record behavior;
- bundle/dependency impact;
- whether the feature still feels like an atlas rather than a dashboard.

Recommend the smallest truthful direction or recommend deferral. A native `<select>` remains preferred only if the chosen live host makes it readable and coherent.

### Step 4: Obtain owner decision and define any successor

Update the existing design, decision, task, handoff, and progress records with the two concepts and recommendation. The original gate required an owner host decision; the later batch instruction delegated that decision, and independent UX/accessibility review accepted the explicit **Places** action/panel. TASK-117 is therefore `done`. TASK-118 is the separate bounded implementation task with strict TDD and independent review; TASK-117 itself changes no application source.

Verify the context-only gate:

```bash
python scripts/validate_task_statuses.py
python scripts/check_required_artifacts.py
python scripts/check_secrets.py
git diff --check
git diff --name-only
```

Expected commit subject after owner decision:

```text
docs(design): TASK-117 choose name-entry host
```

---

## Existing QA Gates After The Batch

### TASK-110 attempt 2

Start after TASK-115 closes. Reuse attempt-1 evidence only for provably unaffected paths. Freshly verify:

- source -> quadrant/count -> selected-place sentence;
- sentence -> kicker/heading/key -> all three selected values;
- every accepted interaction and mark identity from TASK-112;
- long-name/incomplete states;
- desktop, portrait, landscape, 320px, reflow, grayscale/deuteranopia, reduced motion, focus, touch, overflow, history, and map-failure states;
- owner visual/interaction acceptance.

TASK-110 remains the only final lens QA task; do not create a duplicate QA ledger item.

Attempt 2 independent review returned one production defect and one evidence-package defect. TASK-119 is the bounded implementation successor for the desktop legend/failure-alert occlusion; it is not another QA gate. After TASK-119 passes independent review, TASK-110 attempt 3 must retain a machine-readable case matrix rather than aggregate booleans. Each interaction record must identify the viewport/input, selected code, exact URL/history delta, map center/zoom, panel path, inspected value or group, focus target, live-region text, mark/group counts, touch-band and overflow measurements, console/page/request errors, and measured contrast where applicable. Regenerate the affected map-failure frame and correct the stale HANDOVER attempt label before returning TASK-110 to independent and owner review.

### TASK-100 frozen release QA

Start only after TASK-095, TASK-110, TASK-116, and the TASK-119 correction are done. Freeze production and run the full repository/story/Explorer/panel/data/accessibility/security matrix recorded in TASK-100. Completed design-only TASK-117 does not block this gate; TASK-118 remains a separate implementation after it. Deployment and submission are still separate owner decisions.

## Final Batch Scope Audit

Before claiming the batch ready for TASK-100, run:

```bash
git diff --check
git log --format=full -4
rg -n '@font-face|fonts\.googleapis|clipboard|createPortal|listbox|combobox' app/src app/index.html app/package.json
python scripts/validate_task_statuses.py
python scripts/check_required_artifacts.py
python scripts/check_secrets.py
npm --prefix app run test
npm --prefix app run build
python scripts/check_app_bundle_budget.py
```

Inspect any search matches in context before treating them as production violations. The expected production result is no font payload, clipboard flow, portal/custom listbox, new dependency, new scene, or data change.
