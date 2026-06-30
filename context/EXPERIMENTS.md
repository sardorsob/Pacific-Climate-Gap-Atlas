# Experiments

## Run ID Format

```text
YYYY-MM-DD__HHMM__<short_tag>__<git_shortsha>
```

## Registry Template

```text
## <run_id>
- Task:
- Purpose:
- Config:
- Data version:
- Split:
- Method/model:
- Primary metric:
- Secondary metrics:
- Artifacts:
- Decision:
- Reason:
```

Do not delete failed or rejected runs. Mark them as rejected and explain why.

## 2026-06-24__task-004-outlook-baseline
- Task: TASK-004
- Purpose: Test whether a simple climate-signal trend outlook is defensible enough for a secondary exploratory layer.
- Config: `configs/outlook.yml`
- Data version: `data/processed/official_observations.csv` and `artifacts/tables/adaptation_gap_index.csv`
- Split: Last three observations held out per eligible climate-signal geography/dataset series.
- Method/model: Per-series linear trend for climate indicators; capacity flat or gradual-improvement scenarios.
- Primary metric: Holdout MAE versus latest-value naive baseline.
- Secondary metrics: trend series count, projection rows, residual spread, row caveats.
- Artifacts: `artifacts/tables/adaptation_gap_outlook.csv`, `artifacts/tables/climate_trend_diagnostics.csv`, `artifacts/provenance/outlook_summary.json`
- Decision: Accept as methodology-ready and app-optional.
- Reason: Aggregate linear MAE beats naive MAE, but only 39 of 86 individual series beat naive; use only with visible caveats.

## 2026-06-30__task-019-evidence-fingerprint-divergence
- Task: TASK-019
- Purpose: Test whether Jensen-Shannon divergence over official-data-derived evidence profiles adds useful explanatory comparison without becoming a new ranking.
- Config: `configs/eda.yml`.
- Data version: `artifacts/tables/adaptation_gap_indicator_trace.csv`, `artifacts/tables/eda_country_drivers.csv`, `artifacts/tables/eda_monitoring_gap.csv`, and related EDA tables.
- Split: Not applicable; descriptive similarity analysis, not prediction.
- Method/model: Normalize combined evidence vectors by geography; compute unordered pairwise base-2 JSD; retain missingness and monitoring-reporting status as explicit fingerprint components. KL was not used for public artifacts.
- Primary metric: Interpretability and stability of nearest-neighbor evidence profiles.
- Secondary metrics: vector coverage, missingness status counts, pairwise JSD range, similarity-band counts, exemplar QA notes.
- Artifacts: `artifacts/tables/eda_evidence_fingerprints.csv`, `artifacts/tables/eda_pairwise_jsd.csv`, `artifacts/tables/eda_similarity_neighbors.csv`, `artifacts/provenance/divergence_summary.json`.
- Decision: Accept as analysis-ready; app layer decision pending.
- Reason: Outputs are bounded, traceable, and caveated enough for selected-geography comparison, but they should not become a leaderboard or shipped UI until app-data wiring and visual QA are done.
