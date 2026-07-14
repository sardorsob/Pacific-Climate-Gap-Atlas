from __future__ import annotations

import unittest
from pathlib import Path

import pandas as pd

from analysis.eda.candidate_datasets import (
    CANDIDATE_SLUGS,
    build_candidate_tables,
    normalize_direct_loss_units,
    select_baseline_observations,
)
from analysis.eda.candidate_figures import _story_auditions

ROOT = Path(__file__).resolve().parents[2]


class CandidateDatasetEdaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.observations = pd.read_csv(ROOT / "data" / "processed" / "official_observations.csv")
        cls.geography_context = pd.read_csv(ROOT / "data" / "external" / "geography_context.csv")

    def test_candidate_tables_cover_exactly_the_five_processed_candidates(self) -> None:
        tables = build_candidate_tables(self.observations, self.geography_context)

        self.assertEqual(
            set(tables),
            {
                "eda_candidate_dataset_coverage.csv",
                "eda_candidate_comparability.csv",
                "eda_candidate_story_signals.csv",
            },
        )
        coverage = tables["eda_candidate_dataset_coverage.csv"]
        self.assertEqual(set(coverage["dataset_slug"]), set(CANDIDATE_SLUGS))
        self.assertEqual(int(coverage["row_count"].sum()), 2403)

        loss = coverage[coverage["dataset_slug"] == "direct-disaster-economic-loss"].iloc[0]
        self.assertEqual(int(loss["row_count"]), 39)
        self.assertEqual(int(loss["geography_count"]), 12)
        self.assertAlmostEqual(float(loss["geography_year_coverage_pct"]), 23.2)

    def test_candidate_rows_stay_out_of_the_baseline_eda_lane(self) -> None:
        future_candidate = self.observations.iloc[[0]].assign(
            dataset_slug="future-unapproved-dataset",
            pillar="future_candidate_context",
        )
        baseline = select_baseline_observations(
            pd.concat([self.observations, future_candidate], ignore_index=True)
        )

        self.assertEqual(len(baseline), 14007)
        self.assertEqual(baseline["dataset_slug"].nunique(), 9)
        self.assertTrue(set(baseline["dataset_slug"]).isdisjoint(CANDIDATE_SLUGS))
        self.assertNotIn("future-unapproved-dataset", set(baseline["dataset_slug"]))

    def test_direct_loss_normalization_converts_only_explicit_million_units(self) -> None:
        loss = pd.DataFrame(
            [
                {"value": 4.9, "unit": "USD_MILLIONS"},
                {"value": 125000.0, "unit": "USD"},
            ]
        )

        normalized = normalize_direct_loss_units(loss)

        self.assertEqual(normalized["comparison_unit"].tolist(), ["USD", "USD"])
        self.assertEqual(normalized["comparison_value"].tolist(), [4_900_000.0, 125_000.0])
        with self.assertRaisesRegex(ValueError, "Unexpected direct-loss units"):
            normalize_direct_loss_units(pd.DataFrame([{"value": 1, "unit": "EUR"}]))

    def test_comparability_and_story_signals_keep_limits_explicit(self) -> None:
        tables = build_candidate_tables(self.observations, self.geography_context)
        comparability = tables["eda_candidate_comparability.csv"]
        signals = tables["eda_candidate_story_signals.csv"]

        self.assertEqual(set(comparability["dataset_slug"]), set(CANDIDATE_SLUGS))
        self.assertTrue(comparability["comparability_judgment"].astype(str).str.len().gt(0).all())
        self.assertTrue(
            comparability["missingness_interpretation"].astype(str).str.len().gt(0).all()
        )

        direct_loss = comparability[
            comparability["dataset_slug"] == "direct-disaster-economic-loss"
        ].iloc[0]
        self.assertEqual(direct_loss["comparison_unit"], "USD")
        self.assertEqual(direct_loss["comparability_judgment"], "reporting_visibility_only")

        land_cover = comparability[
            comparability["dataset_slug"] == "climate-altering-land-cover-index"
        ].iloc[0]
        self.assertEqual(
            land_cover["comparability_judgment"],
            "direction_requires_source_review",
        )

        self.assertTrue(
            {"supported", "weak", "contradicted", "unavailable"}.issubset(signals["status"])
        )
        self.assertTrue(signals["evidence_summary"].astype(str).str.len().gt(0).all())
        self.assertTrue(signals["decision"].astype(str).str.len().gt(0).all())
        unavailable = signals[signals["status"] == "unavailable"]
        self.assertTrue(unavailable["caveat"].astype(str).str.len().gt(0).all())

        population = comparability[comparability["dataset_slug"] == "population-growth"].iloc[0]
        self.assertIn("projection", population["caveat"].lower())
        population_rows = self.observations[
            self.observations["dataset_slug"] == "population-growth"
        ]
        self.assertEqual(set(population_rows["obs_status"]), {"E"})
        self.assertTrue(
            population_rows["source_metadata"].str.contains("Population projections").all()
        )

    def test_story_audition_metrics_derive_from_rows_and_show_scope(self) -> None:
        observations = self.observations.copy()
        first_pg_water = (
            observations["dataset_slug"].eq(
                "proportion-of-population-using-safely-managed-drinking-water-services"
            )
            & observations["geo_code"].eq("PG")
            & observations["year"].eq(2000)
        )
        observations.loc[first_pg_water, "value"] -= 1
        signals = build_candidate_tables(observations, self.geography_context)[
            "eda_candidate_story_signals.csv"
        ]

        figure = _story_auditions(observations, signals)
        text = " ".join(item.get_text() for item in figure.texts)
        bar_heights = [patch.get_height() for patch in figure.axes[1].patches]

        self.assertAlmostEqual(bar_heights[0], 19.49)
        self.assertIn("percentage-point change", figure.axes[1].get_ylabel())
        self.assertIn("2000–2022", figure.axes[1].get_xlabel())
        self.assertIn("within-indicator ranks", figure.axes[2].get_xlabel())
        self.assertIn("23.2%", text)
        self.assertTrue(all(label.get_text() for label in figure.axes[0].get_yticklabels()))


if __name__ == "__main__":
    unittest.main()
