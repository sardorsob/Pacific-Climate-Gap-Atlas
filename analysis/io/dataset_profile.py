"""Dataset profiling helpers for Pacific Data Hub SDMX CSV responses."""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
from io import StringIO
import re
import unicodedata

import pandas as pd


MISSING_TOKENS = {"", "nan", "none", "null", "na", "n/a"}
NOT_STATED = "not stated"
NON_DIMENSION_COLUMNS = {
    "DATAFLOW",
    "STRUCTURE",
    "STRUCTURE_ID",
    "ACTION",
    "OBS_VALUE",
    "OBS_STATUS",
    "OBS_COMMENT",
    "ERROR_TYPE",
    "ERROR_VAL",
    "DATA_SOURCE",
    "UNIT_MULT",
}
STRUCTURAL_COVERAGE_CAVEAT = (
    "Structural reporting coverage only; a missing geography-year is not evidence of zero "
    "or no event."
)


@dataclass(frozen=True)
class DatasetProfile:
    """Coverage and schema summary for one official dataset."""

    name: str
    slug: str
    pillar: str
    story_role: str
    status: str
    row_count: int
    geography_count: int
    year_start: int | None
    year_end: int | None
    numeric_observation_value_count: int
    blank_or_non_numeric_value_count: int
    blank_or_non_numeric_value_pct: float | None
    observed_geography_year_count: int
    possible_geography_year_count: int
    missing_geography_year_count: int
    geography_year_coverage_pct: float | None
    geography_codes: list[str]
    geography_column: str | None
    time_column: str | None
    value_column: str | None
    columns: list[str]
    official_url: str
    sdmx_csv_api_url: str
    caveat_notes: str
    candidate: bool
    units: list[str]
    denominator: str
    grain: str
    dimension_columns: list[str]
    source_semantics: str
    licence: str
    processing_decision: str
    decision_reason: str
    requested_api_url: str
    effective_api_url: str | None
    initial_api_status: str
    fallback_used: bool | None
    fallback_note: str
    source_content_sha256: str


def slugify(value: str) -> str:
    """Return a stable filename-safe slug."""

    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "dataset"


def profile_csv_text(
    *,
    name: str,
    pillar: str,
    story_role: str,
    official_url: str,
    sdmx_csv_api_url: str,
    csv_text: str,
    candidate: bool = False,
    denominator: str = NOT_STATED,
    grain: str = NOT_STATED,
    source_semantics: str = NOT_STATED,
    licence: str = NOT_STATED,
    processing_decision: str = NOT_STATED,
    decision_reason: str = NOT_STATED,
    acquisition: dict[str, object] | None = None,
) -> DatasetProfile:
    """Profile an SDMX CSV response body."""

    if not csv_text.strip():
        return error_profile(
            name=name,
            pillar=pillar,
            story_role=story_role,
            official_url=official_url,
            sdmx_csv_api_url=sdmx_csv_api_url,
            status="empty_response",
            caveat_notes="API response was empty.",
            candidate=candidate,
            denominator=denominator,
            grain=grain,
            source_semantics=source_semantics,
            licence=licence,
            processing_decision=processing_decision,
            decision_reason=decision_reason,
            acquisition=acquisition,
        )

    try:
        frame = pd.read_csv(StringIO(csv_text), dtype=str, keep_default_na=False)
    except Exception as exc:  # pragma: no cover - exact parser errors vary by pandas version
        return error_profile(
            name=name,
            pillar=pillar,
            story_role=story_role,
            official_url=official_url,
            sdmx_csv_api_url=sdmx_csv_api_url,
            status="parse_error",
            caveat_notes=f"Could not parse CSV response: {exc}",
            candidate=candidate,
            denominator=denominator,
            grain=grain,
            source_semantics=source_semantics,
            licence=licence,
            processing_decision=processing_decision,
            decision_reason=decision_reason,
            acquisition=acquisition,
        )

    acquisition = dict(acquisition or {})
    acquisition.setdefault("requested_url", sdmx_csv_api_url)
    acquisition.setdefault(
        "source_content_sha256",
        hashlib.sha256(csv_text.encode("utf-8")).hexdigest(),
    )

    return profile_frame(
        name=name,
        pillar=pillar,
        story_role=story_role,
        official_url=official_url,
        sdmx_csv_api_url=sdmx_csv_api_url,
        frame=frame,
        candidate=candidate,
        denominator=denominator,
        grain=grain,
        source_semantics=source_semantics,
        licence=licence,
        processing_decision=processing_decision,
        decision_reason=decision_reason,
        acquisition=acquisition,
    )


def profile_frame(
    *,
    name: str,
    pillar: str,
    story_role: str,
    official_url: str,
    sdmx_csv_api_url: str,
    frame: pd.DataFrame,
    candidate: bool = False,
    denominator: str = NOT_STATED,
    grain: str = NOT_STATED,
    source_semantics: str = NOT_STATED,
    licence: str = NOT_STATED,
    processing_decision: str = NOT_STATED,
    decision_reason: str = NOT_STATED,
    acquisition: dict[str, object] | None = None,
) -> DatasetProfile:
    """Profile an already-loaded dataframe."""

    columns = [str(column) for column in frame.columns]
    row_count = int(len(frame))
    geography_column = _pick_column(columns, preferred=["GEO_PICT"], contains=["GEO"])
    time_column = _pick_column(columns, preferred=["TIME_PERIOD", "TIME", "YEAR"], contains=["TIME", "YEAR"])
    value_column = _pick_column(columns, preferred=["OBS_VALUE", "VALUE"], contains=["VALUE"])
    unit_column = _pick_column(columns, preferred=["UNIT_MEASURE"], contains=["UNIT"])

    geography_codes = _unique_non_missing(frame[geography_column]) if geography_column else []
    units = _unique_non_missing(frame[unit_column]) if unit_column else []
    dimension_columns = [
        column
        for column in columns
        if column.upper() not in NON_DIMENSION_COLUMNS and _unique_non_missing(frame[column])
    ]
    year_start, year_end = _year_range(frame[time_column]) if time_column else (None, None)
    numeric_value_count, blank_value_count, blank_value_pct = _value_coverage(
        frame,
        value_column,
    )
    observed_geo_years, possible_geo_years, missing_geo_years, geo_year_coverage_pct = (
        _geography_year_coverage(
            frame=frame,
            geography_column=geography_column,
            time_column=time_column,
            geography_count=len(geography_codes),
            year_start=year_start,
            year_end=year_end,
        )
    )
    acquisition_fields = _acquisition_fields(acquisition, sdmx_csv_api_url)

    caveats = _build_caveats(
        row_count=row_count,
        geography_column=geography_column,
        time_column=time_column,
        value_column=value_column,
        missing_value_count=blank_value_count,
        missing_value_pct=blank_value_pct,
    )

    return DatasetProfile(
        name=name,
        slug=slugify(name),
        pillar=pillar,
        story_role=story_role,
        status="ok",
        row_count=row_count,
        geography_count=len(geography_codes),
        year_start=year_start,
        year_end=year_end,
        numeric_observation_value_count=numeric_value_count,
        blank_or_non_numeric_value_count=blank_value_count,
        blank_or_non_numeric_value_pct=blank_value_pct,
        observed_geography_year_count=observed_geo_years,
        possible_geography_year_count=possible_geo_years,
        missing_geography_year_count=missing_geo_years,
        geography_year_coverage_pct=geo_year_coverage_pct,
        geography_codes=geography_codes,
        geography_column=geography_column,
        time_column=time_column,
        value_column=value_column,
        columns=columns,
        official_url=official_url,
        sdmx_csv_api_url=sdmx_csv_api_url,
        caveat_notes=" ".join(caveats),
        candidate=candidate,
        units=units,
        denominator=denominator,
        grain=grain,
        dimension_columns=dimension_columns,
        source_semantics=source_semantics,
        licence=licence,
        processing_decision=processing_decision,
        decision_reason=decision_reason,
        **acquisition_fields,
    )


def error_profile(
    *,
    name: str,
    pillar: str,
    story_role: str,
    official_url: str,
    sdmx_csv_api_url: str,
    status: str,
    caveat_notes: str,
    candidate: bool = False,
    denominator: str = NOT_STATED,
    grain: str = NOT_STATED,
    source_semantics: str = NOT_STATED,
    licence: str = NOT_STATED,
    processing_decision: str = NOT_STATED,
    decision_reason: str = NOT_STATED,
    acquisition: dict[str, object] | None = None,
) -> DatasetProfile:
    """Build a profile row for missing or failed sources."""

    return DatasetProfile(
        name=name,
        slug=slugify(name),
        pillar=pillar,
        story_role=story_role,
        status=status,
        row_count=0,
        geography_count=0,
        year_start=None,
        year_end=None,
        numeric_observation_value_count=0,
        blank_or_non_numeric_value_count=0,
        blank_or_non_numeric_value_pct=None,
        observed_geography_year_count=0,
        possible_geography_year_count=0,
        missing_geography_year_count=0,
        geography_year_coverage_pct=None,
        geography_codes=[],
        geography_column=None,
        time_column=None,
        value_column=None,
        columns=[],
        official_url=official_url,
        sdmx_csv_api_url=sdmx_csv_api_url,
        caveat_notes=caveat_notes,
        candidate=candidate,
        units=[],
        denominator=denominator,
        grain=grain,
        dimension_columns=[],
        source_semantics=source_semantics,
        licence=licence,
        processing_decision=processing_decision,
        decision_reason=decision_reason,
        **_acquisition_fields(acquisition, sdmx_csv_api_url),
    )


def profile_to_csv_row(profile: DatasetProfile, *, generated_at_utc: str) -> dict[str, object]:
    """Convert a profile to a flat CSV row."""

    return {
        "name": profile.name,
        "slug": profile.slug,
        "pillar": profile.pillar,
        "story_role": profile.story_role,
        "status": profile.status,
        "row_count": profile.row_count,
        "geography_count": profile.geography_count,
        "year_start": "" if profile.year_start is None else profile.year_start,
        "year_end": "" if profile.year_end is None else profile.year_end,
        "numeric_observation_value_count": profile.numeric_observation_value_count,
        "blank_or_non_numeric_value_count": profile.blank_or_non_numeric_value_count,
        "blank_or_non_numeric_value_pct": ""
        if profile.blank_or_non_numeric_value_pct is None
        else round(profile.blank_or_non_numeric_value_pct, 4),
        "observed_geography_year_count": profile.observed_geography_year_count,
        "possible_geography_year_count": profile.possible_geography_year_count,
        "missing_geography_year_count": profile.missing_geography_year_count,
        "geography_year_coverage_pct": ""
        if profile.geography_year_coverage_pct is None
        else round(profile.geography_year_coverage_pct, 4),
        "geography_column": profile.geography_column or "",
        "time_column": profile.time_column or "",
        "value_column": profile.value_column or "",
        "geography_codes": " ".join(profile.geography_codes),
        "caveat_notes": profile.caveat_notes,
        "candidate": profile.candidate,
        "units": " | ".join(profile.units),
        "denominator": profile.denominator,
        "grain": profile.grain,
        "dimension_columns": " | ".join(profile.dimension_columns),
        "source_semantics": profile.source_semantics,
        "licence": profile.licence,
        "processing_decision": profile.processing_decision,
        "decision_reason": profile.decision_reason,
        "requested_api_url": profile.requested_api_url,
        "effective_api_url": profile.effective_api_url or "",
        "initial_api_status": profile.initial_api_status,
        "fallback_used": "" if profile.fallback_used is None else profile.fallback_used,
        "fallback_note": profile.fallback_note,
        "source_content_sha256": profile.source_content_sha256,
        "official_url": profile.official_url,
        "sdmx_csv_api_url": profile.sdmx_csv_api_url,
        "profiled_at_utc": generated_at_utc,
    }


def profile_to_contract(profile: DatasetProfile, *, generated_at_utc: str) -> dict[str, object]:
    """Convert a profile to a JSON-serializable data contract."""

    return {
        "name": profile.name,
        "slug": profile.slug,
        "pillar": profile.pillar,
        "story_role": profile.story_role,
        "status": profile.status,
        "candidate": profile.candidate,
        "generated_at_utc": generated_at_utc,
        "source": {
            "provider": "Pacific Data Hub / Pacific Community",
            "official_url": profile.official_url,
            "sdmx_csv_api_url": profile.sdmx_csv_api_url,
            "requested_sdmx_csv_api_url": profile.requested_api_url,
            "effective_sdmx_csv_api_url": profile.effective_api_url,
            "source_content_sha256": profile.source_content_sha256,
            "fetch": {
                "initial_api_status": profile.initial_api_status,
                "fallback_used": profile.fallback_used,
                "fallback_note": profile.fallback_note,
            },
        },
        "coverage": {
            "row_count": profile.row_count,
            "geography_count": profile.geography_count,
            "geography_codes": profile.geography_codes,
            "year_range": {"start": profile.year_start, "end": profile.year_end},
            "returned_row_value_coverage": {
                "numeric_observation_value_count": profile.numeric_observation_value_count,
                "blank_or_non_numeric_value_count": profile.blank_or_non_numeric_value_count,
                "blank_or_non_numeric_value_pct": profile.blank_or_non_numeric_value_pct,
            },
            "structural_geography_year_coverage": {
                "observed_distinct_geography_years": profile.observed_geography_year_count,
                "possible_geography_years_in_observed_span": (
                    profile.possible_geography_year_count
                ),
                "missing_geography_years_in_observed_span": (
                    profile.missing_geography_year_count
                ),
                "coverage_pct": profile.geography_year_coverage_pct,
                "caveat": STRUCTURAL_COVERAGE_CAVEAT,
            },
        },
        "schema": {
            "columns": profile.columns,
            "geography_column": profile.geography_column,
            "time_column": profile.time_column,
            "value_column": profile.value_column,
        },
        "semantics": {
            "units": profile.units,
            "denominator": profile.denominator,
            "grain": profile.grain,
            "dimension_columns": profile.dimension_columns,
            "source_semantics": profile.source_semantics,
            "licence": profile.licence,
        },
        "processing_decision": {
            "status": profile.processing_decision,
            "reason": profile.decision_reason,
        },
        "caveat_notes": profile.caveat_notes,
    }


def _pick_column(
    columns: list[str], *, preferred: list[str], contains: list[str]
) -> str | None:
    upper_lookup = {column.upper(): column for column in columns}
    for candidate in preferred:
        if candidate.upper() in upper_lookup:
            return upper_lookup[candidate.upper()]

    for token in contains:
        token_upper = token.upper()
        for column in columns:
            if token_upper in column.upper():
                return column

    return None


def _unique_non_missing(series: pd.Series) -> list[str]:
    values = {
        text
        for text in (str(value).strip() for value in series.tolist())
        if text and text.lower() not in MISSING_TOKENS
    }
    return sorted(values)


def _year_range(series: pd.Series) -> tuple[int | None, int | None]:
    years = pd.to_numeric(series, errors="coerce").dropna()
    if years.empty:
        return None, None

    return int(years.min()), int(years.max())


def _geography_year_coverage(
    *,
    frame: pd.DataFrame,
    geography_column: str | None,
    time_column: str | None,
    geography_count: int,
    year_start: int | None,
    year_end: int | None,
) -> tuple[int, int, int, float | None]:
    if (
        not geography_column
        or not time_column
        or year_start is None
        or year_end is None
        or geography_count == 0
    ):
        return 0, 0, 0, None

    pairs = pd.DataFrame(
        {
            "geography": frame[geography_column].astype(str).str.strip(),
            "year": pd.to_numeric(frame[time_column], errors="coerce"),
        }
    )
    valid_geography = ~pairs["geography"].str.lower().isin(MISSING_TOKENS)
    observed = int(pairs[valid_geography].dropna().drop_duplicates().shape[0])
    possible = geography_count * (year_end - year_start + 1)
    missing = max(0, possible - observed)
    return observed, possible, missing, observed / possible if possible else None


def _acquisition_fields(
    acquisition: dict[str, object] | None,
    sdmx_csv_api_url: str,
) -> dict[str, object]:
    values = acquisition or {}
    effective_url = values.get("effective_url")
    fallback_used = values.get("fallback_used")
    return {
        "requested_api_url": str(values.get("requested_url") or sdmx_csv_api_url),
        "effective_api_url": str(effective_url) if effective_url else None,
        "initial_api_status": str(values.get("initial_error_status") or ""),
        "fallback_used": bool(fallback_used) if fallback_used is not None else None,
        "fallback_note": str(values.get("fallback_note") or ""),
        "source_content_sha256": str(values.get("source_content_sha256") or ""),
    }


def _value_coverage(frame: pd.DataFrame, value_column: str | None) -> tuple[int, int, float | None]:
    row_count = int(len(frame))
    if not value_column:
        return 0, row_count, 1.0 if row_count else None

    numeric_values = pd.to_numeric(frame[value_column], errors="coerce")
    numeric_value_count = int(numeric_values.notna().sum())
    blank_value_count = row_count - numeric_value_count
    blank_value_pct = None if row_count == 0 else blank_value_count / row_count
    return numeric_value_count, blank_value_count, blank_value_pct


def _build_caveats(
    *,
    row_count: int,
    geography_column: str | None,
    time_column: str | None,
    value_column: str | None,
    missing_value_count: int,
    missing_value_pct: float | None,
) -> list[str]:
    caveats: list[str] = []

    if row_count == 0:
        caveats.append("No data rows were returned.")
    if not geography_column:
        caveats.append("No geography column was detected.")
    if not time_column:
        caveats.append("No time column was detected.")
    if not value_column:
        caveats.append("No observation value column was detected.")
    if missing_value_count == 1:
        caveats.append("One returned row has a blank or non-numeric observation value.")
    elif missing_value_count > 1 and missing_value_pct is not None:
        caveats.append(
            f"{missing_value_count} returned rows have blank or non-numeric observation "
            f"values ({missing_value_pct:.1%})."
        )

    return caveats
