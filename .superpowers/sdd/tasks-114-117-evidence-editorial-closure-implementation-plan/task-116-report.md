# TASK-116 implementation report

## Scope

Changed only `HANDOFF_COPY` in `app/src/lib/scenes.ts` and its exact-copy regression test. No scene, state, component, CSS, data, action, route, or dependency changed.

## TDD evidence

- RED: `npm --prefix app run test -- scenes.test.ts StoryScrolly.test.tsx App.test.tsx` failed 1/26 because the retired instruction was still returned by `HANDOFF_COPY`.
- GREEN: the one constant replacement passed the same focused command (26/26).
- Mutation: temporarily removing `it does not rank need, readiness, or vulnerability.` failed the exact-copy test; restoring it passed the story regression (29/29).

## Quiet headless QA

`artifacts/design/task-116/` contains desktop 1440x900, portrait 390x844, and landscape 844x390 handoff frames plus `handoff-trace.json`. The trace retains the exact copy; 1440px `scrollWidth === clientWidth`; a 44px intrinsic action; focused-button operability; Explore changing to neutral controls with no selected panel or outlook; direct-scene URL behavior; and reduced-motion matching.

The headless-only WebGL fallback text overlays the map area in the portrait and landscape captures. It is runner infrastructure behavior, not introduced by the handoff-copy diff; no production/CSS workaround was added.

## Fresh verification

- Focused story suite: 29/29 passed.
- Full frontend suite: 142/142 passed.
- Production build passed: 1,044,970-byte JS and 96,583-byte CSS, both within internal diagnostic limits.
- Bundle, required-artifact, secret, and whitespace checks passed.

## Status

TASK-116 was recorded `pending -> in-progress -> in-review`; it is intentionally not marked done and awaits independent narrative/scientific review.
