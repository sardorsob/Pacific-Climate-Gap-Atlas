from __future__ import annotations

import unittest

import pandas as pd

from analysis.preprocessing.app_data import (
    build_geography_records,
    summarize_regional_story,
)


class AppDataExportTests(unittest.TestCase):
    def test_summarize_regional_story_reports_exact_contract_counts(self) -> None:
        records = [
            {
                "geo_code": "FJ",
                "regional_story": {
                    "complete_overlap": True,
                    "quadrant": "water_up_renewable_down",
                    "visibility": [{"present": True}, {"present": False}],
                },
            },
            {
                "geo_code": "GU",
                "regional_story": {
                    "complete_overlap": False,
                    "quadrant": "missing_overlap",
                    "visibility": [{"present": True}, {"present": True}],
                },
            },
        ]

        self.assertEqual(
            summarize_regional_story(records),
            {
                "geography_count": 2,
                "complete_comparison_count": 1,
                "incomplete_geo_codes": ["GU"],
                "quadrant_counts": {"water_up_renewable_down": 1},
                "visibility_positions_per_geography": [2],
                "visibility_present_count": 3,
                "visibility_absent_count": 1,
            },
        )

    def test_build_geography_records_exports_regional_story_evidence(self) -> None:
        index = pd.DataFrame(
            [
                {"geo_code": "FJ", "score_status": "scored"},
                {"geo_code": "GU", "score_status": "scored"},
            ]
        )
        crosscurrents = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "water_first_year": 2000,
                    "water_latest_year": 2022,
                    "water_change_percentage_points": 0.67,
                    "renewable_first_year": 2000,
                    "renewable_latest_year": 2022,
                    "renewable_change_percentage_points": -23.39,
                    "complete_overlap": True,
                    "quadrant": "water_up_renewable_down",
                },
                {
                    "geo_code": "GU",
                    "water_first_year": None,
                    "water_latest_year": None,
                    "water_change_percentage_points": None,
                    "renewable_first_year": 2000,
                    "renewable_latest_year": 2022,
                    "renewable_change_percentage_points": 6.11,
                    "complete_overlap": False,
                    "quadrant": "missing_overlap",
                },
            ]
        )
        visibility = pd.DataFrame(
            [
                {
                    "lane": "evidence_visibility",
                    "geo_code": geo_code,
                    "feature_order": feature_order,
                    "feature_id": f"feature-{feature_order:02d}",
                    "feature_label": f"Feature {feature_order}",
                    "feature_role": "reporting_presence",
                    "present": not (geo_code == "GU" and feature_order == 1),
                    "latest_year": 2026 if feature_order == 5 else None,
                }
                for geo_code in ("FJ", "GU")
                for feature_order in reversed(range(1, 15))
            ]
        )

        records = build_geography_records(
            index=index,
            lookup=pd.DataFrame([{"geo_code": "FJ"}, {"geo_code": "GU"}]),
            outlook=pd.DataFrame([]),
            regional_crosscurrents=crosscurrents,
            regional_feature_matrix=visibility,
        )

        fiji, guam = records
        self.assertEqual(
            fiji["regional_story"],
            {
                "water": {
                    "first_year": 2000,
                    "latest_year": 2022,
                    "change_percentage_points": 0.67,
                },
                "renewable": {
                    "first_year": 2000,
                    "latest_year": 2022,
                    "change_percentage_points": -23.39,
                },
                "complete_overlap": True,
                "quadrant": "water_up_renewable_down",
                "visibility": [
                    {
                        "feature_id": f"feature-{feature_order:02d}",
                        "label": f"Feature {feature_order}",
                        "role": "reporting_presence",
                        "present": True,
                        "latest_year": 2026 if feature_order == 5 else None,
                    }
                    for feature_order in range(1, 15)
                ],
            },
        )
        self.assertIsNone(guam["regional_story"]["water"]["first_year"])
        self.assertIsNone(guam["regional_story"]["water"]["change_percentage_points"])
        self.assertFalse(guam["regional_story"]["complete_overlap"])
        self.assertFalse(guam["regional_story"]["visibility"][0]["present"])

    def test_build_geography_records_exports_score_input_presence_and_counts(self) -> None:
        index = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "score_status": "scored",
                    "adaptation_gap_score": 10.5,
                    "climate_pressure_score": 59.0,
                    "capacity_score": 86.0,
                    "raw_gap_difference": -27.0,
                    "available_pillars": "adaptation_capacity climate_signal",
                    "missing_pillars": "",
                    "score_input_indicator_count": 2,
                    "context_indicator_count": 1,
                    "trace_indicator_count": 3,
                    "missingness_flag": False,
                }
            ]
        )
        trace = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "dataset_slug": "power-generation",
                    "dataset_name": "Power generation",
                    "pillar": "adaptation_capacity",
                },
                {
                    "geo_code": "FJ",
                    "dataset_slug": "sea-level-anomalies",
                    "dataset_name": "Sea level anomalies",
                    "pillar": "climate_signal",
                },
                {
                    "geo_code": "FJ",
                    "dataset_slug": "greenhouse-gas-emissions-per-capita",
                    "dataset_name": "GHG per capita",
                    "pillar": "responsibility_context",
                },
            ]
        )

        record = build_geography_records(
            index=index,
            lookup=pd.DataFrame([{"geo_code": "FJ"}]),
            outlook=pd.DataFrame([]),
            trace=trace,
        )[0]

        self.assertEqual(record["score_input_indicator_count"], 2)
        self.assertEqual(record["context_indicator_count"], 1)
        self.assertEqual(record["trace_indicator_count"], 3)
        self.assertEqual(
            record["score_input_presence"],
            [
                {
                    "dataset_slug": "sea-level-anomalies",
                    "dataset_name": "Sea level anomalies",
                    "pillar": "climate_signal",
                    "present": True,
                },
                {
                    "dataset_slug": "power-generation",
                    "dataset_name": "Power generation",
                    "pillar": "adaptation_capacity",
                    "present": True,
                },
            ],
        )

    def test_build_geography_records_joins_scores_lookup_and_outlook(self) -> None:
        index = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "score_status": "scored",
                    "adaptation_gap_score": 10.5,
                    "climate_pressure_score": 59.0,
                    "capacity_score": 86.0,
                    "raw_gap_difference": -27.0,
                    "available_pillars": "adaptation_capacity climate_signal",
                    "missing_pillars": None,
                    "score_input_indicator_count": 8,
                    "context_indicator_count": 1,
                    "trace_indicator_count": 9,
                    "missingness_flag": False,
                }
            ]
        )
        lookup = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "dataset_count": 9,
                    "row_count": 706,
                    "first_year": 1850,
                    "last_year": 2026,
                    "datasets": "sea-level-anomalies power-generation",
                }
            ]
        )
        outlook = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "horizon": 2030,
                    "scenario": "capacity_flat",
                    "outlook_gap_score": 19.7,
                    "caveat_notes": "not an operational prediction",
                },
                {
                    "geo_code": "FJ",
                    "horizon": 2050,
                    "scenario": "capacity_flat",
                    "outlook_gap_score": 20.3,
                    "caveat_notes": "not an operational prediction",
                },
            ]
        )

        monitoring = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "monitoring_reporting_status": "reported_positive_latest_count",
                    "monitoring_count": 8,
                    "latest_monitoring_year": 2026,
                    "monitoring_observation_count": 138,
                    "story_priority_rank": 5,
                    "story_priority": "supporting_context",
                    "monitoring_quadrant": "lower gap / reported monitoring",
                    "proxy_caveat": "Monitoring count is proxy coverage.",
                    "missing_reporting_caveat": "",
                }
            ]
        )
        rank = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "scenario_rank_min": 16,
                    "scenario_rank_max": 22,
                    "rank_range": 6,
                    "robustness_label": "fragile",
                    "rank_caveat": "Rank movement frames uncertainty.",
                }
            ]
        )
        story = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "story_label": "Lower gap: moderate pressure / high capacity",
                    "story_priority": "supporting",
                    "evidence_density_label": "broad indicator evidence",
                    "top_pressure_signals": "Directly affected persons (71.4); Mean surface temperature anomalies (65.9)",
                    "top_capacity_signals": "Fisheries management measures (75.0); Power generation (83.3)",
                    "non_causal_caveat": "Descriptive screen only.",
                }
            ]
        )
        spatial = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "subregion": "Melanesia",
                    "political_status": "Sovereign state",
                    "island_group_or_region_note": "Melanesia",
                    "context_quality": "source_supported",
                    "regional_context_caveat": "Descriptive context only.",
                }
            ]
        )
        outlook_display = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "target_year": 2030,
                    "scenario": "capacity_flat",
                    "diagnostic_quality_label": "supported",
                    "projection_fragility_label": "lower",
                    "display_recommendation": "show",
                    "caveat": "stress-test interpretation; not a forecast",
                }
            ]
        )

        records = build_geography_records(
            index=index,
            lookup=lookup,
            outlook=outlook,
            monitoring=monitoring,
            rank=rank,
            story=story,
            spatial=spatial,
            outlook_display=outlook_display,
        )

        self.assertEqual(len(records), 1)
        record = records[0]
        self.assertEqual(record["geo_code"], "FJ")
        self.assertEqual(record["geography_code"], "FJ")
        self.assertEqual(record["name"], "Fiji")
        self.assertEqual(record["geography_name"], "Fiji")
        self.assertEqual(record["centroid"], {"lon": 178.1, "lat": -17.7})
        self.assertEqual(record["geometry_status"], "centroid_fallback")
        self.assertEqual(record["outlook"]["2030"]["capacity_flat"]["outlook_gap_score"], 19.7)
        self.assertEqual(record["outlook_2030_flat_gap_score"], 19.7)
        self.assertEqual(record["outlook_2050_flat_gap_score"], 20.3)
        self.assertEqual(record["missing_pillars"], "")
        self.assertEqual(record["score_input_indicator_count"], 8)
        self.assertEqual(record["context_indicator_count"], 1)
        self.assertEqual(record["trace_indicator_count"], 9)
        self.assertIn("indicator_trace", record["source_refs"])
        self.assertEqual(record["monitoring"]["reporting_status"], "reported_positive_latest_count")
        self.assertEqual(record["monitoring"]["latest_value"], 8.0)
        self.assertEqual(record["monitoring"]["latest_year"], 2026)
        self.assertEqual(record["monitoring"]["story_priority_rank"], 5)
        self.assertEqual(record["rank"]["scenario_rank_min"], 16)
        self.assertEqual(record["rank"]["scenario_rank_max"], 22)
        self.assertEqual(record["rank"]["rank_range"], 6)
        self.assertEqual(record["rank"]["robustness_label"], "fragile")
        self.assertEqual(record["story"]["story_label"], "Lower gap: moderate pressure / high capacity")
        self.assertEqual(record["story"]["evidence_density_label"], "broad indicator evidence")
        self.assertEqual(
            record["story"]["top_pressure_signals"][0],
            {"label": "Directly affected persons", "score": 71.4},
        )
        self.assertEqual(
            record["story"]["top_capacity_signals"][1],
            {"label": "Power generation", "score": 83.3},
        )
        self.assertEqual(record["context"]["subregion"], "Melanesia")
        self.assertEqual(record["context"]["political_status"], "Sovereign state")
        self.assertEqual(
            record["outlook_display"]["2030"]["capacity_flat"]["display_recommendation"],
            "show",
        )

    def test_build_geography_records_joins_similarity_neighbors(self) -> None:
        index = pd.DataFrame(
            [
                {
                    "geo_code": "NR",
                    "score_status": "scored",
                    "adaptation_gap_score": 89.0,
                    "climate_pressure_score": 61.5,
                    "capacity_score": 26.9,
                    "raw_gap_difference": 34.6,
                    "available_pillars": "adaptation_capacity climate_signal",
                    "missing_pillars": "",
                    "score_input_indicator_count": 8,
                    "context_indicator_count": 1,
                    "trace_indicator_count": 9,
                    "missingness_flag": False,
                }
            ]
        )
        neighbors = pd.DataFrame(
            [
                {
                    "geo_code": "NR",
                    "neighbor_geo_code": "GU",
                    "similarity_rank": 1,
                    "jsd_distance": 0.081234,
                    "similarity_band": "similar_profile",
                    "reason_label": "Both profiles lean toward data visibility.",
                    "neighbor_caveat": "Similarity is about official-data profiles only.",
                }
            ]
        )

        records = build_geography_records(
            index=index,
            lookup=pd.DataFrame([{"geo_code": "NR"}]),
            outlook=pd.DataFrame([]),
            monitoring=pd.DataFrame([]),
            rank=pd.DataFrame([]),
            story=pd.DataFrame([]),
            spatial=pd.DataFrame([]),
            outlook_display=pd.DataFrame([]),
            similarity_neighbors=neighbors,
        )

        self.assertEqual(
            records[0]["similarity_neighbors"],
            [
                {
                    "neighbor_geo_code": "GU",
                    "neighbor_name": "Guam",
                    "similarity_rank": 1,
                    "jsd_distance": 0.0812,
                    "similarity_band": "similar_profile",
                    "reason_label": "Both profiles lean toward data visibility.",
                    "neighbor_caveat": "Similarity is about official-data profiles only.",
                }
            ],
        )

    def test_build_geography_records_preserves_missing_monitoring_as_null_not_zero(self) -> None:
        index = pd.DataFrame(
            [
                {
                    "geo_code": "AS",
                    "score_status": "scored",
                    "adaptation_gap_score": 85.0,
                    "climate_pressure_score": 49.7,
                    "capacity_score": 18.2,
                    "raw_gap_difference": 31.5,
                    "available_pillars": "adaptation_capacity climate_signal",
                    "missing_pillars": "",
                    "score_input_indicator_count": 7,
                    "context_indicator_count": 0,
                    "trace_indicator_count": 7,
                    "missingness_flag": False,
                }
            ]
        )
        lookup = pd.DataFrame([{"geo_code": "AS"}])
        outlook = pd.DataFrame([])
        monitoring = pd.DataFrame(
            [
                {
                    "geo_code": "AS",
                    "monitoring_reporting_status": "missing_monitoring_dataset_row",
                    "monitoring_count": 0,
                    "latest_monitoring_year": "",
                    "monitoring_observation_count": 0,
                    "story_priority_rank": 1,
                    "story_priority": "priority_1_high_gap_low_monitoring",
                    "monitoring_quadrant": "high gap / low monitoring",
                    "proxy_caveat": "Monitoring count is proxy coverage.",
                    "missing_reporting_caveat": "No monitoring rows in processed observations.",
                }
            ]
        )

        records = build_geography_records(
            index=index,
            lookup=lookup,
            outlook=outlook,
            monitoring=monitoring,
            rank=pd.DataFrame([]),
            story=pd.DataFrame([]),
            spatial=pd.DataFrame([]),
            outlook_display=pd.DataFrame([]),
        )

        monitoring_payload = records[0]["monitoring"]
        self.assertEqual(monitoring_payload["reporting_status"], "missing_monitoring_dataset_row")
        self.assertIsNone(monitoring_payload["latest_value"])
        self.assertIsNone(monitoring_payload["latest_year"])

if __name__ == "__main__":
    unittest.main()
