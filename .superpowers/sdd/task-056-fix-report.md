# TASK-056 review follow-up

## Status

Implemented the independent review fixes from commit `616e457` without changing generated data, scores, or story behavior.

## Files changed

- `app/src/components/map/useAtlasMap.ts`
  - Removed the unused `geosRef` and synchronization effect.
  - Resized the MapLibre map in `handleLoad` before the first projection refresh, matching the previous `AtlasMap` load path.
- `app/src/components/map/MapOverlay.tsx`
  - Removed the unused `EMPTY_OVERLAY` constant.
- `scripts/validate_data_contracts.py`
  - Removed the unused `VALIDATED_JSON_FILES` constant.
- `context/TASKS.md`
- `context/ANALYSIS_BACKLOG.md`
- `context/plans/tasks-056-057-simplification-readiness-implementation-plan.md`
  - Updated moved mockup-instruction references to the archive path and marked them historical.
- `context/archive/CLAUDE_MOCKUP_INSTRUCTIONS.md`
  - Corrected the archive banner to record that TASK-056 has completed the move.

## Verification

- `npm --prefix app run test`: 9 files, 31 tests passed.
- `python -m unittest tests.analysis.test_app_data_export tests.analysis.test_app_data_validation -v`: 9 tests passed; `python scripts/validate_data_contracts.py`: `PASS app data contracts`.
- `npm --prefix app run build`: passed; existing large JavaScript chunk warning remains (1,018.83 kB, 286.14 kB gzip).
- `git diff --check`: passed.
- Stale-link check found zero non-archive references to `context/CLAUDE_MOCKUP_INSTRUCTIONS.md`; dead-symbol check found zero references to `geosRef`, `EMPTY_OVERLAY`, or `VALIDATED_JSON_FILES`.

## Concerns

- No manual browser smoke was run for the first-load resize change; source ordering now explicitly matches the old `refreshOverlay` path.
- The production build retains the pre-existing chunk-size warning.
