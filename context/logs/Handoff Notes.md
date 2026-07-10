# Handoff Notes

## Immediate Next Step

Review `TASK-048` in `in-review` against `context/plans/task-048-evidence-semantics-implementation-plan.md`, then mark it `done` only after independent QA. The index, EDA, generated app data, validator, map-size encoding, legend, and panel now separate eight possible score inputs from responsibility-context and total trace rows. Do not reintroduce `included_indicator_count`.

## Next Build Step

After `TASK-048` review, run `TASK-049` as a hard owner visual-approval gate. Then execute `TASK-050` through `TASK-055` in dependency order using `context/plans/tasks-049-055-artistic-story-implementation-plan.md`. Finish with `TASK-056` and `TASK-057` using the simplification/readiness plan. Each task receives its own Builder/QA status transitions and commit.

The current seven-beat atlas remains the functioning baseline until those tasks land. The approved target is the five-scene **The Shape of What We Know** story in `context/ARTISTIC_REDESIGN_BRIEF.md`. JSD remains selected-place panel evidence; guided JSD and map arcs are planned for removal.

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
- `TASK-049` requires owner approval of generated desktop/mobile concept frames before implementation. Codex retains evidence/claims QA, staging, and commit responsibility; commits never receive assistant co-author trailers.
