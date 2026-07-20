"""Validate task status values in context/TASKS.md."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TASKS_PATH = ROOT / "context" / "TASKS.md"
ALLOWED_STATUSES = {
    "pending",
    "in-progress",
    "in-review",
    "needs-fix",
    "blocked",
    "done",
    "obsolete",
}


def main() -> int:
    text = TASKS_PATH.read_text(encoding="utf-8")
    statuses = re.findall(r"^- Status:\s*([A-Za-z-]+)\s*$", text, flags=re.MULTILINE)
    if not statuses:
        print("No task status lines found.")
        return 1

    invalid = [status for status in statuses if status not in ALLOWED_STATUSES]
    if invalid:
        print("Invalid task statuses:")
        for status in invalid:
            print(f"- {status}")
        return 1

    print(f"Task status check passed ({len(statuses)} statuses).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
