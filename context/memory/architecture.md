# Architecture Memory

## Current Architecture

The repository is divided into five major areas:

- `research/`: source context and competition research.
- `context/`: durable workflow and project memory.
- `analysis/`: reusable Python analysis package.
- `scripts/`: command-line orchestration.
- `app/`: future GIS web app.

Generated data and outputs live under `data/` and `artifacts/`.

Script-first EDA lives in `analysis/eda/` and is orchestrated by `scripts/run_eda.py`. Its current reportable outputs include coverage diagnostics, indicator forensics, country story labels, spatial typologies, rank volatility, trend profiles, outlook display guidance, monitoring-gap priorities, and TASK-019 evidence-fingerprint divergence artifacts. TASK-018 distilled the core story into `context/STORY_BRIEF.md` and `context/DESIGN_BRIEF.md` for the app build. TASK-020 added `context/DATAVIZ_INSPIRATION_AUDIT.md` as design-research context for visual critique and mockup iteration. TASK-023 inventories mock-to-public-data wiring gaps before replacing the mock fixture.
