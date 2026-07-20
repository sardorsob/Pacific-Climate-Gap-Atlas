"""Helpers for reading the official dataset inventory."""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path

import pandas as pd


@dataclass(frozen=True)
class OfficialDataset:
    """One row from the official 2026 dataset inventory."""

    name: str
    story_role: str
    official_url: str
    sdmx_csv_api_url: str


def read_official_inventory(path: Path) -> list[OfficialDataset]:
    """Read `research/official_datasets_2026.csv` into typed records."""

    frame = pd.read_csv(path)
    required = {"name", "story_role", "official_url", "sdmx_csv_api_url"}
    missing = required.difference(frame.columns)
    if missing:
        raise ValueError(f"Official inventory is missing columns: {sorted(missing)}")

    return [
        OfficialDataset(
            name=str(row["name"]),
            story_role=str(row["story_role"]),
            official_url="" if pd.isna(row["official_url"]) else str(row["official_url"]),
            sdmx_csv_api_url=""
            if pd.isna(row["sdmx_csv_api_url"])
            else str(row["sdmx_csv_api_url"]),
        )
        for _, row in frame.iterrows()
    ]


def read_validated_raw_cache(
    *, raw_dir: Path, slug: str
) -> tuple[str | None, dict[str, object] | None, str | None]:
    """Read a manual cache, or validate a manifested cache status and content hash."""

    raw_path = raw_dir / f"{slug}.csv"
    manifest_path = raw_dir / "manifest.json"
    entry: dict[str, object] | None = None
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError, UnicodeDecodeError) as exc:
            return None, None, f"Raw cache manifest could not be read: {exc}"

        entries = list(manifest.get("datasets", [])) + list(
            manifest.get("supplementary_datasets", [])
        )
        entry = next((item for item in entries if item.get("slug") == slug), None)
        if entry is None:
            return None, None, "Raw cache manifest has no entry for this dataset."
        if entry.get("status") != "ok":
            return (
                None,
                entry,
                f"Raw cache manifest status is {entry.get('status', 'unknown')}.",
            )

    if not raw_path.exists():
        if entry is not None:
            return None, entry, "Raw cache file is missing for the successful manifest entry."
        return None, None, None

    try:
        raw_bytes = raw_path.read_bytes()
    except OSError as exc:
        return None, entry, f"Raw cache file could not be read: {exc}"
    try:
        text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError as exc:
        return None, entry, f"Raw cache file is not valid UTF-8: {exc}"

    if entry is None:
        return text, None, None

    expected_hash = str(entry.get("source_content_sha256", ""))
    actual_hash = hashlib.sha256(raw_bytes).hexdigest()
    if not expected_hash or expected_hash != actual_hash:
        return None, entry, "Raw cache SHA-256 does not match the successful manifest entry."

    return text, entry, None
