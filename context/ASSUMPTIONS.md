# Assumptions

## Project Assumptions

- The main artifact will be a public interactive website.
- The first useful version should be static-data powered, not live API powered.
- Official challenge datasets are the controlling source for the competition entry.
- Additional open GIS reference data is allowed only when licensing and source notes are clear.

## Index Assumptions

- Adaptation gap is modeled as a mismatch between climate pressure and adaptation capacity proxies.
- Official datasets do not fully measure adaptation readiness; they provide comparable signals only.
- Missingness should be shown to users rather than hidden through imputation.
- Equal weights are acceptable for the first baseline only if the methodology says so plainly.

## Outlook Assumptions

- Outlook means transparent scenario/projection baseline, not hard prediction.
- Capacity indicators are slower-moving and may be projected using simple scenario assumptions.
- Climate signal trends require enough historical observations to avoid misleading projections.
- Weak or sparse projections should be omitted from the app rather than dressed up.
- Mixed projections may appear only as stress-test context with a strong visible caveat.

## EDA Story Assumptions

- Country story labels are descriptive screens for exploration, not causal explanations.
- Spatial typologies are rule-based descriptors, not statistical clusters or adjacency claims.
- Rank order is fragile for many geographies and should be shown as context, not a definitive leaderboard.
- Indicator outliers should be compared within the same dataset and unit only.
- Missing monitoring rows are reporting gaps unless a reviewed external source confirms infrastructure absence.

## Evidence Fingerprint Assumptions

- Evidence-profile similarity compares official-data-derived vectors, not full lived climate risk or adaptation readiness.
- Jensen-Shannon divergence is the preferred public metric because it is symmetric and bounded.
- KL divergence is optional internal diagnostics only unless smoothing, zeros, and caveats are simple enough to explain publicly.
- Missingness must remain a profile feature or caveat; it should not be hidden by smoothing.
- Similar profiles should be shown as selected-geography comparisons, not as natural clusters or a new leaderboard.

## TASK-022/TASK-024 Mockup Visual Assumptions (accepted after Codex QA)

- The accepted scroll-led atlas now uses a MapLibre canvas with Natural Earth land context under centroid fallback points. It still does not have reviewed scored-geography boundary geometry, so copy must distinguish visual land context from official/selectable boundary polygons.
- The app now loads generated public data from `/data/geographies.json` through `app/src/lib/atlasData.ts`. `TASK-025` deleted the obsolete static mock fixture after preserving monitoring, rank, story, context, and outlook-display caveats in the app data contract.
- The selected-anchor "vs Tuvalu" comparator is a labeled suggestion only. It is not an evidence-fingerprint or JSD similarity layer. No similarity layer should be treated as shipped until TASK-019 artifacts are exported to app-ready data and reviewed with caveats in the interface.
- Direct map labels are limited to the story exemplars to avoid clutter. Subregion labels are descriptive UN M49 orientation, not cultural, political, or boundary claims.
- Mobile uses a top control toolbar plus a bottom-sheet detail panel, with the legend collapsed to a chip. These are mockup interaction stand-ins, not a locked production interaction model.
- The visual revision remains a concept for owner review. It does not change data methodology or scores. Codex accepted the scoped app changes after `TASK-024` QA; `TASK-028` story/copy rewrite and `TASK-027` final visual polish are now complete, leaving `TASK-007` final readiness as the next gate.
- The scroll-led hybrid is now implemented in the reviewable mockup as the default guided path. Preserve the current atlas shell and free-explore handoff unless the owner rejects the hybrid after visual review.
