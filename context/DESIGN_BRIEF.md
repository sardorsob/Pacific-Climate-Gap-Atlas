# Design Brief

## Status

Task: `TASK-018`

Status: semantic design brief for the functioning fullscreen atlas. The owner likes the map, interaction, fullscreen composition, and Explore handoff but has reopened the competition narrative. Preserve that system through TASK-068 research and TASK-069 selection. Treat the current title, premise, exemplar pair, layer priority, and scene claims as provisional. `context/ARTISTIC_REDESIGN_BRIEF.md` records the visual baseline and owner-approved regional two-act working direction.

Design skill basis:

- `build-web-data-visualization:data-visualization`
- meaning-preserving visual design workflow
- mobile-first responsive visualization
- perception, color, and encoding
- layout hierarchy and self-explanatory UX
- sensitive geopolitical and humanitarian story guardrails
- `context/DATAVIZ_INSPIRATION_AUDIT.md` live reference audit for map, climate, environmental, and selected-geography interaction patterns
- `context/WINNER_SCROLL_TOUR_AUDIT.md` Pacific Dataviz winner audit recommending a scroll-led hybrid

First-build concept status:

- Text contract: accepted as working design context, not final public-facing copy.
- Large-screen mockup concept: implemented for review.
- Mobile portrait mockup concept: implemented for review.
- Mobile landscape concept: optional, recommended if map controls become wide or gesture-heavy.
- Production gate: final methodology, accessibility, deployment, source/provenance, and owner visual review remain before submission readiness. Official scored-geography polygon boundaries remain a future source gate outside the completed MapLibre/Natural Earth visual substrate.

Current concept status:

- Narrative and semantic direction: regional two-act working hypothesis pending TASK-068 complete-region EDA and TASK-069 approval.
- Desktop evidence-mark/scene frames: approved in `context/design-concepts/task-049-concept-review.md`.
- Mobile portrait frames: approved in the same concept review; the map remains a sibling surface, not a covered background.
- Historical 28rem rail implementation: complete through `TASK-057`, then returned `needs-fix` by owner visual QA.
- Fullscreen stage concepts: cataloged under `artifacts/design/task-058/`.
- Recommended synthesis: **One Constellation on an Elastic Stage**, using restrained tidal chamber transitions.
- Implementation: `TASK-059` through `TASK-063` are approved and done. `TASK-064` passed the automated, responsive, interaction, and screenshot gates and remains `in-review` for owner visual acceptance; `TASK-057` remains `needs-fix` until that decision.

The current app remains the behavioral and visual baseline. No app visual work should preview speculative candidate data. After TASK-069, reuse the fullscreen stage where it still serves the approved evidence and revise only the claims, figures, illustrative labels, or layers the data decision requires. TASK-068 creates static research plates only.

## Fullscreen Stage Layout Revision

The map no longer has to remain the largest surface in every guided scene. Visual ownership follows the evidence:

- `map-immersive`: premise and scenes 1–3 use a full-viewport map with large captions over safe ocean space;
- `figure-takeover`: scene 4 expands Nauru/Tuvalu into a full-screen aligned comparison and scene 5 expands the 22 rank bands into a full-screen interval field;
- `explore`: the same marks return to geography and the existing atlas controls become available.

This revision removes the 30rem/28rem rail and 330px rank-chart caps as target constraints. It preserves native scroll, one observer-owned active state, shared evidence marks, URL state, keyboard navigation, reduced motion, and panel-only JSD. See `context/ARTISTIC_REDESIGN_BRIEF.md` for the complete contract.

The rank-sensitivity takeover now uses an unordered HTML interval field rather than the miniature SVG: all geography names remain full and alphabetically ordered, bands share the exact 1–22 scale, Marshall Islands 4–19 remains highlighted, and portrait completion stays in normal page flow with a sticky title/axis. After the progress-control repair, the toolbar and progress row form one reachable sticky chrome region; the rank header clears its measured 132px mobile and 120px desktop height in both orientations.

The transition pass preserves continuity through stable `data-code` identity and the existing evidence marks rather than a cross-DOM animation engine. One observer owns both scene activation and the separate return handoff. The handoff and Explore action deterministically restore adaptation gap, default view, no selection, and no outlook; scrolling back reapplies the last scene's canonical state. Programmatic progress and keyboard jumps are immediate, and one pending requested index protects rapid input from observer-lagged React state until pointer/wheel/touch returns ownership to manual navigation. CSS still handles short text arrival and the shared 560ms evidence/chamber recession, while reduced motion resolves every animated element directly to its static final state.

## Approved Next Direction: The Shape Of What We Know

The next design is governed by one idea:

> Official records illuminate the Pacific unevenly. Those gaps change what the atlas can responsibly compare, rank, and conclude.

The major design decisions are:

- five guided scenes plus a short return-to-explore handoff;
- native document scroll with a sticky map and one observer-confirmed active scene;
- equal-footprint evidence portraits instead of evidence-size bubbles;
- eight fixed score-input positions, one detached responsibility-context tick, an outer monitoring edge, and an inner score field;
- missing evidence shown as breaks and open positions, never by making a place smaller;
- paired pressure/visible-capacity forms, aligned Nauru/Tuvalu portraits, and a composed rank-band field;
- one shared 450–650ms evidence-motion language with a complete reduced-motion equivalent;
- JSD retained in the selected-place panel but removed from the guided spine and map connectors;
- a contemporary scientific ocean-chart art direction: near-black Pacific blue, subdued cartographic texture, coral/terracotta gap, Pacific blue pressure, sea-glass capacity, mineral-white editorial type;
- no appropriation of Indigenous Pacific visual motifs; culturally grounded expansion requires Pacific co-design.

TASK-049 locks the evidence-mark values: 44px circular evidence portraits with a 20px inner field and eight 5px radial ticks; score-input order is sea-surface temperature, surface temperature, rainfall, sea level, directly affected persons, monitoring network, power generation, fisheries management; the detached context tick sits at 4:30; reporting edges are continuous, open-dash, or broken-dot; motion uses 560ms with `cubic-bezier(0.22, 1, 0.36, 1)`; and the type stacks remain Georgia plus the system sans stack. Its 28rem desktop copy cap and universal 46svh mobile map are historical rail values superseded by TASK-058 stage ownership. All concept frames remain composition studies and never override generated data values.

`context/ARTISTIC_REDESIGN_BRIEF.md` is the complete design source of truth. The older sections below describe enduring constraints; the active story uses five scenes, native document scroll, fixed evidence marks, and panel-only JSD.

## External Inspiration Guardrails

Use the Dataviz Inspiration audit as a principle study, not a moodboard to copy.

Patterns to preserve:

- Shipmap: full-bleed map as the primary surface, compact edge controls, layer/filter menus that match the domain, and motion only when it encodes evidence over time.
- Dataista internal migration: selected geography becomes the anchor; a second comparison target appears only after selection. This is the right interaction pattern for app-wired Evidence Fingerprint Divergence.
- Show Your Stripes and Bussed Out: compact evidence strips, timelines, counters, or distributions can support the country panel without replacing the map.
- The Pudding airports story: open guided explanation with a map-anchored claim, direct labels, and leader lines rather than a detached dashboard grid.
- Bruxelles Malade: human stakes and guided questions can help, but the atlas must not delay the first evidence read behind a long cinematic intro.
- Pacific Dataviz winner audit: recent custom winners lean toward scroll stories or long-form visual essays; use guided scroll to earn attention, then hand readers into the atlas explorer.

Patterns to avoid:

- copying palettes, layouts, illustrations, publication identity, or iconic stripe treatments;
- long pre-map intros;
- hover-only explanation;
- hidden caveats;
- inaccessible custom selectors;
- decorative motion that does not reveal, compare, focus, or re-encode evidence.

## Design Objective

Build a map-first guided atlas that lets readers inspect where current official climate-pressure, observed-stress, adaptation-capacity, monitoring, and missingness signals appear most out of balance across 22 Pacific geographies.

The app should feel like a careful GIS tool with a guided scroll story path. It should not feel like a landing page, generic dashboard, leaderboard, or decorative scrollytelling essay.

## Analytical Job

Primary analytical job:

- Geography and comparison: show where gap, pressure, capacity, monitoring visibility, and uncertainty differ across Pacific geographies.

Secondary analytical jobs:

- Uncertainty: show rank fragility and evidence density.
- Similarity: show which official-data evidence profiles resemble a selected geography, using `TASK-019` artifacts.
- Missingness: distinguish visible monitoring, reported zero, and missing monitoring rows.
- Decomposition: show why a selected geography scores the way it does.
- Guided explanation: use scroll-driven story beats to walk users through the story without hiding exploration.

Data shape:

- Geospatial point features with tabular properties.
- Country/detail JSON records.
- EDA CSV tables for monitoring, rank volatility, spatial typology, and outlook interpretation.
- Divergence tables for evidence fingerprints, pairwise JSD, and nearest neighbors from `TASK-019`.
- Optional time-scenario fields for outlook.

Artifact family:

- Interactive web atlas with guided scroll tour, layer controls, side panel, source/method drawer, and mobile bottom sheet.

Primary route:

- MapLibre map plus React/TypeScript UI. The current implementation uses Natural Earth visual land context and generated centroid fallback points; reviewed scored-geography boundary geometry can be added only after source, license, and geopolitical review.

Fallback route:

- Static centroid map plus country cards if map interactivity becomes unstable late in the sprint.

## Evidence Lock

Every visible score, label, and caveat should trace to one of these sources:

| Visual Surface | Primary Source | Evidence Status |
| --- | --- | --- |
| Gap score | `data/processed/app/geographies.json`, `artifacts/tables/adaptation_gap_index.csv` | modeled comparative screen |
| Pressure/capacity scores | `data/processed/app/geographies.json` | modeled comparative screen |
| Indicator detail | `data/processed/app/country_details.json` | measured/latest official rows plus derived scores |
| Monitoring status | `artifacts/tables/eda_monitoring_gap.csv` | measured reporting status / proxy count |
| Rank uncertainty | `artifacts/tables/eda_rank_volatility.csv` | sensitivity stress test |
| Evidence fingerprint divergence | `artifacts/tables/eda_evidence_fingerprints.csv`, `artifacts/tables/eda_pairwise_jsd.csv`, `artifacts/tables/eda_similarity_neighbors.csv`, `artifacts/provenance/divergence_summary.json` | information-theory diagnostic over official-data-derived profiles |
| Spatial typology | `artifacts/tables/eda_spatial_typologies.csv` | rule-based descriptor |
| Subregion caption | `artifacts/tables/eda_subregion_comparisons.csv` | small-sample descriptive summary |
| Outlook | `artifacts/tables/eda_outlook_interpretation.csv`, `adaptation_gap_outlook.csv` | stress-test display guidance |
| Responsibility context | indicator trace rows with responsibility role | context-only, not score driver |

No visual element may imply:

- precise boundaries,
- causal attribution,
- a definitive vulnerability ranking,
- infrastructure absence from missing rows,
- future prediction from outlook,
- moral blame from responsibility context,
- causal or policy-need equivalence from evidence-profile similarity.

## First View

The first screen should be the atlas itself, with the guided scroll rail acting as the default reading path.

Large screen first load:

- Full-bleed Pacific map.
- Adaptation gap layer active.
- Small top-left title block with one-line thesis.
- Layer control visible but restrained.
- Legend visible and useful.
- Source/method access visible.
- Detail panel collapsed until selection or scroll-tour step.
- Caveat visible under active layer title: "Comparative screen, not a ranking of need. Most ranks are fragile."

Mobile first load:

- Map visible in the top portion of the viewport.
- Active layer title and caveat visible above or over the map.
- Bottom sheet collapsed to a compact handle with layer state.
- Legend accessible through a chip, not occupying the whole first screen.
- Main map appears before deep controls.

## Information Architecture

### Global Regions

1. Map canvas
2. Layer and overlay controls
3. Legend / encoding key
4. Guided tour controls
5. Country detail panel
6. Methodology and source drawer

### Reading Order

Default reading order:

1. Where am I? Pacific map frame.
2. What am I seeing? Active layer title and caveat.
3. What differs? Point fill, size, and ring encodings.
4. Why should I trust or question it? Legend, rank fragility, source drawer.
5. What is behind a place? Country detail panel and indicator trace.

The design should not require users to parse all controls before understanding the default state. The first scroll beat should name one claim and one caveat while the map remains visible.

## Map Grammar

### Geometry

V1 uses Natural Earth land context for orientation plus centroid point features for scored/selectable geographies.

Required cue:

- Include "Natural Earth land context; scores use centroid fallback, not boundary geometry" in the legend or source drawer.

Do not use scored polygon choropleths until a boundary source is chosen, license-checked, and documented.

### Point Encoding

Each point can carry three simultaneous meanings:

1. Fill color: active score layer.
2. Primary footprint: fixed-size presence mark; evidence density is carried by the eight ordered score-input positions and does not shrink a geography's visual importance.
3. Ring or pattern: monitoring/reporting status.

Correction and redesign note:

- `TASK-048` replaced the ambiguous `included_indicator_count` with explicit score-input, context-only, and total trace counts. Responsibility context remains visible in trace data but is never described as a score input.
- The next evidence mark does not use radius for evidence density. It keeps a fixed overall footprint and renders eight stable input positions, missing positions as open cuts, a detached context tick, and monitoring state on the outer edge.

Initial size guidance:

- Test a restrained range before locking size. Start around 8px to 18px on desktop and 9px to 20px on mobile.
- Avoid the 7px to 24px range unless visual QA shows it does not overpower color or make low-evidence places look unimportant.

Post-TASK-042 design direction:

- Literal Natural Earth island geometry is valuable context, but it is too small to be the primary score mark at Pacific-basin zoom. Atoll geographies such as NR, TV, KI, and MH can become nearly invisible if land area carries the whole encoding.
- `TASK-043` restored a guaranteed-size primary data mark anchored to the scored centroid. Treat it as a "presence" mark: score color, evidence size/intensity, and monitoring/reporting status remain legible before land texture is considered.
- Natural Earth land should become secondary texture or context inside/under the presence mark where available. It should not be the only thing that carries the data encoding, and it still must not imply official boundaries.
- The selected viewfinder from TASK-035 is retired. Selected state now relies on the guaranteed-size presence mark and selected bloom rather than framing empty water.
- `TASK-046` moved official-data visibility before the formula in the guided tour and kept JSD as a late selected-detail beat. `TASK-047` added restrained selected-only neighbor arcs. Keep them only if owner visual QA agrees they read as official-data profile similarity rather than physical connection, causality, migration, shared risk, or decorative network.

Selection state:

- Do not use another data-like ring for selection because rings already encode reporting status.
- Use a bracket, halo offset, label callout, or short leader line for selection.
- TASK-035 accepted treatment: a viewfinder frame of four achromatic corner brackets around a fixed geographic window (about 1.6 degrees, pixel-clamped), never fitted to land, with a dotted tick from the circle edge to the nearest visual island and an on-surface note "map area, not territory". TASK-038 grouped land polygons to their nearest scored centroid for selected-place highlighting only. TASK-039 then made anchored island shapes inherit score/status styling and hide centroid circles once land context loads. TASK-043 supersedes that visual direction: the viewfinder is removed, guaranteed-size presence marks carry the primary score/status symbol, and Natural Earth land stays as subdued texture/context so atolls are not under-inked by their tiny land area.

Hover/focus state:

- Desktop hover may preview name and active score.
- Mobile must use tap/selection, not hover.
- Keyboard focus must reach points through list or step-through controls if direct map keyboard navigation is impractical.

## Layer Hierarchy

### Default Layer

Adaptation gap score:

- Field: `adaptation_gap_score`.
- Purpose: thesis entry point.
- Caveat: comparative screen, not rank of need.

### Primary Comparison Layers

Climate pressure:

- Field: `climate_pressure_score`.
- Purpose: expose one side of the gap.

Visible capacity:

- Field: `capacity_score`.
- Purpose: expose the other side of the gap.
- Caveat: capacity is a proxy from official datasets, not full readiness.

### Signature Overlay

Monitoring/data visibility:

- Source: `eda_monitoring_gap.csv`.
- Key fields: `monitoring_reporting_status`, `monitoring_coverage_tier`, `monitoring_quadrant`, `story_priority`, `missing_reporting_caveat`, `proxy_caveat`.
- Purpose: show where high apparent gaps intersect reported-zero or missing monitoring records.

### Secondary Layers

Uncertainty:

- Source: `eda_rank_volatility.csv`.
- Key fields: `rank_range`, `scenario_rank_min`, `scenario_rank_max`, `robustness_label`.
- Purpose: prevent leaderboard reading.

Subregion / spatial typology:

- Source: `eda_spatial_typologies.csv`, `eda_subregion_comparisons.csv`.
- Purpose: let users inspect regional texture.
- Caveat: statistical grouping, not cultural or political boundary.

Evidence fingerprint divergence:

- Source: `eda_evidence_fingerprints.csv`, `eda_pairwise_jsd.csv`, `eda_similarity_neighbors.csv`, and `divergence_summary.json`.
- Default: off until a geography is selected.
- Primary metric: base-2 Jensen-Shannon divergence, bounded from 0 to 1.
- Purpose: show which geographies have similar official-data evidence profiles and where similar gap scores hide different profiles.
- Interaction rule: anchor the view on a selected geography; do not show a global similarity leaderboard.
- Required caveat: "Similarity means official-data profiles look alike under this method; it does not mean the places share the same vulnerability, lived experience, or policy need."
- Component families: pressure, visible capacity, data visibility, rank fragility, missing data, and monitoring reporting gap. Missingness/status components are visible evidence, not smoothing residue.
- KL divergence is not required for public UI interpretation.

### Optional Layer

Outlook:

- Source: `eda_outlook_interpretation.csv` and app outlook fields.
- Default: off.
- Rule: `show` rows may render normally; `show_with_strong_caveat` rows render only with visible caveat styling; `withhold` rows do not render as map marks and are explained as withheld.
- Caveat: stress-test interpretation, not forecast.

### Do Not Build As Map Layers In V1

- Global rank leaderboard.
- Responsibility/emissions map ramp.
- Boundary choropleths without reviewed boundaries.
- Withheld outlook rows as normal map marks.
- JSD/KL clusters as natural regions or causal groups.

## Missingness And Monitoring Grammar

Monitoring states should be visually and verbally distinct.

| `monitoring_reporting_status` Value | Example Geographies | Visual Treatment | Required Copy |
| --- | --- | --- | --- |
| `reported_positive_latest_count` | TV and other visible-monitoring cases | filled or standard ring | "Latest official monitoring row is present; count may still omit station quality, continuity, siting, and reporting completeness." |
| `reported_zero_latest_count` | PN, NR, NU | hollow or dashed ring | "Latest official monitoring row reports 0; verify source semantics before interpreting this as no monitoring infrastructure." |
| `missing_monitoring_dataset_row` | AS, WF, MP, GU | dotted ring plus hatch or broken outline | "No monitoring rows in processed official data; treat as a reporting gap, not confirmed absence." |

The signature overlay can dim score color to grayscale and emphasize reporting rings, but the everyday score map should still carry subtle evidence-density and reporting-status cues.

## Country Detail Panel

Field order:

1. Geography name and status/context note.
2. Active story label or selected layer title.
3. Adaptation gap score with rank-range chip.
4. Pressure versus capacity mini comparison.
5. Compact evidence strips for pressure/capacity balance and rank fragility.
6. Evidence density: included indicators, dataset count, row count.
7. Monitoring/reporting status with caveat.
8. Evidence fingerprint summary and nearest neighbors, if the similarity mode ships in the app.
9. Top pressure signals and capacity signals.
10. Indicator trace drawer.
11. Responsibility context, if relevant, labeled context-only.
12. Outlook snippet, only when selected and allowed.
13. Source links and method caveats.

TASK-036 regroup: the thirteen fields above now render as three reading groups - the score (name, story label, score block with rank band, at-a-glance strip), "The two sides of the score" (pressure/capacity bars plus strongest signals with a percentile explainer), and "What the record shows" (monitoring status, indicator count with thin-evidence caution, trace drawer). No field was removed; headers use the guided tour's spoken register.

Panel rules:

- Caveats sit beside the number or label they qualify.
- No bare rank appears without rank range or robustness label.
- Missingness is a visible state, not only a footnote.
- Detail panel copy should use "visible capacity," "proxy," "reporting gap," and "stress test" consistently.

## Guided Tour

The tour is the default first-reading path and always leaves the map visible. It behaves like a scroll-led atlas mode, not a separate article above the atlas.

The free-explore atlas remains available through a persistent "Explore freely" control and as the final state after the guided path.

Accepted scroll-tour steps:

1. Open on the gap.
2. Pull pressure and capacity apart.
3. Anchor NR and contrast TV so high gap is not conflated with data silence.
4. Open "Where the Data Goes Quiet" and surface PN, NR, AS, WF.
5. Show rank fragility with MH or another high-movement example.
6. Show evidence fingerprints only as selected-place nearest-neighbor detail, not as a shipped global map layer.
7. Explore freely with current map state carried into the full controls.

Next-redesign replacement:

1. What the map can see.
2. Where the record breaks.
3. The gap has two sides.
4. Similar scores, different records.
5. The order does not hold still.
6. Return the marks to geography and hand off to Explore freely.

JSD does not receive a guided scene in the replacement. Exact neighbors remain selected-place panel evidence in free exploration.

Tour controls:

- Scroll rail plus stepper with next/back and skip.
- Persistent "Explore freely" escape hatch.
- Each step names the active layer and evidence source.
- Reduced-motion mode should use immediate state changes, not animated transitions.
- Keyboard navigation should advance/reverse beats without requiring scroll wheel precision.

## Color Role Ledger

These are roles, not final locked colors. Claude should make this beautiful, but not by breaking the roles.

| Role | Purpose | Draft Direction | Notes |
| --- | --- | --- | --- |
| Ocean / map context | orientation | deep muted blue-green or charcoal ocean | quiet enough for points and labels |
| Land / context geometry | orientation | low-contrast neutral | do not compete with points |
| Gap magnitude | ordered score | warm sequential ramp | avoid alarm-red dominance |
| Pressure magnitude | ordered score | cool blue sequential ramp | distinct from gap |
| Capacity magnitude | ordered score | green or teal sequential ramp | do not imply "safe" without caveat |
| Missing/reporting status | data quality state | stroke, dash, hatch, shape | separate from score color |
| Uncertainty | rank movement | neutral to purple or neutral to amber | test for colorblind accessibility |
| Similarity/divergence | selected-geography comparison | restrained sequential ramp or stroke intensity | never a global rank ramp |
| Selection | interaction state | callout, bracket, halo, label | not another data ring |
| Caveat/warning | interpretive caution | muted amber or icon+text | never only color |
| Disabled/withheld | unavailable/withheld layer | low-opacity gray plus text | explain why |

Color QA:

- WCAG AA for text.
- At least 3:1 contrast for meaningful non-text marks.
- Grayscale check.
- Color-deficiency check.
- No rainbow ramps.
- No decorative glow unless mapped to focus/selection.

## Typography And Tone

Typography direction:

- Body and UI: highly legible system sans-serif with tabular numerals; do not declare an unloaded webfont.
- Display: optional characterful serif or restrained display face for tour claims, used sparingly.
- Current implementation uses explicit CSS font variables for the system sans stack and restrained Georgia display headings.

Chrome direction:

- Keep the map as the primary surface: floating controls should be useful, compact, and visually quiet.
- Prefer shared translucent chrome treatments over bright dashboard cards.
- Do not restore the removed explore-mode metrics strip unless it carries a concrete reader decision that is not already visible in the map, legend, or detail panel.

Tone:

- careful,
- clear,
- Pacific-specific,
- not fatalistic,
- not bureaucratic,
- not blame-driven.

Avoid:

- "worst,"
- "most vulnerable,"
- "definitive,"
- "prediction,"
- "absence of infrastructure" when describing missing rows,
- moral ranking language.

## Desktop Layout Contract

Desktop target:

- Primary design around 1280px to 1440px wide.

Layout:

- Full-bleed map.
- Top-left title and active layer chip.
- Left or top-left layer controls, compact.
- Right side detail panel around 360px to 420px when open.
- Bottom-left legend, compact and adjacent to map marks.
- Bottom-right method/source controls and compact scroll-tour progress/escape controls.

Panel behavior:

- Closed by default.
- Opens on selection or tour step.
- Does not cover the selected point if avoidable.
- Dims non-selected points during country inspection.

Legend behavior:

- Always explains fill, size, and ring.
- Adapts to active layer.
- Keeps missingness key visible or one tap away.

## Mobile Layout Contract

Mobile portrait target:

- 360px to 430px wide.

First view:

- Map remains visible before deep controls.
- Active layer and caveat visible.
- Bottom sheet collapsed but discoverable.

Mobile structure:

- Map top around 50vh to 60vh.
- Bottom sheet for layer controls and country details.
- Legend collapses into a chip or short expandable key.
- Tour stepper docks above bottom sheet or inside sheet header.

Next-redesign mobile replacement:

- Use a sticky map around 42–48svh during geographic scenes.
- Put story sections in normal document flow so dense comparisons cannot be covered by fixed controls.
- Use a compact exploration toolbar after the handoff; keep the country-detail sheet separate from guided scene copy.
- Render Nauru/Tuvalu and rank bands as vertically complete static/stepped figures at narrow widths.

Mobile interaction:

- Tap selects points.
- Previous/next selected geography control helps users avoid tiny tap targets.
- Layer switches use segmented controls or concise menus.
- Search can exist later, but keyboard must not hide the only apply/close action.

Mobile QA:

- No hover-only values.
- Touch targets should be at least 44px where practical.
- Text and caveats remain legible without horizontal scrolling.
- Opening controls should not permanently hide the map.
- Reduced-motion mode must preserve every tour step.

## URL And State

Minimum shareable state:

- guided/explore mode,
- active layer,
- selected geography,
- active scene,
- coverage/uncertainty view,
- outlook on/off and horizon if implemented.

The back button should not trap users inside panels or tour states.

`TASK-057` now provides dependency-free query parsing/serialization and Back/Forward behavior for the functioning five-scene redesign, including guided/explore mode, scene, layer, view, place, and outlook state. No divergence map mode or subregion filter is part of that contract.

## Accessibility Contract

Essential information must not depend on:

- hover,
- color alone,
- animation,
- exact point tapping,
- a hidden source drawer.

Required accessibility surfaces:

- keyboard-reachable layer controls,
- keyboard-reachable country list or selected-geography stepper,
- visible focus states,
- reduced-motion behavior,
- text alternative for the active map state,
- source and caveat text in HTML, not baked into images,
- mobile hit target review.

Map alt summary pattern:

> Map of 22 Pacific geographies shown as centroid points. Active layer: [layer]. The map is a comparative screen, not a definitive ranking. Selected geography: [name], [short score/caveat summary].

## Source And Method Drawer

The drawer should contain:

- project thesis,
- score method summary,
- dataset list,
- geometry policy,
- monitoring proxy caveat,
- rank-fragility explanation,
- evidence-fingerprint/JSD explanation if the layer ships,
- outlook explanation,
- responsibility-context explanation,
- source and license notes,
- claims the app will not make.

The drawer is not allowed to be the only place where load-bearing caveats appear.

## Data Binding Contract

| UI Surface | Data File | Required Fields |
| --- | --- | --- |
| Gap map | `app/public/data/geographies.json` | `geo_code`, `name`, `adaptation_gap_score`, `score_input_indicator_count`, `context_indicator_count`, `trace_indicator_count`, `score_input_presence`, `score_status` |
| Pressure/capacity map | same | `climate_pressure_score`, `capacity_score` |
| Centroid geometry | same | `centroid.lon`, `centroid.lat`, `geometry_status` |
| Country panel | `app/public/data/country_details.json` | geography fields, scores, `indicators[]`, source refs |
| Monitoring status | `app/public/data/geographies.json` | `monitoring.reporting_status`, `monitoring_quadrant`, `story_priority`, caveats |
| Rank chip | `artifacts/tables/eda_rank_volatility.csv` or derived app JSON | `rank_range`, `scenario_rank_min`, `scenario_rank_max`, `robustness_label` |
| Evidence fingerprint similarity | `eda_similarity_neighbors.csv`, `eda_pairwise_jsd.csv`, `eda_evidence_fingerprints.csv` or derived app JSON | selected `geo_code`, neighbor `geo_code`, `jsd_distance`, `similarity_band`, profile family, caveat |
| Subregion filter | `eda_spatial_typologies.csv`, `eda_subregion_comparisons.csv` | `subregion`, typology, counts, caveats |
| Outlook | `eda_outlook_interpretation.csv`, nested `outlook` in app data | `display_recommendation`, `target_year`, `scenario`, projected scores, caveats |

Implementation should eventually package EDA-derived story tables into app-ready JSON rather than fetching CSVs directly from `artifacts/`.

## Component Inventory

Likely React components:

- `AtlasMap`
- `atlasMapModel`
- `LayerControls`
- `Legend`
- `CountryPanel`
- `IndicatorTrace`
- `RankChip`
- `FingerprintPreview`
- `MissingnessKey`
- `MethodDrawer`
- `StoryRail`
- `StoryBeat`
- `BeatProgress`
- `SubregionFilter`
- `OutlookToggle`
- `SourceNote`

Renderer ownership:

- The current app uses MapLibre for the map canvas, Natural Earth land context, generated centroid point source, and graticule lines. React overlays still own direct labels, hatching/dashed monitoring cues, selected brackets, graticule labels, and accessible geography hit targets.
- React owns controls, panel, legend, drawer, story rail, beat state, and source/caveat copy.
- Labels and caveats should remain editable HTML/SVG overlays, not raster text.

## Motion Contract

Allowed motion:

- short layer cross-fades,
- selected-point emphasis,
- tour step transitions,
- optional uncertainty re-encoding transition.
- optional selected-anchor similarity re-encoding transition.

TASK-044 added the first evidence-bearing motion pass: native MapLibre paint transitions for layer re-encodes, selected-mark focus, priority emphasis, and anchored-land texture, plus subtle selected-camera focus. Reduced-motion mode collapses map motion to zero and disables the added CSS transitions. Decorative ocean shimmer, alarm pulses, and rising-water metaphors remain out unless a matching data layer makes them honest.

Motion verb:

- reveal,
- compare,
- focus,
- re-encode.

Shipmap is the reference for evidence-bearing motion: movement is acceptable only when each moving state represents a unit, time step, transition, or selected comparison that the reader can explain.

Do not use:

- decorative particle motion,
- wave/ribbon atmospherics,
- pulsing alarm effects,
- cinematic intro animation that delays the map.

Reduced motion:

- replace transitions with immediate state changes,
- preserve all labels and caveats.

## Visual Concept Prompts For Claude

Claude should create or revise visual concepts after reading `STORY_BRIEF.md`, this design brief, `DATAVIZ_INSPIRATION_AUDIT.md`, and `WINNER_SCROLL_TOUR_AUDIT.md`.

### Large-Screen Concept Prompt

Design a large-screen concept for the Pacific Adaptation Gap Atlas, a map-first interactive GIS web visualization with a scroll-led default reading path. The first viewport is the actual atlas, not a landing page. Show a full-bleed Pacific map with Natural Earth land context, centroid points, and a narrative scroll rail that advances one evidence claim at a time. The active opening layer is adaptation gap. Fill color encodes the active score, point size subtly encodes included indicator count, and ring/dash/hatch styling encodes monitoring/reporting status. Include compact layer controls, a useful legend, method/source drawer access, scroll-tour progress, an "Explore freely" escape hatch, and a right-side country detail panel state that appears on selection or scroll beat. The concept must preserve caveats near the claims they qualify: comparative screen, not a ranking of need; Natural Earth land context with centroid score geometry, not official boundaries; reported zero and missing rows are not infrastructure absence. Make it visually polished and competition-ready, but restrained and evidence-bearing. Avoid generic dashboards, decorative gradients, bokeh, cinematic wallpaper, flags as decoration, and any choropleth boundary styling.

### Mobile Portrait Concept Prompt

Design a mobile portrait concept for the same atlas at 390px width. The map must remain visible on first load, with active layer title and caveat visible. Use a bottom sheet for layer controls and country details. Show how a user taps a centroid, opens a concise country panel, sees the rank-fragility chip, and can access the missingness legend. Essential information must not depend on hover. Preserve the same story as desktop: adaptation gap plus official-data visibility, with caveats adjacent to claims. Avoid squeezing the desktop layout into a tiny dashboard.

### Optional Mobile Landscape Prompt

Design a mobile landscape concept only if the map controls or scroll-tour rail need more horizontal room. Preserve the map as the dominant surface, keep the bottom or side sheet compact, and show how touch targets remain usable without hiding caveats.

## Claude Visual Review Criteria

Approve a visual concept only if:

- it uses the inspiration audit as principle guidance without copying a reference project,
- the first screenshot explains the atlas without hover,
- the map is the main surface,
- caveats are visible near active claims,
- the legend teaches fill, size, and reporting status,
- missingness is distinguishable from low score,
- mobile is a sibling design, not a squeezed desktop crop,
- no decorative atmosphere competes with evidence,
- color roles remain distinct,
- source/method access is visible,
- selected geography detail is readable.

Reject or revise a concept if:

- it looks like a generic dashboard,
- it hides the map behind cards,
- it treats missing data as merely gray or empty without explanation,
- it creates leaderboard vibes,
- it implies boundaries we do not have,
- it makes outlook feel predictive,
- it uses one saturated palette for everything,
- it makes caveats feel like legal fine print.

## Build QA Checklist

Before claiming the app design is implemented:

- desktop screenshot preserves the story and caveats,
- mobile portrait screenshot preserves the story and caveats,
- color contrast passes text and meaningful-mark checks,
- color-deficiency check preserves score/missingness distinction,
- all ranks show rank range or uncertainty,
- every score has trace/source access,
- evidence-fingerprint similarity, if enabled, has a visible anchor geography and caveat,
- monitoring missingness copy uses the correct reporting-gap language,
- source drawer is reachable by keyboard,
- controls are usable at 360px width,
- reduced-motion mode keeps all tour beats,
- static screenshot of default view still communicates the thesis.

## Out Of Scope For V1 Design

- Boundary polygon choropleth for scored geographies.
- Expanded non-official overlays.
- New index methodology.
- JSD/KL similarity as a primary story layer.
- Live data fetching.
- Bilingual interface unless explicitly requested.
- Automated funding, readiness, or vulnerability recommendations.
- A full country leaderboard.

## Final Design Principle

The design should make uncertainty useful. The atlas wins if readers understand not only where the adaptation gap appears wide, but also where the official record is strong, thin, missing, fragile, or caveated.
