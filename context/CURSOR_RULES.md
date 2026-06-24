# Cursor Rules

This project uses a context-first agentic workflow.

- Read `context/PROJECT.md`, `context/SCOPE.md`, `context/TASKS.md`, and relevant data/model cards before editing.
- Keep all durable project Markdown in `context/`.
- Do not commit copied reference workflow kits under `context/agentic-workflow-kit/` or `context/data-science-agentic-workflow-kit/`.
- For task work, update `context/TASKS.md` with legal status transitions only.
- For data/model work, update `context/DATA_CARD.md`, `context/MODEL_CARD.md`, `context/ASSUMPTIONS.md`, and `context/EXPERIMENTS.md` when evidence changes.
- Parallelize independent tasks when dependencies and file ownership make it safe, then review outputs before merging.
- Commit task-by-task after QA evidence is recorded.
- Never include `Co-authored-by` trailers or assistant/agent credit in commits.
