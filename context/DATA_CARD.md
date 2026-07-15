# Data Card

## Dataset Family

Pacific Dataviz Challenge 2026 official datasets, listed in `research/official_datasets_2026.csv`.

## Source Owner

Pacific Data Hub / Pacific Community data infrastructure, as referenced by the official challenge dataset inventory.

## Usage

At least one official dataset is required for the competition. This project targets a multi-dataset official-data spine and may add open external GIS reference files only when they improve map usability or boundary context.

## TASK-065 Acquisition and TASK-066 Processing Gates

`TASK-065` fetched and profiled six additional official candidates. `TASK-066` now enables only the five accepted candidates for processed analysis: population growth, renewable-energy share, safely managed drinking water, direct disaster economic loss, and climate-altering land cover. Aggregate crop yield remains `processing_enabled: false` and is absent from processed output. The expanded evidence base contains 14 official datasets; none of the five candidate pillars enters the baseline index, public app data, guided story, or scene logic. The ignored raw manifest records 15/15 successful source pulls, byte counts, row counts, 64-character SHA-256 hashes, requested/effective endpoints, and fallback results; the tracked profile and contracts preserve those facts and the review decisions.

| Candidate | Rows | Geographies | Years | Units | Blank/non-numeric values in returned rows | Observed/possible geography-years | Gate | Evidence-based reason |
| --- | ---: | ---: | --- | --- | ---: | ---: | --- | --- |
| Population growth | 792 | 22 | 1990–2025 | `PERCENT` | 0 | 792/792 (100.0%) | accept for processing | all rows are flagged `E` and cite `Population projections (PDH.Stat)`; treat as published projection/estimated rates, not observed change or population size |
| Renewable energy share | 461 | 20 | 2000–2023 | `PERCENT` | 0 | 461/480 (96.0%) | accept for processing | comparable rate fields support transition-context review |
| Safely managed drinking water | 430 | 19 | 2000–2022 | `PERCENT` | 0 | 430/437 (98.4%) | accept for processing | useful essential-service context if kept descriptive and non-causal |
| Crop yield | 900 | 15 | 1961–2024 | `KGHA` | 0 | 900/960 (93.8%) | reject | aggregate rows hide crop-item composition and would conflate changing crop mixes |
| Direct disaster economic loss | 39 | 12 | 2007–2020 | `USD`, `USD_MILLIONS` | 0 | 39/168 (23.2%) | accept for processing | sparse recorded-loss evidence is exploratory only and must retain unit/reporting limits |
| Climate-altering land-cover index | 681 | 22 | 1992–2022 | `PERCENT` | 0 | 681/682 (99.9%) | accept for processing | broad coverage supports descriptive review with direction/baseline caveats |

Returned-row value coverage and structural reporting coverage are separate. Zero blank/non-numeric `OBS_VALUE` cells means only that every returned row has a numeric value. Structural coverage counts distinct observed geography-years against every geography-year in the returned geography/year span; a missing geography-year is not evidence of zero or no event.

The crop decision includes the required supplementary grain inspection. The official disaggregated response has 20,725 rows across 15 geographies and 1961–2024, with 78 crop items, two production types, and `KGHA`/`KG_AN` units. It confirms that the 900-row one-row-per-geography-year aggregate is not item-comparable. The disaggregated source is inspection evidence only, not a seventh candidate.

The filtered responses do not contain denominator values. Contracts state the indicator-implied denominator or `not applicable` and do not invent values. Dataset-specific licences were not stated in the reviewed indicator pages or SDMX responses; contracts therefore say `not stated in reviewed source metadata`. [Pacific Data Hub terms](https://pacificdata.org/terms-use) also instruct users to check the licence attached to each dataset rather than infer one platform-wide licence.

Acceptance here means normalized for `TASK-067` comparability review. It does not make a candidate a score input, public app field, narrative claim, or new composite index.

## TASK-001 Profile Artifacts

The tracked profiler now writes:

- `artifacts/tables/dataset_profile.csv`: flat returned-row value coverage, structural geography-year coverage, dimensions, unit, human-reviewed grain, denominator, source-semantic, licence, acquisition provenance, caveat, and processing-decision summary.
- `data/contracts/*.json`: per-dataset requested/effective source, fallback, hash, returned-row coverage, structural coverage, schema, semantics, caveat, and acquisition-decision contracts.

Run command:

```powershell
python scripts/profile_datasets.py --config configs/datasets.yml
```

Fetch before profiling so the profile is cache-reproducible. Live response text is encoded once and the same byte payload is written, counted, and hashed. When a manifest exists, cache use requires its expected entry, an `ok` status, a present readable UTF-8 file, and an exact byte-level SHA-256 match; any failure becomes `cache_manifest_error` rather than an `ok` profile or an unmanifested live replacement. When no manifest exists, an absent file may be fetched and a manually supplied file remains supported. The fetcher first calls the inventory v2 URL, then translates HTTP `422` responses to the [documented stable interface](https://docs.pacificdata.org/dotstat/api/interface) at `/rest/data/{flowRef}/{key}/{provider}` with the SDMX CSV 2.1 media type. PowerShell remains a final Windows transport fallback for network behavior unrelated to the API route.

## Coverage Findings

Priority official datasets from the reproducible `TASK-001` profile:

| Dataset | Role | Rows | Geographies | Years | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Mean sea surface temperature anomalies | climate signal | 3,696 | 21 | 1850-2025 | strong long time series |
| Mean surface temperature anomalies | climate signal | 3,872 | 22 | 1850-2025 | strong long time series |
| Rainfall anomalies | climate signal | 1,034 | 22 | 1979-2025 | useful climate variability layer |
| Sea level anomalies | climate signal | 651 | 21 | 1993-2023 | central coastal pressure layer |
| Directly affected persons attributed to disasters | observed stress | 174 | 21 | 2005-2023 | sparse but highly relevant |
| Meteorological monitoring network | adaptation capacity | 1,650 | 18 | 1889-2026 | core monitoring-gap layer |
| Power generation | adaptation capacity | 432 | 18 | 2000-2023 | proxy for infrastructure/energy context |
| Fisheries management measures | adaptation capacity | 1,563 | 22 | 1903-2026 | governance/blue-economy capacity signal |
| GHG emissions per capita | responsibility context | 935 | 17 | 1970-2024 | context, not a blame score |

Fourteen geographies appeared across all nine candidate datasets during the initial live API profile:

```text
FJ, FM, KI, MH, NC, NR, PF, PG, PW, SB, TO, TV, VU, WS
```

## Known API Caveats

The current v2 dataflow routes return `422 Unprocessable Entity` for the inventory keys with empty dimensions. The documented stable API succeeds when the full agency, flow, and version reference is preserved; using only the short flow identifier returned `403` for four SDG flows during live verification. The focused fetch test locks the full-reference transform. Manifest and tracked contracts now retain the initial `api_error_422`, effective stable URL, and exact fallback note. Final acquisition succeeded for all 15 configured datasets, and any future hard failure remains explicit in the raw manifest and profile status rather than being silently removed or represented by a stale cache path.

The stable sea-level response reports `UNIT_MEASURE=METER`. Earlier source-page research described millimetres, so downstream work must preserve the API unit and resolve that metadata/API discrepancy before conversion or public copy; this task does not reinterpret the values.

## TASK-002 Processed Data Artifacts

The processed pipeline now writes:

- `data/processed/official_observations.csv`: 16,410 normalized long-form official observations across 14 priority datasets and 22 geographies.
- `data/processed/geography_lookup.csv`: geography-level dataset coverage, row counts, and year ranges.
- `data/processed/app/atlas_dataset_summary.json`: compact app-ready dataset and geography metadata without geometry.
- `artifacts/provenance/dataset_pipeline_summary.json`: row-count, source URL, content hash, and output provenance.

Run command:

```powershell
python scripts/make_dataset.py --config configs/datasets.yml
```

The pipeline selects only entries whose `processing_enabled` value is true; missing values default to true for the original nine. It uses valid local files in `data/raw/official/` first. If a manifest exists, status and SHA-256 must match before processing; if a file is absent, the pipeline fetches from the official SDMX CSV API and writes the ignored raw cache.

`TASK-066` adds one deterministic `source_metadata` JSON field rather than dataset-specific columns. It preserves every non-core SDMX dimension and attribute, including disaggregation, nature, data-source, and observation-comment fields, while the existing columns retain values, units, geography/year keys, observation/reporting flags, URLs, and content hashes. Candidate row hashes include that metadata; the original nine retain their existing row-hash contract. The refreshed content hashes match the validated `TASK-065` raw manifest. The compact dataset summary is research metadata only: it is not mirrored into `app/public/data/` or consumed by a scene.

## TASK-003 Index Artifacts

The baseline index pipeline now writes:

- `artifacts/tables/adaptation_gap_index.csv`: 22 geography-level adaptation-gap scores and missingness fields.
- `artifacts/tables/adaptation_gap_indicator_trace.csv`: 182 latest-observation indicator trace rows behind the score.
- `artifacts/provenance/gap_index_summary.json`: method summary, top/bottom ranked geographies, and caveats.

Run command:

```powershell
python scripts/build_gap_index.py --config configs/gap_index.yml
```

The score is comparative within the available Pacific geographies. It uses latest observations, percentile ranks, absolute anomaly magnitudes for anomaly datasets, equal weights, and no missing-value imputation. The index pipeline explicitly admits only the established climate-signal, observed-stress, adaptation-capacity, and responsibility-context pillars. A `TASK-066` equivalence check confirmed the serialized 22-row index and 182-row indicator trace are unchanged after candidate processing.

## TASK-004 Outlook Artifacts

The outlook pipeline now writes:

- `artifacts/tables/adaptation_gap_outlook.csv`: 2030 and 2050 scenario rows for `capacity_flat` and `capacity_gradual_improvement`.
- `artifacts/tables/climate_trend_diagnostics.csv`: per-geography climate-signal trend diagnostics and holdout comparisons.
- `artifacts/provenance/outlook_summary.json`: metrics, caveats, inputs, and outputs.

Run command:

```powershell
python scripts/run_outlook.py --config configs/outlook.yml
```

The outlook is a transparent stress-test layer, not an operational forecast. It should remain secondary unless caveats are visible in the app.

## TASK-005 App Data Artifacts

The app-data exporter now writes:

- `data/processed/app/geographies.json`: app-facing geography records with scores, source refs, centroid metadata, and nested outlook values.
- `data/processed/app/country_details.json`: detail-panel records with indicator trace rows.
- `data/processed/app/pacific_land_context.geojson`: Natural Earth land context for the MapLibre substrate.
- `app/public/data/geographies.json`, `country_details.json`, and `pacific_land_context.geojson`: byte-for-byte public copies consumed by the web app.
- `artifacts/provenance/app_data_summary.json`: output counts, source refs, and geometry policy.

Run command:

```powershell
python scripts/build_app_data.py
python scripts/validate_data_contracts.py
```

Current output includes 22 geography records and a separate Natural Earth land-context GeoJSON. Scored geography geometry remains centroid fallback, so the app styles score layers as fixed presence points rather than polygon choropleths.

`TASK-048` corrected the evidence-count contract. Each geography now exposes `score_input_indicator_count` (0–8 score inputs), `context_indicator_count` (context-only datasets, currently 0–1), `trace_indicator_count` (all trace datasets), and an ordered `score_input_presence` list. Responsibility-context greenhouse-gas data remains traceable but never feeds the score-input count or evidence-density component.

## TASK-029 Land Context Artifacts

The land-context builder now writes:

- `data/processed/app/pacific_land_context.geojson`: compact Pacific land polygons derived from Natural Earth 10m land and shifted into the app's Pacific longitude space.
- `app/public/data/pacific_land_context.geojson`: public copy consumed by the web app.
- `artifacts/provenance/land_context_summary.json`: source URL, Natural Earth terms URL, feature counts, output paths, and caveats.

Run command:

```powershell
python scripts/build_land_context.py
```

Natural Earth 10m land is public domain. In this project it is a visual land-context layer only. It is not a score input, official territorial boundary source, selectable geography layer, or choropleth geometry.

## TASK-010 GIS Context Artifacts

The GIS context enrichment now writes:

- `data/external/geography_context.csv`: descriptive Pacific subregion, political-status, administering/sovereign authority, island-group notes, and review flags for all 22 scored geographies.
- `artifacts/provenance/geography_context_sources.json`: source keys, URLs, caveats, and review recommendations for the context table.

This table is not a score input. UN M49 subregions are statistical groupings, not cultural or political boundary claims. Political-status labels are conservative and flagged for review where legal or diplomatic wording is sensitive.

## TASK-009 EDA Artifacts

The script-first EDA foundation now writes:

- `artifacts/tables/eda_data_coverage.csv`: geography-level coverage tiers, year spans, row counts, and data-desert flags.
- `artifacts/tables/eda_coverage_by_geography.csv`: geography-level dataset/pillar coverage, missing-dataset flags, year spans, and coverage caveats.
- `artifacts/tables/eda_coverage_by_dataset.csv`: dataset-level geography coverage, missing-geography lists, row counts, year spans, and long-timeseries caveats.
- `artifacts/tables/eda_indicator_forensics.csv`: row-level indicator trace forensics with raw values, scoring values, within-indicator ranks, score roles, and outlier fields.
- `artifacts/tables/eda_indicator_outliers.csv`: within-dataset scoring-value outliers using 1.5x IQR fences.
- `artifacts/tables/eda_country_drivers.csv`: descriptive country driver labels, score ranks, evidence-density labels, pressure/capacity signal counts, and caveat fields.
- `artifacts/tables/eda_country_story_labels.csv`: compact app-ready story labels, priorities, exemplar flags, and non-causal caveats for scored geographies.
- `artifacts/tables/eda_spatial_typologies.csv`: rule-based geography typologies joined to GIS context, story labels, coverage flags, and rank caveats.
- `artifacts/tables/eda_subregion_comparisons.csv`: small-sample subregion summaries with dominant typologies, high-gap counts, coverage/monitoring counts, and caveats.
- `artifacts/tables/index_sensitivity.csv`: baseline, pressure-heavy, and capacity-heavy rank comparisons.
- `artifacts/tables/eda_rank_volatility.csv`: weight-shift and leave-one-indicator rank-volatility summary for uncertainty framing.
- `artifacts/tables/eda_trend_profiles.csv`: trend diagnostic summaries by geography.
- `artifacts/tables/eda_outlook_interpretation.csv`: scenario/horizon outlook movement interpretation with diagnostic quality labels and display/withhold recommendations.
- `artifacts/tables/eda_monitoring_gap.csv`: monitoring proxy coverage compared with adaptation-gap and pressure/capacity scores, including GIS story quadrants, reporting status, and missing-reporting caveats.
- `artifacts/provenance/eda_summary.json`: input/output paths, row counts, early signal counts, and caveats.

Run command:

```powershell
python scripts/run_eda.py --config configs/eda.yml
```

This is descriptive EDA only. It is designed to guide deeper analysis and story selection, not to make causal claims or finalize the atlas narrative. Coverage outputs describe official-data availability, not outcomes. Indicator outliers compare values within the same dataset and unit only. Country story labels and spatial typologies are descriptive screens, not causal explanations. Outlook interpretation is stress-test display guidance, not forecasting. Missing monitoring rows are reporting gaps, not confirmed infrastructure absence. Rank-volatility outputs should be used to caveat or de-emphasize rank order, not to create a new definitive ranking.

## TASK-067 Candidate Research Atlas

The same EDA command now also writes three candidate evidence tables:

- `artifacts/tables/eda_candidate_dataset_coverage.csv`: returned rows, geography coverage, time span, observed/possible geography-years, latest-year spread, units, and missingness caveat for all five candidates.
- `artifacts/tables/eda_candidate_comparability.csv`: measure kind, denominator, explicit unit conversion, permitted within-indicator use, latest-year basis, missingness interpretation, and one comparability judgment per candidate.
- `artifacts/tables/eda_candidate_story_signals.csv`: eight bounded hypotheses spanning supported, weak, contradicted, and unavailable results, each with evidence, named places, time basis, decision, and caveat.

It also writes five analytical PNGs plus one three-audition contact sheet under `artifacts/figures/`. Each figure is generated directly from the processed official rows, keeps units and years visible, cites the Pacific Data Hub source, and places its key interpretive limit on the plate. Matplotlib is the only new plotting dependency; no notebook, Plotly, interactive GIS, app layer, or final scene was added.

The comparability decisions are deliberately restrictive:

| Candidate | Comparison judgment | Permitted use |
| --- | --- | --- |
| Population growth | `comparable_within_indicator` | published projection/estimated rate context only; never observed realized change, population size, or vulnerability |
| Renewable energy share | `comparable_within_indicator` | trends and latest shares within this indicator only |
| Safely managed drinking water | `comparable_with_latest_year_caution` | within-geography trends and named latest values with 2020–2022 years shown |
| Direct disaster economic loss | `reporting_visibility_only` | recorded event-years after explicit `USD_MILLIONS` to USD conversion; no continuous, zero-filled, per-capita, or GDP-normalized trend |
| Climate-altering land-cover index | `direction_requires_source_review` | inspect shape and range only; do not label direction, high, or low as better/worse |

Manual raw-to-processed traces reproduced the strongest descriptive cross-current exactly: Papua New Guinea water 31.75 (2000) to 50.24 (2022) while renewable share changes 66.38 to 50.78; Samoa water 87.06 to 99.04 while renewable changes 59.69 to 31.75. The weakest signal also reproduces exactly but remains semantically withheld: the land-cover index has Samoa 51.4 and Solomon Islands 133.3 in 2022, while Vanuatu changes from 668.4 in 1992 to 104.7 in 2022. These values do not resolve what index direction or baseline means.

The direct-loss source has 35 `USD` rows and four `USD_MILLIONS` rows. The analysis converts only the four explicitly marked million-unit rows. Its 39 returned records cover 12 geographies and 23.2% of possible geography-years in 2007–2020; blank years are absence of returned records, not evidence of no disaster or no loss.

The three contact-sheet auditions—different clocks/visibility, progress cross-currents, and profiles instead of a ladder—are provisional research alternatives. `TASK-067` does not choose one, combine the candidates into a score, or change public app data. The owner accepted this research pass and chose a regional synthesis as a working hypothesis; `TASK-068` tests it and `TASK-069` owns final scientific/owner selection.

Pipeline boundary: the existing nine-dataset coverage/driver/JSD lane is rebuilt from baseline observations only. Candidate rows feed only the new candidate tables and figures. This keeps the already app-wired similarity artifacts byte-stable while the expanded 14-dataset lookup can still report broad research coverage.

## TASK-068 Regional EDA Contract and Result

The completed EDA pass uses the same 16,410-row processed evidence base and adds no dataset, score, public field, or story scene. It writes five reviewed tables and six static research plates covering complete within-indicator distributions, water/renewable cross-currents, measured-condition ordering, separately constructed evidence visibility, pairwise relationships, ordering sensitivity, and equal-presence centroid maps.

The feature matrix contains 594 cells: 286 measured-condition cells for 22 geographies by 13 features and 308 independently constructed evidence-visibility cells for 22 by 14. It preserves 21 missing measured-condition cells and 31 absent visibility cells without imputation. Raw values remain beside within-indicator percentiles used only for research display/order; they are never averaged into a score. Each condition cell records its raw/display value, unit, latest year, denominator, source-row hash, source, caveat, and presence state. Visibility cells report official-record presence or reviewed coverage/proxy counts and cannot define measured-condition similarity.

The water/renewable endpoint table has 19 complete pairs: seven water-up/renewable-down, six both-up, three both-down, and three water-down/renewable-up. The relationship table contains 36 pairwise Spearman diagnostics with pairwise `n`, units, denominators, year ranges, and withholding/dependency states. Four comparisons are explicitly direct or transitive derived dependencies: gap versus pressure (rho 0.2490, n=22), gap versus capacity (rho -0.7414, n=22), gap versus latest monitoring count (rho -0.7927, n=18), and capacity versus latest monitoring count (rho 0.8469, n=18). Monitoring contributes to capacity and therefore indirectly to the gap score; none of these four correlations is independent confirmation. Missing monitoring records are excluded from numeric overlap rather than converted to zero.

Average-linkage seriation uses NaN-aware shared-feature RMS distance and does not impute. The 13 leave-one-feature checks reach a minimum position Spearman of -0.6962 and a maximum 20-position shift. The durable decisions are `reject_stable_regional_structure` and `reject_public_grouping`; no cluster labels, preparedness classes, natural island groups, vulnerability categories, or policy recommendations are emitted.

The deterministic bundle at `artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/` records `meta.json`, `config.yaml`, `seeds.json`, `inputs.json`, `outputs.json`, `metrics.json`, and `notes.md`. Direct loss remains reporting visibility only; land-cover direction remains withheld; population remains published projection/estimate context; and equal-size centroid/Natural Earth geometry remains visual orientation rather than reviewed boundaries. The summary retains `selected_story: null`; these outputs are decision inputs for `TASK-069`, not final publication scenes.

## TASK-019 Divergence Artifacts

The Evidence Fingerprint Divergence lane derives analysis tables from official-data-derived trace and EDA fields rather than introducing an outside data source. TASK-037 exports nearest-neighbor rows into app-ready `geographies.json` for selected-place detail.

Produced outputs:

- `artifacts/tables/eda_evidence_fingerprints.csv`
- `artifacts/tables/eda_pairwise_jsd.csv`
- `artifacts/tables/eda_similarity_neighbors.csv`
- `artifacts/provenance/divergence_summary.json`

These outputs should document vector components, normalization, smoothing if any, missingness treatment, and caveats. They must not be interpreted as natural clusters, causal similarity, or shared policy need.

## Raw Data Policy

- `data/raw/` is immutable and ignored by Git except for documentation.
- Manual raw-cache filenames are listed in `data/raw/README.md`.
- `data/processed/` can be selectively tracked when files are small and needed by the app.
- Every reusable processed dataset needs a contract under `data/contracts/`.

## PII / Sensitive Data

No personal-level data is expected. If any dataset contains sensitive or private fields, stop and update this card before continuing.
