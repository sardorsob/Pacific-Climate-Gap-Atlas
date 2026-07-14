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

## 2026-07-13__task-067-candidate-research-atlas
- Task: TASK-067
- Purpose: Audit the five accepted candidate datasets for comparability and test which story directions survive contact with the evidence.
- Config: `configs/eda.yml`.
- Data version: `data/processed/official_observations.csv` from TASK-066: 16,410 rows across 14 datasets, including 2,403 candidate rows.
- Split: Not applicable; descriptive exploration and claim auditing, not prediction.
- Method/model: Returned-row/structural coverage audit, explicit direct-loss unit normalization, latest-value distributions with year visibility, small-multiple trajectories, named-place within-indicator contrasts, a loss reporting raster, and three provisional evidence-board auditions. No imputation, smoothing, causal model, new composite, or cross-unit arithmetic.
- Primary metric: Whether every candidate receives a defensible comparison judgment and every audition has a traceable claim chain plus visible rejection risk.
- Secondary metrics: 5 candidate datasets, 22 total geographies, 39/168 direct-loss geography-years, latest-year spreads, within-indicator endpoint changes, and supported/weak/contradicted/unavailable hypothesis counts.
- Artifacts: Three `eda_candidate_*.csv` tables, five analytical `eda_candidate_*.png` figures, one `eda_candidate_story_auditions.png` contact sheet, and refreshed `artifacts/provenance/eda_summary.json`.
- Decision: Retain all three auditions for TASK-068 review; select no winner in TASK-067.
- Reason: The data support different clocks/reporting visibility, service-versus-energy cross-currents, and profile-over-ladder arguments, but none yet carries the full final story without scientific and owner judgment. Land-cover direction remains unresolved, disaster-loss continuity/per-capita claims are unsupported, and climate causality is unavailable.
