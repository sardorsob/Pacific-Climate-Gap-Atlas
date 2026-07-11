# Architecture Memory

## Current Architecture

The repository is divided into five major areas:

- `research/`: source context and competition research.
- `context/`: durable workflow and project memory.
- `analysis/`: reusable Python analysis package.
- `scripts/`: command-line orchestration.
- `app/`: future GIS web app.

Generated data and outputs live under `data/` and `artifacts/`.

Script-first EDA lives in `analysis/eda/` and is orchestrated by `scripts/run_eda.py`. Its reportable outputs include coverage diagnostics, indicator forensics, country story labels, spatial typologies, rank volatility, trend profiles, outlook display guidance, monitoring-gap priorities, and TASK-019 evidence-fingerprint divergence artifacts. The current React/Vite app loads `geographies.json` and `country_details.json` through `app/src/lib/atlasData.ts`, shows selected-place JSD neighbors in the panel, and uses MapLibre with Natural Earth visual land context under fixed centroid presence marks.

The active architecture is recorded in `context/ARTISTIC_REDESIGN_BRIEF.md` and `TASK-048` through `TASK-056`: five native-scroll scenes with one canonical state, focused React/SVG evidence marks over the MapLibre substrate, panel-only JSD, and a reduced two-JSON-plus-land-context runtime data surface. Keep scored geography geometry as centroid fallback and preserve explicit score-input, context-only, monitoring, and rank caveats.
