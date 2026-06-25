# Analysis Brief

## Status

The project has shifted into an analysis sprint before visual design resumes. `TASK-009` creates the first script-first EDA foundation. It does not finish the story, but it gives us reproducible tables that start separating strong signals from fragile ones.

## Current EDA Outputs

Run:

```powershell
python scripts/run_eda.py --config configs/eda.yml
```

The runner writes:

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

## Early Signals

- The coverage deep dive includes 22 geographies and 9 datasets. PN is the only data-desert geography under the current stricter flag; the more important issue is partial geography coverage by dataset, especially GHG per capita, power generation, monitoring network, directly affected persons, sea-level anomalies, and sea-surface temperature anomalies.
- Indicator forensics preserve all 182 trace rows: 165 score-input rows and 17 context-only responsibility rows. The first outlier pass flags 11 within-dataset scoring-value outliers, including context-only GHG outliers for NC and PW that should not be described as score drivers.
- Country driver labels are now joined to trace-level pressure/capacity signals, coverage caveats, and rank-volatility caveats. The story-label table keeps 22 scored geographies: 5 primary, 8 secondary, and 9 context rows. Current primary high-gap geographies are PN, NR, AS, WF, and TV.
- Rank robustness is a major story risk. The first weight-sensitivity table labeled 12 of 22 geographies fragile, 7 sensitive, and only 3 stable. The deeper leave-one-indicator volatility table labels 19 geographies fragile and 3 sensitive, with a maximum rank range of 15. The atlas should avoid presenting rank order as definitive.
- The monitoring-gap table flags 4 high-gap plus low-monitoring candidates. This supports the monitoring-gap story lane, but monitoring counts still need normalization or stronger context before making infrastructure claims.
- Trend profiles classify some geographies as stronger and many as mixed. Outlook layers should remain secondary and visibly caveated unless later trend review raises confidence.

## Caveats

- This is descriptive EDA, not causal inference.
- Current GIS geometry is centroid fallback, not boundary polygons.
- Monitoring counts are proxy coverage and are not normalized by population, land area, coastline, station type, or hazard exposure.
- Coverage tables describe official-data availability, not climate or adaptation outcomes. High row counts can reflect long time series rather than stronger spatial coverage.
- Indicator outliers use 1.5x IQR fences within each dataset on `scoring_value`; raw `latest_value` is preserved separately. Units and denominators differ, so compare within indicators only.
- Country story labels are descriptive screens for app copy and story selection. They summarize available indicators and should not be read as causal explanations.
- Sensitivity scenarios are simple stress tests. Weight shifts and leave-one-indicator tests frame uncertainty; they are not a replacement ranking or a claim about true risk order.
- Driver labels are useful for exploration and app copy drafts, not final scientific claims.

## Next Analysis Priorities

1. Add GIS context enrichment so regional claims have a reviewed geography table.
2. Use coverage findings to decide where missing-data caveats belong in the atlas flow.
3. Review primary and secondary country story labels against indicator forensics before choosing atlas exemplar geographies.
4. Use the rank-volatility table to decide how rankings should appear, if at all, in the visual story.
5. Decide whether monitoring gap, responsibility mismatch, or rank fragility is the strongest atlas story.
