# Design

## Product Frame

The Pacific Adaptation Gap Atlas is a map-first exploratory tool. It should feel like a GIS project with a strong analytical spine, not a dashboard pasted onto a map.

The approved next narrative identity is **The Shape of What We Know**. The governing argument is that official records illuminate the Pacific unevenly and those gaps limit what the atlas can responsibly compare, rank, and conclude. See `context/ARTISTIC_REDESIGN_BRIEF.md`.

## Main User Flow

Current baseline:

1. User lands in the seven-beat guided scroll atlas with the map visible.
2. Guided mode changes the same map state used by the explorer.
3. Explore mode reveals layer controls, detail panel, and source/method access.
4. User selects a geography to inspect score, pressure, visible capacity, monitoring, rank uncertainty, trace rows, and JSD neighbors.

Approved target:

1. User moves through five native-scroll scenes: reveal, subtract, separate, compare, and rearrange.
2. The same 22 marks return to geographic position before the Explore freely handoff.
3. Exploration preserves the scientific depth but removes guided JSD and physical similarity connectors.

## Main Visual Pattern

- fixed-presence centroid-anchored evidence portraits until a reviewed boundary source is chosen
- inner score field, eight score-input positions, separate context tick, monitoring edge, and quiet selection bloom
- direct country/territory selection
- compact trace, rank-volatility, monitoring, and optional trend snippets in the side panel
- visible missing-data state
- source/method caveats close to the score
- full-bleed map-first composition with compact edge controls, following the Dataviz Inspiration audit as principle guidance
- selected geography as an anchor for any future evidence-fingerprint comparison
- direct labels and compact evidence strips for scroll-guided story moments
- five-scene native-scroll default path, with free exploration preserved after the guided story
- selected-place evidence-fingerprint neighbors in the panel only; similarity map wiring and physical connectors are out of scope

## Current Story Inputs

- Primary high-gap story labels: PN, NR, AS, WF, and TV.
- Priority monitoring-gap candidates: PN, NR, AS, and WF.
- AS and WF have missing monitoring rows, so the design copy should frame them as reporting gaps unless externally verified.
- Outlook layers are optional stress-test context and should follow `eda_outlook_interpretation.csv` display recommendations.
- Rankings are fragile for most geographies; avoid interfaces that imply a definitive leaderboard.
- The Dataviz Inspiration audit reinforces map-first, selected-anchor, evidence-strip, direct-label, and evidence-bearing-motion patterns. It should not be used to copy any reference project's visual identity.
- `TASK-048` must correct the current score-input/context count ambiguity before the new evidence mark is implemented.

## Tone

Useful, careful, and Pacific-specific. Avoid blame framing. Use emissions context to explain responsibility mismatch, not to rank moral worth.
