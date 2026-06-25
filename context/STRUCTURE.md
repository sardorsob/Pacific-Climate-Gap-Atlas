# Structure

## Root

- `README.md`: public project entrypoint.
- `pyproject.toml`: Python analysis package metadata.
- `package.json`: root command shortcuts.
- `.env.example`: documented environment variable shape without secrets.

## Research

- `research/pacific_dataviz_2026_research_brief.md`: challenge and concept brief.
- `research/official_datasets_2026.csv`: official dataset inventory.
- `research/past_winners_links.csv`: curated winner/highly-commended links.
- `research/past_entries_2022_2025.csv`: broader past-entry scrape.
- `research/winner_review_board.html`: local competitor pattern review board.

## Context

- `context/PROJECT.md`: current phase and project status.
- `context/PROBLEM.md`: research question and decision value.
- `context/SCOPE.md`: in-scope and out-of-scope work.
- `context/TASKS.md`: executable task blocks.
- `context/ANALYSIS_BACKLOG.md`: deeper GIS/data-science analysis lanes before visual design.
- `context/ANALYSIS_BRIEF.md`: living summary of EDA outputs, early signals, and caveats.
- `context/DATA_CARD.md`: dataset provenance, coverage, and caveats.
- `context/MODEL_CARD.md`: outlook model purpose and limits.
- `context/ASSUMPTIONS.md`: modeling/index assumptions.
- `context/DECISIONS.md`: durable decision log.
- `context/HANDOVER.md`: run and continuation notes.

## Analysis

- `analysis/io/`: source data loading and API helpers.
- `analysis/preprocessing/`: schema normalization and geography joins.
- `analysis/features/`: gap index feature construction.
- `analysis/modeling/`: outlook model baselines.
- `analysis/evaluation/`: metric and backtest helpers.
- `analysis/eda/`: script-first exploratory analysis helpers.
- `analysis/uncertainty/`: uncertainty and sensitivity helpers.
- `analysis/viz/`: analysis-side chart helpers.
- `analysis/utils/`: paths and shared utilities.

## App

- `app/`: Vite/React/TypeScript GIS atlas scaffold.
- `app/public/data/`: app-consumable static data exports.
- `app/src/`: map, panel, control, and style components.

## Generated / Data

- `data/raw/`: immutable source pulls, ignored by Git.
- `data/interim/`: temporary transforms, ignored by Git.
- `data/processed/official_observations.csv`: normalized official observations in long form.
- `data/processed/geography_lookup.csv`: geography coverage lookup across priority datasets.
- `data/processed/app/atlas_dataset_summary.json`: compact app-ready data summary without geometry.
- `data/processed/app/geographies.json`: score, source, centroid, and outlook records for each geography.
- `data/processed/app/atlas_geographies.geojson`: centroid GeoJSON for adaptation-gap, pillar, and outlook map layers.
- `data/processed/app/monitoring_network.geojson`: latest monitoring-network centroid overlay.
- `data/processed/app/layers.json`: app layer manifest.
- `data/processed/app/country_details.json`: geography detail records with indicator trace rows.
- `data/external/`: boundaries and lookup tables.
- `data/external/geography_context.csv`: descriptive GIS context table for subregions, status labels, and island-group notes.
- `data/contracts/`: generated JSON source, coverage, and schema contracts for priority official datasets.
- `artifacts/`: figures, tables, reports, run bundles, and provenance.
- `artifacts/tables/dataset_profile.csv`: generated official dataset profile table.
- `artifacts/tables/adaptation_gap_index.csv`: geography-level draft Adaptation Gap Index baseline.
- `artifacts/tables/adaptation_gap_indicator_trace.csv`: latest-observation trace table behind each score.
- `artifacts/tables/adaptation_gap_outlook.csv`: 2030 and 2050 outlook scenario table.
- `artifacts/tables/climate_trend_diagnostics.csv`: climate-signal trend diagnostics and backtest metrics.
- `artifacts/tables/eda_data_coverage.csv`: geography-level EDA coverage tiers and data-desert flags.
- `artifacts/tables/eda_coverage_by_geography.csv`: geography-level official-data coverage deep dive.
- `artifacts/tables/eda_coverage_by_dataset.csv`: dataset-level official-data coverage deep dive.
- `artifacts/tables/eda_indicator_forensics.csv`: indicator trace rows with score roles, rank context, and outlier fields.
- `artifacts/tables/eda_indicator_outliers.csv`: subset of indicator forensics rows flagged by within-dataset outlier checks.
- `artifacts/tables/eda_country_drivers.csv`: country-level descriptive driver labels and evidence density.
- `artifacts/tables/eda_country_story_labels.csv`: app-ready country story labels, priority classes, exemplar flags, and caveat fields.
- `artifacts/tables/eda_spatial_typologies.csv`: rule-based geography typologies joined to GIS context, story labels, and caveats.
- `artifacts/tables/eda_subregion_comparisons.csv`: small-sample subregion summaries with dominant typologies and regional caveats.
- `artifacts/tables/index_sensitivity.csv`: simple pressure-heavy/capacity-heavy rank sensitivity table.
- `artifacts/tables/eda_rank_volatility.csv`: rank-volatility table combining weight shifts and leave-one-indicator stress tests.
- `artifacts/tables/eda_trend_profiles.csv`: trend diagnostic summaries by geography.
- `artifacts/tables/eda_monitoring_gap.csv`: monitoring proxy coverage compared with adaptation-gap scores, pressure/capacity ranks, GIS story quadrants, and reporting caveats.
- `artifacts/provenance/dataset_pipeline_summary.json`: processed pipeline provenance, row counts, and source hashes.
- `artifacts/provenance/gap_index_summary.json`: index method summary, score counts, and top/bottom geography review set.
- `artifacts/provenance/outlook_summary.json`: outlook metrics, caveats, inputs, and outputs.
- `artifacts/provenance/app_data_summary.json`: app-data output counts, source refs, and geometry policy.
- `artifacts/provenance/geography_context_sources.json`: source notes and caveats for the descriptive GIS context table.
- `artifacts/provenance/eda_summary.json`: EDA output counts, early signal counts, inputs, outputs, and caveats.
