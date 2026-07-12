# Submission Notes

## Competition

Pacific Dataviz Challenge 2026. Due date: August 31, 2026.

## Theme

Climate change.

## Working Title

The Pacific Adaptation Gap Atlas.

Narrative identity for the approved redesign: **The Shape of What We Know**.

Readiness note (2026-07-12): `TASK-057` shareable-state, history, hydration, and budget checks passed, but owner visual QA returned the release gate to `needs-fix`. The owner approved `TASK-058`'s fullscreen-stage correction; `TASK-059` through `TASK-063` are done, and `TASK-064` passed automated, responsive, interaction, accessibility, and screenshot gates but remains `in-review` for owner visual acceptance. Deployment, sensitive wording, AI disclosure, final human visual/accessibility review, and the submission form remain owner actions. Do not call the project submitted or deployed until those external actions occur.

## Submission Requirements To Track

| Requirement | Status | Evidence | Owner action |
| --- | --- | --- | --- |
| Use at least one official dataset | satisfied | `research/official_datasets_2026.csv`, `data/contracts/*.json`, `context/DATA_CARD.md` | Final source wording review |
| List all data sources | in-progress | `data/contracts/*.json`, `artifacts/provenance/dataset_pipeline_summary.json`, `artifacts/provenance/app_data_summary.json`, `artifacts/provenance/land_context_summary.json` | Copy final source list into submission form |
| Explain method and caveats | in-progress | `context/docs/methodology.md`, `context/MODEL_CARD.md`, app method drawer | Final human read-through |
| Public interactive URL remains accessible until at least 31 August 2029 | not started | Deploy `app/dist/` after `npm run app:build`; preview with `npm run app:preview` | Choose host, record URL here, confirm durability |
| Shareable URL state and history | verified locally | `app/src/lib/urlState.ts`, `app/src/lib/urlState.test.ts`; browser smoke covered copied-scene restoration with deferred scroll, reload, Explore/layer/place push, scene replace, Back/Forward | Owner to recheck on deployed host |
| App bundle budget | satisfied locally | `python scripts/check_app_bundle_budget.py`; JS 1,024,043 bytes; CSS 94,829 bytes | Re-run after deployment/build environment changes |
| English or French dataviz/explanations | satisfied | Current app and docs are English | Final typo pass |
| AI-assisted work disclosure | needs owner wording | Progress log records AI tools; workflow keeps human/orchestrator review | Approve final disclosure text |
| Final accessibility/mobile review | owner review pending | `TASK-064` Maker captured 25 frames across six target sizes plus 844x390, verified 44px mobile/progress targets, visible focus, reading order, reduced motion, redundant monitoring/rank encodings, and zero overflow | Owner visual, keyboard, mobile, and color-deficiency sign-off |

## Draft Description

A GIS-first atlas that helps readers explore where Pacific climate signals, observed stress, and adaptation-capacity proxies appear most out of balance.

## Source Evidence Bundle

- Official dataset inventory: `research/official_datasets_2026.csv`
- Dataset contracts and source URLs: `data/contracts/*.json`
- Data pipeline provenance: `artifacts/provenance/dataset_pipeline_summary.json`
- Gap-index provenance: `artifacts/provenance/gap_index_summary.json`
- App-data provenance: `artifacts/provenance/app_data_summary.json`
- Natural Earth land-context provenance: `artifacts/provenance/land_context_summary.json`
- Methodology: `context/docs/methodology.md`
- Data and model caveats: `context/DATA_CARD.md`, `context/MODEL_CARD.md`

## Deployment Notes

Build with `npm run app:build`, preview with `npm run app:preview`, and deploy the static `app/dist/` directory. Record the final public URL here before submission.

- Final public URL: pending
- Host/platform: pending
- Availability commitment: keep public through August 31, 2029

## Current Analysis State

The project has script-first EDA outputs for indicator forensics, country story labels, spatial typologies, trend/outlook display guidance, rank volatility, monitoring-gap GIS priorities, and JSD nearest-neighbor evidence. `TASK-064` verified the fullscreen premise plus five-scene app locally and remains `in-review`; final submission copy should follow `context/ARTISTIC_REDESIGN_BRIEF.md` after the owner completes visual/accessibility review and deployment actions.
