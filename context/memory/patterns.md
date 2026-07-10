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

## Artistic Redesign Pattern

For the next build, read `context/ARTISTIC_REDESIGN_BRIEF.md` before editing the story or map.

Preserve these patterns:

- fixed overall geography presence; missing evidence appears as interruption, not a smaller mark;
- eight explicit score-input positions and one separate responsibility-context tick;
- one scene claim, visual operation, caveat, and source line;
- native document scroll with one observer-owned active scene;
- reveal, subtract, separate, compare, rearrange, and return as evidence-bearing motion verbs;
- panel-only JSD similarity with no physical connectors;
- mobile as a sibling composition with room for every scene to finish;
- contemporary scientific ocean-chart art direction without appropriating Pacific cultural motifs.

Do not implement the new mark against the retired `included_indicator_count`; `TASK-048` now provides explicit counts and presence records. `TASK-049` has now passed the owner concept gate; frontend work must use the locked concept values and generated data.

Independent QA accepted `TASK-048` after fresh Python/frontend tests, contract/artifact/status/secret/whitespace checks, byte-parity verification, and manual semantic review of NR, TV, PN, AS, and FJ. Keep the explicit score/context/trace fields and eight-slot presence contract as the baseline for `TASK-049` onward.

Independent QA accepted `TASK-049` on 2026-07-10. The six generated concept frames and eight baseline captures are composition references only; generated labels, numbers, boundaries, and icons must never become data. The approved direction locks a 44px fixed presence portrait, 20px inner field, eight ordered 5px score-input ticks, detached 4:30 context tick, continuous/open-dash/broken-dot reporting edges, 28rem desktop story column, 46svh mobile map, Georgia/system sans typography, and 560ms `cubic-bezier(0.22, 1, 0.36, 1)` motion. Grayscale QA confirmed reported-zero, missing-score-input, and no-processed-row treatments remain distinguishable without color. Frontend implementation begins at `TASK-050` and must consume generated app data and these values.

Independent QA accepted `TASK-050` on 2026-07-10. The guided story now uses normal document sections and a viewport-root `IntersectionObserver`; `StoryScrolly` owns the active-scene callback, while `SceneProgress` only calls `scrollIntoView`. Keep this one-way ownership model, keyboard clamping, and reduced-motion `behavior: "auto"` behavior when replacing the seven beats in `TASK-051`. Do not reintroduce `StoryRail`, nested story overflow, or progress handlers that set active state directly.

Independent QA accepted `TASK-051` on 2026-07-10. The active guided contract is five `SCENES` plus one closing `HANDOFF_COPY`; the former tour and guided fingerprint are retired. Keep one closing Explore action, short claim/caveat/source lines, and selected-place JSD only in the explore panel. The story shell remains native document scroll with observer-owned scene state; scene-specific figures should attach to these IDs without restoring a global tour abstraction.

Root QA accepted `TASK-052` on 2026-07-10. `EvidenceMark` is the visible primary map mark: 44px fixed footprint, 20px inner field, eight stable ticks, detached context tick, and reporting edge grammar. The MapLibre point layer remains only as an invisible event-compatible substrate; do not restore a second visible circle mark or evidence-size encoding. Accessible map buttons remain 44px and own geography labels while the SVG overlay stays decorative.

Root QA accepted `TASK-053` on 2026-07-10. Story figures use real `Geo` records and explicit `visible capacity` language: scene 3 opens fixed evidence marks into paired pressure/capacity lobes with negative space, and scene 4 uses aligned `EvidencePortrait` records. Keep monitoring labels and caveats attached to each portrait, avoid JSD/connectors, and preserve the map as a sticky evidence surface. The shell must not have an overflow-clipping ancestor that disables `position: sticky`; map-canvas itself owns visual clipping.

## Delegated Mockup Revision

- Codex owns critique, QA, staging, commits, and push decisions.
- Claude owns the visual mockup revision only.
- Codex data work completed `TASK-019` Evidence Fingerprint Divergence; selected-neighbor app export and panel wiring are complete through `TASK-037`.
- `TASK-025` real app-data wiring is complete; use `app/src/lib/atlasData.ts` and generated `/data/geographies.json` as the app data path.
- `TASK-026` MapLibre map substrate and `TASK-029` Natural Earth land context are complete. Scored/selectable geographies are still centroid fallback, not reviewed polygon geometry.
- `TASK-028` story/copy rewrite and `TASK-027` visual/interactions polish are complete for the baseline. The approved redesign is now split into `TASK-048` through `TASK-057`; future app changes still need Codex QA for claims, caveats, accessibility, and commits.
- Keep Claude app edits separate from data-analysis and app-data wiring edits until Codex integrates them.
- Completed one-off critique/delegation plan files may be pruned after their outcomes are consolidated into living docs.
