# Pacific Adaptation Gap Atlas

An exploratory, map-first data visualization project for the **Pacific Dataviz Challenge 2026** climate-change theme.

Competition deadline: **August 31, 2026**

## What This Project Is

The Pacific Adaptation Gap Atlas is an interactive web atlas about climate adaptation signals across Pacific geographies. It combines official climate, stress, monitoring, and capacity datasets into a careful exploratory view of where climate pressure and visible adaptation capacity appear out of balance.

The project is being built as a web visualization because the strongest competition entries are interactive, visual, and story-driven. The intended final artifact is not a generic dashboard. It is a GIS-flavored atlas with a guided story path and exploratory map controls.

## Core Question

> Where do official climate-pressure, observed-stress, adaptation-capacity, monitoring, and missingness signals appear most out of balance across Pacific geographies?

The atlas is designed to help readers inspect:

- where the adaptation gap appears wide,
- what is driving the gap,
- where official evidence is strong or thin,
- where monitoring rows report zero,
- where monitoring rows are missing,
- why rank order should be treated cautiously.

The central story is not "who is worst." It is:

> Across Pacific geographies, climate pressure and visible adaptation capacity are unevenly matched, and so is the official data behind the comparison.

## Data

The project uses official Pacific Dataviz Challenge 2026 datasets listed in:

```text
research/official_datasets_2026.csv
```

Current priority dataset families include:

- sea-surface temperature anomalies,
- surface temperature anomalies,
- rainfall anomalies,
- sea-level anomalies,
- directly affected persons attributed to disasters,
- meteorological monitoring network,
- power generation,
- fisheries management measures,
- greenhouse gas emissions per capita as context only.

Generated analysis and app-ready outputs live under:

```text
artifacts/
data/processed/
app/public/data/
```

Important caveats:

- The Adaptation Gap Index is a comparative screen, not a definitive rank of need or vulnerability.
- Current map geometry uses a MapLibre canvas with Natural Earth land context under centroid fallback points; scored geographies are not official boundary polygons.
- Missing monitoring rows mean a reporting gap in the processed official data, not confirmed absence of infrastructure.
- Outlook outputs are stress-test context, not forecasts.

## Repository Structure

```text
research/      Challenge brief, dataset inventory, and prior-entry research
context/       Project memory, story/design briefs, data cards, decisions, and handoff notes
analysis/      Python analysis package for processing, scoring, modeling, and EDA
scripts/       Reproducible command-line entry points
configs/       Dataset, index, outlook, EDA, and app-layer configuration
data/          Raw cache, processed data, contracts, and app-ready exports
artifacts/     Tables, provenance, figures, and run outputs
app/           Vite/React/TypeScript atlas app and current mockup shell
tests/         Python tests for analysis helpers
```

The most important project context files are:

```text
context/STORY_BRIEF.md
context/DESIGN_BRIEF.md
context/ARTISTIC_REDESIGN_BRIEF.md
context/DATA_CARD.md
context/MODEL_CARD.md
context/HANDOVER.md
```

## Install

Python requirements are declared in `pyproject.toml`.

```powershell
python -m pip install -e .
```

JavaScript dependencies are declared in the root workspace and app package files.

```powershell
npm install
```

## Validate The Repo

```powershell
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
```

Equivalent npm shortcuts:

```powershell
npm run validate:artifacts
npm run validate:tasks
npm run check:secrets
```

## Rebuild Data Products

Profile official datasets:

```powershell
python scripts/profile_datasets.py --config configs/datasets.yml
```

Build processed observations:

```powershell
python scripts/make_dataset.py --config configs/datasets.yml
```

Build the baseline adaptation gap index:

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

Build the Pacific land-context basemap:

```powershell
python scripts/build_land_context.py
```

Run EDA:

```powershell
python scripts/run_eda.py --config configs/eda.yml
```

## Run The App

Start the atlas mockup:

```powershell
npm run app:dev
```

Build the app:

```powershell
npm run app:build
```

Preview the production build:

```powershell
npm run app:preview
```

Deploy the static contents of `app/dist/` to the final host. Record the public URL in `context/docs/submission-notes.md` and keep it available through August 31, 2029.

The current app is a production-oriented seven-beat baseline with generated data, MapLibre/Natural Earth map context, selected-place trace and JSD evidence, and post-map interaction/accessibility work complete. It is not yet the final competition submission.

The approved next phase is **The Shape of What We Know**, a five-scene artistic redesign that makes uneven official-data visibility the governing story. `TASK-048` corrected score-input/context semantics; the remaining work is `TASK-049` through `TASK-057`: approve desktop/mobile concepts, replace nested story scrolling, build the five scenes and evidence marks, simplify exploration, remove redundant machinery, add shareable URL state, and complete final QA. The full contract is in `context/ARTISTIC_REDESIGN_BRIEF.md`.

## Current Frame

Working title: **The Pacific Adaptation Gap Atlas**

Target artifact: an interactive GIS-style web atlas for the Pacific Dataviz Challenge 2026.

Primary experience:

- current guided 7-beat baseline over a full-bleed MapLibre Pacific map with visual land context,
- approved five-scene native-scroll replacement built around reveal, subtract, separate, compare, rearrange, and return,
- persistent "Explore freely" handoff into the full atlas controls,
- adaptation gap, pressure, capacity, monitoring/data visibility, and rank-fragility views,
- selected geography detail panel,
- app-wired selected-place Evidence Fingerprint nearest neighbors with exact JSD and caveats,
- source and methodology drawer,
- mobile-friendly bottom-sheet story and detail interaction.
