# TASK-058 Fullscreen Story Stage Design Contract

Date: 2026-07-11

Status: owner-review draft

Supersedes: the 28rem desktop story rail and 46svh map-plus-document composition locked by `TASK-049`

Preserves: the scientific, evidence-mark, URL-state, accessibility, and panel-only JSD contracts completed through `TASK-057`

## Diagnosis

Owner review found two release-blocking composition failures in the functioning five-scene app:

1. The opening explains limitations before it clearly explains the project. A first-time reader does not receive a strong answer to what is being compared, why the comparison matters, or why uneven official visibility is central.
2. The desktop layout structurally demotes scenes 4 and 5. The story rail is capped at 30rem, scene content at 28rem, and the 22-row rank figure at 330px high with 9px labels. Nauru/Tuvalu and rank sensitivity are primary evidence, but they are rendered as sidebar illustrations.

This is a hierarchy problem, not a request for slightly larger type. The visual that owns the evidence must also own the viewport.

## Concepts Reviewed

The three generated boards are composition studies only. Generated labels, values, land shapes, photographs, and boundaries are not sources of truth.

- `artifacts/design/task-058/elastic-stage.png`: clearest screen-by-screen hierarchy and simplest implementation path.
- `artifacts/design/task-058/tidal-chapters.png`: strongest material transition between the ocean map and editorial evidence chambers.
- `artifacts/design/task-058/one-constellation.png`: strongest continuity because the same 22 marks transform from geography to comparison to interval field and back.

### Direction A: Elastic Stage

One sticky full-screen stage changes owner by scene: map for geographic claims, large editorial figures for comparison and rank sensitivity, and map again for exploration.

Trade-off: highest clarity and lowest implementation risk, but it can feel mechanically sectional without a unifying visual transition.

### Direction B: Tidal Chapters

Warm editorial evidence surfaces arrive over the ocean map like a tide, then recede to reveal geography again.

Trade-off: the most tactile and art-directed direction, but literal paper textures or elaborate wipes could become decorative and reduce chart contrast.

### Direction C: One Constellation

The same 22 fixed-presence marks remain the cast throughout the experience. They reveal missingness, separate into two sides, unfold for comparison, rearrange into rank intervals, and return to place.

Trade-off: the most original and coherent direction, but it requires disciplined shared-element choreography and must not become a particle spectacle.

## Recommended Synthesis

Build **One Constellation on an Elastic Stage**, using the quiet arrival-and-recession rhythm from **Tidal Chapters**.

- Elastic Stage supplies the layout system.
- One Constellation supplies object continuity and the artistic identity.
- Tidal Chapters supplies the transition tone, not literal textured decoration.

The result should feel like one evidence system changing form, not a map followed by unrelated charts.

## Story Spine

### Prologue: What This Atlas Is Asking

The map fills the first viewport. No story rail, legend wall, methods button cluster, or opaque card competes with the premise. Large copy occupies open ocean space:

> Climate pressure is not the same as adaptation capacity.

> Across 22 Pacific places, official records show both unevenly.

> This atlas maps the gap between them—and makes the missing evidence visible.

Supporting caveat, present but subordinate:

> Visible capacity is what the available official datasets can show, not full readiness or lived adaptive capacity.

The prologue is one stable, linkable scene before the five evidence scenes. Its copy may reveal in short phrases as the reader crosses the section, but native page scroll remains the only scroll owner.

### Scene 1: What The Map Can See

The 22 fixed-presence marks resolve over the full-basin map. The primary lesson is equal presence with unequal clarity. Copy appears over safe ocean space; direct annotations sit near evidence.

### Scene 2: Where The Record Breaks

Score color recedes while missing score-input cuts and monitoring edges become primary. Reported-zero and no-processed-row examples remain distinct in shape and language.

### Scene 3: The Gap Has Two Sides

The same marks separate into climate-pressure and visible-capacity forms. The negative space between the forms carries the mismatch. The map still owns the viewport because geography remains useful.

### Scene 4: Similar Scores, Different Records

The map recedes to a quiet locator or disappears. A full-screen comparison chamber gives Nauru and Tuvalu aligned evidence portraits at readable scale. Desktop shows both portraits together. Portrait mobile uses two consecutive full-screen steps—Nauru, then Tuvalu—followed by one comparison takeaway. No swipe-only requirement.

### Scene 5: The Order Does Not Hold Still

The comparison chamber becomes a full-screen interval field. All 22 names and bands receive readable row height on one shared 1–22 scale. Marshall Islands 4–19 is highlighted without turning the figure into a leaderboard. Desktop targets at least 13px labels and roughly 26–30px per row. Portrait mobile uses normal document height with a sticky title/axis; landscape mobile lets the interval field fill the screen. There is no nested chart scroll.

### Handoff: Return To Place

The interval rows loosen and return to the same 22 geography anchors. Story captions and progress chrome leave. The full exploratory map and compact controls become available only after the handoff.

## Layout Contract

The guided experience has three stage modes:

1. `map-immersive`: prologue and scenes 1–3. Map is full viewport; story copy overlays safe ocean space with a restrained contrast veil and no card-heavy rail.
2. `figure-takeover`: scenes 4–5. The primary figure owns approximately 80–90vw and the usable viewport height; the map is absent or reduced to a quiet locator.
3. `explore`: after handoff. The map owns the viewport and all exploration controls become available.

`StoryScrolly` remains the single observer-owned active-scene controller. The layout changes around that contract; no nested story overflow, scrolljacking, wheel interception, or second active-state writer is introduced.

## Motion Contract

- Preserve the existing 560ms `cubic-bezier(0.22, 1, 0.36, 1)` evidence transform for shared marks.
- Use shorter 180–240ms opacity/translate transitions for text entrance and exit.
- Use one restrained 450–600ms chamber arrival/recession transition for scenes 4 and 5.
- Stop in-flight camera or evidence transitions before applying a newer scene state; latest scene wins.
- Keep the same geography key attached to each mark through map, split, comparison, interval, and return states.
- Reduced motion renders complete static states with immediate transitions. Nothing essential depends on morphing.

## Responsive Contract

- Desktop and tablet landscape use the full-screen stage modes directly.
- Portrait mobile keeps every scene in normal document flow and uses one claim per viewport-scale step.
- Map scenes may use a full-height map with copy in a protected lower/upper field; text cannot cover the active annotated marks.
- Scene 4 is sequential on portrait mobile and simultaneous on desktop/landscape.
- Scene 5 is page-tall on portrait mobile, full-screen on landscape mobile, and full-screen on desktop.
- Test 1440×900, 1280×800, 1024×768, 430×932, 390×844, and 360×800, plus landscape mobile for scene 5.

## Component Boundary

Implementation should stay close to the existing architecture:

- `StoryScrolly` continues to own section refs, keyboard navigation, and observer-confirmed active state.
- A focused `StoryStage` renders the active map or figure mode and exposes only scene/stage props.
- `PlaceComparisonScene` and `RankBandScene` become stage-sized figures instead of children inside the 28rem copy column.
- A pure stage-model helper maps stable scene IDs to `map-immersive`, `figure-takeover`, or `explore` behavior and supports deterministic tests.
- Existing `AtlasMap`, `EvidenceMark`, URL serialization, selected-place panel, generated data, and panel-only JSD remain authoritative.

Do not add a router, animation library, canvas particle system, design-system abstraction, or new runtime dependency for this work.

## Evidence And Ethics Locks

- Every implemented value comes from existing generated app data or cited EDA artifacts.
- Concept-board maps, photographs, names, ranks, and boundaries are not implementation inputs.
- Natural Earth remains orientation context, not official scored territory geometry.
- Fixed mark presence remains equal across all places.
- `visible capacity` remains the required term; do not substitute `readiness`.
- Rank bands remain sensitivity diagnostics, not confidence intervals.
- JSD remains selected-place panel evidence only.
- No Indigenous or Pacific cultural motif is introduced without Pacific co-design.

## QA And Acceptance

The redesign is acceptable only when:

- a first-time reader can explain the project premise after the prologue;
- scene 4 fields are readable without zoom at all target viewports;
- scene 5 shows all 22 names and bands without 9px labels, clipping, or nested scrolling;
- slow scroll, rapid scroll, progress navigation, copied scene URLs, Back/Forward, and reduced motion converge on the same final state;
- keyboard order and screen-reader reading order follow the narrative even when visuals are sticky;
- reported zero, missing score input, and missing monitoring row remain distinguishable without color;
- the Explore handoff removes story chrome and restores the complete existing atlas controls;
- the full automated app/data/status/secret/build/bundle checks pass;
- owner visual/accessibility review closes the `TASK-057` needs-fix findings.

## Implementation Batch

- `TASK-059`: rewrite and validate the prologue plus scene copy contract.
- `TASK-060`: build the full-screen stage shell while preserving one scroll owner and URL state.
- `TASK-061`: promote Nauru/Tuvalu into a responsive full-screen comparison takeover.
- `TASK-062`: promote rank sensitivity into a responsive full-screen interval field.
- `TASK-063`: connect shared-mark transitions, handoff, reduced motion, and rapid-navigation behavior.
- `TASK-064`: run the full cross-viewport, evidence, accessibility, URL, and bundle QA matrix and return `TASK-057` to review.

Each task is independently reviewable and receives its own commit after its Checker gate. No task adds a co-author trailer.

## Review Gate

This document is the proposed durable contract. `TASK-058` remains `in-review` until the owner confirms the recommended synthesis and written requirements. Only then should the code-level implementation plan for `TASK-059` through `TASK-064` be written.
