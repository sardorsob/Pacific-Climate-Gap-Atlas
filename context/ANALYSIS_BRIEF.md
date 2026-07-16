# Analysis Brief

## Status

The project completed the original nine-dataset sprint, the candidate expansion, and the deeper complete-region EDA. `TASK-069` accepted the regional movement -> evidence visibility -> exploration story. The research figures remain analytical inputs rather than scene mockups; `TASK-072` owns transition keyframes and `TASK-073` owns the minimum app-data export.

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
- `artifacts/tables/eda_candidate_dataset_coverage.csv`
- `artifacts/tables/eda_candidate_comparability.csv`
- `artifacts/tables/eda_candidate_story_signals.csv`
- `artifacts/tables/eda_regional_feature_matrix.csv`
- `artifacts/tables/eda_regional_distribution_summary.csv`
- `artifacts/tables/eda_regional_crosscurrents.csv`
- `artifacts/tables/eda_regional_pairwise_relationships.csv`
- `artifacts/tables/eda_regional_cluster_stability.csv`
- `artifacts/figures/eda_candidate_coverage_alignment.png`
- `artifacts/figures/eda_candidate_distributions.png`
- `artifacts/figures/eda_candidate_trends.png`
- `artifacts/figures/eda_candidate_named_place_contrasts.png`
- `artifacts/figures/eda_candidate_reporting_visibility.png`
- `artifacts/figures/eda_candidate_story_auditions.png`
- `artifacts/figures/eda_regional_distributions.png`
- `artifacts/figures/eda_regional_crosscurrents.png`
- `artifacts/figures/eda_regional_condition_heatmap.png`
- `artifacts/figures/eda_regional_visibility_heatmap.png`
- `artifacts/figures/eda_regional_relationships.png`
- `artifacts/figures/eda_regional_maps.png`
- `artifacts/provenance/eda_summary.json`
- `artifacts/provenance/divergence_summary.json`
- `artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/`

## Early Signals

- The established coverage/story/JSD lane remains scoped to its original nine datasets across 22 geographies, so candidate research cannot silently change app-wired evidence fingerprints. PN remains the only data-desert geography under that baseline. The broad processed lookup now reflects 14 datasets, while the separate candidate coverage table audits the five additions without feeding the baseline score, driver labels, or JSD.
- Indicator forensics preserve all 182 trace rows: 165 score-input rows and 17 context-only responsibility rows. The first outlier pass flags 11 within-dataset scoring-value outliers, including context-only GHG outliers for NC and PW that should not be described as score drivers.
- Country driver labels are now joined to trace-level pressure/capacity signals, coverage caveats, and rank-volatility caveats. The story-label table keeps 22 scored geographies: 5 primary, 8 secondary, and 9 context rows. Current primary high-gap geographies are PN, NR, AS, WF, and TV.
- Spatial typologies are rule-based, not statistical clusters. Polynesia currently has the highest mean adaptation-gap score and the most high-gap/low-capacity cases; Melanesia reads more as high-pressure with higher visible capacity; Micronesia is mostly mixed-gap context with fragile ranks.
- Rank robustness is a major story risk. The first weight-sensitivity table labeled 12 of 22 geographies fragile, 7 sensitive, and only 3 stable. The deeper leave-one-indicator volatility table labels 19 geographies fragile and 3 sensitive, with a maximum rank range of 15. The atlas should avoid presenting rank order as definitive.
- The monitoring-gap table now ranks GIS story priorities and flags 4 high-gap plus low-monitoring candidates: PN, NR, AS, and WF. PN and NR have latest monitoring rows reporting 0; AS and WF have no monitoring rows in processed observations, so they should be described as reporting gaps unless independently verified.
- Trend/outlook interpretation is now conservative display guidance, not forecasting. Supported diagnostics can be shown as stress-test context; mixed diagnostics require strong visible caveats; weak or sparse rows should be withheld from outlook layers.
- Evidence Fingerprint Divergence now produces 22 geography fingerprints, 231 unordered pairwise JSD rows, and 66 nearest-neighbor rows. The public metric is base-2 Jensen-Shannon divergence over normalized official-data-derived profiles, bounded from 0 to 1. Its value is explanatory: "similar gap, different evidence mix" and "different gap, similar evidence profile." It must not become a new global rank or a claim that similar places share the same vulnerability or policy needs.
- The V1 combined fingerprint preserves six component families: pressure, visible capacity, data visibility, rank fragility, missing data, and monitoring reporting gap. Zero components remain zero; the public artifacts do not use smoothing, and missingness/status components are visible as their own mass rather than hidden in a footnote.
- The nearest-neighbor output is suitable for selected-geography comparison only. Current exemplar QA rows are recorded in `artifacts/provenance/divergence_summary.json` for NR, TV, PN, AS, WF, and MH.

## TASK-067 Candidate Findings

- The five accepted candidates contribute 2,403 descriptive rows. Population growth and land cover reach all 22 geographies; renewable energy reaches 20, safely managed water 19, and recorded direct loss only 12.
- Their clocks do not align. The latest published projected/estimated population-growth rate is uniformly 2025, renewable energy spans 2022–2023, safely managed water spans 2020–2022, direct loss spans 2013–2020, and land cover is uniformly 2022. Latest-value comparisons therefore keep the year beside every value.
- Direct loss has 39 returned geography-years out of 168 possible across its 2007–2020 window. Four explicit `USD_MILLIONS` rows are converted to USD; absent rows remain missing records, never zero-loss observations. The honest visual form is a reporting raster, not a continuous trend or per-capita comparison.
- The strongest named-place signal is a descriptive cross-current, not a causal result: from first to latest returned values, Papua New Guinea safely managed water changes +18.49 percentage points while renewable-energy share changes -15.60; Samoa changes +11.98 and -27.94. Raw and processed endpoints match exactly.
- Safely managed water remains uneven in the latest returned rows: Papua New Guinea 50.24% (2022), Solomon Islands 67.45% (2021), Wallis and Futuna Islands 68.88% (2022), and Tuvalu 99.26% (2022). This is essential-service context, not climate attribution.
- Eight of 22 latest projected population-growth rates are negative in 2025. All 792 rows are flagged `E` and cite `Population projections (PDH.Stat)`, so this is published estimated/projection context—not observed realized population change, population size, or vulnerability.
- The land-cover index is retained only as weak research evidence. Latest 2022 values range from Samoa 51.4 to Solomon Islands 133.3, and Vanuatu falls from a published 668.4 in 1992 to 104.7 in 2022; without resolved source direction and baseline semantics, high/low and movement cannot be labelled better/worse.
- A single candidate progress ladder is contradicted. Latest water and renewable within-indicator ranks correlate -0.43, raw magnitudes have different meanings, and the candidate set supplies neither population-size denominators for loss-per-capita nor a causal identification design.
- The regional synthesis passed TASK-068/TASK-069 review: cross-currents supply the concrete first act, unequal evidence visibility supplies the second act, and the existing island-by-island explorer remains the coda.

## TASK-068 Regional EDA Findings

- The all-place water/renewable cross-current is real as a descriptive distribution, not as one uniform regional trajectory. Among the 19 geographies with both endpoint changes, seven are water-up/renewable-down, six both-up, three both-down, and three water-down/renewable-up. Papua New Guinea and Samoa are therefore strong examples of the largest quadrant, not the whole Pacific.
- The feature matrix keeps 22 geographies across 13 measured-condition features and 14 independently constructed evidence-visibility features. It preserves 21 missing condition cells and 31 absent visibility cells without imputation, retains raw values beside within-indicator display percentiles, and records unit, year, denominator, source-row hash, source, and caveat.
- Pairwise diagnostics report 36 relationships: 32 descriptive and four with direct or transitive derived-score dependency warnings. Adaptation gap versus pressure is rho 0.2490 at n=22, gap versus capacity is rho -0.7414 at n=22, gap versus latest monitoring count is rho -0.7927 at n=18, and capacity versus latest monitoring count is rho 0.8469 at n=18. These are not independent confirmations: monitoring feeds capacity, which in turn feeds the gap score.
- Measured-condition ordering is not stable enough to name regional groups. Leave-one-feature position correlations fall to -0.6962 with a maximum 20-place shift, so the heatmap order remains an exploratory seriation and public grouping is explicitly rejected. Evidence visibility has its own independent ordering and cannot define measured-condition similarity.
- The six regional plates retain all 22 geographies or explicitly mark missingness, disclose differing time bases and denominators, and use equal-size centroid marks over quiet Natural Earth context. They are research surfaces, not reviewed boundaries, population-weighted maps, or final scenes.
- `selected_story` remains null inside the TASK-068 generated provenance because that run records the evidence gate, not the later context decision. TASK-069 is the durable selection record. Do not edit generated EDA provenance by hand.

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
- Candidate comparisons stay within indicators. Their raw values are never summed, averaged across measures, or added to the Adaptation Gap Index.
- The TASK-067 and TASK-068 figures are research surfaces, not final publication scenes. Their evidence contracts are approved; their final responsive composition belongs to TASK-072/TASK-075.

## Next Priorities

1. Owner-review the settled `TASK-077` screenshot matrix while keeping the current application UI—not the concept boards—as the visual-identity authority.
2. Keep the complete cross-current distribution visible and reject any reading that turns the largest seven-place quadrant into a single Pacific trajectory.
3. Preserve the separation of measured condition and evidence visibility; do not publish the unstable heatmap order as clusters or describe coverage/monitoring as preparedness.
4. Keep outlook, the Adaptation Gap Index, rank fragility, and JSD as secondary caveated Explore evidence rather than guided claims.
5. Resolve or explicitly disposition the pre-existing lint, local-script static-analysis, and development-dependency audit findings before release readiness is reclaimed.
