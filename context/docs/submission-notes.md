# Submission Notes

## Competition

Pacific Dataviz Challenge 2026. Due date: August 31, 2026.

## Theme

Climate change.

## Working Title

The Pacific Adaptation Gap Atlas.

## Submission Requirements To Track

| Requirement | Status | Evidence | Owner action |
| --- | --- | --- | --- |
| Use at least one official dataset | satisfied | `research/official_datasets_2026.csv`, `data/contracts/*.json`, `context/DATA_CARD.md` | Final source wording review |
| List all data sources | in-progress | `data/contracts/*.json`, `artifacts/provenance/dataset_pipeline_summary.json`, `artifacts/provenance/app_data_summary.json`, `artifacts/provenance/land_context_summary.json` | Copy final source list into submission form |
| Explain method and caveats | in-progress | `context/docs/methodology.md`, `context/MODEL_CARD.md`, app method drawer | Final human read-through |
| Public interactive URL remains accessible until at least 31 August 2029 | not started | Deploy `app/dist/` after `npm run app:build`; preview with `npm run app:preview` | Choose host, record URL here, confirm durability |
| English or French dataviz/explanations | satisfied | Current app and docs are English | Final typo pass |
| AI-assisted work disclosure | needs owner wording | Progress log records AI tools; workflow keeps human/orchestrator review | Approve final disclosure text |
| Final accessibility/mobile review | in-progress | `TASK-031` accessibility audit | Human keyboard/mobile check before submission |

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

The project has script-first EDA outputs for indicator forensics, country story labels, spatial typologies, trend/outlook display guidance, rank volatility, monitoring-gap GIS priorities, and TASK-018 story/design briefs. Final submission copy should follow the approved visual concept and app build.
