# Project

## Current Phase

Analysis sprint before app shell. Competition deadline: August 31, 2026.

## Status

The repository has a committed workflow scaffold, official dataset contracts, a reproducible processed data pipeline, a draft Adaptation Gap Index baseline, an app-optional Adaptation Gap Outlook baseline, static app-ready JSON/GeoJSON, and script-first EDA outputs for the Pacific Dataviz Challenge 2026 interactive GIS atlas.

## Working Title

The Pacific Adaptation Gap Atlas

## Current Thesis

Pacific island countries face climate burdens they did little to create, but the size and shape of the adaptation gap varies by geography. The project should help readers explore where climate signals, observed stress, monitoring coverage, and response-capacity proxies appear most out of balance.

## Feature Table

| Area | Status | Notes |
| --- | --- | --- |
| Research source folder | present | `research/` includes brief, official dataset inventory, past winners, and review board |
| Workflow shell | done | all durable project Markdown lives under `context/` |
| Dataset profile | done | `artifacts/tables/dataset_profile.csv` and `data/contracts/*.json` cover nine priority official datasets |
| Data science pipeline | done | `scripts/make_dataset.py` produces normalized observations, geography lookup, app summary, and provenance |
| Adaptation Gap Index | done | `scripts/build_gap_index.py` produces geography scores plus indicator trace |
| Outlook model | done | trend stress-test baseline is methodology-ready and app-optional |
| Static app data | done | `scripts/build_app_data.py` produces public JSON/GeoJSON layer inputs |
| EDA sprint | in progress | GIS context, coverage/data-desert, indicator-forensics, country-story, spatial-typology, and monitoring-gap lanes are complete |
| GIS atlas app | planned | React/Vite/MapLibre scaffold will consume static app-ready data after analysis synthesis |

## Last Session Notes

- Approved structure: context-first monorepo.
- Approved headline: broader adaptation gap, with monitoring as one diagnostic layer.
- Copied reference workflow kits into ignored local context paths.
- Completed `TASK-001` live dataset profiling and contracts for nine priority official datasets.
- Completed `TASK-002` processed data pipeline with local raw-cache support.
- Completed `TASK-003` baseline Adaptation Gap Index and methodology update.
- Completed `TASK-004` Adaptation Gap Outlook baseline and model-card update.
- Completed `TASK-005` app-data export with centroid GeoJSON, layer metadata, country details, and public app copies.
- Paused TASK-006 app build to run deeper GIS/story EDA first.
- Completed `TASK-009` script-first EDA foundation with analysis backlog, repeatable tables, and provenance.
- Completed `TASK-010` GIS context enrichment with descriptive subregion/status context and boundary-neutral caveats.
- Completed `TASK-011` coverage/data-desert analysis with geography-level and dataset-level coverage tables.
- Completed `TASK-012` indicator-level forensics with row-level trace preservation and within-dataset outlier flags.
- Completed `TASK-013` country story labels with pressure/capacity summaries, coverage caveats, and non-causal interpretation guardrails.
- Completed `TASK-015` spatial typologies and subregion comparisons with rule-based labels and regional caveats.
- Completed `TASK-017` monitoring-gap GIS story analysis with priority quadrants and reporting-gap caveats.
