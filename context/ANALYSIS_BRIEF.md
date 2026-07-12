# Analysis Brief

## Status

The project completed the original nine-dataset analysis sprint and has a functioning visual atlas baseline. The owner has reopened the final competition story and approved a data-first expansion before narrative selection. `TASK-065` through `TASK-067` will profile, process, and audit targeted additional official datasets; the findings below remain the baseline evidence, not the final story conclusion.

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
- `artifacts/tables/eda_spatial_typologies.csv`
- `artifacts/tables/eda_subregion_comparisons.csv`
- `artifacts/tables/index_sensitivity.csv`
- `artifacts/tables/eda_rank_volatility.csv`
- `artifacts/tables/eda_trend_profiles.csv`
- `artifacts/tables/eda_outlook_interpretation.csv`
- `artifacts/tables/eda_monitoring_gap.csv`
- `artifacts/tables/eda_evidence_fingerprints.csv`
- `artifacts/tables/eda_pairwise_jsd.csv`
- `artifacts/tables/eda_similarity_neighbors.csv`
- `artifacts/provenance/eda_summary.json`
- `artifacts/provenance/divergence_summary.json`

## Early Signals

- The coverage deep dive includes 22 geographies and 9 datasets. PN is the only data-desert geography under the current stricter flag; the more important issue is partial geography coverage by dataset, especially GHG per capita, power generation, monitoring network, directly affected persons, sea-level anomalies, and sea-surface temperature anomalies.
- Indicator forensics preserve all 182 trace rows: 165 score-input rows and 17 context-only responsibility rows. The first outlier pass flags 11 within-dataset scoring-value outliers, including context-only GHG outliers for NC and PW that should not be described as score drivers.
- Country driver labels are now joined to trace-level pressure/capacity signals, coverage caveats, and rank-volatility caveats. The story-label table keeps 22 scored geographies: 5 primary, 8 secondary, and 9 context rows. Current primary high-gap geographies are PN, NR, AS, WF, and TV.
- Spatial typologies are rule-based, not statistical clusters. Polynesia currently has the highest mean adaptation-gap score and the most high-gap/low-capacity cases; Melanesia reads more as high-pressure with higher visible capacity; Micronesia is mostly mixed-gap context with fragile ranks.
- Rank robustness is a major story risk. The first weight-sensitivity table labeled 12 of 22 geographies fragile, 7 sensitive, and only 3 stable. The deeper leave-one-indicator volatility table labels 19 geographies fragile and 3 sensitive, with a maximum rank range of 15. The atlas should avoid presenting rank order as definitive.
- The monitoring-gap table now ranks GIS story priorities and flags 4 high-gap plus low-monitoring candidates: PN, NR, AS, and WF. PN and NR have latest monitoring rows reporting 0; AS and WF have no monitoring rows in processed observations, so they should be described as reporting gaps unless independently verified.
- Trend/outlook interpretation is now conservative display guidance, not forecasting. Supported diagnostics can be shown as stress-test context; mixed diagnostics require strong visible caveats; weak or sparse rows should be withheld from outlook layers.
- Evidence Fingerprint Divergence now produces 22 geography fingerprints, 231 unordered pairwise JSD rows, and 66 nearest-neighbor rows. The public metric is base-2 Jensen-Shannon divergence over normalized official-data-derived profiles, bounded from 0 to 1. Its value is explanatory: "similar gap, different evidence mix" and "different gap, similar evidence profile." It must not become a new global rank or a claim that similar places share the same vulnerability or policy needs.
- The V1 combined fingerprint preserves six component families: pressure, visible capacity, data visibility, rank fragility, missing data, and monitoring reporting gap. Zero components remain zero; the public artifacts do not use smoothing, and missingness/status components are visible as their own mass rather than hidden in a footnote.
- The nearest-neighbor output is suitable for selected-geography comparison only. Current exemplar QA rows are recorded in `artifacts/provenance/divergence_summary.json` for NR, TV, PN, AS, WF, and MH.

## Caveats

- This is descriptive EDA, not causal inference.
- Current GIS geometry is centroid fallback, not boundary polygons.
- Monitoring counts are proxy coverage and are not normalized by population, land area, coastline, station type, or hazard exposure.
- Missing monitoring rows should be treated as reporting gaps, not confirmed absence of infrastructure.
- Coverage tables describe official-data availability, not climate or adaptation outcomes. High row counts can reflect long time series rather than stronger spatial coverage.
- Indicator outliers use 1.5x IQR fences within each dataset on `scoring_value`; raw `latest_value` is preserved separately. Units and denominators differ, so compare within indicators only.
- Country story labels are descriptive screens for app copy and story selection. They summarize available indicators and should not be read as causal explanations.
- Spatial typologies are descriptive rule groups. They do not use centroid-distance or land-adjacency inference.
- Sensitivity scenarios are simple stress tests. Weight shifts and leave-one-indicator tests frame uncertainty; they are not a replacement ranking or a claim about true risk order.
- Outlook interpretation is stress-test display guidance. It should not be framed as a prediction or operational forecast.
- Driver labels are useful for exploration and app copy drafts, not final scientific claims.
- JSD compares normalized evidence profiles. It does not explain causality, lived experience, full adaptation readiness, vulnerability, or policy need. Sparse or missing data can create misleading similarity and must stay visible. KL is not required for public UI interpretation.

## Next Priorities

1. Run `TASK-065` and explicitly accept or reject each targeted official dataset candidate.
2. Process only accepted candidates in `TASK-066` while proving the current baseline index remains unchanged.
3. Use `TASK-067` to audit comparability, denominators, time alignment, named-place patterns, and unsupported claims.
4. Choose the final narrative only in `TASK-068`; until then, treat the current index-first story and exemplar set as provisional.
5. Preserve outlook and JSD as secondary, caveated evidence unless the approved expanded-data story gives either a new defensible role.
