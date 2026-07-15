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

## TASK-068 Regional EDA Assumptions

- The Pacific region is the analytical subject. A named geography may illustrate a complete-distribution result, but it may not replace the regional field or become the default protagonist.
- Within-indicator percentiles are acceptable for research ordering and heatmap display only. They are not a new composite, score, or cross-unit measure.
- Measured condition and evidence visibility answer different questions and must use separate matrices, ordering, labels, and caveats.
- No missing measured condition is imputed. Absence may be encoded only in the visibility lane, where absence itself is the declared analytical subject.
- Hierarchical ordering is a deterministic visual seriation, not proof of natural clusters. Leave-one-indicator instability requires rejection of group labels rather than a more elaborate clustering method.
- Reporting coverage, monitoring counts, power generation, and fisheries measures are partial proxies. They do not establish emergency preparedness, infrastructure adequacy, adaptation readiness, or lived vulnerability.
- Pairwise relationships are descriptive and non-causal. Sample size, latest-year basis, and dependency warnings must remain adjacent, especially when a derived score contains one of the compared inputs.
- Research maps use equal-presence centroid marks and generalized land context. They do not imply official boundaries, island area, population weight, or spatial interpolation.

## Evidence Fingerprint Assumptions

- Evidence-profile similarity compares official-data-derived vectors, not full lived climate risk or adaptation readiness.
- Jensen-Shannon divergence is the preferred public metric because it is symmetric and bounded.
- KL divergence is optional internal diagnostics only unless smoothing, zeros, and caveats are simple enough to explain publicly.
- Missingness must remain a profile feature or caveat; it should not be hidden by smoothing.
- Similar profiles should be shown as selected-geography comparisons, not as natural clusters or a new leaderboard.

## TASK-022/TASK-024 Mockup Visual Assumptions (accepted after Codex QA)

- The accepted scroll-led atlas now uses a MapLibre canvas with Natural Earth land context under centroid fallback points. It still does not have reviewed scored-geography boundary geometry, so copy must distinguish visual land context from official/selectable boundary polygons.
- The app now loads generated public data from `/data/geographies.json` through `app/src/lib/atlasData.ts`. `TASK-025` deleted the obsolete static mock fixture after preserving monitoring, rank, story, context, and outlook-display caveats in the app data contract.
- The selected-anchor view no longer shows the static "vs Tuvalu" comparator cue. TASK-037 ships evidence-fingerprint/JSD only as selected-place nearest-neighbor detail; no free pairwise comparison, global link network, map ramp, or leaderboard should be treated as shipped.
- Direct map labels are limited to the story exemplars to avoid clutter. Subregion labels are descriptive UN M49 orientation, not cultural, political, or boundary claims.
- Mobile uses a top control toolbar plus a bottom-sheet detail panel, with the legend collapsed to a chip. These are mockup interaction stand-ins, not a locked production interaction model.
- The visual revision remains a concept for owner review. It does not change data methodology or scores. Codex accepted the scoped app changes after `TASK-024` QA; `TASK-028` story/copy rewrite and `TASK-027` final visual polish are now complete, leaving `TASK-007` final readiness as the next gate.
- The scroll-led hybrid is now implemented in the reviewable mockup as the default guided path. Preserve the current atlas shell and free-explore handoff unless the owner rejects the hybrid after visual review.
