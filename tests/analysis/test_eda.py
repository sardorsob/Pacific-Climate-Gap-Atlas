from __future__ import annotations

import unittest

import pandas as pd

from analysis.eda.coverage import build_data_coverage, build_monitoring_gap
from analysis.eda.drivers import build_country_drivers
from analysis.eda.sensitivity import build_weight_sensitivity
from analysis.eda.trends import build_trend_profiles


class EdaCoverageTests(unittest.TestCase):
    def test_build_data_coverage_labels_thin_and_broad_coverage(self) -> None:
        lookup = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "dataset_count": 3,
                    "row_count": 80,
                    "first_year": 2000,
                    "last_year": 2020,
                    "datasets": "one two three",
                },
                {
                    "geo_code": "BB",
                    "dataset_count": 8,
                    "row_count": 600,
                    "first_year": 1850,
                    "last_year": 2026,
                    "datasets": "many datasets",
                },
            ]
        )

        coverage = build_data_coverage(lookup)

        self.assertEqual(coverage["geo_code"].tolist(), ["AA", "BB"])
        self.assertEqual(coverage.loc[0, "years_observed"], 21)
        self.assertEqual(coverage.loc[0, "coverage_tier"], "thin")
        self.assertTrue(coverage.loc[0, "data_desert_flag"])
        self.assertEqual(coverage.loc[1, "coverage_tier"], "broad")
        self.assertFalse(coverage.loc[1, "data_desert_flag"])

    def test_build_monitoring_gap_flags_high_gap_low_monitoring(self) -> None:
        index = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "adaptation_gap_score": 82.0,
                    "climate_pressure_score": 70.0,
                    "capacity_score": 20.0,
                },
                {
                    "geo_code": "BB",
                    "adaptation_gap_score": 20.0,
                    "climate_pressure_score": 30.0,
                    "capacity_score": 70.0,
                },
            ]
        )
        observations = pd.DataFrame(
            [
                {
                    "dataset_slug": "meteorological-monitoring-network",
                    "geo_code": "AA",
                    "year": 2025,
                    "value": 1,
                },
                {
                    "dataset_slug": "meteorological-monitoring-network",
                    "geo_code": "BB",
                    "year": 2025,
                    "value": 9,
                },
            ]
        )

        monitoring = build_monitoring_gap(index, observations)

        aa = monitoring.loc[monitoring["geo_code"] == "AA"].iloc[0]
        bb = monitoring.loc[monitoring["geo_code"] == "BB"].iloc[0]
        self.assertEqual(aa["monitoring_gap_label"], "high gap + low monitoring")
        self.assertTrue(aa["monitoring_story_flag"])
        self.assertEqual(bb["monitoring_gap_label"], "monitoring less urgent")
        self.assertFalse(bb["monitoring_story_flag"])


class EdaDriverTests(unittest.TestCase):
    def test_build_country_drivers_explains_pressure_capacity_balance(self) -> None:
        index = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "score_status": "scored",
                    "adaptation_gap_score": 90.0,
                    "climate_pressure_score": 80.0,
                    "capacity_score": 20.0,
                    "score_input_indicator_count": 5,
                    "context_indicator_count": 0,
                    "trace_indicator_count": 5,
                    "missingness_flag": False,
                },
                {
                    "geo_code": "BB",
                    "score_status": "scored",
                    "adaptation_gap_score": 18.0,
                    "climate_pressure_score": 25.0,
                    "capacity_score": 75.0,
                    "score_input_indicator_count": 8,
                    "context_indicator_count": 0,
                    "trace_indicator_count": 8,
                    "missingness_flag": False,
                },
            ]
        )

        drivers = build_country_drivers(index)

        self.assertEqual(drivers.loc[0, "geo_code"], "AA")
        self.assertEqual(drivers.loc[0, "adaptation_gap_rank"], 1)
        self.assertEqual(drivers.loc[0, "driver_label"], "high pressure + low visible capacity")
        self.assertEqual(drivers.loc[1, "driver_label"], "lower relative gap")


class EdaSensitivityTests(unittest.TestCase):
    def test_build_weight_sensitivity_reports_rank_range(self) -> None:
        index = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "adaptation_gap_score": 90.0,
                    "climate_pressure_score": 80.0,
                    "capacity_score": 20.0,
                },
                {
                    "geo_code": "BB",
                    "adaptation_gap_score": 50.0,
                    "climate_pressure_score": 50.0,
                    "capacity_score": 50.0,
                },
                {
                    "geo_code": "CC",
                    "adaptation_gap_score": 10.0,
                    "climate_pressure_score": 20.0,
                    "capacity_score": 80.0,
                },
            ]
        )

        sensitivity = build_weight_sensitivity(index)

        aa = sensitivity.loc[sensitivity["geo_code"] == "AA"].iloc[0]
        self.assertEqual(aa["baseline_rank"], 1)
        self.assertEqual(aa["rank_range"], 0)
        self.assertEqual(aa["robustness_label"], "stable")


class EdaTrendTests(unittest.TestCase):
    def test_build_trend_profiles_summarizes_backtest_strength(self) -> None:
        diagnostics = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "dataset_slug": "temperature",
                    "slope_per_decade": 0.5,
                    "backtest_beats_naive": True,
                },
                {
                    "geo_code": "AA",
                    "dataset_slug": "rainfall",
                    "slope_per_decade": -1.0,
                    "backtest_beats_naive": False,
                },
            ]
        )
        outlook = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "horizon": 2030,
                    "scenario": "capacity_flat",
                    "outlook_gap_score": 44.0,
                },
                {
                    "geo_code": "AA",
                    "horizon": 2050,
                    "scenario": "capacity_flat",
                    "outlook_gap_score": 55.0,
                },
            ]
        )

        profiles = build_trend_profiles(diagnostics, outlook)

        row = profiles.iloc[0]
        self.assertEqual(row["geo_code"], "AA")
        self.assertEqual(row["trend_series_count"], 2)
        self.assertEqual(row["linear_beats_naive_count"], 1)
        self.assertEqual(row["trend_confidence"], "mixed")
        self.assertEqual(row["max_flat_outlook_gap_score"], 55.0)


if __name__ == "__main__":
    unittest.main()
