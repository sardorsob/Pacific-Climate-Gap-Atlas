# Artistic Redesign Brief

## Status

The 2026-07-09 five-scene evidence contract remains scientifically active, but its 28rem desktop story-rail composition is superseded by the 2026-07-11 fullscreen story-stage revision in `context/design-concepts/task-058-fullscreen-story-stage.md`.

Owner review of the functioning `TASK-057` app found that the opening does not explain the project strongly enough and that scenes 4 and 5 render primary evidence too small. `TASK-057` is therefore `needs-fix`; `TASK-058` is the owner-review design gate for the next implementation batch.

Working title:

> The Pacific Adaptation Gap Atlas

Narrative identity:

> The Shape of What We Know

Public-facing thesis candidate:

> The shape of what the official record can—and cannot—see.

## 2026-07-11 Fullscreen Stage Revision

The next composition is **One Constellation on an Elastic Stage**, with restrained tidal arrival/recession for editorial evidence chambers.

- Add one full-screen premise prologue before the five evidence scenes.
- Let the map own the full viewport for the prologue and scenes 1–3.
- Let the Nauru/Tuvalu comparison own the viewport in scene 4.
- Let the 22-row interval field own the viewport in scene 5.
- Return the same 22 evidence marks to geography for Explore.
- Keep native document scroll and one observer-owned active state; do not add scrolljacking or nested overflow.

The evidence grammar, fixed-presence marks, five evidence operations, panel-only JSD, generated-data contract, and ethical guardrails below remain authoritative. Where the older layout contract says the map must remain sticky beside a 28rem story column or the mobile map must remain 46svh for every scene, the `TASK-058` fullscreen-stage contract supersedes it.

## Why The Atlas Needs Another Pass

The historical pre-redesign app was scientifically careful, visually competent, and technically healthy. Its limitation was editorial: it read as a polished sequence of GIS features rather than one inevitable argument. Seven beats repeatedly explained the interface, while the strongest original idea—uneven official visibility—did not fully govern the marks, scene order, layout, and motion.

The redesign should make one argument through every layer of the experience:

> Official records illuminate the Pacific unevenly. Those gaps in the record change what the atlas can responsibly compare, rank, and conclude.

The adaptation-gap score remains the entry point, but the evidence behind it becomes the protagonist. The redesign is not a cosmetic reskin. It is a simplification of the story, a clarification of the data grammar, and a more artistic way to show absence without turning it into decoration.

## Evidence And Ethics Lock

The redesign must preserve these facts and limits:

- The dataset contains 22 Pacific geographies.
- The Adaptation Gap Index is a comparative screen, not a ranking of need, vulnerability, readiness, or funding priority.
- The score is built from eight possible score-input datasets: four climate-signal datasets, one observed-stress dataset, and three visible-capacity datasets.
- Greenhouse-gas emissions per capita is responsibility context only. It must never be counted or drawn as a score input.
- A latest monitoring row reporting `0` is not the same as no processed monitoring row.
- A missing monitoring row is a reporting gap, not proof that infrastructure is absent.
- Natural Earth land is visual context, not official scored geography or territorial geometry.
- Rank bands are sensitivity diagnostics, not probability intervals.
- JSD compares normalized official-data profiles. It does not imply physical connection, causality, shared vulnerability, lived experience, or shared policy need.
- Outlook outputs remain optional method/stress-test context, not forecasts.
- Deeper Pacific cultural visual language requires Pacific co-design. Do not appropriate Indigenous navigation, weaving, tattoo, or other cultural motifs as decorative interface language.

## What Stays, What Changes

### Preserve

- A full-basin Pacific map visible from the first viewport.
- Guided reading followed by a clear `Explore freely` handoff.
- Direct access to sources, methods, trace rows, and caveats.
- Nauru and Tuvalu as the central paired example.
- Reported-zero and missing-row monitoring as distinct visual and verbal states.
- Pressure, visible capacity, monitoring visibility, and rank fragility as the core evidence families.
- A selected-place panel organized around score, the two sides of the score, and what the record shows.
- Guaranteed-size geography marks so atolls do not disappear at basin scale.
- Reduced-motion support, keyboard navigation, touch targets, and non-color missingness cues.

### Reframe

- The redesign replaces the historical seven-beat tour with five scenes and a short handoff.
- Replace evidence-size circles with fixed-presence evidence marks. Thin evidence should look interrupted, not physically unimportant.
- Make monitoring and score-input availability part of the primary mark grammar instead of secondary prose.
- Use one motion verb per scene: reveal, subtract, separate, compare, rearrange, return.
- Use native document scroll with a sticky map instead of a nested story-rail scroller.
- Let the Nauru/Tuvalu comparison and rank interval view temporarily become composed editorial figures rather than forcing every claim to remain a map layer.

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

## Five-Scene Storyboard

The story uses five scenes, each with one claim, one visual operation, one necessary caveat, and one evidence source line. Copy should sound spoken and precise, not like a slogan generator.

### Scene 1: What The Map Can See

Claim:

> Twenty-two Pacific places appear here. But they do not appear with equal clarity.

Visual state:

- Reveal all 22 evidence marks in geographic position.
- Begin with the common structure of the marks before emphasizing score color.
- Let the viewer register that every place occupies equal visual presence.

Motion verb: reveal.

Evidence: `adaptation_gap_index.csv`, generated geography records.

Caveat: the atlas compares what official data can show; it does not rank who needs help most.

### Scene 2: Where The Record Breaks

Claim:

> Some places are difficult to read before we even begin comparing them.

Visual state:

- Recede score color.
- Bring missing score-input cuts and monitoring edges forward.
- Directly annotate Pitcairn and Nauru as `reports 0` and American Samoa and Wallis and Futuna as `no processed rows`.
- Keep the two monitoring conditions visually distinct without relying on color.

Motion verb: subtract.

Evidence: `eda_monitoring_gap.csv`, indicator trace.

Caveat: thin records describe official visibility, not conditions on the ground.

### Scene 3: The Gap Has Two Sides

Claim:

> The gap is not one number. It is the distance between what pressure shows and what capacity records can show.

Visual state:

- Open each evidence mark into paired pressure and visible-capacity arcs or lobes.
- Preserve the geography anchor while showing the separation between the two sides.
- Let the negative space between the sides carry the concept of mismatch.

Motion verb: separate.

Evidence: climate-pressure and capacity scores plus score-input trace rows.

Caveat: visible capacity is an official-data proxy, not full readiness or lived adaptive capacity.

### Scene 4: Similar Scores, Different Records

Claim:

> Nauru and Tuvalu arrive at similar-looking scores through different records.

Visual state:

- Keep faint Nauru and Tuvalu anchors on the map.
- Enlarge two evidence portraits into a balanced editorial comparison.
- Compare gap, pressure, visible capacity, monitoring state, score-input completeness, and rank band.
- Use aligned fields so differences are perceptual, not buried in prose.

Motion verb: compare.

Evidence: geography records, `eda_monitoring_gap.csv`, `eda_rank_volatility.csv`.

Caveat: this is a comparison of official evidence, not a claim that either place’s lived reality is summarized by the score.

### Scene 5: The Order Does Not Hold Still

Claim:

> Change one ingredient, and most of the order moves.

Visual state:

- Soften the map.
- Move the existing marks into a rank-band field while preserving mark identity.
- Highlight Marshall Islands’ 4–19 span and the broad pattern: 19 of 22 geographies are labeled fragile under the current leave-one-indicator diagnostic.
- Do not display a definitive ordered leaderboard behind the bands.

Motion verb: rearrange.

Evidence: `eda_rank_volatility.csv`.

Caveat: the bands show sensitivity to analytical choices; they are not confidence intervals.

### Handoff: Return To The Pacific

Closing claim:

> This map cannot tell us who needs help most. It can show us where to look—and where the record asks us to look harder.

Visual state:

- Return the same marks from the interval field to geographic position.
- Restore restrained gap color and exploration controls.
- Offer one clear `Explore freely` action.

Motion verb: return.

## Layout Contract

### Desktop

- Use native page scroll. Do not create a nested scrolling rail.
- Keep the Pacific map sticky for the guided sequence.
- Each scene is a normal document section with a stable `id` and approximately one viewport of breathing room.
- One `IntersectionObserver` owns the canonical active scene.
- Progress controls call `scrollIntoView` only; they do not set a competing active scene before the observer confirms it.
- Scene copy occupies a restrained editorial column and never covers the geography or visual comparison it explains.
- Country exploration opens a panel after the guided handoff; it should not be permanently present during the five-scene narrative.

### Mobile

- Treat mobile as a sibling composition, not a shrunken desktop.
- Keep the map at roughly 42–48 `svh` during geographic scenes.
- Put story content in normal page flow below or alongside the sticky map region.
- Use a fixed navigation bar only when measured content and safe-area padding prove it cannot cover the active scene.
- Turn the Nauru/Tuvalu comparison into two stepped or horizontally paged evidence portraits.
- Turn rank fragility into a static, vertically readable interval figure when animated rearrangement would be cramped.
- Use fewer direct map labels and a compact exploration toolbar instead of a tall bottom card.
- Test at 390 × 844 and at least one narrower 360px viewport.

## Motion And Transition Contract

Motion is explanatory punctuation. It must never become ambient atmosphere.

- One shared easing curve across map, marks, text emphasis, and scene figures.
- Typical transition duration: 450–650ms.
- Transitions must be interruptible and converge on the most recent scene state.
- Morph marks already on screen instead of fading the entire canvas to black and replacing it.
- Use camera motion only when a scene names a place whose location matters.
- Avoid pulsing alarms, ocean shimmer, rising-water metaphors, decorative routes, and constant parallax.
- `prefers-reduced-motion: reduce` produces immediate state changes or a static equivalent, not merely shorter animation.
- Progress navigation, scrolling, browser history, and keyboard navigation must all converge on one scene-state controller.

## Art Direction

The target is a contemporary scientific ocean chart with an editorial soul. It is neither a generic dark analytics dashboard nor cultural ornament.

Color roles:

- Ocean: near-black Pacific blue.
- Land and cartographic texture: subdued slate/blue-gray, visible enough for orientation but secondary to evidence marks.
- Paper/chrome: warm mineral white used sparingly.
- Adaptation gap: coral to oxidized terracotta.
- Climate pressure: clear Pacific blue.
- Visible capacity: sea-glass green.
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

- gap, pressure, visible-capacity, monitoring-visibility, and rank-fragility controls;
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

## Growth Path

The redesign sequence should grow the atlas in this order:

1. Correct score-input and context indicator accounting.
2. Approve the evidence-mark and mobile/desktop visual concepts.
3. Replace nested scroll with one native-scroll scene controller.
4. Ship the five-scene narrative.
5. Add evidence marks and the composed comparison/uncertainty scenes.
6. Simplify exploration and remove misleading JSD arcs.
7. Consolidate code, dependencies, generated layer manifests, and stale context.
8. Add shareable URL state, final accessibility checks, performance budgets, and release QA.

Future possibilities only after the core redesign works:

- reviewed official boundary geometry when it materially improves comprehension;
- Pacific-language localization with human review;
- community or local-knowledge layers only through consent-based partnerships and provenance;
- no expansion of the outlook beyond method-only status until evidence quality supports it.

## Definition Of Success

The redesign succeeds when:

- a first-time reader can state the thesis after the five scenes without remembering the interface mechanics;
- the score-input/context distinction is correct in generated data, marks, copy, and legend;
- every one of 22 places remains visible at basin scale;
- missing evidence is legible as a break in a stable structure;
- reported zero and missing row are distinguishable in colorblind and monochrome review;
- Nauru/Tuvalu and Marshall Islands each earn one focused scene without turning the app into a leaderboard;
- progress controls never fight scroll state;
- mobile scenes are not covered by fixed controls;
- reduced-motion users receive an equivalent static story;
- exploration remains powerful but quieter than the narrative;
- the final experience feels original because its form grows from the evidence, not because it borrows a visual motif.
