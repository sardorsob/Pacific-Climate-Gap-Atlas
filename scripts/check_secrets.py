"""Lightweight secret-pattern scan for scaffold commits."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", ".venv", "venv", "node_modules", "dist", ".superpowers"}
SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
    re.compile(r"ghp_[A-Za-z0-9]{20,}"),
    re.compile(r"AIza[0-9A-Za-z_-]{20,}"),
    re.compile(r"(?i)(api[_-]?key|secret|token)\s*=\s*['\"][^'\"]{8,}['\"]"),
]


def iter_text_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.is_file() and path.suffix.lower() in {
            ".md",
            ".py",
            ".ts",
            ".tsx",
            ".js",
            ".json",
            ".yml",
            ".yaml",
            ".toml",
            ".html",
            ".css",
            ".example",
            ".gitignore",
        }:
            files.append(path)
    return files


def main() -> int:
    findings: list[str] = []
    for path in iter_text_files():
        text = path.read_text(encoding="utf-8", errors="ignore")
        for pattern in SECRET_PATTERNS:
            if pattern.search(text):
                findings.append(str(path.relative_to(ROOT)))

    if findings:
        print("Potential secrets found:")
        for finding in sorted(set(findings)):
            print(f"- {finding}")
        return 1

    print("Secret scan passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
