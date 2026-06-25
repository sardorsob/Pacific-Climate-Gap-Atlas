from __future__ import annotations

import unittest

import pandas as pd

from analysis.eda.spatial_patterns import (
    build_spatial_typologies,
    build_subregion_comparisons,
)


class SpatialTypologyTests(unittest.TestCase):
    def test_build_spatial_typologies_joins_context_and_documents_rule_labels(self) -> None:
        drivers = pd.DataFrame(
            [
                _driver_row(
                    "AA",
                    1,
                    82.0,
                    78.0,
                    22.0,
                    "primary",
                    "high pressure / low capacity",
                    data_desert=False,
                    monitoring_missing=True,
                    robustness_label="fragile",
                    rank_range=7,
                ),
                _driver_row(
                    "BB",
                    2,
                    54.0,
                    72.0,
                    70.0,
                    "secondary",
                    "high pressure / high capacity",
                    data_desert=True,
                    monitoring_missing=False,
                    robustness_label="sensitive",
                    rank_range=3,
                ),
                _driver_row(
                    "CC",
                    3,
                    24.0,
                    30.0,
                    75.0,
                    "context",
                    "low pressure / high capacity",
                    data_desert=False,
                    monitoring_missing=False,
                    robustness_label="stable",
                    rank_range=0,
                ),
            ]
        )
        context = pd.DataFrame(
            [
                {
                    "geo_code": "AA",
                    "geography_name": "Alpha Atoll",
                    "pacific_subregion": "Melanesia",
                    "political_status": "sovereign state",
                    "island_group_or_region_note": "Alpha reef system",
                    "context_quality": "source_supported",
                    "context_note": "Review status wording.",
                },
                {
                    "geo_code": "BB",
                    "geography_name": "Beta Islands",
                    "pacific_subregion": "Melanesia",
                    "political_status": "territory",
                    "island_group_or_region_note": "Beta chain",
                    "context_quality": "source_supported",
                    "context_note": "Descriptive context only.",
                },
                {
                    "geo_code": "CC",
                    "geography_name": "Coral Country",
                    "pacific_subregion": "Polynesia",
                    "political_status": "sovereign state",
                    "island_group_or_region_note": "Coral group",
                    "context_quality": "source_supported",
                    "context_note": "Descriptive context only.",
                },
            ]
        )

        typologies = build_spatial_typologies(drivers, context)

        expected_columns = {
            "geo_code",
            "geography_name",
            "subregion",
            "adaptation_gap_rank",
            "adaptation_gap_score",
            "pressure_capacity_typology",
            "story_priority",
            "data_desert_flag",
            "monitoring_missing",
            "robustness_label",
            "rank_range",
            "spatial_typology",
            "story_cluster_label",
            "coverage_monitoring_gap_flag",
            "fragile_rank_flag",
            "rank_uncertainty_flag",
            "typology_caveat",
            "cluster_caveat",
            "distance_caveat",
            "regional_context_caveat",
        }
        self.assertTrue(expected_columns.issubset(set(typologies.columns)))
        self.assertEqual(typologies["geo_code"].tolist(), ["AA", "BB", "CC"])

        aa = typologies.loc[typologies["geo_code"] == "AA"].iloc[0]
        self.assertEqual(aa["geography_name"], "Alpha Atoll")
        self.assertEqual(aa["subregion"], "Melanesia")
        self.assertEqual(aa["adaptation_gap_tier"], "high gap")
        self.assertEqual(aa["capacity_tier"], "low capacity")
        self.assertEqual(aa["spatial_typology"], "high gap / low visible capacity")
        self.assertEqual(aa["story_cluster_label"], "Melanesia high-gap capacity constraint")
        self.assertTrue(aa["coverage_monitoring_gap_flag"])
        self.assertTrue(aa["fragile_rank_flag"])
        self.assertTrue(aa["rank_uncertainty_flag"])
        self.assertIn("not statistical clusters", aa["cluster_caveat"])
        self.assertIn("No centroid-distance", aa["distance_caveat"])
        self.assertIn("Review status wording", aa["regional_context_caveat"])

        bb = typologies.loc[typologies["geo_code"] == "BB"].iloc[0]
        self.assertEqual(bb["spatial_typology"], "high pressure / higher visible capacity")
        self.assertEqual(bb["story_cluster_label"], "Melanesia data and monitoring watch")
        self.assertTrue(bb["coverage_monitoring_gap_flag"])
        self.assertFalse(bb["fragile_rank_flag"])
        self.assertTrue(bb["rank_uncertainty_flag"])

    def test_build_subregion_comparisons_aggregates_counts_and_dominant_typologies(self) -> None:
        typologies = pd.DataFrame(
            [
                _typology_row(
                    "AA",
                    "Alpha Atoll",
                    "Melanesia",
                    1,
                    82.0,
                    78.0,
                    22.0,
                    "primary",
                    "high pressure / low capacity",
                    "high gap / low visible capacity",
                    "Melanesia high-gap capacity constraint",
                    data_desert=False,
                    monitoring_missing=True,
                    monitoring_reporting_gap=True,
                    robustness_label="fragile",
                    fragile_rank=True,
                    rank_uncertainty=True,
                ),
                _typology_row(
                    "BB",
                    "Beta Islands",
                    "Melanesia",
                    4,
                    72.0,
                    68.0,
                    28.0,
                    "primary",
                    "high pressure / low capacity",
                    "high gap / low visible capacity",
                    "Melanesia high-gap capacity constraint",
                    data_desert=True,
                    monitoring_missing=False,
                    monitoring_reporting_gap=True,
                    robustness_label="sensitive",
                    fragile_rank=False,
                    rank_uncertainty=True,
                ),
                _typology_row(
                    "CC",
                    "Coral Country",
                    "Polynesia",
                    7,
                    28.0,
                    30.0,
                    74.0,
                    "context",
                    "low pressure / high capacity",
                    "lower gap / context benchmark",
                    "Polynesia lower-gap benchmark",
                    data_desert=False,
                    monitoring_missing=False,
                    monitoring_reporting_gap=False,
                    robustness_label="stable",
                    fragile_rank=False,
                    rank_uncertainty=False,
                ),
                _typology_row(
                    "DD",
                    "Delta Island",
                    "Melanesia",
                    100,
                    60.0,
                    40.0,
                    45.0,
                    "secondary",
                    "moderate pressure / moderate capacity",
                    "mixed gap / regional context",
                    "Melanesia mixed-context comparison",
                    data_desert=False,
                    monitoring_missing=False,
                    monitoring_reporting_gap=False,
                    robustness_label="stable",
                    fragile_rank=False,
                    rank_uncertainty=False,
                ),
            ]
        )

        comparisons = build_subregion_comparisons(typologies)

        expected_columns = {
            "subregion",
            "geography_count",
            "mean_adaptation_gap_score",
            "mean_climate_pressure_score",
            "mean_capacity_score",
            "high_gap_count",
            "low_capacity_count",
            "coverage_monitoring_gap_count",
            "fragile_rank_count",
            "dominant_spatial_typology",
            "dominant_pressure_capacity_typology",
            "dominant_story_cluster_label",
            "regional_caveat",
            "distance_caveat",
            "cluster_caveat",
        }
        self.assertTrue(expected_columns.issubset(set(comparisons.columns)))
        self.assertEqual(comparisons["subregion"].tolist(), ["Melanesia", "Polynesia"])

        melanesia = comparisons.loc[comparisons["subregion"] == "Melanesia"].iloc[0]
        self.assertEqual(melanesia["geography_count"], 3)
        self.assertEqual(melanesia["geography_codes"], "AA BB DD")
        self.assertEqual(melanesia["mean_adaptation_gap_score"], 71.3333)
        self.assertEqual(melanesia["mean_capacity_score"], 31.6667)
        self.assertEqual(melanesia["median_adaptation_gap_rank"], 4.0)
        self.assertEqual(melanesia["high_gap_count"], 2)
        self.assertEqual(melanesia["low_capacity_count"], 2)
        self.assertEqual(melanesia["high_pressure_count"], 2)
        self.assertEqual(melanesia["data_desert_count"], 1)
        self.assertEqual(melanesia["monitoring_missing_count"], 1)
        self.assertEqual(melanesia["coverage_monitoring_gap_count"], 2)
        self.assertEqual(melanesia["fragile_rank_count"], 1)
        self.assertEqual(melanesia["rank_uncertainty_count"], 2)
        self.assertEqual(
            melanesia["dominant_spatial_typology"],
            "high gap / low visible capacity",
        )
        self.assertIn("high gap / low visible capacity (2)", melanesia["typology_mix"])
        self.assertIn("small subregion groups", melanesia["regional_caveat"])
        self.assertIn("not statistical clusters", melanesia["cluster_caveat"])


def _driver_row(
    geo_code: str,
    rank: int,
    gap: float,
    pressure: float,
    capacity: float,
    story_priority: str,
    pressure_capacity_typology: str,
    *,
    data_desert: bool,
    monitoring_missing: bool,
    robustness_label: str,
    rank_range: int,
) -> dict[str, object]:
    return {
        "geo_code": geo_code,
        "score_status": "scored",
        "adaptation_gap_rank": rank,
        "adaptation_gap_score": gap,
        "climate_pressure_score": pressure,
        "capacity_score": capacity,
        "driver_label": "synthetic driver",
        "story_label": "Synthetic story",
        "story_priority": story_priority,
        "pressure_capacity_typology": pressure_capacity_typology,
        "data_desert_flag": data_desert,
        "monitoring_missing": monitoring_missing,
        "coverage_flag": "synthetic",
        "robustness_label": robustness_label,
        "rank_range": rank_range,
        "fragility_caveat": "Rank movement frames uncertainty.",
        "non_causal_caveat": "Descriptive screen only; not causal.",
    }


def _typology_row(
    geo_code: str,
    geography_name: str,
    subregion: str,
    rank: int,
    gap: float,
    pressure: float,
    capacity: float,
    story_priority: str,
    pressure_capacity_typology: str,
    spatial_typology: str,
    story_cluster_label: str,
    *,
    data_desert: bool,
    monitoring_missing: bool,
    monitoring_reporting_gap: bool,
    robustness_label: str,
    fragile_rank: bool,
    rank_uncertainty: bool,
) -> dict[str, object]:
    return {
        "geo_code": geo_code,
        "geography_name": geography_name,
        "subregion": subregion,
        "adaptation_gap_rank": rank,
        "adaptation_gap_score": gap,
        "climate_pressure_score": pressure,
        "capacity_score": capacity,
        "story_priority": story_priority,
        "pressure_capacity_typology": pressure_capacity_typology,
        "spatial_typology": spatial_typology,
        "story_cluster_label": story_cluster_label,
        "data_desert_flag": data_desert,
        "monitoring_missing": monitoring_missing,
        "coverage_monitoring_gap_flag": monitoring_reporting_gap,
        "robustness_label": robustness_label,
        "fragile_rank_flag": fragile_rank,
        "rank_uncertainty_flag": rank_uncertainty,
    }


if __name__ == "__main__":
    unittest.main()
