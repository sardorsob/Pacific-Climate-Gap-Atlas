# Submission Notes

## Competition

Pacific Dataviz Challenge 2026. Due date: August 31, 2026.

## Theme

Climate change.

## Working Title

The Pacific Adaptation Gap Atlas.

Narrative identity for the approved redesign: **The Shape of What We Know**.

Readiness note (2026-07-11): the five-scene redesign and `TASK-057` shareable-state/budget implementation plus hydration follow-ups are complete and remain in review for owner acceptance. Automated release gates pass; deployment, sensitive wording, AI disclosure, final human visual/accessibility review, and the submission form remain owner actions. Do not call the project submitted or deployed until those external actions occur.

## Submission Requirements To Track

| Requirement | Status | Evidence | Owner action |
| --- | --- | --- | --- |
| Use at least one official dataset | satisfied | `research/official_datasets_2026.csv`, `data/contracts/*.json`, `context/DATA_CARD.md` | Final source wording review |
| List all data sources | in-progress | `data/contracts/*.json`, `artifacts/provenance/dataset_pipeline_summary.json`, `artifacts/provenance/app_data_summary.json`, `artifacts/provenance/land_context_summary.json` | Copy final source list into submission form |
| Explain method and caveats | in-progress | `context/docs/methodology.md`, `context/MODEL_CARD.md`, app method drawer | Final human read-through |
| Public interactive URL remains accessible until at least 31 August 2029 | not started | Deploy `app/dist/` after `npm run app:build`; preview with `npm run app:preview` | Choose host, record URL here, confirm durability |
| Shareable URL state and history | verified locally | `app/src/lib/urlState.ts`, `app/src/lib/urlState.test.ts`; browser smoke covered copied-scene restoration with deferred scroll, reload, Explore/layer/place push, scene replace, Back/Forward | Owner to recheck on deployed host |
| App bundle budget | satisfied locally | `python scripts/check_app_bundle_budget.py`; JS 1,022,289 bytes; CSS 93,895 bytes | Re-run after deployment/build environment changes |
| English or French dataviz/explanations | satisfied | Current app and docs are English | Final typo pass |
| AI-assisted work disclosure | needs owner wording | Progress log records AI tools; workflow keeps human/orchestrator review | Approve final disclosure text |
| Final accessibility/mobile review | owner review pending | `TASK-031` baseline audit plus `TASK-057` automated/browser smoke; six requested viewport dimensions still need a human visual/focus/color-deficiency pass | Owner keyboard/mobile/accessibility sign-off |

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

The project has script-first EDA outputs for indicator forensics, country story labels, spatial typologies, trend/outlook display guidance, rank volatility, monitoring-gap GIS priorities, and JSD nearest-neighbor evidence. `TASK-057` verified the implemented five-scene app locally; final submission copy should follow `context/ARTISTIC_REDESIGN_BRIEF.md` after the owner completes the remaining review and deployment actions.
