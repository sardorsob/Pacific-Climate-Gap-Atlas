# Pacific Adaptation Gap Atlas

An exploratory, map-first data visualization project for the Pacific Dataviz Challenge 2026 climate-change theme.

The atlas asks:

> Where do official climate-pressure, observed-stress, adaptation-capacity, monitoring, and missingness signals appear most out of balance across Pacific geographies?

The project is intentionally careful: the score is a comparative screen, not a definitive ranking of need, vulnerability, readiness, or funding priority.

## Current Status

Competition deadline: **August 31, 2026**

Current phase: **delegated visual mockup revision before final app-data wiring**

What exists now:

- official dataset inventory and challenge research under `research/`
- reproducible official-data profiling, processing, index, outlook, and app-data pipelines
- script-first GIS/EDA outputs under `artifacts/tables/`
- story and design contracts under `context/`
- Dataviz Inspiration audit for visual reference patterns
- reviewable React/Vite atlas mockup under `app/`
- next sprint plan for Codex critique, Claude visual revision, app-data inventory, and QA

Key current docs:

- `context/PROJECT.md`: current phase and status
- `context/TASKS.md`: task ledger
- `context/STORY_BRIEF.md`: narrative contract
- `context/DESIGN_BRIEF.md`: visual and interaction contract
- `context/DATAVIZ_INSPIRATION_AUDIT.md`: live reference audit
- `context/plans/task-021-mockup-critique.md`: current Claude-facing revision checklist
- `context/HANDOVER.md`: continuation notes

## Story Spine

Across 22 Pacific geographies, climate pressure and visible adaptation capacity are unevenly matched, and so is the official data behind the comparison.

The atlas is designed to show:

- where the adaptation gap appears wide,
- which side of the gap is driving it,
- where the official record is strong, thin, missing, or fragile,
- where monitoring rows report zero versus where monitoring rows are missing,
- why ranks should be treated as exploratory rather than definitive.

The signature interaction is **Where the Data Goes Quiet**: a GIS layer that makes missingness and monitoring visibility inspectable instead of hiding them in a footnote.

## Evidence And Caveats

Primary data source family:

- Pacific Dataviz Challenge 2026 official datasets, listed in `research/official_datasets_2026.csv`

Core generated artifacts:

| Artifact | Purpose |
| --- | --- |
| `artifacts/tables/dataset_profile.csv` | official dataset coverage profile |
| `data/processed/official_observations.csv` | normalized long-form observations |
| `artifacts/tables/adaptation_gap_index.csv` | baseline geography scores |
| `artifacts/tables/adaptation_gap_indicator_trace.csv` | row-level score trace |
| `artifacts/tables/eda_country_story_labels.csv` | geography story labels and caveats |
| `artifacts/tables/eda_monitoring_gap.csv` | monitoring/reporting status and story priorities |
| `artifacts/tables/eda_rank_volatility.csv` | rank fragility and sensitivity |
| `data/processed/app/*.json` and `*.geojson` | app-ready static data |
| `app/public/data/*` | public copies for the web app |

Important interpretation rules:

- The Adaptation Gap Index is comparative within the processed Pacific dataset.
- Current geometry is centroid fallback, not official boundary geometry.
- Missing monitoring rows are reporting gaps, not proof that infrastructure is absent.
- Reported-zero monitoring rows need source-semantics caution.
- Outlook rows are stress-test interpretation, not forecasts.
- Responsibility-context indicators are context only, not blame or score drivers.

## Repository Map

```text
research/      Challenge brief, official dataset inventory, prior-entry research
context/       Durable project memory, task ledger, story/design contracts, handoff notes
analysis/      Python package for ingestion, preprocessing, scoring, modeling, and EDA helpers
scripts/       Reproducible CLI entry points for data, analysis, and validation
configs/       Dataset, index, outlook, app-layer, and EDA configuration
data/          Raw cache, processed data, app exports, contracts, and external context
artifacts/     Tables, provenance, figures, and run outputs
app/           Vite/React/TypeScript atlas mockup and future app
tests/         Python unit tests for analysis helpers
```

Durable project context belongs under `context/`. Root files should remain entry points, metadata, or repository-level configuration.

## Quick Validation

Run these from the repo root:

```powershell
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
```

Root npm shortcuts:

```powershell
npm run validate:artifacts
npm run validate:tasks
npm run check:secrets
```

## Rebuild Data And Analysis

Profile official datasets:

```powershell
python scripts/profile_datasets.py --config configs/datasets.yml
```

Build processed observations:

```powershell
python scripts/make_dataset.py --config configs/datasets.yml
```

Build the baseline index:

```powershell
python scripts/build_gap_index.py --config configs/gap_index.yml
```

Build the outlook stress test:

```powershell
python scripts/run_outlook.py --config configs/outlook.yml
```

Build app-ready data:

```powershell
python scripts/build_app_data.py --config configs/app_layers.yml
python scripts/validate_data_contracts.py
```

Run script-first EDA:

```powershell
python scripts/run_eda.py --config configs/eda.yml
```

Run Python tests:

```powershell
python -m unittest discover tests -v
```

## Run The App Mockup

Install dependencies if needed:

```powershell
npm install
```

Start the development server:

```powershell
npm run app:dev
```

Build the app:

```powershell
npm run app:build
```

The current app is a reviewable mockup. It uses mock fixture data in `app/src/mock/mockAtlasData.ts` derived from current official-data artifacts. Final app-data wiring is still planned.

## Current Next Sprint

The next sprint is organized in `context/plans/mockup-revision-delegation-plan.md`.

Task ownership:

- `TASK-021`: Codex critique of the current mockup, complete
- `TASK-022`: Claude visual revision pass, next
- `TASK-019`: Codex data-agent Evidence Fingerprint Divergence analysis, can run in parallel
- `TASK-023`: Codex app-data wiring inventory, can run in parallel
- `TASK-024`: Codex QA before accepting Claude's visual revision

The most urgent visual issue from `TASK-021`: the desktop legend is hidden on first load because it sits inside a closed `<details>` element whose summary is hidden. Claude should fix that first.

## Collaboration Rules

- Codex is the orchestrator and QA reviewer.
- Claude may revise visual mockup files for `TASK-022`, but must not stage, commit, push, or alter methodology/data artifacts.
- Commits should be task-oriented.
- Commit messages must not include co-author trailers.
- Visual references are principle studies only. Do not copy publication identity, palettes, layouts, illustrations, or iconic treatments.

## Project Frame

Working title: **The Pacific Adaptation Gap Atlas**

Target artifact: an interactive GIS-style web atlas with:

- full-bleed Pacific map,
- layer controls,
- monitoring/data-quiet overlay,
- selected geography panel,
- rank uncertainty cues,
- source and method drawer,
- mobile bottom-sheet treatment,
- optional evidence-fingerprint similarity if `TASK-019` proves useful.
