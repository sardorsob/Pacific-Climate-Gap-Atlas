# Raw Data

Immutable official source pulls go here. This folder is ignored by Git except for this README and `.gitkeep`.

## Manual Download Cache

For sprint reliability, manually downloaded SDMX CSV files can be placed in `data/raw/official/`.
`scripts/make_dataset.py` will use matching local files before calling the live API.

In the Pacific Data Hub download menu, choose **Filtered data in tabular text (CSV)** for the currently selected indicator. Do not use unfiltered data unless the pipeline is intentionally being changed to ingest a full dataflow with multiple indicators.

| Dataset | Filename |
| --- | --- |
| Mean sea surface temperature anomalies | `mean-sea-surface-temperature-anomalies.csv` |
| Mean surface temperature anomalies | `mean-surface-temperature-anomalies.csv` |
| Rainfall anomalies | `rainfall-anomalies.csv` |
| Sea level anomalies | `sea-level-anomalies.csv` |
| Number of directly affected persons attributed to disasters | `number-of-directly-affected-persons-attributed-to-disasters.csv` |
| Meteorological monitoring network | `meteorological-monitoring-network.csv` |
| Power generation | `power-generation.csv` |
| Fisheries management measures in place and multilateral and bilateral fisheries management arrangements | `fisheries-management-measures-in-place-and-multilateral-and-bilateral-fisheries-management-arrangements.csv` |
| Greenhouse gas emissions per capita | `greenhouse-gas-emissions-per-capita.csv` |
| Population growth | `population-growth.csv` |
| Renewable energy share in the total final energy consumption | `renewable-energy-share-in-the-total-final-energy-consumption.csv` |
| Proportion of population using safely managed drinking water services | `proportion-of-population-using-safely-managed-drinking-water-services.csv` |
| Crop yield | `crop-yield.csv` |
| Direct disaster economic loss | `direct-disaster-economic-loss.csv` |
| Climate altering land cover index | `climate-altering-land-cover-index.csv` |

Expected key columns: `GEO_PICT`, `TIME_PERIOD`, and `OBS_VALUE`.

## Reproducible Acquisition And Profiling

```powershell
python scripts/fetch_official_data.py --config configs/datasets.yml --supplementary "Crop yield - disaggregated"
python scripts/profile_datasets.py --config configs/datasets.yml
```

The fetch writes `data/raw/official/manifest.json` with status, row/byte counts, SHA-256 source hash, requested/effective endpoints, initial API status, and fallback note for every configured response. The optional supplementary name is recorded in a separate manifest section and does not change the 15-source candidate count. The cache and manifest are deliberately ignored because raw source pulls are reproducible and may be large; the profile table and contracts are tracked.

When `manifest.json` exists, profiling and processing accept a matching CSV only when its manifest status is `ok` and its byte-level SHA-256 matches. A failed or mismatched manifest entry is never treated as a successful stale cache. Manual cache files remain supported when no manifest exists.

The current Pacific v2 dataflow URLs return HTTP `422` for empty key dimensions. The fetcher retries those URLs through the documented stable Pacific Data Hub `/rest/data/{flowRef}/{key}/{provider}` interface with SDMX CSV 2.1 while preserving the configured source URL in provenance.

`TASK-065` also inspected `crop-yield-disaggregated.csv` as supplementary raw evidence because the aggregate crop response does not expose crop-item composition. It is not a seventh candidate and is not part of the 15-source profile. The official inventory API URL is `https://stats-sdmx-disseminate.pacificdata.org/rest/v2/data/dataflow/SPC/DF_AGRICULTURAL_PRODUCTION/1.0/A...?dimensionAtObservation=AllDimensions`; the reproducible supplementary manifest records 20,725 rows and SHA-256 `e48862c7b22cf90c75ee2d8c49dae237b89c5243a6d0802c2eebe71b780b3105`. The data expose 78 crop items, two production types, and `KGHA`/`KG_AN` units, confirming that the 900-row aggregate is unsafe for cross-place interpretation without item-aware processing.
