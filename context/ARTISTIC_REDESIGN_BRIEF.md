# Artistic Redesign Brief

## Status

The 2026-07-11 fullscreen story-stage remains the approved visual and interaction baseline. `TASK-068` completed the regional evidence test, `TASK-069` accepted the movement -> evidence visibility -> exploration story, and `TASK-072` through `TASK-077` implemented and verified the four-scene guided layer plus handoff. The application and its visual identity are preserved.

Owner review of the functioning `TASK-057` app found that the opening did not explain the project strongly enough and that scenes 4 and 5 rendered primary evidence too small. `TASK-058` through `TASK-064` resolved the fullscreen scale and interaction system, `TASK-072` through `TASK-077` replaced the narrative, and `TASK-079` through `TASK-082` completed the later Explorer audit. `TASK-057` repaired its separate pre-existing release findings and passed independent review.

Approved public title:

> Pacific Climate Evidence Atlas

Direct subtitle:

> How conditions and official records differ across 22 Pacific places.

Public-facing thesis:

> Official records show different changes across Pacific places, and they do not show every place equally.

## 2026-07-15 Approved Retrofit Boundary

Preserve:

- the fullscreen map/figure ownership model;
- equal-presence evidence marks and non-color missingness cues;
- viewport-scale comparison and rank figures;
- native document scroll, one canonical scene observer, reduced motion, and accessible controls;
- generated-data-only evidence and panel-only JSD.

Replace in the guided experience:

- the Adaptation Gap public title and index-first opening/default;
- the premise and five-scene order;
- Nauru/Tuvalu as the guided comparison pair;
- the pressure/capacity split and rank-band ending;
- slogan-like narrative language that asks style to carry the claim.

The retrofit may add only the minimum traceable story fields, scene states, evidence layouts, copy, and CSS required by the approved sequence. It may delete old guided-only components after they are unreferenced. It must not replace MapLibre, the explorer, panel, controls, URL contract, observer model, or accessibility behavior.

## 2026-07-15 Regional Two-Act Composition

Preserve the existing fullscreen stage and island explorer, but test a new reading path:

- **Act I: different directions.** The full regional field appears first. Nineteen complete water/renewable endpoint comparisons occupy all four direction combinations; Guam, Pitcairn, and Tokelau remain visible as incomplete. Illustrative labels emerge only after the full field is legible.
- **Act II: unequal visibility.** The same marks reorganize around the separately constructed 14-position visibility record. Missingness and different clocks limit comparison; they do not define outcomes, readiness, evidence quality, or local knowledge.
- **Coda: agency.** Story annotations recede into an achromatic `overview` map with all 22 marks, no selection, and no outlook. The current interaction system returns intact; no score layer is presented as active until the reader chooses one.

The artistic idea is continuity, not ornament: geography becomes comparison, comparison becomes a record, and the record returns to geography. The same 22 marks carry that change. Motion verbs are locate, rearrange, expose, and return. Every frame must still make sense without motion.

## 2026-07-20 Staged Refinement And Maritime Concept Gate

The owner approved a small refinement batch before any broader maritime restyling:

1. `TASK-086` protects premise copy from map-label and mark collisions using the existing scene hooks, ocean palette, typography, header, and evidence-mark system.
2. `TASK-087` measures the two act figures before changing them. A claim rail is permitted only where it preserves or increases evidence size. Native page flow remains correct; fitting the complete 22-by-14 record into `100svh` is not a goal.
3. `TASK-088` surfaces only reviewed place context and exact generated caveats that reduce ambiguity. It does not turn the place panel into a dataset inventory.
4. `TASK-089` repeats the affected slices of the accepted story and Explorer QA matrices and requires owner acceptance.

`TASK-086` and `TASK-088` may run concurrently after `TASK-082` owner acceptance because their production files do not overlap. `TASK-087` follows `TASK-086` because both own stage CSS. `TASK-089` follows all three implementations. Each task keeps its own test, review, and no-co-author commit boundary.

The owner also wants to explore a stronger maritime art direction later. `TASK-090` is therefore a separate concept gate after `TASK-089`, not an implementation task. It compares three controlled directions against identical app content and records their semantic, accessibility, and responsive risks. No production task may call a maritime treatment approved until the owner selects a concept.

The current visual identity remains authoritative throughout the refinement batch. The later concept study may question or evolve that identity, but it may not encode reporting gaps as calm, dead, live, deep, rough, or otherwise physical water; use sonar-contact or military language; imply measured bathymetry or boundaries through decorative linework; or borrow Pacific cultural navigation, weaving, tattoo, canoe, or Indigenous motifs without co-design and provenance.

## 2026-07-23 TASK-090 Night Watch Direction (Owner Selected)

TASK-090 compared three maritime directions against the same accepted premise, visibility, Explorer, portrait, and landscape states:

1. **The Working Chart** keeps the application closest to its current form and adds restrained viewport neatlines, ruler ticks, registration marks, and marginal evidence notes. It is scientifically safe but comparatively dry and institutional.
2. **Night Watch** creates a continuous low-light working surface with deep ocean blue, graphite chrome, restrained teal edge light, mineral evidence fields, and limited amber emphasis. The owner selected this direction because it has the strongest beauty, atmosphere, and human pull.
3. **Chart & Ledger** gives the map-to-record transition a literal evidence-sheet metaphor. It clarifies the transfer of the same marks but changes the accepted application more heavily and risks turning the record into a paper prop.

Review artifacts:

- `artifacts/design/task-090/direction-01-working-chart.png`
- `artifacts/design/task-090/direction-02-night-watch.png`
- `artifacts/design/task-090/direction-03-chart-and-ledger.png`
- `artifacts/design/task-090/comparison-board.svg`
- `artifacts/design/task-090/responsive-visibility-flow.png`

The raster boards are art-direction studies. Their generated small text, values, row order, land shapes, source notes, and incidental layout details are schematic and are not evidence or implementation requirements. The amber cross-frame line and glowing annotation nodes on the Night Watch board are concept-board callout rails only and may not ship. The responsive board is a responsive-continuation/layout proof: it demonstrates one ordinary page continuing through the complete record in both orientations, while its generated row labels, visible row slices, and tiny cells remain schematic. Production must render the exact code-bound 22 rows by 14 positions—308 cells, 277 present and 31 absent—without omission. Production values, labels, geography, sources, caveats, controls, and accessibility text remain editable and data-bound.

### Selected Visual Thesis

Night Watch should make the atlas feel like a calm scientific instrument used after dark, not like a simulation of the ocean. Its appeal comes from tonal continuity, controlled light, crisp typography, quiet depth between surfaces, and an interface that feels purpose-built for the Pacific evidence story. It must not use the ocean itself as a metaphor for whether a record exists.

**Night Watch is an internal art-direction name, not proposed public copy.** Public labels should avoid *watch*, *scan*, *contact*, *signal*, *sounding*, and *beacon* where those words could introduce surveillance, monitoring, military, or sonar meaning.

The analytical job remains unchanged: a map-anchored explanatory story moves from 22 Pacific places to a two-measure regional comparison, then to a literal 22-by-14 official-record visibility field, and finally to the existing place-by-place Explorer. Night Watch changes how that sequence feels, not what it claims.

### Binding Evidence-Safety Contract

| Element | Role | Locked meaning |
| --- | --- | --- |
| Geography and movement marks | data | Flat, crisp, equal-presence identities. No bloom, aura, pulse, or mark-size importance. |
| Visibility circles and crossed squares | data | Literal present/absent official-record cells in the existing 14-position order. They never glow and remain non-color legible. |
| Ocean/map field | orientation | Tonally uniform geographic context. No light, gradient, contour, texture, or motion may imply depth, water state, coverage, importance, risk, weather, or current. |
| Teal illumination | decorative or interaction state | Static edge light on the viewport frame, active chrome, or keyboard/pointer focus only. It cannot vary with a geography's value, coverage, presence, absence, rank, or selection importance. |
| Amber accent | caveat or restrained focus | Retains its existing warning/editorial role. It is not a route, current, connection, or value scale. |
| Mineral evidence surface | reading surface | Keeps the movement and visibility evidence literal, high-contrast, sourceable, and printable. It is not paper, a physical ledger, or a completeness score. |
| Natural Earth land | orientation | Remains visual context grouped by nearest centroid, not official boundary geometry. |

Consequently, reject glowing island markers, glowing missing cells, light rays or lines between places, live/dead or calm/rough water, wave or ripple animation, bathymetric or sounding marks, sonar/radar language, vessel routes, military styling, compass roses, rope, brass, parchment, colonial expedition aesthetics, and unsupported Indigenous or Pacific cultural motifs.

### Color, Type, And Surface Roles

- Preserve the current near-black ocean blue as the primary field, off-white serif claims, system-sans interface text, teal evidence accent, amber caveat accent, and the existing circular evidence-mark silhouette.
- Night Watch may deepen secondary chrome from pale mineral to graphite where contrast, focus, and control recognition remain at least as clear as the accepted app. It may not turn every panel into translucent glass or replace the visibility field with dark-on-dark cells.
- The visibility scene keeps a pale mineral field by default. Movement may remain pale as well unless a later exact-data concept proves that a dark field preserves axes, dense labels, zero lines, incomplete cases, caveats, and grayscale reading better.
- Light is sparse and local. One active frame edge is preferable to many glowing controls, shadows, or selected marks.
- Generated texture is not required. CSS color, border, shadow, and existing SVG/HTML layers should be tested before any raster substrate or new asset is considered.

### Story And Motion

The approved story sequence and motion verbs remain **locate, rearrange, expose, return**. Night Watch may add one restrained UI-light handoff to show which surface owns the current scene, but the light does not travel across the map or follow data. There is no ambient loop.

- Premise: the map stays visible and uniform behind the direct claim; no Explorer score controls enter the premise.
- Movement: the existing 22 identities rearrange onto the separate water and renewable-share axes. Illumination may frame the active evidence surface, never the quadrants or points.
- Visibility: the literal 22-by-14 field remains the brightest reading surface; present and absent cells keep their existing shape semantics.
- Explorer: the deep map and compact controls return without changing URL, selection, history, panel, methods, or layer behavior.
- Reduced motion: swap complete still states without cross-scene interpolation, shimmer, pulse, or moving light. Every accepted screenshot remains understandable as a static frame.

### Responsive And Accessibility Contract

- Large screen keeps the current full-stage hierarchy and evidence scale. Night Watch cannot shrink movement or visibility into dashboard cards.
- Portrait keeps one claim and one complete evidence state in natural page flow. Secondary decorative edge light collapses before evidence, source, caveat, or controls do.
- Landscape keeps the claim beside the evidence when that protects plot/matrix size and keeps header, legend, controls, and map from overlapping.
- Essential values, presence/absence, sources, and caveats remain visible without hover. Touch and keyboard focus use crisp border/outline changes in addition to color or light.
- Normal text targets at least 4.5:1 contrast; large text, UI boundaries, and meaningful non-text elements target at least 3:1. Fuzzy glow cannot supply the only focus boundary.
- Grayscale must retain surface hierarchy, filled versus crossed cells, selected/focused state, and readable controls. Color-deficiency checks remain required even though no data meaning is added to the light.
- The low-light treatment must pass normal contrast checks and an effective 200% reflow review; decorative shadow or bloom cannot reduce character-edge contrast.
- Spotty-connection, data-error, and static-export states keep their current readable surfaces. Night Watch adds no remote imagery, map source, runtime effect, or asset dependency.

### Current Identity Boundary

Night Watch is an evolution of the accepted application, not authority to rebuild it. Keep the current map, 22 evidence marks, regional figures, native scroll, one active-scene observer, controls, selected-place panel, Methods and Sources, URL/history behavior, Explore handoff, generated-data contract, and public story. Implementation planning should first test a token-and-surface pass in the existing CSS/component seams. A new renderer, animation library, state system, map source, data field, score, bitmap substrate, or app branch requires separate evidence and approval.

TASK-090 itself authorized no production change. Independent semantic/accessibility review passed, and on 2026-07-23 the owner approved this written contract and the bounded implementation batch below.

## 2026-07-23 Approved Night Watch Implementation Batch

The retrofit is deliberately a surface evolution of the current application:

1. `TASK-091` retunes and consolidates the existing CSS token/surface foundation. It must create bundle headroom from the 94,996-byte baseline rather than add a parallel theme system.
2. `TASK-092` applies the foundation to premise, presence, movement, visibility, progress, and handoff while freezing public story, data, scene, observer, URL, and figure contracts.
3. `TASK-093` carries the treatment through Explorer and removes any pre-existing data-dependent glow so selection remains a crisp, non-luminous outline.
4. `TASK-094` measures and corrects only reproduced responsive, contrast, focus, grayscale, color-deficiency, reduced-motion, reflow, and overflow failures.
5. `TASK-095` freezes production for independent regression and owner review. Defects return to their owning implementation task.

All five tasks use existing components, MapLibre, native scroll, CSS, tests, and generated data. No task may add a renderer, theme provider, animation library, state system, route, map source, bitmap substrate, data field, runtime dependency, or public art-direction language. `TASK-091` through `TASK-094` share `base.css`, so Builders work sequentially; read-only audits and independent Checker passes may run in parallel. Each task retains its own QA and no-co-author commit boundary. The complete contracts live in `context/TASKS.md`; no per-task Markdown files are needed.

## 2026-07-25 Inline Regional Lens For Selected Places

The selected-place panel should continue the story rather than stop at a small pair of facts. The owner chose the cleanest of three directions: one inline regional lens inside the existing panel. The map remains the dominant surface, the panel remains a single reading path, and the current Night Watch color, type, surface, and interaction language stay intact.

The artistic idea is restraint through context. When a reader selects a place, three narrow observed-record strips quietly reveal its position among Pacific records:

- safely managed drinking-water first-to-latest change;
- renewable-energy-share first-to-latest change;
- reviewed datasets represented out of 14.

Other places form a flat neutral field. The selected place is one crisp teal ring. A thin median tick gives regional context without becoming a target. Exact selected values remain printed, while unavailable records sit outside the scale as named counts. The image should feel like one place coming into focus within the same regional constellation, not a new analytics product opening over the map.

This direction rejects tabs, a wide comparison drawer, card grids, radar or sonar language, glowing data marks, gradients that encode evidence, and a copied posterior/distribution treatment. It also rejects a second visual identity: the accepted graphite/mineral surfaces, direct typography, flat marks, amber caveats, and crisp focus treatment remain binding. Similar evidence-profile records stay secondary and collapsed; they answer a different question and do not become the visual center.

On mobile the composition does not collapse into a horizontal scroller or miniature dashboard. The existing bottom sheet keeps one vertical reading order, the strips fit its measured width, all primary actions remain at least 44px, and the selected value and caveat remain readable without hover. The approved detailed grammar and implementation limits live in `context/DESIGN_BRIEF.md`; TASK-096 through TASK-100 are the only authorized planning path.

## TASK-072 Transition Keyframes (Owner Approved)

Three exact-data composite boards now translate the approved story into the accepted TASK-064 application shell:

- `artifacts/design/task-072/large-screen-keyframes.png` — 5260×922; four 1280×800 semantic viewport frames.
- `artifacts/design/task-072/mobile-portrait-keyframes.png` — 2220×1247; four sibling 520×1125 portrait frames based on the 390×844 target.
- `artifacts/design/task-072/mobile-landscape-keyframes.png` — 4188×590; four sibling 1012×468 landscape frames based on the 844×390 target.

Approval status: **owner approved on 2026-07-15** for layout, story flow, responsive composition, and mark continuity. The approval unlocks TASK-074 implementation.

The current implemented application—not the raster boards—is the visual-identity authority. Preserve its existing palette, typography, map treatment, evidence-mark styling, controls, panels, spacing character, and interaction language. The boards may change layout, copy, figure ownership, and transitions, but their mineral-paper surfaces, generated styling discrepancies, and incidental colors are not implementation targets.

The boards lock one composition: a quiet dark map locates 22 equal-presence marks, a mineral-paper cross-current field rearranges the same stable codes, a mineral-paper 22×14 field exposes record visibility, and the current dark explorer receives the marks again in neutral `overview`. Large screen gives each state the full figure area. Portrait gives one claim and one full evidence state per screen-height step; the 22×14 field grows vertically without a nested scroller. Landscape uses a claim column beside the wide field rather than cropping the portrait or shrinking the desktop frame.

The rendered evidence is bound directly to `eda_regional_crosscurrents.csv`, the `evidence_visibility` lane of `eda_regional_feature_matrix.csv`, and `app/public/data/geographies.json`. The PNG metadata records the source hashes, evidence lock, and `source_snapshot_commit: f0c6e2e`. The full `geographies.json` hash is an immutable generation-time snapshot; TASK-073 additively regenerates that file, so the recorded hash is not expected to match post-integration bytes. The boards reproduce 22 identities, 19 complete comparisons plus Guam/Pitcairn/Tokelau as incomplete, quadrant counts 7/6/3/3, 14 stable visibility positions, and 277 present/31 absent cells. Missing cells use an outlined square with a diagonal cross, so the distinction survives grayscale. Exact axes, units, coverage facts, caveats, and source notes remain visible without hover.

The neutral sunburst/anchor glyph persists at each centroid, each cross-current point, and each visibility row header. Cross-current codes use collision-resolved offsets and leader lines around the dense near-zero field. Map and overview frames contain no score fill, rank numeral, active-score legend, or duplicate raster constellation; the handoff is visibly neutral before any Explore layer is chosen.

The TASK-064 screenshots supplied the chrome, palette, safe-area proportions, and unchanged Explore context. A single image-generation pass explored mark continuity and viewport ownership only; it was not tracked and no generated label, value, boundary, island shape, source, or pixel appears in the three review boards. The tracked compositions were rendered programmatically from repository data and screenshots.

Locked after owner approval:

- reading order and ownership: map -> cross-current -> visibility -> neutral overview/map;
- the same geography codes and equal-presence marks across all four states;
- the same sunburst/anchor glyph at the map centroid, cross-current point, and visibility row header;
- dark map / mineral figure / mineral figure / dark map rhythm;
- direct claim above or beside the evidence, with the figure never reduced to a card;
- an explicit incomplete rail in the cross-current state;
- all 14 visibility positions, non-color missingness, and five direct coverage facts;
- source and caveat in a persistent lower band;
- complete static frames; reduced motion snaps directly to each frame without losing evidence;
- portrait and landscape as sibling layouts, with no nested figure scroll.

Flexible during implementation: exact pixel spacing, final font token sizes, collision-aware code-label offsets, SVG geometry, and breakpoint mechanics, provided they preserve the locked hierarchy and every evidence invariant.

## 2026-07-11 Fullscreen Stage Revision (Preserved Layout History)

The approved composition is **One Constellation on an Elastic Stage**, with restrained tidal arrival/recession for editorial evidence chambers.

- Keep one full-screen premise prologue before the evidence sequence.
- Let the map own the full viewport whenever geography is the active question.
- Let a regional comparison field own the viewport when position and direction are the active question.
- Let the evidence-visibility field own the viewport when the official record is the active question.
- Return the same 22 evidence marks to geography for Explore.
- Keep native document scroll and one observer-owned active state; do not add scrolljacking or nested overflow.

The three reviewed boards remain under `artifacts/design/task-058/`: Elastic Stage supplies the layout system, One Constellation supplies evidence-mark continuity, and Tidal Chapters supplies only the quiet arrival/recession rhythm. Generated labels, values, photographs, land shapes, and boundaries are visual references only and never implementation data.

The evidence grammar, fixed-presence marks, five evidence operations, panel-only JSD, generated-data contract, and ethical guardrails below remain authoritative. Where the older contract says the map must remain beside a 28rem story column or remain 46svh on mobile for every scene, this fullscreen-stage contract supersedes it.

## Why The Atlas Needs Another Pass

The historical pre-redesign app was scientifically careful, visually competent, and technically healthy. Its limitation was editorial: it read as a polished sequence of GIS features rather than one inevitable argument. Seven beats repeatedly explained the interface, while the strongest original idea—uneven official visibility—did not fully govern the marks, scene order, layout, and motion.

The retrofit should make one argument through every layer of the experience:

> Pacific places do not move along one shared line, and the official record does not show every place equally.

The map and the 22 places remain the entry point. The Adaptation Gap Index moves to optional Explore evidence. The retrofit is a story and encoding change, not a cosmetic reskin or application rebuild.

## Evidence And Ethics Lock

The redesign must preserve these facts and limits:

- The dataset contains 22 Pacific geographies.
- The water/renewable comparison has 19 complete geographies and three incomplete geographies: Guam, Pitcairn, and Tokelau.
- The 19 complete first-to-latest comparisons split 7 water up / renewable share down, 6 both up, 3 both down, and 3 water down / renewable share up.
- The evidence-visibility matrix contains 14 ordered positions for each geography, with 277 present cells and 31 absent cells; geography totals range from 6 to 14.
- First-to-latest endpoints are not continuous trajectories. Water and renewable-share changes keep separate percentage-point axes, denominators, years, and caveats.
- Dataset presence is not evidence quality, preparedness, infrastructure, local knowledge, vulnerability, need, or an observed outcome.
- The Adaptation Gap Index is a comparative screen, not a ranking of need, vulnerability, readiness, or funding priority.
- The score is built from eight possible score-input datasets: four climate-signal datasets, one observed-stress dataset, and three visible-capacity datasets.
- Greenhouse-gas emissions per capita is responsibility context only. It must never be counted or drawn as a score input.
- A latest monitoring row reporting `0` is not the same as no processed monitoring row.
- A missing monitoring row is a reporting gap, not proof that infrastructure is absent.
- Natural Earth land is visual context, not official scored geography or territorial geometry.
- Rank bands are sensitivity diagnostics, not probability intervals.
- JSD compares normalized official-data profiles. It does not imply physical connection, causality, shared vulnerability, lived experience, or shared policy need.
- Outlook outputs remain optional method/stress-test context, not forecasts.
- The TASK-068 seriation is unstable and cannot support public clusters, regional types, or policy groupings.
- Deeper Pacific cultural visual language requires Pacific co-design. Do not appropriate Indigenous navigation, weaving, tattoo, or other cultural motifs as decorative interface language.

## What Stays, What Changes

### Preserve

- A full-basin Pacific map visible from the first viewport.
- Guided reading followed by one clear, content-width `Explore the map` handoff.
- Direct access to sources, methods, trace rows, and caveats.
- Reported-zero and missing-row monitoring as distinct visual and verbal states.
- Water change, renewable-share change, dataset presence, monitoring visibility, and traceable missingness as the guided evidence families.
- A selected-place panel organized around score, the two sides of the score, and what the record shows.
- Guaranteed-size geography marks so atolls do not disappear at basin scale.
- Reduced-motion support, keyboard navigation, touch targets, and non-color missingness cues.

### Reframe

- The redesign replaces the historical index-led tour with one premise, a regional orientation, two evidence acts, and a short handoff.
- Replace evidence-size circles with fixed-presence evidence marks. Thin evidence should look interrupted, not physically unimportant.
- Make monitoring and score-input availability part of the primary mark grammar instead of secondary prose.
- Use one motion verb per scene: locate, rearrange, expose, return.
- Use native document scroll with a sticky map instead of a nested story-rail scroller.
- Let the cross-current and visibility views temporarily become composed editorial fields rather than forcing every claim to remain geographic.

### Retire Or Move

- Move JSD out of the guided spine. Keep nearest evidence-profile neighbors in selected-place exploration only.
- Remove dashed map arcs between selected places and JSD neighbors. They are mathematically traceable but visually imply physical or causal connection.
- Remove repeated uncertainty copy and any action prompt that merely restates the preceding paragraph.
- Remove camera movement that does not help locate a named place.
- Remove the current nested scroll synchronization in which observer updates and progress-button updates can compete.
- Remove desktop and mobile chrome that covers evidence without adding a decision.

## Correct Evidence Counting Before Visual Redesign

The current `included_indicator_count` counts every trace dataset, including responsibility-context greenhouse-gas data. The app then describes that number as indicators “behind” or “feeding” the score. This is incorrect.

The next data contract must expose separate concepts:

- `score_input_indicator_count`: number of distinct score-input datasets available for a geography, from 0 to 8.
- `context_indicator_count`: number of distinct context-only datasets available, currently from 0 to 1.
- `trace_indicator_count`: all distinct trace datasets available, equal to the two counts above.
- per-input presence flags, sufficient to render eight stable score-input positions without deriving semantics from display labels.

`TASK-048` now supplies these fields. New evidence marks, legend copy, and panels must consume the explicit score-input count and presence list rather than resurrecting the retired ambiguous field.

## Signature Evidence Mark

Every geography receives the same overall visual footprint at default basin scale. The mark is a compact evidence portrait, not a bubble whose area implies importance.

### Encodings

1. Inner field: active score value.
2. Eight fixed score-input positions around the inner field: one position for each possible score-input dataset.
3. One visibly separate context tick outside the score-input sequence: responsibility-context data, explicitly not part of the score.
4. Outer reporting edge: monitoring state.
5. Quiet selection bloom or label emphasis: interaction state only.

### Missingness Language

- Available score input: illuminated tick.
- Missing score input: open cut or unlit position that preserves the full eight-position structure.
- Reported-positive monitoring: continuous outer edge.
- Reported-zero monitoring: open or dashed outer edge.
- Missing monitoring row: broken or dotted outer edge with a non-color cue.
- Context-only responsibility data: detached outside tick, never integrated into the score-input ring.

Missing evidence should be visible as interruption. It should not make the geography smaller, fainter, or less worthy of attention.

### Geometry And Labels

- Presence marks remain centroid-anchored and guaranteed-size.
- Natural Earth land may appear inside or beneath the mark as subdued texture, but never carries the only data encoding.
- Default labels are limited to scene-relevant places and a small orientation set.
- Mobile labels are fewer and may use one compact collision-aware list or leaders rather than all exemplar names at once.
- Selection is a quiet bloom, not another data ring.

## Approved Storyboard

The story uses one premise, one regional orientation, two evidence acts, and the existing handoff. Every scene has one claim, one visual operation, one necessary caveat, and one source line. Public copy is direct and concrete. The artistic character comes from the same 22 marks changing position and meaning without losing identity.

### Premise: What The Records Show

The existing map fills the first viewport. No opaque rail, legend wall, or method-control cluster competes with the opening.

> Across the Pacific, safely managed drinking-water access and renewable-energy share have changed in different ways.

> Official records let us compare 19 of 22 places on both measures. They also leave gaps that limit the comparison.

Caveat: these are first-to-latest percentage-point endpoints on separate clocks. They do not show a continuous trajectory or explain why the changes occurred.

Evidence: `eda_regional_crosscurrents.csv` and generated geography records.

### Scene 1: Twenty-Two Pacific Places

Claim:

> This story covers 22 Pacific places. Each one stays visible throughout.

Visual state:

- Show all 22 evidence marks in geographic position over the existing Pacific map.
- Use neutral fields rather than the Adaptation Gap ramp.
- Introduce the mark as identity and evidence presence, not as importance or rank.

Motion verb: locate.

Evidence: generated geography records and centroid map context.

Caveat: Natural Earth land is visual context; each selectable record remains centroid-based, not a reviewed boundary polygon.

### Scene 2: Different Directions

Claim:

> The 19 complete comparisons do not form one line of progress or decline.

Visual state:

- Move the same geography marks from map position into a full-viewport cross-current field.
- Keep water change and renewable-share change on separate signed percentage-point axes with visible zero lines.
- Print the four quadrant counts: 7, 6, 3, and 3.
- Keep Guam, Pitcairn, and Tokelau in an explicit incomplete-comparison rail rather than dropping or zeroing them.
- Annotate at most a few evidence-earned places after the complete field is visible. Papua New Guinea and Samoa may illustrate the largest quadrant but may not become protagonists.

Motion verb: rearrange.

Evidence: `eda_regional_crosscurrents.csv`.

Caveat: endpoints and latest years differ. Water access and renewable share have different denominators and neither change is attributed to climate or policy causes.

### Scene 3: Unequal Visibility

Claim:

> The official record is also uneven. Some places have many of the reviewed datasets; others have fewer.

Visual state:

- Reorganize the same 22 marks into a full-viewport evidence field using 14 stable ordered positions per geography.
- Show every present and absent position; do not collapse the row into a visibility score.
- Directly label the concrete coverage facts: direct loss 12/22, monitoring 18/22, power 18/22, water 19/22, renewable share 20/22.
- Preserve non-color missingness and distinguish a missing row from a reported zero where the source supports that distinction.
- Keep the field readable on mobile through normal document flow or an approved compact arrangement; do not add a nested chart scroller.

Motion verb: expose.

Evidence: the `evidence_visibility` lane of `eda_regional_feature_matrix.csv` and source trace rows.

Caveat: dataset presence means a reviewed official record exists. It does not measure record quality, preparedness, infrastructure, local knowledge, vulnerability, or need.

### Handoff: Explore The Places

Closing claim:

> Select a place to inspect the data, sources, and gaps behind it.

Visual state:

- Return the same marks to geographic position.
- Restore the existing exploration controls, selected-place panel, sources/methods, optional Adaptation Gap and outlook layers, and panel-only JSD neighbors.
- Use explicit `view=overview` at handoff and first Explore entry: neutral marks, overview copy, no selection/outlook, and no pressed score control. Choosing gap, pressure, or capacity returns to `view=default`. Do not reset the reader into the Adaptation Gap layer as a verdict.
- Offer one clear `Explore the map` action.

Motion verb: return.

## Layout Contract

The guided experience has three ownership modes:

1. `map-immersive`: premise and regional orientation. The map fills the viewport; scene copy overlays safe ocean space with a restrained contrast veil and no card-heavy rail.
2. `figure-takeover`: different directions and unequal visibility. The active regional field owns approximately 80–90vw and the usable viewport height; the map is absent or reduced to quiet context.
3. `explore`: after the handoff. Story chrome leaves, the map owns the viewport, and the existing exploration controls return.

Shared rules:

- Use native page scroll. Do not create nested story or chart scrolling.
- Each scene is a normal document section with a stable `id` and approximately one viewport of breathing room.
- One `IntersectionObserver` owns the canonical active scene.
- Progress controls call `scrollIntoView` only; they never write a competing active state.
- On portrait mobile, keep one claim per viewport-scale step and let dense evidence rows grow vertically in normal document flow.
- On landscape mobile, let the active regional field fill the screen.
- Use fewer direct map labels and compact exploration controls on mobile.
- Test 1440×900, 1280×800, 1024×768, 430×932, 390×844, 360×800, and landscape mobile for both regional fields.

## Motion And Transition Contract

Motion is explanatory punctuation. It must never become ambient atmosphere.

- Preserve 560ms `cubic-bezier(0.22, 1, 0.36, 1)` for evidence transformations.
- Use 180–240ms opacity/translate transitions for scene text.
- Use one restrained 450–600ms field arrival/recession for the cross-current and visibility takeovers.
- Transitions must be interruptible and converge on the most recent scene state.
- Morph marks already on screen instead of fading the entire canvas to black and replacing it.
- Use camera motion only when a scene names a place whose location matters.
- Avoid pulsing alarms, ocean shimmer, rising-water metaphors, decorative routes, and constant parallax.
- `prefers-reduced-motion: reduce` produces immediate state changes or a static equivalent, not merely shorter animation.
- Progress navigation, scrolling, browser history, and keyboard navigation must all converge on one scene-state controller.

Implementation interpretation for the retrofit: reuse the same evidence-mark component and stable geography codes across map, cross-current, visibility, and return forms; animate marks and fields with native CSS; do not add a cross-DOM FLIP/shared-element engine. The map-to-field change should read as one constellation being reorganized even if the final renderer uses the existing component in separate stage ownership. `TASK-072` keyframes lock that continuity before code, and `TASK-077` verifies the reduced-motion/static equivalent.

## Art Direction

The target is a contemporary scientific ocean chart with an editorial soul. It is neither a generic dark analytics dashboard nor cultural ornament.

Color roles:

- Ocean: near-black Pacific blue.
- Land and cartographic texture: subdued slate/blue-gray, visible enough for orientation but secondary to evidence marks.
- Paper/chrome: warm mineral white used sparingly.
- Water change: clear Pacific blue with direct axis labeling.
- Renewable-share change: sea-glass green with direct axis labeling.
- Optional Adaptation Gap Explore layer: coral to oxidized terracotta; never the guided default.
- Missingness: open cuts, broken strokes, unlit positions, and texture—not a separate alarm color.
- Selection: pale bloom or crisp light emphasis, not a data-colored ring.

Typography roles:

- Editorial serif for scene claims and the closing line.
- System sans for evidence, controls, caveats, and accessible UI.
- Monospace for source filenames, hashes, exact years, and trace metadata.

Composition principles:

- Prefer one large meaningful figure to several bright cards.
- Let negative space make missingness and mismatch legible.
- Use thin cartographic linework, small source labels, and restrained annotation leaders.
- Keep corners and shadows quiet. The map should feel like the surface, not a dashboard wallpaper behind floating widgets.
- Every scene must still make sense in a screenshot without its transition.

## Exploration After The Story

Free exploration should preserve the scientific depth without carrying all of it into the guided spine.

Keep:

- the current gap, pressure, visible-capacity, monitoring-visibility, rank-fragility, and outlook controls as optional exploration tools;
- selected geography detail and indicator trace;
- selected-place JSD nearest neighbors in the panel;
- sources, method, geometry caveat, and optional outlook stress-test access.

Simplify:

- no JSD map arcs;
- no global similarity mode;
- fewer persistent floating panels;
- calmer selection camera behavior;
- no automatic fit that hides the wider Pacific unless a scene explicitly focuses on a named place;
- shareable URL state for mode, scene or layer, selected geography, and optional outlook state.

### 2026-07-17 Explorer UX Boundary

Keep the same Explorer and visual system, but make its hierarchy reversible and visible:

- one shared panel-navigation row owns Back, Close, and mobile expand/collapse;
- diagnostic child detail has contextual **Back to data coverage** or **Back to rank ranges**;
- Close ends the current panel path, while Back restores the parent explanation;
- dismissal replaces URL history so browser Back does not immediately reopen the dismissed surface;
- portrait shows complete score and evidence-view rows; landscape shows one complete compact row;
- selected-place detail starts with existing water/renewable/year/14-position evidence before the optional score;
- temporary review copy is removed.

This repair may not introduce a router, reducer, navigation stack, new data field, new score, new dependency, or visual reskin. The accepted palette, typography, map, evidence marks, story, and panels remain authoritative. Search, copy-link UI, saved places, and global reset remain outside the first repair.

## Implementation Path

The approved retrofit is intentionally small:

1. `TASK-072`: approve desktop, portrait, and landscape keyframes for map -> cross-current -> visibility -> map continuity, using the live app as the composition baseline.
2. `TASK-073`: add the minimum traceable regional-story fields to generated app data.
3. `TASK-074`: replace the guided scene/copy/URL contract while preserving the scroll and state architecture.
4. `TASK-075`: build one regional evidence field with movement and visibility modes, reusing the evidence mark and native SVG/CSS.
5. `TASK-076`: integrate both modes, return to the unchanged explorer, and delete only guided components proven unused.
6. `TASK-077`: run independent scientific, interaction, accessibility, responsive, URL/history, bundle, and owner QA; reconcile `TASK-057` only after acceptance.

`TASK-072` and `TASK-073` may run concurrently only in isolated worktrees. Their status/log updates and separate no-co-author commits are serialized by the Orchestrator. Later tasks are sequential because they share the scene contract, evidence marks, `App.tsx`, and stage CSS. No per-task Markdown files are required; the task ledger is the implementation plan.

The 2026-07-20 follow-up uses the same rule: `TASK-086` through `TASK-090` are fully specified in `context/TASKS.md`, so no separate per-task plan files are required.

Future possibilities only after the core redesign works:

- reviewed official boundary geometry when it materially improves comprehension;
- Pacific-language localization with human review;
- community or local-knowledge layers only through consent-based partnerships and provenance;
- no expansion of the outlook beyond method-only status until evidence quality supports it.

## Definition Of Success

The redesign succeeds when:

- a first-time reader can state the thesis after the premise without remembering interface mechanics;
- a nontechnical reader can distinguish water change, renewable-share change, and evidence visibility without being taught a score;
- every one of 22 places remains visible at basin scale;
- the 19 complete comparisons and three incomplete cases remain visible, with 7/6/3/3 quadrant counts reproduced from generated data;
- all 14 visibility positions per geography remain traceable, with 277 present and 31 absent cells and no composite visibility score;
- missing evidence is legible as a break in a stable structure;
- reported zero and missing row are distinguishable in colorblind and monochrome review;
- the cross-current and visibility fields receive enough space for direct labels and remain readable on every target viewport;
- progress controls never fight scroll state;
- mobile scenes are not covered by fixed controls;
- reduced-motion users receive an equivalent static story;
- exploration remains powerful but quieter than the narrative;
- the explorer returns intact and the optional Adaptation Gap layer remains clearly caveated rather than silently restored as the default;
- the final experience feels original because its form grows from the evidence, not because it borrows a visual motif.
