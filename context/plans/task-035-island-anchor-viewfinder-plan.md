# TASK-035 Island-Anchored Viewfinder Plan

Owner-approved design (2026-07-04): selection viewfinder frame + nearest-land tick.
This file is the spec and the implementation plan in one, scaled to the size of
the change. Fable builds; Codex reviews geometry honesty and the diff; no commits
by Fable.

## Approved Treatment

- On selection, four achromatic corner brackets frame a fixed geographic window
  (±1.6° lon/lat around the centroid, projected each frame, clamped between
  90px and 34% of the shorter viewport side). The frame is never fitted to land.
- A dotted leader ticks from the selected circle's edge to the center of the
  nearest Natural Earth land feature, computed from the visual land context.
  If the land center sits within ~8px of the point, the tick is omitted (Niue case).
- Whisper label under the bottom-left bracket: "map area, not territory."
- Land never takes the score ramp. Amber priority halos and monitoring rings unchanged.
- Motion: ~200ms focus reveal; instant under reduced motion.

## Honesty Constraints (from TASK-035 statistical notes)

- No polygon scores, official boundaries, area, adjacency, or choropleth implication.
- Frame = "map area around the scored point", stated on-surface.
- Nearest-land tick is safe because centroids sit on their own territory
  (AS centroid to Tutuila ≈ 0.1°; to Samoa's islands ≈ 1.7°). This exact case
  is pinned by a unit test.
- Codex geometry decision, pre-framed: nothing here requires a boundary source.
  A true territorial-extent highlight remains a future reviewed-source task.

## Implementation Steps

1. `atlasMapModel.ts`: pure `nearestLandCenter(lon, lat, landFeatures)` helper
   (bbox-center per feature, shifted-lon aware). Unit test written first:
   AS resolves to Tutuila-distance land, not Samoa-distance land; empty
   collection returns null.
2. `AtlasMap.tsx`: memoized nearest-land lookup for `selectedCode`; render
   frame + tick + whisper label in the existing SVG overlay using the
   wrap-aware `project()`.
3. `base.css`: `.viewfinder` bracket/tick/label styles, reduced-motion rule.
4. `DESIGN_BRIEF.md`: short treatment note under selection state.
5. Verification: `npm --prefix app run test`, `npm --prefix app run build`,
   `python scripts/validate_task_statuses.py`, `python scripts/check_secrets.py`,
   `git diff --check`, preview screenshots desktop 1440 + mobile 375 for owner
   comparison against the current circle map.

## Out of Scope

- Any boundary-source work, polygon selection geometry, or land recoloring.
- Changes to generated data, scores, or methodology text (geometry semantics
  are unchanged, so `DATA_CARD.md`/`methodology.md` stay untouched; noted for
  Codex).

## Attempt 2: Island Outline Halo (owner-directed, 2026-07-04)

Owner review: the viewfinder alone is too quiet; the islands themselves should
light up on selection. Approved addition:

- `assignLandAnchors(land, geos, maxDeg = 3.5)`: pure, tested function that
  tags each land polygon with the geo code of its nearest scored centroid,
  or null beyond the cutoff. Nearest-centroid resolves the AS/WS adjacency
  correctly; the 3.5-degree cutoff leaves far context land (Hawaii, NZ,
  Australia) and the disputed Matthew & Hunter islands (≈5.6-7 degrees from
  both NC and VU centroids) unassigned by construction. The assignment is a
  visual grouping for highlighting, not a boundary or territorial source.
- Two MapLibre line layers over the land fill (soft blurred glow + crisp
  outline, white selection language, never the score ramp), filtered to the
  selected geo code; filter updates on selection change.
- Viewfinder whisper note reworded to cover the halo: grouping by distance,
  not boundaries.
- Tests first: own-territory anchoring, cutoff null, disputed-island null.
- Codex geometry QA reviews the grouping rule and exclusion behavior.
