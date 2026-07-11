# TASK-029 Pacific Land Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reviewed public-domain Pacific land context layer so the map shows island/land shapes under the atlas points, while keeping scored geographies as centroid features and fixing the graticule so it appears on initial render.

**Architecture:** Use Natural Earth 10m land polygons as a visual land-context basemap source, clipped by feature intersection to the Pacific viewport and shifted into the existing antimeridian-aware coordinate space. Keep this separate from geography score records: the land layer is not a per-geography boundary layer and must not drive scoring, rank, selection, or choropleth claims. Move graticule lines into MapLibre as a real line layer so the grid is visible immediately, while React overlays continue to own direct labels and accessible hit targets.

**Tech Stack:** Python standard library, Natural Earth 10m land GeoJSON, React 18, TypeScript, MapLibre GL JS, Vite.

---

### Task 1: Land Context Tests

**Files:**
- Create: `tests/analysis/test_land_context.py`
- Create: `scripts/build_land_context.py`
- Modify: `app/src/components/map/atlasMapModel.test.ts`
- Modify: `app/src/components/map/atlasMapModel.ts`

- [x] **Step 1: Write failing Python tests**

Create `tests/analysis/test_land_context.py` with tests for longitude shifting, Pacific-bounds filtering, and provenance output.

- [x] **Step 2: Write failing app-map test**

Add a Vitest test that expects a graticule FeatureCollection from `buildGraticuleFeatureCollection()`.

- [x] **Step 3: Verify RED**

Run:

```powershell
C:\Users\sardo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m unittest tests.analysis.test_land_context -v
npm --prefix app run test -- atlasMapModel.test.ts
```

Expected: both fail because the new functions do not exist.

### Task 2: Land Context Builder

**Files:**
- Create: `scripts/build_land_context.py`
- Modify: `tests/analysis/test_land_context.py`

- [x] **Step 1: Implement the standard-library builder**

The builder should:

- download or reuse `data/raw/gis/ne_10m_land.geojson`;
- filter land features that intersect the Pacific viewport `[120, -36]` to `[250, 26]` after antimeridian shifting;
- shift western longitudes into `0..360` space so they align with the existing MapLibre Pacific viewport;
- write `data/processed/app/pacific_land_context.geojson`;
- mirror the file to `app/public/data/pacific_land_context.geojson`;
- write `artifacts/provenance/land_context_summary.json`;
- record Natural Earth source URL, source page, license status, feature count, geometry policy, and caveats.

- [x] **Step 2: Verify GREEN**

Run the focused Python test and confirm it passes.

### Task 3: MapLibre Land And Graticule Layers

**Files:**
- Modify: `app/src/components/map/atlasMapModel.ts`
- Modify: `app/src/components/map/AtlasMap.tsx`
- Modify: `app/src/styles/base.css`
- Test: `app/src/components/map/atlasMapModel.test.ts`

- [x] **Step 1: Implement graticule FeatureCollection helper**

Add `buildGraticuleFeatureCollection()` to produce MapLibre line features for existing latitude and longitude ticks.

- [x] **Step 2: Render graticule as MapLibre lines**

Add a `atlas-graticule` source/layer before points so the grid appears immediately on load, not only after map movement. Keep React overlay labels for graticule text.

- [x] **Step 3: Render land context below points**

Fetch `/data/pacific_land_context.geojson` in `AtlasMap`, add a low-contrast fill/outline layer below graticule and point layers, and fail softly if the file is unavailable.

- [x] **Step 4: Verify app tests**

Run `npm --prefix app run test -- atlasMapModel.test.ts` and confirm it passes.

### Task 4: Docs And Task Board

**Files:**
- Modify: `context/TASKS.md`
- Modify: `context/DECISIONS.md`
- Modify: `context/DATA_CARD.md`
- Modify: `context/DESIGN_BRIEF.md`
- Modify: `context/HANDOVER.md`
- Modify: `context/PROJECT.md`
- Modify: `context/docs/methodology.md`
- Modify: `README.md`

- [x] **Step 1: Fix TASK-026 bookkeeping**

Move the MapLibre QA notes from TASK-025 to TASK-026 if needed and mark TASK-026 done.

- [x] **Step 2: Add TASK-029**

Record TASK-029 as a done/pending task depending on verification status. Make clear that Natural Earth is a visual context layer, not official scored geography boundaries.

- [x] **Step 3: Update method and data notes**

Document Natural Earth public-domain terms, visual-only use, and caveat that centroid features remain the selectable/scored geography layer.

### Task 5: Verification And Commit

**Files:**
- All changed files

- [x] **Step 1: Run verification**

Run:

```powershell
C:\Users\sardo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\build_land_context.py
C:\Users\sardo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m unittest discover -v
npm --prefix app run test
npm --prefix app run build
C:\Users\sardo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\check_secrets.py
C:\Users\sardo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\validate_task_statuses.py
C:\Users\sardo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\check_required_artifacts.py
git diff --check
```

- [x] **Step 2: Review generated file sizes and diff**

Confirm raw global Natural Earth data is not staged and the public land context file is compact enough for Vite.

- [x] **Step 3: Commit**

Commit with:

```powershell
git commit -m "feat(app): add pacific land context"
```

Do not include a co-author trailer.
