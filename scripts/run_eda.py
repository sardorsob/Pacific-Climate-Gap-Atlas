"""Run script-first exploratory analysis tables for the atlas story sprint."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from analysis.eda.candidate_datasets import (  # noqa: E402
    build_candidate_tables,
    select_baseline_observations,
)
from analysis.eda.candidate_figures import render_candidate_research_atlas  # noqa: E402
from analysis.eda.coverage import (  # noqa: E402
    build_data_coverage,
    build_monitoring_gap,
    build_task011_coverage_tables,
)
from analysis.eda.divergence import (  # noqa: E402
    build_divergence_artifacts,
    build_divergence_summary,
)
from analysis.eda.drivers import build_country_drivers, build_country_story_labels  # noqa: E402
from analysis.eda.indicator_forensics import build_indicator_forensics_tables  # noqa: E402
from analysis.eda.regional_figures import render_regional_research_atlas  # noqa: E402
from analysis.eda.regional_patterns import build_regional_tables  # noqa: E402
from analysis.eda.sensitivity import build_rank_volatility, build_weight_sensitivity  # noqa: E402
from analysis.eda.spatial_patterns import build_spatial_pattern_tables  # noqa: E402
from analysis.eda.trends import build_outlook_interpretation, build_trend_profiles  # noqa: E402

DEFAULT_CONFIG = ROOT / "configs" / "eda.yml"
DEFAULT_DATASET_PROFILE = ROOT / "artifacts" / "tables" / "dataset_profile.csv"
DEFAULT_GEOGRAPHY_CONTEXT = ROOT / "data" / "external" / "geography_context.csv"
DEFAULT_LOOKUP = ROOT / "data" / "processed" / "geography_lookup.csv"
DEFAULT_OBSERVATIONS = ROOT / "data" / "processed" / "official_observations.csv"
DEFAULT_INDEX = ROOT / "artifacts" / "tables" / "adaptation_gap_index.csv"
DEFAULT_INDICATOR_TRACE = ROOT / "artifacts" / "tables" / "adaptation_gap_indicator_trace.csv"
DEFAULT_TREND_DIAGNOSTICS = ROOT / "artifacts" / "tables" / "climate_trend_diagnostics.csv"
DEFAULT_OUTLOOK = ROOT / "artifacts" / "tables" / "adaptation_gap_outlook.csv"
DEFAULT_TABLE_DIR = ROOT / "artifacts" / "tables"
DEFAULT_FIGURE_DIR = ROOT / "artifacts" / "figures"
DEFAULT_SUMMARY = ROOT / "artifacts" / "provenance" / "eda_summary.json"
DEFAULT_DIVERGENCE_SUMMARY = ROOT / "artifacts" / "provenance" / "divergence_summary.json"
DEFAULT_GEOGRAPHIES = ROOT / "data" / "processed" / "app" / "geographies.json"
DEFAULT_LAND_CONTEXT = ROOT / "data" / "processed" / "app" / "pacific_land_context.geojson"
REGIONAL_RUN_ID = "2026-07-14__0000__task-068-regional-eda__678a645"
DEFAULT_RUN_DIR = ROOT / "artifacts" / "logs" / "runs" / REGIONAL_RUN_ID


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--dataset-profile", type=Path, default=DEFAULT_DATASET_PROFILE)
    parser.add_argument("--geography-context", type=Path, default=DEFAULT_GEOGRAPHY_CONTEXT)
    parser.add_argument("--geography-lookup", type=Path, default=DEFAULT_LOOKUP)
    parser.add_argument("--observations", type=Path, default=DEFAULT_OBSERVATIONS)
    parser.add_argument("--index", type=Path, default=DEFAULT_INDEX)
    parser.add_argument("--indicator-trace", type=Path, default=DEFAULT_INDICATOR_TRACE)
    parser.add_argument("--trend-diagnostics", type=Path, default=DEFAULT_TREND_DIAGNOSTICS)
    parser.add_argument("--outlook", type=Path, default=DEFAULT_OUTLOOK)
    parser.add_argument("--geographies", type=Path, default=DEFAULT_GEOGRAPHIES)
    parser.add_argument("--land-context", type=Path, default=DEFAULT_LAND_CONTEXT)
    parser.add_argument("--table-dir", type=Path, default=DEFAULT_TABLE_DIR)
    parser.add_argument("--figure-dir", type=Path, default=DEFAULT_FIGURE_DIR)
    parser.add_argument("--summary-output", type=Path, default=DEFAULT_SUMMARY)
    parser.add_argument(
        "--divergence-summary-output", type=Path, default=DEFAULT_DIVERGENCE_SUMMARY
    )
    parser.add_argument("--run-dir", type=Path, default=DEFAULT_RUN_DIR)
    return parser.parse_args()


def run_eda(
    *,
    config_path: Path,
    dataset_profile_path: Path,
    geography_context_path: Path,
    lookup_path: Path,
    observations_path: Path,
    index_path: Path,
    indicator_trace_path: Path,
    trend_diagnostics_path: Path,
    outlook_path: Path,
    geographies_path: Path,
    land_context_path: Path,
    table_dir: Path,
    figure_dir: Path,
    summary_output: Path,
    divergence_summary_output: Path,
    run_dir: Path,
) -> dict[str, object]:
    if not config_path.exists():
        raise FileNotFoundError(f"EDA config not found: {config_path}")

    dataset_profile = pd.read_csv(dataset_profile_path)
    geography_context = pd.read_csv(geography_context_path)
    lookup = pd.read_csv(lookup_path)
    observations = pd.read_csv(observations_path)
    index = pd.read_csv(index_path)
    indicator_trace = pd.read_csv(indicator_trace_path)
    trend_diagnostics = pd.read_csv(trend_diagnostics_path)
    outlook = pd.read_csv(outlook_path)
    geographies = json.loads(geographies_path.read_text(encoding="utf-8"))
    land_context = json.loads(land_context_path.read_text(encoding="utf-8"))

    baseline_observations = select_baseline_observations(observations)
    profile_slug_column = "slug" if "slug" in dataset_profile.columns else "dataset_slug"
    baseline_profile = dataset_profile[
        dataset_profile[profile_slug_column].isin(baseline_observations["dataset_slug"].unique())
    ]
    coverage_tables = build_task011_coverage_tables(
        baseline_observations,
        lookup,
        baseline_profile,
    )
    coverage_by_geography = coverage_tables["eda_coverage_by_geography.csv"]
    rank_volatility = build_rank_volatility(index, indicator_trace)
    country_drivers = build_country_drivers(
        index,
        indicator_trace=indicator_trace,
        coverage_by_geography=coverage_by_geography,
        rank_volatility=rank_volatility,
    )
    country_story_labels = build_country_story_labels(
        index,
        indicator_trace=indicator_trace,
        coverage_by_geography=coverage_by_geography,
        rank_volatility=rank_volatility,
    )

    monitoring_gap = build_monitoring_gap(index, observations)
    tables = {
        "eda_data_coverage.csv": build_data_coverage(lookup),
        "eda_country_drivers.csv": country_drivers,
        "eda_country_story_labels.csv": country_story_labels,
        "index_sensitivity.csv": build_weight_sensitivity(index),
        "eda_rank_volatility.csv": rank_volatility,
        "eda_trend_profiles.csv": build_trend_profiles(trend_diagnostics, outlook),
        "eda_outlook_interpretation.csv": build_outlook_interpretation(
            trend_diagnostics,
            outlook,
            index,
        ),
        "eda_monitoring_gap.csv": monitoring_gap,
    }
    tables.update(coverage_tables)
    tables.update(build_indicator_forensics_tables(indicator_trace))
    tables.update(build_spatial_pattern_tables(country_drivers, geography_context))
    divergence_tables = build_divergence_artifacts(
        country_drivers=country_drivers,
        indicator_trace=indicator_trace,
        rank_volatility=rank_volatility,
        monitoring_gap=monitoring_gap,
    )
    candidate_tables = build_candidate_tables(observations, geography_context)
    regional_tables = build_regional_tables(
        observations,
        index,
        indicator_trace,
        coverage_by_geography,
        monitoring_gap,
    )
    output_tables = tables | divergence_tables | candidate_tables | regional_tables

    table_dir.mkdir(parents=True, exist_ok=True)
    for file_name, table in output_tables.items():
        table.to_csv(table_dir / file_name, index=False)

    candidate_figure_paths = render_candidate_research_atlas(
        observations,
        geography_context,
        candidate_tables["eda_candidate_story_signals.csv"],
        figure_dir,
    )
    regional_figure_paths = render_regional_research_atlas(
        regional_tables,
        geographies,
        land_context,
        figure_dir,
    )
    figure_paths = candidate_figure_paths | regional_figure_paths

    summary = build_summary(
        config_path=config_path,
        dataset_profile_path=dataset_profile_path,
        geography_context_path=geography_context_path,
        lookup_path=lookup_path,
        observations_path=observations_path,
        index_path=index_path,
        indicator_trace_path=indicator_trace_path,
        trend_diagnostics_path=trend_diagnostics_path,
        outlook_path=outlook_path,
        geographies_path=geographies_path,
        land_context_path=land_context_path,
        table_dir=table_dir,
        tables=output_tables,
        figure_paths=figure_paths,
        summary_output=summary_output,
        divergence_summary_output=divergence_summary_output,
        run_dir=run_dir,
    )
    summary_output.parent.mkdir(parents=True, exist_ok=True)
    summary_output.write_text(
        json.dumps(summary, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    divergence_summary = build_divergence_summary(
        fingerprints=divergence_tables["eda_evidence_fingerprints.csv"],
        pairwise_jsd=divergence_tables["eda_pairwise_jsd.csv"],
        similarity_neighbors=divergence_tables["eda_similarity_neighbors.csv"],
        input_paths={
            "country_drivers": table_dir / "eda_country_drivers.csv",
            "indicator_trace": indicator_trace_path,
            "rank_volatility": table_dir / "eda_rank_volatility.csv",
            "monitoring_gap": table_dir / "eda_monitoring_gap.csv",
        },
        output_paths={
            "evidence_fingerprints": table_dir / "eda_evidence_fingerprints.csv",
            "pairwise_jsd": table_dir / "eda_pairwise_jsd.csv",
            "similarity_neighbors": table_dir / "eda_similarity_neighbors.csv",
            "summary": divergence_summary_output,
        },
        root=ROOT,
    )
    divergence_summary_output.parent.mkdir(parents=True, exist_ok=True)
    divergence_summary_output.write_text(
        json.dumps(divergence_summary, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    cluster_stability = regional_tables["eda_regional_cluster_stability.csv"]
    crosscurrents = regional_tables["eda_regional_crosscurrents.csv"]
    relationships = regional_tables["eda_regional_pairwise_relationships.csv"]
    write_run_bundle(
        run_dir,
        config_path=config_path,
        input_paths={
            "dataset_profile": dataset_profile_path,
            "geography_context": geography_context_path,
            "geography_lookup": lookup_path,
            "observations": observations_path,
            "gap_index": index_path,
            "indicator_trace": indicator_trace_path,
            "trend_diagnostics": trend_diagnostics_path,
            "outlook": outlook_path,
            "geographies": geographies_path,
            "land_context": land_context_path,
        },
        output_paths={
            **{name: table_dir / name for name in sorted(regional_tables)},
            **regional_figure_paths,
            "eda_summary.json": summary_output,
        },
        metrics={
            "geography_count": int(index["geo_code"].nunique()),
            "water_renewable_overlap_count": int(crosscurrents["complete_overlap"].sum()),
            "crosscurrent_quadrant_counts": (
                crosscurrents.loc[crosscurrents["complete_overlap"], "quadrant"]
                .value_counts()
                .sort_index()
                .to_dict()
            ),
            "relationship_status_counts": (
                relationships["relationship_status"].value_counts().sort_index().to_dict()
            ),
            "minimum_leave_one_spearman": float(
                cluster_stability["minimum_leave_one_spearman"].iloc[0]
            ),
            "overall_ordering_decision": str(
                cluster_stability["overall_ordering_decision"].iloc[0]
            ),
            "public_grouping_decision": str(
                cluster_stability["public_grouping_decision"].iloc[0]
            ),
            "regional_table_count": len(regional_tables),
            "regional_figure_count": len(regional_figure_paths),
        },
    )
    return summary


def build_summary(
    *,
    config_path: Path,
    dataset_profile_path: Path,
    geography_context_path: Path,
    lookup_path: Path,
    observations_path: Path,
    index_path: Path,
    indicator_trace_path: Path,
    trend_diagnostics_path: Path,
    outlook_path: Path,
    geographies_path: Path,
    land_context_path: Path,
    table_dir: Path,
    tables: dict[str, pd.DataFrame],
    figure_paths: dict[str, Path],
    summary_output: Path,
    divergence_summary_output: Path,
    run_dir: Path,
) -> dict[str, object]:
    coverage = tables["eda_data_coverage.csv"]
    coverage_by_geography = tables["eda_coverage_by_geography.csv"]
    coverage_by_dataset = tables["eda_coverage_by_dataset.csv"]
    drivers = tables["eda_country_drivers.csv"]
    story_labels = tables["eda_country_story_labels.csv"]
    indicator_forensics = tables["eda_indicator_forensics.csv"]
    indicator_outliers = tables["eda_indicator_outliers.csv"]
    monitoring = tables["eda_monitoring_gap.csv"]
    outlook_interpretation = tables["eda_outlook_interpretation.csv"]
    sensitivity = tables["index_sensitivity.csv"]
    spatial_typologies = tables["eda_spatial_typologies.csv"]
    subregion_comparisons = tables["eda_subregion_comparisons.csv"]
    rank_volatility = tables["eda_rank_volatility.csv"]
    divergence_fingerprints = tables.get("eda_evidence_fingerprints.csv")
    pairwise_jsd = tables.get("eda_pairwise_jsd.csv")
    similarity_neighbors = tables.get("eda_similarity_neighbors.csv")
    candidate_coverage = tables["eda_candidate_dataset_coverage.csv"]
    candidate_comparability = tables["eda_candidate_comparability.csv"]
    candidate_signals = tables["eda_candidate_story_signals.csv"]
    divergence_section: dict[str, object] | None = None
    if (
        divergence_fingerprints is not None
        and pairwise_jsd is not None
        and similarity_neighbors is not None
    ):
        divergence_section = {
            "fingerprint_count": int(len(divergence_fingerprints)),
            "pairwise_count": int(len(pairwise_jsd)),
            "nearest_neighbor_count": int(len(similarity_neighbors)),
            "jsd_min": float(pairwise_jsd["jsd_distance"].min()),
            "jsd_max": float(pairwise_jsd["jsd_distance"].max()),
            "jsd_mean": float(pairwise_jsd["jsd_distance"].mean()),
            "similarity_band_counts": (
                pairwise_jsd["similarity_band"].value_counts().sort_index().to_dict()
            ),
            "missingness_status_counts": (
                divergence_fingerprints["missingness_status"].value_counts().sort_index().to_dict()
            ),
        }

    return {
        "schema_version": 1,
        "pipeline_task": "TASK-009",
        "status": "regional_visual_research_ready",
        "pipeline_tasks": [
            "TASK-009",
            "TASK-011",
            "TASK-012",
            "TASK-013",
            "TASK-014",
            "TASK-015",
            "TASK-016",
            "TASK-017",
            "TASK-019",
            "TASK-067",
            "TASK-068",
        ],
        "config": relative_path(config_path),
        "inputs": {
            "dataset_profile": relative_path(dataset_profile_path),
            "geography_context": relative_path(geography_context_path),
            "geography_lookup": relative_path(lookup_path),
            "observations": relative_path(observations_path),
            "gap_index": relative_path(index_path),
            "indicator_trace": relative_path(indicator_trace_path),
            "trend_diagnostics": relative_path(trend_diagnostics_path),
            "outlook": relative_path(outlook_path),
            "geographies": relative_path(geographies_path),
            "land_context": relative_path(land_context_path),
        },
        "outputs": {file_name: relative_path(table_dir / file_name) for file_name in sorted(tables)}
        | {file_name: relative_path(path) for file_name, path in sorted(figure_paths.items())}
        | {
            "summary": relative_path(summary_output),
            "divergence_summary": relative_path(divergence_summary_output),
            "regional_run_bundle": relative_path(run_dir),
        },
        "row_counts": {file_name: int(len(table)) for file_name, table in sorted(tables.items())},
        "coverage": {
            "geography_count": int(coverage["geo_code"].nunique()),
            "thin_coverage_count": int((coverage["coverage_tier"] == "thin").sum()),
            "data_desert_count": int(coverage["data_desert_flag"].sum()),
        },
        "coverage_deep_dive": {
            "geography_count": int(coverage_by_geography["geo_code"].nunique()),
            "dataset_count": int(coverage_by_dataset["dataset_slug"].nunique()),
            "data_desert_count": int(coverage_by_geography["data_desert_flag"].sum()),
            "partial_geography_dataset_count": int(
                coverage_by_dataset["partial_geography_coverage_flag"].sum()
            ),
            "partial_dataset_geography_count": int(
                coverage_by_geography["partial_dataset_coverage_flag"].sum()
            ),
        },
        "driver_labels": drivers["driver_label"].value_counts().sort_index().to_dict(),
        "country_story_labels": {
            "row_count": int(len(story_labels)),
            "primary_count": int((story_labels["story_priority"] == "primary").sum()),
            "secondary_count": int((story_labels["story_priority"] == "secondary").sum()),
            "context_count": int((story_labels["story_priority"] == "context").sum()),
            "monitoring_missing_count": int(story_labels["monitoring_missing"].sum()),
            "data_desert_count": int(story_labels["data_desert_flag"].sum()),
        },
        "indicator_forensics": {
            "trace_row_count": int(len(indicator_forensics)),
            "score_input_count": int(
                (indicator_forensics["score_input_role"] == "score_input").sum()
            ),
            "context_only_count": int(
                (indicator_forensics["score_input_role"] == "context_only").sum()
            ),
            "outlier_count": int(len(indicator_outliers)),
        },
        "monitoring_gap": {
            "row_count": int(len(monitoring)),
            "story_count": int(monitoring["monitoring_story_flag"].sum()),
            "priority_counts": (monitoring["story_priority"].value_counts().sort_index().to_dict()),
            "missing_reporting_count": int(
                (
                    monitoring["monitoring_reporting_status"] == "missing_monitoring_dataset_row"
                ).sum()
            ),
            "reported_zero_count": int(
                (monitoring["monitoring_reporting_status"] == "reported_zero_latest_count").sum()
            ),
        },
        "monitoring_story_count": int(monitoring["monitoring_story_flag"].sum()),
        "spatial_typologies": {
            "row_count": int(len(spatial_typologies)),
            "subregion_count": int(subregion_comparisons["subregion"].nunique()),
            "typology_counts": (
                spatial_typologies["spatial_typology"].value_counts().sort_index().to_dict()
            ),
            "top_mean_gap_subregion": str(
                subregion_comparisons.sort_values(
                    ["mean_adaptation_gap_score", "subregion"],
                    ascending=[False, True],
                    kind="mergesort",
                ).iloc[0]["subregion"]
            ),
        },
        "outlook_interpretation": {
            "row_count": int(len(outlook_interpretation)),
            "display_recommendations": (
                outlook_interpretation["display_recommendation"]
                .value_counts()
                .sort_index()
                .to_dict()
            ),
            "diagnostic_quality": (
                outlook_interpretation["diagnostic_quality_label"]
                .value_counts()
                .sort_index()
                .to_dict()
            ),
            "large_movement_count": int(
                (outlook_interpretation["movement_magnitude_label"] == "large").sum()
            ),
        },
        "rank_fragility": sensitivity["robustness_label"].value_counts().sort_index().to_dict(),
        "rank_volatility": (
            rank_volatility["robustness_label"].value_counts().sort_index().to_dict()
        ),
        "rank_volatility_max_range": int(rank_volatility["rank_range"].max()),
        "evidence_fingerprint_divergence": divergence_section,
        "candidate_analysis": {
            "dataset_count": int(candidate_coverage["dataset_slug"].nunique()),
            "row_count": int(candidate_coverage["row_count"].sum()),
            "figure_count": sum(name.startswith("eda_candidate_") for name in figure_paths),
            "comparability_judgments": (
                candidate_comparability["comparability_judgment"]
                .value_counts()
                .sort_index()
                .to_dict()
            ),
            "story_signal_statuses": (
                candidate_signals["status"].value_counts().sort_index().to_dict()
            ),
            "selected_story": None,
        },
        "regional_analysis": _regional_summary(tables, figure_paths, run_dir),
        "caveats": [
            "This is descriptive EDA, not causal inference.",
            "Current GIS geometry is centroid fallback until a boundary source is added.",
            (
                "Monitoring counts are proxy coverage and are not normalized by population "
                "or area yet."
            ),
            "Sensitivity scenarios are simple stress tests for narrative confidence.",
            "Leave-one-indicator rank volatility frames uncertainty, not a new ranking.",
            "Coverage diagnostics are about official data availability, not outcomes.",
            "Indicator outliers are comparable only within the same dataset and unit.",
            "Country story labels are descriptive screens, not causal explanations.",
            "Spatial typologies are rule-based descriptors, not statistical clusters.",
            "No centroid-distance or land-adjacency inference is used.",
            "Outlook interpretation is stress-test display guidance, not forecasting.",
            "Missing monitoring rows are reporting gaps, not confirmed infrastructure absence.",
            (
                "Evidence fingerprint divergence compares normalized official-data profiles, "
                "not lived vulnerability, policy need, or causal similarity."
            ),
            "JSD nearest neighbors are selected-geography diagnostics, not clusters or ranks.",
            "Candidate raw magnitudes remain separate and are not summed into a score.",
            "Missing direct-loss years are reporting gaps, not zero-loss years.",
            (
                "TASK-067 and TASK-068 research plates are decision inputs; TASK-069 "
                "selects, revises, or rejects the regional story."
            ),
            "Condition heatmap percentiles are display/order only and are never averaged.",
            "Condition missingness is not imputed; absence is a value only in visibility views.",
            "Regional clustering is exploratory seriation only and emits no public groups.",
            "Regional maps use equal-presence centroids and generalized land context only.",
        ],
    }


def _regional_summary(
    tables: dict[str, pd.DataFrame], figure_paths: dict[str, Path], run_dir: Path
) -> dict[str, object]:
    matrix = tables["eda_regional_feature_matrix.csv"]
    crosscurrents = tables["eda_regional_crosscurrents.csv"]
    relationships = tables["eda_regional_pairwise_relationships.csv"]
    stability = tables["eda_regional_cluster_stability.csv"]
    condition = matrix[matrix["lane"].eq("measured_condition")]
    visibility = matrix[matrix["lane"].eq("evidence_visibility")]
    return {
        "geography_count": int(matrix["geo_code"].nunique()),
        "condition_feature_count": int(condition["feature_id"].nunique()),
        "condition_missing_cell_count": int((~condition["present"]).sum()),
        "visibility_feature_count": int(visibility["feature_id"].nunique()),
        "water_renewable_overlap_count": int(crosscurrents["complete_overlap"].sum()),
        "crosscurrent_quadrant_counts": (
            crosscurrents.loc[crosscurrents["complete_overlap"], "quadrant"]
            .value_counts()
            .sort_index()
            .to_dict()
        ),
        "relationship_count": int(len(relationships)),
        "relationship_status_counts": (
            relationships["relationship_status"].value_counts().sort_index().to_dict()
        ),
        "minimum_leave_one_spearman": float(stability["minimum_leave_one_spearman"].iloc[0]),
        "overall_ordering_decision": str(stability["overall_ordering_decision"].iloc[0]),
        "public_grouping_decision": str(stability["public_grouping_decision"].iloc[0]),
        "figure_count": sum(name.startswith("eda_regional_") for name in figure_paths),
        "run_bundle": relative_path(run_dir),
        "selected_story": None,
    }


def write_run_bundle(
    run_dir: Path,
    *,
    config_path: Path,
    input_paths: dict[str, Path],
    output_paths: dict[str, Path],
    metrics: dict[str, object],
) -> dict[str, Path]:
    """Write the deterministic seven-file TASK-068 research run bundle."""

    run_dir.mkdir(parents=True, exist_ok=True)
    paths = {
        name: run_dir / name
        for name in (
            "meta.json",
            "config.yaml",
            "seeds.json",
            "inputs.json",
            "outputs.json",
            "metrics.json",
            "notes.md",
        )
    }
    paths["config.yaml"].write_bytes(config_path.read_bytes())
    _write_json(
        paths["meta.json"],
        {
            "schema_version": 1,
            "run_id": run_dir.name,
            "task": "TASK-068",
            "base_git_shortsha": "678a645",
            "purpose": "Regional cross-current and evidence-visibility EDA",
            "status": "research_artifacts_built_for_review",
            "bundle_file_count": 7,
        },
    )
    _write_json(
        paths["seeds.json"],
        {
            "random_seed": None,
            "randomized_methods": [],
            "deterministic_methods": [
                "stable mergesort ordering",
                "average-linkage hierarchical seriation",
                "pairwise shared-feature RMS distance without imputation",
            ],
        },
    )
    _write_json(paths["inputs.json"], _file_manifest(input_paths))
    _write_json(paths["outputs.json"], _file_manifest(output_paths))
    _write_json(paths["metrics.json"], metrics)
    paths["notes.md"].write_text(
        "# TASK-068 regional EDA run notes\n\n"
        "This deterministic bundle records descriptive research outputs, not a final story, "
        "causal analysis, preparedness assessment, public cluster model, or app-data change.\n\n"
        "- Condition values remain missing where no reviewed value exists; no imputation is used.\n"
        "- Evidence absence is encoded only in the separately constructed visibility lane.\n"
        "- Within-indicator percentiles support heatmap display and ordering only; they are not "
        "averaged into a score.\n"
        "- Direct loss is reporting visibility only; land-cover direction is withheld; population "
        "is published projection/estimate context.\n"
        "- Monitoring, power, and fisheries fields are partial proxies, not complete preparedness "
        "or readiness measures.\n"
        "- Four dependency-warned relationships include direct and transitive score lineage; "
        "none is independent confirmation.\n"
        "- Hierarchical ordering is exploratory seriation; public grouping is rejected.\n"
        "- Maps use equal-presence centroids and generalized Natural Earth land context only.\n",
        encoding="utf-8",
    )
    return paths


def _file_manifest(paths: dict[str, Path]) -> dict[str, object]:
    return {
        "files": {
            name: {
                "path": relative_path(path),
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "bytes": path.stat().st_size,
            }
            for name, path in sorted(paths.items())
        }
    }


def _write_json(path: Path, payload: object) -> None:
    path.write_text(
        json.dumps(payload, indent=2, sort_keys=True, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )


def relative_path(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def resolve_path(path: Path) -> Path:
    return ROOT / path if not path.is_absolute() else path


def main() -> int:
    args = parse_args()
    summary = run_eda(
        config_path=resolve_path(args.config),
        dataset_profile_path=resolve_path(args.dataset_profile),
        geography_context_path=resolve_path(args.geography_context),
        lookup_path=resolve_path(args.geography_lookup),
        observations_path=resolve_path(args.observations),
        index_path=resolve_path(args.index),
        indicator_trace_path=resolve_path(args.indicator_trace),
        trend_diagnostics_path=resolve_path(args.trend_diagnostics),
        outlook_path=resolve_path(args.outlook),
        geographies_path=resolve_path(args.geographies),
        land_context_path=resolve_path(args.land_context),
        table_dir=resolve_path(args.table_dir),
        figure_dir=resolve_path(args.figure_dir),
        summary_output=resolve_path(args.summary_output),
        divergence_summary_output=resolve_path(args.divergence_summary_output),
        run_dir=resolve_path(args.run_dir),
    )
    print(
        f"Built EDA tables: outputs={len(summary['row_counts'])}, "
        f"geographies={summary['coverage']['geography_count']}, "
        f"regional_figures={summary['regional_analysis']['figure_count']}"
    )
    print(f"Wrote summary: {relative_path(resolve_path(args.summary_output))}")
    print(
        f"Wrote divergence summary: {relative_path(resolve_path(args.divergence_summary_output))}"
    )
    print(f"Wrote regional run bundle: {relative_path(resolve_path(args.run_dir))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
