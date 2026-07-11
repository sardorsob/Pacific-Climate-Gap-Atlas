# Simplification And Redesign Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove redundant code, data products, dependencies, and stale context after the artistic redesign, then add durable URL state and complete release-quality accessibility, performance, and evidence QA.

**Architecture:** `TASK-056` is a behavior-preserving reduction pass backed by characterization tests and source-usage proof. `TASK-057` adds a small URL-state adapter at the app boundary and validates the final artifact across data, story, responsive, accessibility, reduced-motion, and bundle-budget contracts.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, MapLibre GL, Python 3.11 standard library, existing unittest suite.

## Global Constraints

- Start after `TASK-055`; do not simplify moving targets.
- Delete only code, files, outputs, and dependencies proven unused or replaced.
- Do not alter score values, source rows, JSD results, monitoring semantics, or rank diagnostics in the reduction task.
- Preserve `geographies.json`, `country_details.json`, and `pacific_land_context.geojson` as the public runtime data products.
- Prefer deletion and focused modules over a new abstraction layer.
- No new runtime dependency for URL state, accessibility checks, or bundle budgets.
- Generated files are changed only through their scripts.
- Each project task receives its own reviewed commit with no co-author trailer.

---

## Target File Structure After Simplification

- `app/src/components/map/AtlasMap.tsx`: composition and props only.
- `app/src/components/map/useAtlasMap.ts`: MapLibre creation, sources, layers, paint updates, projection subscription, and camera lifecycle.
- `app/src/components/map/MapOverlay.tsx`: React evidence marks, labels, annotations, and accessible hit targets.
- `app/src/components/map/atlasMapModel.ts`: pure geographic and paint helpers.
- `app/src/lib/scenes.ts`: guided story content.
- `app/src/lib/urlState.ts`: parse/serialize query state.
- `app/src/lib/atlasData.ts`: two runtime fetches and typed adapter.
- `app/public/data/geographies.json`: geography, score, monitoring, rank, story, context, and neighbor data.
- `app/public/data/country_details.json`: trace rows and selected detail.
- `app/public/data/pacific_land_context.geojson`: visual land context.

Removed runtime data products:

- `app/public/data/atlas_geographies.geojson`
- `app/public/data/monitoring_network.geojson`
- `app/public/data/layers.json`
- matching `data/processed/app/` copies

---

### TASK-056: Remove Redundant Code, Data Products, Dependencies, And Stale Context

**Files:**

- Create: `app/src/components/map/useAtlasMap.ts`
- Create: `app/src/components/map/MapOverlay.tsx`
- Modify: `app/src/components/map/AtlasMap.tsx`
- Modify: `app/src/components/map/atlasMapModel.ts`
- Modify: `app/src/components/map/atlasMapModel.test.ts`
- Modify: `app/src/lib/atlasData.ts`
- Delete: `app/src/lib/projection.ts` after moving only used constants
- Modify: `analysis/preprocessing/app_data.py`
- Modify: `scripts/build_app_data.py`
- Modify: `scripts/validate_data_contracts.py`
- Modify: `tests/analysis/test_app_data_export.py`
- Modify: `tests/analysis/test_app_data_validation.py`
- Delete: `configs/app_layers.yml` after removing the no-op config argument
- Delete generated unused app data listed above through the export workflow
- Modify: `app/package.json`
- Modify: `app/package-lock.json`
- Modify: `package-lock.json`
- Modify: `pyproject.toml`
- Modify: `README.md`
- Modify: `context/STRUCTURE.md`
- Modify: `context/DATA_CARD.md`
- Modify: `context/DESIGN_BRIEF.md`
- Archived: `context/archive/CLAUDE_MOCKUP_INSTRUCTIONS.md` (historical mockup instructions)
- Move completed superseded one-off plans to `context/archive/plans/` only when no living file links to them
- Modify: `context/memory/architecture.md`
- Modify: `context/memory/patterns.md`

**Interfaces:**

- Consumes: the accepted `TASK-055` behavior and static data.
- Produces: the same user-visible app with three runtime public data files, fewer dependencies, smaller ownership modules, and current living documentation.

- [ ] **Step 1: Capture a fresh behavior and size baseline**

Run:

```bash
python -m unittest discover -s tests -t . -v
npm --prefix app run test
npm --prefix app run build
wc -l app/src/components/map/AtlasMap.tsx
du -sh app/public/data
```

Record test counts, build chunk sizes, `AtlasMap.tsx` line count, and public-data directory size in the task attempt log. Do not claim preservation later without comparing to this baseline.

- [ ] **Step 2: Prove the targeted dependencies are unused**

Run:

```bash
rg -n "^(from|import) (numpy|requests|sklearn|yaml)" analysis scripts tests
rg -n "pacific-climate-gap-atlas-root" app/src app/package.json
```

Expected before edits: no Python imports; the root package appears only as the app package dependency.

If either result differs, stop deleting that dependency and record the actual consumer. Otherwise remove `numpy`, `pyyaml`, `requests`, and `scikit-learn` from `pyproject.toml`, and remove `pacific-climate-gap-atlas-root` from `app/package.json`.

Regenerate JavaScript lockfiles using the repository’s existing npm version:

```bash
npm install --package-lock-only --ignore-scripts
npm --prefix app install --package-lock-only --ignore-scripts
```

- [ ] **Step 3: Add characterization tests before splitting `AtlasMap`**

The tests must lock current pure behavior:

```typescript
it("keeps 22 selectable evidence marks in the default collection", () => {
  const collection = buildAtlasFeatureCollection(geos, defaultOptions);
  expect(collection.features).toHaveLength(22);
  expect(new Set(collection.features.map((feature) => feature.properties.code)).size).toBe(22);
});

it("keeps reporting states and selected emphasis during refactor", () => {
  const selected = buildAtlasFeatureCollection(geos, { ...defaultOptions, selectedCode: "NR" });
  expect(selected.features.find((feature) => feature.properties.code === "NR")?.properties)
    .toMatchObject({ selected: true, reportingStatus: "reported_zero_latest_count" });
});
```

Run:

```bash
npm --prefix app run test -- atlasMapModel.test.ts
```

Expected: tests pass before structural edits.

- [ ] **Step 4: Split MapLibre lifecycle from React overlay**

Move existing code without changing behavior:

```typescript
export type AtlasMapProjection = (lon: number, lat: number) => { x: number; y: number } | null;

export function useAtlasMap(options: UseAtlasMapOptions): {
  containerRef: RefObject<HTMLDivElement>;
  project: AtlasMapProjection;
  mapReady: boolean;
} {
  // existing MapLibre construction, source/layer updates, resize, move, and cleanup
}
```

`MapOverlay` receives the pure data and projection function:

```typescript
type MapOverlayProps = {
  geos: Geo[];
  project: AtlasMapProjection;
  selectedCode: string | null;
  activeScore: ScoreKey;
  sceneVisual: SceneVisual | null;
  onSelect: (code: string) => void;
};
```

`AtlasMap.tsx` should compose the hook and overlay and retain only orchestration. Do not introduce context providers or a map service class.

- [ ] **Step 5: Remove the misleading projection module**

Move `GRATICULE_LATS` and `GRATICULE_LONS` into `atlasMapModel.ts`, where their only active consumers live. Delete the unused equirectangular projection function and `app/src/lib/projection.ts`.

Run:

```bash
rg -n "lib/projection|projectPacific|DEFAULT_SELECTED" app/src
```

Expected: no matches. Delete `DEFAULT_SELECTED` from `atlasData.ts` because selection starts as `null` and the constant has no consumer.

- [ ] **Step 6: Delete static outputs the app never fetches**

First prove runtime usage:

```bash
rg -n "atlas_geographies\.geojson|monitoring_network\.geojson|layers\.json" app/src app/index.html
```

Expected: no matches.

Then remove `build_atlas_geojson()`, `build_monitoring_geojson()`, `build_layer_manifest()`, their imports, tests, validation branches, exporter outputs, and provenance counts. Remove the no-op `--config` option and `configs/app_layers.yml` after all callers and docs are updated.

The exporter becomes:

```python
outputs = {
    "geographies.json": build_geographies_payload(records),
    "country_details.json": build_country_details_payload(records, trace=trace),
}
```

The validator’s runtime file set becomes:

```python
VALIDATED_JSON_FILES = ("geographies.json", "country_details.json")
PUBLIC_APP_FILES = (
    "geographies.json",
    "country_details.json",
    "pacific_land_context.geojson",
)
```

Delete the six processed/public unused files with `apply_patch`; do not use a destructive wildcard command.

- [ ] **Step 7: Regenerate and validate the reduced app-data surface**

Run:

```bash
python scripts/build_app_data.py
python scripts/validate_data_contracts.py
python -m unittest tests.analysis.test_app_data_export tests.analysis.test_app_data_validation -v
```

Expected: two generated JSON payloads plus the separately generated land-context GeoJSON; contract tests pass.

- [ ] **Step 8: Archive stale design instructions and update living docs**

Move the Claude mockup instruction file to `context/archive/` with a top banner stating it is historical and superseded by `context/ARTISTIC_REDESIGN_BRIEF.md`. Archive only completed one-off plan files that are not required to execute `TASK-048` through `TASK-057` and are not referenced by living docs.

Update `README.md`, `STRUCTURE.md`, `DATA_CARD.md`, `DESIGN_BRIEF.md`, architecture memory, and patterns memory so they list only the actual runtime files and current five-scene architecture. Use `rg` to remove stale statements about a seven-beat story, guided JSD, similarity arcs, and app consumption of the deleted GeoJSON/manifest files.

- [ ] **Step 9: Run the full preservation gate**

Run:

```bash
python -m unittest discover -s tests -t . -v
python scripts/validate_data_contracts.py
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
npm --prefix app run test
npm --prefix app run build
git diff --check
```

Compare the new app test count and Python test count to the baseline. Compare bundle output and `du -sh app/public/data`. A lower source/data footprint is expected; no evidence surface may disappear.

- [ ] **Step 10: Manual behavior comparison**

Repeat the same desktop/mobile route used for the baseline:

- five guided scenes and handoff;
- all 22 marks;
- NR/TV comparison;
- MH rank band;
- explore layers;
- selected NR, FJ, AS, WF;
- trace rows and panel-only JSD;
- methods and legend;
- reduced motion.

- [ ] **Step 11: Review and commit**

After legal task transitions and recorded evidence:

```bash
git add app analysis scripts tests pyproject.toml package-lock.json context README.md data/processed/app artifacts
git commit -m "refactor(repo): TASK-056 remove redundant atlas machinery"
```

---

### TASK-057: Add Shareable URL State And Complete Final Redesign QA

**Files:**

- Create: `app/src/lib/urlState.ts`
- Create: `app/src/lib/urlState.test.ts`
- Modify: `app/src/App.tsx`
- Modify: `app/src/lib/scenes.ts`
- Create: `scripts/check_app_bundle_budget.py`
- Create: `tests/analysis/test_app_bundle_budget.py`
- Modify: `package.json`
- Modify: `context/docs/submission-notes.md`
- Modify: `context/HANDOVER.md`
- Modify: `context/PROJECT.md`
- Modify: `context/TASKS.md`
- Modify: `context/logs/Progress Log.md`
- Modify: `context/logs/Handoff Notes.md`

**Interfaces:**

- Consumes: browser query parameters and current app state.
- Produces: deterministic shareable URLs plus a final verified release/readiness record.

- [ ] **Step 1: Write URL-state round-trip and sanitization tests**

```typescript
import { describe, expect, it } from "vitest";
import { parseAtlasUrl, serializeAtlasUrl } from "./urlState";

describe("atlas URL state", () => {
  it("round-trips guided and explore state", () => {
    const state = {
      mode: "explore" as const,
      scene: "the-order-does-not-hold-still",
      layer: "capacity" as const,
      view: "default" as const,
      place: "NR",
      outlook: false,
    };
    expect(parseAtlasUrl(serializeAtlasUrl(state), ["NR", "TV"])).toEqual(state);
  });

  it("drops unknown values instead of crashing", () => {
    expect(parseAtlasUrl("?mode=bad&layer=rainbow&place=ZZ", ["NR", "TV"]))
      .toEqual({
        mode: "guided",
        scene: "what-the-map-can-see",
        layer: "gap",
        view: "default",
        place: null,
        outlook: false,
      });
  });
});
```

- [ ] **Step 2: Run the URL tests and confirm failure**

Run:

```bash
npm --prefix app run test -- urlState.test.ts
```

Expected: missing module failure.

- [ ] **Step 3: Implement a dependency-free URL contract**

Use query keys:

```text
mode=guided|explore
scene=<approved-scene-id>
layer=gap|pressure|capacity
view=default|coverage|uncertainty
place=<known-geo-code>
outlook=0|1
```

Omit default values from serialization except `mode` when it improves link clarity. Parse with `URLSearchParams`; validate against literal sets and the loaded geography codes. The parser never throws on unknown input.

- [ ] **Step 4: Integrate history without creating a state loop**

On initial data load, parse once and apply state. On user state changes, call `history.replaceState()` for passive scroll scene changes and `history.pushState()` for explicit mode, layer, view, or place actions. Handle `popstate` by parsing and applying without writing a new history entry.

Use one guard:

```typescript
const applyingHistoryRef = useRef(false);
```

Set it while applying `popstate`, and skip URL writing during that state batch. Do not add a router.

- [ ] **Step 5: Write and enforce a bundle budget**

Record the accepted `TASK-056` build output as the baseline in `scripts/check_app_bundle_budget.py`. The default thresholds are:

```python
MAX_JS_BYTES = 1_050_000
MAX_CSS_BYTES = 92_000
```

The checker scans `app/dist/assets`, reports each matching file, and exits nonzero if any JavaScript or CSS asset exceeds its threshold. The unit test creates temporary files one byte below and above each threshold and asserts exit behavior.

Add the root command:

```json
"check:app-budget": "python scripts/check_app_bundle_budget.py"
```

If the actual accepted `TASK-056` baseline is already above either threshold, set the threshold to baseline plus no more than 2%; record the exact reason in the task notes rather than silently weakening it.

- [ ] **Step 6: Run automated final verification**

Run:

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

Expected: zero test failures, successful contract/artifact/status/secret checks, successful app build, assets within budget, and no whitespace errors.

- [ ] **Step 7: Run the full visual and interaction QA matrix**

Desktop: `1440 × 900`, `1280 × 800`, `1024 × 768`.

Mobile: `430 × 932`, `390 × 844`, `360 × 800`.

For every viewport verify:

- first viewport shows map and opening claim;
- progress click and native scroll agree;
- no scene content is clipped by fixed UI;
- all five static scene states make sense without transition;
- reduced motion gives equivalent information;
- keyboard can enter progress, advance scenes, select a geography, open/close methods, and reach panel details;
- focus remains visible;
- 44px practical touch targets on mobile;
- text contrast meets WCAG AA and meaningful non-text marks meet 3:1 where applicable;
- reported zero versus missing row survives grayscale/color-deficiency review;
- screen-reader labels describe evidence marks without duplicating decorative SVG;
- URL reload, copied URL, Back, and Forward restore expected state.

- [ ] **Step 8: Run the evidence/claims QA matrix**

Spot-check:

- 22 geography records and 22 marks;
- eight score-input positions on every mark;
- context-only tick never counted in `n / 8`;
- PN/NR reported zero and AS/WF missing row;
- Nauru/Tuvalu values and labels;
- Marshall Islands 4–19 interval;
- 19/22 fragility claim against `eda_rank_volatility.csv`;
- JSD only in selected-place panel;
- no physical similarity arcs;
- Natural Earth caveat visible;
- outlook language says stress test, not forecast.

Record exact source filenames and observed values in the QA notes.

- [ ] **Step 9: Update handoff and submission readiness truthfully**

Record:

- final test counts and build sizes;
- screenshot/viewport QA evidence;
- final public URL if deployment has actually occurred, otherwise leave the host action explicitly pending;
- owner-only actions: sensitive wording review, AI disclosure, final human visual/accessibility pass, submission form, and hosting through August 31, 2029.

Do not call the project submitted or deployed unless the external action has happened.

- [ ] **Step 10: Review and commit**

After legal task transitions and fresh evidence:

```bash
git add app scripts tests package.json context README.md
git commit -m "feat(release): TASK-057 add shareable state and redesign QA"
```

Inspect the commit body:

```bash
git log -1 --format=full
```

Expected: no `Co-authored-by` trailer.
