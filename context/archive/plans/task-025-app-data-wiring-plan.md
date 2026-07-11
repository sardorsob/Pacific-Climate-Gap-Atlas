# TASK-025 App Data Wiring Implementation Plan

Date: 2026-06-30

Status: Implemented and verified. This plan records the completed TASK-025 work slice.

Goal: Replace evidence-bearing mock fixture usage with public/generated app data while preserving the accepted guided atlas behavior and caveats.

Architecture: Extend the Python app-data export so each geography carries monitoring, rank uncertainty, story/context, top-signal, and guarded outlook display fields. Add a TypeScript adapter that imports the generated JSON directly and exposes the existing `Geo` view model to the React app. Keep editorial constants such as default selection and label offsets in the app layer.

## Task Slices

1. Add failing Python tests for app-data enrichment fields.
   - Cover monitoring reported-zero versus missing rows.
   - Cover rank uncertainty fields.
   - Cover story/context fields and structured top-signal arrays.
   - Cover guarded 2030 outlook display recommendation.

2. Implement Python enrichment joins.
   - Add optional EDA table inputs to `scripts/build_app_data.py`.
   - Extend `analysis/preprocessing/app_data.py` to merge monitoring, rank, story, spatial context, and outlook-display fields by `geo_code`.
   - Preserve nullable monitoring count/year rather than converting missing rows to zero.

3. Strengthen contract validation.
   - Require `monitoring`, `rank`, `story`, `context`, and `outlook_display` objects in `geographies.json`.
   - Keep processed/public app copies byte-identical.

4. Regenerate public app data.
   - Run `python scripts/build_app_data.py --config configs/app_layers.yml`.
   - Run `python scripts/validate_data_contracts.py`.

5. Add TypeScript data adapter.
   - Create `app/src/lib/atlasData.ts`.
   - Import `app/public/data/geographies.json` and expose `Geo`, `ATLAS_GEOS`, `getGeo`, priority groups, story exemplars, label offsets, and the static fingerprint preview.
   - Preserve existing component-facing field names so visual components do not get rewritten during this task.

6. Repoint app components.
   - Replace imports from `app/src/mock/mockAtlasData.ts` with `app/src/lib/atlasData.ts`.
   - Leave `mockAtlasData.ts` only as historical reference if no component imports it.

7. Update task/context notes.
   - Mark `TASK-025` done after verification.
   - Record that TASK-026 can now use the generated data contract.

8. Verify.
   - `python -m unittest tests.analysis.test_app_data_export -v`
   - `python -m unittest tests.analysis.test_app_data_validation -v`
   - `python scripts/build_app_data.py --config configs/app_layers.yml`
   - `python scripts/validate_data_contracts.py`
   - `npm --prefix app run build`
   - `python scripts/check_secrets.py`
   - `python scripts/validate_task_statuses.py`
   - `python scripts/check_required_artifacts.py`
   - `git diff --check`
