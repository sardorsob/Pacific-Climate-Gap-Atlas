# Handover

## Current State

The repository is initialized as a context-first GIS/data-science project. `TASK-001` through `TASK-005` are complete: nine priority official datasets have been profiled, contracted, cached, normalized, scored into a baseline Adaptation Gap Index, stress-tested with an app-optional outlook baseline, and exported into static app-ready JSON/GeoJSON. The core EDA/story sprint is complete, a reviewable React/Vite mockup exists, `TASK-020` records a Dataviz Inspiration audit, and the next delegated sprint is organized in `context/plans/mockup-revision-delegation-plan.md`.

## How To Validate The Scaffold

```powershell
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
```

## How To Rebuild The Dataset Profile

```powershell
python scripts/profile_datasets.py --config configs/datasets.yml
```

If `python` is not on PATH inside Codex Desktop, use the bundled runtime shown by `load_workspace_dependencies`.

## How To Rebuild Processed Data

```powershell
python scripts/make_dataset.py --config configs/datasets.yml
```

The script uses `data/raw/official/*.csv` first. If you manually download official SDMX CSV files, use the filenames listed in `data/raw/README.md`.

## How To Rebuild The Gap Index

```powershell
python scripts/build_gap_index.py --config configs/gap_index.yml
```

## How To Rebuild The Outlook

```powershell
python scripts/run_outlook.py --config configs/outlook.yml
```

## How To Rebuild App Data

```powershell
python scripts/build_app_data.py --config configs/app_layers.yml
python scripts/validate_data_contracts.py
```

This writes app data under `data/processed/app/`, mirrors the website-facing files to `app/public/data/`, and records `artifacts/provenance/app_data_summary.json`.

## GIS Context

`data/external/geography_context.csv` adds descriptive subregion, political-status, administering/sovereign authority, and island-group context for all scored geographies. Keep these fields outside score calculations. Review sensitive status wording before publication and keep centroid-first mapping until a boundary source is chosen.

## How To Rebuild The EDA Foundation

```powershell
python scripts/run_eda.py --config configs/eda.yml
```

This writes the script-first EDA tables under `artifacts/tables/` and records `artifacts/provenance/eda_summary.json`. It now includes coverage deep dives, indicator forensics, country story labels, rank volatility, trend profiles, and monitoring-gap GIS story priorities. Planned `TASK-019` will add evidence fingerprint divergence outputs if implemented. Read `context/ANALYSIS_BRIEF.md`, `context/STORY_BRIEF.md`, `context/DESIGN_BRIEF.md`, `context/DATAVIZ_INSPIRATION_AUDIT.md`, and `context/INFORMATION_DIVERGENCE_PLAN.md` before resuming app or design work around the similarity layer.

## Next Recommended Work

1. Hand `TASK-022` to Claude using `context/CLAUDE_MOCKUP_INSTRUCTIONS.md` and `context/plans/task-021-mockup-critique.md`.
2. Ask Claude to fix the hidden desktop legend first, then strengthen map-first hierarchy, selected-anchor comparison, data-quiet map callouts, compact evidence strips, and mobile states.
3. Run `TASK-019` in parallel through a Codex data agent if the team wants real Evidence Fingerprint Divergence before final app wiring.
4. Run `TASK-023` in parallel as a mock-data-to-public-data wiring inventory.
5. Run `TASK-024` after Claude finishes: Codex QA reviews visuals, build, caveats, accessibility basics, and changed files before any commit.

## Known Caveats

- App dependencies are declared but not installed.
- Python dependencies are declared but not installed.
- The SDMX fetch helper avoids undeclared runtime dependencies, but uses a Windows PowerShell fallback because the endpoint returned `422` to Python standard-library HTTP.
- Raw official CSV cache files under `data/raw/official/` are ignored by Git.
- The gap index is a draft comparative baseline. The app must show indicator counts, trace details, and methodology caveats near the score.
- The outlook baseline is app-optional. Only include it in the interface with visible caveats and row-level notes.
- TASK-005 GIS exports use centroid fallback geometry, not island boundaries. Treat layers as centroid/point maps until boundary data is added.
- TASK-010 GIS context is descriptive and boundary-neutral. It can support grouping and app copy, but not scoring.
- TASK-011 coverage tables show PN as the only current data-desert geography; broader coverage caveats are mostly dataset-specific rather than geography-wide.
- TASK-012 indicator forensics preserve all 182 trace rows and flag 11 within-indicator outliers. GHG outliers for NC and PW are context-only, not score drivers.
- TASK-013 country story labels are descriptive screens for app copy and story selection, not causal explanations.
- TASK-015 spatial typologies are rule-based descriptors, not statistical clusters or adjacency claims.
- TASK-014 leave-one-indicator sensitivity shows rank volatility is widespread. Avoid definitive rank-order language; use rankings as exploratory context with visible uncertainty.
- TASK-016 outlook interpretation is stress-test display guidance, not forecasting. Weak or sparse diagnostics should be withheld from outlook layers.
- TASK-017 monitoring-gap outputs identify PN, NR, AS, and WF as high-gap low-monitoring candidates. AS and WF have missing monitoring rows, so describe them as reporting gaps unless externally verified.
- TASK-019 is planned only. JSD/KL outputs do not exist yet; do not design the similarity layer as shipped until real artifacts and caveats are generated.
- TASK-020 reference examples are principle studies only. Do not copy publication identity, palettes, layouts, illustrations, or iconic stripe treatments from audited projects.
- TASK-022 belongs to Claude, but Claude must not stage, commit, push, change data methodology, or alter generated artifacts.
- TASK-024 is required before accepting any Claude visual revision.
- TASK-021 found a concrete first-fix issue: the desktop legend is hidden inside a closed `<details>` disclosure whose summary is hidden.
- The copied reference workflow kits are intentionally ignored under `context/`.
