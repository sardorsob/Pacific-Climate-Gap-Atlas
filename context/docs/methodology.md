# Methodology

## Baseline Adaptation Gap Index

The baseline Adaptation Gap Index is a comparative screen, not an absolute risk measure. It is designed to help readers find places where climate pressure signals appear high relative to available adaptation-capacity proxies.

Current implementation:

1. Start from `data/processed/official_observations.csv`.
2. Keep the latest non-missing observation per geography and dataset.
3. Convert each indicator to a 0-100 percentile rank within available Pacific geographies.
4. Score anomaly datasets by absolute anomaly magnitude while preserving raw latest values in the trace table.
5. Average climate-signal and observed-stress indicator ranks into `climate_pressure_score`.
6. Average adaptation-capacity proxy ranks into `capacity_score`.
7. Compute `raw_gap_difference = climate_pressure_score - capacity_score`.
8. Rescale scored gap differences to 0-100 as `adaptation_gap_score`.

Outputs:

- `artifacts/tables/adaptation_gap_index.csv`: geography-level score table.
- `artifacts/tables/adaptation_gap_indicator_trace.csv`: latest values, scoring values, percentile ranks, and source row hashes behind each geography score.
- `artifacts/provenance/gap_index_summary.json`: method summary, top/bottom ranked geographies, output paths, and caveats.

## Missingness Policy

Missing values are not imputed for the primary score. A geography must have at least one climate-signal indicator and one adaptation-capacity indicator to receive a published score.

The score table includes `score_input_indicator_count`, `context_indicator_count`, `trace_indicator_count`, `available_pillars`, `missing_pillars`, and `missingness_flag`. Even when a geography is scored, the app should show the full indicator trace because context-only rows remain useful evidence without feeding the score.

`TASK-048` made the score-input denominator explicit: there are eight possible score-input datasets across climate signal, observed stress, and adaptation capacity. Responsibility-context rows are counted separately and never enter the pressure-minus-capacity score or score-input evidence density.

## Map Geometry Policy

The app map currently uses MapLibre as the interactive canvas, renders the generated geography records as centroid point features, and places a Natural Earth 10m land layer underneath as visual context. The scored geography source geometry policy remains `centroid_fallback_until_boundary_join`.

Centroids support orientation, selection, comparison, and layer encoding. They are not official boundaries and should not be used for area, adjacency, coastline, territorial extent, or choropleth claims.

The Natural Earth layer helps readers see island/land shapes, but it is generalized public-domain context, not the official boundary geometry for the 22 scored geographies. Reviewed scored-geography boundaries would still require a separate source and geopolitical wording review before publication.

## Caveats

- Equal weights are used within the current baseline.
- Directly affected persons are raw counts, not population-normalized exposure.
- Capacity indicators are proxies and do not fully measure adaptation readiness.
- Responsibility-context indicators are included in the trace table but not in the pressure-minus-capacity score.
- Rankings are sensitive to latest-year availability and should be treated as prompts for exploration, not definitive classifications.
- Scored map geometry is centroid fallback, even though the frontend now uses MapLibre and a visual Natural Earth land-context layer.

## EDA Interpretation Tables

The script-first EDA runner adds interpretation surfaces around the baseline index:

- `eda_indicator_forensics.csv` preserves the row-level indicator trace, score role, within-indicator rank context, and outlier flags.
- `eda_country_story_labels.csv` provides descriptive country labels, story priorities, pressure/capacity summaries, and non-causal caveats for app copy drafts.
- `eda_spatial_typologies.csv` and `eda_subregion_comparisons.csv` provide rule-based regional story groupings, not statistical clusters or adjacency claims.
- `eda_monitoring_gap.csv` compares monitoring proxy coverage with adaptation-gap and pressure/capacity scores, including GIS story quadrants and missing-reporting caveats.
- `eda_outlook_interpretation.csv` converts outlook scenarios into stress-test display guidance with diagnostic quality labels and show/withhold recommendations.
- `eda_rank_volatility.csv` frames rank uncertainty with weight shifts and leave-one-indicator stress tests.

These EDA tables guide story selection. They do not change the baseline score and should not be described as causal attribution.

## Outlook Method

The Adaptation Gap Outlook is implemented as a transparent stress test. It fits simple climate-signal trends for geography/indicator series with at least 8 observations, projects climate-signal pressure to 2030 and 2050, and compares those projected pressure scores against two capacity scenarios:

- `capacity_flat`: current capacity score carried forward.
- `capacity_gradual_improvement`: capacity moves partway toward 100, by 5% of the remaining capacity gap in 2030 and 15% in 2050.

Outputs:

- `artifacts/tables/adaptation_gap_outlook.csv`
- `artifacts/tables/climate_trend_diagnostics.csv`
- `artifacts/provenance/outlook_summary.json`

This outlook is not an operational prediction. It should only appear in the app as a secondary exploratory layer with visible caveats.
