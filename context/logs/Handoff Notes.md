# Handoff Notes

## Immediate Next Step

Use the completed `TASK-018` story/design briefs, the `TASK-020` Dataviz Inspiration audit, `context/plans/app-data-wiring-inventory.md`, and the TASK-019 divergence artifacts. The analysis lanes through TASK-019 are complete, `TASK-025` app-data wiring is complete, `TASK-026` MapLibre map substrate is complete with centroid fallback, `TASK-029` Natural Earth visual land context is complete, and `TASK-028` story/copy rewrite is complete. The next build gate is `TASK-027` final visual polish.

## Next Build Step

Follow the remaining `TASK-006` child-task order: `TASK-027` final visual polish, then `TASK-007` readiness. If the Evidence Fingerprint Divergence layer ships in V1, export compact app-ready similarity data from the TASK-019 artifacts and keep the interface selected-geography anchored. If official scored-geography polygon boundaries are pursued, treat them as a separate reviewed-source task rather than part of the completed MapLibre/Natural Earth visual substrate.

## Current Evidence Snapshot

- Indicator forensics preserve 182 trace rows and flag 11 within-indicator outliers.
- Country story labels identify 5 primary high-gap geographies: PN, NR, AS, WF, and TV.
- Spatial typologies point to Polynesia as the highest mean-gap subregion, with caveats against statistical cluster or adjacency claims.
- Outlook interpretation is display guidance for stress-test layers, not forecasting.
- Monitoring-gap priorities identify PN, NR, AS, and WF; AS and WF should be framed as reporting gaps unless independently verified.
- Evidence Fingerprint Divergence has 22 fingerprints, 231 unordered pairwise JSD rows, and 66 nearest-neighbor rows. It is analysis-ready but not app-wired.
- The app map now uses MapLibre with Natural Earth land context under centroid point features. Official/selectable boundary polygons are not joined and should not be implied in copy or design.
- The Dataviz Inspiration audit favors full-bleed map, selected-anchor, compact evidence-strip, direct-label, and evidence-bearing-motion patterns. Treat references as principle studies only.
- Claude owns visual mockup edits only; Codex owns critique, QA, staging, commits, and any acceptance decision.
