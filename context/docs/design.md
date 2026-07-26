# Design

## Product Frame

The Pacific Climate Evidence Atlas is a map-first exploratory tool. It should feel like a GIS project with a strong analytical spine, not a dashboard pasted onto a map.

The approved guided argument is direct: safely managed drinking-water access and renewable-energy share have changed in different directions across Pacific places, and uneven official-data coverage limits the comparison. See `context/ARTISTIC_REDESIGN_BRIEF.md`.

## Main User Flow

Approved path:

1. User lands on the existing full-basin map with all 22 geography marks visible.
2. The same marks rearrange into the 19 complete water/renewable comparisons while Guam, Pitcairn, and Tokelau remain visible as incomplete.
3. The same marks reorganize into a separate 14-position official-data visibility field.
4. Guided annotation recedes and the accepted explorer returns with layer controls, detail panel, sources, methods, optional index/outlook, and panel-only JSD neighbors.
5. Selecting a place opens the same detail panel and shows three compact observed-record strips before the optional score: water change, renewable-share change, and reviewed datasets represented.

Current implementation boundary:

1. Preserve the existing MapLibre map, fixed-presence marks, fullscreen stage, native scroll, one observer, URL/history, controls, panel, and accessibility behavior.
2. Replace the old title, premise, five guided scenes, Nauru/Tuvalu comparison, rank-band ending, and index-first default.
3. Use one shared regional evidence figure with movement and visibility modes; add no new renderer, chart framework, router, state manager, or animation dependency.
4. Implement the selected-place regional lens with one pure model and one plain React/SVG component over the already loaded `Geo[]`; replace the duplicate summary instead of adding a dashboard, tab system, or second drawer.

## Main Visual Pattern

- fixed-presence centroid-anchored evidence portraits until a reviewed boundary source is chosen
- stable geography identity carried from map to regional fields and back
- separate signed water and renewable-share axes with direct quadrant counts
- 14 ordered evidence-visibility positions with non-color missingness
- direct country/territory selection
- compact trace, rank-volatility, monitoring, and optional trend snippets in the side panel
- visible missing-data state
- source/method caveats close to the score
- full-bleed map-first composition with compact edge controls, following the Dataviz Inspiration audit as principle guidance
- selected geography as an anchor for any future evidence-fingerprint comparison
- direct labels and compact evidence strips for scroll-guided story moments
- four-scene native-scroll contract plus a separate free-exploration handoff
- selected-place evidence-fingerprint neighbors in the panel only; similarity map wiring and physical connectors are out of scope
- selected-place observed dot/rug strips with exact selected values, neutral peer marks, a non-target regional median, and unavailable counts outside each independent scale

## Approved Story Inputs

- All 22 places remain visible; 19 have both Act-I measures and three are explicit incomplete cases.
- Direction counts are 7 water up / renewable down, 6 both up, 3 both down, and 3 water down / renewable up.
- Visibility uses 14 positions per geography: 277 present and 31 absent cells, with 6–14 represented datasets per place.
- Direct-loss presence covers 12/22 places, monitoring and power 18/22, water 19/22, and renewable share 20/22.
- Outlook layers are optional stress-test context and should follow `eda_outlook_interpretation.csv` display recommendations.
- Rankings are fragile for most geographies; avoid interfaces that imply a definitive leaderboard.
- The Dataviz Inspiration audit reinforces map-first, selected-anchor, evidence-strip, direct-label, and evidence-bearing-motion patterns. It should not be used to copy any reference project's visual identity.
- Dataset presence is not evidence quality, preparedness, infrastructure, local knowledge, vulnerability, need, or an outcome.

## Tone

Useful, careful, and Pacific-specific. Avoid blame framing. Use emissions context to explain responsibility mismatch, not to rank moral worth.
