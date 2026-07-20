"""SDMX CSV fetch helpers for Pacific Data Hub endpoints."""

from __future__ import annotations

import shutil
import subprocess
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, urlunsplit
from urllib.request import Request, urlopen

DEFAULT_ACCEPT_HEADER = "application/vnd.sdmx.data+csv;version=2.1"
V2_SDMX_HOST = "stats-sdmx-disseminate.pacificdata.org"
STABLE_SDMX_HOST = "stats-nsi-stable.pacificdata.org"
TRUSTED_SDMX_HOSTS = frozenset({V2_SDMX_HOST, STABLE_SDMX_HOST})
V2_DATAFLOW_PREFIX = "/rest/v2/data/dataflow/"


def fetch_sdmx_csv_text(
    *,
    url: str,
    accept_header: str = DEFAULT_ACCEPT_HEADER,
    timeout: float = 30.0,
    _requested_url: str | None = None,
    _initial_error_status: str = "",
    _fallback_note: str = "",
) -> tuple[str | None, str | None, str, dict[str, object]]:
    """Fetch SDMX CSV text, using PowerShell fallback for picky Windows endpoint behavior."""

    requested_url = _requested_url or url
    if not _is_trusted_sdmx_url(url):
        return (
            None,
            "source_url_not_allowed",
            "SDMX source URL must use a trusted HTTPS Pacific Data Hub endpoint.",
            _fetch_provenance(
                requested_url=requested_url,
                effective_url=url,
                initial_error_status=_initial_error_status,
                fallback_note=_fallback_note,
            ),
        )

    headers = {
        "Accept": accept_header,
        "User-Agent": "pacific-climate-gap-atlas/0.1 dataset-pipeline",
    }
    request = Request(url, headers=headers)
    try:
        # The URL is restricted to TRUSTED_SDMX_HOSTS immediately above.
        with urlopen(request, timeout=timeout) as response:  # nosemgrep
            status_code = response.getcode()
            body = response.read()
            charset = response.headers.get_content_charset() or "utf-8"
    except HTTPError as exc:
        if exc.code == 422:
            fallback_url = stable_sdmx_url(url)
            if fallback_url is not None:
                return fetch_sdmx_csv_text(
                    url=fallback_url,
                    accept_header=DEFAULT_ACCEPT_HEADER,
                    timeout=timeout,
                    _requested_url=requested_url,
                    _initial_error_status="api_error_422",
                    _fallback_note=(
                        "Original v2 request returned HTTP 422; retried through the "
                        "documented stable Pacific Data Hub endpoint."
                    ),
                )
            fallback_text = fetch_with_powershell(
                url=url,
                accept_header=accept_header,
                timeout=timeout,
            )
            if fallback_text is not None:
                return fallback_text, None, "", _fetch_provenance(
                    requested_url=requested_url,
                    effective_url=url,
                    initial_error_status="api_error_422",
                    fallback_note=(
                        "Original request returned HTTP 422; PowerShell transport "
                        "fallback succeeded."
                    ),
                )
        return (
            None,
            f"api_error_{exc.code}",
            f"SDMX CSV API returned HTTP {exc.code}.",
            _fetch_provenance(
                requested_url=requested_url,
                effective_url=url,
                initial_error_status=_initial_error_status,
                fallback_note=_fallback_note,
            ),
        )
    except (OSError, URLError) as exc:
        fallback_text = fetch_with_powershell(url=url, accept_header=accept_header, timeout=timeout)
        if fallback_text is not None:
            return fallback_text, None, "", _fetch_provenance(
                requested_url=requested_url,
                effective_url=url,
                initial_error_status=_initial_error_status or "fetch_error",
                fallback_note=_fallback_note
                or "Python transport failed; PowerShell transport fallback succeeded.",
            )
        return (
            None,
            "fetch_error",
            f"Could not fetch SDMX CSV API response: {exc}",
            _fetch_provenance(
                requested_url=requested_url,
                effective_url=url,
                initial_error_status=_initial_error_status,
                fallback_note=_fallback_note,
            ),
        )

    if status_code != 200:
        return (
            None,
            f"api_error_{status_code}",
            f"SDMX CSV API returned HTTP {status_code}.",
            _fetch_provenance(
                requested_url=requested_url,
                effective_url=url,
                initial_error_status=_initial_error_status,
                fallback_note=_fallback_note,
            ),
        )

    return (
        body.decode(charset, errors="replace"),
        None,
        "",
        _fetch_provenance(
            requested_url=requested_url,
            effective_url=url,
            initial_error_status=_initial_error_status,
            fallback_note=_fallback_note,
        ),
    )


def _fetch_provenance(
    *,
    requested_url: str,
    effective_url: str,
    initial_error_status: str,
    fallback_note: str,
) -> dict[str, object]:
    return {
        "requested_url": requested_url,
        "effective_url": effective_url,
        "initial_error_status": initial_error_status,
        "fallback_used": bool(fallback_note),
        "fallback_note": fallback_note,
    }


def stable_sdmx_url(url: str) -> str | None:
    """Translate a Pacific v2 dataflow URL to the documented stable data endpoint."""

    parts = urlsplit(url)
    if parts.scheme != "https" or parts.netloc != V2_SDMX_HOST or not parts.path.startswith(
        V2_DATAFLOW_PREFIX
    ):
        return None

    path_parts = parts.path.removeprefix(V2_DATAFLOW_PREFIX).split("/", 4)
    if len(path_parts) != 4:
        return None

    agency, flow, version, key = path_parts
    stable_path = f"/rest/data/{agency},{flow},{version}/{key}/{agency}"
    return urlunsplit((parts.scheme, STABLE_SDMX_HOST, stable_path, parts.query, parts.fragment))


def _is_trusted_sdmx_url(url: str) -> bool:
    try:
        parts = urlsplit(url)
        port = parts.port
    except ValueError:
        return False
    return (
        parts.scheme == "https"
        and parts.hostname in TRUSTED_SDMX_HOSTS
        and parts.username is None
        and parts.password is None
        and port in {None, 443}
    )


def fetch_with_powershell(*, url: str, accept_header: str, timeout: float) -> str | None:
    """Fetch through Windows PowerShell when the SDMX endpoint rejects urllib requests."""

    powershell = shutil.which("powershell") or shutil.which("pwsh")
    if powershell is None:
        return None

    timeout_seconds = max(1, int(timeout))
    script = "\n".join(
        [
            "$ErrorActionPreference = 'Stop'",
            "$headers = @{ Accept = " + _ps_single_quote(accept_header) + " }",
            "$response = Invoke-WebRequest -UseBasicParsing "
            + "-Uri "
            + _ps_single_quote(url)
            + " -Headers $headers -Method Get -TimeoutSec "
            + str(timeout_seconds),
            "if ($response.Content -is [byte[]]) {",
            "  [Console]::OutputEncoding = [Text.Encoding]::UTF8",
            "  [Console]::Write([Text.Encoding]::UTF8.GetString($response.Content))",
            "} else {",
            "  [Console]::OutputEncoding = [Text.Encoding]::UTF8",
            "  [Console]::Write([string]$response.Content)",
            "}",
        ]
    )

    result = subprocess.run(
        [powershell, "-NoProfile", "-NonInteractive", "-Command", script],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=timeout + 10,
        check=False,
    )
    if result.returncode != 0:
        return None

    return result.stdout


def _ps_single_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"
