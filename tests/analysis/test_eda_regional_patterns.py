from __future__ import annotations

import hashlib
import importlib
import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib-task068-tests")
WATER_SLUG = "proportion-of-population-using-safely-managed-drinking-water-services"


def require_module(case: unittest.TestCase, name: str):
    case.assertIsNotNone(
        importlib.util.find_spec(name),
        f"TASK-068 regional feature module is missing: {name}",
    )
    return importlib.import_module(name)


class RegionalPatternsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.observations = pd.read_csv(ROOT / "data/processed/official_observations.csv")
        cls.index = pd.read_csv(ROOT / "artifacts/tables/adaptation_gap_index.csv")
        cls.indicator_trace = pd.read_csv(
            ROOT / "artifacts/tables/adaptation_gap_indicator_trace.csv"
        )
        cls.coverage = pd.read_csv(ROOT / "artifacts/tables/eda_coverage_by_geography.csv")
        cls.monitoring_gap = pd.read_csv(ROOT / "artifacts/tables/eda_monitoring_gap.csv")

    def build_tables(self) -> dict[str, pd.DataFrame]:
        regional_patterns = require_module(self, "analysis.eda.regional_patterns")
        return regional_patterns.build_regional_tables(
            self.observations,
            self.index,
            self.indicator_trace,
            self.coverage,
            self.monitoring_gap,
        )

    def test_feature_matrix_keeps_all_geographies_and_condition_gaps(self) -> None:
        tables = self.build_tables()
        self.assertEqual(
            set(tables),
            {
                "eda_regional_feature_matrix.csv",
                "eda_regional_distribution_summary.csv",
                "eda_regional_crosscurrents.csv",
                "eda_regional_pairwise_relationships.csv",
                "eda_regional_cluster_stability.csv",
            },
        )
        matrix = tables["eda_regional_feature_matrix.csv"]
        self.assertTrue(
            {"denominator", "source_row_hash"}.issubset(matrix.columns),
            "regional matrix must preserve denominator and source-row trace fields",
        )
        for lane in ("measured_condition", "evidence_visibility"):
            self.assertEqual(matrix.loc[matrix["lane"].eq(lane), "geo_code"].nunique(), 22)

        water = matrix[
            matrix["lane"].eq("measured_condition")
            & matrix["feature_id"].eq(WATER_SLUG)
        ]
        self.assertEqual(len(water), 22)
        self.assertEqual(int(water["present"].sum()), 19)
        self.assertTrue(water.loc[~water["present"], "raw_value"].isna().all())
        self.assertTrue(water.loc[~water["present"], "display_value"].isna().all())
        self.assertEqual(
            set(water.loc[water["present"], "denominator"]),
            {"population in the represented geography"},
        )
        condition = matrix[matrix["lane"].eq("measured_condition")]
        self.assertTrue(
            condition.loc[condition["present"], "source_row_hash"]
            .astype(str)
            .str.fullmatch(r"[0-9a-f]{64}")
            .all()
        )
        self.assertTrue(condition.loc[~condition["present"], "source_row_hash"].isna().all())
        visibility = matrix[matrix["lane"].eq("evidence_visibility")]
        self.assertEqual(
            set(visibility["source_row_hash"]), {"not_applicable_aggregate_visibility"}
        )

    def test_crosscurrents_reproduce_the_complete_19_place_overlap(self) -> None:
        crosscurrents = self.build_tables()["eda_regional_crosscurrents.csv"]
        self.assertEqual(len(crosscurrents), 22)
        self.assertEqual(int(crosscurrents["complete_overlap"].sum()), 19)
        self.assertEqual(
            crosscurrents.loc[crosscurrents["complete_overlap"], "quadrant"]
            .value_counts()
            .to_dict(),
            {
                "water_up_renewable_down": 7,
                "both_up": 6,
                "both_down": 3,
                "water_down_renewable_up": 3,
            },
        )
        self.assertTrue(
            crosscurrents.loc[~crosscurrents["complete_overlap"], "quadrant"]
            .eq("missing_overlap")
            .all()
        )

    def test_pairwise_relationships_expose_overlap_and_circularity(self) -> None:
        relationships = self.build_tables()["eda_regional_pairwise_relationships.csv"]
        pair = relationships[
            relationships["pair_id"].eq("capacity_score__monitoring_latest_count")
        ].iloc[0]
        expected_n = int(
            self.monitoring_gap["monitoring_reporting_status"]
            .ne("missing_monitoring_dataset_row")
            .sum()
        )
        self.assertEqual(int(pair["pairwise_n"]), expected_n)
        self.assertTrue(bool(pair["circularity_flag"]))
        self.assertIn("capacity", pair["dependency_warning"].lower())
        self.assertIn("latest", pair["time_basis"])

    def test_pairwise_relationships_flag_transitive_gap_monitoring_lineage(self) -> None:
        tables = self.build_tables()
        relationships = tables["eda_regional_pairwise_relationships.csv"]
        pair = relationships[
            relationships["pair_id"].eq(
                "adaptation_gap_score__monitoring_latest_count"
            )
        ].iloc[0]
        self.assertTrue(bool(pair["circularity_flag"]))
        self.assertEqual(
            pair["relationship_status"], "reported_with_dependency_warning"
        )
        self.assertIn("transitive", pair["dependency_warning"].lower())
        self.assertIn("capacity", pair["dependency_warning"].lower())

        warned_pairs = set(
            relationships.loc[
                relationships["relationship_status"].eq(
                    "reported_with_dependency_warning"
                ),
                "pair_id",
            ]
        )
        self.assertEqual(
            warned_pairs,
            {
                "adaptation_gap_score__climate_pressure_score",
                "adaptation_gap_score__capacity_score",
                "adaptation_gap_score__monitoring_latest_count",
                "capacity_score__monitoring_latest_count",
            },
        )

        regional_figures = require_module(self, "analysis.eda.regional_figures")
        figure = regional_figures._relationships(relationships)
        dependency_cells = sum(
            "†" in item.get_text() for item in figure.axes[0].texts
        )
        figure_text = " ".join(item.get_text() for item in figure.texts)
        regional_figures.plt.close(figure)
        self.assertEqual(dependency_cells, 8)
        self.assertIn("transitive", figure_text.lower())

    def test_pairwise_relationships_withhold_underpowered_cells(self) -> None:
        regional_patterns = require_module(self, "analysis.eda.regional_patterns")
        sparse_monitoring = self.monitoring_gap.copy()
        sparse_monitoring["monitoring_reporting_status"] = "reported_nonzero_latest_count"
        sparse_monitoring.loc[sparse_monitoring.index[7:], "monitoring_count"] = pd.NA
        relationships = regional_patterns.build_regional_tables(
            self.observations,
            self.index,
            self.indicator_trace,
            self.coverage,
            sparse_monitoring,
        )["eda_regional_pairwise_relationships.csv"]
        pair = relationships[
            relationships["pair_id"].eq("capacity_score__monitoring_latest_count")
        ].iloc[0]
        self.assertEqual(int(pair["pairwise_n"]), 7)
        self.assertEqual(pair["relationship_status"], "withheld_underpowered")
        self.assertTrue(pd.isna(pair["spearman_rho"]))

    def test_condition_and_visibility_orders_are_separate(self) -> None:
        matrix = self.build_tables()["eda_regional_feature_matrix.csv"]
        orders = {}
        for lane in ("measured_condition", "evidence_visibility"):
            lane_rows = matrix[matrix["lane"].eq(lane)]
            order = (
                lane_rows[["geo_code", "order_position"]]
                .drop_duplicates()
                .sort_values("order_position", kind="mergesort")["geo_code"]
                .tolist()
            )
            self.assertEqual(len(order), 22)
            self.assertEqual(len(set(order)), 22)
            orders[lane] = order
        self.assertNotEqual(orders["measured_condition"], orders["evidence_visibility"])

    def test_leave_one_indicator_sensitivity_has_an_explicit_rejection_state(self) -> None:
        tables = self.build_tables()
        matrix = tables["eda_regional_feature_matrix.csv"]
        stability = tables["eda_regional_cluster_stability.csv"]
        condition_features = matrix.loc[
            matrix["lane"].eq("measured_condition"), "feature_id"
        ].nunique()
        self.assertEqual(len(stability), condition_features + 1)
        self.assertEqual(set(stability["public_grouping_decision"]), {"reject_public_grouping"})
        self.assertFalse(stability["cluster_labels_emitted"].any())
        self.assertEqual(
            set(stability["ordering_decision"]),
            {"retain_exploratory_seriation", "reject_stable_regional_structure"},
        )


    def test_regional_atlas_renders_six_table_driven_pngs(self) -> None:
        regional_figures = require_module(self, "analysis.eda.regional_figures")
        near_origin_codes = ("CK", "PW", "TO", "WF")
        self.assertTrue(
            hasattr(regional_figures, "CROSSCURRENT_LABEL_OFFSETS"),
            "deterministic cross-current collision offsets are missing",
        )
        offsets = regional_figures.CROSSCURRENT_LABEL_OFFSETS
        self.assertEqual(len({offsets[code] for code in near_origin_codes}), 4)
        tables = self.build_tables()
        geographies = json.loads(
            (ROOT / "data/processed/app/geographies.json").read_text(encoding="utf-8")
        )
        land_context = json.loads(
            (ROOT / "data/processed/app/pacific_land_context.geojson").read_text(
                encoding="utf-8"
            )
        )
        visibility_figure = regional_figures._heatmap(
            tables["eda_regional_feature_matrix.csv"], "evidence_visibility"
        )
        visibility_text = " ".join(item.get_text() for item in visibility_figure.texts)
        self.assertIn("2007–2020", visibility_text)
        regional_figures.plt.close(visibility_figure)
        map_figure = regional_figures._maps(
            tables["eda_regional_feature_matrix.csv"], geographies, land_context
        )
        map_text = " ".join(
            [item.get_text() for item in map_figure.texts]
            + [axis.get_title() for axis in map_figure.axes]
        )
        self.assertIn("2007–2020", map_text)
        regional_figures.plt.close(map_figure)
        revised_tables = {name: table.copy() for name, table in tables.items()}
        revised_matrix = revised_tables["eda_regional_feature_matrix.csv"]
        revised_matrix.loc[
            revised_matrix["feature_id"].eq(regional_figures.LOSS_SLUG), "time_basis"
        ] = "any returned row, 2008-2019"
        revised_relationships = revised_tables[
            "eda_regional_pairwise_relationships.csv"
        ]
        revised_relationships["minimum_pairwise_n"] = 9
        visibility_figure = regional_figures._heatmap(
            revised_matrix, "evidence_visibility"
        )
        visibility_text = " ".join(
            item.get_text() for item in visibility_figure.texts
        )
        self.assertIn("2008–2019", visibility_text)
        regional_figures.plt.close(visibility_figure)
        relationship_figure = regional_figures._relationships(revised_relationships)
        relationship_text = " ".join(
            item.get_text() for item in relationship_figure.texts
        )
        self.assertIn("n<9", relationship_text)
        regional_figures.plt.close(relationship_figure)
        expected = {
            "eda_regional_distributions.png",
            "eda_regional_crosscurrents.png",
            "eda_regional_condition_heatmap.png",
            "eda_regional_visibility_heatmap.png",
            "eda_regional_relationships.png",
            "eda_regional_maps.png",
        }
        with tempfile.TemporaryDirectory() as temporary_dir:
            paths = regional_figures.render_regional_research_atlas(
                tables,
                geographies,
                land_context,
                Path(temporary_dir),
            )
            self.assertEqual(set(paths), expected)
            for path in paths.values():
                self.assertGreater(path.stat().st_size, 10_000)


class RegionalRunBundleTests(unittest.TestCase):
    def test_run_bundle_has_seven_deterministic_files(self) -> None:
        run_eda = require_module(self, "scripts.run_eda")
        self.assertTrue(
            hasattr(run_eda, "write_run_bundle"),
            "TASK-068 deterministic write_run_bundle interface is missing",
        )
        with tempfile.TemporaryDirectory() as temporary_dir:
            root = Path(temporary_dir)
            config = root / "eda.yml"
            input_path = root / "input.csv"
            output_path = root / "output.csv"
            config.write_text("task: TASK-068\n", encoding="utf-8")
            input_path.write_text("value\n1\n", encoding="utf-8")
            output_path.write_text("result\n2\n", encoding="utf-8")
            run_dir = root / "2026-07-14__0000__task-068-regional-eda__678a645"
            kwargs = {
                "config_path": config,
                "input_paths": {"observations": input_path},
                "output_paths": {"regional_table": output_path},
                "metrics": {"geography_count": 22, "overlap_count": 19},
            }
            paths = run_eda.write_run_bundle(run_dir, **kwargs)
            expected = {
                "meta.json",
                "config.yaml",
                "seeds.json",
                "inputs.json",
                "outputs.json",
                "metrics.json",
                "notes.md",
            }
            self.assertEqual(set(paths), expected)
            self.assertIn(
                "Four dependency-warned relationships",
                paths["notes.md"].read_text(encoding="utf-8"),
            )
            first_hashes = {
                name: hashlib.sha256(path.read_bytes()).hexdigest()
                for name, path in paths.items()
            }
            second_paths = run_eda.write_run_bundle(run_dir, **kwargs)
            second_hashes = {
                name: hashlib.sha256(path.read_bytes()).hexdigest()
                for name, path in second_paths.items()
            }
            self.assertEqual(first_hashes, second_hashes)


if __name__ == "__main__":
    unittest.main()
