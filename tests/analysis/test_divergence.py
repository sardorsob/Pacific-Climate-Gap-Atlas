from __future__ import annotations

import unittest

import pandas as pd

from analysis.eda.divergence import (
    DIVERGENCE_CAVEAT,
    build_evidence_fingerprints,
    build_pairwise_jsd,
    build_similarity_neighbors,
    jensen_shannon_divergence,
    normalize_vector,
)


class EvidenceFingerprintDivergenceTests(unittest.TestCase):
    def test_normalize_vector_preserves_zero_components_without_smoothing(self) -> None:
        normalized = normalize_vector([2.0, 0.0, 2.0], component_names=["a", "b", "c"])

        self.assertEqual(normalized, {"a": 0.5, "b": 0.0, "c": 0.5})
        self.assertAlmostEqual(sum(normalized.values()), 1.0)

    def test_normalize_vector_requires_explicit_smoothing_for_zero_total(self) -> None:
        with self.assertRaisesRegex(ValueError, "zero total"):
            normalize_vector([0.0, 0.0], component_names=["a", "b"])

        normalized = normalize_vector(
            [0.0, 0.0],
            component_names=["a", "b"],
            smoothing=0.01,
        )

        self.assertEqual(normalized, {"a": 0.5, "b": 0.5})

    def test_jsd_is_symmetric_bounded_and_uses_base_two(self) -> None:
        left = [1.0, 0.0]
        right = [0.0, 1.0]

        forward = jensen_shannon_divergence(left, right)
        reverse = jensen_shannon_divergence(right, left)

        self.assertAlmostEqual(forward, reverse)
        self.assertGreaterEqual(forward, 0.0)
        self.assertLessEqual(forward, 1.0)
        self.assertAlmostEqual(forward, 1.0)

    def test_pairwise_jsd_output_is_deterministically_sorted_and_bounded(self) -> None:
        fingerprints = pd.DataFrame(
            [
                _fingerprint_row("BB", 0.25, 0.25, 0.25, 0.25),
                _fingerprint_row("AA", 1.0, 0.0, 0.0, 0.0),
                _fingerprint_row("CC", 0.0, 1.0, 0.0, 0.0),
            ]
        )

        pairwise = build_pairwise_jsd(fingerprints)

        self.assertEqual(
            pairwise[["geo_code_a", "geo_code_b"]].apply(tuple, axis=1).tolist(),
            [("AA", "BB"), ("AA", "CC"), ("BB", "CC")],
        )
        self.assertTrue(pairwise["jsd_distance"].between(0.0, 1.0).all())
        self.assertTrue((pairwise["jsd_log_base"] == 2).all())

    def test_fingerprints_preserve_missingness_and_status_components(self) -> None:
        fingerprints = build_evidence_fingerprints(
            country_drivers=_country_drivers(),
            indicator_trace=_indicator_trace(),
            rank_volatility=_rank_volatility(),
            monitoring_gap=_monitoring_gap(),
        )

        row = fingerprints.loc[fingerprints["geo_code"] == "AA"].iloc[0]
        self.assertIn("component_missing_data", fingerprints.columns)
        self.assertIn("component_monitoring_reporting_gap", fingerprints.columns)
        self.assertIn("fingerprint_missing_data", fingerprints.columns)
        self.assertIn("fingerprint_monitoring_reporting_gap", fingerprints.columns)
        self.assertGreater(row["component_missing_data"], 0.0)
        self.assertGreater(row["component_monitoring_reporting_gap"], 0.0)
        self.assertGreater(row["fingerprint_missing_data"], 0.0)
        self.assertGreater(row["fingerprint_monitoring_reporting_gap"], 0.0)
        self.assertAlmostEqual(row["fingerprint_total"], 1.0)

    def test_similarity_neighbors_include_cautious_caveats_and_deterministic_ties(self) -> None:
        fingerprints = pd.DataFrame(
            [
                _fingerprint_row("AA", 1.0, 0.0, 0.0, 0.0),
                _fingerprint_row("BB", 0.5, 0.5, 0.0, 0.0),
                _fingerprint_row("CC", 0.5, 0.5, 0.0, 0.0),
            ]
        )
        pairwise = build_pairwise_jsd(fingerprints)

        neighbors = build_similarity_neighbors(pairwise, fingerprints, neighbor_count=2)

        aa_neighbors = neighbors[neighbors["geo_code"] == "AA"]
        self.assertEqual(aa_neighbors["neighbor_geo_code"].tolist(), ["BB", "CC"])
        self.assertEqual(aa_neighbors["similarity_rank"].tolist(), [1, 2])
        self.assertTrue(aa_neighbors["neighbor_caveat"].str.contains("official-data").all())
        self.assertTrue(aa_neighbors["neighbor_caveat"].str.contains("policy need").all())
        self.assertTrue((aa_neighbors["neighbor_caveat"] == DIVERGENCE_CAVEAT).all())


def _fingerprint_row(
    geo_code: str,
    pressure: float,
    capacity: float,
    visibility: float,
    missingness: float,
) -> dict[str, object]:
    return {
        "geo_code": geo_code,
        "fingerprint_pressure": pressure,
        "fingerprint_capacity": capacity,
        "fingerprint_data_visibility": visibility,
        "fingerprint_missing_data": missingness,
        "component_pressure": pressure,
        "component_capacity": capacity,
        "component_data_visibility": visibility,
        "component_missing_data": missingness,
        "component_labels": "pressure capacity data_visibility missing_data",
    }


def _country_drivers() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "geo_code": "AA",
                "score_status": "scored",
                "adaptation_gap_rank": 1,
                "adaptation_gap_score": 80.0,
                "climate_pressure_score": 70.0,
                "capacity_score": 20.0,
                "included_indicator_count": 3,
                "data_desert_flag": True,
                "monitoring_missing": True,
                "coverage_flag": "data_desert",
                "robustness_label": "fragile",
                "rank_range": 5,
                "missingness_flag": False,
            },
            {
                "geo_code": "BB",
                "score_status": "scored",
                "adaptation_gap_rank": 2,
                "adaptation_gap_score": 40.0,
                "climate_pressure_score": 30.0,
                "capacity_score": 60.0,
                "included_indicator_count": 6,
                "data_desert_flag": False,
                "monitoring_missing": False,
                "coverage_flag": "complete_dataset_coverage",
                "robustness_label": "stable",
                "rank_range": 0,
                "missingness_flag": False,
            },
        ]
    )


def _indicator_trace() -> pd.DataFrame:
    return pd.DataFrame(
        [
            _trace_row("AA", "heat", "climate_signal", 70.0),
            _trace_row("AA", "fishery", "adaptation_capacity", 20.0),
            _trace_row("BB", "heat", "climate_signal", 30.0),
            _trace_row("BB", "fishery", "adaptation_capacity", 60.0),
            _trace_row("BB", "monitoring", "adaptation_capacity", 50.0),
        ]
    )


def _trace_row(
    geo_code: str,
    dataset_slug: str,
    pillar: str,
    indicator_score: float,
) -> dict[str, object]:
    return {
        "geo_code": geo_code,
        "dataset_slug": dataset_slug,
        "dataset_name": dataset_slug.title(),
        "pillar": pillar,
        "indicator_score": indicator_score,
    }


def _rank_volatility() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"geo_code": "AA", "rank_range": 5, "robustness_label": "fragile"},
            {"geo_code": "BB", "rank_range": 0, "robustness_label": "stable"},
        ]
    )


def _monitoring_gap() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "geo_code": "AA",
                "geography_name": "Alpha Atoll",
                "subregion": "Testesia",
                "monitoring_reporting_status": "missing_monitoring_dataset_row",
                "monitoring_coverage_tier": "missing_reporting",
                "monitoring_count": 0,
                "monitoring_observation_count": 0,
            },
            {
                "geo_code": "BB",
                "geography_name": "Beta Island",
                "subregion": "Testesia",
                "monitoring_reporting_status": "reported_positive_latest_count",
                "monitoring_coverage_tier": "visible_monitoring",
                "monitoring_count": 4,
                "monitoring_observation_count": 2,
            },
        ]
    )


if __name__ == "__main__":
    unittest.main()
