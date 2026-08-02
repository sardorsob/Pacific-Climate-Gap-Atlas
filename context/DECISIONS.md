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

## 2026-07-12: Acquire And Explore Additional Data Before Choosing The Final Story

Reopen the competition narrative while preserving the implemented visual system as the baseline. Do not select a final story, rewrite scenes, or add app layers until a targeted official-data expansion has been acquired, processed, and audited.

The first candidate set is population growth, renewable-energy share, safely managed drinking water, crop yield, direct disaster economic loss, and the climate-altering land-cover index. This is a research shortlist, not a promise to use every dataset. Candidates may be rejected for weak coverage, unclear units or denominators, incompatible time periods, ambiguous source semantics, or inability to support a responsible non-causal claim.

The sequence is profile (`TASK-065`) -> process (`TASK-066`) -> candidate exploration (`TASK-067`) -> deeper regional evidence test (`TASK-068`) -> select story (`TASK-069`) -> rewrite roadmap (`TASK-071`). The completed unrelated repository cleanup remains `TASK-070`. The current Adaptation Gap Index, product title, Nauru/Tuvalu comparison, premise, and five-scene order remain functional but provisional. No candidate becomes a score input automatically.

Reason: the owner prefers building the narrative from explored evidence rather than choosing a compelling concept first and searching for confirming data. This also prevents a broader dataset inventory from becoming an unfocused dashboard or a new composite score without scientific justification.

## 2026-07-13: Use A Visual Research Atlas Before Selecting The Story

Keep the approved data-first sequence and strengthen `TASK-067` instead of creating more task files. After candidate processing, TASK-067 will first generate reproducible coverage/alignment, distribution, trend, and named-place comparison figures. It will then compose one contact sheet with three rough evidence-board narrative auditions using only supported findings. The later regional test and selection gates may be added inside the existing task ledger when owner review requires them.

Use static Matplotlib figures by default. Plotly is optional only when linked interaction materially changes the analytical judgment. Do not add GeoPandas or imply polygon precision while the scored geography contract remains centroid fallback. No research figure or audition is final scene copy, an app layer, or approval to change the index.

Reason: tables establish correctness, but visual exploration makes distributions, temporal mismatches, named-place contrasts, and narrative tension easier to inspect. Separating the research atlas from story selection lets the project pursue a stronger and more human story without promoting a dramatic but incomparable pattern.

Implementation result: TASK-067 generated the five analytical figures, three evidence tables, and one three-audition contact sheet with Matplotlib only. The auditions are different clocks/reporting visibility, service-energy cross-currents, and profiles instead of a ladder. No winner, app layer, score change, or final scene copy was declared.

## 2026-07-14: Test A Regional Two-Act Story Before Selecting It

Use the owner-approved working spine—not yet final scene copy—as the next research hypothesis:

1. **A region moving in different directions.** Begin with complete Pacific distributions and trajectories, testing whether water/renewable cross-currents and other within-indicator evidence describe a regional field rather than a few attractive examples.
2. **A region seen with unequal clarity.** Change the encoding to official-data coverage, reporting gaps, and time mismatch while keeping evidence visibility distinct from measured condition and from emergency preparedness.
3. **Explore the islands.** Let guided annotations recede into the existing full-region explorer without assigning one global verdict.

Add `TASK-068` as an artifact-first regional EDA gate. It must produce separate condition and visibility heatmaps, complete distributions, all-place cross-currents, relationship/dependency diagnostics, ordering sensitivity, and centroid-map research plates without modifying the app. Move final scientific/owner selection to `TASK-069` and the post-approval roadmap to `TASK-071`; retain completed `TASK-070` under its historical cleanup identity.

Reject three shortcuts: choosing Papua New Guinea, Samoa, or another island as the product protagonist; treating reporting coverage as preparedness; and publishing cluster labels merely because a heatmap ordering looks coherent. Named places may be illustrative only after the complete distribution is visible, and unstable ordering must be recorded as a negative result.

Reason: the existing interface already supplies strong regional exploration and visual drama. The missing piece is a plain-language claim chain that survives complete-region evidence. A two-act movement/visibility structure connects lived conditions to the limits of the official record, while the extra EDA gate prevents that artistic structure from outrunning the data.

## 2026-07-15: Accept The Regional Movement And Visibility Story

Accept the TASK-069 story after complete-region review:

1. Keep all 22 Pacific geographies visible.
2. Show 19 complete water/renewable first-to-latest comparisons across all four direction combinations: 7 water up / renewable share down, 6 both up, 3 both down, and 3 water down / renewable share up.
3. Keep Guam, Pitcairn, and Tokelau visible as incomplete comparisons.
4. Re-encode the same marks through the separately constructed 14-position visibility record: 277 present and 31 absent cells, with 6–14 represented datasets per geography.
5. Return the reader to the existing island-by-island explorer without a global verdict.

Reject a uniform Pacific trajectory, a single-island protagonist, preparedness-from-coverage, stable cluster labels, and an index-led opening. First-to-latest endpoints are descriptive and non-causal. Dataset presence is not record quality, preparedness, local knowledge, vulnerability, need, or an outcome.

Reason: the 19 complete comparisons occupy every quadrant, so the evidence supports regional divergence rather than one direction. The separate visibility matrix makes the limits of comparison concrete without turning missingness into a condition or score.

## 2026-07-15: Preserve The Application And Replace Only The Guided Layer

Treat the current MapLibre map, 22 evidence marks, fullscreen stage, native scroll, one scene observer, controls, selected-place panel, methods/sources, URL/history, touch/keyboard/reduced-motion behavior, and Explore handoff as a hard implementation constraint.

Replace only the public title, guided premise/order/copy, guided default state, story data fields, regional evidence layouts, and transitions. Delete old guided-only comparison/rank components only after the replacement is integrated and references are proven absent.

Reason: owner review accepts the design and functionality. The weakness is the story. Reusing the application preserves the strongest work and makes the artistic idea legible through continuity: the same marks move from map to comparison to record and back.

## 2026-07-15: Retire The Adaptation Gap Title From The Guided Story

Use **Pacific Climate Evidence Atlas** as the approved public title and **How conditions and official records differ across 22 Pacific places** as the direct subtitle. Keep the Adaptation Gap Index only as an optional caveated Explore layer. The guided handoff returns to a neutral map state rather than silently restoring the index as a verdict.

“The Shape of What We Know” remains historical design language and may inform the visibility act internally, but it is not the public hook. The old Nauru/Tuvalu comparison and rank-band ending are superseded.

Reason: the selected Acts I–II do not validate or center the current index. Keeping an Adaptation Gap product title or index-first default would promise a different story than the evidence supports.

## 2026-07-15: Use One Small Retrofit Batch

Plan `TASK-072` through `TASK-077` in the existing task ledger. Transition keyframes and app-data export may run concurrently only in isolated worktrees; their shared status/log updates and task commits are serialized by the Orchestrator. Scene implementation, regional evidence layout, integration, deletion, and QA run sequentially because they share scene state, evidence marks, `App.tsx`, and stage CSS.

Add no per-task Markdown files, new renderer, chart library, animation dependency, router, state manager, map source, boundary layer, composite score, clustering surface, or speculative abstraction.

Reason: Ponytail review and the implementation audit found a clear existing seam: generated geography records -> `atlasData.ts` -> `SCENES`/`App.tsx` -> `MapOverlay`/story figure -> the current handoff. Extending that seam is smaller and safer than a parallel visualization system.

## 2026-07-17: Make Explorer Drill-Down Reversible Without New Navigation Machinery

Reuse the existing `viewMode`, `selectedCode`, sheet state, and dependency-free URL adapter behind one shared panel-navigation row. A diagnostic child shows contextual Back plus Close; ordinary place detail shows Close only. Back clears the selection and restores the diagnostic parent. Evidence-view entry and ordinary place selection push history. Diagnostic child selection, Back, and Close replace the current entry so an earlier diagnostic root does not immediately reopen after dismissal.

Do not add a router, reducer, navigation stack, breadcrumb system, or duplicated local close handlers.

Reason: the current state already retains the parent diagnostic view while a selected place is open. The failure is missing interaction affordance and dismissal semantics, not missing architecture.

## 2026-07-17: Continue The Regional Story Inside Place Detail

Begin each selected-place panel with the existing water-change, renewable-share-change, year-window, null, and 14-position visibility fields. Keep the optional index score and trace evidence below that summary. Place the different-clocks, descriptive/non-causal, and presence-is-not-preparedness caveat beside the values.

Do not change the pipeline, calculate a new score, or promote coverage to a condition or readiness measure.

Reason: the guided acts now teach regional movement and unequal official visibility, but the current panel abandons those concepts at the exact moment the reader begins local exploration. Reusing reviewed generated fields makes the handoff coherent and defensible.

## 2026-07-17: Use Responsive Sibling Controls Instead Of Hidden Mobile Overflow

Keep the existing desktop dock. On mobile portrait, show complete score and evidence-view sibling rows; on mobile landscape, use one compact row with shorter visible labels and full accessible names. Make the handoff CTA content-width and remove temporary review copy.

Reason: primary actions should advertise themselves. Unmarked horizontal overflow makes the evidence views functionally invisible, while a stretched handoff button gives a secondary transition disproportionate visual weight.

## 2026-07-19: Keep Release Repairs At The Existing Trust And Budget Boundaries

Validate every configured initial script source before transport: SDMX requests may use only HTTPS on the two exact Pacific Data Hub hosts without credentials or nonstandard ports, and land acquisition may use only the fixed HTTPS Natural Earth URL. Keep the PowerShell transport fallback behind the same SDMX guard. The standard-library transports may follow redirects, so this decision describes the configured initial-source boundary rather than claiming redirect-target pinning.

Keep the opening MapLibre map synchronous. Measured manual and dynamic splitting retain the same roughly 803 kB MapLibre module and do not resolve Vite's generic 500 kB advisory. Set Vite's warning threshold to 1,050 kB so it matches the existing enforced 1,050,000-byte per-JavaScript-asset budget; the Python checker, not the advisory, remains the regression gate.

Reason: these are local tracked acquisition scripts and a map-first static app. Explicit host/source guards and the existing asset budget close the verified release findings without a new HTTP layer, loading state, router, runtime dependency, or misleading claim that the bundle became smaller.

## 2026-07-20: Refine First, Then Explore Maritime Identity

Split the next work into two batches.

The immediate `TASK-086` through `TASK-089` batch preserves the current application identity. It may protect the premise copy, improve the measured composition of the two act figures, and surface selected reviewed place context and caveats. The figure task may use a wide claim rail only when before/after measurements show that primary evidence stays the same size or grows. Native vertical page flow is not a defect, and the 22-by-14 record must not be compressed merely to fit one viewport.

After that batch passes independent and owner review, `TASK-090` may explore three maritime directions as concepts only. No maritime production implementation is pre-approved. In particular, reject the proposed live-water/dead-water reporting metaphor and sonar-contact language because they can make record availability look like a physical ocean condition. Reject unproven bathymetry or boundary meaning and unsupported Pacific cultural motifs. Any eventual implementation tasks are created only after the owner selects a concept and its semantic-risk review passes.

Reason: the Fable plan found real premise, composition, and place-context opportunities, but mixed them with a speculative reskin and a scientifically ambiguous water-state encoding. Separating refinement from concept exploration preserves the already accepted interface, produces a clean before/after gate, and lets the stronger maritime idea receive proper artistic attention instead of entering production through incidental CSS.

## 2026-07-23: Select Night Watch With UI-Only Illumination

Select the TASK-090 **Night Watch** direction for future implementation planning. The owner found it substantially more beautiful and visually compelling than The Working Chart and Chart & Ledger. Preserve that low-light atmosphere rather than retreating to the safer but drier chart treatment.

Bind the selection to a strict semantic rule: illumination belongs only to static viewport edges, active chrome, reading regions, and accessible focus. Geography marks, movement points, visibility cells, and missingness symbols remain flat and non-glowing. The map stays tonally uniform; light, darkness, gradient, motion, or texture cannot encode depth, water condition, record presence, coverage, importance, risk, weather, or current. The pale literal visibility field and its filled/crossed non-color grammar remain the default.

The Working Chart and Chart & Ledger remain recorded alternatives, not implementation directions. Do not import chart furniture or the paper-ledger metaphor by default. Generated concept text and values are schematic. Any implementation batch must preserve the current story/data/interaction architecture, use existing CSS and component seams first, and pass semantic, contrast, grayscale, reduced-motion, portrait, landscape, reflow, and owner gates before release.

Reason: visual distinction is part of the project's value, and Night Watch best supplies it. Constraining where light may appear preserves that attraction without turning official-record visibility into an environmental or physical-ocean claim.

## 2026-07-23: Authorize A Five-Task Night Watch Retrofit

The owner approved the written TASK-090 contract and authorized `TASK-091` through `TASK-095`: shared budget-neutral surfaces, guided-story treatment, Explorer treatment, measured responsive/accessibility refinement, and frozen independent regression with an owner gate.

Keep implementation sequential because all four production tasks converge on `app/src/styles/base.css`, which already builds to 94,996 of the 95,000-byte cap. Parallelize only read-only audits, non-overlapping test design, or independent review. Retune and delete existing rules before adding new ones. Remove the pre-existing data-dependent map glow during Explorer treatment; selection remains a crisp outline, while geography, movement, and visibility marks remain flat.

Reason: this is the smallest implementation shape that can realize the selected atmosphere without creating a second theme system, conflicting stylesheet branches, or a visual metaphor that changes the evidence.

## 2026-07-25: Use One Inline Observed-Record Lens In Place Detail

Extend the existing selected-place panel with three compact observed dot/rug strips for water change, renewable-share change, and 14-position dataset presence. Keep the selected place explicit, show a descriptive regional median, keep unavailable records outside the numeric scale, and preserve independent units and clocks. Replace the current duplicate regional summary rather than stacking another section above it.

Keep the map as the selector and the panel as one reading path. Similar evidence-profile records remain a collapsed secondary section. Do not add Place/Compare tabs, a second drawer, a dashboard grid, interactive peer-point clouds, a histogram or density curve, a posterior distribution, or a global comparison mode.

Use the already loaded `Geo[]` and `Geo.regionalStory` fields through one pure model and one plain React/SVG component. No new data export, API, renderer, router, state manager, or visualization dependency is authorized. Prefer deletion and selector reuse to remain under the 95,000-byte CSS target; a measured 97,500-byte absolute ceiling may be proposed only if the clean accessible treatment cannot fit, while the 1,050,000-byte JavaScript cap remains fixed.

Reason: the lens answers the primary reader question—where the selected place sits in the observed Pacific record—without copying an unsupported posterior treatment or turning the accepted atlas into a dashboard. It connects the regional story to place exploration with the smallest truthful visual form.

## 2026-07-29: Repair Four Manual-QA Defects Before Frozen Final QA

Register `TASK-101` through `TASK-104` in the existing ledger and run them before `TASK-100`: verify and correct the political-status source record before removing internal editorial markers; keep the application usable and truthful when MapLibre cannot initialize or loses WebGL; repair the controls dock during a live crossing of the 880px breakpoint; and share one signed-number formatter while deleting only proven-dead plumbing. Protect the accepted Night Watch palette, contrast, evidence marks, figure dimensions, movement/visibility counts, selected-place lens, URL/history behavior, and native story flow.

TASK-101 may not treat a generic provenance sentence as a substitute for reviewing politically sensitive labels. The current geography-context provenance explicitly flags unresolved publication wording, so source verification and any required data rebuild precede clean public copy. TASK-102 must use an explicit startup lifecycle seam rather than a stale React-state closure, and its teardown must be safe when StrictMode or a failure path invokes cleanup more than once. TASK-103 must be verified by resizing one live page across the breakpoint; fresh fixed-width loads do not cover the defect. TASK-104 follows TASK-102 because both touch `AtlasMap.tsx`. Keep the implementation sequence `TASK-101 -> TASK-102 -> TASK-103 -> TASK-104`; use parallelism only for read-only audits or independent review.

Treat 95,000 built CSS bytes as an internal regression target, not a Pacific DataViz Challenge requirement or a product feature. It was chosen during TASK-057 as 1.18% slack above the accepted 93,895-byte TASK-056 baseline after an earlier 92,000-byte target had already been exceeded. The 2026 Challenge rules impose no interactive CSS/JavaScript bundle limit; the interactive entry must be public by URL and remain accessible through 31 August 2029. Continue measuring raw and gzip output, reuse/delete code when that improves the product, and keep the checker as a visible regression signal. If a clean correctness or accessibility fix crosses 95,000 bytes, update the checker and all active context explicitly with the measured delta instead of weakening the fix, obscuring CSS, or claiming a contest violation. The current 97,500-byte review range remains a useful provisional alert threshold, not an external rule.

No per-task Markdown, new renderer, dependency, router, state system, dashboard shell, or parallel theme is authorized.

Reason: hands-on QA found four real paths that fixed-viewport, working-WebGL automation cannot cover. Correct source claims, graceful failure, and usable controls matter more than preserving an arbitrary raw-byte number; explicit measurement still prevents accidental bloat.

## 2026-08-02: Make The Selected-Place Lens Readable Before Adding More Analysis

Keep the inline selected-place lens and its single question: where does this island sit within the observed Pacific record? Preserve the map as the only selector and make peer inspection informational only. Hover, tap, or keyboard inspection may reveal exact peer evidence, but it cannot change the chosen island, map camera, panel path, URL, or history.

Use two visual arrangements that match the data. Water and renewable-energy change remain independent continuous dot strips with a prominent selected readout, their own clocks and domains, a truthful zero reference, and a directly labeled regional median. Dataset visibility becomes a grouped tally across its six observed totals because 12 places share `14 of 14`; omit its median because the median equals the maximum and adds a live label collision rather than useful context.

Use one reserved in-flow inspector line per metric instead of a floating tooltip. It shows recorded/unavailable counts by default, exact island/value/clock detail for the two continuous measures, and exact group membership for visibility. Use one focusable plot surface and one full-width touch band per metric, with Left/Right inspection and Escape dismissal, rather than dozens of Tab stops or tiny hit targets. Keep exact values visible without interaction and avoid rank, percentile, best/worst, quality, or preparedness language.

Implement through the existing `regionalPositionModel.ts`, `RegionalPositionLens.tsx`, tests, and regional-lens CSS only. No new data output, dependency, renderer, route, state system, dashboard shell, tab set, drawer, or visual identity is authorized. Preserve Night Watch and treat the 95,000-byte CSS value as a diagnostic target rather than a Challenge rule; update it transparently if the clean accessible implementation justifies a measured increase.

Reason: the first lens implementation proved the analytical idea but gave every element nearly equal typographic weight and rendered a six-level bounded count as though it were the same continuous distribution as the other two measures. The revised hierarchy and grouped tally reduce decoding burden while preserving the accepted story, evidence meaning, and application architecture.
