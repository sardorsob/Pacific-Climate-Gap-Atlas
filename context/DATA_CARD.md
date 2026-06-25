# Data Card

## Dataset Family

Pacific Dataviz Challenge 2026 official datasets, listed in `research/official_datasets_2026.csv`.

## Source Owner

Pacific Data Hub / Pacific Community data infrastructure, as referenced by the official challenge dataset inventory.

## Usage

At least one official dataset is required for the competition. This project targets a multi-dataset official-data spine and may add open external GIS reference files only when they improve map usability or boundary context.

## TASK-001 Profile Artifacts

The tracked profiler now writes:

- `artifacts/tables/dataset_profile.csv`: flat row/geography/year/missingness summary for the configured priority datasets.
- `data/contracts/*.json`: per-dataset source, coverage, schema, and caveat contracts.

Run command:

```powershell
python scripts/profile_datasets.py --config configs/datasets.yml
```

The script first tries Python standard-library HTTP and falls back to Windows PowerShell `Invoke-WebRequest -UseBasicParsing` when the Pacific SDMX endpoint returns `422` to the Python client. The fallback preserves the same configured SDMX CSV accept header.

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

Some generated SDMX URLs returned `422 Unprocessable Entity` to Python standard-library requests but succeeded through PowerShell `Invoke-WebRequest` using `Accept: application/vnd.sdmx.data+csv;version=2.0`. The profiling script records hard failures as dataset caveats rather than silently removing them.

## TASK-002 Processed Data Artifacts

The processed pipeline now writes:

- `data/processed/official_observations.csv`: 14,007 normalized long-form official observations across nine priority datasets and 22 geographies.
- `data/processed/geography_lookup.csv`: geography-level dataset coverage, row counts, and year ranges.
- `data/processed/app/atlas_dataset_summary.json`: compact app-ready dataset and geography metadata without geometry.
- `artifacts/provenance/dataset_pipeline_summary.json`: row-count, source URL, content hash, and output provenance.

Run command:

```powershell
python scripts/make_dataset.py --config configs/datasets.yml
```

The pipeline uses local files in `data/raw/official/` first. If they are missing, it fetches from the official SDMX CSV API and writes the ignored raw cache.

## TASK-003 Index Artifacts

The baseline index pipeline now writes:

- `artifacts/tables/adaptation_gap_index.csv`: 22 geography-level adaptation-gap scores and missingness fields.
- `artifacts/tables/adaptation_gap_indicator_trace.csv`: 182 latest-observation indicator trace rows behind the score.
- `artifacts/provenance/gap_index_summary.json`: method summary, top/bottom ranked geographies, and caveats.

Run command:

```powershell
python scripts/build_gap_index.py --config configs/gap_index.yml
```

The score is comparative within the available Pacific geographies. It uses latest observations, percentile ranks, absolute anomaly magnitudes for anomaly datasets, equal weights, and no missing-value imputation.

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
- `data/processed/app/atlas_geographies.geojson`: centroid GeoJSON for map layers with flattened score and outlook fields.
- `data/processed/app/monitoring_network.geojson`: latest monitoring-network centroid overlay.
- `data/processed/app/layers.json`: layer manifest for six atlas layers.
- `data/processed/app/country_details.json`: detail-panel records with indicator trace rows.
- `app/public/data/*`: byte-for-byte public copies consumed by the web app.
- `artifacts/provenance/app_data_summary.json`: output counts, source refs, and geometry policy.

Run command:

```powershell
python scripts/build_app_data.py --config configs/app_layers.yml
python scripts/validate_data_contracts.py
```

Current output includes 22 geography records, 6 atlas layers, and 18 monitoring overlay features. Geometry is a centroid fallback until a proper boundary join is added, so the first app iteration should style these as point/centroid layers rather than true polygon choropleths.

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
- `artifacts/tables/index_sensitivity.csv`: baseline, pressure-heavy, and capacity-heavy rank comparisons.
- `artifacts/tables/eda_rank_volatility.csv`: weight-shift and leave-one-indicator rank-volatility summary for uncertainty framing.
- `artifacts/tables/eda_trend_profiles.csv`: trend diagnostic summaries by geography.
- `artifacts/tables/eda_monitoring_gap.csv`: monitoring proxy coverage compared with adaptation-gap and pressure/capacity scores, including GIS story quadrants, reporting status, and missing-reporting caveats.
- `artifacts/provenance/eda_summary.json`: input/output paths, row counts, early signal counts, and caveats.

Run command:

```powershell
python scripts/run_eda.py --config configs/eda.yml
```

This is descriptive EDA only. It is designed to guide deeper analysis and story selection, not to make causal claims or finalize the atlas narrative. Coverage outputs describe official-data availability, not outcomes. Indicator outliers compare values within the same dataset and unit only. Country story labels are descriptive screens, not causal explanations. Missing monitoring rows are reporting gaps, not confirmed infrastructure absence. Rank-volatility outputs should be used to caveat or de-emphasize rank order, not to create a new definitive ranking.

## Raw Data Policy

- `data/raw/` is immutable and ignored by Git except for documentation.
- Manual raw-cache filenames are listed in `data/raw/README.md`.
- `data/interim/` is ignored and can be regenerated.
- `data/processed/` can be selectively tracked when files are small and needed by the app.
- Every reusable processed dataset needs a contract under `data/contracts/`.

## PII / Sensitive Data

No personal-level data is expected. If any dataset contains sensitive or private fields, stop and update this card before continuing.
