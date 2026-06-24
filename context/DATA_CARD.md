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

## Raw Data Policy

- `data/raw/` is immutable and ignored by Git except for documentation.
- Manual raw-cache filenames are listed in `data/raw/README.md`.
- `data/interim/` is ignored and can be regenerated.
- `data/processed/` can be selectively tracked when files are small and needed by the app.
- Every reusable processed dataset needs a contract under `data/contracts/`.

## PII / Sensitive Data

No personal-level data is expected. If any dataset contains sensitive or private fields, stop and update this card before continuing.
