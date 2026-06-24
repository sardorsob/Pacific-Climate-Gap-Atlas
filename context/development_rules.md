# Development Rules

## Context

Use `context/` as the durable project memory. Update it when scope, task status, assumptions, data contracts, or handoff details change.

## Data

- Never edit raw data in place.
- Generated app data must come from scripts.
- Reportable figures/tables should live under `artifacts/`.
- Show missingness and caveats near index/model outputs.

## Code

- Keep Python analysis code package-style under `analysis/`.
- Keep CLI orchestration under `scripts/`.
- Keep app code under `app/src/`.
- Avoid notebook-only core logic.
- Prefer small, testable functions with explicit inputs.

## Verification

Run relevant task verification before moving any task to review. For scaffold-level work, run:

```powershell
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
```

## Parallel Work

Use parallel agents or parallel tool calls whenever tasks are independent, have non-overlapping file ownership, and do not depend on each other's outputs. The orchestrator must review parallel outputs before accepting them.

## Commits

Commit one completed task at a time after QA evidence is recorded. Do not include `Co-authored-by` trailers or assistant/agent credit in any commit.
