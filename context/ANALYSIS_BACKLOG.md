# Analysis Backlog

## Purpose

The project is pausing visual design work until the atlas has a stronger evidence base. This backlog defines the in-depth EDA and GIS-oriented analysis needed before a final app story, layout, and Claude visual-design handoff.

## Current Status

Completed analysis lanes now cover the script-first EDA foundation, GIS context, official-data coverage, indicator forensics, country story labels, rank volatility, spatial typologies, trend/outlook interpretation, monitoring-gap GIS priorities, story/design synthesis, the Dataviz Inspiration audit, and `TASK-019` Evidence Fingerprint Divergence. `TASK-025` wired the core app data contract, `TASK-026` added the MapLibre centroid map substrate, `TASK-029` added Natural Earth visual land context plus first-render graticule lines, and `TASK-028` rewrote the guided story/copy. Next app step is `TASK-027` final visual polish. Decide whether divergence ships in V1 before adding similarity fields to the app data contract.

## Principles

- Start from analytical questions, not chart ideas.
- Use Python modules and scripts as the source of truth; notebooks are optional review surfaces only.
- Save reportable outputs under `artifacts/` with stable names.
- Preserve caveats when scores depend on sparse data, proxy indicators, centroid geometry, or generalized visual land context.
- Treat GIS claims carefully while scored geometry is centroid fallback and Natural Earth is visual context rather than official boundaries.

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

Status: implemented as an analysis artifact; app data export and UI are pending.

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
- optional app-ready `data/processed/app/evidence_fingerprints.json`

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
- updates to `context/CLAUDE_MOCKUP_INSTRUCTIONS.md`

## Parallelization Plan

- Coverage/data desert and GIS enrichment can run in parallel.
- Indicator forensics and driver decomposition can run in parallel after the current score artifacts are available.
- Sensitivity analysis can run independently from trend/outlook interpretation.
- Evidence fingerprint divergence has run after indicator forensics, country drivers, rank volatility, and monitoring-gap tables became available. It should be decided before adding similarity/fingerprint fields to a public app contract.
- The Dataviz Inspiration audit is complete and should inform visual critique immediately. It does not require new data artifacts.
- Story synthesis should use the completed TASK-018 brief as the story source of truth, with TASK-019 now available as an optional selected-geography comparison layer rather than the primary narrative spine.
