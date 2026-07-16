from __future__ import annotations

import contextlib
import copy
import io
import json
import tempfile
import unittest
from pathlib import Path

from scripts import validate_data_contracts


class AppDataValidationTests(unittest.TestCase):
    def test_validate_root_accepts_complete_contracts_and_matching_public_copies(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            processed = root / "data" / "processed" / "app"
            public = root / "app" / "public" / "data"
            processed.mkdir(parents=True)
            public.mkdir(parents=True)

            _write_json(processed / "geographies.json", _valid_geographies())
            _write_json(processed / "country_details.json", _valid_country_details())
            _write_auxiliary_app_files(processed)
            _copy_public_app_files(processed, public)

            errors = validate_data_contracts.validate_root(root)

            self.assertEqual(errors, [])

    def test_validate_root_reports_missing_required_fields(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            processed = root / "data" / "processed" / "app"
            public = root / "app" / "public" / "data"
            processed.mkdir(parents=True)
            public.mkdir(parents=True)

            broken_geographies = _valid_geographies()
            del broken_geographies["geographies"][0]["centroid"]["lat"]
            del broken_geographies["geographies"][0]["source_refs"]["indicator_trace"]
            del broken_geographies["geographies"][0]["monitoring"]["reporting_status"]
            del broken_geographies["geographies"][0]["rank"]["rank_range"]
            del broken_geographies["geographies"][0]["story"]["story_label"]
            del broken_geographies["geographies"][0]["context"]["subregion"]
            del broken_geographies["geographies"][0]["regional_story"]
            _write_json(processed / "geographies.json", broken_geographies)
            _write_json(processed / "country_details.json", _valid_country_details())
            _write_auxiliary_app_files(processed)
            _copy_public_app_files(processed, public)

            errors = validate_data_contracts.validate_root(root)

            self.assertIn("geographies[0].centroid missing required field: lat", errors)
            self.assertIn("geographies[0].source_refs missing required field: indicator_trace", errors)
            self.assertIn("geographies[0].monitoring missing required field: reporting_status", errors)
            self.assertIn("geographies[0].rank missing required field: rank_range", errors)
            self.assertIn("geographies[0].story missing required field: story_label", errors)
            self.assertIn("geographies[0].context missing required field: subregion", errors)
            self.assertIn("geographies[0] missing required field: regional_story", errors)

    def test_validate_root_reports_regional_story_count_drift(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            processed = root / "data" / "processed" / "app"
            public = root / "app" / "public" / "data"
            processed.mkdir(parents=True)
            public.mkdir(parents=True)

            broken_geographies = _valid_geographies()
            broken_geographies["geographies"][0]["regional_story"]["complete_overlap"] = False
            broken_geographies["geographies"][0]["regional_story"]["quadrant"] = "missing_overlap"
            broken_geographies["geographies"][1]["regional_story"]["visibility"][13][
                "present"
            ] = False
            _write_json(processed / "geographies.json", broken_geographies)
            _write_json(processed / "country_details.json", _valid_country_details())
            _write_auxiliary_app_files(processed)
            _copy_public_app_files(processed, public)

            errors = validate_data_contracts.validate_root(root)

            self.assertIn("regional_story complete comparison count must be 19; found 18", errors)
            self.assertIn("regional_story visibility present count must be 277; found 276", errors)

    def test_validate_root_reports_country_detail_regional_story_drift(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            processed = root / "data" / "processed" / "app"
            public = root / "app" / "public" / "data"
            processed.mkdir(parents=True)
            public.mkdir(parents=True)

            geographies = _valid_geographies()
            country_details = _valid_country_details()
            country_details["details"]["FJ"]["regional_story"]["quadrant"] = "both_up"
            _write_json(processed / "geographies.json", geographies)
            _write_json(processed / "country_details.json", country_details)
            _write_auxiliary_app_files(processed)
            _copy_public_app_files(processed, public)

            errors = validate_data_contracts.validate_root(root)

            self.assertIn(
                "country_details.json.details.FJ regional_story does not match geographies.json",
                errors,
            )

    def test_validate_root_reports_missing_score_input_presence_fields(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            processed = root / "data" / "processed" / "app"
            public = root / "app" / "public" / "data"
            processed.mkdir(parents=True)
            public.mkdir(parents=True)

            broken_geographies = _valid_geographies()
            del broken_geographies["geographies"][0]["score_input_presence"][0]["present"]
            _write_json(processed / "geographies.json", broken_geographies)
            _write_json(processed / "country_details.json", _valid_country_details())
            _write_auxiliary_app_files(processed)
            _copy_public_app_files(processed, public)

            errors = validate_data_contracts.validate_root(root)

            self.assertIn(
                "geographies[0].score_input_presence[0] missing required field: present",
                errors,
            )

    def test_validate_root_checks_all_public_app_file_copies(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            processed = root / "data" / "processed" / "app"
            public = root / "app" / "public" / "data"
            processed.mkdir(parents=True)
            public.mkdir(parents=True)

            _write_json(processed / "geographies.json", _valid_geographies())
            _write_json(processed / "country_details.json", _valid_country_details())
            _write_auxiliary_app_files(processed)
            _copy_public_app_files(processed, public)
            _write_json(public / "country_details.json", {"schema_version": 1, "stale": True})

            errors = validate_data_contracts.validate_root(root)

            self.assertIn(
                "app/public/data/country_details.json does not match "
                "data/processed/app/country_details.json byte-for-byte",
                errors,
            )

    def test_main_prints_fail_summary_and_returns_nonzero_for_missing_files(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            stdout = io.StringIO()

            with contextlib.redirect_stdout(stdout):
                exit_code = validate_data_contracts.main(root=Path(tmp))

            self.assertEqual(exit_code, 1)
            self.assertIn("FAIL app data contracts", stdout.getvalue())
            self.assertIn("data/processed/app/geographies.json does not exist", stdout.getvalue())


def _valid_geographies() -> dict[str, object]:
    base = {
        "schema_version": "2.0",
        "geographies": [
            {
                "geo_code": "FJ",
                "geography_code": "FJ",
                "name": "Fiji",
                "geography_name": "Fiji",
                "centroid": {"lon": 178.0, "lat": -18.0},
                "score_status": "scored",
                "adaptation_gap_score": 42.0,
                "climate_pressure_score": 67.0,
                "capacity_score": 25.0,
                "score_input_indicator_count": 2,
                "context_indicator_count": 1,
                "trace_indicator_count": 3,
                "score_input_presence": [
                    {
                        "dataset_slug": "sea-level-anomalies",
                        "dataset_name": "Sea level anomalies",
                        "pillar": "climate_signal",
                        "present": True,
                    }
                ],
                "missingness_flag": False,
                "source_refs": {
                    "index": "data/processed/gap_index.csv",
                    "indicator_trace": "data/processed/indicator_trace.csv",
                    "regional_crosscurrents": "artifacts/tables/eda_regional_crosscurrents.csv",
                    "regional_feature_matrix": "artifacts/tables/eda_regional_feature_matrix.csv",
                },
                "monitoring": {
                    "reporting_status": "reported_positive_latest_count",
                    "latest_value": 3.0,
                    "latest_year": 2026,
                    "observation_count": 12,
                    "story_priority_rank": 4,
                    "story_priority": "supporting_context",
                    "monitoring_quadrant": "lower gap / reported monitoring",
                    "proxy_caveat": "Monitoring count is proxy coverage.",
                    "missing_reporting_caveat": "",
                },
                "rank": {
                    "scenario_rank_min": 1,
                    "scenario_rank_max": 5,
                    "rank_range": 4,
                    "robustness_label": "fragile",
                    "rank_caveat": "Rank movement frames uncertainty.",
                },
                "story": {
                    "story_label": "Mixed gap",
                    "story_priority": "supporting",
                    "evidence_density_label": "broad indicator evidence",
                    "top_pressure_signals": [{"label": "Rainfall anomalies", "score": 70.0}],
                    "top_capacity_signals": [{"label": "Power generation", "score": 60.0}],
                    "non_causal_caveat": "Descriptive screen only.",
                },
                "context": {
                    "subregion": "Melanesia",
                    "political_status": "Sovereign state",
                    "island_group_or_region_note": "Example",
                    "context_quality": "source_supported",
                    "regional_context_caveat": "Descriptive context only.",
                },
                "outlook_display": {
                    "2030": {
                        "capacity_flat": {
                            "display_recommendation": "show",
                            "diagnostic_quality_label": "supported",
                            "projection_fragility_label": "lower",
                            "caveat": "stress-test interpretation; not a forecast",
                        }
                    }
                },
                "regional_story": {},
            }
        ],
    }
    geography = base["geographies"][0]
    codes = [
        "AS", "CK", "FJ", "FM", "GU", "KI", "MH", "MP", "NC", "NR", "NU",
        "PF", "PG", "PN", "PW", "SB", "TK", "TO", "TV", "VU", "WF", "WS",
    ]
    incomplete = {"GU", "PN", "TK"}
    complete_quadrants = (
        ["water_up_renewable_down"] * 7
        + ["both_up"] * 6
        + ["both_down"] * 3
        + ["water_down_renewable_up"] * 3
    )
    absent_counts = [8, 5, 4, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1] + [0] * 9
    quadrant_index = 0
    geographies = []
    for index, code in enumerate(codes):
        record = copy.deepcopy(geography)
        record["geo_code"] = code
        record["geography_code"] = code
        record["name"] = code
        record["geography_name"] = code
        complete = code not in incomplete
        quadrant = complete_quadrants[quadrant_index] if complete else "missing_overlap"
        quadrant_index += int(complete)
        record["regional_story"] = {
            "water": {
                "first_year": 2000 if complete else None,
                "latest_year": 2022 if complete else None,
                "change_percentage_points": 1.0 if complete else None,
            },
            "renewable": {
                "first_year": 2000,
                "latest_year": 2022,
                "change_percentage_points": -1.0,
            },
            "complete_overlap": complete,
            "quadrant": quadrant,
            "visibility": [
                {
                    "feature_id": f"feature-{feature_order:02d}",
                    "label": f"Feature {feature_order}",
                    "role": "reporting_presence",
                    "present": feature_order > absent_counts[index],
                    "latest_year": 2026 if feature_order == 5 else None,
                }
                for feature_order in range(1, 15)
            ],
        }
        geographies.append(record)
    base["geographies"] = geographies
    return base


def _valid_country_details() -> dict[str, object]:
    geographies = _valid_geographies()["geographies"]
    return {
        "schema_version": 2,
        "details": {
            record["geo_code"]: {
                "regional_story": copy.deepcopy(record["regional_story"]),
                "indicators": [],
            }
            for record in geographies
        },
    }


def _write_json(path: Path, payload: dict[str, object]) -> None:
    path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")


def _write_auxiliary_app_files(processed: Path) -> None:
    for file_name in validate_data_contracts.PUBLIC_APP_FILES:
        path = processed / file_name
        if not path.exists():
            _write_json(path, {"schema_version": 1})


def _copy_public_app_files(processed: Path, public: Path) -> None:
    for file_name in validate_data_contracts.PUBLIC_APP_FILES:
        (public / file_name).write_bytes((processed / file_name).read_bytes())


if __name__ == "__main__":
    unittest.main()
