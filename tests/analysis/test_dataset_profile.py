from __future__ import annotations

import hashlib
from email.message import Message
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

import analysis.io.sdmx as sdmx
from analysis.io.dataset_config import load_dataset_config, select_processing_datasets
from analysis.io.dataset_profile import profile_csv_text, profile_to_contract, slugify
from analysis.io.official_data import OfficialDataset
from analysis.io.sdmx import fetch_sdmx_csv_text
from scripts.fetch_official_data import fetch_to_raw_cache
from scripts.make_dataset import build_processed_dataset, load_or_fetch_csv_text
from scripts.profile_datasets import profile_priority_datasets


class DatasetProfileTests(unittest.TestCase):
    def test_slugify_makes_contract_safe_names(self) -> None:
        self.assertEqual(
            slugify(
                "Fisheries management measures in place and multilateral "
                "and bilateral fisheries management arrangements"
            ),
            "fisheries-management-measures-in-place-and-multilateral-and-bilateral-fisheries-management-arrangements",
        )

    def test_profile_csv_text_counts_rows_geographies_years_and_missingness(self) -> None:
        csv_text = "\n".join(
            [
                "STRUCTURE,GEO_PICT,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE",
                "data,FJ,2020,1.5,C",
                "data,FJ,2021,,C",
                "data,WS,2021,2.25,C",
            ]
        )

        profile = profile_csv_text(
            name="Mean sea surface temperature anomalies",
            pillar="climate_signal",
            story_role="climate_exposure",
            official_url="https://example.test/view",
            sdmx_csv_api_url="https://example.test/api.csv",
            csv_text=csv_text,
        )

        self.assertEqual(profile.status, "ok")
        self.assertEqual(profile.row_count, 3)
        self.assertEqual(profile.geography_count, 2)
        self.assertEqual(profile.year_start, 2020)
        self.assertEqual(profile.year_end, 2021)
        self.assertEqual(profile.numeric_observation_value_count, 2)
        self.assertEqual(profile.blank_or_non_numeric_value_count, 1)
        self.assertEqual(profile.observed_geography_year_count, 3)
        self.assertEqual(profile.possible_geography_year_count, 4)
        self.assertEqual(profile.missing_geography_year_count, 1)
        self.assertEqual(profile.geography_year_coverage_pct, 0.75)
        self.assertEqual(profile.geography_codes, ["FJ", "WS"])
        self.assertEqual(
            profile.caveat_notes,
            "One returned row has a blank or non-numeric observation value.",
        )

    def test_profile_to_contract_preserves_source_and_schema_context(self) -> None:
        profile = profile_csv_text(
            name="Sea level anomalies",
            pillar="climate_signal",
            story_role="climate_exposure",
            official_url="https://example.test/view",
            sdmx_csv_api_url="https://example.test/api.csv",
            csv_text="GEO_PICT,TIME_PERIOD,OBS_VALUE\nFJ,1993,4.2\n",
        )

        contract = profile_to_contract(profile, generated_at_utc="2026-06-24T00:00:00Z")

        self.assertEqual(contract["slug"], "sea-level-anomalies")
        self.assertEqual(contract["source"]["official_url"], "https://example.test/view")
        self.assertEqual(contract["schema"]["geography_column"], "GEO_PICT")
        self.assertEqual(contract["coverage"]["year_range"], {"start": 1993, "end": 1993})

    def test_profile_contract_exposes_semantics_units_grain_and_processing_decision(self) -> None:
        profile = profile_csv_text(
            name="Renewable energy share in the total final energy consumption",
            pillar="candidate_response_context",
            story_role="response_or_capacity",
            official_url="https://example.test/view",
            sdmx_csv_api_url="https://example.test/api.csv",
            csv_text="GEO_PICT,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE,SEX\nFJ,2022,12.5,PT,_T\nWS,2022,34.0,PERCENT,_T\n",
            candidate=True,
            denominator="Total final energy consumption; denominator values are not included in the response.",
            grain="One row per geography and year for the filtered indicator and fixed disaggregation.",
            source_semantics="Share of renewable energy in total final energy consumption.",
            licence="not stated in reviewed source metadata",
            processing_decision="accept_for_processing",
            decision_reason="Comparable rate with explicit geography, year, value, and unit fields.",
        )

        contract = profile_to_contract(profile, generated_at_utc="2026-07-12T00:00:00Z")

        self.assertEqual(profile.units, ["PERCENT", "PT"])
        self.assertEqual(
            profile.dimension_columns,
            ["GEO_PICT", "TIME_PERIOD", "UNIT_MEASURE", "SEX"],
        )
        self.assertTrue(contract["candidate"])
        self.assertEqual(contract["semantics"]["units"], ["PERCENT", "PT"])
        self.assertEqual(
            contract["semantics"]["licence"],
            "not stated in reviewed source metadata",
        )
        self.assertEqual(
            contract["processing_decision"]["status"],
            "accept_for_processing",
        )
        self.assertEqual(
            contract["coverage"]["structural_geography_year_coverage"],
            {
                "observed_distinct_geography_years": 2,
                "possible_geography_years_in_observed_span": 2,
                "missing_geography_years_in_observed_span": 0,
                "coverage_pct": 1.0,
                "caveat": (
                    "Structural reporting coverage only; a missing geography-year is not "
                    "evidence of zero or no event."
                ),
            },
        )

    def test_config_contains_all_six_candidate_acquisitions_with_decisions(self) -> None:
        config = load_dataset_config(Path("configs/datasets.yml"))
        entries = {entry["name"]: entry for entry in config["priority_datasets"]}
        candidates = {
            "Population growth",
            "Renewable energy share in the total final energy consumption",
            "Proportion of population using safely managed drinking water services",
            "Crop yield",
            "Direct disaster economic loss",
            "Climate altering land cover index",
        }

        self.assertEqual(len(entries), 15)
        self.assertEqual(candidates.difference(entries), set())
        self.assertEqual(len(select_processing_datasets(config)), 14)
        for name in candidates:
            self.assertEqual(entries[name]["candidate"], "true")
            self.assertIn(entries[name]["processing_decision"], {"accept_for_processing", "reject"})
            expected_enabled = (
                "true" if entries[name]["processing_decision"] == "accept_for_processing" else "false"
            )
            self.assertEqual(entries[name]["processing_enabled"], expected_enabled)
            self.assertTrue(entries[name]["decision_reason"])

    def test_processed_builder_honors_processing_enabled_gate(self) -> None:
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            root = Path(directory)
            inventory_path = root / "inventory.csv"
            inventory_path.write_text(
                "name,story_role,official_url,sdmx_csv_api_url\n"
                "Sea level anomalies,climate_exposure,https://example.test/sea,https://example.test/sea.csv\n"
                "Crop yield,impact,https://example.test/crop,https://example.test/crop.csv\n",
                encoding="utf-8",
            )
            config_path = root / "datasets.yml"
            config_path.write_text(
                f"official_inventory: {inventory_path}\n"
                "priority_datasets:\n"
                "  - name: Sea level anomalies\n"
                "    pillar: climate_signal\n"
                "  - name: Crop yield\n"
                "    pillar: candidate_food_context\n"
                "    processing_enabled: false\n",
                encoding="utf-8",
            )
            raw_dir = root / "official"
            raw_dir.mkdir()
            csv_text = "CLIMATE_CHANGE_INDICATORS,GEO_PICT,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE\nSEA_LVL,FJ,2020,1.0,METER\n"
            (raw_dir / "sea-level-anomalies.csv").write_text(csv_text, encoding="utf-8")
            (raw_dir / "crop-yield.csv").write_text(
                csv_text.replace("SEA_LVL", "CROP_YIELD"),
                encoding="utf-8",
            )

            provenance = build_processed_dataset(
                config_path=config_path,
                raw_dir=raw_dir,
                observations_path=root / "observations.csv",
                geography_lookup_path=root / "lookup.csv",
                app_summary_path=root / "summary.json",
                provenance_path=root / "provenance.json",
                timeout=1,
            )

        self.assertEqual(provenance["dataset_count"], 1)
        self.assertEqual(provenance["source_fetch_log"][0]["name"], "Sea level anomalies")

    def test_failed_refresh_does_not_claim_a_stale_cache_file(self) -> None:
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            root = Path(directory)
            inventory_path = root / "inventory.csv"
            inventory_path.write_text(
                "name,story_role,official_url,sdmx_csv_api_url\n"
                "Population growth,context,https://example.test/view,https://example.test/api.csv\n",
                encoding="utf-8",
            )
            config_path = root / "datasets.yml"
            config_path.write_text(
                f"official_inventory: {inventory_path}\n"
                "priority_datasets:\n"
                "  - name: Population growth\n"
                "    pillar: candidate_context\n",
                encoding="utf-8",
            )
            output_dir = root / "official"
            output_dir.mkdir()
            stale_path = output_dir / "population-growth.csv"
            stale_text = "GEO_PICT,TIME_PERIOD,OBS_VALUE\nFJ,2020,1.0\n"
            stale_path.write_text(stale_text, encoding="utf-8")

            with patch(
                "scripts.fetch_official_data.fetch_sdmx_csv_text",
                return_value=(
                    None,
                    "api_error_422",
                    "SDMX CSV API returned HTTP 422.",
                    {
                        "requested_url": "https://example.test/api.csv",
                        "effective_url": "https://example.test/api.csv",
                        "initial_error_status": "",
                        "fallback_used": False,
                        "fallback_note": "",
                    },
                ),
            ):
                manifest = fetch_to_raw_cache(
                    config_path=config_path,
                    output_dir=output_dir,
                    manifest_path=output_dir / "manifest.json",
                    timeout=1,
                )

            with patch(
                "scripts.profile_datasets.fetch_sdmx_csv_text",
                side_effect=AssertionError("invalid manifested cache must not be profiled or fetched"),
            ):
                profiles = profile_priority_datasets(
                    config=load_dataset_config(config_path),
                    timeout=1,
                    raw_dir=output_dir,
                )

        entry = manifest["datasets"][0]
        self.assertEqual(entry["status"], "api_error_422")
        self.assertEqual(entry["raw_path"], "")
        self.assertEqual(entry["source_content_sha256"], "")
        self.assertNotEqual(
            hashlib.sha256(stale_text.encode("utf-8")).hexdigest(),
            entry["source_content_sha256"],
        )
        self.assertEqual(profiles[0].status, "cache_manifest_error")
        self.assertEqual(profiles[0].row_count, 0)
        self.assertIn("api_error_422", profiles[0].caveat_notes)

    def test_fetch_records_supplementary_inspection_outside_candidate_count(self) -> None:
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            root = Path(directory)
            inventory_path = root / "inventory.csv"
            inventory_path.write_text(
                "name,story_role,official_url,sdmx_csv_api_url\n"
                "Population growth,context,https://example.test/pop,https://example.test/pop.csv\n"
                "Crop yield - disaggregated,impact,https://example.test/crop,https://example.test/crop.csv\n",
                encoding="utf-8",
            )
            config_path = root / "datasets.yml"
            config_path.write_text(
                f"official_inventory: {inventory_path}\n"
                "priority_datasets:\n"
                "  - name: Population growth\n"
                "    pillar: candidate_context\n",
                encoding="utf-8",
            )
            output_dir = root / "official"
            csv_text = "GEO_PICT,TIME_PERIOD,OBS_VALUE\nFJ,2021,0.7\nFJ,2022,0.8\n"

            def fetched(*, url: str, **_: object) -> tuple[object, ...]:
                return (
                    csv_text,
                    None,
                    "",
                    {
                        "requested_url": url,
                        "effective_url": url,
                        "initial_error_status": "",
                        "fallback_used": False,
                        "fallback_note": "",
                    },
                )

            with patch("scripts.fetch_official_data.fetch_sdmx_csv_text", side_effect=fetched):
                manifest = fetch_to_raw_cache(
                    config_path=config_path,
                    output_dir=output_dir,
                    manifest_path=output_dir / "manifest.json",
                    timeout=1,
                    supplementary_names=["Crop yield - disaggregated"],
                )

        self.assertEqual(manifest["dataset_count"], 1)
        self.assertEqual(manifest["ok_count"], 1)
        self.assertEqual(manifest["supplementary_count"], 1)
        self.assertEqual(manifest["supplementary_ok_count"], 1)
        supplementary = manifest["supplementary_datasets"][0]
        self.assertEqual(supplementary["row_count"], 2)
        self.assertEqual(len(supplementary["source_content_sha256"]), 64)
        self.assertEqual(supplementary["sdmx_csv_api_url"], "https://example.test/crop.csv")

    def test_fetcher_writes_exact_crlf_payload_bytes_used_by_manifest_hash(self) -> None:
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            root = Path(directory)
            inventory_path = root / "inventory.csv"
            inventory_path.write_text(
                "name,story_role,official_url,sdmx_csv_api_url\n"
                "Population growth,context,https://example.test/pop,https://example.test/pop.csv\n",
                encoding="utf-8",
            )
            config_path = root / "datasets.yml"
            config_path.write_text(
                f"official_inventory: {inventory_path}\n"
                "priority_datasets:\n"
                "  - name: Population growth\n"
                "    pillar: candidate_context\n",
                encoding="utf-8",
            )
            output_dir = root / "official"
            response_text = "GEO_PICT,TIME_PERIOD,OBS_VALUE\r\nFJ,2022,0.8\r\n"
            payload = response_text.encode("utf-8")
            original_write_text = Path.write_text

            def reject_csv_text_write(path: Path, data: str, **kwargs: object) -> int:
                if path.suffix == ".csv":
                    raise AssertionError("raw CSV must be written as exact bytes")
                return original_write_text(path, data, **kwargs)

            with (
                patch(
                    "scripts.fetch_official_data.fetch_sdmx_csv_text",
                    return_value=(
                        response_text,
                        None,
                        "",
                        {
                            "requested_url": "https://example.test/pop.csv",
                            "effective_url": "https://example.test/pop.csv",
                            "initial_error_status": "",
                            "fallback_used": False,
                            "fallback_note": "",
                        },
                    ),
                ),
                patch.object(Path, "write_text", new=reject_csv_text_write),
            ):
                manifest = fetch_to_raw_cache(
                    config_path=config_path,
                    output_dir=output_dir,
                    manifest_path=output_dir / "manifest.json",
                    timeout=1,
                )
            written_payload = (output_dir / "population-growth.csv").read_bytes()

        entry = manifest["datasets"][0]
        self.assertEqual(written_payload, payload)
        self.assertEqual(entry["byte_count"], len(payload))
        self.assertEqual(entry["source_content_sha256"], hashlib.sha256(payload).hexdigest())

    def test_profiler_rejects_cache_whose_hash_does_not_match_manifest(self) -> None:
        config = {
            "official_inventory": "research/official_datasets_2026.csv",
            "priority_datasets": [
                {"name": "Population growth", "pillar": "candidate_context"}
            ],
        }
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            raw_dir = Path(directory)
            (raw_dir / "population-growth.csv").write_text(
                "GEO_PICT,TIME_PERIOD,OBS_VALUE\nFJ,2022,0.8\n",
                encoding="utf-8",
            )
            (raw_dir / "manifest.json").write_text(
                json.dumps(
                    {
                        "datasets": [
                            {
                                "slug": "population-growth",
                                "status": "ok",
                                "source_content_sha256": "0" * 64,
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )

            profiles = profile_priority_datasets(config=config, timeout=1, raw_dir=raw_dir)

        self.assertEqual(profiles[0].status, "cache_manifest_error")
        self.assertIn("SHA-256", profiles[0].caveat_notes)

    def test_manifest_hash_validates_raw_bytes_before_newline_normalization(self) -> None:
        config = {
            "official_inventory": "research/official_datasets_2026.csv",
            "priority_datasets": [
                {"name": "Population growth", "pillar": "candidate_context"}
            ],
        }
        raw_bytes = b"GEO_PICT,TIME_PERIOD,OBS_VALUE\r\nFJ,2022,0.8\r\n"
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            raw_dir = Path(directory)
            (raw_dir / "population-growth.csv").write_bytes(raw_bytes)
            (raw_dir / "manifest.json").write_text(
                json.dumps(
                    {
                        "datasets": [
                            {
                                "slug": "population-growth",
                                "status": "ok",
                                "source_content_sha256": hashlib.sha256(raw_bytes).hexdigest(),
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )

            profile = profile_priority_datasets(config=config, timeout=1, raw_dir=raw_dir)[0]

        self.assertEqual(profile.status, "ok")
        self.assertEqual(profile.row_count, 1)

    def test_profiler_returns_cache_error_for_invalid_utf8(self) -> None:
        config = {
            "official_inventory": "research/official_datasets_2026.csv",
            "priority_datasets": [
                {"name": "Population growth", "pillar": "candidate_context"}
            ],
        }
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            raw_dir = Path(directory)
            (raw_dir / "population-growth.csv").write_bytes(b"\xff\xfe")

            profile = profile_priority_datasets(config=config, timeout=1, raw_dir=raw_dir)[0]

        self.assertEqual(profile.status, "cache_manifest_error")
        self.assertIn("UTF-8", profile.caveat_notes)

    def test_profiler_does_not_fetch_when_manifested_file_is_missing(self) -> None:
        config = {
            "official_inventory": "research/official_datasets_2026.csv",
            "priority_datasets": [
                {"name": "Population growth", "pillar": "candidate_context"}
            ],
        }
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            raw_dir = Path(directory)
            (raw_dir / "manifest.json").write_text(
                json.dumps(
                    {
                        "datasets": [
                            {
                                "slug": "population-growth",
                                "status": "ok",
                                "source_content_sha256": "0" * 64,
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            with patch(
                "scripts.profile_datasets.fetch_sdmx_csv_text",
                side_effect=AssertionError("manifested missing cache must not be fetched"),
            ):
                profile = profile_priority_datasets(config=config, timeout=1, raw_dir=raw_dir)[0]

        self.assertEqual(profile.status, "cache_manifest_error")
        self.assertIn("missing", profile.caveat_notes.lower())

    def test_processed_loader_does_not_fetch_when_manifest_entry_is_missing(self) -> None:
        dataset = OfficialDataset(
            name="Population growth",
            story_role="context",
            official_url="https://example.test/pop",
            sdmx_csv_api_url="https://example.test/pop.csv",
        )
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            raw_dir = Path(directory)
            (raw_dir / "manifest.json").write_text(
                json.dumps({"datasets": []}),
                encoding="utf-8",
            )
            with patch(
                "scripts.make_dataset.fetch_sdmx_csv_text",
                side_effect=AssertionError("missing manifest entry must not be fetched"),
            ):
                text, status, caveat = load_or_fetch_csv_text(
                    dataset=dataset,
                    raw_dir=raw_dir,
                    accept_header="text/csv",
                    timeout=1,
                )

        self.assertEqual(text, "")
        self.assertEqual(status, "cache_manifest_error")
        self.assertIn("no entry", caveat)

    def test_profiler_prefers_raw_cache_and_propagates_candidate_metadata(self) -> None:
        config = {
            "official_inventory": "research/official_datasets_2026.csv",
            "priority_datasets": [
                {
                    "name": "Population growth",
                    "pillar": "candidate_context",
                    "candidate": "true",
                    "denominator": "Prior-period population is implied; values are not included.",
                    "grain": "One row per geography and year.",
                    "source_semantics": "Annual population growth rate.",
                    "licence": "not stated in reviewed source metadata",
                    "processing_decision": "accept_for_processing",
                    "decision_reason": "Comparable annual rate.",
                }
            ],
        }

        with TemporaryDirectory(dir=Path.cwd()) as directory:
            raw_dir = Path(directory)
            (raw_dir / "population-growth.csv").write_text(
                "GEO_PICT,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE\nFJ,2022,0.8,PERCENT\n",
                encoding="utf-8",
            )
            with patch(
                "scripts.profile_datasets.fetch_sdmx_csv_text",
                side_effect=AssertionError("live API should not be called when cache exists"),
            ):
                profiles = profile_priority_datasets(config=config, timeout=1, raw_dir=raw_dir)

        self.assertEqual(profiles[0].row_count, 1)
        self.assertTrue(profiles[0].candidate)
        self.assertEqual(profiles[0].processing_decision, "accept_for_processing")
        self.assertEqual(profiles[0].units, ["PERCENT"])

    def test_profiler_preserves_manifested_fetch_provenance_in_contract(self) -> None:
        config = {
            "official_inventory": "research/official_datasets_2026.csv",
            "priority_datasets": [
                {"name": "Population growth", "pillar": "candidate_context"}
            ],
        }
        csv_text = "GEO_PICT,TIME_PERIOD,OBS_VALUE\nFJ,2022,0.8\n"
        requested_url = "https://stats-sdmx-disseminate.pacificdata.org/rest/v2/source"
        effective_url = "https://stats-nsi-stable.pacificdata.org/rest/data/source"
        with TemporaryDirectory(dir=Path.cwd()) as directory:
            raw_dir = Path(directory)
            (raw_dir / "population-growth.csv").write_text(csv_text, encoding="utf-8")
            (raw_dir / "manifest.json").write_text(
                json.dumps(
                    {
                        "datasets": [
                            {
                                "slug": "population-growth",
                                "status": "ok",
                                "source_content_sha256": hashlib.sha256(
                                    csv_text.encode("utf-8")
                                ).hexdigest(),
                                "requested_api_url": requested_url,
                                "effective_api_url": effective_url,
                                "initial_api_status": "api_error_422",
                                "fallback_used": True,
                                "fallback_note": "Retried through documented stable endpoint.",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )

            profile = profile_priority_datasets(config=config, timeout=1, raw_dir=raw_dir)[0]

        contract = profile_to_contract(profile, generated_at_utc="2026-07-12T00:00:00Z")
        self.assertEqual(contract["source"]["effective_sdmx_csv_api_url"], effective_url)
        self.assertEqual(contract["source"]["source_content_sha256"], hashlib.sha256(csv_text.encode("utf-8")).hexdigest())
        self.assertEqual(contract["source"]["fetch"]["initial_api_status"], "api_error_422")
        self.assertTrue(contract["source"]["fetch"]["fallback_used"])

    def test_sdmx_fetch_retries_422_through_documented_stable_api(self) -> None:
        url = (
            "https://stats-sdmx-disseminate.pacificdata.org/rest/v2/data/dataflow/"
            "SPC/DF_NMDI_POP/1.0/"
            "A..NMDI0002._T._T._T..?dimensionAtObservation=AllDimensions"
        )

        class Response:
            headers = Message()

            def __enter__(self) -> Response:
                return self

            def __exit__(self, *args: object) -> None:
                return None

            def getcode(self) -> int:
                return 200

            def read(self) -> bytes:
                return b"GEO_PICT,TIME_PERIOD,OBS_VALUE\nFJ,2022,0.8\n"

        first_error = HTTPError(url, 422, "Unprocessable Entity", hdrs=None, fp=None)
        with patch("analysis.io.sdmx.urlopen", side_effect=[first_error, Response()]) as mocked:
            text, status, caveat, provenance = fetch_sdmx_csv_text(url=url, timeout=1)

        self.assertIsNone(status)
        self.assertEqual(caveat, "")
        self.assertIn("FJ,2022,0.8", text or "")
        retried_request = mocked.call_args_list[1].args[0]
        self.assertEqual(
            retried_request.full_url,
            "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_NMDI_POP,1.0/"
            "A..NMDI0002._T._T._T../SPC?dimensionAtObservation=AllDimensions",
        )
        self.assertEqual(
            retried_request.get_header("Accept"),
            "application/vnd.sdmx.data+csv;version=2.1",
        )
        self.assertEqual(provenance["requested_url"], url)
        self.assertEqual(provenance["effective_url"], retried_request.full_url)
        self.assertEqual(provenance["initial_error_status"], "api_error_422")
        self.assertTrue(provenance["fallback_used"])
        self.assertIn("documented stable", provenance["fallback_note"])

    def test_stable_sdmx_url_preserves_flow_key_and_query(self) -> None:
        self.assertEqual(
            sdmx.stable_sdmx_url(
                "https://stats-sdmx-disseminate.pacificdata.org/rest/v2/data/dataflow/"
                "SPC/DF_CLIMATE_CHANGE/1.0/A.CROP_YIELD.?dimensionAtObservation=AllDimensions"
            ),
            "https://stats-nsi-stable.pacificdata.org/rest/data/SPC,DF_CLIMATE_CHANGE,1.0/"
            "A.CROP_YIELD./SPC?dimensionAtObservation=AllDimensions",
        )
        self.assertIsNone(sdmx.stable_sdmx_url("https://example.test/not-an-sdmx-dataflow"))


if __name__ == "__main__":
    unittest.main()
