from __future__ import annotations

import unittest

import pandas as pd

from analysis.modeling.outlook import (
    build_outlook_projection,
    fit_linear_trend,
    make_climate_trend_diagnostics,
)


class OutlookTests(unittest.TestCase):
    def test_fit_linear_trend_estimates_simple_slope_and_projection(self) -> None:
        series = pd.DataFrame(
            {
                "year": [2020, 2021, 2022, 2023],
                "scoring_value": [1.0, 2.0, 3.0, 4.0],
            }
        )

        fit = fit_linear_trend(series, horizons=[2030], holdout_points=1)

        self.assertEqual(fit.n_obs, 4)
        self.assertAlmostEqual(fit.slope_per_year, 1.0)
        self.assertAlmostEqual(fit.projections[2030], 11.0)
        self.assertAlmostEqual(fit.holdout_linear_mae, 0.0)
        self.assertAlmostEqual(fit.holdout_naive_mae, 1.0)

    def test_make_climate_trend_diagnostics_excludes_sparse_series(self) -> None:
        observations = pd.DataFrame(
            [
                _obs("rainfall-anomalies", "Rainfall", "FJ", 2020, -1.0),
                _obs("rainfall-anomalies", "Rainfall", "FJ", 2021, -2.0),
                _obs("rainfall-anomalies", "Rainfall", "WS", 2020, 1.0),
                _obs("rainfall-anomalies", "Rainfall", "WS", 2021, 2.0),
                _obs("rainfall-anomalies", "Rainfall", "WS", 2022, 3.0),
            ]
        )

        diagnostics = make_climate_trend_diagnostics(
            observations,
            horizons=[2030],
            minimum_points=3,
        )

        self.assertEqual(diagnostics["geo_code"].tolist(), ["WS"])
        self.assertEqual(diagnostics.loc[0, "n_obs"], 3)
        self.assertEqual(diagnostics.loc[0, "projected_2030"], 11.0)

    def test_build_outlook_projection_returns_scenarios_and_caveats(self) -> None:
        diagnostics = pd.DataFrame(
            [
                {
                    "geo_code": "FJ",
                    "dataset_slug": "rainfall-anomalies",
                    "projected_2030": 10.0,
                    "residual_std": 1.0,
                    "holdout_linear_mae": 1.0,
                    "holdout_naive_mae": 2.0,
                },
                {
                    "geo_code": "WS",
                    "dataset_slug": "rainfall-anomalies",
                    "projected_2030": 20.0,
                    "residual_std": 3.0,
                    "holdout_linear_mae": 5.0,
                    "holdout_naive_mae": 2.0,
                },
            ]
        )
        current_index = pd.DataFrame(
            [
                {"geo_code": "FJ", "capacity_score": 80.0},
                {"geo_code": "WS", "capacity_score": 20.0},
            ]
        )

        outlook = build_outlook_projection(
            diagnostics=diagnostics,
            current_index=current_index,
            horizons=[2030],
        )

        self.assertEqual(
            set(outlook["scenario"]),
            {"capacity_flat", "capacity_gradual_improvement"},
        )
        ws_flat = outlook[
            (outlook["geo_code"] == "WS") & (outlook["scenario"] == "capacity_flat")
        ].iloc[0]
        self.assertEqual(ws_flat["trend_indicator_count"], 1)
        self.assertIn("linear trend did not beat naive", ws_flat["caveat_notes"])
        self.assertEqual(ws_flat["outlook_gap_score"], 100.0)


def _obs(
    dataset_slug: str,
    dataset_name: str,
    geo_code: str,
    year: int,
    value: float,
) -> dict[str, object]:
    return {
        "dataset_slug": dataset_slug,
        "dataset_name": dataset_name,
        "pillar": "climate_signal",
        "geo_code": geo_code,
        "year": year,
        "value": value,
    }


if __name__ == "__main__":
    unittest.main()
