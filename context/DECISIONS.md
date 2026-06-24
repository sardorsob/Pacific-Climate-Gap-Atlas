# Decisions

## 2026-06-24: Use A Context-First Repository Layout

All durable workflow documents, project state, task status, assumptions, and handoff notes live under `context/`.

Reason: the user wants one explicit context folder as the working memory center for both agents and humans.

## 2026-06-24: Use Adaptation Gap As The Main Frame

The headline is the broader adaptation gap, not only monitoring gaps.

Reason: monitoring is a strong diagnostic layer, but the broader adaptation frame better supports climate signal, stress, and capacity comparisons.

## 2026-06-24: Keep Outlook Modeling Transparent And Baseline-First

The future-facing layer will be framed as an outlook or scenario baseline, not an operational prediction.

Reason: there is unlikely to be enough target-labeled data for a defensible supervised prediction model, but a transparent trend/scenario layer can still add value.

## 2026-06-24: Keep Workflow Kits Local And Ignored

Reference workflow kits are copied under `context/agentic-workflow-kit/` and `context/data-science-agentic-workflow-kit/`, but ignored by Git.

Reason: they are useful local context but should not be pushed with this project.

## 2026-06-24: Parallelize Independent Work And Commit Task-By-Task

Independent tasks should run in parallel when dependencies and file ownership allow it. The orchestrator reviews parallel outputs before accepting them.

Commits should be task-oriented and must not include `Co-authored-by` trailers or assistant/agent authorship credit.

Reason: the user wants fast agentic execution without losing review discipline or clean authorship.
