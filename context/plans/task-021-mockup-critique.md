# TASK-021 Mockup Critique Checklist

## Status

Date: 2026-06-29

Owner: Codex

Purpose: critique the current React/Vite atlas mockup before Claude starts `TASK-022`.

Scope:

- current app source under `app/src/`
- `context/STORY_BRIEF.md`
- `context/DESIGN_BRIEF.md`
- `context/DATAVIZ_INSPIRATION_AUDIT.md`
- `context/CLAUDE_MOCKUP_INSTRUCTIONS.md`
- browser review of `http://127.0.0.1:5173`

Build result:

- `npm --prefix app run build` passed when rerun outside the filesystem sandbox.
- The first sandboxed build failed during Vite/esbuild config resolution with a filesystem permission error, not an app compile error.

Browser review:

- Desktop rendered at approximately `1536 x 826`.
- Reviewed default state, selected Nauru state, and "Where the data goes quiet" state.
- Chrome screenshots were reviewed in-session but not persisted as repo artifacts.
- True mobile viewport screenshot was not available through the connected Chrome API in this session. Mobile critique below is based on the implemented `@media (max-width: 880px)` CSS and DOM/source inspection.

## Executive Take

The current mockup is evidence-aware and structurally solid, but it still reads too much like a map with dashboard cards around it. Claude's revision should make it feel more like an atlas surface: integrated labels, clearer map evidence, lighter controls, more intentional selected-place anchoring, and a mobile bottom sheet that preserves the map.

Do not redesign the story. Improve the visual hierarchy and interaction expression.

## What Already Works

- The app opens directly on the atlas, not a landing page.
- The map is full-bleed within the left/main region.
- Points encode score, evidence density, and monitoring/reporting status.
- Caveats are visible in the header, controls, panel, and data-quiet view.
- The SVG points are keyboard-reachable buttons with meaningful accessible labels.
- Selection uses a bracket/callout rather than another data-like ring.
- The Nauru detail panel includes score, rank fragility, pressure/capacity bars, evidence density, monitoring caveat, top signals, trace teaser, and method access.
- The "Where the data goes quiet" panel correctly distinguishes reported-zero rows from missing monitoring rows.
- The build passes after the sandbox permission issue is removed.

These strengths should be preserved.

## Priority Findings

### P0: Desktop Legend Is Hidden On First Load

Issue:

- `MapLegend` is inside a closed `<details>` element.
- The summary is hidden on desktop.
- CSS tries to force `.legend-disclosure > .legend` visible, but the closed `<details>` still hides the content.
- Result: the first desktop screenshot does not show the legend, even though the design brief requires fill, size, and ring encoding to be visible or immediately available.

Required fix for Claude:

- On desktop, render the legend as a visible compact panel, not a closed disclosure.
- On mobile, keep the collapsible legend chip if it does not hide the map.
- Make the legend adjacent to the map evidence and short enough not to dominate.

Acceptance:

- Desktop first screenshot visibly explains fill color, point size, and reporting-status ring.
- Mobile first state has a visible legend affordance and does not require hover.

### P1: First View Still Feels Like Map Plus Dashboard Cards

Issue:

- The right detail panel is open by default and dominates the first read with a large editorial headline.
- The map has marks, but no direct labels in the default state.
- The header, controls, actions, and panel all compete as separate cards.
- The atlas feels competent but not yet competition-polished or GIS-specific enough.

Required fix for Claude:

- Reduce the default right panel's dominance. Consider a collapsed rail, slimmer intro panel, or map-adjacent summary strip.
- Let the map carry the first claim through direct labels or callouts for a few exemplars.
- Use the right panel primarily after selection or during a tour step.
- Make controls feel like compact map tools rather than dashboard cards.

Acceptance:

- A static desktop screenshot reads as "atlas first" before "panel first."
- The first view needs less prose to explain the default state.

### P1: Default Map Needs More Geographic And Story Anchoring

Issue:

- The current graticule gives GIS flavor, but there is no visual hierarchy for Pacific place/context.
- Most default points are unlabeled, so the first claim is abstract until a user clicks.
- The inspiration audit points toward direct labels and map-anchored claims.

Required fix for Claude:

- Add restrained direct labels or leader lines for selected story exemplars, especially PN, NR, AS, WF, and TV.
- Consider subtle subregion labels or a quiet Pacific frame if it helps orientation.
- Avoid polygon choropleths or boundary-like shapes unless explicitly marked schematic.
- Keep the centroid and mock-projection caveat visible.

Acceptance:

- A reader can identify the key story geographies in the default or guided state without hunting.
- Labels do not collide heavily or occlude the evidence.

### P1: Selected Geography Is Good But Not Yet A Full Anchor Workflow

Issue:

- Selecting Nauru dims other points and opens a useful detail panel.
- The compare action exists, but the map does not visibly become a selected-anchor comparison surface yet.
- The Dataista-inspired selected-anchor pattern is only partially expressed.

Required fix for Claude:

- Make selected geography feel like an anchor state, not just a selected marker.
- Keep a compact selected-place badge on the map.
- Make "Compare with Tuvalu" visually meaningful: either show Tuvalu as a labeled suggested comparator or add a small comparison affordance in the map/panel.
- If Evidence Fingerprint Divergence is shown before `TASK-019`, label it planned/pending and do not imply it is shipped.

Acceptance:

- On selected Nauru, it is obvious what is selected, why it matters, and how to compare.
- Selection remains distinct from monitoring/reporting rings.

### P1: Data-Quiet State Is Strong But Should Be More Map-Led

Issue:

- The data-quiet state is the current strongest story state.
- It correctly labels PN, NR, AS, WF and separates reported-zero from missing rows.
- However, the main explanation still lives mostly in the right panel; the map could carry more of the "what does zero mean / why blank" distinction directly.

Required fix for Claude:

- Preserve the two caveat cards.
- Add map-adjacent labels or small in-map callouts distinguishing reported-zero versus missing rows.
- Make the priority group visually legible without the user reading every panel sentence.
- Keep low-monitoring status distinct from low score.

Acceptance:

- A static screenshot of the data-quiet view communicates reported zero versus missing rows.
- PN being far from the central cluster remains visible and labeled without feeling like an error.

### P2: Compact Evidence Strips Are Not Yet Fully Realized

Issue:

- Pressure/capacity bars exist and are useful.
- Rank appears as a chip.
- The detail panel does not yet feel like it has the compact "evidence strip" language from the audit.

Required fix for Claude:

- Turn pressure/capacity and rank fragility into a more compact, visually integrated evidence strip.
- Consider a small horizontal "profile" row with pressure, capacity, rank movement, evidence density, and monitoring status.
- Keep values and caveats readable; do not make the strip decorative.

Acceptance:

- The panel can be scanned quickly before reading details.
- Caveats remain next to the metrics they qualify.

### P2: Mobile Needs A Dedicated Critique Pass

Issue:

- The CSS defines a mobile bottom sheet and keeps the map at `54vh`.
- Controls sit at the bottom of the map region, while the detail bottom sheet also occupies the bottom of the screen when open.
- Without a true mobile screenshot in this session, risk remains around overlap, cramped controls, and text fit.

Required fix for Claude:

- Explicitly review at `390 x 844` and report screenshot observations.
- Ensure first mobile view keeps map, active layer, and caveat visible.
- Ensure controls and the bottom sheet do not fight for the same screen edge.
- Ensure touch targets are at least reasonably close to 44px.
- Consider moving layer controls into a bottom-sheet tab or compact toolbar if the map bottom gets crowded.

Acceptance:

- Claude reports mobile default and selected-country states.
- No hover-only interpretation.
- Opening details does not permanently hide the map.

### P2: Visual Identity Needs More Polish Without Decorative Atmosphere

Issue:

- The palette is restrained and evidence-safe, but the overall look is still conventional.
- Cards have 12px radii despite the project design preference for compact cards and the general app guidance to keep cards at 8px or less unless a design system says otherwise.
- The map background is quiet but somewhat plain.

Required fix for Claude:

- Improve the art direction through map-specific details: cartographic linework, label hierarchy, careful typography, subtle ocean/land/context treatment, and disciplined spacing.
- Reduce card-heavy feel and oversized radii where possible.
- Avoid bokeh, orbs, broad decorative gradients, wispy ribbons, flags, and one-note dark blue styling.

Acceptance:

- The page looks polished without becoming atmospheric wallpaper.
- The map remains the primary evidence surface.

## Claude Revision Brief For TASK-022

Claude should revise the current app mockup, not rebuild it from scratch.

Read first:

1. `context/plans/task-021-mockup-critique.md`
2. `context/CLAUDE_MOCKUP_INSTRUCTIONS.md`
3. `context/DESIGN_BRIEF.md`
4. `context/STORY_BRIEF.md`
5. `context/DATAVIZ_INSPIRATION_AUDIT.md`

Primary deliverables:

1. Desktop default view with visible legend, stronger map-first hierarchy, and lighter intro/panel treatment.
2. Desktop selected Nauru view with a stronger selected-anchor workflow and visible Tuvalu comparison affordance.
3. Desktop data-quiet view with map-led zero/missing distinction.
4. Mobile portrait default view at about `390 x 844`.
5. Mobile portrait selected-country or data-quiet bottom-sheet view.

Preserve:

- evidence caveats,
- centroid fallback caveat,
- reported-zero versus missing-row distinction,
- rank fragility framing,
- method/source access,
- no global leaderboard,
- no polygon choropleth,
- no unsupported JSD layer until `TASK-019` artifacts exist.

Do not touch:

- `analysis/**`
- `scripts/**`
- `configs/**`
- `data/**`
- `artifacts/**`
- package files
- Git commands

Run:

```powershell
npm --prefix app run build
```

Report:

- changed files,
- desktop viewport checked,
- mobile viewport checked,
- what remains static or fake,
- what should be reviewed by the project owner,
- any risk or open question for Codex QA.

## Codex QA Checklist For TASK-024

After Claude finishes, Codex should verify:

- build passes,
- desktop default screenshot includes the visible legend,
- selected Nauru state reads as an anchor workflow,
- data-quiet screenshot distinguishes reported-zero and missing rows on the map and in the panel,
- mobile screenshot preserves map, active layer, caveat, and usable controls,
- no essential values require hover,
- text fits in buttons/cards/panels,
- no decorative atmosphere competes with evidence,
- no reference identity is copied,
- no generated artifacts or methodology files were changed,
- no commit, stage, push, or co-author metadata came from Claude.
