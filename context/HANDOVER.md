# Handover

## Current State

The repository is initialized as a context-first GIS/data-science project. `TASK-001` through `TASK-005` are complete: nine priority official datasets have been profiled, contracted, cached, normalized, scored into a baseline Adaptation Gap Index, stress-tested with an app-optional outlook baseline, and exported into enriched app-ready JSON/GeoJSON. The core EDA/story sprint is complete, `TASK-020` records a Dataviz Inspiration audit, TASK-019 evidence-fingerprint divergence artifacts exist, and the React/Vite app now opens as a scroll-led guided atlas with a free-explore handoff backed by generated public app data. `TASK-026`, `TASK-029`, `TASK-028`, `TASK-027`, `TASK-030`, `TASK-031`, `TASK-032`, `TASK-033`, `TASK-034`, `TASK-035`, `TASK-036`, `TASK-037`, `TASK-038`, `TASK-039`, `TASK-040`, `TASK-041`, `TASK-042`, and `TASK-043` are complete: the map surface uses MapLibre with guaranteed-size centroid presence marks, Natural Earth visual land texture, first-render graticule lines, overlay labels, accessible geography hit targets, revised evidence-backed story copy, post-map interaction polish, readiness packaging notes, Codex accessibility QA, accepted final Fable visual polish, humanized storyboard copy, desktop guided-story navigation cleanup, regrouped selected-place detail panel, selected-place nearest-neighbor JSD, nearest-centroid island grouping, fixed explainer state, single-sourced/humanized JSD text, cleaned legend/comparator/fallback mark behavior, and restored atoll-legible presence marks while retiring the selected viewfinder.

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

## How To Rebuild Pacific Land Context

```powershell
python scripts/build_land_context.py
```

This writes `data/processed/app/pacific_land_context.geojson`, mirrors it to `app/public/data/pacific_land_context.geojson`, and records `artifacts/provenance/land_context_summary.json`. The raw Natural Earth cache under `data/raw/gis/` is ignored.

## GIS Context

`data/external/geography_context.csv` adds descriptive subregion, political-status, administering/sovereign authority, and island-group context for all scored geographies. Keep these fields outside score calculations. Natural Earth land context is also outside scoring and selection; review sensitive status wording before publication and keep scored geography mapping centroid-first until an official boundary source is chosen.

## How To Rebuild The EDA Foundation

```powershell
python scripts/run_eda.py --config configs/eda.yml
```

This writes the script-first EDA tables under `artifacts/tables/` and records `artifacts/provenance/eda_summary.json`. It now includes coverage deep dives, indicator forensics, country story labels, rank volatility, trend profiles, monitoring-gap GIS story priorities, and TASK-019 Evidence Fingerprint Divergence outputs. Read `context/ANALYSIS_BRIEF.md`, `context/STORY_BRIEF.md`, `context/DESIGN_BRIEF.md`, `context/DATAVIZ_INSPIRATION_AUDIT.md`, `context/WINNER_SCROLL_TOUR_AUDIT.md`, and `context/INFORMATION_DIVERGENCE_PLAN.md` before resuming app or design work around the similarity layer.

## Next Recommended Work

1. Start `TASK-044` next: add reduced-motion-safe, evidence-bearing motion to layer/selection/story transitions without introducing a motion dependency.
2. Then run `TASK-045` chrome/type cleanup. It may overlap CSS and map shell files with `TASK-044`, so split only if the file ownership is clean.
3. Use `TASK-046` to decide whether the guided tour should open closer to the data-silence thesis and whether JSD stays in the guided spine. Only then consider `TASK-047` selected-only JSD neighbor arcs.
4. Record the final public URL in `context/docs/submission-notes.md` after deployment and keep it live through August 31, 2029.
5. Keep Codex QA as the gate for any future visual/app changes before committing, and keep owner visual review as the taste/approval gate.

## Known Caveats

- In a fresh checkout, install app and Python dependencies before rebuilding. The local working copy has previously run the Vite build successfully.
- The SDMX fetch helper avoids undeclared runtime dependencies, but uses a Windows PowerShell fallback because the endpoint returned `422` to Python standard-library HTTP.
- Raw official CSV cache files under `data/raw/official/` are ignored by Git.
- The gap index is a draft comparative baseline. The app must show indicator counts, trace details, and methodology caveats near the score.
- The outlook baseline is app-optional. Only include it in the interface with visible caveats and row-level notes.
- TASK-005/TASK-026 scored GIS exports use centroid fallback hit targets, not island boundaries. TASK-029 adds Natural Earth land context for orientation, but not official/selectable boundary polygons. TASK-038/TASK-039 group nearby Natural Earth land to scored centroids for visual marks only; TASK-043 keeps those land shapes as subdued context/texture under guaranteed-size centroid presence marks. This is not a boundary source, and far/disputed land stays unassigned.
- TASK-010 GIS context is descriptive and boundary-neutral. It can support grouping and app copy, but not scoring.
- TASK-011 coverage tables show PN as the only current data-desert geography; broader coverage caveats are mostly dataset-specific rather than geography-wide.
- TASK-012 indicator forensics preserve all 182 trace rows and flag 11 within-indicator outliers. GHG outliers for NC and PW are context-only, not score drivers.
- TASK-013 country story labels are descriptive screens for app copy and story selection, not causal explanations.
- TASK-015 spatial typologies are rule-based descriptors, not statistical clusters or adjacency claims.
- TASK-014 leave-one-indicator sensitivity shows rank volatility is widespread. Avoid definitive rank-order language; use rankings as exploratory context with visible uncertainty.
- TASK-016 outlook interpretation is stress-test display guidance, not forecasting. Weak or sparse diagnostics should be withheld from outlook layers.
- TASK-017 monitoring-gap outputs identify PN, NR, AS, and WF as high-gap low-monitoring candidates. AS and WF have missing monitoring rows, so describe them as reporting gaps unless externally verified.
- TASK-019 outputs exist as analysis artifacts: `eda_evidence_fingerprints.csv`, `eda_pairwise_jsd.csv`, `eda_similarity_neighbors.csv`, and `divergence_summary.json`. TASK-037 wires the nearest-neighbor rows into selected-place detail only. Do not present JSD as a global similarity map, causal cluster, policy-need group, or leaderboard.
- The post-TASK-039 interaction audit was folded into `TASK-040` through `TASK-042` and is complete. The standalone audit file was removed; durable results now live in `TASKS.md`, `PROJECT.md`, this handover, and the progress log.
- The post-TASK-042 design critique was folded into `TASK-043` through `TASK-047`; the standalone critique file was removed. `TASK-043` has resolved the root visual finding by restoring guaranteed-size presence marks with land geometry as secondary texture/context.
- TASK-020 reference examples are principle studies only. Do not copy publication identity, palettes, layouts, illustrations, or iconic stripe treatments from audited projects.
- The implemented winner-audit response is a guided scroll atlas, not a long cinematic landing page. The first viewport must still show the map and evidence.
- TASK-022 belonged to Claude, but Claude did not stage, commit, push, change data methodology, or alter generated artifacts.
- TASK-024 QA is complete for the accepted TASK-022 revision. Future Claude visual or copy changes should go through the same Codex QA gate before commit.
- TASK-021 found a concrete first-fix issue: the desktop legend was hidden inside a closed `<details>` disclosure whose summary was hidden. That issue was fixed in the accepted mockup revision.
- The copied reference workflow kits are intentionally ignored under `context/`.
- TASK-022/TASK-024 visual revisions are accepted after Codex QA. The accepted app shell includes the scroll-led guided mode, story components, map/panel components, and CSS changes. No data methodology, generated artifacts, raw data, or git history were delegated to Claude.
- After TASK-022, the desktop default no longer shows a detail panel; the panel is a right-side overlay (bottom sheet on mobile) that opens on selection or the data-quiet view, and the thesis lives in the map header. The desktop legend is now visible by default (the closed-`<details>` P0 bug is fixed).
- Codex QA fixes applied before commit: render the detail panel only when selection or data-quiet mode is active, open the data-quiet sheet when that overlay is toggled, encode graticule degree labels with ASCII source escapes, and normalize CSS letter spacing to `0`.
- Remaining owner-review notes: confirm visual taste and mobile discoverability after Codex QA. TASK-027 added browser smoke over mobile and desktop entry points, and TASK-031 added semantic/touch-target accessibility fixes, but final acceptance should include a deliberate human visual/a11y review.
- TASK-025 is complete. The app loads generated `/data/geographies.json` through `app/src/lib/atlasData.ts`; the obsolete `app/src/mock/mockAtlasData.ts` fixture was deleted. The generated app contract now carries monitoring status, rank uncertainty, story labels, top signals, status/subregion context, and outlook display gating.
- TASK-026 is complete as a MapLibre centroid substrate. TASK-029 is complete as a Natural Earth visual land-context layer plus MapLibre graticule fix. TASK-028 is complete as the guided story/copy rewrite. TASK-027 is complete as the post-map visual/interactions polish. TASK-030/TASK-031 are complete as readiness packaging and accessibility QA.
- TASK-027 fixed the pre-polish interactive blockers: mobile first-load map fit, guided beat scroll/state sync, empty indicator-trace drawer, missing beat-4 selected-place explanation, selection loss on overlay switch, missing rank-uncertainty explainer, false compare CTA, method-drawer focus/Escape gaps, mobile explore hierarchy, exemplar label offsets, and small swatch/microcopy states. Final readiness should still include a deliberate owner visual review and accessibility pass.
- Completed transient mockup plan/checklist files were pruned from `context/plans/`; their durable outcomes now live in `TASKS.md`, `PROJECT.md`, `HANDOVER.md`, `DESIGN_BRIEF.md`, and the progress log.
