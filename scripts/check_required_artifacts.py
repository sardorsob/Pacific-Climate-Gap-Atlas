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
    "artifacts/provenance/eda_summary.json",
    "artifacts/provenance/divergence_summary.json",
    "tests/analysis/test_divergence.py",
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
