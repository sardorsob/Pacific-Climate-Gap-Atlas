from __future__ import annotations

import unittest

import pandas as pd

from analysis.features.gap_index import build_gap_index, latest_indicator_snapshot
from analysis.features.gap_index import build_indicator_trace


class GapIndexTests(unittest.TestCase):
    def test_latest_indicator_snapshot_keeps_latest_observation_per_geo_dataset(self) -> None:
        observations = pd.DataFrame(
            [
                {
                    "dataset_slug": "sea-level-anomalies",
                    "dataset_name": "Sea level anomalies",
                    "pillar": "climate_signal",
                    "geo_code": "FJ",
                    "year": 2020,
                    "value": 1.0,
                    "unit": "MM",
                },
                {
                    "dataset_slug": "sea-level-anomalies",
                    "dataset_name": "Sea level anomalies",
                    "pillar": "climate_signal",
                    "geo_code": "FJ",
                    "year": 2021,
                    "value": 2.0,
                    "unit": "MM",
                },
            ]
        )

        snapshot = latest_indicator_snapshot(observations)

        self.assertEqual(len(snapshot), 1)
        self.assertEqual(snapshot.loc[0, "year"], 2021)
        self.assertEqual(snapshot.loc[0, "value"], 2.0)

    def test_build_gap_index_scores_pressure_minus_capacity(self) -> None:
        observations = pd.DataFrame(
            [
                _row("sea-level-anomalies", "Sea level", "climate_signal", "FJ", 2023, 10),
                _row("sea-level-anomalies", "Sea level", "climate_signal", "WS", 2023, 20),
                _row("power-generation", "Power generation", "adaptation_capacity", "FJ", 2023, 100),
                _row("power-generation", "Power generation", "adaptation_capacity", "WS", 2023, 10),
            ]
        )

        index, trace = build_gap_index(observations)

        self.assertEqual(len(trace), 4)
        fj = index[index["geo_code"] == "FJ"].iloc[0]
        ws = index[index["geo_code"] == "WS"].iloc[0]
        self.assertEqual(fj["score_status"], "scored")
        self.assertEqual(ws["score_status"], "scored")
        self.assertEqual(fj["adaptation_gap_score"], 0.0)
        self.assertEqual(ws["adaptation_gap_score"], 100.0)
        self.assertLess(fj["climate_pressure_score"], ws["climate_pressure_score"])
        self.assertGreater(fj["capacity_score"], ws["capacity_score"])

    def test_indicator_trace_scores_anomalies_by_magnitude(self) -> None:
        observations = pd.DataFrame(
            [
                _row("rainfall-anomalies", "Rainfall", "climate_signal", "FJ", 2025, -20),
                _row("rainfall-anomalies", "Rainfall", "climate_signal", "WS", 2025, 5),
            ]
        )

        trace = build_indicator_trace(latest_indicator_snapshot(observations))

        fj = trace[trace["geo_code"] == "FJ"].iloc[0]
        ws = trace[trace["geo_code"] == "WS"].iloc[0]
        self.assertEqual(fj["latest_value"], -20)
        self.assertEqual(fj["scoring_value"], 20)
        self.assertGreater(fj["indicator_score"], ws["indicator_score"])

    def test_build_gap_index_marks_missing_capacity_as_insufficient(self) -> None:
        observations = pd.DataFrame(
            [
                _row("sea-level-anomalies", "Sea level", "climate_signal", "FJ", 2023, 10),
                _row("sea-level-anomalies", "Sea level", "climate_signal", "WS", 2023, 20),
                _row("power-generation", "Power generation", "adaptation_capacity", "FJ", 2023, 100),
            ]
        )

        index, _ = build_gap_index(observations)

        ws = index[index["geo_code"] == "WS"].iloc[0]
        self.assertEqual(ws["score_status"], "insufficient_data")
        self.assertTrue(ws["missingness_flag"])
        self.assertEqual(ws["missing_pillars"], "adaptation_capacity")
        self.assertTrue(pd.isna(ws["adaptation_gap_score"]))


def _row(
    dataset_slug: str,
    dataset_name: str,
    pillar: str,
    geo_code: str,
    year: int,
    value: float,
) -> dict[str, object]:
    return {
        "dataset_slug": dataset_slug,
        "dataset_name": dataset_name,
        "pillar": pillar,
        "story_role": "",
        "indicator_code": dataset_slug,
        "geo_code": geo_code,
        "year": year,
        "value": value,
        "unit": "",
        "obs_status": "",
        "reporting_type": "",
        "official_url": "https://example.test/view",
        "sdmx_csv_api_url": "https://example.test/api.csv",
        "source_content_sha256": "abc",
        "source_row_hash": f"{dataset_slug}-{geo_code}-{year}",
    }


if __name__ == "__main__":
    unittest.main()
