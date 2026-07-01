# Patterns Memory

## Context-First Documentation

When creating or updating project state, put the Markdown file under `context/` unless it is a public root entry point like `README.md`.

## Static App Data

The frontend should consume static JSON/GeoJSON exports from `app/public/data/`. Those files should be generated from Python scripts rather than edited manually.

## Script-First EDA

Use Python modules under `analysis/eda/` and `scripts/run_eda.py` for exploratory analysis that feeds the story. Save durable tables under `artifacts/tables/` and keep interpretation/caveats in `context/`.

## Dataviz Inspiration Audit

Use `context/DATAVIZ_INSPIRATION_AUDIT.md` and `context/WINNER_SCROLL_TOUR_AUDIT.md` before visual critique or mockup iteration.

Reusable patterns:

- full-bleed map as the primary evidence surface,
- compact edge controls for layers and source/method access,
- selected geography as the anchor for comparison,
- compact evidence strips in country panels,
- direct labels and leader lines for guided claims,
- scroll-led default path with the map as sticky evidence surface,
- "Explore freely" escape hatch into the current atlas controls,
- motion only when it reveals, compares, focuses, or re-encodes evidence.

Avoid copying reference identities, palettes, layouts, or iconic stripe treatments.

## Delegated Mockup Revision

- Codex owns critique, QA, staging, commits, and push decisions.
- Claude owns the visual mockup revision only.
- Codex data work completed `TASK-019` Evidence Fingerprint Divergence; app export remains future work.
- Codex owns `TASK-025` real app-data wiring and should use the completed `TASK-023` inventory before replacing mock fixtures.
- `TASK-026` MapLibre/island geometry should be Codex-led, with Claude helping visual refinement only after the map/data contract is stable.
- Claude can draft `TASK-028` story/copy improvements and `TASK-027` final visual polish, but Codex must QA claims, caveats, and commits.
- Keep Claude app edits separate from data-analysis and app-data wiring edits until Codex integrates them.
- Completed one-off critique/delegation plan files may be pruned after their outcomes are consolidated into living docs.
