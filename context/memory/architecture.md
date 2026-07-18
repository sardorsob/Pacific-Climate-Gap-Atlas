# Architecture Memory

## Current Architecture

The repository is divided into five major areas:

- `research/`: source context and competition research.
- `context/`: durable workflow and project memory.
- `analysis/`: reusable Python analysis package.
- `scripts/`: command-line orchestration.
- `app/`: React/Vite/MapLibre GIS web app.

Generated data and outputs live under `data/` and `artifacts/`.

Script-first EDA lives in `analysis/eda/` and is orchestrated by `scripts/run_eda.py`. Its reportable outputs include coverage diagnostics, indicator forensics, country story labels, spatial typologies, rank volatility, trend profiles, outlook display guidance, monitoring-gap priorities, and TASK-019 evidence-fingerprint divergence artifacts. The current React/Vite app loads `geographies.json` and `country_details.json` through `app/src/lib/atlasData.ts`, shows selected-place JSD neighbors in the panel, and uses MapLibre with Natural Earth visual land context under fixed centroid presence marks.

The active architecture is recorded in `context/ARTISTIC_REDESIGN_BRIEF.md`: four native-scroll scenes plus a separate handoff, one canonical observer-owned scene state, React/SVG evidence fields over the MapLibre substrate, panel-only JSD, and a two-JSON-plus-land-context runtime data surface. Keep scored geography geometry as centroid fallback and preserve explicit score-input, context-only, monitoring, regional-story, and rank caveats.

The planned TASK-079–TASK-082 Explorer repair must stay inside the existing state seams: `viewMode` retains the parent evidence view, `selectedCode` represents the child place, `sheetExpanded` controls only the mobile sheet, and `urlState.ts` serializes the same state. One shared panel-navigation row expresses contextual Back and terminal Close. Evidence-view entry and ordinary place selection push history; diagnostic child selection, Back, and Close replace the current entry. No router, reducer, navigation stack, data pipeline, or new runtime dependency is justified.
