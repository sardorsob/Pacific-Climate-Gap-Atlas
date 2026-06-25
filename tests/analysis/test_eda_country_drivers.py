from __future__ import annotations

import inspect
import unittest

import pandas as pd

import analysis.eda.drivers as driver_module


class CountryDriverStoryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.index = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "score_status": "scored",
                    "adaptation_gap_score": 90.0,
                    "climate_pressure_score": 82.0,
                    "capacity_score": 20.0,
                    "included_indicator_count": 4,
                    "missingness_flag": False,
                },
                {
                    "geo_code": "BB",
                    "score_status": "scored",
                    "adaptation_gap_score": 44.0,
                    "climate_pressure_score": 45.0,
                    "capacity_score": 40.0,
                    "included_indicator_count": 3,
                    "missingness_flag": True,
                },
            ]
        )
        self.indicator_trace = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "dataset_slug": "sea-heat",
                    "dataset_name": "Sea heat",
                    "pillar": "climate_signal",
                    "indicator_score": 95.0,
                },
                {
                    "geo_code": "AA",
                    "dataset_slug": "disaster-exposure",
                    "dataset_name": "Disaster exposure",
                    "pillar": "observed_stress",
                    "indicator_score": 71.0,
                },
                {
                    "geo_code": "AA",
                    "dataset_slug": "monitoring-coverage",
                    "dataset_name": "Monitoring coverage",
                    "pillar": "adaptation_capacity",
                    "indicator_score": 12.0,
                },
                {
                    "geo_code": "AA",
                    "dataset_slug": "power-generation",
                    "dataset_name": "Power generation",
                    "pillar": "adaptation_capacity",
                    "indicator_score": 35.0,
                },
                {
                    "geo_code": "BB",
                    "dataset_slug": "rainfall",
                    "dataset_name": "Rainfall",
                    "pillar": "climate_signal",
                    "indicator_score": 52.0,
                },
            ]
        )
        self.coverage = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "data_desert_flag": True,
                    "monitoring_network_missing_flag": True,
                    "coverage_flag": "data_desert",
                },
                {
                    "geo_code": "BB",
                    "data_desert_flag": False,
                    "monitoring_network_missing_flag": False,
                    "coverage_flag": "partial_dataset_coverage",
                },
            ]
        )
        self.rank_volatility = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "robustness_label": "fragile",
                    "rank_caveat": "Rank movement frames uncertainty.",
                    "rank_range": 8,
                },
                {
                    "geo_code": "BB",
                    "robustness_label": "stable",
                    "rank_caveat": "Rank is stable in simple stress tests.",
                    "rank_range": 0,
                },
            ]
        )

    def test_country_drivers_include_trace_coverage_and_caveat_fields(self) -> None:
        signature = inspect.signature(driver_module.build_country_drivers)
        self.assertIn("indicator_trace", signature.parameters)
        self.assertIn("coverage_by_geography", signature.parameters)
        self.assertIn("rank_volatility", signature.parameters)

        drivers = driver_module.build_country_drivers(
            self.index,
            indicator_trace=self.indicator_trace,
            coverage_by_geography=self.coverage,
            rank_volatility=self.rank_volatility,
        )

        self.assertEqual(drivers["geo_code"].tolist(), ["AA", "BB"])
        aa = drivers.loc[drivers["geo_code"] == "AA"].iloc[0]
        self.assertEqual(aa["reason_label"], "high pressure + low visible capacity")
        self.assertEqual(aa["pressure_capacity_typology"], "high pressure / low capacity")
        self.assertIn("Pressure 82.0", aa["pressure_capacity_summary"])
        self.assertEqual(aa["pressure_signal_count"], 2)
        self.assertEqual(aa["capacity_signal_count"], 2)
        self.assertIn("Sea heat", aa["top_pressure_signals"])
        self.assertIn("Monitoring coverage", aa["top_capacity_signals"])
        self.assertTrue(aa["data_desert_flag"])
        self.assertTrue(aa["monitoring_missing"])
        self.assertEqual(aa["robustness_label"], "fragile")
        self.assertIn("Rank movement", aa["fragility_caveat"])
        self.assertIn("not causal", aa["non_causal_caveat"].lower())

    def test_country_story_labels_are_short_app_ready_rows_for_scored_geographies(self) -> None:
        self.assertTrue(callable(getattr(driver_module, "build_country_story_labels", None)))

        story_labels = driver_module.build_country_story_labels(
            self.index,
            self.indicator_trace,
            self.coverage,
            self.rank_volatility,
        )

        self.assertEqual(story_labels["geo_code"].tolist(), ["AA", "BB"])
        aa = story_labels.loc[story_labels["geo_code"] == "AA"].iloc[0]
        self.assertLessEqual(len(aa["story_label"]), 72)
        self.assertEqual(aa["story_priority"], "primary")
        self.assertEqual(aa["pressure_capacity_typology"], "high pressure / low capacity")
        self.assertTrue(aa["exemplar_flag"])
        self.assertIn("Sea heat", aa["top_pressure_signals"])
        self.assertIn("Monitoring coverage", aa["top_capacity_signals"])
        self.assertIn("not causal", aa["non_causal_caveat"].lower())


if __name__ == "__main__":
    unittest.main()
