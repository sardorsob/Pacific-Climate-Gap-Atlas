# Design

## Product Frame

The Pacific Adaptation Gap Atlas is a map-first exploratory tool. It should feel like a GIS project with a strong analytical spine, not a dashboard pasted onto a map.

## Main User Flow

1. User lands in the guided scroll atlas with the map already visible.
2. User advances through seven evidence beats or chooses "Explore freely."
3. Guided mode changes the same map state used by the explorer.
4. Explore mode reveals layer controls, detail panel, metrics, and source/method access.
5. User clicks a geography centroid to inspect climate signal, observed stress, capacity, missingness, rank uncertainty, and sources.

## Main Visual Pattern

- centroid-first point map layers for gap, pillar, monitoring, and story-priority scores until a boundary source is chosen
- direct country/territory selection
- compact trace, rank-volatility, monitoring, and optional trend snippets in the side panel
- visible missing-data state
- source/method caveats close to the score
- full-bleed map-first composition with compact edge controls, following the Dataviz Inspiration audit as principle guidance
- selected geography as an anchor for any future evidence-fingerprint comparison
- direct labels and compact evidence strips for scroll-guided story moments
- scroll-led hybrid default path, with free exploration preserved after the guided beats
- selected-place evidence-fingerprint neighbors only; full similarity map wiring remains out of scope

## Current Story Inputs

- Primary high-gap story labels: PN, NR, AS, WF, and TV.
- Priority monitoring-gap candidates: PN, NR, AS, and WF.
- AS and WF have missing monitoring rows, so the design copy should frame them as reporting gaps unless externally verified.
- Outlook layers are optional stress-test context and should follow `eda_outlook_interpretation.csv` display recommendations.
- Rankings are fragile for most geographies; avoid interfaces that imply a definitive leaderboard.
- The Dataviz Inspiration audit reinforces map-first, selected-anchor, evidence-strip, direct-label, and evidence-bearing-motion patterns. It should not be used to copy any reference project's visual identity.

## Tone

Useful, careful, and Pacific-specific. Avoid blame framing. Use emissions context to explain responsibility mismatch, not to rank moral worth.
