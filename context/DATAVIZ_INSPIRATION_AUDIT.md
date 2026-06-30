# Dataviz Inspiration Audit

## Status

Date: 2026-06-29

Purpose: capture live visual and interaction lessons from Dataviz Inspiration and selected original projects before the next atlas design pass.

Method:

- Used the Codex Chrome extension to open and interact with `https://www.dataviz-inspiration.com/`.
- Inspected the gallery homepage, modal behavior, and chart-type routes.
- Sampled relevant routes: `map`, `choropleth`, `hexbin`, `connection`, `bubbleMap`, `arc`, `ridgeline`, and `heatmap`.
- Opened selected original projects in Chrome and interacted with available controls.
- Treated references as principle studies only. Do not copy layouts, palettes, titles, illustrations, or publication identity.

## Source Links

- Dataviz Inspiration: https://www.dataviz-inspiration.com/
- Dataviz Inspiration map route: https://www.dataviz-inspiration.com/map
- Dataviz Inspiration choropleth route: https://www.dataviz-inspiration.com/choropleth
- Dataviz Inspiration connection route: https://www.dataviz-inspiration.com/connection
- Dataviz Inspiration bubble map route: https://www.dataviz-inspiration.com/bubbleMap
- Dataviz Inspiration arc route: https://www.dataviz-inspiration.com/arc
- Dataviz Inspiration ridgeline route: https://www.dataviz-inspiration.com/ridgeline
- Dataviz Inspiration heatmap route: https://www.dataviz-inspiration.com/heatmap
- Dataviz Inspiration source repo: https://github.com/holtzy/dataviz-inspiration
- Shipmap: https://www.shipmap.org/
- Dataista internal migration in Chile: https://www.dataista.cl/interactivos/migracion-interna
- Show Your Stripes: https://showyourstripes.info/s/globe
- Bruxelles Malade: https://bxl-malade.medor.coop/
- Visual Cinnamon Bussed Out portfolio: https://www.visualcinnamon.com/portfolio/bussed-out/
- Guardian Bussed Out original: https://www.theguardian.com/us-news/ng-interactive/2017/dec/20/bussed-out-america-moves-homeless-people-country-study
- The Pudding airports story: https://pudding.cool/2018/07/airports/

## Gallery Findings

The gallery is useful because it is a visual index, but its greatest value is the modal and route system:

- Homepage states it showcases 423 examples.
- The `map` route showed 68 map projects.
- Sampled route counts in the gallery copy: 25 choropleths, 8 hexbins, 13 connection maps, 12 bubble maps, 3 arc diagrams, 6 ridgelines, and 16 heatmaps.
- Card modals show the full image, chart type pills, context, visualization notes, and a `Visit project` link.
- The modal has next/previous controls and keyboard-arrow copy.
- The gallery is not the final interaction model to copy, but its "browse thumbnail, open evidence rail, visit project" pattern is useful for internal review and possible source-example panels.

Relevant map/environment examples surfaced by route sampling:

- French Rainfall
- Annual rainfall
- Bird migration is changing. What does this reveal about our planet?
- Comparing winters in the US
- Climate stripes
- 2025 was the third hottest year in record
- More days with less Arctic sea ice
- CO2 emissions in Europe
- Climate and Conflict bubble map
- Earthquake around the world
- Shipmap.org
- From here to there: internal migration in Chile
- Population movements in Germany
- Airports and world's megacities
- Bruxelles Malade map, bubble map, cartogram, and heatmap variants
- Mapping the future of the AU-EU partnership infrastructure, night lights, choropleth, and heatmap variants
- Madagascar relief map
- Diet impact by city / region
- Should you take the train or the car?
- How much snow will fall where you live?
- China's rare earth map

## Original Project Studies

### Shipmap

Observed:

- Full-bleed map is the experience, not a card.
- Top edge carries live counters for carbon and freight.
- Bottom edge carries a month timeline.
- `Show`, `Colours`, and `Filters` menus are short domain controls, not large settings panels.
- `Show` expands into layer toggles such as ports, routes, ships, and map.
- `Filters` expands into vessel categories.
- The clock and counters update while the animation advances.
- Motion is evidence-bearing: each moving mark represents ship movement over time.

Atlas adaptation:

- Use full-bleed map as the primary surface.
- Keep global metrics at the map edge only when they are live evidence, such as selected layer counts, high-gap/low-monitoring count, or evidence-density totals.
- Keep layer controls as a small vocabulary: gap, pressure, capacity, monitoring, uncertainty, similarity if implemented.
- If motion is used, it must reveal, compare, or re-encode evidence. No atmospheric particle loops.

Risk:

- Dense motion can become spectacle. The atlas should default to still evidence and use motion only for guided transitions or selected comparisons.

### Dataista Internal Migration In Chile

Observed:

- The page starts with a short explanatory paragraph and a selector.
- Each circle represents a commune.
- Hover shows net migration and arcs.
- Selecting a commune pins it.
- After selection, a second selector appears for pairwise comparison.
- Signed colors separate migration directions.
- The selected state shows a compact metric block: left, arrived, net.
- Sources and methods are visible on the same page.

Atlas adaptation:

- This is the strongest model for selected-geography comparison.
- Evidence Fingerprint Divergence should work the same way: select one geography, then show nearest profiles or choose another geography to compare.
- Similarity should be anchored on a selected place, not shown as a global leaderboard.
- Use signed or paired color roles carefully for pressure versus capacity, but avoid implying migration-like flow unless a real flow is shown.

Risk:

- The custom selector was hard to access until the input was focused. Our selector/list controls should be keyboard and screen-reader friendly from the start.

### Show Your Stripes

Observed:

- Warming stripes provide a highly memorable low-text climate timeline.
- The same data can switch to labelled stripes, bars, or bars with scale.
- The scaled view preserves the visual memory of stripes while adding quantitative axes and units.
- Source, date range, creator, and license are always visible.

Atlas adaptation:

- Add a compact "pressure timeline" or "gap signal strip" inside the country panel only when it is source-backed and small enough not to dominate the map.
- Offer qualitative and scaled modes in future detail panels: simple strip first, explicit axis/units on request.
- Use this as a micro-evidence pattern, not as the main atlas metaphor.

Risk:

- Stripes are iconic. Do not clone the climate-stripes look; translate the idea into a small evidence strip with our own scoring/caveat language.

### Bruxelles Malade

Observed:

- Strong illustrated opening establishes human stakes.
- Language controls and navigation are visible.
- The story asks the reader a question before map/data interaction.
- It uses Mapbox and a range input to personalize the first analytical step.
- The piece is emotionally compelling, but the analytical layer arrives after a long narrative transition.

Atlas adaptation:

- A guided tour can ask a question, but the default atlas must show the map immediately.
- Illustration or art direction can support a guided story mode, not replace the first evidence surface.
- A "what do you think this place shows?" or "what does zero mean?" prompt could work for the monitoring-gap beat.

Risk:

- The atlas should not bury the map behind a cinematic intro. The competition entry needs a fast first evidence read.

### Bussed Out

Observed:

- Portfolio and original article both emphasize a map plus a distribution/timeline.
- The original Guardian piece embeds several canvases inside a narrative article.
- The project combines geography, time, human story, and source-backed investigation.
- The portfolio page records the production process: analysis, story structure, custom visuals, scrollytelling, video, photography, and text.

Atlas adaptation:

- Pair selected geography with a small temporal evidence strip or rank-fragility strip.
- Guided-tour steps can embed compact visual evidence in the panel rather than asking readers to leave the map.
- The human stakes should be present, but the interface should remain exploratory.

Risk:

- Longform scrollytelling can fight the atlas tool goal. Use guided mode as an overlay/path, not as the only way to read the project.

### The Pudding Airports

Observed:

- The opening claim is counterintuitive and anchored to a map with direct labels and arrows.
- The story moves from a map claim into comparative charts.
- Dark theme is used to make blue route lines and labels pop, but the layout stays simple.

Atlas adaptation:

- The tour should open with a map-anchored claim: where the apparent gap is large and where the record is quiet.
- Use direct labels and leader lines for a few exemplars instead of a detached legend-heavy explanation.
- Follow the map claim with country panel decomposition, not a separate dashboard grid.

Risk:

- Dark thematic styling can become one-note. Our palette should avoid becoming only dark blue/teal.

## Common Ground Across Strong Examples

Strong projects repeatedly did these things:

- They made one visual question dominant at a time.
- They used maps as orientation surfaces, not generic backgrounds.
- They placed labels, metrics, or caveats near the evidence they explain.
- They offered controls that match the domain: layers, filters, region selectors, time, or selected-place comparison.
- They allowed a selected entity to become an anchor for detail.
- They made motion or scrolling serve a verb: reveal, compare, accumulate, move, or focus.
- They kept sources and methods discoverable without forcing the reader to start there.
- They used compact visual summaries beside maps: counters, strips, timelines, or small distributions.
- They avoided turning every metric into an equal dashboard tile.

Weak or risky patterns for this project:

- Long intros before evidence.
- Hidden caveats.
- Hover-only interpretation.
- Overly custom selectors without accessible names.
- Motion that looks impressive but does not encode a unit.
- Choropleth-like map styling without reviewed boundaries.
- Global leaderboards that flatten uncertainty.

## Concrete Atlas Design Implications

### Default Atlas View

Keep the map full-bleed and immediately useful. Borrow Shipmap's edge-control discipline, not its density.

Required first-screen elements:

- active layer title,
- short caveat,
- legend for fill, size, and reporting ring,
- source/method button,
- layer controls,
- optional tour button.

### Selected Geography View

Use the Dataista pattern:

- selected geography becomes the anchor,
- second comparison target appears only after selection,
- metrics summarize the selected geography,
- other places re-encode relative to the selected anchor only when the selected comparison mode is on.

This directly supports Evidence Fingerprint Divergence if `TASK-019` ships.

### Data Quiet Layer

Use a map-first version of the Shipmap/Pudding approach:

- top or side summary count for high-gap/low-monitoring cases,
- reporting-status rings on the map,
- direct labels for PN, NR, AS, WF only when this layer is active,
- inline copy that distinguishes reported zero from missing monitoring rows.

### Country Panel Evidence

Add compact strips inspired by Show Your Stripes and Bussed Out:

- rank range strip,
- pressure versus capacity strip,
- optional climate pressure timeline if supported,
- monitoring/status chip.

These should be small panel elements, not the main visual identity.

### Guided Tour

The tour should use Pudding's map-anchored claim style:

1. Show the gap map.
2. Label two or three exemplar geographies directly.
3. Pull pressure and capacity apart.
4. Reveal where data goes quiet.
5. Show rank fragility.
6. Optionally compare evidence fingerprints.

Avoid Bruxelles-style long prelude before evidence.

### Mobile

Mobile lessons:

- The main map or primary visual must appear first.
- Controls should collapse, but active state and caveat stay visible.
- Selection should expose a bottom sheet with the anchor/comparison workflow.
- Avoid hover-only values and inaccessible custom dropdowns.

## Design Questions For Next Mockup Critique

- Does the first viewport make the map the evidence surface, not a hero background?
- Can a reader understand fill, size, and reporting ring without opening a drawer?
- Does selection create an anchor state that can later support JSD similarity?
- Is "data quiet" visually distinct from "low score"?
- Are caveats visible beside claims, not only in the method drawer?
- Does mobile preserve the same claim without stacking controls above the map?
- Is any motion tied to reveal, compare, focus, or re-encode?
- Would the design still communicate in a static screenshot?

## Follow-Up Tasks

- Use this audit during the next visual critique of the current mockup.
- Feed the "selected anchor" and "micro evidence strip" patterns into the next Claude prompt.
- If `TASK-019` ships in the app, explicitly design it around the Dataista selected-commune workflow.
- Do not add a new app dependency from these examples without a separate technical design note.
