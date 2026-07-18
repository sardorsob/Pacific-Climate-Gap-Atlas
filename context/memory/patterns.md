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
- a plain, content-width "Explore the map" handoff into the current atlas controls,
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

Independent QA accepted `TASK-049` on 2026-07-10. The six generated concept frames and eight baseline captures are composition references only; generated labels, numbers, boundaries, and icons must never become data. The approved direction locks a 44px fixed presence portrait, 20px inner field, eight ordered 5px score-input ticks, detached 4:30 context tick, continuous/open-dash/broken-dot reporting edges, Georgia/system sans typography, and 560ms `cubic-bezier(0.22, 1, 0.36, 1)` motion. Its 28rem desktop story column and 46svh mobile map were implemented as the historical rail composition and are superseded by `TASK-058`. Grayscale QA confirmed reported-zero, missing-score-input, and no-processed-row treatments remain distinguishable without color.

Independent QA accepted `TASK-050` on 2026-07-10. The guided story uses normal document sections and a viewport-root `IntersectionObserver`; `StoryScrolly` owns the active-scene callback, while `SceneProgress` only calls `scrollIntoView`. Keep this one-way ownership model, keyboard clamping, and reduced-motion `behavior: "auto"` behavior across the five scenes. Do not reintroduce `StoryRail`, nested story overflow, or progress handlers that set active state directly.

Independent QA accepted `TASK-051` on 2026-07-10. The active guided contract is five `SCENES` plus one closing `HANDOFF_COPY`; the former tour and guided fingerprint are retired. Keep one closing Explore action, short claim/caveat/source lines, and selected-place JSD only in the explore panel. The story shell remains native document scroll with observer-owned scene state; scene-specific figures should attach to these IDs without restoring a global tour abstraction.

Root QA accepted `TASK-052` on 2026-07-10. `EvidenceMark` is the visible primary map mark: 44px fixed footprint, 20px inner field, eight stable ticks, detached context tick, and reporting edge grammar. The MapLibre point layer remains only as an invisible event-compatible substrate; do not restore a second visible circle mark or evidence-size encoding. Accessible map buttons remain 44px and own geography labels while the SVG overlay stays decorative.

Root QA accepted `TASK-053` on 2026-07-10. Story figures use real `Geo` records and explicit `visible capacity` language: scene 3 opens fixed evidence marks into paired pressure/capacity lobes with negative space, and scene 4 uses aligned `EvidencePortrait` records. Keep monitoring labels and caveats attached to each portrait, avoid JSD/connectors, and preserve the map as a sticky evidence surface. The shell must not have an overflow-clipping ancestor that disables `position: sticky`; map-canvas itself owns visual clipping.

Independent QA accepted `TASK-054` on 2026-07-10. Rank bands are interval evidence, not ordered rows: sort by midpoint, highlight MH 4–19, keep the sensitivity caveat, and render all 22 geographies. Use the shared 560ms `cubic-bezier(0.22, 1, 0.36, 1)` motion token, stop camera transitions before new targets, keep scene-five basin framing, and make reduced motion a complete static equivalent.

Root QA accepted `TASK-055` on 2026-07-10. JSD is panel-only: keep the complete generated nearest-neighbor list and the exact caveat about profile shape, physical connection, shared risk, lived experience, and policy need; remove every similarity map source/layer/gate/limit/copy. Selection camera reframes only offscreen or panel-covered marks. On compact mobile, selection opens a collapsed detail handle by default so the selected 44px mark remains visible; users can expand the sheet intentionally.

Owner-approved `TASK-058` supersedes the `TASK-049` rail dimensions without superseding its evidence grammar. For the next build, read `context/ARTISTIC_REDESIGN_BRIEF.md`: use One Constellation on an Elastic Stage, keep the map fullscreen for the premise and scenes 1–3, promote scenes 4 and 5 to fullscreen evidence takeovers, and return the same 22 marks to geography for Explore. Preserve one native scroll owner, stable URL state, reduced-motion equivalents, fixed-presence marks, and panel-only JSD. The generated `TASK-058` boards are composition references only.

`TASK-064` adds one reachability rule to that pattern: controls placed before fullscreen scroll sections need a sticky owner of their own. Keep the existing toolbar and `SceneProgress` inside one conditional sticky chrome region, keep progress targets at least 44px, and measure rank-heading offsets against the complete chrome in desktop, portrait, and landscape. Do not rely on an offscreen DOM control or automation-forced click as evidence of user reachability.

## Reversible Explorer Drill-Down

Reuse existing state before adding navigation machinery. In this app, `viewMode` is the diagnostic parent and `selectedCode` is the selected-place child. A diagnostic child gets **Back to data coverage/rank ranges** plus **Close**; ordinary detail and diagnostic roots get Close. Back restores the parent. Close ends the panel path. A diagnostic child replaces its parent URL entry, and Back/Close replace that child entry, so browser Back does not immediately reopen dismissed diagnostic content.

On narrow screens, primary sibling actions must all advertise themselves. Use two complete rows in portrait and one compact row in landscape; do not hide primary evidence views behind unmarked horizontal overflow. Keep full accessible names when visible labels shorten. This is a layout rule, not permission to replace the accepted palette, typography, map, marks, panels, or story.

Selected-place detail should continue the guided evidence vocabulary before optional index evidence: existing water change, renewable-share change, separate years, explicit null state, and represented count out of 14. Keep different-clock, descriptive/non-causal, and presence-is-not-preparedness caveats adjacent.

## Delegated Mockup Revision

- Codex owns critique, QA, staging, commits, and push decisions.
- Claude owns the visual mockup revision only.
- Codex data work completed `TASK-019` Evidence Fingerprint Divergence; selected-neighbor app export and panel wiring are complete through `TASK-037`.
- `TASK-025` real app-data wiring is complete; use `app/src/lib/atlasData.ts` and generated `/data/geographies.json` as the app data path.
- `TASK-026` MapLibre map substrate and `TASK-029` Natural Earth land context are complete. Scored/selectable geographies are still centroid fallback, not reviewed polygon geometry.
- `TASK-028` story/copy rewrite and `TASK-027` visual/interactions polish are complete for the baseline. The approved redesign is now split into `TASK-048` through `TASK-057`; future app changes still need Codex QA for claims, caveats, accessibility, and commits.
- Keep Claude app edits separate from data-analysis and app-data wiring edits until Codex integrates them.
- Completed one-off critique/delegation plan files may be pruned after their outcomes are consolidated into living docs.
