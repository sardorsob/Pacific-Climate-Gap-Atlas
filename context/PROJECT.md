# Project

## Current Phase

TASK-028 guided story/copy rewrite is complete; next build gate is TASK-027 final visual polish. Competition deadline: August 31, 2026.

## Status

The repository has a committed workflow scaffold, official dataset contracts, a reproducible processed data pipeline, a draft Adaptation Gap Index baseline, an app-optional Adaptation Gap Outlook baseline, enriched app-ready JSON/GeoJSON, script-first EDA outputs, TASK-019 evidence-fingerprint divergence artifacts, story/design briefs, a Dataviz Inspiration audit, a Pacific winner scroll-tour audit, and an accepted React/Vite scroll-led atlas shell wired to generated public data. The app map now uses a MapLibre canvas with centroid fallback points, Natural Earth visual land context, first-render graticule lines, and React overlay labels/hit targets. The guided story/copy rewrite is complete; remaining app work is organized as `TASK-027` post-map visual polish and then `TASK-007` final methodology/accessibility/submission readiness.

## Working Title

The Pacific Adaptation Gap Atlas

## Current Thesis

Pacific geographies face uneven climate pressure, visible capacity, and official-data coverage. The project should help readers explore where climate signals, observed stress, monitoring coverage, and response-capacity proxies appear most out of balance.

## Feature Table

| Area | Status | Notes |
| --- | --- | --- |
| Research source folder | present | `research/` includes brief, official dataset inventory, past winners, and review board |
| Workflow shell | done | all durable project Markdown lives under `context/` |
| Dataset profile | done | `artifacts/tables/dataset_profile.csv` and `data/contracts/*.json` cover nine priority official datasets |
| Data science pipeline | done | `scripts/make_dataset.py` produces normalized observations, geography lookup, app summary, and provenance |
| Adaptation Gap Index | done | `scripts/build_gap_index.py` produces geography scores plus indicator trace |
| Outlook model | done | trend stress-test baseline is methodology-ready and app-optional |
| Evidence fingerprint divergence | analysis-ready | `TASK-019` produced fingerprints, pairwise JSD rows, nearest-neighbor rows, and provenance; app wiring is pending |
| Static app data | done | `scripts/build_app_data.py` produces public JSON/GeoJSON layer inputs |
| EDA sprint | done | GIS context, coverage/data-desert, indicator-forensics, country-story, spatial-typology, trend/outlook, monitoring-gap, and story/design synthesis are complete |
| Dataviz inspiration audit | done | `context/DATAVIZ_INSPIRATION_AUDIT.md` records route sampling and original-project interaction lessons for map-first, climate, environmental, selected-geography, evidence-strip, and guided-tour patterns |
| Winner scroll-tour audit | done | `context/WINNER_SCROLL_TOUR_AUDIT.md` recommends a scroll-led hybrid: default guided scroll atlas, secondary free explorer, current map/control shell preserved |
| GIS atlas app | in-progress parent task | React/Vite concept opens as a 7-beat guided scroll atlas with a sticky centroid map, visible legend, direct story labels, selected-anchor comparison cue, data-quiet map tags, static labelled fingerprint preview, source drawer, mobile beat sheet, and free-explore handoff; `TASK-006` closes after the focused subtasks below |
| App-data wiring implementation | done | `TASK-025` replaced fixture-backed evidence with public/generated app data while preserving monitoring, rank, story, outlook, and caveat fields |
| MapLibre substrate | done | `TASK-026` adds a MapLibre-backed map canvas and centroid point layer |
| Pacific land context | done | `TASK-029` adds Natural Earth visual land context and MapLibre graticule lines; scored geographies remain centroid points, not polygon boundaries |
| Story/copy rewrite | done | `TASK-028` sharpened the seven guided beats, map callouts, caveats, CTAs, geometry caveats, and method/source text before final polish |
| Post-map visual polish | pending | `TASK-027` is a Claude-built, Codex-QA visual pass after real data, story copy, and MapLibre geometry exist |
| Mockup revision sprint | done | `TASK-021`, `TASK-022`, `TASK-023`, and `TASK-024` are complete; their durable outcomes now inform `TASK-025` through `TASK-028` |

## Last Session Notes

- Approved structure: context-first monorepo.
- Approved headline: broader adaptation gap, with monitoring as one diagnostic layer.
- Copied reference workflow kits into ignored local context paths.
- Completed `TASK-001` live dataset profiling and contracts for nine priority official datasets.
- Completed `TASK-002` processed data pipeline with local raw-cache support.
- Completed `TASK-003` baseline Adaptation Gap Index and methodology update.
- Completed `TASK-004` Adaptation Gap Outlook baseline and model-card update.
- Completed `TASK-005` app-data export with centroid GeoJSON, layer metadata, country details, and public app copies.
- Paused TASK-006 app build to run deeper GIS/story EDA first.
- Completed `TASK-009` script-first EDA foundation with analysis backlog, repeatable tables, and provenance.
- Completed `TASK-010` GIS context enrichment with descriptive subregion/status context and boundary-neutral caveats.
- Completed `TASK-011` coverage/data-desert analysis with geography-level and dataset-level coverage tables.
- Completed `TASK-012` indicator-level forensics with row-level trace preservation and within-dataset outlier flags.
- Completed `TASK-013` country story labels with pressure/capacity summaries, coverage caveats, and non-causal interpretation guardrails.
- Completed `TASK-015` spatial typologies and subregion comparisons with rule-based labels and regional caveats.
- Completed `TASK-016` trend/outlook interpretation with display/withhold recommendations for stress-test layers.
- Completed `TASK-017` monitoring-gap GIS story analysis with priority quadrants and reporting-gap caveats.
- Completed `TASK-018` story and design synthesis with `STORY_BRIEF.md` and `DESIGN_BRIEF.md`.
- Started `TASK-006` visual mockup pass with a buildable React/Vite atlas concept for owner review; final app wiring remains open.
- Added and completed `TASK-019` as an Evidence Fingerprint Divergence analysis lane so JSD ideas fit the official-data story without becoming a new leaderboard or overclaimed model.
- Completed `TASK-020` Dataviz Inspiration audit with live browser review of map/climate/environment references and updated the story, design, Claude mockup, decision, backlog, and memory context around full-bleed map, selected-anchor, compact evidence-strip, direct-label, and evidence-bearing-motion patterns.
- Organized the delegated sprint: Codex owned mockup critique and QA, Claude owned the visual revision pass, a Codex data agent completed `TASK-019`, and a Codex app-data agent completed the mock-to-public-data wiring inventory.
- Completed `TASK-021` mockup critique with a Claude-facing checklist; its durable outcome is consolidated into `TASKS.md`, `HANDOVER.md`, and the design brief.
- Completed and accepted `TASK-022` / `TASK-024`: Claude revised the visual mockup, Codex reviewed the code and context, applied small QA fixes, and prepared the accepted mockup revision for commit.
- Completed `TASK-023` app-data wiring inventory in `context/plans/app-data-wiring-inventory.md`. At inventory time, base scores and centroids were available while monitoring reporting status, rank uncertainty, story labels, top-signal arrays, political/status context, and outlook display gating still needed export/derivation; `TASK-025` has since completed that core wiring.
- Completed `TASK-019` Evidence Fingerprint Divergence with 22 geography fingerprints, 231 unordered pairwise JSD rows, 66 nearest-neighbor rows, and caveated provenance. Treat it as analysis-ready but not app-wired.
- Completed a Pacific Dataviz winner scroll-tour audit. Recommendation: pivot the next visual direction to a scroll-led hybrid that keeps the atlas map as the sticky evidence surface and preserves free exploration after the guided path.
- Accepted Claude's scroll-led hybrid implementation after Codex cleanup. The app now starts in a 7-beat guided atlas mode, uses the map as the sticky evidence surface, preserves "Explore freely" as the full-control handoff, and treats Evidence Fingerprint Divergence as a labelled static preview only.
- Reorganized the remaining `TASK-006` app work into `TASK-025` app-data wiring, `TASK-026` MapLibre substrate, `TASK-029` Pacific land context, `TASK-028` guided story/copy rewrite, and `TASK-027` post-map visual polish before `TASK-007` final readiness.
- Completed `TASK-025` real app-data wiring: app data exports now include monitoring, rank, story, context, and outlook-display objects; the React app loads `/data/geographies.json` through `app/src/lib/atlasData.ts`; the obsolete mock fixture was deleted.
- Completed `TASK-026` MapLibre map substrate: `AtlasMap` now renders a no-network MapLibre Pacific canvas with generated centroid point features, React overlay labels, accessible geography hit targets, monitoring hatching/dashed cues, selected/priority state, and explicit boundary-not-joined caveats. It does not ship polygon boundaries.
- Completed `TASK-029` Pacific land context: `scripts/build_land_context.py` builds and mirrors Natural Earth 10m land into the app, writes provenance, renders land under centroid points, and moves graticule lines into MapLibre so the grid appears on initial render.
- Completed `TASK-028` guided story/copy rewrite: the seven-beat tour, method drawer, data-quiet panel, fingerprint preview, country-panel trace note, and geometry caveats now read as evidence-backed interface copy for owner visual review.
