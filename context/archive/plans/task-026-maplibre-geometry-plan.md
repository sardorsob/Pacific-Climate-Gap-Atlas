# TASK-026 MapLibre Geometry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the schematic SVG-only map canvas with a MapLibre-backed Pacific atlas map while preserving the existing data contract, guided-tour state, selected-geography handoff, missingness grammar, and centroid-fallback caveat.

**Architecture:** Keep `AtlasMap` as the public React component so `App.tsx` and story state do not churn. Move map projection bounds and marker styling into small helpers, use MapLibre for the geographic canvas and viewport, then keep React-rendered labels and accessible geography buttons as an HTML/SVG overlay. Because the current app data only contains centroid point geometry, TASK-026 must not render or imply polygon boundaries; it should document that reviewed boundary data is still a future gate.

**Tech Stack:** React 18, TypeScript, Vite, MapLibre GL JS, generated app JSON/GeoJSON from `app/public/data/`.

---

### Task 1: Contract Tests For Map Helpers

**Files:**
- Create: `app/src/components/map/atlasMapModel.ts`
- Create: `app/src/components/map/atlasMapModel.test.ts`
- Modify: `app/package.json`

- [x] **Step 1: Add a test script**

Add a Vitest test script and dependency so component-independent map helper tests can run without a browser.

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run"
}
```

```json
"devDependencies": {
  "@types/node": "^20.19.43",
  "@types/react": "^18.3.31",
  "@types/react-dom": "^18.3.7",
  "typescript": "^5.6.3",
  "vite": "^6.0.0",
  "vitest": "^2.1.9"
}
```

- [x] **Step 2: Write failing tests**

Create `app/src/components/map/atlasMapModel.test.ts` with tests that expect marker features, fill/ring styling, selected/priority flags, and viewport bounds.

```ts
import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import {
  buildAtlasFeatureCollection,
  fitBoundsForPacific,
  markerPaintFor,
} from "./atlasMapModel";

const baseGeo: Geo = {
  code: "NR",
  name: "Nauru",
  subregion: "Micronesia",
  status: "Country",
  lon: 166.93,
  lat: -0.52,
  gap: 71,
  pressure: 55,
  capacity: 24,
  indicators: 6,
  reportingStatus: "reported_zero_latest_count",
  monitoringCount: 0,
  latestMonitoringYear: 2024,
  storyPriority: 1,
  rankMin: 3,
  rankMax: 12,
  rankRange: 9,
  robustness: "fragile",
  storyLabel: "High gap with a reporting caveat",
  topPressure: ["Sea level"],
  topCapacity: ["Protected area"],
  outlook2030Flat: 69,
  outlookDisplay: "show_with_strong_caveat",
};

describe("atlas map model", () => {
  it("builds MapLibre point features without changing centroid coordinates", () => {
    const collection = buildAtlasFeatureCollection([baseGeo], {
      activeScore: "gap",
      viewMode: "default",
      outlookOn: false,
      selectedCode: "NR",
      compareCode: "TV",
      priorityCodes: ["NR"],
    });

    expect(collection.features).toHaveLength(1);
    expect(collection.features[0].geometry.coordinates).toEqual([166.93, -0.52]);
    expect(collection.features[0].properties).toMatchObject({
      code: "NR",
      name: "Nauru",
      scoreValue: 71,
      radius: 13,
      selected: true,
      priority: true,
      dimmed: false,
      reportingStatus: "reported_zero_latest_count",
      geometryStatus: "centroid_fallback",
    });
  });

  it("withholds outlook marks instead of coloring weak outlook rows", () => {
    const collection = buildAtlasFeatureCollection(
      [{ ...baseGeo, outlookDisplay: "withhold", outlook2030Flat: 80 }],
      {
        activeScore: "gap",
        viewMode: "default",
        outlookOn: true,
        selectedCode: null,
        compareCode: null,
        priorityCodes: [],
      },
    );

    expect(collection.features[0].properties).toMatchObject({
      scoreValue: null,
      withheld: true,
      fillColor: "transparent",
    });
  });

  it("returns dashed and hatch paint cues for monitoring reporting states", () => {
    expect(markerPaintFor("reported_positive_latest_count")).toMatchObject({
      strokeDasharray: null,
      hatch: false,
    });
    expect(markerPaintFor("reported_zero_latest_count")).toMatchObject({
      strokeDasharray: [2, 2],
      hatch: false,
    });
    expect(markerPaintFor("missing_monitoring_dataset_row")).toMatchObject({
      strokeDasharray: [1, 2],
      hatch: true,
    });
  });

  it("uses Pacific antimeridian-aware bounds for MapLibre fitting", () => {
    expect(fitBoundsForPacific()).toEqual([
      [130, -30],
      [240, 20],
    ]);
  });
});
```

- [x] **Step 3: Run the tests and verify RED**

Run: `npm --prefix app run test -- atlasMapModel.test.ts`

Expected: fail because `atlasMapModel.ts` does not exist yet.

### Task 2: Map Model Implementation

**Files:**
- Create: `app/src/components/map/atlasMapModel.ts`
- Test: `app/src/components/map/atlasMapModel.test.ts`

- [x] **Step 1: Implement the helper module**

Create `atlasMapModel.ts` with pure helpers only: no React, DOM, or MapLibre imports.

```ts
import type { Geo, ReportingStatus } from "../../lib/atlasData";
import type { ScoreKey } from "../../lib/encoding";
import {
  radiusFor,
  ringVariant,
  scoreColor,
  uncertaintyColor,
  valueForScore,
} from "../../lib/encoding";
import type { ViewMode } from "../../lib/types";

export type AtlasMapState = {
  activeScore: ScoreKey;
  viewMode: ViewMode;
  outlookOn: boolean;
  selectedCode: string | null;
  compareCode: string | null;
  priorityCodes: string[];
};

export type AtlasPointProperties = {
  code: string;
  name: string;
  storyLabel: string;
  scoreValue: number | null;
  fillColor: string;
  strokeColor: string;
  radius: number;
  opacity: number;
  selected: boolean;
  compare: boolean;
  priority: boolean;
  dimmed: boolean;
  withheld: boolean;
  reportingStatus: ReportingStatus;
  ringVariant: ReturnType<typeof ringVariant>;
  strokeDasharray: number[] | null;
  hatch: boolean;
  geometryStatus: "centroid_fallback";
};

export type AtlasPointFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: AtlasPointProperties;
};

export type AtlasFeatureCollection = {
  type: "FeatureCollection";
  features: AtlasPointFeature[];
};

export function fitBoundsForPacific(): [[number, number], [number, number]] {
  return [[130, -30], [240, 20]];
}

export function markerPaintFor(status: ReportingStatus): {
  strokeColor: string;
  strokeDasharray: number[] | null;
  hatch: boolean;
} {
  const variant = ringVariant(status);
  if (variant === "hatch") {
    return { strokeColor: "#9fb4bf", strokeDasharray: [1, 2], hatch: true };
  }
  if (variant === "dashed") {
    return { strokeColor: "#d4dde2", strokeDasharray: [2, 2], hatch: false };
  }
  return { strokeColor: "rgba(6,16,24,0.62)", strokeDasharray: null, hatch: false };
}

export function buildAtlasFeatureCollection(geos: Geo[], state: AtlasMapState): AtlasFeatureCollection {
  const hasSelection = state.selectedCode !== null;

  return {
    type: "FeatureCollection",
    features: geos.map((geo) => {
      const isSelected = geo.code === state.selectedCode;
      const isCompare = geo.code === state.compareCode && geo.code !== state.selectedCode;
      const isPriority = state.viewMode === "coverage" && state.priorityCodes.includes(geo.code);
      const withheld = state.outlookOn && geo.outlookDisplay === "withhold";
      const dimmed =
        (hasSelection && !isSelected && geo.code !== state.compareCode) ||
        (state.viewMode === "coverage" && !isPriority && geo.storyPriority > 3);
      const scoreValue = withheld
        ? null
        : state.outlookOn
          ? geo.outlook2030Flat
          : state.viewMode === "uncertainty"
            ? geo.rankRange
            : state.viewMode === "coverage"
              ? null
              : valueForScore(geo, state.activeScore);
      const fillColor = markerFillFor(geo, state);
      const paint = markerPaintFor(geo.reportingStatus);

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [geo.lon, geo.lat],
        },
        properties: {
          code: geo.code,
          name: geo.name,
          storyLabel: geo.storyLabel,
          scoreValue,
          fillColor,
          strokeColor: withheld ? "#9fb4bf" : paint.strokeColor,
          radius: radiusFor(geo.indicators),
          opacity: dimmed ? 0.32 : 1,
          selected: isSelected,
          compare: isCompare,
          priority: isPriority,
          dimmed,
          withheld,
          reportingStatus: geo.reportingStatus,
          ringVariant: ringVariant(geo.reportingStatus),
          strokeDasharray: withheld ? [1, 2] : paint.strokeDasharray,
          hatch: paint.hatch,
          geometryStatus: "centroid_fallback",
        },
      };
    }),
  };
}

function markerFillFor(geo: Geo, state: AtlasMapState): string {
  if (state.outlookOn) {
    if (geo.outlookDisplay === "withhold") return "transparent";
    return scoreColor("gap", geo.outlook2030Flat);
  }
  if (state.viewMode === "uncertainty") return uncertaintyColor(geo.rankRange);
  if (state.viewMode === "coverage") return "#64777f";
  return scoreColor(state.activeScore, valueForScore(geo, state.activeScore));
}
```

- [x] **Step 2: Run the helper tests and verify GREEN**

Run: `npm --prefix app run test -- atlasMapModel.test.ts`

Expected: all tests in `atlasMapModel.test.ts` pass.

### Task 3: MapLibre Canvas With Accessible Overlay

**Files:**
- Modify: `app/src/components/map/AtlasMap.tsx`
- Modify: `app/src/main.tsx`
- Modify: `app/src/styles/base.css`
- Test: `app/src/components/map/atlasMapModel.test.ts`

- [x] **Step 1: Import MapLibre CSS**

Add `import "maplibre-gl/dist/maplibre-gl.css";` before local styles in `app/src/main.tsx`.

- [x] **Step 2: Replace the SVG-only map background**

Modify `AtlasMap.tsx` so it:

- creates a `maplibregl.Map` in a `ref` container;
- uses a no-network style with a deep ocean background;
- fits `[[130, -30], [240, 20]]` bounds on first load and resize;
- adds `atlas-points` as a GeoJSON source from `buildAtlasFeatureCollection`;
- renders MapLibre circle layers for priority halos, data points, selected brackets/halos, and missing-row hatching markers;
- leaves labels and keyboard-accessible geography buttons in a React overlay using the existing `projectPoint` helper until dedicated MapLibre label collision handling is ready;
- preserves the then-current map note text. TASK-029 later updated the note for Natural Earth visual land context while keeping scored geometry centroid-based.

- [x] **Step 3: Update CSS**

Add styles for:

- `.maplibre-canvas`;
- `.map-overlay-svg`;
- `.map-a11y-layer`;
- visually transparent but focusable `.map-a11y-point` buttons;
- MapLibre control and attribution placement that does not collide with guided rail, header, legend, or mobile sheet.

- [x] **Step 4: Run the helper tests**

Run: `npm --prefix app run test -- atlasMapModel.test.ts`

Expected: pass.

### Task 4: Docs And Task Status

**Files:**
- Modify: `context/TASKS.md`
- Modify: `context/DESIGN_BRIEF.md`
- Modify: `context/DECISIONS.md`
- Modify: `context/docs/methodology.md`
- Modify: `context/HANDOVER.md`
- Modify: `context/logs/Progress Log.md`
- Modify: `context/memory/architecture.md`
- Modify: `context/memory/patterns.md`

- [x] **Step 1: Record the geometry decision**

Add a `2026-07-01` decision that TASK-026 introduces MapLibre as the map engine while retaining centroid fallback until reviewed polygon geometry is sourced, license-checked, and documented.

- [x] **Step 2: Update task status**

Set TASK-026 to done only after verification passes. Add an attempt log entry with commands run and note that boundary polygons remain a future data-source gate.

- [x] **Step 3: Refresh design and methodology docs**

Update stale references that describe the current app as SVG-only. Keep "no polygon choropleth without reviewed boundaries" explicit.

### Task 5: Verification And Commit

**Files:**
- All changed files

- [x] **Step 1: Run verification**

Run:

```powershell
npm --prefix app run test -- atlasMapModel.test.ts
npm --prefix app run build
python scripts/check_secrets.py
python scripts/validate_task_statuses.py
git diff --check
```

Use the bundled Python runtime if `python` is unavailable on PATH.

- [x] **Step 2: Review diff**

Run `git diff --stat` and inspect the modified files for accidental unrelated changes or stale comments.

- [x] **Step 3: Commit**

Stage the TASK-026 files and commit with:

```powershell
git commit -m "feat(app): add maplibre atlas map"
```

Do not include any co-author trailer.
