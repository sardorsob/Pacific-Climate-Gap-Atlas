# Architecture Memory

## Current Architecture

The repository is divided into five major areas:

- `research/`: source context and competition research.
- `context/`: durable workflow and project memory.
- `analysis/`: reusable Python analysis package.
- `scripts/`: command-line orchestration.
- `app/`: future GIS web app.

Generated data and outputs live under `data/` and `artifacts/`.

Script-first EDA lives in `analysis/eda/` and is orchestrated by `scripts/run_eda.py`. Its reportable outputs include coverage diagnostics, indicator forensics, country story labels, spatial typologies, rank volatility, trend profiles, outlook display guidance, monitoring-gap priorities, and TASK-019 evidence-fingerprint divergence artifacts. The current React/Vite baseline loads generated app data through `app/src/lib/atlasData.ts`, joins `country_details.json` for trace rows, shows selected-place JSD neighbors, and uses MapLibre with Natural Earth visual land context under centroid presence marks.

The approved next architecture is recorded in `context/ARTISTIC_REDESIGN_BRIEF.md` and `TASK-048` through `TASK-057`. It first corrects score-input/context evidence semantics, then moves guided reading to native document scroll with one canonical scene state, uses focused React/SVG evidence-mark and editorial-figure components over the MapLibre substrate, keeps JSD panel-only, and finally removes redundant runtime products/dependencies after behavior stabilizes. The current seven-beat/nested-scroll/JSD-arc implementation remains the baseline until those tasks pass review.
