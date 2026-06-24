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

The score table includes `included_indicator_count`, `available_pillars`, `missing_pillars`, and `missingness_flag`. Even when a geography is scored, the app should show the indicator trace because some geographies have fewer contributing indicators than others.

## Caveats

- Equal weights are used within the current baseline.
- Directly affected persons are raw counts, not population-normalized exposure.
- Capacity indicators are proxies and do not fully measure adaptation readiness.
- Responsibility-context indicators are included in the trace table but not in the pressure-minus-capacity score.
- Rankings are sensitive to latest-year availability and should be treated as prompts for exploration, not definitive classifications.

## Outlook Method

Outlook modeling is optional. If included, it will use transparent time-series trend baselines and scenario assumptions. It will not be described as an operational prediction.
