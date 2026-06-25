from __future__ import annotations

import unittest

import pandas as pd

from analysis.eda.coverage import build_monitoring_gap


class MonitoringGapStoryTests(unittest.TestCase):
    def test_build_monitoring_gap_adds_gis_story_fields_and_reporting_caveats(self) -> None:
        index = pd.DataFrame(
            [
                {
                    "geo_code": "AS",
                    "adaptation_gap_score": 84.9656,
                    "climate_pressure_score": 49.6753,
                    "capacity_score": 18.1818,
                },
                {
                    "geo_code": "NR",
                    "adaptation_gap_score": 88.9403,
                    "climate_pressure_score": 61.5530,
                    "capacity_score": 26.9360,
                },
                {
                    "geo_code": "TV",
                    "adaptation_gap_score": 77.7085,
                    "climate_pressure_score": 66.5314,
                    "capacity_score": 40.7407,
                },
            ]
        )
        observations = pd.DataFrame(
            [
                {
                    "dataset_slug": "meteorological-monitoring-network",
                    "geo_code": "NR",
                    "year": 2026,
                    "value": 0,
                },
                {
                    "dataset_slug": "meteorological-monitoring-network",
                    "geo_code": "TV",
                    "year": 2025,
                    "value": 2,
                },
                {
                    "dataset_slug": "meteorological-monitoring-network",
                    "geo_code": "TV",
                    "year": 2026,
                    "value": 3,
                },
            ]
        )

        monitoring = build_monitoring_gap(index, observations)

        expected_columns = {
            "geography_name",
            "subregion",
            "adaptation_gap_rank",
            "climate_pressure_rank",
            "low_capacity_rank",
            "monitoring_count_rank",
            "monitoring_observation_count",
            "first_monitoring_year",
            "monitoring_reporting_status",
            "monitoring_coverage_tier",
            "adaptation_gap_tier",
            "climate_pressure_tier",
            "capacity_tier",
            "monitoring_quadrant",
            "pressure_monitoring_quadrant",
            "capacity_monitoring_quadrant",
            "story_priority_rank",
            "story_priority",
            "proxy_caveat",
            "missing_reporting_caveat",
        }
        self.assertTrue(expected_columns.issubset(set(monitoring.columns)))
        self.assertEqual(monitoring["geo_code"].tolist(), ["NR", "AS", "TV"])

        nr = monitoring.loc[monitoring["geo_code"] == "NR"].iloc[0]
        self.assertEqual(nr["subregion"], "Micronesia")
        self.assertEqual(nr["latest_monitoring_year"], 2026)
        self.assertEqual(nr["monitoring_count"], 0)
        self.assertEqual(nr["monitoring_reporting_status"], "reported_zero_latest_count")
        self.assertEqual(nr["monitoring_quadrant"], "high gap / low monitoring")
        self.assertEqual(nr["story_priority"], "priority_1_high_gap_low_monitoring")
        self.assertIn("reports 0", nr["missing_reporting_caveat"])

        american_samoa = monitoring.loc[monitoring["geo_code"] == "AS"].iloc[0]
        self.assertEqual(american_samoa["subregion"], "Polynesia")
        self.assertEqual(
            american_samoa["monitoring_reporting_status"],
            "missing_monitoring_dataset_row",
        )
        self.assertEqual(
            american_samoa["capacity_monitoring_quadrant"],
            "low capacity / low monitoring",
        )
        self.assertTrue(american_samoa["monitoring_story_flag"])
        self.assertIn("not normalized by population, land area", american_samoa["proxy_caveat"])
        self.assertIn(
            "No meteorological-monitoring-network rows",
            american_samoa["missing_reporting_caveat"],
        )

        tuvalu = monitoring.loc[monitoring["geo_code"] == "TV"].iloc[0]
        self.assertEqual(tuvalu["latest_monitoring_year"], 2026)
        self.assertEqual(tuvalu["monitoring_count"], 3)
        self.assertEqual(tuvalu["monitoring_quadrant"], "high gap / visible monitoring")
        self.assertEqual(
            tuvalu["pressure_monitoring_quadrant"],
            "high pressure / visible monitoring",
        )
        self.assertFalse(tuvalu["monitoring_story_flag"])


if __name__ == "__main__":
    unittest.main()
