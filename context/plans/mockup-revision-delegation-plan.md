# Mockup Revision Delegation Plan

## Status

Date: 2026-06-29

Purpose: organize the next atlas improvement sprint after the Dataviz Inspiration audit.

This plan does not approve implementation by itself. It defines who should do what, what can run in parallel, and what Codex must review before any commit.

## Working Principle

Do not treat the next step as "make the dashboard prettier." Treat it as:

> Turn the current reviewable mockup into a stronger map-first Pacific Adaptation Gap Atlas using the story/design briefs and the Dataviz Inspiration audit.

The atlas should become more visual, more polished, and more exploratory without weakening the evidence contract.

## Roles

| Role | Owner | Responsibility | Commit Rights |
| --- | --- | --- | --- |
| Orchestrator / QA | Codex | Task planning, context updates, code review, validation, staging, committing, final acceptance | Yes |
| Visual mockup builder | Claude | Desktop/mobile visual revision, interaction states, styling, mockup implementation under approved scope | No |
| Data analysis agent | Codex or delegated data agent | Completed Evidence Fingerprint Divergence artifacts for `TASK-019`; future work is app export if accepted | No direct commit without Codex review |
| App-data agent | Codex or delegated app agent | Inventory mock data versus public app data and define wiring gaps | No direct commit without Codex review |
| Project owner | User | Visual taste, story approval, scope decisions, final critique | No repo automation required |

Hard rule: no agent except Codex stages, commits, or pushes. Commits must not include co-author trailers.

## Next Task Batch

### TASK-021: Mockup Critique Against Story And Inspiration Audit

Owner: Codex

Goal: review the current React/Vite mockup against `STORY_BRIEF.md`, `DESIGN_BRIEF.md`, `DATAVIZ_INSPIRATION_AUDIT.md`, and `CLAUDE_MOCKUP_INSTRUCTIONS.md`.

Output:

- a concrete revision checklist,
- a prioritized issue list,
- desktop/mobile screenshot notes if a browser review is available,
- exact instructions for Claude's revision pass.

This should happen before Claude starts major redesign work, or at least before Claude's work is accepted.

### TASK-022: Claude Visual Revision Pass

Owner: Claude

Goal: revise the mockup visually and interactively using the `TASK-021` checklist.

Expected direction:

- full-bleed map surface,
- stronger Pacific/GIS art direction,
- compact edge controls,
- direct labels for key story exemplars,
- selected geography as the anchor state,
- compact evidence strips in the country panel,
- clearer "Where the Data Goes Quiet" state,
- mobile bottom sheet that preserves the map,
- no copied reference identity or decorative motion.

Claude must not change data methodology, generated artifacts, analysis scripts, package files, Git history, or raw data.

### TASK-019: Evidence Fingerprint Divergence Analysis

Owner: Codex data agent

Goal: generate real JSD-based official-data evidence profile artifacts so the similarity layer can be evaluated as real data rather than a mocked idea.

This can run in parallel with Claude's visual work because it should touch analysis files and EDA artifacts, not the app mockup files.

### TASK-023: App Data Wiring Inventory

Owner: Codex app-data agent

Goal: compare current app mock fixtures to `app/public/data/*` and identify what needs to be transformed, renamed, or derived before the app stops relying on mock data.

Output:

- fixture-to-real-data mapping,
- missing fields,
- recommended app-ready JSON additions,
- wiring order,
- risks for `TASK-006`.

This can run in parallel with `TASK-019` and Claude's visual work if it avoids editing the same app files.

### TASK-024: Codex QA Of Claude Revision

Owner: Codex

Goal: review Claude's changes before commit.

QA scope:

- story alignment,
- audit pattern alignment,
- caveat placement,
- missingness encoding,
- rank uncertainty visibility,
- mobile layout,
- text fit,
- accessibility basics,
- build result,
- no unrelated files,
- no co-author metadata.

This waits until Claude has finished `TASK-022`.

## Parallelization

Safe to run together:

- `TASK-019` and `TASK-022`, because one is analysis/artifacts and one is app mockup visuals.
- `TASK-023` and `TASK-022`, if `TASK-023` remains an inventory/design note and does not edit the same app files.
- `TASK-019` and `TASK-023`, because they have different file ownership.

Do not run together without coordination:

- `TASK-022` and `TASK-024`, because QA depends on Claude's finished change set.
- app implementation edits and Claude mockup edits in the same files.
- public-data wiring and visual mockup changes in the same component files unless Codex is actively integrating.

## File Ownership

Claude may edit, pending Codex review:

- `app/src/App.tsx`
- `app/src/styles/base.css`
- `app/src/components/**`
- `app/src/lib/**`
- `app/src/mock/**`

Claude should avoid:

- `analysis/**`
- `scripts/**`
- `configs/**`
- `data/**`
- `artifacts/**`
- `context/**`, unless Codex explicitly asks for a design note draft
- package files unless Codex approves the dependency need first

Codex data agent owns:

- `analysis/eda/divergence.py`
- `tests/analysis/test_divergence.py`
- `scripts/run_eda.py`
- divergence artifacts under `artifacts/tables/` and `artifacts/provenance/`
- related context updates after artifacts exist

Codex app-data agent owns:

- inventory docs under `context/plans/`
- app-data contract review under `context/`
- possible future data-export script changes only after Codex approves scope

## Acceptance Sequence

1. Codex completes `TASK-021` and gives Claude a revised, concrete instruction set.
2. Claude completes `TASK-022` and leaves changes unstaged.
3. Codex reviews and either requests fixes or accepts the visual revision.
4. Codex commits accepted `TASK-022` changes separately.
5. Codex reviews and commits `TASK-019` artifacts separately.
6. Codex reviews and commits `TASK-023` inventory separately.
7. Codex runs `TASK-024` QA after visual revision and records the outcome.

## Success Criteria

The next mockup iteration is successful if:

- the first viewport reads as an atlas, not a dashboard;
- the map is the dominant evidence surface;
- selected geography feels like an anchor workflow;
- "data quiet" is visibly different from "low score";
- rank uncertainty and caveats are adjacent to claims;
- desktop and mobile each feel intentionally designed;
- the design clearly learned from the audit without looking copied.
