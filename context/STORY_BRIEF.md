# Story Brief

## Status

Task: `TASK-018`

Status: first-build story synthesis plus the active evidence contract for **The Shape of What We Know**. `TASK-050` replaced the nested seven-beat scroller with native document flow, and `TASK-051` supplied the five-scene evidence spine. Owner QA on 2026-07-11 kept those five evidence scenes but added a fullscreen premise prologue and promoted scenes 4 and 5 to viewport takeovers. The complete revision is `context/design-concepts/task-058-fullscreen-story-stage.md`; older seven-beat notes remain historical rationale only.

Source basis:

- TASK-018 Claude/Codex storyboard brainstorm, now consolidated into this brief and the design brief
- `TASK-046` guided-story tightening pass
- `context/ANALYSIS_BRIEF.md`
- `artifacts/provenance/eda_summary.json`
- `artifacts/tables/eda_country_story_labels.csv`
- `artifacts/tables/eda_monitoring_gap.csv`
- `artifacts/tables/eda_rank_volatility.csv`
- `artifacts/tables/eda_spatial_typologies.csv`
- `artifacts/tables/eda_subregion_comparisons.csv`
- `artifacts/tables/eda_outlook_interpretation.csv`
- `context/DATAVIZ_INSPIRATION_AUDIT.md`

## Narrative Decision

The atlas should use the broader Adaptation Gap frame as the spine, with official-data visibility and monitoring gaps as the signature diagnostic interaction.

The strongest story is:

> Across 22 Pacific geographies, climate pressure and visible adaptation capacity are unevenly matched, and so is the official data behind the comparison. This atlas maps where the gap looks widest and is honest about where the record falls silent.

The next guided opening states that argument before teaching the evidence grammar:

> Climate pressure is not the same as adaptation capacity.

> Across 22 Pacific places, official records show both unevenly.

> This atlas maps the gap between them—and makes the missing evidence visible.

The necessary opening caveat remains visible but subordinate: visible capacity is what the available official datasets can show, not full readiness or lived adaptive capacity.

This is stronger than a simple ranking story because the rank evidence is fragile. It is stronger than a monitoring-only story because monitoring is one proxy, not the whole adaptation system. It is stronger than a responsibility-only story because responsibility-context indicators are context fields, not score drivers. It is stronger than an outlook story because the outlook is a stress test, not a forecast.

Historical baseline through `TASK-047`:

- The guided tour now opens on what the map can see, immediately moves into uneven official monitoring visibility, then explains the score formula. This keeps the distinctive data-visibility tension close to the opening without hiding the method.
- JSD/evidence-profile similarity remains a late guided beat because it helps explain official-data profile shape after the reader has already seen gap, thin records, the formula, one concrete place contrast, and rank fragility. It remains selected-anchored and must not become a global similarity leaderboard.
- `TASK-047` adds dashed selected-only neighbor arcs in the guided fingerprint beat and free exploration. The arcs mean official-data profile similarity only; the panel remains the authoritative place for exact JSD values and caveats.

Current evidence spine after `TASK-051`, retained by `TASK-058` after the new premise prologue:

- `SCENES` contains exactly five ordered scene IDs: `what-the-map-can-see`, `where-the-record-breaks`, `the-gap-has-two-sides`, `similar-scores-different-records`, and `the-order-does-not-hold-still`.
- Each scene owns one claim, caveat, source line, visual operation, and canonical map state. The handoff copy sits outside the scene list and precedes the `Explore freely` action.
- Guided fingerprint content, the seven-beat method/uncertainty repetition, and the static `FingerprintPreview` figure are retired. JSD remains selected-place panel evidence in exploration until TASK-055 removes map connectors.

## Approved Next Narrative: The Shape Of What We Know

The next version keeps the product title **The Pacific Adaptation Gap Atlas** and gives the narrative a clearer identity:

> The Shape of What We Know

Its governing idea is:

> Official records illuminate the Pacific unevenly. Those gaps in the record change what the atlas can responsibly compare, rank, and conclude.

This direction supersedes the current seven-beat order for the next redesign. It does not erase the scientific and interaction lessons that made the current app credible.

The guided spine becomes five scenes:

1. **What the map can see** — reveal all 22 places with equal overall visual presence.
2. **Where the record breaks** — recede score color and foreground missing score inputs plus reported-zero/missing-row monitoring.
3. **The gap has two sides** — separate climate pressure and visible capacity so the mismatch becomes a visual distance.
4. **Similar scores, different records** — compare Nauru and Tuvalu as aligned evidence portraits.
5. **The order does not hold still** — rearrange the same marks into rank bands and highlight Marshall Islands’ 4–19 span.

The story then returns the marks to the Pacific and closes:

> This map cannot tell us who needs help most. It can show us where to look—and where the record asks us to look harder.

Story simplifications:

- JSD leaves the guided spine and remains selected-place panel evidence in free exploration.
- Dashed JSD map arcs are planned for removal because they can read as physical or causal connection.
- Uncertainty is explained once, through the rank-band figure, rather than repeated in prose and a callout.
- The method remains visible but no longer consumes a separate guided scene.
- Every scene has one claim, one evidence operation, one necessary caveat, and one source line.

The full copy, visual, layout, motion, mobile, and ethical contract lives in `context/ARTISTIC_REDESIGN_BRIEF.md`.

## Story Contract

One-sentence claim:

The Pacific Adaptation Gap Atlas is a map-first tool for inspecting where current official climate-pressure, observed-stress, adaptation-capacity, monitoring, and missingness signals appear most out of balance.

Human stakes:

Pacific geographies face climate pressures with uneven capacity signals and uneven official visibility. The atlas should help readers see the mismatch without implying a definitive rank of need, risk, readiness, or funding priority.

Geography and time span:

- Geography: 22 Pacific geographies in the current processed dataset.
- Time basis: latest available official observations for the baseline Adaptation Gap Index; historical series for outlook diagnostics where eligible.
- Geometry: Natural Earth land context for orientation; centroid fallback for scored/selectable geographies until a scored-boundary source is selected and documented.

Primary evidence layer:

- `adaptation_gap_score` from `artifacts/tables/adaptation_gap_index.csv` and app-ready centroid data.

Supporting evidence layers:

- pressure and capacity scores
- indicator trace rows
- monitoring reporting status
- rank volatility
- evidence fingerprint divergence from `TASK-019`
- spatial typologies and subregion comparisons
- optional outlook interpretation
- responsibility-context indicators in panel text only

What is known directly:

- Which official datasets and rows feed each score.
- Which geographies have broad, moderate, thin, partial, or missing official-data coverage under the current pipeline.
- Which monitoring-network rows report positive, zero, or missing processed observations.
- Which ranks move under simple sensitivity tests.

What is estimated or modeled:

- The Adaptation Gap Index is a comparative screen using percentile scoring and pressure-minus-capacity logic.
- Evidence-profile similarity/divergence is an information-theory diagnostic from `TASK-019`, not a new ground-truth grouping.
- The outlook is a transparent stress test based on simple trend and capacity scenarios.
- Spatial typologies are rule-based descriptors, not statistical clusters.

What is schematic or illustrative:

- Natural Earth land context is visual orientation only; centroid point placement stands in for scored/selectable geography until a boundary source is chosen.
- Layer labels such as "high gap" and "low visible capacity" are story screens, not causal diagnoses.

What the visual will deliberately not imply:

- It will not claim which place is most vulnerable, most deserving, or least prepared.
- It will not claim missing monitoring rows mean no monitoring infrastructure exists.
- It will not claim outlook rows are forecasts.
- It will not rank emissions responsibility as blame.
- It will not treat subregions as cultural or political boundaries.
- It will not claim that similar evidence fingerprints mean the same vulnerability, lived experience, or policy need.

## Why This Story Wins

The story has a clear visual hook: the map shows both the apparent gap and the uneven visibility of the official record. The monitoring/data-visibility view turns missingness and monitoring uncertainty into something readers can inspect instead of something hidden in a footnote.

The story is also honest about the evidence. The rank-volatility table labels 19 of 22 geographies fragile and 3 sensitive under leave-one-indicator stress tests. A leaderboard would overclaim. A guided atlas that exposes rank movement, indicator counts, and reporting status is more defensible and more distinctive.

## Interaction Pattern Update

The Dataviz Inspiration audit reinforces the story direction:

- Default mode should become a map-first guided scroll atlas. The first screen should resemble a working atlas surface, not a hero page or prelude.
- Guided mode should use a Pudding-style map-anchored claim and the Pacific Dataviz winner audit pattern: direct labels, a few exemplar geographies, evidence beside the marks, and scroll beats that update the same atlas map.
- Selected-place comparison should follow the Dataista pattern: choose one geography as an anchor, then reveal a second comparator or nearest-profile list. This is the preferred shape for Evidence Fingerprint Divergence if it ships in the app.
- Country panels can borrow the compact-supporting-visual idea from climate stripes and Bussed Out: small rank, pressure/capacity, or evidence-density strips that help the map claim without becoming the main visual identity.
- Human stakes can be introduced through guided questions, but the analytical map must appear immediately.

The 2026-06-30 winner audit in `context/WINNER_SCROLL_TOUR_AUDIT.md` changes the interaction recommendation: keep the explorer, but lead with scroll. Recent custom winners use vertical pacing to earn attention before deeper interaction. The atlas should do the same without becoming a decorative article.

## Story Confidence

High confidence:

- The project can support a comparative adaptation-gap screen across 22 geographies.
- The project can show that official-data visibility varies by geography and dataset.
- The project can distinguish reported-zero monitoring rows from missing monitoring rows.
- The project can show that rank order is unstable and should not be treated as definitive.

Medium confidence:

- The project can use spatial typologies and subregion filters as descriptive exploration aids.
- The project can use selected country exemplars to teach the score, missingness, and uncertainty logic.
- The project can show responsibility context in country panels without turning it into blame scoring.
- The project uses JSD-based evidence fingerprints to explain selected-place nearest official-data profile neighbors after app-data wiring and QA.

Low confidence or optional:

- Future-facing outlook layers should be optional and gated by `eda_outlook_interpretation.csv`.
- Boundary polygons should wait for source selection and licensing review.
- Expanded datasets or non-official overlays should not change the baseline story without a separate methodology review.

## Main Arc And Supporting Roles

Main spine:

- Adaptation Gap Atlas: where climate pressure and visible capacity appear out of balance.

Signature interaction:

- Monitoring and data visibility: where high apparent gaps coincide with reported-zero or missing monitoring records.

Supporting context:

- Responsibility indicators: explain responsibility mismatch in panel copy only.
- Rank uncertainty: stop the map from becoming a leaderboard.
- Evidence fingerprint divergence: compare the shape of official-data profiles without claiming causal similarity.
- Spatial typologies: help readers compare regional patterns without claiming clusters or adjacency.
- Outlook: optional stress-test context, off by default, never forecast language.

## Historical Seven-Beat Baseline

The following beat descriptions document the retired pre-redesign story and remain useful for understanding what TASK-051 removed. They are not the current guided order; use `app/src/lib/scenes.ts` and `context/ARTISTIC_REDESIGN_BRIEF.md` for the active story.

### Beat 1: What The Map Can See

- User action: lands directly on the Pacific map and starts the guided scroll path.
- Layer: adaptation-gap centroid points.
- Panel state: compact intro or collapsed detail panel.
- Evidence: `adaptation_gap_index.csv`, `eda_country_story_labels.csv`.
- Caveat placement: under the layer title.
- Required copy: "The record itself is uneven. This is a comparison tool, not a ranking of who needs help most."
- Takeaway: the map shows what official records can currently show, not a full verdict on need.

### Beat 2: Some Records Barely Show Up

- User action: opens the monitoring/data-coverage layer before the formula is explained.
- Layer: monitoring quadrant, reporting status rings, and coverage marks.
- Panel state: "reported zero" versus "missing row" explanation.
- Evidence: `eda_monitoring_gap.csv`.
- Caveat placement: primary panel, not just source drawer.
- Required copy: "Missing numbers mean the record is thin, not that nothing is out there."
- Takeaway: data absence is an inspectable part of the story from the start.

### Beat 3: Pull Pressure And Capacity Apart

- User action: toggles between climate pressure and visible capacity.
- Layer: same centroid geography, fill color changes by active score.
- Panel state: pressure-versus-capacity mini comparison for selected geography.
- Evidence: `eda_country_drivers.csv`, `eda_country_story_labels.csv`.
- Caveat placement: near capacity score.
- Required copy: "Capacity here is a proxy from official datasets, not a full measure of readiness."
- Takeaway: the gap is a difference between two imperfect but inspectable sides.

### Beat 4: Inspect A Place

- User action: selects a point, with Nauru and Tuvalu as the early contrast.
- Layer: selected point emphasized; other points dimmed.
- Panel state: full country detail.
- Evidence: `country_details.json`, `eda_indicator_forensics.csv`, `eda_monitoring_gap.csv`, `eda_rank_volatility.csv`.
- Caveat placement: rank chip and trace section.
- Required copy: "Similar-looking scores can sit on very different records."
- Takeaway: every score can be traced to rows, sources, indicators, and caveats.

### Beat 5: Show Rank Fragility

- User action: toggles uncertainty view or opens a rank chip.
- Layer: point fill or overlay changes to rank range / robustness.
- Panel state: rank range and sensitivity note.
- Evidence: `eda_rank_volatility.csv`, `index_sensitivity.csv`.
- Caveat placement: next to every rank.
- Required copy: "This view exists so the gap map cannot be read as a fixed scoreboard."
- Takeaway: the atlas earns trust by showing uncertainty.

### Beat 6: Compare Evidence Profiles

- User action: selects a geography and opens "similar evidence profiles."
- Layer: selected-place detail shows nearest evidence-profile neighbors. A selected-only map connector treatment may be tested later, but no global JSD map ramp or all-to-all link web should ship by default.
- Panel state: nearest evidence-profile neighbors and a compact fingerprint summary.
- Evidence: `eda_evidence_fingerprints.csv`, `eda_pairwise_jsd.csv`, `eda_similarity_neighbors.csv`, and `divergence_summary.json`.
- Caveat placement: inside the comparison panel and method drawer.
- Required copy: "Similarity means official-data profiles look alike under this method; it does not mean the places face the same risks or need the same actions."
- Takeaway: the atlas can compare what kind of gap a place has, not just how high the score is.

### Beat 7: Explore Freely

- User action: exits guided scroll into the atlas controls.
- Layer: preserve the current selected layer and geography, rather than resetting.
- Panel state: user can keep the selected place open or collapse into map-only mode.
- Evidence: all app-wired public data layers.
- Caveat placement: active layer caveat remains visible.
- Takeaway: the scroll story teaches the map; the atlas then lets readers ask their own follow-up questions.

## Layer Priority

Default first layer:

- Adaptation gap score. It is the thesis and the entry point.

Primary comparison layers:

- Climate pressure score.
- Visible capacity score.

Signature diagnostic layer:

- Monitoring/data visibility, including the high-gap/low-monitoring quadrant and reporting-status distinction.

Secondary diagnostic layers:

- Rank fragility / uncertainty.
- Evidence fingerprint divergence from `TASK-019`; compare profiles from a selected geography, not a global leaderboard.
- Subregion / spatial typology.
- Indicator trace inside the side panel.

Optional or hidden by default:

- Outlook stress test.
- Responsibility context.

Do not show in V1:

- Polygon choropleths without a selected boundary source.
- A global 1-22 leaderboard as a primary surface.
- Responsibility/emissions as a map ramp.
- Withheld outlook rows as normal marks.
- JSD/KL as causal clusters, natural regions, or policy-need groups.

## Exemplar Geographies

| Geography | Role In Story | Evidence | Confidence | Required Caveat |
| --- | --- | --- | --- | --- |
| NR, Nauru | Broad-evidence high-gap exemplar with reported-zero monitoring rows | `eda_country_story_labels.csv`, `eda_monitoring_gap.csv` | Medium-high | Rank is fragile; reported zero needs source-semantics caution. |
| TV, Tuvalu | High-gap exemplar with visible monitoring, showing high gap is not the same as data silence | `eda_country_story_labels.csv`, `eda_monitoring_gap.csv` | Medium | Descriptive high-pressure label; rank movement still applies. |
| AS, American Samoa | High-gap reporting-gap exemplar with no monitoring rows in processed observations | `eda_monitoring_gap.csv`, `eda_coverage_by_dataset.csv` | Medium-low | Missing rows are reporting gaps, not confirmed absence. |
| PN, Pitcairn | Caveat teacher: highest gap score, data-desert flag, thin evidence, withheld outlook | `eda_country_story_labels.csv`, `eda_data_coverage.csv`, `eda_outlook_interpretation.csv` | Low as headline, high as caveat example | Use to teach uncertainty, not "worst place" framing. |
| MH, Marshall Islands | Rank-instability exemplar with largest observed rank range | `eda_rank_volatility.csv` | Medium | Use only for uncertainty, not as a stable rank claim. |
| FJ, Fiji | Lower-relative-gap / high-capacity benchmark for contrast | `eda_country_story_labels.csv`, `eda_spatial_typologies.csv` | Medium-high | Lower relative gap does not mean low risk. |

WF, Wallis and Futuna, should remain available as a second reporting-gap example, but it should not be forced into the headline path because the capacity evidence is thin and the rank range is large.

## Caveat Register

| Claim Surface | Caveat That Must Stay Nearby |
| --- | --- |
| Adaptation gap score | Comparative screen, not a ranking of need, risk, readiness, or funding priority. |
| Rank or rank chip | Most ranks are fragile; rank movement frames uncertainty. |
| Capacity score | Capacity is measured through official proxies, not full readiness. |
| Monitoring count | Counts are proxy coverage and are not normalized by population, land area, coastline, station quality, or hazard exposure. |
| Missing monitoring rows | Reporting gap, not confirmed infrastructure absence. |
| Reported zero monitoring rows | Verify source semantics before interpreting as no infrastructure. |
| Subregion filter | UN M49 statistical grouping, not cultural or political boundary. |
| Spatial typology | Rule-based descriptor, not statistical cluster or causal explanation. |
| Outlook | Stress-test interpretation, not forecast. |
| Responsibility context | Context only, not a score driver or blame ranking. |
| Map geometry | Natural Earth land context is visual only; scores and selections use centroid fallback, not official boundary geometry. |

## Claims We Will Not Make

- "These are the most vulnerable Pacific geographies."
- "This geography needs the most funding."
- "No monitoring rows means there is no monitoring infrastructure."
- "The outlook predicts the future adaptation gap."
- "Subregions explain the score."
- "Emissions context proves blame or responsibility at the geography level."
- "A lower relative gap means a place is safe."
- "The map shows exact island boundaries."

## Remaining Product Decisions

1. `TASK-048` corrected score-input versus context-only counting before the evidence glyph was designed against production data.
2. `TASK-049` approved the evidence-mark grammar before the frontend redesign began; `TASK-058` supersedes its rail dimensions after owner visual QA.
3. The palette, evidence-mark silhouette, context-tick position, type stacks, and 560ms evidence motion remain locked from `TASK-049`; fullscreen stage ownership and responsive scene scale come from `TASK-058`.
4. Outlook remains app-optional and outside the guided five-scene spine.
5. Official scored-geography boundary polygons require a separate source/license/geopolitical review and are not part of `TASK-048` through `TASK-064`.
6. Pacific-language localization and local/community knowledge layers require human review and consent-based collaboration; they are growth paths, not implied scope.

## Handoff To Design

The design should preserve the broader adaptation-gap spine, map-first first view, reported-zero versus missing-row distinction, Nauru/Tuvalu contrast, rank-fragility treatment, evidence contract, and selected-geography panel for JSD. For the next implementation, follow `context/design-concepts/task-058-fullscreen-story-stage.md` and `TASK-059` through `TASK-064`; do not extend either the retired seven-beat rail or the undersized 28rem five-scene rail.
