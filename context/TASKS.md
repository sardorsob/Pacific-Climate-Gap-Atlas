# Tasks

Allowed statuses: `pending`, `in-progress`, `in-review`, `needs-fix`, `blocked`, `done`, `obsolete`.

## TASK-000
- Phase: scaffold
- Title: Initialize context-first project workflow shell
- Depends on: none
- Assigned agent: Codex
- Contract refs: context/AGENTS.md, context/SCOPE.md
- Data refs: research/pacific_dataviz_2026_research_brief.md
- Scientific refs: context/DATA_CARD.md
- User value / decision value: Makes the project understandable and ready for task-based commits before feature work starts.
- Functional notes: Keep all durable planning/status/problem/task Markdown under `context/`.
- Statistical notes: No model or index results are produced by this task.
- Edge cases: Copied reference workflow kits must remain ignored and uncommitted.
- Files to create/modify: `.gitignore`, `README.md`, `pyproject.toml`, `package.json`, `configs/*`, `context/*`, `analysis/*`, `scripts/*`, `app/*`, `data/*`, `artifacts/*`, `tests/*`
- Artifacts to produce: initial scaffold and validation scripts
- Acceptance criteria: Required context files exist; reference kits are ignored; validation scripts pass; initial commit uses scaffold commit message.
- Verification commands: `python scripts/check_required_artifacts.py`; `python scripts/validate_task_statuses.py`; `python scripts/check_secrets.py`
- Manual QA: Inspect `git status --short --ignored` and confirm ignored workflow kits are not staged.
- QA notes: Passed `python scripts/check_required_artifacts.py`, `python scripts/validate_task_statuses.py`, and `python scripts/check_secrets.py`. Verified copied workflow kits are ignored by Git while project context files are trackable.
- Attempts: 1
- Max attempts: 2
- Attempt log: Initial scaffold implementation.
- Status: done

## TASK-001
- Phase: data-audit
- Title: Profile official 2026 datasets and create dataset contracts
- Depends on: TASK-000
- Assigned agent: unassigned
- Contract refs: context/DATA_CARD.md, configs/datasets.yml
- Data refs: research/official_datasets_2026.csv
- Scientific refs: context/ASSUMPTIONS.md
- User value / decision value: Determines which official datasets are safe to use in the atlas and index.
- Functional notes: Use `scripts/profile_datasets.py` to produce row counts, geography coverage, year ranges, missingness, and API errors.
- Statistical notes: Do not fill missing values; expose coverage explicitly.
- Edge cases: Some official API URLs may return 422; record failures and fallback source links.
- Files to create/modify: `analysis/io/*`, `scripts/profile_datasets.py`, `data/contracts/*`, `artifacts/tables/*`, `context/DATA_CARD.md`
- Artifacts to produce: dataset profile table and contracts
- Acceptance criteria: Each priority dataset has status, row count, geography count, year range, and caveat notes.
- Verification commands: `python scripts/profile_datasets.py --config configs/datasets.yml`
- Manual QA: Spot-check sea-level and monitoring datasets against the official CSV inventory.
- QA notes:
- Attempts: 0
- Max attempts: 3
- Attempt log:
- Status: pending

## TASK-002
- Phase: data-pipeline
- Title: Build reproducible app-ready dataset pipeline
- Depends on: TASK-001
- Assigned agent: unassigned
- Contract refs: context/DATA_CARD.md, configs/datasets.yml
- Data refs: data/raw, data/processed
- Scientific refs: context/ASSUMPTIONS.md
- User value / decision value: Lets the website consume stable JSON/GeoJSON without live API fragility.
- Functional notes: Fetch official data, normalize schemas, join geography lookup, export app-ready files.
- Statistical notes: Preserve original values and units in long-form tables before deriving scores.
- Edge cases: Geography codes may differ across datasets; create a lookup table with aliases.
- Files to create/modify: `scripts/fetch_official_data.py`, `scripts/make_dataset.py`, `analysis/preprocessing/*`, `data/processed/*`, `data/external/*`
- Artifacts to produce: processed long table, geography lookup, app JSON/GeoJSON draft
- Acceptance criteria: Pipeline can be rerun and produces deterministic files with row-count logs.
- Verification commands: `python scripts/make_dataset.py --config configs/datasets.yml`
- Manual QA: Confirm app-ready files include source references and last-updated metadata.
- QA notes:
- Attempts: 0
- Max attempts: 3
- Attempt log:
- Status: pending

## TASK-003
- Phase: methodology
- Title: Implement Adaptation Gap Index baseline
- Depends on: TASK-002
- Assigned agent: unassigned
- Contract refs: configs/gap_index.yml, context/ASSUMPTIONS.md
- Data refs: data/processed
- Scientific refs: context/DATA_CARD.md
- User value / decision value: Creates the central comparison layer for the atlas.
- Functional notes: Compute climate pressure, capacity, adaptation gap score, and missingness flags.
- Statistical notes: Use transparent percentile-rank normalization; do not impute primary score values.
- Edge cases: Geographies without capacity data should show insufficient-data state rather than a fake score.
- Files to create/modify: `analysis/features/gap_index.py`, `scripts/build_gap_index.py`, `artifacts/tables/*`, `context/docs/methodology.md`
- Artifacts to produce: index table, methodology note, score distribution figure if useful
- Acceptance criteria: Each published score traces back to included indicators and missingness flags.
- Verification commands: `python scripts/build_gap_index.py --config configs/gap_index.yml`
- Manual QA: Review top and bottom ranked geographies for obvious data artifacts.
- QA notes:
- Attempts: 0
- Max attempts: 3
- Attempt log:
- Status: pending

## TASK-004
- Phase: modeling
- Title: Build Adaptation Gap Outlook baseline
- Depends on: TASK-003
- Assigned agent: unassigned
- Contract refs: configs/outlook.yml, context/MODEL_CARD.md
- Data refs: data/processed
- Scientific refs: context/ASSUMPTIONS.md, context/EXPERIMENTS.md
- User value / decision value: Adds a cautious future-facing layer if the data supports it.
- Functional notes: Estimate climate-signal trends and combine with capacity scenarios.
- Statistical notes: Use time-aware evaluation and compare against a naive baseline.
- Edge cases: Sparse time series should be excluded from projections and labeled in the app.
- Files to create/modify: `analysis/modeling/outlook.py`, `analysis/evaluation/*`, `scripts/run_outlook.py`, `artifacts/logs/runs/*`, `context/MODEL_CARD.md`, `context/EXPERIMENTS.md`
- Artifacts to produce: run bundle, metrics, projection table, model card update
- Acceptance criteria: Outlook results include uncertainty/caveat fields and are not described as operational predictions.
- Verification commands: `python scripts/run_outlook.py --config configs/outlook.yml`
- Manual QA: Compare outlook rankings to current gap rankings and investigate surprises.
- QA notes:
- Attempts: 0
- Max attempts: 3
- Attempt log:
- Status: pending

## TASK-005
- Phase: app-data
- Title: Export GIS layer data for the web app
- Depends on: TASK-003
- Assigned agent: unassigned
- Contract refs: configs/app_layers.yml
- Data refs: data/processed
- Scientific refs: context/DATA_CARD.md
- User value / decision value: Provides stable, documented data inputs for the atlas UI.
- Functional notes: Convert scored geography data into app-ready GeoJSON/JSON with metadata.
- Statistical notes: Keep raw values and score fields separate.
- Edge cases: Missing geometries should fall back to centroids or disabled map states.
- Files to create/modify: `scripts/build_app_data.py`, `data/processed/app/*`, `app/public/data/*`
- Artifacts to produce: atlas geographies GeoJSON, layer metadata JSON, country details JSON
- Acceptance criteria: App data passes contract validation and includes source/methodology references.
- Verification commands: `python scripts/build_app_data.py --config configs/app_layers.yml`; `python scripts/validate_data_contracts.py`
- Manual QA: Open exported JSON and confirm geography code/name consistency.
- QA notes:
- Attempts: 0
- Max attempts: 3
- Attempt log:
- Status: pending

## TASK-006
- Phase: app
- Title: Build GIS atlas app shell
- Depends on: TASK-005
- Assigned agent: unassigned
- Contract refs: context/SCOPE.md, configs/app_layers.yml
- Data refs: app/public/data
- Scientific refs: context/docs/methodology.md
- User value / decision value: Gives users a map-first experience instead of a generic dashboard.
- Functional notes: Implement map canvas, layer controls, side panel, source drawer, and responsive layout.
- Statistical notes: The UI must show missingness and source caveats near score displays.
- Edge cases: Offline or missing app data should show a clear stale/unavailable state.
- Files to create/modify: `app/src/*`, `app/public/data/*`, `app/package.json`
- Artifacts to produce: buildable app shell
- Acceptance criteria: `npm --prefix app run build` succeeds after dependencies are installed.
- Verification commands: `npm --prefix app run build`
- Manual QA: Desktop and mobile viewport smoke checks.
- QA notes:
- Attempts: 0
- Max attempts: 3
- Attempt log:
- Status: pending

## TASK-007
- Phase: polish
- Title: Add methodology, accessibility, and submission readiness
- Depends on: TASK-006
- Assigned agent: unassigned
- Contract refs: context/HANDOVER.md, context/docs/submission-notes.md
- Data refs: artifacts/provenance
- Scientific refs: context/DATA_CARD.md, context/MODEL_CARD.md
- User value / decision value: Makes the entry credible and competition-ready.
- Functional notes: Add source drawer, method text, keyboard states, contrast checks, and final handoff.
- Statistical notes: Make caveats visible without burying the core atlas.
- Edge cases: If Outlook model is weak, ship it as methodology note or remove it from app.
- Files to create/modify: `app/src/*`, `context/HANDOVER.md`, `context/docs/submission-notes.md`, `artifacts/provenance/*`
- Artifacts to produce: final handoff, source list, QA notes
- Acceptance criteria: App is publicly deployable and sources/methods are visible.
- Verification commands: `npm --prefix app run build`; `python scripts/check_secrets.py`
- Manual QA: Mobile, keyboard, source links, and submission-form dry run.
- QA notes:
- Attempts: 0
- Max attempts: 3
- Attempt log:
- Status: pending

## TASK-008
- Phase: workflow
- Title: Record collaboration, parallelization, and commit authorship rules
- Depends on: TASK-000
- Assigned agent: Codex
- Contract refs: context/AGENTS.md, context/development_rules.md, context/CURSOR_RULES.md
- Data refs: none
- Scientific refs: none
- User value / decision value: Preserves user workflow preferences for future sessions and agents.
- Functional notes: Document that independent work should be parallelized, orchestrator review remains required, commits happen task-by-task, and commit trailers must not include assistant co-authorship.
- Statistical notes: No data or model work.
- Edge cases: Do not alter copied workflow-kit reference files because they are ignored local context.
- Files to create/modify: context/AGENTS.md, context/development_rules.md, context/CURSOR_RULES.md, context/DECISIONS.md, context/TASKS.md
- Artifacts to produce: durable workflow rule update
- Acceptance criteria: Rules are visible in the agent-facing context files; validation scripts pass; commit has no co-author trailer.
- Verification commands: `python scripts/validate_task_statuses.py`; `python scripts/check_secrets.py`
- Manual QA: Inspect latest commit body after commit.
- QA notes: Passed task-status validation and secret scan before commit.
- Attempts: 1
- Max attempts: 1
- Attempt log: Recorded user baseline workflow rules in context files.
- Status: done
