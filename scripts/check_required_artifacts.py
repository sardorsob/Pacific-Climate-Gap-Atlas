"""Validate that required scaffold artifacts exist."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_PATHS = [
    "README.md",
    ".gitignore",
    ".env.example",
    "pyproject.toml",
    "package.json",
    "research/official_datasets_2026.csv",
    "research/pacific_dataviz_2026_research_brief.md",
    "context/PROJECT.md",
    "context/PROBLEM.md",
    "context/SCOPE.md",
    "context/TASKS.md",
    "context/AGENTS.md",
    "context/ANALYSIS_BACKLOG.md",
    "context/ANALYSIS_BRIEF.md",
    "context/DATA_CARD.md",
    "context/MODEL_CARD.md",
    "context/EXPERIMENTS.md",
    "context/ASSUMPTIONS.md",
    "context/DECISIONS.md",
    "context/STRUCTURE.md",
    "context/HANDOVER.md",
    "configs/datasets.yml",
    "configs/eda.yml",
    "configs/gap_index.yml",
    "configs/outlook.yml",
    "analysis/__init__.py",
    "analysis/eda/divergence.py",
    "analysis/eda/regional_patterns.py",
    "analysis/eda/regional_figures.py",
    "app/package.json",
    "scripts/validate_task_statuses.py",
    "scripts/check_secrets.py",
    "scripts/run_eda.py",
    "data/external/geography_context.csv",
    "artifacts/provenance/geography_context_sources.json",
    "artifacts/tables/eda_coverage_by_geography.csv",
    "artifacts/tables/eda_coverage_by_dataset.csv",
    "artifacts/tables/eda_indicator_forensics.csv",
    "artifacts/tables/eda_indicator_outliers.csv",
    "artifacts/tables/eda_country_story_labels.csv",
    "artifacts/tables/eda_spatial_typologies.csv",
    "artifacts/tables/eda_subregion_comparisons.csv",
    "artifacts/tables/eda_outlook_interpretation.csv",
    "artifacts/tables/eda_monitoring_gap.csv",
    "artifacts/tables/eda_evidence_fingerprints.csv",
    "artifacts/tables/eda_pairwise_jsd.csv",
    "artifacts/tables/eda_similarity_neighbors.csv",
    "artifacts/tables/eda_candidate_dataset_coverage.csv",
    "artifacts/tables/eda_candidate_comparability.csv",
    "artifacts/tables/eda_candidate_story_signals.csv",
    "artifacts/figures/eda_candidate_coverage_alignment.png",
    "artifacts/figures/eda_candidate_distributions.png",
    "artifacts/figures/eda_candidate_trends.png",
    "artifacts/figures/eda_candidate_named_place_contrasts.png",
    "artifacts/figures/eda_candidate_reporting_visibility.png",
    "artifacts/figures/eda_candidate_story_auditions.png",
    "artifacts/tables/eda_regional_feature_matrix.csv",
    "artifacts/tables/eda_regional_distribution_summary.csv",
    "artifacts/tables/eda_regional_crosscurrents.csv",
    "artifacts/tables/eda_regional_pairwise_relationships.csv",
    "artifacts/tables/eda_regional_cluster_stability.csv",
    "artifacts/figures/eda_regional_distributions.png",
    "artifacts/figures/eda_regional_crosscurrents.png",
    "artifacts/figures/eda_regional_condition_heatmap.png",
    "artifacts/figures/eda_regional_visibility_heatmap.png",
    "artifacts/figures/eda_regional_relationships.png",
    "artifacts/figures/eda_regional_maps.png",
    "artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/meta.json",
    "artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/config.yaml",
    "artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/seeds.json",
    "artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/inputs.json",
    "artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/outputs.json",
    "artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/metrics.json",
    "artifacts/logs/runs/2026-07-14__0000__task-068-regional-eda__678a645/notes.md",
    "artifacts/provenance/eda_summary.json",
    "artifacts/provenance/divergence_summary.json",
    "tests/analysis/test_divergence.py",
    "tests/analysis/test_eda_regional_patterns.py",
]


def main() -> int:
    missing = [path for path in REQUIRED_PATHS if not (ROOT / path).exists()]
    if missing:
        print("Missing required artifacts:")
        for path in missing:
            print(f"- {path}")
        return 1

    print(f"Required artifact check passed ({len(REQUIRED_PATHS)} paths).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
