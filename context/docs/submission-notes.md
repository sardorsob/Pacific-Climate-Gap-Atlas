# Submission Notes

## Competition

Pacific Dataviz Challenge 2026. Due date: August 31, 2026.

## Theme

Climate change.

## Working Title

Pacific Climate Evidence Atlas.

Direct subtitle: **How conditions and official records differ across 22 Pacific places.**

Readiness note (2026-07-20): the owner accepts the fullscreen map, evidence marks, visual identity, regional movement -> evidence visibility -> exploration story, TASK-078 Explorer UX contract, and completed TASK-082 Explorer QA matrix. TASK-079 through TASK-082 and returned repairs TASK-083 through TASK-085 are complete. TASK-057 is done with zero Ruff, Semgrep, and OSV findings, a warning-free budgeted build, and independent Checker approval. Deployment, sensitive wording, AI disclosure, final deployed-host review, and the submission form remain owner actions. Do not call the project submitted or deployed until those external release actions close.

## Submission Requirements To Track

| Requirement | Status | Evidence | Owner action |
| --- | --- | --- | --- |
| Use at least one official dataset | satisfied | `research/official_datasets_2026.csv`, `data/contracts/*.json`, `context/DATA_CARD.md` | Final source wording review |
| List all data sources | satisfied locally; form pending | `data/contracts/*.json`, `artifacts/provenance/dataset_pipeline_summary.json`, `artifacts/provenance/app_data_summary.json`, `artifacts/provenance/land_context_summary.json`, 14-item app Methods drawer | Copy reviewed list into submission form |
| Explain method and caveats | satisfied locally; owner read pending | `context/docs/methodology.md`, `context/MODEL_CARD.md`, repaired app Methods drawer | Final human read-through |
| Public interactive URL remains accessible until at least 31 August 2029 | not started | Deploy `app/dist/` after `npm run app:build`; preview with `npm run app:preview` | Choose host, record URL here, confirm durability |
| Shareable URL state and history | verified locally | `app/src/lib/urlState.ts`, `app/src/lib/urlState.test.ts`; browser smoke covered copied-scene restoration with deferred scroll, reload, Explore/layer/place push, scene replace, Back/Forward | Owner to recheck on deployed host |
| App bundle regression guard | satisfied locally | `python scripts/check_app_bundle_budget.py`; current JS 1,033,799 bytes and CSS 94,930 bytes. The 1,050,000/95,000-byte raw-asset limits are local engineering targets, not Challenge submission limits. | Re-run after deployment/build changes; record raw and gzip deltas and explicitly revise the checker if a justified correctness/accessibility change crosses the current CSS target |
| English or French dataviz/explanations | satisfied | Current app and docs are English | Final typo pass |
| AI-assisted work disclosure | needs owner wording | Progress log records AI tools; workflow keeps human/orchestrator review | Approve final disclosure text |
| Final accessibility/mobile review | local matrix accepted; deployed-host recheck pending | `artifacts/design/task-082/`, `artifacts/provenance/task_082_qa.json`; 164/164 checks, 43 frames | Recheck the deployed host |

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

The project has script-first EDA outputs for indicator forensics, country story labels, spatial typologies, trend/outlook display guidance, rank volatility, monitoring-gap GIS priorities, JSD nearest-neighbor evidence, and the reviewed regional movement/visibility package. `TASK-064` remains the visual/UI baseline; `TASK-074` through `TASK-076` replaced only its guided narrative, and `TASK-077` records the accepted pre-repair matrix. `TASK-079` through `TASK-081` implement the bounded Explorer repair; `TASK-082` records its passed and owner-accepted independent product matrix without changing the accepted identity or data. Final submission copy must follow `context/ARTISTIC_REDESIGN_BRIEF.md`; deployment, deployed-host review, final disclosure, and submission-form actions are still required.
