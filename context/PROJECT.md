# Project

## Current Phase

Accepted visual mockup revision; preparing app-data wiring and next analysis lanes before production implementation. Competition deadline: August 31, 2026.

## Status

The repository has a committed workflow scaffold, official dataset contracts, a reproducible processed data pipeline, a draft Adaptation Gap Index baseline, an app-optional Adaptation Gap Outlook baseline, static app-ready JSON/GeoJSON, script-first EDA outputs, story/design briefs, a Dataviz Inspiration audit, and an accepted React/Vite atlas mockup revision. Final public-data wiring and owner visual approval remain open.

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
| Evidence fingerprint divergence | planned | `TASK-019`; assigned to Codex data agent as a parallel analysis track |
| Static app data | done | `scripts/build_app_data.py` produces public JSON/GeoJSON layer inputs |
| EDA sprint | done | GIS context, coverage/data-desert, indicator-forensics, country-story, spatial-typology, trend/outlook, monitoring-gap, and story/design synthesis are complete |
| Dataviz inspiration audit | done | `context/DATAVIZ_INSPIRATION_AUDIT.md` records route sampling and original-project interaction lessons for map-first, climate, environmental, selected-geography, evidence-strip, and guided-tour patterns |
| GIS atlas app | accepted mockup revision | React/Vite concept includes centroid map composition, visible desktop legend, direct story labels, selected-anchor comparison cue, data-quiet map tags, story tour, source drawer, and responsive detail panel; still needs owner visual approval and final public-data wiring |
| Mockup revision sprint | mostly done | `TASK-021`, `TASK-022`, and `TASK-024` are complete; `TASK-023` app-data wiring inventory remains next |

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
- Completed `TASK-016` trend/outlook interpretation with display/withhold recommendations for stress-test layers.
- Completed `TASK-017` monitoring-gap GIS story analysis with priority quadrants and reporting-gap caveats.
- Completed `TASK-018` story and design synthesis with `STORY_BRIEF.md` and `DESIGN_BRIEF.md`.
- Started `TASK-006` visual mockup pass with a buildable React/Vite atlas concept for owner review; final app wiring remains open.
- Added `TASK-019` as a planned Evidence Fingerprint Divergence lane so JSD/KL ideas fit the official-data story without becoming a new leaderboard or overclaimed model.
- Completed `TASK-020` Dataviz Inspiration audit with live browser review of map/climate/environment references and updated the story, design, Claude mockup, decision, backlog, and memory context around full-bleed map, selected-anchor, compact evidence-strip, direct-label, and evidence-bearing-motion patterns.
- Organized the next delegated sprint: Codex owns mockup critique and QA, Claude owns the visual revision pass, a Codex data agent owns `TASK-019`, and a Codex app-data agent owns mock-to-public-data wiring inventory.
- Completed `TASK-021` mockup critique with a Claude-facing checklist in `context/plans/task-021-mockup-critique.md`; first priority is fixing the hidden desktop legend before visual polish.
- Completed and accepted `TASK-022` / `TASK-024`: Claude revised the visual mockup, Codex reviewed the code and context, applied small QA fixes, and prepared the accepted mockup revision for commit. Next app step is `TASK-023` mock-to-public-data wiring inventory.
