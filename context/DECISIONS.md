# Decisions

## 2026-06-24: Use A Context-First Repository Layout

All durable workflow documents, project state, task status, assumptions, and handoff notes live under `context/`.

Reason: the user wants one explicit context folder as the working memory center for both agents and humans.

## 2026-06-24: Use Adaptation Gap As The Main Frame

The headline is the broader adaptation gap, not only monitoring gaps.

Reason: monitoring is a strong diagnostic layer, but the broader adaptation frame better supports climate signal, stress, and capacity comparisons.

## 2026-06-24: Keep Outlook Modeling Transparent And Baseline-First

The future-facing layer will be framed as an outlook or scenario baseline, not an operational prediction.

Reason: there is unlikely to be enough target-labeled data for a defensible supervised prediction model, but a transparent trend/scenario layer can still add value.

## 2026-06-24: Keep Workflow Kits Local And Ignored

Reference workflow kits are copied under `context/agentic-workflow-kit/` and `context/data-science-agentic-workflow-kit/`, but ignored by Git.

Reason: they are useful local context but should not be pushed with this project.

## 2026-06-24: Parallelize Independent Work And Commit Task-By-Task

Independent tasks should run in parallel when dependencies and file ownership allow it. The orchestrator reviews parallel outputs before accepting them.

Commits should be task-oriented and must not include `Co-authored-by` trailers or assistant/agent authorship credit.

Reason: the user wants fast agentic execution without losing review discipline or clean authorship.

## 2026-06-24: Use PowerShell Fallback For Pacific SDMX CSV Profiling

The dataset profiler first tries Python standard-library HTTP, then falls back to Windows PowerShell `Invoke-WebRequest -UseBasicParsing` when the SDMX endpoint returns `422`.

Reason: the early repo does not have Python dependencies installed, and the official Pacific SDMX endpoint accepted the PowerShell request with the same SDMX CSV accept header.

## 2026-06-24: Prefer Local Raw Cache Before Live Fetching

The processed data pipeline checks `data/raw/official/*.csv` before calling live SDMX URLs. The raw cache is ignored by Git, and manual download filenames are documented in `data/raw/README.md`.

Reason: direct CSV downloads are a practical sprint backup when the official API is slow or client-sensitive, while the pipeline remains reproducible from either raw cache or live source URLs.

## 2026-06-24: Use Latest-Observation Percentile Ranks For Baseline Index

The first Adaptation Gap Index keeps the latest non-missing observation per geography and dataset, ranks each indicator within available Pacific geographies, averages climate/observed-stress ranks into pressure, averages adaptation-capacity ranks into capacity, and rescales pressure minus capacity to 0-100.

Anomaly datasets use absolute anomaly magnitude for scoring while preserving raw values in the trace table.

Reason: this gives us a transparent, auditable baseline quickly without imputation or opaque weighting, while leaving room for sensitivity analysis later.

## 2026-06-24: Treat Outlook As App-Optional Stress Test

The Adaptation Gap Outlook uses simple climate-signal linear trends and capacity scenarios for 2030 and 2050. It is methodology-ready but app-optional, and must not be described as an operational prediction.

Reason: aggregate linear holdout MAE beats naive, but fewer than half of individual trend series beat the naive baseline, so the result is useful for exploration only with visible caveats.

## 2026-06-24: Use Centroid GIS Exports Until Boundary Join Exists

TASK-005 exports app-ready GeoJSON as centroid features with explicit `geometry_status` and `geometry_policy` fields. The app should treat these as centroid or point layers until we add boundary data.

Reason: the official processed data has reliable geography codes and scores, but no tracked polygon boundary source yet. Centroids let the app shell move forward while keeping the geometry limitation visible.

## 2026-06-24: Pause App Design For Script-First EDA

The project will slow down before the visual design pass and run deeper exploratory analysis in Python modules and scripts rather than notebooks as the source of truth.

Reason: the atlas needs an evidence-backed story before Claude or any visual-design pass polishes the interface. Python files keep diffs smaller, artifacts reproducible, and parallel agent work easier to review.

## 2026-06-25: Keep GIS Context Descriptive And Boundary-Neutral

TASK-010 adds `data/external/geography_context.csv` and source notes for Pacific subregion, political status, administering or sovereign authority, and island-group context.

These fields are descriptive only and must not feed Adaptation Gap Index scoring unless a future reviewed methodology explicitly changes that.

Pacific subregions follow UN M49 statistical groupings and should not be framed as cultural or political boundaries. Boundary polygons remain undecided; keep centroid-first mapping until an authoritative boundary source is selected and documented.

Reason: the atlas needs spatial context for GIS exploration, but status labels and regional groupings are politically sensitive and should not be smuggled into the quantitative method.

## 2026-06-25: Treat EDA Story Labels As Descriptive Screens

TASK-012, TASK-013, TASK-014, and TASK-017 produce interpretation tables for story selection: indicator forensics, country story labels, rank volatility, and monitoring-gap priorities.

These outputs guide app copy, layer priority, and exemplar selection. They do not alter the baseline index and must not be described as causal explanations.

Monitoring-gap language should distinguish reported-zero monitoring rows from missing monitoring rows. Missing rows are reporting gaps unless an external source verifies infrastructure absence.

Reason: the current evidence base is strong enough for exploratory story selection but not for causal attribution, definitive rankings, or infrastructure-absence claims.

## 2026-06-25: Gate Outlook Layers With Diagnostic Quality

TASK-016 adds `eda_outlook_interpretation.csv` as display guidance for future-facing layers.

Supported diagnostics can appear as stress-test context. Mixed diagnostics require strong visible caveats. Weak or sparse diagnostics should be withheld from outlook layers.

Reason: the outlook is useful for exploratory contrast, but the diagnostics are too uneven for forecast language or automatic display across every geography.

## 2026-06-27: Add Evidence Fingerprint Divergence As A Planned Secondary Layer

The project will explore Jensen-Shannon divergence as a way to compare official-data evidence profiles across Pacific geographies. The public-facing idea is "evidence fingerprint similarity": which places have similar pressure, capacity, and data-visibility profiles behind their adaptation-gap scores.

JSD is preferred for the interface because it is symmetric, bounded, and easier to explain. KL divergence may be used only as an internal diagnostic after smoothing and missingness review.

The layer must be anchored on a selected geography and must not become a global leaderboard, causal cluster, vulnerability score, or policy-need grouping.

Reason: the idea strengthens the atlas by moving beyond "who ranks high" toward "what kind of gap profile is this," while staying inside the official-data evidence base and avoiding overclaimed modeling.

## 2026-06-30: Treat Evidence Fingerprint Divergence As Analysis-Ready, Not App-Shipped

TASK-019 generated the evidence fingerprint table, unordered pairwise JSD table, nearest-neighbor table, and divergence provenance summary.

The layer can be considered for selected-geography comparison, but it is not app-shipped until a compact public-data contract, interface copy, caveat placement, and mobile/desktop QA exist.

Exact JSD values may remain behind the method layer or appear as secondary detail; the primary reader-facing language should emphasize similarity bands and evidence-profile reasons.

Reason: the analysis passed the first traceability and caveat bar, but a public similarity layer is easy to overread as clustering, shared vulnerability, or policy need. The product gate should happen during app-data wiring and visual QA.

## 2026-06-30: Explore A Scroll-Led Hybrid As The Next Visual Direction

The Pacific Dataviz winner audit found that recent custom interactive winners often use scroll or long-form visual-essay pacing to introduce the main claim before deeper interaction.

The next atlas design pass should therefore explore a scroll-led hybrid: a sticky full-bleed map, one evidence claim per scroll beat, scroll-driven map/layer state, and a persistent "Explore freely" path into the current atlas controls.

This is a design direction for review, not an implemented product change. The current atlas shell should be preserved unless the owner rejects the hybrid after visual critique.

Reason: the current mockup is strong as a GIS explorer, but it asks first-time judges to parse many controls immediately. A scroll spine can earn attention and teach the map while keeping the exploratory atlas intact.

## 2026-06-29: Use Inspiration References As Principle Studies, Not Visual Copies

The Dataviz Inspiration audit should guide interaction principles, not visual imitation. Reference lessons to preserve include full-bleed map surfaces, compact domain controls, selected-geography anchors, direct map labels, compact evidence strips, and motion only when it encodes evidence.

Reference lessons to avoid include long pre-map intros, inaccessible custom selectors, hover-only explanation, hidden caveats, copied climate-stripe treatments, copied publication identity, and decorative motion.

Reason: the competition entry needs to learn from strong interactive map and climate work while remaining original, evidence-backed, and tightly aligned with the Pacific Adaptation Gap Atlas story.

## 2026-06-30: TASK-022 Claude Visual Revision Decisions (accepted after TASK-024 QA)

These are Claude's mockup decisions from the visual revision pass, accepted after Codex QA with small follow-up fixes for panel lifecycle, source text encoding, and typography rule compliance.

The default first screen hides the detail panel. The panel is now a right-side slide-in overlay (bottom sheet on mobile) that opens only on selection or the data-quiet view. The thesis lives in the map header instead of a large editorial panel, so the first read is an atlas rather than a map surrounded by dashboard cards.

The legend is a visible compact panel on desktop and a collapsible chip on mobile. The previous closed `<details>` disclosure that hid the desktop legend on first load is removed.

The default map carries direct labels with leader lines for the story exemplars (PN, NR, AS, WF, TV), faint UN M49 subregion orientation text, and lon/lat graticule ticks. Labels are limited to exemplars to avoid clutter; subregion text is descriptive orientation, not a boundary.

Selected geography is treated as an anchor. The earlier static "vs Tuvalu" suggested-comparator cue was later removed because it read like a real pairwise comparison. TASK-037 ships JSD only as selected-place nearest-neighbor detail with exact distance, similarity band, reason, and caveat. The app still does not ship free pairwise comparison, a global link network, a map similarity ramp, or a leaderboard.

The data-quiet view is map-led. The PN/NR/AS/WF group is labeled directly with in-map "reports 0" versus "no rows" tags so reported-zero and missing-row monitoring states are distinguishable without reading the panel.

The country panel gains a compact at-a-glance evidence strip (pressure, capacity, rank movement, evidence density, monitoring status) above the detailed sections, so the panel can be scanned before it is read.

Mobile controls moved to a top toolbar so they no longer fight the bottom sheet for the same screen edge. Card radii were reduced from 12px to 8px with cartographic linework and typography polish and no decorative atmosphere.

Reason: the TASK-021 critique asked for a stronger map-first hierarchy, a visible legend, a selected-anchor workflow, a map-led data-quiet state, compact evidence strips, and a cleaner mobile layout, while preserving the evidence contract (caveats beside claims, centroid-fallback note, reported-zero versus missing distinction, rank fragility, no leaderboard, no polygon choropleth, no global JSD layer).

## 2026-06-30: Accept Scroll-Led Hybrid Mockup Direction

The next app mockup direction is accepted as a seven-beat guided atlas layered over the existing explorer shell.

The default experience is guided scroll with the map as the sticky evidence surface. Scroll, progress ticks, buttons, and keyboard controls all drive the same beat state. "Explore freely" hands off to the full atlas controls while preserving the current layer, view, and selected geography.

Evidence Fingerprint Divergence now appears in selected-place detail as nearest official-data profile neighbors. It is not a global ramp, cluster view, or leaderboard.

Reason: the winner audit showed that recent custom interactive winners use guided pacing to earn attention, while the project still needs the credibility of a GIS-style exploratory atlas. The hybrid path preserves both.

## 2026-07-01: Use MapLibre As The App Map Substrate While Retaining Centroid Fallback

TASK-026 replaces the SVG-only map surface with a MapLibre-backed Pacific canvas and generated centroid point source. React overlays still own direct labels, hatching/dashed monitoring cues, selected brackets, and keyboard-accessible geography hit targets.

Reviewed polygon boundaries are not shipped in this task. Boundary data requires a separate source, license, geopolitical wording, and methodology review before any island or territory polygons can appear.

Reason: MapLibre gives the app a real GIS interaction substrate now, but the current official app data only supports centroid geometry. The atlas should improve spatial feel without implying boundary precision we have not sourced.

## 2026-07-01: Add Natural Earth Land Context Without Changing Scored Geometry

TASK-029 adds Natural Earth 10m land as a low-contrast visual land-context layer under the atlas points. The layer is public domain, clipped to the Pacific map extent, shifted into the app's antimeridian-aware longitude space, and documented in `artifacts/provenance/land_context_summary.json`.

The layer is not a score input, official territorial boundary source, selectable geography layer, or polygon choropleth. Scored geographies remain centroid features generated from the official-data pipeline. TASK-029 also moves graticule linework into MapLibre so the grid appears on initial render instead of waiting for map movement.

Reason: the owner wanted the islands themselves to be visible, not only dots. Natural Earth improves spatial orientation and visual credibility while preserving the evidence contract that rankings, selections, and caveats attach to centroid records rather than boundary polygons.

## 2026-07-09: Approve “The Shape Of What We Know” As The Next Narrative Identity

Keep **The Pacific Adaptation Gap Atlas** as the product title. Use **The Shape of What We Know** as the narrative identity for the next redesign.

The governing argument is that official records illuminate the Pacific unevenly, and gaps in the record change what the atlas can responsibly compare, rank, and conclude. The adaptation-gap score remains the entry point, but the evidence behind the score becomes the protagonist.

Reason: the current app is careful and functional but reads as a sequence of GIS features. One central argument gives the marks, scene order, layout, motion, and closing line a shared purpose.

## 2026-07-09: Correct Score-Input Semantics Before Visual Redesign

Replace the ambiguous `included_indicator_count` contract with separate score-input, context-only, and total trace counts before building a new evidence glyph.

The score-input universe is eight datasets across climate signal, observed stress, and adaptation capacity. Greenhouse-gas emissions per capita is responsibility context only. It may remain visible in trace/context surfaces but must not be counted or drawn as feeding the score.

Reason: the current count includes all trace datasets while the panel and legend describe that count as inputs behind the score. A more expressive mark would amplify the error unless the data contract is corrected first.

## 2026-07-09: Use Five Scenes And One Visual Operation Per Scene

Replace the current seven-beat guided spine with five scenes: reveal what the map can see, subtract to expose breaks in the record, separate pressure and visible capacity, compare Nauru and Tuvalu, and rearrange marks into rank bands. Return the marks to geography before handing off to exploration.

Each scene gets one claim, one evidence operation, one necessary caveat, and one source line. The method remains accessible but does not need its own guided beat.

Reason: the smaller sequence removes repetition and lets the story flow through perceptual change rather than interface explanation.

## 2026-07-09: Use Fixed-Presence Evidence Portraits

Every geography keeps the same overall visual footprint at basin scale. The target mark uses an inner score field, eight fixed score-input positions, a separate context-only tick, an outer monitoring edge, and a quiet selection bloom.

Missing evidence appears as open cuts or unlit positions. It must not make a geography smaller or less visually important. Natural Earth land remains subdued context/texture.

Reason: evidence-size marks correctly encode density but also make thin-data places disappear—the opposite of the atlas’s editorial argument.

## 2026-07-09: Use Native Document Scroll And One Canonical Scene State

Replace the nested desktop story scroller with normal document sections and a sticky map. A viewport-root observer owns active scene state. Progress and keyboard controls scroll to sections and do not set a competing state ahead of the observer.

Reason: the current observer, `onBeat`, and `scrollIntoView` paths can fight and snap a progress-button jump back. Native page scroll also gives mobile content room to finish without being covered by fixed navigation.

## 2026-07-09: Keep JSD In The Panel And Remove Physical Connectors

Move evidence-profile similarity out of the guided spine. Keep exact nearest-neighbor JSD evidence and caveats in the selected-place exploration panel. Remove dashed map arcs and do not add a global similarity layer.

Reason: the arcs are traceable but readily read as routes, physical relationships, causality, shared risk, or a network. The panel communicates the method with less semantic risk and lower visual cost.

## 2026-07-09: Require Concept Approval Before Frontend Redesign

`TASK-049` must produce and record owner-approved desktop and mobile concept frames before `TASK-050` through `TASK-055` begin. The gate decides the evidence-mark silhouette, score-input order, context tick, reporting edges, typography, palette, motion tokens, and mobile composition.

Reason: the redesign contains meaningful artistic judgment. Recording the decisions before implementation prevents code-first visual drift and keeps review focused.

## 2026-07-09: Simplify Only After The New Experience Stabilizes

Schedule dependency cleanup, redundant generated-file removal, MapLibre/React ownership splitting, and stale-context archival after the story and exploration redesign is stable.

Reason: deleting and restructuring during active visual work would create moving targets. `TASK-056` will use characterization tests and source-usage proof so simplification is behavior-preserving rather than speculative.

## 2026-07-10: Implement TASK-048 Evidence-Count Contract

`TASK-048` replaces `included_indicator_count` in the index, EDA, generated app records, validator, React adapter, map encoding, legend, and selected-place panel. The contract now exposes `score_input_indicator_count` (maximum 8), `context_indicator_count`, `trace_indicator_count`, and an ordered `score_input_presence` list. Primary presence marks use a stable radius while the future evidence glyph remains planned for `TASK-052`.

The responsibility-context greenhouse-gas dataset remains available in trace rows and is explicitly labeled as outside the score. EDA evidence density and divergence visibility now use score-input counts only.

Reason: a correct semantic contract is required before missingness and completeness can be made visual. The regenerated artifacts preserve the existing score values while removing the risk of describing context data as score evidence.

## 2026-07-12: Approve A Fullscreen Evidence Stage To Replace The Fixed Story Rail

Owner QA rejected the functioning 28rem rail composition because the opening did not explain the project clearly enough and scenes 4 and 5 made primary evidence too small to read comfortably.

The owner-approved direction is **One Constellation on an Elastic Stage**, with restrained tidal arrival/recession for the comparison and rank chambers:

- one fullscreen premise precedes the five evidence scenes;
- the map owns the viewport for the premise and scenes 1–3;
- Nauru/Tuvalu owns the viewport in scene 4;
- the 22-row interval field owns the viewport in scene 5;
- the same 22 marks return to geography for Explore.

The current scientific, evidence-mark, URL-state, accessibility, generated-data, geometry, and panel-only JSD contracts remain intact. The layout revision may not introduce nested scrolling, scrolljacking, a second active-scene writer, an animation dependency, generated concept data, or unsourced cultural/geopolitical visual claims.

Reason: visual hierarchy must follow the evidence. A persistent map is useful while geography is the main question, but it becomes wasted space when the reader needs aligned comparison fields or 22 readable rank intervals.
