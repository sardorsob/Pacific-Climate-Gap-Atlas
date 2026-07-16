# Project

## Current Phase

The existing fullscreen map, evidence marks, controls, selected-place panel, URL/history behavior, accessibility, and Explore handoff remain the approved application baseline and visual-identity authority. `TASK-074` through `TASK-076` now implement the accepted regional movement -> evidence visibility -> exploration story without replacing that palette, typography, map treatment, or interaction language. TASK-076 passed focused TDD, independent frozen-diff review, full automated gates, and live desktop/portrait/landscape WebGL spot-checks. `TASK-077` is the sole remaining release and owner-taste gate; `TASK-057` remains `needs-fix` until the owner accepts that final matrix. Competition deadline: August 31, 2026.

## Status

The repository has a committed workflow scaffold, official dataset contracts, a reproducible processed data pipeline, a draft Adaptation Gap Index baseline, an app-optional Adaptation Gap Outlook baseline, enriched app-ready JSON/GeoJSON, script-first EDA outputs, TASK-019 evidence-fingerprint divergence artifacts, story/design briefs, reference audits, and a functioning React/Vite scroll-led atlas wired to generated public data.

The current implementation uses the existing React/Vite/MapLibre shell and 22 equal-presence marks across four native-scroll scenes. It moves the same identities from geography into a regional water/renewable cross-current field, rearranges them into a separate 22-by-14 evidence-visibility field, and returns them to the existing explorer in neutral overview mode. The Adaptation Gap Index remains an explicit optional Explore layer, not the title, opening, or default verdict. No new map engine, dashboard shell, router, animation library, or visualization dependency was added. The consolidated design source of truth is `context/ARTISTIC_REDESIGN_BRIEF.md`.

## Approved Public Title

Pacific Climate Evidence Atlas

## Current Thesis

Official records across 22 Pacific geographies show no single shared path in safely managed drinking-water access and renewable-energy share. Nineteen places can be compared on both measures, and their first-to-latest changes occupy all four direction combinations. The official record is also uneven: three places lack one or both Act-I measures, and broader dataset presence varies by geography. The guided story shows those two facts separately, then returns the reader to the existing island-by-island explorer without a global verdict.

## Feature Table

| Area | Status | Notes |
| --- | --- | --- |
| Research source folder | present | `research/` includes brief, official dataset inventory, past winners, and review board |
| Workflow shell | done | all durable project Markdown lives under `context/` |
| Dataset profile | done | `artifacts/tables/dataset_profile.csv` and `data/contracts/*.json` cover the original nine plus six processing-disabled official candidates |
| Targeted dataset expansion | done | `TASK-066` processes five accepted candidates into research data while preserving the baseline index and public app; aggregate crop yield remains rejected |
| Data science pipeline | done | `scripts/make_dataset.py` produces normalized observations, geography lookup, app summary, and provenance |
| Adaptation Gap Index | done | `scripts/build_gap_index.py` produces geography scores plus indicator trace |
| Outlook model | done | trend stress-test baseline is methodology-ready and app-optional |
| Evidence fingerprint divergence | app-wired | `TASK-019` produced fingerprints, pairwise JSD rows, nearest-neighbor rows, and provenance; `TASK-037` wires nearest neighbors into selected-place detail only |
| Static app data | done | `scripts/build_app_data.py` produces public JSON/GeoJSON layer inputs |
| EDA sprint | done | GIS context, coverage/data-desert, indicator-forensics, country-story, spatial-typology, trend/outlook, monitoring-gap, and story/design synthesis are complete |
| Dataviz inspiration audit | done | `context/DATAVIZ_INSPIRATION_AUDIT.md` records route sampling and original-project interaction lessons for map-first, climate, environmental, selected-geography, evidence-strip, and guided-tour patterns |
| Winner scroll-tour audit | done | `context/WINNER_SCROLL_TOUR_AUDIT.md` recommends a scroll-led hybrid: default guided scroll atlas, secondary free explorer, current map/control shell preserved |
| GIS atlas app | done | React/Vite app opens as a five-scene native-scroll atlas with a sticky MapLibre map, visible legend, direct story labels, selected-place JSD neighbors, source drawer, and free-explore handoff; `TASK-006` closed after its focused child tasks |
| App-data wiring implementation | done | `TASK-025` replaced fixture-backed evidence with public/generated app data while preserving monitoring, rank, story, outlook, and caveat fields |
| MapLibre substrate | done | `TASK-026` adds a MapLibre-backed map canvas and centroid point layer |
| Pacific land context | done | `TASK-029` adds Natural Earth visual land context and MapLibre graticule lines; scored geographies remain centroid points, not polygon boundaries |
| Story/copy rewrite | done | `TASK-028` sharpened the historical seven-beat copy, map callouts, caveats, CTAs, geometry caveats, and method/source text before the five-scene rewrite |
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
| Artistic redesign contract | approved baseline | `TASK-059`–`TASK-064` established the fullscreen stage, readable figures, native scroll, stable URL state, and Explore handoff that the next narrative must reuse |
| Data-first narrative discovery | done | `TASK-065`–`TASK-068` acquired, processed, and tested the expanded evidence; `TASK-069` accepted the regional movement -> visibility -> exploration claim chain |
| Narrative retrofit roadmap | release QA | `TASK-072`–`TASK-076` are complete; `TASK-077` owns the final evidence, interaction, responsive, accessibility, security, and owner-review matrix |
| Evidence semantics correction | done | `TASK-048` separates the eight score inputs from responsibility-context and total trace rows in generated data, EDA, validation, and app copy; independent QA accepted the contract |
| Artistic story rebuild | done | `TASK-049` through `TASK-055` cover concept approval, native scroll, five scenes, evidence marks, editorial figures, rank-band motion, and quieter exploration |
| Simplification and readiness | needs-fix | `TASK-056` is accepted and `TASK-064` closed the scene-scale issue; `TASK-057` stays open only for the replacement narrative and final owner QA in `TASK-077` |
| Shareable URL state | verified locally | `mode`, `scene`, `layer`, `view`, `place`, and `outlook` parse/serialize safely with guarded history updates, app-owned reload scroll restoration, and no router |
| App bundle budget | verified locally | JS 1,028,815 bytes; CSS 94,411 bytes; caps 1,050,000 and 95,000 bytes |

## Last Session Notes

- Completed TASK-074 through TASK-076 as separate reviewed commits: four stable guided IDs and neutral URL fallbacks; one shared exact-data movement/visibility field; preserved explorer integration; and reference-proven removal of the retired guided figures/CSS. Live Brave/WebGL QA passed desktop, portrait, and landscape spot-checks, URL/history/control transitions, map selection, panel/dialog access, Guided reset, and reduced motion. TASK-077 remains the final owner gate.
- Accepted the evidence-backed regional story after TASK-068: 22 places remain visible; 19 complete water/renewable comparisons split 7/6/3/3 across the four direction combinations; Guam, Pitcairn, and Tokelau remain explicitly missing; the same marks then expose separately constructed evidence visibility before returning to Explore.
- Preserved the existing application as a hard constraint. The map, marks, fullscreen stages, controls, panel, methods/sources, URL/history, accessibility, and exploration behavior are reused. The old guided copy, Nauru/Tuvalu comparison, rank-band ending, Adaptation Gap title, and index-first default are not.
- Added the minimal `TASK-072`–`TASK-077` roadmap. `TASK-072` transition concepts and `TASK-073` data export can run in isolated worktrees while final task/log updates are serialized; scene, figure, and integration work remain sequential because they share scene state, `MapOverlay`, and stage CSS; `TASK-077` owns final owner QA and readiness reconciliation.
- Approved structure: context-first monorepo.
- Historical headline decision, now superseded: broader adaptation gap, with monitoring as one diagnostic layer. The Adaptation Gap Index remains optional Explore evidence.
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
- Accepted Claude's historical scroll-led hybrid implementation after Codex cleanup. The pre-redesign app started in a 7-beat guided atlas mode; the current five-scene path uses the map as the sticky evidence surface, preserves "Explore freely" as the full-control handoff, and treats Evidence Fingerprint Divergence as selected-place detail rather than a global similarity map.
- Reorganized the remaining `TASK-006` app work into `TASK-025` app-data wiring, `TASK-026` MapLibre substrate, `TASK-029` Pacific land context, `TASK-028` guided story/copy rewrite, and `TASK-027` post-map visual polish before the final readiness split into `TASK-030` and `TASK-031`.
- Completed `TASK-025` real app-data wiring: app data exports now include monitoring, rank, story, context, and outlook-display objects; the React app loads `/data/geographies.json` through `app/src/lib/atlasData.ts`; the obsolete mock fixture was deleted.
- Completed `TASK-026` MapLibre map substrate: `AtlasMap` now renders a no-network MapLibre Pacific canvas with generated centroid point features, React overlay labels, accessible geography hit targets, monitoring hatching/dashed cues, selected/priority state, and explicit boundary-not-joined caveats. It does not ship polygon boundaries.
- Completed `TASK-029` Pacific land context: `scripts/build_land_context.py` builds and mirrors Natural Earth 10m land into the app, writes provenance, renders land under centroid points, and moves graticule lines into MapLibre so the grid appears on initial render.
- Completed `TASK-028` historical seven-beat guided story/copy rewrite: the method drawer, data-quiet panel, fingerprint preview, country-panel trace note, and geometry caveats read as evidence-backed interface copy for owner visual review before the five-scene rewrite.
- Completed `TASK-027` post-map visual polish: fixed mobile first-load map framing, guided beat scroll/state sync, country-detail trace loading, data-quiet explanation copy, overlay selection persistence, rank-uncertainty explainers, method-drawer focus/Escape handling, mobile explore hierarchy, story label offsets, and comparator microcopy.
- Completed `TASK-030` and `TASK-031` in parallel: readiness packaging/provenance/deployment audit plus accessibility/keyboard/mobile QA. Remaining owner actions are final host/URL, submission-form copy, AI disclosure wording, sensitive wording review, and final human visual/accessibility review.
- Completed `TASK-042`: the island-glow legend no longer teaches dots, dead compare-mode code is gone, and selected centroid fallback marks remain visible until island marks replace them. Post-TASK-039 audit follow-up is now closed.
- Completed `TASK-047` selected-only JSD neighbor arcs: selected geographies can show restrained dashed arcs to their generated nearest evidence-profile neighbors in free exploration or the guided fingerprint beat, with mobile simplified to one arc and no arcs in coverage, uncertainty, outlook, or no-selection states. The post-TASK-042 design direction group is complete.
- Completed a second full repository, context, implementation, story, and live-layout audit on 2026-07-09. The review found a semantic correctness issue in `included_indicator_count`, competing nested-scroll/observer state, mobile scene clipping, repeated uncertainty explanation, physical implications from JSD arcs, overloaded mark grammar, redundant runtime products/dependencies, and stale documentation.
- Historical narrative decision, now superseded: **The Shape of What We Know** kept **The Pacific Adaptation Gap Atlas** as the product title and used a five-scene evidence sequence. Its fixed marks, fullscreen stage, and explorer remain useful; its title and guided claims do not.
- Added `TASK-048` through `TASK-057` and three completed implementation plans. Owner QA later returned the rail composition to `needs-fix`; `TASK-058` defined the fullscreen correction, and `TASK-059` through `TASK-064` are now accepted as the application baseline.
- Implemented `TASK-048` in the Python index, EDA drivers/divergence layer, app exporter, static contract validator, React adapter, map-size encoding, legend, and selected-place panel. Regenerated index/EDA/app artifacts sequentially.
- Completed the `TASK-057` URL/history and hydration follow-ups. Local automated release gates passed (60 Python tests, 34 frontend tests, contracts/artifacts/statuses/secrets, build, budget, whitespace); final built assets are JS 1,022,289 bytes and CSS 93,895 bytes under 1,050,000/95,000 caps. Browser-use verified copied-scene URL restoration, invalid fallback, explicit pushes, passive replacement, and Back/Forward. Owner visual QA then failed the opening clarity and scene-4/5 scale, so deployment and submission remain blocked behind `TASK-058`–`TASK-064`.
