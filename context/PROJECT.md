# Project

## Current Phase

The current app baseline is complete through `TASK-047`. The next approved phase is the artistic redesign sequence `TASK-048` through `TASK-057`, beginning with evidence-count semantics and an owner-reviewed visual concept before app implementation. Competition deadline: August 31, 2026.

## Status

The repository has a committed workflow scaffold, official dataset contracts, a reproducible processed data pipeline, a draft Adaptation Gap Index baseline, an app-optional Adaptation Gap Outlook baseline, enriched app-ready JSON/GeoJSON, script-first EDA outputs, TASK-019 evidence-fingerprint divergence artifacts, story/design briefs, reference audits, and a functioning React/Vite scroll-led atlas wired to generated public data.

The current implementation still uses seven guided beats, a nested desktop story scroller, evidence-size presence marks, and selected-only JSD neighbor arcs. It is the reviewable baseline, not the approved target state. A full repository/story/live-layout audit on 2026-07-09 approved the next narrative identity, **The Shape of What We Know**: official records illuminate the Pacific unevenly, and those gaps change what the atlas can responsibly say. The target replaces the seven beats with five scenes, uses fixed-presence evidence portraits with eight score-input positions plus a separate context tick, moves JSD out of the guided spine and off the map, adopts native document scroll and a shared motion language, and simplifies the exploration/runtime surface. The complete design contract is `context/ARTISTIC_REDESIGN_BRIEF.md`; execution is split across `TASK-048` through `TASK-057` and three implementation plans under `context/plans/`.

## Working Title

The Pacific Adaptation Gap Atlas

## Current Thesis

Official records illuminate the Pacific unevenly. The atlas should show where climate pressure and visible adaptation capacity appear out of balance while making the shape and limits of the record impossible to mistake for the full lived reality.

## Feature Table

| Area | Status | Notes |
| --- | --- | --- |
| Research source folder | present | `research/` includes brief, official dataset inventory, past winners, and review board |
| Workflow shell | done | all durable project Markdown lives under `context/` |
| Dataset profile | done | `artifacts/tables/dataset_profile.csv` and `data/contracts/*.json` cover nine priority official datasets |
| Data science pipeline | done | `scripts/make_dataset.py` produces normalized observations, geography lookup, app summary, and provenance |
| Adaptation Gap Index | done | `scripts/build_gap_index.py` produces geography scores plus indicator trace |
| Outlook model | done | trend stress-test baseline is methodology-ready and app-optional |
| Evidence fingerprint divergence | app-wired | `TASK-019` produced fingerprints, pairwise JSD rows, nearest-neighbor rows, and provenance; `TASK-037` wires nearest neighbors into selected-place detail only |
| Static app data | done | `scripts/build_app_data.py` produces public JSON/GeoJSON layer inputs |
| EDA sprint | done | GIS context, coverage/data-desert, indicator-forensics, country-story, spatial-typology, trend/outlook, monitoring-gap, and story/design synthesis are complete |
| Dataviz inspiration audit | done | `context/DATAVIZ_INSPIRATION_AUDIT.md` records route sampling and original-project interaction lessons for map-first, climate, environmental, selected-geography, evidence-strip, and guided-tour patterns |
| Winner scroll-tour audit | done | `context/WINNER_SCROLL_TOUR_AUDIT.md` recommends a scroll-led hybrid: default guided scroll atlas, secondary free explorer, current map/control shell preserved |
| GIS atlas app | done | React/Vite concept opens as a 7-beat guided scroll atlas with a sticky MapLibre map, visible legend, direct story labels, data-quiet map tags, selected-place JSD neighbors, source drawer, mobile beat sheet, and free-explore handoff; `TASK-006` closed after its focused child tasks |
| App-data wiring implementation | done | `TASK-025` replaced fixture-backed evidence with public/generated app data while preserving monitoring, rank, story, outlook, and caveat fields |
| MapLibre substrate | done | `TASK-026` adds a MapLibre-backed map canvas and centroid point layer |
| Pacific land context | done | `TASK-029` adds Natural Earth visual land context and MapLibre graticule lines; scored geographies remain centroid points, not polygon boundaries |
| Story/copy rewrite | done | `TASK-028` sharpened the seven guided beats, map callouts, caveats, CTAs, geometry caveats, and method/source text before final polish |
| Post-map visual polish | done | `TASK-027` resolved the pre-polish interaction blockers, evidence-trace drawer, mobile camera/hierarchy, method-drawer keyboard handling, overlay-selection persistence, and uncertainty/quiet-state explainers |
| Readiness packaging | done | `TASK-030` audits source/provenance/submission/deploy notes and stale readiness pointers |
| Accessibility QA | done | `TASK-031` audits keyboard semantics, focus, touch targets, dialog behavior, and mobile accessibility |
| Final Fable visual pass | done | `TASK-032` passed Codex source/command QA; remaining owner-review issue is `TASK-037` |
| Humanized storyboard copy | done | `TASK-033` removed the flagged headline register from the guided storyboard while preserving caveats |
| Desktop story navigation | done | `TASK-034` removes the unreliable desktop Next/Back row; desktop keeps scroll/progress/keyboard navigation and mobile keeps the stepper |
| Presence-mark map treatment | done | `TASK-035`/`TASK-038`/`TASK-039` explored island-anchored treatment; `TASK-043` supersedes the under-inked polygon direction by keeping guaranteed-size centroid presence marks primary and Natural Earth land as subdued texture/context |
| Detail panel redesign | done | `TASK-036` regroups the selected-place panel into score, score-sides, and record sections while preserving trace/caveats |
| JSD app visibility | done | `TASK-037` shows selected-place nearest neighbors with exact JSD distance, band, reason, and caveat; no global link web, map ramp, or leaderboard ships |
| Post-TASK-039 iteration audit | done | `TASK-040` fixed explainer state, `TASK-041` humanized/single-sourced JSD similarity text, and `TASK-042` cleaned legend, stale compare code, and selected fallback mark behavior |
| Post-TASK-042 design direction | done | `TASK-043` completed presence marks, `TASK-044` completed evidence-bearing motion, `TASK-045` completed chrome/type cleanup, `TASK-046` completed guided-story tightening, and `TASK-047` completed selected-only similarity arcs |
| Mockup revision sprint | done | `TASK-021`, `TASK-022`, `TASK-023`, and `TASK-024` are complete; their durable outcomes now inform `TASK-025` through `TASK-028` |
| Artistic redesign contract | approved | `context/ARTISTIC_REDESIGN_BRIEF.md` defines “The Shape of What We Know,” the five-scene storyboard, evidence-mark grammar, art direction, motion, mobile, simplification, and growth contracts |
| Evidence semantics correction | pending | `TASK-048` separates the eight score inputs from responsibility-context and total trace rows before any new mark is built |
| Artistic story rebuild | pending | `TASK-049` through `TASK-055` cover concept approval, native scroll, five scenes, evidence marks, editorial figures, rank-band motion, and quieter exploration |
| Simplification and readiness | pending | `TASK-056` removes redundant code/data/dependencies/stale context; `TASK-057` adds URL state and runs the final QA matrix |

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
- Started `TASK-006` visual mockup pass with a buildable React/Vite atlas concept for owner review; later child tasks completed public-data wiring, MapLibre/Natural Earth map context, guided copy, and final interaction polish.
- Added and completed `TASK-019` as an Evidence Fingerprint Divergence analysis lane so JSD ideas fit the official-data story without becoming a new leaderboard or overclaimed model.
- Completed `TASK-020` Dataviz Inspiration audit with live browser review of map/climate/environment references and updated the story, design, Claude mockup, decision, backlog, and memory context around full-bleed map, selected-anchor, compact evidence-strip, direct-label, and evidence-bearing-motion patterns.
- Organized the delegated sprint: Codex owned mockup critique and QA, Claude owned the visual revision pass, a Codex data agent completed `TASK-019`, and a Codex app-data agent completed the mock-to-public-data wiring inventory.
- Completed `TASK-021` mockup critique with a Claude-facing checklist; its durable outcome is consolidated into `TASKS.md`, `HANDOVER.md`, and the design brief.
- Completed and accepted `TASK-022` / `TASK-024`: Claude revised the visual mockup, Codex reviewed the code and context, applied small QA fixes, and prepared the accepted mockup revision for commit.
- Completed `TASK-023` app-data wiring inventory in `context/plans/app-data-wiring-inventory.md`. At inventory time, base scores and centroids were available while monitoring reporting status, rank uncertainty, story labels, top-signal arrays, political/status context, and outlook display gating still needed export/derivation; `TASK-025` has since completed that core wiring.
- Completed `TASK-019` Evidence Fingerprint Divergence with 22 geography fingerprints, 231 unordered pairwise JSD rows, 66 nearest-neighbor rows, and caveated provenance. `TASK-037` later wired the nearest-neighbor rows into the selected-place panel only.
- Completed a Pacific Dataviz winner scroll-tour audit. Recommendation: pivot the next visual direction to a scroll-led hybrid that keeps the atlas map as the sticky evidence surface and preserves free exploration after the guided path.
- Accepted Claude's scroll-led hybrid implementation after Codex cleanup. The app now starts in a 7-beat guided atlas mode, uses the map as the sticky evidence surface, preserves "Explore freely" as the full-control handoff, and treats Evidence Fingerprint Divergence as selected-place detail rather than a global similarity map.
- Reorganized the remaining `TASK-006` app work into `TASK-025` app-data wiring, `TASK-026` MapLibre substrate, `TASK-029` Pacific land context, `TASK-028` guided story/copy rewrite, and `TASK-027` post-map visual polish before the final readiness split into `TASK-030` and `TASK-031`.
- Completed `TASK-025` real app-data wiring: app data exports now include monitoring, rank, story, context, and outlook-display objects; the React app loads `/data/geographies.json` through `app/src/lib/atlasData.ts`; the obsolete mock fixture was deleted.
- Completed `TASK-026` MapLibre map substrate: `AtlasMap` now renders a no-network MapLibre Pacific canvas with generated centroid point features, React overlay labels, accessible geography hit targets, monitoring hatching/dashed cues, selected/priority state, and explicit boundary-not-joined caveats. It does not ship polygon boundaries.
- Completed `TASK-029` Pacific land context: `scripts/build_land_context.py` builds and mirrors Natural Earth 10m land into the app, writes provenance, renders land under centroid points, and moves graticule lines into MapLibre so the grid appears on initial render.
- Completed `TASK-028` guided story/copy rewrite: the seven-beat tour, method drawer, data-quiet panel, fingerprint preview, country-panel trace note, and geometry caveats now read as evidence-backed interface copy for owner visual review.
- Completed `TASK-027` post-map visual polish: fixed mobile first-load map framing, guided beat scroll/state sync, country-detail trace loading, data-quiet explanation copy, overlay selection persistence, rank-uncertainty explainers, method-drawer focus/Escape handling, mobile explore hierarchy, story label offsets, and comparator microcopy.
- Completed `TASK-030` and `TASK-031` in parallel: readiness packaging/provenance/deployment audit plus accessibility/keyboard/mobile QA. Remaining owner actions are final host/URL, submission-form copy, AI disclosure wording, sensitive wording review, and final human visual/accessibility review.
- Completed `TASK-042`: the island-glow legend no longer teaches dots, dead compare-mode code is gone, and selected centroid fallback marks remain visible until island marks replace them. Post-TASK-039 audit follow-up is now closed.
- Completed `TASK-047` selected-only JSD neighbor arcs: selected geographies can show restrained dashed arcs to their generated nearest evidence-profile neighbors in free exploration or the guided fingerprint beat, with mobile simplified to one arc and no arcs in coverage, uncertainty, outlook, or no-selection states. The post-TASK-042 design direction group is complete.
- Completed a second full repository, context, implementation, story, and live-layout audit on 2026-07-09. The review found a semantic correctness issue in `included_indicator_count`, competing nested-scroll/observer state, mobile scene clipping, repeated uncertainty explanation, physical implications from JSD arcs, overloaded mark grammar, redundant runtime products/dependencies, and stale documentation.
- Approved **The Shape of What We Know** as the next narrative identity while keeping **The Pacific Adaptation Gap Atlas** as the product title. The target story has five scenes: reveal equal-presence marks, expose breaks in the record, separate pressure from visible capacity, compare Nauru and Tuvalu, and rearrange marks into rank bands before returning to exploration.
- Added `TASK-048` through `TASK-057` and three executable implementation plans. No redesign implementation task has started; `TASK-048` is the next legal task, and `TASK-049` is the owner visual-approval gate before frontend redesign work.
