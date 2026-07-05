# Handoff Notes

## Immediate Next Step

Use the completed `TASK-018` story/design briefs, the `TASK-020` Dataviz Inspiration audit, and the TASK-019/TASK-037 divergence artifacts. The analysis lanes through TASK-019 are complete, `TASK-025` app-data wiring is complete, `TASK-026` MapLibre map substrate is complete with centroid fallback, `TASK-029` Natural Earth visual land context is complete, `TASK-028` story/copy rewrite is complete, `TASK-027` final visual/interactions polish is complete, `TASK-030`/`TASK-031` readiness/accessibility QA are complete, and `TASK-037` selected-place JSD neighbor wiring is complete.

## Next Build Step

Follow the remaining project order: hand Fable only final UI/front-end polish if owner review wants another visual pass, then Codex QA/commit any accepted visual edits. Evidence Fingerprint Divergence ships only as selected-place nearest-neighbor detail; do not add a global link network, similarity ramp, or leaderboard without a new task. If official scored-geography polygon boundaries are pursued, treat them as a separate reviewed-source task rather than part of the completed MapLibre/Natural Earth visual substrate.

## Current Evidence Snapshot

- Indicator forensics preserve 182 trace rows and flag 11 within-indicator outliers.
- Country story labels identify 5 primary high-gap geographies: PN, NR, AS, WF, and TV.
- Spatial typologies point to Polynesia as the highest mean-gap subregion, with caveats against statistical cluster or adjacency claims.
- Outlook interpretation is display guidance for stress-test layers, not forecasting.
- Monitoring-gap priorities identify PN, NR, AS, and WF; AS and WF should be framed as reporting gaps unless independently verified.
- Evidence Fingerprint Divergence has 22 fingerprints, 231 unordered pairwise JSD rows, and 66 nearest-neighbor rows. TASK-037 wires nearest neighbors into selected-place detail only.
- The app map now uses MapLibre with Natural Earth land context under centroid point features. Official/selectable boundary polygons are not joined and should not be implied in copy or design.
- The Dataviz Inspiration audit favors full-bleed map, selected-anchor, compact evidence-strip, direct-label, and evidence-bearing-motion patterns. Treat references as principle studies only.
- Claude owns visual mockup edits only; Codex owns critique, QA, staging, commits, and any acceptance decision.
