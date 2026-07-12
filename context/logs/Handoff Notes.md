# Handoff Notes

## Immediate Next Step

`TASK-057` remains `needs-fix` after owner visual QA. `TASK-059` and `TASK-060` are done after TDD, independent review, and desktop/portrait/landscape browser QA. Start `TASK-061` for the aligned Nauru/Tuvalu takeover; keep desktop/landscape paired and portrait in consecutive full-width reading order.

## Next Build Step

`TASK-049` through `TASK-056` and `TASK-058` through `TASK-060` are approved and done. Their evidence grammar, premise/copy/URL contract, and fullscreen composition remain the baseline. Continue with `TASK-061`, then `TASK-062`, `TASK-063`, and `TASK-064`. Use the single batch implementation plan and commit each task separately.

The five evidence scenes remain the narrative spine, preceded by one fullscreen premise. The recommended composition is **One Constellation on an Elastic Stage**. JSD remains selected-place panel evidence only; similarity map arcs stay removed.

## Current Evidence Snapshot

- Indicator forensics preserve 182 trace rows and flag 11 within-indicator outliers.
- Country story labels identify 5 primary high-gap geographies: PN, NR, AS, WF, and TV.
- Spatial typologies point to Polynesia as the highest mean-gap subregion, with caveats against statistical cluster or adjacency claims.
- Outlook interpretation is display guidance for stress-test layers, not forecasting.
- Monitoring-gap priorities identify PN, NR, AS, and WF; AS and WF should be framed as reporting gaps unless independently verified.
- Evidence Fingerprint Divergence has 22 fingerprints, 231 unordered pairwise JSD rows, and 66 nearest-neighbor rows. TASK-037 wires nearest neighbors into selected-place detail only.
- Indicator forensics contain 165 score-input rows and 17 responsibility-context rows across 182 trace rows. Generated geography records now expose those roles separately through `TASK-048`.
- The app map now uses MapLibre with Natural Earth land context under centroid point features. Official/selectable boundary polygons are not joined and should not be implied in copy or design.
- The Dataviz Inspiration audit favors full-bleed map, selected-anchor, compact evidence-strip, direct-label, and evidence-bearing-motion patterns. Treat references as principle studies only.
- `TASK-049` approved the generated desktop/mobile concept frames and locked the evidence-mark direction before implementation. Codex retains evidence/claims QA, staging, and commit responsibility; commits never receive assistant co-author trailers.

## 2026-07-12

- 2026-07-12: `TASK-060` Builder pass moved to `in-review`. The existing `StoryScrolly`, sticky map, observer, URL state, and figure routing now form a fullscreen shell with map-immersive and figure-takeover ownership; premise top/progress chrome is absent from the DOM, interactive controls retain their own keys, observer threshold zero is included, and native focus/reduced-motion rules remain visible and immediate. Root later reproduced an existing-tab landscape-to-portrait reload failure: automatic browser restoration replayed the stale landscape offset after copied-scene scrolling, placing the missingness scene at the observer line and rewriting the URL. A focused RED/GREEN test now assigns scroll restoration to the existing hydration flow with `history.scrollRestoration = "manual"`; focused tests pass 9/9, full frontend passes 41/41, and build/budget/status/secret/whitespace gates pass. Root browser re-QA remains required.
- 2026-07-12: `TASK-059` Builder pass moved to `in-review`. The app contract now exposes six stable guided IDs with `what-this-atlas-is-asking` first, map/figure stage ownership, a premise-aware eyebrow, premise URL fallback, and comparison focus tied to stable visual meaning rather than scene index. Focused tests passed 7/7 after an observed RED gate; full frontend tests passed 37/37; build and source/claims audit passed with the known chunk warning. A separate Checker must review before `TASK-059` can become done.
- 2026-07-12: Owner approved `TASK-058` and rejected per-task Markdown clutter. Consolidated the fullscreen-stage contract into `context/ARTISTIC_REDESIGN_BRIEF.md`, removed the one-off TASK-058 design file, and organized TASK-059–064 under one batch implementation plan. `TASK-057` remains `needs-fix`; implementation has not started.

## 2026-07-11

- Owner visual QA moved `TASK-057` from `in-review` to `needs-fix`: the first story view does not explain the atlas premise clearly enough, and the fixed 30rem/28rem rail plus 330px rank figure makes scenes 4 and 5 too small. Cataloged three new composition boards under `artifacts/design/task-058/` and wrote the fullscreen-stage synthesis and `TASK-059`–`TASK-064` batch. No app code, data, scoring, or generated runtime artifacts changed.

- Independent browser QA accepted `TASK-056`: desktop 1200x734, mobile 390x844, Explore handoff, all five scenes, selected NR/TV/FJ/AS/WF/MH panels, Methods & sources, and reduced-motion behavior passed with 22 marks, no overflow, expected visual attributes, 56px/44px mobile controls, and the panel-only similarity caveat. `TASK-056` is done; proceed to `TASK-057` for URL state, bundle-budget, and final readiness QA.
- `TASK-057` URL/history and hydration follow-ups passed their automated gates (60 Python tests, 34 frontend tests, contracts/artifacts/statuses/secrets, build, 1,022,289-byte JS and 93,895-byte CSS budget, whitespace), and Browser-use verified copied-scene restoration and history behavior. Owner visual QA then failed the opening clarity and scene-4/5 scale, so the task is `needs-fix`; no deployment or submission is claimed.
