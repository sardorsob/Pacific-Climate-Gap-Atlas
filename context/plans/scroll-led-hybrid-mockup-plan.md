# Scroll-Led Hybrid Mockup Plan

## Status

Date: 2026-06-30

Status: pending project-owner approval before implementation.

Source: Claude design brainstorm reviewed by Codex after the Pacific Dataviz winner scroll-tour audit.

This plan is not an implementation commit, final design approval, or product decision. It records the current best next design direction for review.

## Codex Review Summary

Claude's proposal is directionally right and technically well matched to the current app.

Accepted core idea:

- Use a sticky-map scroll experience as the default guided path.
- Keep the current atlas as the reusable map/control core.
- Treat scroll as a layer over a canonical beat index, not as the only navigation method.
- Preserve prev/next controls, keyboard reachability, reduced-motion behavior, and a persistent "Explore freely" escape hatch.
- Tighten the guided story to a short spine before releasing the reader into the free atlas.

Main Codex caveat:

- The design should not imply that Evidence Fingerprint Divergence is already a public app layer. If shown, it must be a small labelled preview: "analysis-ready, not app-wired." It should not become a global similarity leaderboard.

## Recommended Approach

Use Approach A from Claude's brainstorm:

Sticky-map scrollytelling with a shared beat state machine.

The map remains the main evidence surface. A scroll rail or story rail advances a small number of beats. Each beat writes to the same state model currently used by the tour: score layer, map view, outlook state, selected geography, and panel state.

Fallback behavior should resemble Approach B:

- buttons can move backward and forward through beats,
- keyboard users can navigate without scroll precision,
- reduced-motion users get immediate state changes,
- mobile users get a beat sheet/stepper instead of a desktop scroll column.

Rejected for now:

- Full scrollytelling rebuild.
- Separate cinematic landing page.
- Any design that discards the current atlas shell.

## Proposed Seven-Beat Spine

1. Open on the gap
   - Claim: where does the adaptation gap look widest, and where does the official record go quiet?
   - Map state: gap layer, exemplar labels only.
   - Caveat: comparative screen, not a ranking of need.
   - Action: scroll or choose "Explore freely."

2. Pull pressure and capacity apart
   - Claim: the gap is a mismatch between two imperfect sides, not a rank.
   - Map state: pressure/capacity layer transition or split-state treatment.
   - Caveat: capacity is a proxy from official datasets, not full readiness.
   - Action: continue.

3. Anchor Nauru and contrast Tuvalu
   - Claim: high gap does not always mean the same evidence story.
   - Map state: select NR, keep TV as comparator cue.
   - Caveat: high gap is not the same as data silence.
   - Action: compare or continue.

4. Where the data goes quiet
   - Claim: some high-gap places report zero monitoring rows, while others have no rows.
   - Map state: coverage view with PN, NR, AS, and WF labelled.
   - Caveat: a reporting gap is not proof infrastructure is absent.
   - Action: tap a marked point or continue.

5. Rank fragility
   - Claim: the atlas refuses to become a leaderboard because rank order is unstable.
   - Map state: uncertainty view, with MH as an example.
   - Caveat: rank movement frames uncertainty and should not be read as definitive.
   - Action: continue.

6. Evidence fingerprint preview
   - Claim: similar scores can come from different evidence profiles.
   - Map state: selected-anchor preview, preferably NR with a restrained comparator strip.
   - Caveat: similarity means official-data profile likeness, not shared risk, need, or responsibility.
   - Action: read method or continue.
   - Status: pending owner decision. Use only as a labelled static preview unless app-ready divergence exports are wired and reviewed.

7. Explore freely
   - Claim: the guided path teaches the map; the atlas now lets readers ask follow-up questions.
   - Map state: release current state into full controls.
   - Caveat: legend and methods remain visible.
   - Action: use layer controls, select places, open methods.

## Desktop Layout Direction

- Map takes roughly two thirds of the viewport and stays sticky.
- Story rail takes roughly one third of the viewport.
- Only one beat card should dominate at a time.
- Guided mode hides or delays the full layer-control burden.
- Keep a compact legend, methods access, current caveat, beat progress, and "Explore freely" visible.
- At the final beat or on escape, reveal the existing atlas controls while preserving selected geography and active layer state.

## Mobile Direction

- Keep the map visible on first load.
- Use a bottom beat sheet instead of a desktop story rail.
- The sheet should include current claim, caveat, next/back controls, and progress dots.
- No hover-only values.
- Country detail and data-quiet detail can expand the same bottom-sheet system, but the map should never disappear permanently behind controls.
- Touch targets should stay near 44px or larger where practical.

## Evidence-Bearing Enhancements To Consider

- Beat progress rail doubles as a compact encoding key.
- Map-edge evidence counter changes by beat and only shows real counts.
- Beat 4 includes an in-card mini key for "reports 0" versus "no rows."
- Beat 3 uses small NR/TV evidence strips to make "same score, different story" concrete.
- Active beat controls which direct labels are visible, reducing first-load clutter.
- "Explore freely" carries the current selected layer/geography into the atlas instead of resetting the reader.

## Open Decisions

Decision 1: Evidence Fingerprint Divergence treatment.

Recommended: include a small, clearly labelled preview in beat 6 only if it can be honest and visually restrained. Label it "analysis-ready, not app-wired." Do not make it a global layer or leaderboard.

Alternatives:

- move it to methods only,
- omit it from V1,
- wait until app-ready divergence data exists.

Decision 2: Spine length.

Recommended: keep the guided spine to seven beats and move regional texture and outlook into free exploration.

Alternatives:

- restore regional texture as beat 7 and make Explore Freely beat 8,
- restore outlook as an optional beat,
- keep both outside the guided path until the public-data wiring pass.

## Likely Implementation Scope After Approval

Likely app mockup files:

- `app/src/App.tsx`
- `app/src/components/TourStepper.tsx`
- new `app/src/components/story/StoryRail.tsx`
- new `app/src/components/story/StoryBeat.tsx`
- new `app/src/components/story/BeatProgress.tsx`
- new or extracted `app/src/lib/tour.ts`
- `app/src/styles/base.css`
- optional `app/src/components/panels/FingerprintPreview.tsx`
- optional small mock fixture addition in `app/src/mock/mockAtlasData.ts`

Files that should not change in this design pass:

- `analysis/`
- `scripts/`
- `data/`
- `artifacts/`
- scoring methodology context
- raw data
- package files unless a reviewed implementation plan proves a dependency is needed

## QA Gates For A Future Implementation

- Desktop and mobile screenshots preserve the same claim and caveats.
- First viewport shows map evidence, not a hero page.
- Scroll, buttons, keyboard, and reduced-motion paths all reach every beat.
- "Explore freely" preserves the current state.
- Essential values and caveats are visible without hover.
- No leaderboard, polygon choropleth, decorative atmosphere, or unsupported forecast framing appears.
- Fingerprint preview, if included, is labelled as analysis-ready and not app-wired.
