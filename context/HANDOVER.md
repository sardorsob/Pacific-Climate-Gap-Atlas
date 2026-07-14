# Handover

## Current State

The repository is initialized as a context-first GIS/data-science project. `TASK-001` through `TASK-056`, `TASK-058` through `TASK-063`, `TASK-065`, and `TASK-070` are complete. `TASK-064`, `TASK-066`, and the freshly built `TASK-067` remain in owner review; `TASK-057` remains `needs-fix`. `TASK-066` expands processed research data to 16,410 rows across 14 datasets without changing the baseline index, public app, or story. `TASK-067` audits the 2,403 candidate rows through three evidence tables, five analytical research figures, and a separate contact sheet with three provisional auditions. The owner likes the visual system but has reopened the final story; `TASK-068` must make the scientific/owner narrative selection before `TASK-069` rewrites the roadmap.

The current app remains the functioning behavioral/scientific baseline. Its fullscreen composition, evidence marks, comparison/rank takeovers, native scroll, accessibility behavior, and Explore handoff should be preserved during research. Its title, opening thesis, exemplars, scene order, and Adaptation Gap Index prominence are provisional until `TASK-068`. QA screenshots live under `artifacts/design/task-064/`; concept boards remain composition-only.

## How To Validate The Scaffold

```powershell
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
```

## How To Rebuild The Dataset Profile

```powershell
python scripts/fetch_official_data.py --config configs/datasets.yml --supplementary "Crop yield - disaggregated"
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
python scripts/build_app_data.py
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

This writes the script-first EDA tables under `artifacts/tables/`, records `artifacts/provenance/eda_summary.json`, and now produces the TASK-067 accepted-candidate tables, five static analytical research figures, and one separate contact sheet of three provisional evidence-board auditions under `artifacts/figures/`. It also includes coverage deep dives, indicator forensics, country story labels, rank volatility, trend profiles, monitoring-gap GIS story priorities, and TASK-019 Evidence Fingerprint Divergence outputs. Read `context/ANALYSIS_BRIEF.md`, `context/DATA_CARD.md`, `context/EXPERIMENTS.md`, and the three audition contact sheet before TASK-068; do not treat the figures as final scenes.

## Next Recommended Work

1. Complete owner QA for `TASK-066` and `TASK-067`. The TASK-067 review should open all six figures at full size and use the candidate signal/comparability tables to challenge every headline.
2. Use `TASK-068` to review, merge, reject, or select among the three auditions: different clocks/reporting visibility; service and energy cross-currents; and profiles instead of a single rank. Only then may `TASK-069` rewrite the storyboard and create implementation tasks.
3. Keep the current index, app, title, and scene copy unchanged until that selection. TASK-067 deliberately declares `selected_story: null`.
4. Keep `TASK-064` in owner review and `TASK-057` in `needs-fix`; do not deploy or submit a story that has been reopened.

## Known Caveats

- In a fresh checkout, install app and Python dependencies before rebuilding. The local working copy has previously run the Vite build successfully.
- The saved v2 SDMX routes currently return `422`; the fetch helper records that failure and retries through the documented stable Pacific Data Hub endpoint, with PowerShell retained only as a final Windows transport fallback.
- Raw official CSV cache files under `data/raw/official/` are ignored by Git.
- The gap index is a draft comparative baseline. The app must show indicator counts, trace details, and methodology caveats near the score.
- The current gap varies more with its visible-capacity proxies than with its climate-pressure side, and those capacity inputs include unnormalized station counts, total power generation, and fisheries-measure counts. Treat the index as provisional evidence, not the final story verdict.
- The candidate expansion is research scope only. Population, renewable energy, water, disaster loss, and land cover are processed for TASK-067 but do not enter the score, public app data, or guided story. Crop yield remains rejected and processing-disabled.
- TASK-067 compares candidate values only within indicators. Direct loss is reporting visibility only, blank loss years are not zero, population growth is not population size, and the land-cover index direction/baseline remains unresolved. The three auditions are alternatives for TASK-068, not a selected narrative.
- `TASK-048` corrected the former `included_indicator_count` ambiguity. Production app data now exposes score-input, context-only, and total trace counts plus eight ordered score-input presence positions. Do not regress to the retired field when building the new evidence glyph.
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
- The current app keeps exact JSD nearest-neighbor evidence in the selected-place panel only. `TASK-055` removed the former selected-only dashed map arcs and all physical-link copy; do not reintroduce a similarity line source or layer.
- `TASK-050` replaced the former nested story rail with native document scroll and one observer-owned scene state. The remaining story work must preserve that single scroll owner and keep mobile scene bottoms clear of fixed chrome.
- `TASK-060` reuses that observer and sticky map for fullscreen ownership, omits premise chrome from the DOM, ignores story keys from interactive controls, and publishes active visual/stage attributes. `TASK-064` repaired the evidence-scene progress path by keeping toolbar and progress inside one sticky chrome region with 44px progress targets and matching rank-heading clearance. Its hydration flow owns manual scroll restoration. `TASK-063` extends the same observer to the handoff, restores gap/default/no-selection there and again in Explore, and keeps geography continuity through stable codes and native CSS transitions.
- The post-TASK-039 interaction audit was folded into `TASK-040` through `TASK-042` and is complete. The standalone audit file was removed; durable results now live in `TASKS.md`, `PROJECT.md`, this handover, and the progress log.
- The post-TASK-042 design critique was folded into `TASK-043` through `TASK-047`; the standalone critique file was removed. `TASK-043` resolved the root visual finding by restoring guaranteed-size presence marks with land geometry as secondary texture/context, `TASK-044` added evidence-bearing motion, `TASK-045` resolved the chrome/type mismatch, `TASK-046` moved official-data visibility before the formula while keeping JSD selected-anchored, and `TASK-047` added selected-only JSD neighbor arcs.
- TASK-020 reference examples are principle studies only. Do not copy publication identity, palettes, layouts, illustrations, or iconic stripe treatments from audited projects.
- The implemented winner-audit response remains a guided scroll atlas, not a detached landing page. `TASK-058` permits a fullscreen premise because the map and evidence still occupy the first viewport; it does not permit a long decorative pre-map intro.
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
