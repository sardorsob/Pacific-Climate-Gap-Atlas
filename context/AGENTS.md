# Agents

## Project Rule

All durable project context Markdown lives under `context/`. Root Markdown should be limited to public repository entry points such as `README.md`.

## Roles

### Orchestrator

- Maintains `context/PROJECT.md`, `context/SCOPE.md`, and `context/TASKS.md`.
- Splits work into task blocks with file ownership and acceptance criteria.
- Does not silently change scientific criteria or project scope.
- Runs independent tasks in parallel when file ownership and dependencies allow it.
- Reviews and approves parallel agent outputs before merging them into the main task flow.

### Builder

- Reads relevant context before editing.
- Moves a task from `pending` to `in-progress`.
- Implements only listed files unless stopping to explain why scope must change.
- Runs verification commands listed in the task.
- Adds Builder notes and moves `in-progress` to `in-review`.
- Never marks a task `done`.

### QA / Scientific Reviewer

- Reviews only `in-review` tasks.
- Checks diff, data provenance, score logic, tests, app behavior, and caveats.
- Marks `done` only with evidence.
- Marks `needs-fix` with exact fix notes when evidence is insufficient.
- Updates memory and handoff after done.

## Legal Status Transitions

```text
pending -> in-progress
in-progress -> in-review
in-progress -> blocked
in-review -> done
in-review -> needs-fix
in-review -> blocked
needs-fix -> in-progress
blocked -> pending
blocked -> in-progress
pending -> obsolete
```

No task may jump directly from `pending` or `in-progress` to `done`.

## Commit Rules

Before task work is fully established:

```text
chore(scaffold): initialize workflow shell
docs(scope): import project scope
docs(tasks): parse scope into build tasks
```

After tasks exist, include task IDs:

```text
analysis(eda): TASK-001 audit official datasets
feat(data): TASK-003 build adaptation gap index
feat(app): TASK-006 add map layer controls
docs(handover): TASK-007 finalize competition handoff
```

Never add `Co-authored-by` trailers or assistant/agent authorship credit to commits.

Commit task-by-task when a task has passed its relevant QA gate. Avoid batching unrelated task work into one commit.
