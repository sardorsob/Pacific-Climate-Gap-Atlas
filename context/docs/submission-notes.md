# Submission Notes

## Competition

Pacific Dataviz Challenge 2026. Due date: August 31, 2026.

## Theme

Climate change.

## Working Title

Pacific Climate Evidence Atlas.

Direct subtitle: **How conditions and official records differ across 22 Pacific places.**

Readiness note (2026-07-17): the owner accepts the fullscreen map, evidence marks, visual identity, and regional movement -> evidence visibility -> exploration story. A focused Explorer usability repair is now planned under `TASK-078`–`TASK-082` for reversible diagnostic navigation, dismissal history, responsive controls, handoff sizing, temporary copy, and place-level evidence continuity. `TASK-057` also remains `needs-fix` for pre-existing lint, local-script static-analysis, and development-dependency findings. Deployment, sensitive wording, AI disclosure, final human review, and the submission form remain owner actions. Do not call the project submitted or deployed until both UX and release gates close.

## Submission Requirements To Track

| Requirement | Status | Evidence | Owner action |
| --- | --- | --- | --- |
| Use at least one official dataset | satisfied | `research/official_datasets_2026.csv`, `data/contracts/*.json`, `context/DATA_CARD.md` | Final source wording review |
| List all data sources | satisfied locally; form pending | `data/contracts/*.json`, `artifacts/provenance/dataset_pipeline_summary.json`, `artifacts/provenance/app_data_summary.json`, `artifacts/provenance/land_context_summary.json`, 14-item app Methods drawer | Copy reviewed list into submission form |
| Explain method and caveats | satisfied locally; owner read pending | `context/docs/methodology.md`, `context/MODEL_CARD.md`, repaired app Methods drawer | Final human read-through |
| Public interactive URL remains accessible until at least 31 August 2029 | not started | Deploy `app/dist/` after `npm run app:build`; preview with `npm run app:preview` | Choose host, record URL here, confirm durability |
| Shareable URL state and history | verified locally | `app/src/lib/urlState.ts`, `app/src/lib/urlState.test.ts`; browser smoke covered copied-scene restoration with deferred scroll, reload, Explore/layer/place push, scene replace, Back/Forward | Owner to recheck on deployed host |
| App bundle budget | satisfied locally | `python scripts/check_app_bundle_budget.py`; JS 1,029,959 bytes; CSS 94,411 bytes | Re-run after deployment/build environment changes |
| English or French dataviz/explanations | satisfied | Current app and docs are English | Final typo pass |
| AI-assisted work disclosure | needs owner wording | Progress log records AI tools; workflow keeps human/orchestrator review | Approve final disclosure text |
| Final accessibility/mobile review | prior baseline accepted; Explorer repair pending | `artifacts/design/task-077/`, `artifacts/provenance/task_077_qa.json`; planned `TASK-082` matrix | Accept TASK-082, then recheck the deployed host |

## Draft Description

A regional atlas that shows how safely managed drinking-water access and renewable-energy share have moved in different directions across Pacific places, then makes the uneven official record behind comparison visible before opening into island-by-island exploration.

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

The project has script-first EDA outputs for indicator forensics, country story labels, spatial typologies, trend/outlook display guidance, rank volatility, monitoring-gap GIS priorities, JSD nearest-neighbor evidence, and the reviewed regional movement/visibility package. `TASK-064` remains the visual/UI baseline; `TASK-074` through `TASK-076` replaced only its guided narrative, and `TASK-077` records the accepted pre-repair matrix. `TASK-078`–`TASK-082` now own the bounded Explorer repair without changing that identity or data. Final submission copy must follow `context/ARTISTIC_REDESIGN_BRIEF.md`; TASK-082 acceptance, TASK-057 release disposition, and deployment actions are still required.
