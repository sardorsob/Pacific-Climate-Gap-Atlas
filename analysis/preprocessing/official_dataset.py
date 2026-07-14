"""Normalize official Pacific SDMX CSV frames into processed project tables."""

from __future__ import annotations

import hashlib
import json

import pandas as pd


NORMALIZED_COLUMNS = [
    "dataset_slug",
    "dataset_name",
    "pillar",
    "story_role",
    "indicator_code",
    "geo_code",
    "year",
    "value",
    "unit",
    "obs_status",
    "reporting_type",
    "source_metadata",
    "official_url",
    "sdmx_csv_api_url",
    "source_content_sha256",
    "source_row_hash",
]


def normalize_official_frame(
    *,
    frame: pd.DataFrame,
    dataset_name: str,
    dataset_slug: str,
    pillar: str,
    story_role: str,
    official_url: str,
    sdmx_csv_api_url: str,
    source_content_sha256: str = "",
    include_metadata_in_hash: bool = False,
) -> pd.DataFrame:
    """Convert one SDMX CSV dataframe into the project long-table schema."""

    indicator_column = _pick_column(
        frame.columns.tolist(),
        preferred=["CLIMATE_CHANGE_INDICATORS", "INDICATOR"],
        contains=["INDICATOR"],
    )
    unit_column = _pick_column(frame.columns.tolist(), preferred=["UNIT_MEASURE", "UNIT"], contains=["UNIT"])
    source_metadata = _source_metadata(
        frame,
        excluded_columns={
            "GEO_PICT",
            "TIME_PERIOD",
            "OBS_VALUE",
            "OBS_STATUS",
            "REPORTING_TYPE",
            indicator_column,
            unit_column,
        },
    )

    normalized = pd.DataFrame(
        {
            "dataset_slug": dataset_slug,
            "dataset_name": dataset_name,
            "pillar": pillar,
            "story_role": story_role,
            "indicator_code": _series_or_default(frame, indicator_column, dataset_slug),
            "geo_code": _series_or_default(frame, "GEO_PICT", ""),
            "year": pd.to_numeric(_series_or_default(frame, "TIME_PERIOD", ""), errors="coerce"),
            "value": pd.to_numeric(_series_or_default(frame, "OBS_VALUE", ""), errors="coerce"),
            "unit": _series_or_default(frame, unit_column, ""),
            "obs_status": _series_or_default(frame, "OBS_STATUS", ""),
            "reporting_type": _series_or_default(frame, "REPORTING_TYPE", ""),
            "source_metadata": source_metadata,
            "official_url": official_url,
            "sdmx_csv_api_url": sdmx_csv_api_url,
            "source_content_sha256": source_content_sha256,
        }
    )

    normalized["geo_code"] = normalized["geo_code"].astype(str).str.strip()
    normalized = normalized[normalized["geo_code"].ne("") & normalized["year"].notna()].copy()
    normalized["year"] = normalized["year"].astype(int)
    normalized["source_row_hash"] = normalized.apply(
        lambda row: _row_hash(row, include_metadata=include_metadata_in_hash),
        axis=1,
    )
    normalized = normalized.sort_values(
        ["dataset_slug", "geo_code", "year", "indicator_code"],
        kind="mergesort",
    ).reset_index(drop=True)

    return normalized[NORMALIZED_COLUMNS]


def build_geography_lookup(normalized: pd.DataFrame) -> pd.DataFrame:
    """Build a geography coverage table from normalized observations."""

    rows: list[dict[str, object]] = []
    for geo_code, group in normalized.groupby("geo_code", sort=True):
        datasets = sorted(group["dataset_slug"].dropna().unique().tolist())
        rows.append(
            {
                "geo_code": geo_code,
                "dataset_count": len(datasets),
                "row_count": int(len(group)),
                "first_year": int(group["year"].min()),
                "last_year": int(group["year"].max()),
                "datasets": " ".join(datasets),
            }
        )

    return pd.DataFrame(rows)


def build_app_dataset_summary(normalized: pd.DataFrame) -> dict[str, object]:
    """Build a compact app-ready summary without geometry."""

    return {
        "schema_version": 1,
        "source": "Pacific Data Hub SDMX CSV API",
        "datasets": _dataset_summaries(normalized),
        "geographies": build_geography_lookup(normalized).to_dict(orient="records"),
        "notes": [
            "This is a non-spatial app data draft. Geometry joins are handled in TASK-005.",
            "Values are original SDMX observations; no missing values are imputed.",
        ],
    }


def build_pipeline_summary(normalized: pd.DataFrame) -> dict[str, object]:
    """Build deterministic row-count and source provenance summary."""

    return {
        "schema_version": 1,
        "pipeline_task": "TASK-002",
        "total_rows": int(len(normalized)),
        "dataset_count": int(normalized["dataset_slug"].nunique()),
        "geography_count": int(normalized["geo_code"].nunique()),
        "datasets": _dataset_summaries(normalized),
    }


def _dataset_summaries(normalized: pd.DataFrame) -> list[dict[str, object]]:
    summaries: list[dict[str, object]] = []
    for dataset_slug, group in normalized.groupby("dataset_slug", sort=True):
        summaries.append(
            {
                "dataset_slug": dataset_slug,
                "dataset_name": str(group["dataset_name"].iloc[0]),
                "pillar": str(group["pillar"].iloc[0]),
                "row_count": int(len(group)),
                "geography_count": int(group["geo_code"].nunique()),
                "first_observed_year": int(group["year"].min()),
                "last_observed_year": int(group["year"].max()),
                "year_range": {
                    "start": int(group["year"].min()),
                    "end": int(group["year"].max()),
                },
                "source_content_sha256": str(group["source_content_sha256"].iloc[0]),
                "official_url": str(group["official_url"].iloc[0]),
                "sdmx_csv_api_url": str(group["sdmx_csv_api_url"].iloc[0]),
            }
        )

    return summaries


def _row_hash(row: pd.Series, *, include_metadata: bool) -> str:
    parts = [
        str(row["dataset_slug"]),
        str(row["indicator_code"]),
        str(row["geo_code"]),
        str(row["year"]),
        "" if pd.isna(row["value"]) else str(row["value"]),
    ]
    if include_metadata:
        parts.extend(
            [
                str(row["unit"]),
                str(row["obs_status"]),
                str(row["reporting_type"]),
                str(row["source_metadata"]),
            ]
        )
    raw = "|".join(parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _pick_column(
    columns: list[str], *, preferred: list[str], contains: list[str]
) -> str | None:
    upper_lookup = {str(column).upper(): str(column) for column in columns}
    for candidate in preferred:
        if candidate.upper() in upper_lookup:
            return upper_lookup[candidate.upper()]

    for token in contains:
        token_upper = token.upper()
        for column in columns:
            if token_upper in str(column).upper():
                return str(column)

    return None


def _series_or_default(frame: pd.DataFrame, column: str | None, default: str) -> pd.Series:
    if column and column in frame.columns:
        return frame[column].astype(str).str.strip()

    return pd.Series([default] * len(frame), index=frame.index, dtype="object")


def _source_metadata(
    frame: pd.DataFrame,
    *,
    excluded_columns: set[str | None],
) -> pd.Series:
    """Serialize non-core SDMX fields without hard-coding dataset-specific dimensions."""

    metadata_columns = [
        str(column)
        for column in frame.columns
        if str(column) not in excluded_columns
    ]

    def serialize(row: pd.Series) -> str:
        metadata = {
            column: str(row[column]).strip()
            for column in metadata_columns
            if not pd.isna(row[column]) and str(row[column]).strip()
        }
        return json.dumps(metadata, sort_keys=True, separators=(",", ":"), ensure_ascii=True)

    return frame.apply(serialize, axis=1)
