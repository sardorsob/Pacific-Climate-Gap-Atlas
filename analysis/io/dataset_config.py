"""Minimal config loading for the project dataset YAML files."""

from __future__ import annotations

from pathlib import Path


def load_dataset_config(path: Path) -> dict[str, object]:
    """Load the current `configs/datasets.yml` shape without external dependencies."""

    config: dict[str, object] = {}
    section: str | None = None
    current_dataset: dict[str, str] | None = None

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        if not raw_line.startswith(" "):
            if current_dataset is not None:
                config.setdefault("priority_datasets", []).append(current_dataset)
                current_dataset = None

            key, _, value = stripped.partition(":")
            section = key if not value.strip() else None
            if value.strip():
                config[key] = value.strip()
            elif key == "priority_datasets":
                config[key] = []
            continue

        if section != "priority_datasets":
            continue

        if stripped.startswith("- "):
            if current_dataset is not None:
                config.setdefault("priority_datasets", []).append(current_dataset)
            current_dataset = {}
            stripped = stripped[2:].strip()

        if current_dataset is not None and ":" in stripped:
            key, _, value = stripped.partition(":")
            current_dataset[key.strip()] = value.strip()

    if current_dataset is not None:
        config.setdefault("priority_datasets", []).append(current_dataset)

    if "priority_datasets" not in config:
        raise ValueError(f"{path} is missing `priority_datasets`.")

    return config


def select_processing_datasets(config: dict[str, object]) -> list[dict[str, str]]:
    """Return entries enabled for the processed-data pipeline; existing entries default on."""

    entries = config.get("priority_datasets", [])
    if not isinstance(entries, list):
        raise ValueError("`priority_datasets` must be a list.")
    return [
        entry
        for entry in entries
        if isinstance(entry, dict)
        and str(entry.get("processing_enabled", "true")).strip().lower() == "true"
    ]
