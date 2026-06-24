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
- `data/external/`: boundaries and lookup tables.
- `data/contracts/`: generated JSON source, coverage, and schema contracts for priority official datasets.
- `artifacts/`: figures, tables, reports, run bundles, and provenance.
- `artifacts/tables/dataset_profile.csv`: generated official dataset profile table.
- `artifacts/tables/adaptation_gap_index.csv`: geography-level draft Adaptation Gap Index baseline.
- `artifacts/tables/adaptation_gap_indicator_trace.csv`: latest-observation trace table behind each score.
- `artifacts/provenance/dataset_pipeline_summary.json`: processed pipeline provenance, row counts, and source hashes.
- `artifacts/provenance/gap_index_summary.json`: index method summary, score counts, and top/bottom geography review set.
