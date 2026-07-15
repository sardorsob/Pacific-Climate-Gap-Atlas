# Analysis Backlog

## Purpose

This file records the EDA and GIS lanes that built the atlas evidence base and routes the approved data-first expansion. The active task ledger lives in `context/TASKS.md`; no separate task-specific Markdown is required.

## Current Status

All planned analysis lanes are complete. `TASK-065` through `TASK-068` acquired, processed, and tested the candidate evidence, and `TASK-069` accepted the regional movement -> evidence visibility -> exploration story. The next work is application design/data wiring under `TASK-072` through `TASK-077`; no additional EDA or notebook lane is planned.

## Principles

- Start from analytical questions, not chart ideas.
- Acquire and inspect data before locking the narrative; treat story concepts as hypotheses until evidence and caveats are reviewed.
- Prefer a few useful datasets over a broad 27-dataset dashboard.
- Use Python modules and scripts as the source of truth; notebooks are outside the current workflow and should not be reintroduced without a concrete review need.
- Save reportable outputs under `artifacts/` with stable names.
- Preserve caveats when scores depend on sparse data, proxy indicators, centroid geometry, or generalized visual land context.
- Treat GIS claims carefully while scored geometry is centroid fallback and Natural Earth is visual context rather than official boundaries.
- Keep measured-condition and evidence-visibility matrices separate. Data absence may organize a visibility view, but it must not silently define condition similarity.
- Treat hierarchical clustering as exploratory row ordering unless stability evidence supports more; never publish preparedness classes or natural island groups from 22 geographies.

## Analysis Lanes

### TASK-009: Script-First EDA Foundation

Question: Can we produce repeatable analysis tables from existing project artifacts without notebooks?

Outputs:
- `configs/eda.yml`
- `scripts/run_eda.py`
- `analysis/eda/*`
- `artifacts/tables/eda_data_coverage.csv`
- `artifacts/tables/eda_coverage_by_geography.csv`
- `artifacts/tables/eda_coverage_by_dataset.csv`
- `artifacts/tables/eda_indicator_forensics.csv`
- `artifacts/tables/eda_indicator_outliers.csv`
- `artifacts/tables/eda_country_drivers.csv`
- `artifacts/tables/eda_country_story_labels.csv`
- `artifacts/tables/index_sensitivity.csv`
- `artifacts/tables/eda_rank_volatility.csv`
- `artifacts/tables/eda_trend_profiles.csv`
- `artifacts/tables/eda_monitoring_gap.csv`
- `artifacts/provenance/eda_summary.json`
- `context/ANALYSIS_BRIEF.md`

### TASK-010: GIS Context Enrichment

Question: What spatial context is needed before we make regional or geographic claims?

Candidate enrichments:
- Pacific subregion labels: Melanesia, Micronesia, Polynesia
- Sovereignty or territory status
- Island group names where useful
- Optional population, land area, coastline, or boundary source if defensible

Outputs:
- `data/external/geography_context.csv`
- `artifacts/provenance/geography_context_sources.json`
- boundary-source decision in `context/DECISIONS.md`

### TASK-011: Data Coverage And Data Desert Atlas

Question: Where does the official data see the Pacific clearly, and where is the evidence thin?

Analyses:
- dataset count by geography
- row count by geography
- first and last observation year
- missing pillar flags
- per-dataset geography coverage
- monitoring-network coverage as its own layer

Outputs:
- `artifacts/tables/eda_coverage_by_geography.csv`
- `artifacts/tables/eda_coverage_by_dataset.csv`
- `artifacts/figures/eda_coverage_rankings.png`

### TASK-012: Indicator-Level Forensics

Question: Which indicators drive the scores, and where might indicator behavior mislead?

Analyses:
- top and bottom geographies per indicator
- latest-year differences
- outlier detection by indicator
- indicators with high leverage on pillar scores
- unit and grain caveats

Outputs:
- `artifacts/tables/eda_indicator_forensics.csv`
- `artifacts/tables/eda_indicator_outliers.csv`
- `context/ANALYSIS_BRIEF.md` update

### TASK-013: Country Driver Decomposition

Question: Why is each geography high, low, or middling on the adaptation gap?

Analyses:
- pressure versus capacity decomposition
- high-pressure plus low-capacity flags
- monitoring-thin and data-thin flags
- short reason labels for app side panels
- country exemplars for story sections

Outputs:
- `artifacts/tables/eda_country_drivers.csv`
- `artifacts/tables/eda_country_story_labels.csv`

### TASK-014: Rank Robustness And Sensitivity

Question: Which rankings are robust, and which are artifacts of weights or one indicator?

Analyses:
- equal-weight baseline ranking
- pressure-heavy and capacity-heavy alternatives
- leave-one-indicator-out rank volatility
- score spread under simple weighting scenarios
- robustness flag by geography

Outputs:
- `artifacts/tables/index_sensitivity.csv`
- `artifacts/tables/eda_rank_volatility.csv`
- `artifacts/figures/eda_rank_sensitivity.png`

### TASK-015: Spatial Typologies And Regional Patterns

Question: Do geographies form useful groups beyond rank order?

Analyses:
- quadrant typology: pressure high/low by capacity high/low
- data coverage typology
- optional clustering if the small sample behaves sensibly
- subregion comparison after GIS context enrichment
- centroid-distance similarity check, with ocean-space caveats

Outputs:
- `artifacts/tables/eda_spatial_typologies.csv`
- `artifacts/tables/eda_subregion_comparisons.csv`

### TASK-016: Trend And Outlook Interpretation

Question: Which trends are meaningful enough to show, and which should stay caveated?

Analyses:
- trend strength by geography and dataset
- trend diagnostics by indicator family
- current gap versus 2030/2050 outlook
- outlook change rankings
- fragile trend flags

Outputs:
- `artifacts/tables/eda_trend_profiles.csv`
- `artifacts/tables/eda_outlook_interpretation.csv`
- `context/MODEL_CARD.md` update

### TASK-017: Monitoring Gap Analysis

Question: Where is monitoring coverage weakest relative to climate pressure and adaptation need?

Analyses:
- monitoring count versus climate pressure
- monitoring count versus adaptation gap
- high-gap low-monitoring quadrants
- monitoring coverage as diagnostic rather than score-only input
- optional normalization after geography context enrichment

Outputs:
- `artifacts/tables/eda_monitoring_gap.csv`
- `artifacts/figures/eda_monitoring_gap_quadrants.png`

### TASK-018: Story And Design Synthesis

Question: What is the strongest responsible, careful story the data can support, and what design contract should govern the atlas build?

Analyses:
- emissions context versus climate pressure
- emissions context versus adaptation gap
- strongest 2-3 narrative arcs
- country exemplars and caveats
- final app layer priority list

Outputs:
- `context/STORY_BRIEF.md`
- `context/DESIGN_BRIEF.md`

### TASK-019: Evidence Fingerprint Divergence

Question: Which geographies have similar or different official-data evidence profiles behind their adaptation-gap scores?

Status: implemented as analysis artifacts and selected-place app data/UI. Exact nearest-neighbor values, bands, reasons, and caveats ship in the current panel. The approved redesign keeps that panel evidence and removes guided/map-arc presentation.

Analyses:
- build pressure, capacity, data-visibility, and combined evidence vectors from official-data-derived trace fields
- normalize each vector family with explicit missingness treatment
- compute pairwise Jensen-Shannon divergence across the 22 geographies
- optionally compute KL divergence only as an internal diagnostic after smoothing
- identify nearest evidence-profile neighbors for selected geographies
- identify cases where similar gap scores hide different evidence profiles
- identify cases where different scores share similar evidence fingerprints

Outputs:
- `context/INFORMATION_DIVERGENCE_PLAN.md`
- `context/plans/evidence-fingerprint-divergence-plan.md`
- `artifacts/tables/eda_evidence_fingerprints.csv`
- `artifacts/tables/eda_pairwise_jsd.csv`
- `artifacts/tables/eda_similarity_neighbors.csv`
- `artifacts/provenance/divergence_summary.json`
- selected-neighbor records nested in generated `geographies.json`

### TASK-020: Dataviz Inspiration Audit

Question: Which live reference interaction patterns should inform the next atlas mockup without weakening originality or evidence discipline?

Analyses:
- sample Dataviz Inspiration map, choropleth, connection, bubble map, arc, ridgeline, hexbin, and heatmap routes
- inspect relevant original projects with live browser interaction
- extract durable patterns for full-bleed maps, selected-geography anchoring, compact evidence strips, direct labels, guided tours, and evidence-bearing motion
- identify risky patterns to avoid, including long pre-map intros, hover-only values, hidden caveats, and copied visual identities

Outputs:
- `context/DATAVIZ_INSPIRATION_AUDIT.md`
- updates to `context/STORY_BRIEF.md`
- updates to `context/DESIGN_BRIEF.md`
- updates to `context/archive/CLAUDE_MOCKUP_INSTRUCTIONS.md` (historical archive)

### TASK-065: Targeted Official-Dataset Acquisition

Question: Which additional official 2026 datasets are sufficiently available, interpretable, and decision-relevant to justify deeper exploration?

Candidate set:
- population growth
- renewable energy share
- safely managed drinking water
- crop yield, with disaggregated crop data only if needed
- direct disaster economic loss
- climate-altering land-cover index

Required checks:
- official source and licence
- raw row count, geography count, and year range
- indicator grain, unit, denominator, and disaggregation
- missing geography/year patterns
- source/API inconsistencies and reproducible fetch behavior

Outcome: five candidates are accepted only for `TASK-066` processing review; aggregate crop yield is rejected because the supplementary item-level source exposes composition that the aggregate hides. All six remain processing-disabled, and the original nine-dataset processed baseline is unchanged.

### TASK-066: Candidate Processing Lane

Question: Can the accepted candidates enter the normalized long-form data without changing the existing score or hiding source semantics?

Required checks:
- deterministic local-cache-first rebuild
- geography-code reconciliation
- raw values, units, flags, and source hashes preserved
- existing nine-dataset artifacts remain reproducible
- current Adaptation Gap scores remain unchanged unless a later methodology task explicitly revises them

### TASK-067: Comparability And Story EDA

Question: What concrete, non-causal Pacific patterns do the expanded datasets support, and which apparent patterns fail comparability review?

Analyses:
- geography overlap and year alignment across climate, impact/service, and response datasets
- rate versus absolute-count comparability
- denominator feasibility using population, coastline, land area, or another justified exposure base
- within-dataset trends and named-place contrasts
- missingness and reporting-semantics audit
- candidate story-signal table recording supported, weak, contradicted, and unavailable claims

Visual research atlas:
- `artifacts/figures/eda_candidate_coverage_alignment.png`: geography/year coverage and temporal-overlap matrix
- `artifacts/figures/eda_candidate_distributions.png`: within-indicator distributions and outlier context without cross-unit ranking
- `artifacts/figures/eda_candidate_trends.png`: sufficiently populated small-multiple trends with sparse-series fallbacks
- `artifacts/figures/eda_candidate_named_place_contrasts.png`: named-place comparisons, relationships, or centroid orientation views only where the grain is defensible
- `artifacts/figures/eda_candidate_reporting_visibility.png`: observed geography-years versus missing official reporting, never absence-of-condition inference

Story audition surface:
- `artifacts/figures/eda_candidate_story_auditions.png`: one separate contact sheet comparing three rough evidence-board narrative auditions

Use reproducible static Matplotlib figures by default. Add Plotly only if linked interaction changes the analytical judgment, and do not add GeoPandas or imply polygon precision while scored geography remains centroid fallback. Each figure must show units, time basis, geography scope, source, and a nearby caveat; attractive but failed patterns belong in the story-signal table with rejection reasons.

This task does not select a final narrative, write final scene copy, or add app layers.

Builder result: all five datasets received a judgment; three tables, five analytical figures, and one three-audition contact sheet are reproducible from the EDA runner. Four hypotheses are supported, one weak, one contradicted, and two unavailable. Direct loss is restricted to reporting visibility, land-cover direction is withheld, and no candidate composite or winner was declared. Independent re-review and owner QA accepted the pass on 2026-07-14.

### TASK-068: Regional Pattern And Evidence-Visibility EDA

Question: Does the owner-approved regional two-act direction describe the complete Pacific evidence, or does it depend on a few selected examples or unstable analytical ordering?

Required artifact set:
- complete within-indicator distribution summaries and plate
- all-geography water/renewable first-to-latest cross-current table and plate
- measured-condition feature matrix plus cluster-ordered heatmap
- separately constructed evidence-visibility matrix plus cluster-ordered heatmap
- pairwise Spearman table/plate with overlap, years, and derived-input dependency warnings
- equal-presence centroid-map small multiples for selected conditions and visibility
- leave-one-indicator ordering sensitivity and explicit rejection state
- one deterministic file-based run bundle under `artifacts/logs/runs/<run_id>/`

Required boundaries:
- all 22 geographies remain visible or explicitly missing
- no imputation, cross-unit average, new score, causal claim, readiness class, public cluster label, or app wiring
- direct loss remains reporting visibility only; land-cover direction remains withheld; population remains projection/estimate context
- highlighted islands are illustrative labels selected after complete-distribution review, never the regional scope
- Matplotlib plus the existing centroid/land context is the default; SciPy may provide hierarchical ordering; Plotly/GeoPandas require a demonstrated analytical need

### TASK-069: Scientific Story Selection Gate

Question: Which story is strongest after the expanded-data audit, and what claims must be rejected?

Input: the reviewed TASK-067 research atlas, TASK-068 regional artifacts/run bundle, and owner-approved working spine. TASK-069 may accept, revise, or reject the two-act direction, but it must not bypass the evidence review with a new unsupported concept.

Compare at minimum:
- Act I: a region moving in different directions
- Act II: a region seen with unequal clarity
- Coda: release into the existing island-by-island explorer

Selection criteria:
- important Pacific problem or opportunity
- intuitive one-sentence problem statement
- source-backed and non-causal claim chain
- meaningful regional evidence with illustrative, non-protagonist place labels
- visual fit with the existing fullscreen map/figure system
- honest missingness, units, denominators, and time basis
- owner approval before storyboard implementation

Outcome: approved. Keep all 22 geographies visible; show the 19 complete water/renewable comparisons across the 7/6/3/3 direction split; retain Guam, Pitcairn, and Tokelau as incomplete; then show the separate 14-position visibility record before returning to the existing explorer. The Adaptation Gap Index is optional Explore evidence, not the guided title or default.

## Parallelization Plan

- Coverage/data desert and GIS enrichment can run in parallel.
- Indicator forensics and driver decomposition can run in parallel after the current score artifacts are available.
- Sensitivity analysis can run independently from trend/outlook interpretation.
- Evidence fingerprint divergence has run and selected-neighbor fields are in the public app contract. Do not add a second fingerprint payload or global similarity surface without a new task.
- The Dataviz Inspiration audit is complete and should inform visual critique immediately. It does not require new data artifacts.
- Acquisition and processing may be planned together but must run sequentially so failed candidates do not enter the processed contract.
- Candidate-specific and regional EDA are complete. Do not add more analysis unless implementation QA exposes a concrete traceability or comparability defect.
- `context/ARTISTIC_REDESIGN_BRIEF.md` is now both the visual-system baseline and the approved story source.
- TASK-019 remains selected-place exploration evidence rather than an assumed narrative spine.
