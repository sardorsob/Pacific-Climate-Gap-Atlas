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

## TASK-022 Mockup Visual Assumptions (accepted after Codex QA)

- The mockup map is an SVG schematic using a simple equirectangular projection, not MapLibre or real boundary geometry. The "centroid fallback, not boundary geometry" note stays visible, and point placement remains schematic until real geometry is wired.
- The app still reads from the static `app/src/mock/` fixture. Values are real (pulled from the geojson and EDA tables), but they are not yet wired to `app/public/data/*`. TASK-023 owns the fixture-to-real-data wiring inventory.
- The selected-anchor "vs Tuvalu" comparator is a labeled suggestion only. It is not an evidence-fingerprint or JSD similarity layer. No similarity layer should be treated as shipped until TASK-019 artifacts and caveats exist.
- Direct map labels are limited to the story exemplars to avoid clutter. Subregion labels are descriptive UN M49 orientation, not cultural, political, or boundary claims.
- Mobile uses a top control toolbar plus a bottom-sheet detail panel, with the legend collapsed to a chip. These are mockup interaction stand-ins, not a locked production interaction model.
- The visual revision remains a concept for owner review. It does not change data methodology, scores, generated artifacts, or the story. Codex accepted the scoped app changes after `TASK-024` QA and kept data wiring as a separate `TASK-023` concern.
