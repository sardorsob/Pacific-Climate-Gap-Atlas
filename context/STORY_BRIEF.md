# Story Brief

## Status

Task: `TASK-018`

Status: final story synthesis for the first atlas build.

Source basis:

- `context/storyboardbrainstorm.md`
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

This is stronger than a simple ranking story because the rank evidence is fragile. It is stronger than a monitoring-only story because monitoring is one proxy, not the whole adaptation system. It is stronger than a responsibility-only story because responsibility-context indicators are context fields, not score drivers. It is stronger than an outlook story because the outlook is a stress test, not a forecast.

## Story Contract

One-sentence claim:

The Pacific Adaptation Gap Atlas is a map-first tool for inspecting where current official climate-pressure, observed-stress, adaptation-capacity, monitoring, and missingness signals appear most out of balance.

Human stakes:

Pacific geographies face climate pressures with uneven capacity signals and uneven official visibility. The atlas should help readers see the mismatch without implying a definitive rank of need, risk, readiness, or funding priority.

Geography and time span:

- Geography: 22 Pacific geographies in the current processed dataset.
- Time basis: latest available official observations for the baseline Adaptation Gap Index; historical series for outlook diagnostics where eligible.
- Geometry: centroid fallback only until a boundary source is selected and documented.

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

- Centroid point placement stands in for geography until a boundary source is chosen.
- Layer labels such as "high gap" and "low visible capacity" are story screens, not causal diagnoses.

What the visual will deliberately not imply:

- It will not claim which place is most vulnerable, most deserving, or least prepared.
- It will not claim missing monitoring rows mean no monitoring infrastructure exists.
- It will not claim outlook rows are forecasts.
- It will not rank emissions responsibility as blame.
- It will not treat subregions as cultural or political boundaries.
- It will not claim that similar evidence fingerprints mean the same vulnerability, lived experience, or policy need.

## Why This Story Wins

The story has a clear visual hook: the map shows both the apparent gap and the uneven visibility of the official record. The signature interaction, "Where the Data Goes Quiet," turns missingness and monitoring uncertainty into something readers can inspect instead of something hidden in a footnote.

The story is also honest about the evidence. The rank-volatility table labels 19 of 22 geographies fragile and 3 sensitive under leave-one-indicator stress tests. A leaderboard would overclaim. A guided atlas that exposes rank movement, indicator counts, and reporting status is more defensible and more distinctive.

## Interaction Pattern Update

The Dataviz Inspiration audit reinforces the story direction:

- Default mode stays map-first. The first screen should resemble a working atlas surface, not a hero page or prelude.
- Guided mode should use a Pudding-style map-anchored claim: direct labels, a few exemplar geographies, and evidence beside the marks.
- Selected-place comparison should follow the Dataista pattern: choose one geography as an anchor, then reveal a second comparator or nearest-profile list. This is the preferred shape for Evidence Fingerprint Divergence if it ships in the app.
- Country panels can borrow the compact-supporting-visual idea from climate stripes and Bussed Out: small rank, pressure/capacity, or evidence-density strips that help the map claim without becoming the main visual identity.
- Human stakes can be introduced through guided questions, but the analytical map must appear immediately.

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
- The project can use JSD-based evidence fingerprints to explain similarity and difference between official-data profiles, pending app-data wiring and visual QA.

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

## Storyboard Beats

### Beat 1: Open On The Gap

- User action: lands directly on the Pacific map.
- Layer: adaptation-gap centroid points.
- Panel state: compact intro or collapsed detail panel.
- Evidence: `adaptation_gap_index.csv`, `eda_country_story_labels.csv`.
- Caveat placement: under the layer title.
- Required copy: "Comparative screen, not a ranking of need. Most ranks are fragile."
- Takeaway: the map is an invitation to inspect mismatches, not a verdict.

### Beat 2: Pull Pressure And Capacity Apart

- User action: toggles between climate pressure and visible capacity.
- Layer: same centroid geography, fill color changes by active score.
- Panel state: pressure-versus-capacity mini comparison for selected geography.
- Evidence: `eda_country_drivers.csv`, `eda_country_story_labels.csv`.
- Caveat placement: near capacity score.
- Required copy: "Capacity here is a proxy from official datasets, not a full measure of readiness."
- Takeaway: the gap is a difference between two imperfect but inspectable sides.

### Beat 3: Inspect A Place

- User action: selects a point, with Nauru as a strong early exemplar.
- Layer: selected point emphasized; other points dimmed.
- Panel state: full country detail.
- Evidence: `country_details.json`, `eda_indicator_forensics.csv`, `eda_rank_volatility.csv`.
- Caveat placement: rank chip and trace section.
- Required copy: "Rank movement frames uncertainty and should not be read as definitive."
- Takeaway: every score can be traced to rows, sources, indicators, and caveats.

### Beat 4: Where The Data Goes Quiet

- User action: opens the monitoring/data-coverage layer.
- Layer: monitoring quadrant, reporting status rings, and coverage marks.
- Panel state: "Why is this blank?" or "What does zero mean?" explanation.
- Evidence: `eda_monitoring_gap.csv`.
- Caveat placement: primary panel, not just source drawer.
- Required copy: "A reporting gap is not proof that infrastructure is absent. Monitoring counts are unnormalized proxy coverage."
- Takeaway: data absence is an inspectable part of the story.

### Beat 5: Show Rank Fragility

- User action: toggles uncertainty view or opens a rank chip.
- Layer: point fill or overlay changes to rank range / robustness.
- Panel state: rank range and sensitivity note.
- Evidence: `eda_rank_volatility.csv`, `index_sensitivity.csv`.
- Caveat placement: next to every rank.
- Required copy: "This view exists so the gap map cannot be read as a fixed scoreboard."
- Takeaway: the atlas earns trust by showing uncertainty.

### Beat 6: Compare Evidence Fingerprints

- User action: selects a geography and opens "similar evidence profiles."
- Layer: other points re-encode by JSD distance from the selected geography, if the TASK-019 layer is accepted for V1.
- Panel state: nearest evidence-profile neighbors and a compact fingerprint summary.
- Evidence: `eda_evidence_fingerprints.csv`, `eda_pairwise_jsd.csv`, `eda_similarity_neighbors.csv`, and `divergence_summary.json`.
- Caveat placement: inside the comparison panel and method drawer.
- Required copy: "Similarity means official-data profiles look alike under this method; it does not mean the places face the same risks or need the same actions."
- Takeaway: the atlas can compare what kind of gap a place has, not just how high the score is.

### Beat 7: Regional Texture

- User action: filters by Pacific subregion.
- Layer: subregion grouping with typology summaries.
- Panel state: short regional caption and sample count.
- Evidence: `eda_spatial_typologies.csv`, `eda_subregion_comparisons.csv`.
- Caveat placement: caption under subregion control.
- Required copy: "UN M49 statistical groupings, not cultural or political boundaries. Small samples."
- Takeaway: there is regional texture, but it should be described carefully.

### Beat 8: Optional Outlook Stress Test

- User action: opts into outlook.
- Layer: future-facing map rows gated by display recommendation.
- Panel state: trend-quality caveat and scenario explanation.
- Evidence: `eda_outlook_interpretation.csv`, `adaptation_gap_outlook.csv`.
- Caveat placement: always visible while the layer is active.
- Required copy: "Stress-test interpretation, not a forecast."
- Takeaway: outlook is a curiosity layer, not the story spine.

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
| Centroid map | Point/centroid fallback, not official boundary geometry. |

## Claims We Will Not Make

- "These are the most vulnerable Pacific geographies."
- "This geography needs the most funding."
- "No monitoring rows means there is no monitoring infrastructure."
- "The outlook predicts the future adaptation gap."
- "Subregions explain the score."
- "Emissions context proves blame or responsibility at the geography level."
- "A lower relative gap means a place is safe."
- "The map shows exact island boundaries."

## Open Decisions Before App Build

1. Should outlook ship in V1, or wait until the core map, missingness, and uncertainty layers are polished?
2. Should Evidence Fingerprint Divergence ship in V1, or wait until after core app data wiring and visual approval?
3. Should subregion filtering be a major tour beat or a secondary filter?
4. Should the first selected exemplar be NR, or should the tour first show NR and then quickly contrast with TV?
5. Should boundary source selection happen before launch, or is centroid-first acceptable for the competition entry?
6. Who reviews political-status wording before publication?

## Handoff To Design

The design brief should preserve this story hierarchy:

1. Gap map first.
2. Missingness/monitoring as the signature interaction.
3. Rank uncertainty always visible where ranks appear.
4. Evidence-profile divergence only as selected-geography comparison; app wiring and V1 inclusion are still pending.
5. Caveats beside the claims they qualify.
6. Outlook optional and gated.

The brainstorm archive remains in `context/storyboardbrainstorm.md`.
