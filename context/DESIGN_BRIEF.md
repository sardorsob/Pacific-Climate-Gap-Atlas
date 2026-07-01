# Design Brief

## Status

Task: `TASK-018`

Status: semantic design brief plus accepted mockup direction. The current app implements the scroll-led hybrid as a reviewable concept, is wired to generated app data, uses a MapLibre-backed map with Natural Earth visual land context under centroid points, and has completed the `TASK-028` guided story/copy rewrite. Remaining production work is `TASK-027` final visual polish.

Design skill basis:

- `build-web-data-visualization:data-visualization`
- meaning-preserving visual design workflow
- mobile-first responsive visualization
- perception, color, and encoding
- layout hierarchy and self-explanatory UX
- sensitive geopolitical and humanitarian story guardrails
- `context/DATAVIZ_INSPIRATION_AUDIT.md` live reference audit for map, climate, environmental, and selected-geography interaction patterns
- `context/WINNER_SCROLL_TOUR_AUDIT.md` Pacific Dataviz winner audit recommending a scroll-led hybrid

Concept approval status:

- Text contract: accepted as working design context, not final public-facing copy.
- Large-screen mockup concept: implemented for review.
- Mobile portrait mockup concept: implemented for review.
- Mobile landscape concept: optional, recommended if map controls become wide or gesture-heavy.
- Production gate: final visual polish remains open before `TASK-006` can close. Official scored-geography polygon boundaries remain a future source gate outside the completed MapLibre/Natural Earth visual substrate.

Future visual changes should preserve the accepted scroll-led mockup unless the project owner explicitly rejects that direction.

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
| Gap score | `data/processed/app/atlas_geographies.geojson`, `artifacts/tables/adaptation_gap_index.csv` | modeled comparative screen |
| Pressure/capacity scores | same | modeled comparative screen |
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
2. Radius: evidence density through `included_indicator_count`.
3. Ring or pattern: monitoring/reporting status.

Initial size guidance:

- Test a restrained range before locking size. Start around 8px to 18px on desktop and 9px to 20px on mobile.
- Avoid the 7px to 24px range unless visual QA shows it does not overpower color or make low-evidence places look unimportant.

Selection state:

- Do not use another data-like ring for selection because rings already encode reporting status.
- Use a bracket, halo offset, label callout, or short leader line for selection.

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
6. Preview evidence fingerprints as a static labelled analysis-ready idea, not a shipped app layer.
7. Explore freely with current map state carried into the full controls.

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

- Body and UI: highly legible sans-serif with tabular numerals.
- Display: optional characterful serif or restrained display face for tour claims, used sparingly.

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

- active layer,
- selected geography,
- divergence comparison mode and anchor geography, if implemented,
- tour step,
- subregion filter,
- outlook on/off and horizon if implemented.

The back button should not trap users inside panels or tour states.

If URL-state implementation is deferred, record it as a known V1 limitation.

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
| Gap map | `app/public/data/atlas_geographies.geojson` | `geo_code`, `name`, `adaptation_gap_score`, `included_indicator_count`, `score_status` |
| Pressure/capacity map | same | `climate_pressure_score`, `capacity_score` |
| Centroid geometry | same | `geometry.coordinates`, `geometry_status` |
| Country panel | `app/public/data/country_details.json` | geography fields, scores, `indicators[]`, source refs |
| Layer manifest | `app/public/data/layers.json` | layer ids, labels, fields, caveats |
| Monitoring overlay | `artifacts/tables/eda_monitoring_gap.csv` or derived app JSON | `monitoring_reporting_status`, `monitoring_quadrant`, `story_priority`, caveats |
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
