from __future__ import annotations

import csv
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTEXT_PATH = ROOT / "data" / "external" / "geography_context.csv"
PROVENANCE_PATH = ROOT / "artifacts" / "provenance" / "geography_context_sources.json"
INDEX_PATH = ROOT / "artifacts" / "tables" / "adaptation_gap_index.csv"

REQUIRED_CONTEXT_FIELDS = (
    "geo_code",
    "geography_name",
    "pacific_subregion",
    "political_status",
    "sovereignty_or_admin",
    "island_group_or_region_note",
    "context_quality",
    "context_note",
    "primary_source_key",
)
REQUIRED_SOURCE_FIELDS = ("source_key", "name", "url", "access_date", "caveats")
VALID_SUBREGIONS = {"Melanesia", "Micronesia", "Polynesia"}


class GeographyContextArtifactTests(unittest.TestCase):
    def test_context_covers_every_scored_geography_once(self) -> None:
        scored_codes = _scored_geo_codes()
        context_rows = _context_rows()

        context_codes = [row["geo_code"] for row in context_rows]

        self.assertEqual(sorted(context_codes), sorted(scored_codes))
        self.assertEqual(len(context_codes), len(set(context_codes)))

    def test_context_fields_are_complete_or_explicitly_marked_missing(self) -> None:
        for row in _context_rows():
            label = row.get("geo_code", "<missing>")
            missing_fields = [
                field for field in REQUIRED_CONTEXT_FIELDS if not row.get(field, "").strip()
            ]
            context_note = row.get("context_note", "").lower()

            self.assertFalse(
                missing_fields and "missing-context" not in context_note,
                f"{label} missing {missing_fields} without an explicit missing-context note",
            )
            if not missing_fields:
                self.assertIn(row["pacific_subregion"], VALID_SUBREGIONS)
            self.assertEqual(row.get("score_input_role"), "descriptive_only_not_score_input")

    def test_source_provenance_matches_context_source_keys(self) -> None:
        rows = _context_rows()
        provenance = _provenance()
        sources = provenance.get("sources", [])
        source_by_key = {source.get("source_key"): source for source in sources}

        self.assertFalse(provenance["usage"]["score_input"])
        self.assertIn("descriptive", provenance["usage"]["description"].lower())

        referenced_keys: set[str] = set()
        for row in rows:
            referenced_keys.add(row["primary_source_key"])
            referenced_keys.update(_split_source_keys(row.get("source_keys", "")))

        self.assertLessEqual(referenced_keys, set(source_by_key))
        for source_key in referenced_keys:
            source = source_by_key[source_key]
            for field in REQUIRED_SOURCE_FIELDS:
                self.assertTrue(source.get(field), f"{source_key} missing {field}")

    def test_sensitive_or_dynamic_statuses_are_marked_for_review(self) -> None:
        rows_by_code = {row["geo_code"]: row for row in _context_rows()}

        for geo_code in ("CK", "NC", "NU", "PF", "TK"):
            self.assertIn("needs_review", rows_by_code[geo_code]["context_quality"])


def _context_rows() -> list[dict[str, str]]:
    if not CONTEXT_PATH.exists():
        raise AssertionError(f"{CONTEXT_PATH} does not exist")
    with CONTEXT_PATH.open(newline="", encoding="utf-8") as csv_file:
        return list(csv.DictReader(csv_file))


def _scored_geo_codes() -> set[str]:
    with INDEX_PATH.open(newline="", encoding="utf-8") as csv_file:
        return {
            row["geo_code"]
            for row in csv.DictReader(csv_file)
            if row["score_status"] == "scored"
        }


def _provenance() -> dict[str, object]:
    if not PROVENANCE_PATH.exists():
        raise AssertionError(f"{PROVENANCE_PATH} does not exist")
    return json.loads(PROVENANCE_PATH.read_text(encoding="utf-8"))


def _split_source_keys(value: str) -> set[str]:
    return {part.strip() for part in value.split(";") if part.strip()}


if __name__ == "__main__":
    unittest.main()
