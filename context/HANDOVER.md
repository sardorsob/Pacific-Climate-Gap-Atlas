# Handover

## Current State

The repository is a context-first GIS/data-science project. `TASK-001` through `TASK-094`, `TASK-096` through `TASK-109`, and `TASK-111` through `TASK-113` are complete. Frozen-production TASK-095 has passed automated and independent QA and remains `in-review` for owner visual/interaction acceptance. The inline regional lens has correct selected readouts, continuous water/renewable inspectors, a six-group visibility tally, informational-only peer detail, corrected typography/rhythm, distinct inspection grammar, and at least 44.37px interaction bands at the 320px floor. TASK-110 remains `needs-fix` until its owner gate is rerun against the accepted correction and the approved editorial entry work. TASK-114 through TASK-116 are now authorized as the release-critical implementation. TASK-100 and TASK-110 are held for the owner's return; TASK-117 will complete only its separate name-entry host/design gate in the current batch. No deployment/submission readiness is claimed.

The current app implements the approved regional story while preserving the accepted fullscreen composition, dark-ocean palette, typography, 22 evidence marks, native scroll, accessibility behavior, controls, selected-place panel, methods/sources, URL/history, and Explore handoff. Its four stable scenes are `what-the-records-show`, `twenty-two-pacific-places`, `different-directions`, and `unequal-visibility`; Explore starts in explicit neutral `view=overview`. Selecting a place adds one inline regional lens using already loaded records. The release-critical closure stays inside `CountryPanel`, `RegionalPositionLens`, `scenes`, tests, and scoped CSS; it adds no route, dashboard, renderer, dependency, public data, model output, or global state. Post-release TASK-117 only studies the existing App selection/panel seams until an owner-approved host exists. TASK-113's schematic desktop/mobile references live under `artifacts/design/task-113/`; the current app remains the visual authority. The accepted replacement baseline lives under `artifacts/design/task-077/`; TASK-095 evidence lives under `artifacts/design/task-095/`, TASK-099 responsive evidence under `artifacts/design/task-099/`, and TASK-110 attempt-1 evidence under `artifacts/design/task-110/`.

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

This writes the script-first EDA tables under `artifacts/tables/`, records `artifacts/provenance/eda_summary.json`, and produces the TASK-067 accepted-candidate atlas plus the TASK-068 five-table/six-plate regional package. It also writes the deterministic TASK-068 bundle at `artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/` and includes coverage deep dives, indicator forensics, country story labels, rank volatility, trend profiles, monitoring-gap GIS story priorities, and TASK-019 Evidence Fingerprint Divergence outputs. Read `context/ANALYSIS_BRIEF.md`, `context/DATA_CARD.md`, and `context/EXPERIMENTS.md` when implementing the approved scenes; none of the research figures is final scene art.

## Next Recommended Work

1. Obtain owner approval of TASK-113's paired desktop/mobile concept and written contract; do not implement from unapproved generated pixels.
2. Implement TASK-114 and TASK-115 sequentially through the existing selected-panel seams with strict RED/GREEN and separate commits. TASK-116 may run in parallel because it is limited to the existing guided-handoff copy/tests.
3. Restart TASK-110 attempt 2 against TASK-114/TASK-115, then obtain owner visual/interaction acceptance. Keep TASK-095's separate owner gate outstanding.
4. Begin TASK-100 only after TASK-095, TASK-110, and TASK-116 close. Treat deployment, public-URL durability, final disclosure, and submission-form actions as a separate release decision after TASK-100.
5. After TASK-100, begin TASK-117's reachable-host design gate if name-based place entry remains desirable; do not add a chooser to the unmounted neutral `CountryPanel` branch.

## Known Caveats

- TASK-106 supersedes only the first lens's visual hierarchy and peer-inspection grammar. It keeps the existing panel and map selector, forbids peer navigation, and authorizes no dashboard shell, Place/Compare tabs, second drawer, histogram/KDE/posterior curve, new data output, dependency, renderer, route, or global state.
- TASK-111 and TASK-112 are the only authorized response to the TASK-110 owner finding. They keep the 24px selected value and existing plots, shorten visible labels while retaining complete accessible meaning, establish one centered 320px measure column and clear type/spacing ladder, distinguish zero/median/inspection/selection paint, identify self-inspection, and enlarge only transparent hit bands at the 320px floor. They do not authorize a smaller KPI, warning-colored absence, divider-card grammar, landscape grid, panel-wide line-measure redesign, new chart geometry, model/data change, or viewport JavaScript.
- TASK-113 through TASK-116 do not reopen those plot decisions. They add editorial connective tissue while preserving the current system-sans/Georgia roles, Night Watch palette, data, marks, plots, interaction grammar, and panel architecture. TASK-117 is design-only and post-release because the proposed neutral panel host is not mounted. Global font assets, a second gaps-only figure, a claims carousel/scene, and copy-link UI remain deferred.
- The selected-place lens continues to use already loaded `Geo.regionalStory` fields. Water has 19 recorded and 3 unavailable places with one exact two-place tie; renewable share has 20 recorded and 2 unavailable with no tie; visibility covers all 22 places in six exact groups: 6:1, 10:2, 11:3, 12:2, 13:2, and 14:12. Water/renewable keep independent domains, zero references, descriptive medians, and per-observation clocks. Visibility becomes a grouped tally and omits its median because median=max=14. Missing values stay off-scale, and presence is not quality or preparedness.
- Current built assets are 96,047-byte CSS and 1,043,075-byte JavaScript after TASK-112. The checker compares those raw files with provisional 97,500/1,050,000-byte internal regression targets. The CSS number is not a Challenge rule: TASK-108 explicitly approved the measured increase from the earlier 95,000-byte diagnostic. Correctness and accessibility remain primary; any future checker change must be measured, explicit, and synchronized with active context.
- TASK-101 through TASK-104 are done. The batch source-reviewed all 22 political-status strings, added safe in-region map-failure handling, repaired live 880px breakpoint crossings, unified signed-number formatting, and removed only proven-dead plumbing. New Caledonia's time-sensitive status should be rechecked immediately before publication. None of the work changed the palette, figures, marks, data meaning, state, routes, renderer, or dependencies.
- The accepted visual/story baseline was not redesigned. TASK-079–TASK-082 changed only panel navigation, handoff sizing/wording, responsive control placement, temporary copy, and selected-place evidence order.
- TASK-079 through TASK-081 resolved diagnostic Back/Close/history, narrow-screen control overflow, and the place panel's missing regional water/renewable/visibility evidence. TASK-082 verified the combined product with 164/164 strict-headless assertions and 43 PNGs and received owner acceptance on 2026-07-20.
- TASK-089 verified the bounded refinement with 362/362 headless assertions and 53 PNGs. Fresh external Semgrep and OSV calls were blocked by the managed environment; the provenance records the failed attempts, unchanged TASK-057 lock blobs/acquisition code, and frozen-diff security review without claiming an online pass.
- TASK-086 through TASK-089 preserve the accepted visual identity. They protect premise copy, retain full-size evidence after rejecting a smaller composition, and surface reviewed place notes/caveats; they do not introduce a broad dark-glass or glass/cream/brass reskin.
- TASK-090 remains concept-only and is now done; TASK-091 through TASK-095 are the only authorized implementation path. Light is restricted to static UI frame/focus/readability roles. Geography marks, matrix cells, and missingness remain flat; reporting gaps may not appear as dead, calm, live, rough, deep, or otherwise physical water; sonar-contact language and unsupported Pacific cultural motifs remain excluded.
- TASK-091 is done. Its opaque graphite chrome, pale mineral reading surfaces, teal UI-light role, amber caveat role, and crisp focus outline passed independent review and six quiet headless frames. A first review caught desktop premise-gradient compositing over the header and a permissive source contract; the one-line 72px header-clear correction and strengthened test passed re-review. Built CSS is 94,949 bytes, 47 bytes below the starting baseline.
- TASK-092 is done. A crisp 2px teal frame edge now separates pale figure ownership and the map-immersive handoff, while the active progress dot uses a hard outline instead of a soft shadow. Fifteen quiet frames preserve the exact TASK-089 movement/visibility dimensions at desktop, portrait, and landscape, with all 22x14/308/277/31 visibility facts intact. The portrait movement SVG leader has a pre-existing visible overhang but creates no document or nested-scroll overflow; TASK-094 owns the explicit measurement audit.
- TASK-093 is done. The pre-existing data-dependent MapLibre land-glow layer, `glowOpacity` property, blur layer, motion target, and event plumbing are deleted. MapLibre and SVG selection are unfilled crisp outlines; graphite panel navigation, mineral reading surfaces, and a hard-edged Methods drawer now form one Explorer family. Twenty-two quiet frames pass state, focus, Back, compact sheet, loading/error, 44px target, and zero-overflow checks. The only copy change is the accurate legend phrase `crisp outline = selected place`.
- TASK-094 is done. A 127-check/63-frame quiet matrix preserved every accepted figure size and evidence invariant across seven viewports, five-state effective 200% reflow, color-vision simulations, reduced motion, focus, touch sizing, and panel/drawer overflow. Measurement found and repaired only a 32px Methods close target and a reduced-motion selector-specificity miss. Built CSS is 94,987/95,000 bytes. The transparent portrait SVG canvas overhang and regional centroid/dock overlap are recorded without clipping evidence or introducing a new map interaction system.
- TASK-095 is in owner review. Frozen-production QA passed 33/33 Night Watch-specific assertions with 20 inspected frames and reused TASK-094's 127/127 checks and 63 frames. Full repository gates and an eight-file zero-finding Semgrep MCP scan pass; OSV external lookup was unavailable and is explicitly not claimed as a pass. Independent review returned SPEC PASS and QUALITY PASS. Production, tests, data, dependencies, and lockfiles stayed frozen at `098ab34`; owner acceptance alone remains before done.
- `Geo.regionalStory` remains the sole source for the new place summary; its null/different-clock/presence caveats, fixed 14-position denominator, and separation from score/preparedness claims are protected.
- In a fresh checkout, install app and Python dependencies before rebuilding. The local working copy has previously run the Vite build successfully.
- The saved v2 SDMX routes currently return `422`; the fetch helper records that failure and retries through the documented stable Pacific Data Hub endpoint, with PowerShell retained only as a final Windows transport fallback.
- Raw official CSV cache files under `data/raw/official/` are ignored by Git.
- The gap index is a draft comparative baseline. The app must show indicator counts, trace details, and methodology caveats near the score.
- The current gap varies more with its visible-capacity proxies than with its climate-pressure side, and those capacity inputs include unnormalized station counts, total power generation, and fisheries-measure counts. Treat the index as provisional evidence, not the final story verdict.
- The candidate expansion does not enter the Adaptation Gap score. TASK-073 exports only the reviewed water/renewable endpoint changes plus 14-position dataset presence needed by the replacement guided story. Population and land-cover values remain research-only, direct loss remains visibility-only, and crop yield remains rejected and processing-disabled.
- TASK-067 compares candidate values only within indicators. Direct loss is reporting visibility only, blank loss years are not zero, population growth is not population size, and the land-cover index direction/baseline remains unresolved. TASK-069 selected the regional synthesis only within the bounds recorded in the approved story brief.
- TASK-068 keeps condition and visibility matrices separate, preserves missing cells, flags derived-input circularity, and rejects stable grouping after leave-one-feature position rho falls to -0.6962. Coverage or monitoring must not be described as emergency preparedness.
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
