# Design Brief

## Status

Task: `TASK-018`

Status: semantic design brief for the approved narrative retrofit. The owner has accepted the existing map, interaction, fullscreen composition, and Explore handoff as the application baseline. `TASK-069` accepted the regional movement -> evidence visibility -> exploration story; `TASK-071` defines the bounded `TASK-072`–`TASK-077` implementation sequence. `context/ARTISTIC_REDESIGN_BRIEF.md` is the active story and visual contract.

Design skill basis:

- `build-web-data-visualization:data-visualization`
- meaning-preserving visual design workflow
- mobile-first responsive visualization
- perception, color, and encoding
- layout hierarchy and self-explanatory UX
- sensitive geopolitical and humanitarian story guardrails
- `context/DATAVIZ_INSPIRATION_AUDIT.md` live reference audit for map, climate, environmental, and selected-geography interaction patterns
- `context/WINNER_SCROLL_TOUR_AUDIT.md` Pacific Dataviz winner audit recommending a scroll-led hybrid

First-build concept status:

- Text contract: accepted as working design context, not final public-facing copy.
- Large-screen mockup concept: implemented for review.
- Mobile portrait mockup concept: implemented for review.
- Mobile landscape concept: optional, recommended if map controls become wide or gesture-heavy.
- Production gate: final methodology, accessibility, deployment, source/provenance, and owner visual review remain before submission readiness. Official scored-geography polygon boundaries remain a future source gate outside the completed MapLibre/Natural Earth visual substrate.

Current concept status:

- Narrative and semantic direction: regional two-act story approved after TASK-068/TASK-069 review.
- TASK-072 transition keyframes: owner approved for composition, story flow, responsive layout, and mark continuity. The current implemented app remains authoritative for palette, typography, controls, panels, map treatment, evidence marks, spacing character, and interaction language.
- Desktop evidence-mark/scene frames: approved in `context/design-concepts/task-049-concept-review.md`.
- Mobile portrait frames: approved in the same concept review; the map remains a sibling surface, not a covered background.
- Historical 28rem rail implementation: complete through `TASK-057`, then returned `needs-fix` by owner visual QA.
- Fullscreen stage concepts: cataloged under `artifacts/design/task-058/`.
- Recommended synthesis: **One Constellation on an Elastic Stage**, using restrained tidal chamber transitions.
- Implementation: `TASK-059` through `TASK-064` are the approved fullscreen/application baseline, and the replacement narrative passed `TASK-077` owner QA on 2026-07-16. `TASK-057` repaired the separately recorded pre-existing release findings and passed independent review.

The current app remains the behavioral and visual baseline. Reuse the fullscreen stage, MapLibre map, marks, controls, panel, URL/history, observer, native scroll, accessibility, and Explore handoff. Change only the minimum generated story fields, guided copy/state, two regional evidence layouts, transition continuity, and guided-only components made obsolete by the new story.

## Public README Editorial Contract

The repository README uses a balanced research-portfolio structure with challenge judges as its first audience and technical reviewers as its second. It describes the finished atlas and its evidence, not the internal process used to build it.

The public opening uses the title **Pacific Climate Evidence Atlas**, the subtitle **How conditions and official records differ across 22 Pacific places**, one direct paragraph explaining the 19 comparable records and uneven 22-place evidence field, the Pacific Dataviz Challenge link, and one current application image. A live-atlas link is added only after a public URL exists.

The reading order is:

1. title, direct thesis, Challenge link, and application image;
2. the stable regional findings: 22 places, 19 complete water/renewable comparisons, the 7/6/3/3 directional split, and the 277-present/31-absent visibility field;
3. the guided story: different directions, unequal visibility, then place-by-place exploration;
4. exploratory capabilities, including selected-place evidence, sources, regional position, and the optional caveated Adaptation Gap Index;
5. official data, descriptive methods, and interpretation limits;
6. concise installation, reproduction, validation, and repository-structure guidance;
7. Challenge attribution and source/provenance links.

The README must not expose task identifiers, task status, owner-review state, implementation chronology, internal handoff language, temporary bundle targets, stale scene counts, or phrases such as “current frame” and “implemented phase.” It avoids badges and ornamental sections that do not help a judge understand or verify the work. It does not advertise unsupported causality, preparedness, vulnerability, data quality, territorial boundaries, or a definitive regional ranking. Stable scientific counts may appear; transient test counts and deployment claims may not.

Recommended GitHub repository description:

> Interactive atlas of changing water access, renewable-energy share, and uneven official data coverage across 22 Pacific places—built for the 2026 Pacific Dataviz Challenge.

## Browser-Tab Identity Contract

The browser favicon is a compact extension of the accepted Night Watch identity, not a new logo system. Use the existing Lucide `Waves` geometry as a standalone SVG with the atlas deep-ocean `#071923` ground and warm mineral `#f6f4ed` strokes. Rounded line caps and a restrained rounded-square field keep the mark legible at browser-tab scale without implying weather, disaster severity, currents, territorial boundaries, or a tourism brand.

Implementation stays static and dependency-neutral: `app/public/favicon.svg` is linked once from `app/index.html` as `image/svg+xml`. Do not add a React component, runtime icon render, raster/favicon generator, manifest, alternate theme variants, animation, text, initials, or new package. The visible application palette, layout, marks, story, and interactions remain unchanged.

## Fullscreen Stage Layout Revision

The map no longer has to remain the largest surface in every guided scene. Visual ownership follows the evidence:

- `map-immersive`: the premise and 22-place orientation use a full-viewport map with large captions over safe ocean space;
- `figure-takeover`: the cross-current field and evidence-visibility field own the usable viewport;
- `explore`: the same marks return to geography and the existing atlas controls become available.

This revision removes the 30rem/28rem rail and 330px rank-chart caps as target constraints. It preserves native scroll, one observer-owned active state, shared evidence marks, URL state, keyboard navigation, reduced motion, and panel-only JSD. See `context/ARTISTIC_REDESIGN_BRIEF.md` for the complete contract.

The old Nauru/Tuvalu and rank-sensitivity takeovers remain implementation history and may be deleted once the replacement fields are integrated and tests prove no runtime reference remains. The toolbar and progress row remain one reachable sticky chrome region; new dense fields must clear it in desktop, portrait, and landscape layouts.

The transition pass preserves continuity through stable `data-code` identity and the existing evidence marks rather than a cross-DOM animation engine. One observer owns both scene activation and the separate return handoff. The handoff and first Explore action use explicit `view=overview`: achromatic marks, overview copy, no pressed score control, no selection, and no outlook. Choosing gap, pressure, or capacity returns to `view=default`; Adaptation Gap is never silently restored as the story's verdict. Scrolling back reapplies the last scene's canonical state. Programmatic progress and keyboard jumps remain immediate, and the existing requested-index guard protects rapid input until pointer/wheel/touch returns ownership to manual navigation. CSS still handles short text arrival and the shared 560ms evidence/field transition, while reduced motion resolves every animated element directly to its static final state.

## Approved Regional Retrofit

The public title is **Pacific Climate Evidence Atlas** with the direct subtitle **How conditions and official records differ across 22 Pacific places.** The reading path is map -> cross-current field -> evidence-visibility field -> map. The same 22 equal-presence marks carry the story.

Visual layer inventory:

| Layer | Analytical job | Primary form | Mobile path | QA invariant |
| --- | --- | --- | --- | --- |
| Pacific orientation | Geography | Existing MapLibre/Natural Earth map with 22 neutral evidence marks | Full-width first viewport; fewer direct labels | 22 marks and 22 accessible geography controls remain present |
| Different directions | Time-change comparison | Full-viewport signed two-axis cross-current field with four quadrant counts and an incomplete rail | One full-width field; direct counts and tap/focus details; no hover-only values | 19 complete + 3 incomplete; counts 7/6/3/3; separate percentage-point axes |
| Unequal visibility | Missingness and record coverage | Full-viewport 22-by-14 evidence field anchored by the same marks | Normal document flow or approved compact arrangement; no nested chart scroll | 277 present + 31 absent; no imputation, composite, quality label, or hidden geography |
| Explore | Lookup and investigation | Existing map, controls, panel, trace rows, methods, optional index/outlook/JSD | Existing single-panel/bottom-sheet flow | Existing functionality and URL/history return intact; neutral handoff default |

The keyframes for desktop, portrait, and mobile landscape are a hard gate in `TASK-072`. They must use the live app as the page context, keep labels and values data-bound, preserve source/caveat placement, and show the reduced-motion still frames. Generated concepts are composition references only; no generated value, island shape, boundary, or label becomes implementation data.

No new renderer is needed. Use the existing React, SVG, CSS, and MapLibre ownership. Add no D3, Canvas, WebGL, chart framework, FLIP/shared-element library, router, or state manager.

### TASK-072 Semantic Design Contract (Owner Approved)

Review references:

| Surface | Board | Semantic viewport represented |
| --- | --- | --- |
| Large screen | `artifacts/design/task-072/large-screen-keyframes.png` (5260×922) | four 1280×800 frames in reading order |
| Mobile portrait | `artifacts/design/task-072/mobile-portrait-keyframes.png` (2220×1247) | four sibling 520×1125 frames based on 390×844 |
| Mobile landscape | `artifacts/design/task-072/mobile-landscape-keyframes.png` (4188×590) | four sibling 1012×468 frames based on 844×390 |

The governing artifact family is a four-state scrollytelling keyframe sequence, not a dashboard. The stable geography code and neutral sunburst/anchor glyph are the continuity keys: the glyph repeats at the centroid, cross-current point, and visibility row header. The boards govern composition and evidence hierarchy only: implement all four states with the current app's existing color tokens, typography, controls, panels, map treatment, evidence-mark styling, spacing character, and interaction language. Do not reproduce the boards' mineral-paper color treatment or any generated visual discrepancy. No generated imagery is an implementation asset: the required image-generation pass informed composition only, while the tracked boards use repository data and current screenshot context.

Label-safe areas and hierarchy:

- Large-screen map and overview keep the claim in the upper-left safe area and leave the basin field dominant; optional Explore controls stay compact at the upper-right.
- Large-screen figure states reserve the upper band for the claim and evidence lock, the center for the full field, and the lower band for caveat and source.
- Portrait keeps the claim first, the main evidence immediately below it, the visibility key after the matrix, and caveat/source at the bottom of the same static state. No controls or prose stack precedes the main figure.
- Landscape places the concise claim at left and gives the remaining width to the active field. It is a sibling composition, not a crop, and it does not ask the reader to rotate.
- Essential identities, quadrant counts, visibility cells, coverage facts, caveats, and sources are always visible; hover may add detail later but never supplies the base claim.
- Cross-current codes use collision-resolved offsets and leader lines where the measured points cluster near zero; landscape axes, incomplete rail, caveat, and source remain legible at the represented 844×390 target.

Locked evidence and fallback contract:

- 22 map identities; 19 complete comparisons and GU/PN/TK incomplete; 7/6/3/3 quadrants.
- Cross-current axes remain separate signed percentage-point changes for safely managed drinking water and renewable-energy share, with zero lines and endpoint/clock caveat.
- Visibility remains 22×14 with 277 present and 31 absent; direct loss 12/22, monitoring 18/22, power 18/22, water 19/22, and renewable share 20/22 are directly labeled.
- Missing visibility uses an open crossed cell in addition to color. Presence is never renamed quality, preparedness, infrastructure, local knowledge, vulnerability, or need.
- Every frame is a complete reduced-motion/static state. Normal motion may only locate, rearrange, expose, or return the stable marks; reduced motion resolves immediately.
- The handoff returns `view=overview`, no selected place/outlook, and no pressed score layer. Existing optional Explore layers remain available after explicit choice.
- Map and overview show only neutral anchor glyphs: no legacy score fill, rank numeral, active-score legend, or duplicate screenshot constellation survives into the concept.

Each PNG records source hashes plus `source_snapshot_commit: f0c6e2e`. The full `geographies.json` hash is deliberately an immutable generation-time snapshot. TASK-073 additively regenerates that file, so post-integration bytes may differ without invalidating the approved composition; TASK-077 rechecks values against the then-current generated contract.

Renderer and state ownership remain unchanged from the retrofit plan: React/SVG/CSS owns the two evidence fields and labels, MapLibre owns the geographic surface, and the existing observer/URL/history system owns scene state. Exact spacing, collision offsets, and breakpoint values may change during TASK-075/TASK-076 only if semantic fidelity to the approved board is preserved.

## Selected-Place Regional Position Lens

The owner selected the **inline regional lens** on 2026-07-25. It extends the regional story at the point where a reader chooses a place, without turning the side panel into a second dashboard or changing the accepted map, palette, typography, Night Watch surfaces, evidence marks, controls, or URL behavior.

### Reading Order

1. Place name, status, and the existing blunt reviewed place note.
2. One evidence-bound sentence that translates the selected place's four-direction combination or incomplete comparison and gives the live regional denominator.
3. A quiet **Regional position** kicker, the sentence-case heading **[place] in the Pacific record**, and a visible **Ring marks [place]** key.
4. Three compact observed-record strips: safely managed drinking-water change, renewable-energy-share change, and reviewed datasets represented.
5. The existing different-clocks and presence-is-not-quality/preparedness caveats beside the strips.
6. One quiet, unboxed score line: Gap · Pressure · Capacity.
7. Existing rank range, score-input presence, monitoring status, and source trace.
8. Existing **Records with a similar shape** evidence-profile comparison, secondary and collapsed by default.

The strips replace the current duplicate regional summary; they do not sit beneath it. The selected-place panel remains one native vertical reading surface. There are no Place/Compare tabs, second drawer, comparison workspace, dashboard grid, or new mode.

### Metric Grammar

The 2026-08-02 owner-approved readability refinement keeps one inline regional lens but stops rendering three different data shapes as identical strips.

- Water and renewable-energy change remain deterministic observed dot/rug strips. They are continuous signed percentage-point changes with nearly unique values: water has 19 recorded places and one two-place tie; renewable energy has 20 recorded places and no ties.
- Dataset visibility becomes a grouped tally because it is a bounded discrete count with only six observed totals. The groups are `6`, `10`, `11`, `12`, `13`, and `14` of 14; 12 of the 22 places share `14 of 14`.
- Keep one flat neutral mark per recorded place in every metric. The selected place remains a larger unfilled teal ring. Inspection receives a separate quiet focus/cursor treatment and never inherits the selected treatment.
- Use deterministic collision stacking only for the rare continuous-value ties. Do not jitter randomly or use collision lanes for visibility; its exact ties are the content of the grouped tally.
- Give each metric a plain title on its own line, then a prominent selected-place readout and a quieter clock. The selected exact value or explicit unavailable state must remain visible without interaction.
- State the unit once beside the selected readout. Continuous endpoints use bare signed numbers. Use human-readable `points` in visible compact copy rather than unexplained `pp`; accessible text may spell out `percentage points`.
- Show zero and the **regional median** as directly bound reference ticks for water and renewable energy only. Each continuous metric keeps its own honest domain and its zero appears at its own truthful position; zero positions and scales are never forced to align across strips.
- Omit a median from visibility. Its median equals its maximum, `14 of 14`, and a grouped distribution plus the direct sentence **12 of 22 places have all 14 reviewed datasets** communicates the record without an overlapping or redundant reference tick.
- Keep nulls and incomplete records out of every numeric arrangement and report their count as **unavailable**. Never place missing values at zero or create off-scale peer controls solely to name missing places.
- Keep all labels, values, clocks, group membership, caveats, and sources code-bound to existing generated data. Concept values and shapes never become application data.

### Interaction And Accessibility

The map remains the place selector in the release-critical experience. Peer inspection is informational only: it cannot change the selected island, move or recenter the map, replace panel content, write URL/history state, or navigate. The teal selected mark remains visible while another observation is inspected. A later name-based entry must first pass TASK-117's live-host design gate; the empty `CountryPanel` is not currently mounted in neutral Explore and is therefore not a valid hidden chooser host.

- Reserve one in-flow inspector line beneath each metric. Its default state reports recorded and unavailable counts. Hover, tap, or keyboard inspection temporarily replaces that text with exact peer detail; no floating tooltip, portal, overlay, or chart-driven layout shift is required.
- Water and renewable inspection names one place, its signed change, and its own first/latest years. It adds no `best`, `worst`, `highest`, `lowest`, percentile, or policy interpretation.
- Visibility inspection operates on an exact-value group. Visible text may truncate a long list with `+N more`, while the accessible text names every place in the group.
- Each plot/tally is one focusable interaction surface rather than one Tab stop per mark. Left/Right steps through sorted continuous observations or ordered visibility groups. Focus begins at the selected record when available; Escape restores the default inspector line. Do not add undiscoverable shortcut keys or timers.
- Pointer and touch use one approximately 44px-high plot band with nearest-observation or group hit testing. Tap inspection remains until Escape, focus loss, a tap elsewhere, or a new map selection; ordinary pointer leave may clear non-sticky hover inspection.
- The interaction surface has a concise group name and keyboard instructions. The reserved inspector line is a polite atomic live region; selection and focus remain distinguishable without color, motion, or glow.

Desktop and mobile have nearly the same plot width; the mobile constraint is the bottom sheet's vertical budget. Preserve the same reading order in both states, shorten spacing and plot height before removing evidence, and abbreviate only after the full unit has been established. No metric receives horizontal scrolling. Existing collapse, Close, Back, focus restoration, 44px primary controls, reduced motion, and `place=<code>` URL/history behavior remain unchanged.

### Semantic Boundaries

The lens answers one question: **where does the selected place sit within the observed Pacific record?** It does not say why a value changed and does not infer preparedness, data quality, completeness, vulnerability, need, importance, environmental condition, or local knowledge. Water and renewable endpoints retain their separate clocks and descriptive/non-causal framing. Visibility remains a fixed 14-position presence count, not a score. Group size describes how many places share a recorded total; it is not a rank, grade, or comparison of readiness.

The optional Gap, Pressure, and Capacity line remains clearly modeled and subordinate to the observed strips. JSD nearest neighbors continue to answer the different secondary question, **which official-data evidence profiles have a similar shape?** They remain panel-only, non-causal, non-geographic, and outside the regional-position strips.

### Approved Typography, Wording, And Rhythm Correction

Owner review of TASK-110 accepted the lens's data, structure, plots, and informational-only interaction but did not accept its reading rhythm. Fresh desktop, portrait, landscape, and 320px measurements showed a concrete hierarchy defect: the 11px metric title sits below inherited 16px unit and clock text; the floated clock becomes detached and baseline-misaligned; complete measures have only 11px between them and 4px inside them; all SVG annotations remain 9px; the renewable +0.01 median paints only 0.068 CSS px from zero at 390px; and the nominal 44-unit SVG band renders at 39.05 CSS px when the 320px viewport leaves a 284px plot.

Use the approved **Direction A+** correction. It retains one vertical, card-free lens and the 24px selected value. Every measure and the section heading use one intentional `min(100%, 320px)` centered column. Metric titles start at 12.5px serif/600; selected numbers remain 24px sans/700; units and clocks become 11px soft sans text in one wrapping, baseline-aligned flex row. Unavailable remains explicit at 13px with its explanation on a separate 10px line. Desktop rhythm is 18px between measures, 3px inside a measure, and 5px before its plot; the existing mobile media seam compacts those values to 13px, 2px, and 4px. General SVG text becomes 10px and visibility group values 11px. The visibility inspector reserves two lines so inspection never moves later content. A same-state screenshot may reduce titles once to 12px only if 12.5px competes with the 24px value, and that measured correction must be recorded in TASK-111 QA. Remove unused lens-label rules rather than adding a card, rule, breakpoint system, or layout wrapper.

Use shorter, direct visible wording while preserving full scientific meaning in accessible summaries and Methods:

- **Safely managed drinking water** — selected signed `points` value plus `Change · 2000–2020`-style period.
- **Renewable energy share** — selected signed `points` value plus its independent `Change · firstYear–latestYear` period.
- **Reviewed datasets with a record** — selected `N of 14` plus **12 of 22 places have records in all 14 reviewed datasets**.
- Continuous default inspector: **N places with comparable change · M unavailable**.
- Selected self-inspection: **Selected place · [name]: [signed value] points · [firstYear]–[latestYear]**.

The compact visible labels do not authorize a shared clock, a level claim, or shorter caveats. Accessible summaries still say that continuous values are first-to-latest changes in percentage points and name complete year ranges. `points` remains the visible unit; unexplained `pp` stays prohibited.

Use a learnable, non-color-dependent mark grammar without moving data:

- zero is a thin solid reference;
- the regional median is a sparse dashed reference;
- active inspection is a heavier solid, non-teal cursor;
- the visibility group cursor is a solid, non-teal outline;
- the selected place remains the only unfilled teal ring.

At the 320px application floor, preserve the existing SVG viewBoxes, visible coordinates, and plot widths. Increase only the transparent hit rectangles from 44 to 50 viewBox units, centered on the same interaction region, so their scaled CSS height remains at least 44px. Do not distort the SVG, add overflow, create an HTML overlay, add per-mark focus stops, or branch on viewport size in JavaScript. The current 39.05px band is a failure of this project's stronger 44px policy; it is not described as a Challenge rule or an automatic WCAG 2.2 AA failure.

Do not adopt the rejected alternatives: reducing the selected value to 19px reverses the approved hierarchy; warning-colored unavailable text overstates ordinary record absence; dividing metrics with repeated rules or a landscape two-column grid turns the panel toward dashboard grammar. The panel-wide 808px landscape line measure is a separate possible panel-shell decision, not authority for this lens task.

### Evidence-Editorial Closure Contract (TASK-113; Owner Approved)

The owner approved the direction and paired contract on 2026-08-18. TASK-113 records the accepted composition references and binding implementation contract:

- `artifacts/design/task-113/desktop-panel-concept.png`
- `artifacts/design/task-113/mobile-panel-concept.png`

The boards show hierarchy and reading order, not final pixels. Their generated names, values, land shapes, map labels, exact type metrics, spacing, and visible row slices are schematic. They are not runtime assets and no text or number may be copied from them without the code-bound contract below. The current application remains the authority for Night Watch color, map treatment, controls, surfaces, evidence plots, panel behavior, and accessibility.

**Narrative hierarchy.** Replace the generic modeled `storyLabel` prominence with one deterministic regional-record reading. It states first-to-latest direction, not a continuous trajectory or cause, and derives its complete denominator from loaded `completeOverlap` values and its matching count from the selected quadrant. The lens then begins with the small `--ink-soft` sans kicker **Regional position**, followed by the restrained serif heading **[place] in the Pacific record**. A compact visible key—an unfilled teal ring plus **Ring marks [place]**—makes the selected-mark grammar understandable without hover. The sentence is the interpretation; the heading is orientation; the three existing readouts remain the numeric center. Teal belongs only to the ring in this intro, not the kicker or heading.

**Typography and emphasis.** Keep the current system-sans and Georgia roles. Serif is reserved here for the place name and editorial lens heading; metric labels move locally to semibold system sans, and values, clocks, key, annotations, and interaction text remain system sans with tabular numerals. Do not introduce a global font, webfont request, self-hosted font bundle, text highlighter, badge, left chapter rail, colored number, or new surface. Teal continues to mean interaction/selection and appears in the ring, not as an evaluative highlight on the place name or values. Selected values remain 24px sans and no global type token changes.

**Responsive composition.** Desktop keeps one native vertical panel, and the complete intro joins the existing centered `min(100%, 320px)` measure column. Portrait and the 320px floor keep the same semantic order; they may compact gaps but may not remove the sentence, heading, key, selected values, caveat, or sources. Long names may wrap naturally; keep the ring attached to **Ring marks** on the first key line rather than stranding it above a wrapped name. The mobile board is a vertical composition study, not a requirement to fit all content in one viewport. Landscape remains one column and native page flow; no two-column dashboard grid or nested lens scroller is authorized.

**Guided ending.** The existing handoff must end with the two-sentence finding and boundary recorded in `context/STORY_BRIEF.md`, followed by the unchanged **Explore the map** action. Keep its eyebrow, state reset, composition, and behavior. Add no scene, quote, slogan, claims carousel, or new figure.

#### Name-Based Place Entry (TASK-117 Design Decision)

The A–Z idea addresses a real map-hunting problem, and the live-host audit confirms why the empty `CountryPanel` was never a valid answer: neutral Explore leaves `panelOpen` false, so the dock is absent; forcing it open would reserve 400px on desktop, mount the mobile sheet before it is requested, and expose the fallback title **Rank ranges**. Real neutral captures at 1440x900, 390x844, 844x390, and 320x568 retain 22 map targets, no panel, and zero horizontal overflow.

Two live-app-derived directions were compared. A native select placed permanently in the header is the fewest-code option, but it grows the header by 76–81px at every measured size and turns a map introduction into a standing form. The selected direction is instead one visible **Places** action in the existing Explore header. It opens the existing dock only on request, with the exact title **Places**, a native 44px **Pacific place** select, and a plain statement that alphabetical order is for finding—not ranking need, readiness, or vulnerability. Desktop reserves the existing 400px only while the picker is open; portrait, landscape, and the 320px floor use the existing expanded sheet and body scrolling. Matched concepts and measurements live under `artifacts/design/task-117/`.

The picker is an ephemeral disclosure, not a route or second explorer. Opening it focuses the native select and writes no history. Close restores the **Places** trigger. Choosing a loaded stable code removes the picker, calls the existing `handleSelect`, and focuses the selected panel's Close control so removed form focus cannot fall to the document. Direct selected URLs and diagnostic root/child Back/Close behavior remain unchanged; the Places action is shown only when no selected or diagnostic panel owns the dock. Popstate closes the disclosure before canonical URL hydration. Loading/error/zero-loaded-record states remain owned by the current app-wide gate, so no empty or disabled picker is invented.

TASK-117 changes no runtime file. TASK-118 is the single bounded implementation successor and begins only after the held TASK-110/TASK-100 release gates. It may add one local disclosure boolean and trigger ref through existing `App.tsx`, panel, CSS, and test seams, but no custom combobox, search dependency, URL parameter, alternate selected code, panel stack, drawer, camera behavior, data change, or dashboard shell.

**Locked versus flexible.** Locked: current palette and surfaces; selected-ring meaning; exact data and plot grammar; one-panel reading order; sentence/heading/key/ending wording; semibold system-sans metric labels; URL/history behavior; no global font or new figure. Flexible after measured review: local gaps, line wraps, exact kicker letter spacing, and a 16–17px local heading size. Any flexible choice must preserve the 24px value as the first numeric read and pass the existing 320px, portrait, landscape, reflow, contrast, focus, touch, and overflow gates. TASK-117 resolves the name-entry host in design only; TASK-118 remains outside production until the held release QA is complete.

### Implementation Boundary

Reuse `Geo.regionalStory` and the already loaded `Geo[]` collection. Extend the existing pure regional-position model and plain React/SVG component in place. The model already owns per-observation clocks and deterministic exact-value groups; TASK-111 and TASK-112 do not change it. The component may keep small internal inspection state that never escapes the lens. Add no pipeline output, public-data field, API, D3/Visx dependency, renderer, router, reducer, global comparison state, or new dashboard shell.

The current built CSS is 95,474 bytes and JavaScript is 1,042,934 bytes. The checker uses 97,500/1,050,000-byte provisional internal regression thresholds, not Pacific DataViz Challenge rules. Delete and reuse styles when that leaves a clearer product, but do not weaken correctness, accessibility, or the approved composition to preserve a few raw bytes. The CSS threshold update from 95,000 to 97,500 remains an explicit measured allowance for the clean continuous-inspector implementation, not an external ceiling. Minification tricks and obscured code are rejected.

## Historical Implemented Direction: The Shape Of What We Know

The currently implemented guided design is governed by the idea below. It is superseded as a public narrative by the approved regional retrofit, but its evidence-mark, fullscreen, native-scroll, accessibility, and panel-only JSD decisions remain reusable:

> Official records illuminate the Pacific unevenly. Those gaps change what the atlas can responsibly compare, rank, and conclude.

The major design decisions are:

- five guided scenes plus a short return-to-explore handoff;
- native document scroll with a sticky map and one observer-confirmed active scene;
- equal-footprint evidence portraits instead of evidence-size bubbles;
- eight fixed score-input positions, one detached responsibility-context tick, an outer monitoring edge, and an inner score field;
- missing evidence shown as breaks and open positions, never by making a place smaller;
- paired pressure/visible-capacity forms, aligned Nauru/Tuvalu portraits, and a composed rank-band field;
- one shared 450–650ms evidence-motion language with a complete reduced-motion equivalent;
- JSD retained in the selected-place panel but removed from the guided spine and map connectors;
- a contemporary scientific ocean-chart art direction: near-black Pacific blue, subdued cartographic texture, coral/terracotta gap, Pacific blue pressure, sea-glass capacity, mineral-white editorial type;
- no appropriation of Indigenous Pacific visual motifs; culturally grounded expansion requires Pacific co-design.

TASK-049 locks the evidence-mark values: 44px circular evidence portraits with a 20px inner field and eight 5px radial ticks; score-input order is sea-surface temperature, surface temperature, rainfall, sea level, directly affected persons, monitoring network, power generation, fisheries management; the detached context tick sits at 4:30; reporting edges are continuous, open-dash, or broken-dot; motion uses 560ms with `cubic-bezier(0.22, 1, 0.36, 1)`; and the type stacks remain Georgia plus the system sans stack. Its 28rem desktop copy cap and universal 46svh mobile map are historical rail values superseded by TASK-058 stage ownership. All concept frames remain composition studies and never override generated data values.

`context/ARTISTIC_REDESIGN_BRIEF.md` is the complete design source of truth. The older implementation remains documented where useful, but the active target uses four guided scenes plus a separate handoff, native document scroll, fixed evidence marks, two regional evidence modes, and panel-only JSD.

## External Inspiration Guardrails

Use the Dataviz Inspiration audit as a principle study, not a moodboard to copy.

Patterns to preserve:

- Shipmap: full-bleed map as the primary surface, compact edge controls, layer/filter menus that match the domain, and motion only when it encodes evidence over time.
- Dataista internal migration: selected geography becomes the anchor; a second comparison target appears only after selection. This is the right interaction pattern for app-wired Evidence Fingerprint Divergence.
- Show Your Stripes and Bussed Out: compact evidence strips, timelines, counters, or distributions can support the country panel without replacing the map.
- The Pudding airports story: open guided explanation with a map-anchored claim, direct labels, and leader lines rather than a detached dashboard grid.
- Bruxelles Malade: human stakes and guided questions can help, but the atlas must not delay the first evidence read behind a long cinematic intro.
- Pacific Dataviz winner audit: recent custom winners lean toward scroll stories or long-form visual essays; use guided scroll to earn attention, then hand readers into the atlas explorer.

Patterns to avoid:

- copying palettes, layouts, illustrations, publication identity, or iconic stripe treatments;
- long pre-map intros;
- hover-only explanation;
- hidden caveats;
- inaccessible custom selectors;
- decorative motion that does not reveal, compare, focus, or re-encode evidence.

## Design Objective

Build a map-first guided atlas that shows how safely managed drinking-water access and renewable-energy share changed in different directions across Pacific places, then shows how unequal official-data visibility limits that comparison.

The app should feel like a careful GIS tool with a guided scroll story path. It should not feel like a landing page, generic dashboard, leaderboard, or decorative scrollytelling essay.

## Analytical Job

Primary analytical job:

- Time change and regional comparison: show the 19 complete water/renewable endpoint comparisons across four direction combinations while keeping all 22 places visible.

Secondary analytical jobs:

- Missingness: show the separate 14-position visibility record without converting presence into a quality or preparedness score.
- Similarity: show which official-data evidence profiles resemble a selected geography, using `TASK-019` artifacts.
- Explore: preserve optional gap, pressure, capacity, uncertainty, outlook, and panel-only JSD inspection after the guided story.
- Decomposition: show why a selected geography scores the way it does.
- Guided explanation: use scroll-driven story beats to walk users through the story without hiding exploration.

Data shape:

- Geospatial point features with tabular properties.
- Country/detail JSON records.
- EDA CSV tables for monitoring, rank volatility, spatial typology, and outlook interpretation.
- Divergence tables for evidence fingerprints, pairwise JSD, and nearest neighbors from `TASK-019`.
- Optional time-scenario fields for outlook.

Artifact family:

- Interactive web atlas with guided scroll tour, layer controls, side panel, source/method drawer, and mobile bottom sheet.

Primary route:

- MapLibre map plus React/TypeScript UI. The current implementation uses Natural Earth visual land context and generated centroid fallback points; reviewed scored-geography boundary geometry can be added only after source, license, and geopolitical review.

Fallback route:

- Static centroid map plus country cards if map interactivity becomes unstable late in the sprint.

## Evidence Lock

Every visible score, label, and caveat should trace to one of these sources:

| Visual Surface | Primary Source | Evidence Status |
| --- | --- | --- |
| Water/renewable cross-current | `eda_regional_crosscurrents.csv`, generated `regional_story` geography fields | separate first-to-latest percentage-point endpoint comparisons |
| Evidence-visibility field | `eda_regional_feature_matrix.csv`, generated `regional_story.visibility` positions | dataset presence/missingness, not quality or preparedness |
| Gap score | `data/processed/app/geographies.json`, `artifacts/tables/adaptation_gap_index.csv` | modeled comparative screen |
| Pressure/capacity scores | `data/processed/app/geographies.json` | modeled comparative screen |
| Indicator detail | `data/processed/app/country_details.json` | measured/latest official rows plus derived scores |
| Monitoring status | `artifacts/tables/eda_monitoring_gap.csv` | measured reporting status / proxy count |
| Rank uncertainty | `artifacts/tables/eda_rank_volatility.csv` | sensitivity stress test |
| Evidence fingerprint divergence | `artifacts/tables/eda_evidence_fingerprints.csv`, `artifacts/tables/eda_pairwise_jsd.csv`, `artifacts/tables/eda_similarity_neighbors.csv`, `artifacts/provenance/divergence_summary.json` | information-theory diagnostic over official-data-derived profiles |
| Spatial typology | `artifacts/tables/eda_spatial_typologies.csv` | rule-based descriptor |
| Subregion caption | `artifacts/tables/eda_subregion_comparisons.csv` | small-sample descriptive summary |
| Outlook | `artifacts/tables/eda_outlook_interpretation.csv`, `adaptation_gap_outlook.csv` | stress-test display guidance |
| Responsibility context | indicator trace rows with responsibility role | context-only, not score driver |

No visual element may imply:

- precise boundaries,
- causal attribution,
- a definitive vulnerability ranking,
- infrastructure absence from missing rows,
- future prediction from outlook,
- moral blame from responsibility context,
- causal or policy-need equivalence from evidence-profile similarity.

## First View

The first screen is the atlas itself, with the native guided scroll path over the full-basin map.

Large screen first load:

- Full-bleed Pacific map.
- Explicit `overview` view with 22 achromatic evidence marks and no pressed score control.
- Small top-left title block with the direct subtitle.
- Layer controls available but visually subordinate until Explore.
- A compact orientation key rather than an Adaptation Gap legend.
- Source/method access visible.
- Detail panel collapsed until selection or scroll-tour step.
- Caveat visible near the premise: endpoints use separate clocks and do not explain causes.

Mobile first load:

- Map visible in the top portion of the viewport.
- Overview title and premise caveat visible above or over the map.
- Bottom sheet collapsed to a compact handle with layer state.
- Legend accessible through a chip, not occupying the whole first screen.
- Main map appears before deep controls.

## Information Architecture

### Global Regions

1. Map canvas
2. Layer and overlay controls
3. Legend / encoding key
4. Guided tour controls
5. Country detail panel
6. Methodology and source drawer

### Reading Order

Default reading order:

1. Where am I? Pacific map frame.
2. What am I seeing? Active layer title and caveat.
3. What differs? Point fill, size, and ring encodings.
4. Why should I trust or question it? Legend, rank fragility, source drawer.
5. What is behind a place? Country detail panel and indicator trace.

The design should not require users to parse all controls before understanding the default state. The first scroll beat should name one claim and one caveat while the map remains visible.

## Map Grammar

### Geometry

V1 uses Natural Earth land context for orientation plus centroid point features for scored/selectable geographies.

Required cue:

- Include "Natural Earth land context; scores use centroid fallback, not boundary geometry" in the legend or source drawer.

Do not use scored polygon choropleths until a boundary source is chosen, license-checked, and documented.

### Point Encoding

Each point can carry three simultaneous meanings:

1. Fill color: active score layer.
2. Primary footprint: fixed-size presence mark; evidence density is carried by the eight ordered score-input positions and does not shrink a geography's visual importance.
3. Ring or pattern: monitoring/reporting status.

Correction and redesign note:

- `TASK-048` replaced the ambiguous `included_indicator_count` with explicit score-input, context-only, and total trace counts. Responsibility context remains visible in trace data but is never described as a score input.
- The next evidence mark does not use radius for evidence density. It keeps a fixed overall footprint and renders eight stable input positions, missing positions as open cuts, a detached context tick, and monitoring state on the outer edge.

Initial size guidance:

- Test a restrained range before locking size. Start around 8px to 18px on desktop and 9px to 20px on mobile.
- Avoid the 7px to 24px range unless visual QA shows it does not overpower color or make low-evidence places look unimportant.

Post-TASK-042 design direction:

- Literal Natural Earth island geometry is valuable context, but it is too small to be the primary score mark at Pacific-basin zoom. Atoll geographies such as NR, TV, KI, and MH can become nearly invisible if land area carries the whole encoding.
- `TASK-043` restored a guaranteed-size primary data mark anchored to the scored centroid. Treat it as a "presence" mark: score color, evidence size/intensity, and monitoring/reporting status remain legible before land texture is considered.
- Natural Earth land should become secondary texture or context inside/under the presence mark where available. It should not be the only thing that carries the data encoding, and it still must not imply official boundaries.
- The selected viewfinder from TASK-035 is retired. Selected state now relies on the guaranteed-size presence mark and selected bloom rather than framing empty water.
- `TASK-046` moved official-data visibility before the formula in the guided tour and kept JSD as a late selected-detail beat. `TASK-047` added restrained selected-only neighbor arcs. Keep them only if owner visual QA agrees they read as official-data profile similarity rather than physical connection, causality, migration, shared risk, or decorative network.

Selection state:

- Do not use another data-like ring for selection because rings already encode reporting status.
- Use a bracket, halo offset, label callout, or short leader line for selection.
- TASK-035 accepted treatment: a viewfinder frame of four achromatic corner brackets around a fixed geographic window (about 1.6 degrees, pixel-clamped), never fitted to land, with a dotted tick from the circle edge to the nearest visual island and an on-surface note "map area, not territory". TASK-038 grouped land polygons to their nearest scored centroid for selected-place highlighting only. TASK-039 then made anchored island shapes inherit score/status styling and hide centroid circles once land context loads. TASK-043 supersedes that visual direction: the viewfinder is removed, guaranteed-size presence marks carry the primary score/status symbol, and Natural Earth land stays as subdued texture/context so atolls are not under-inked by their tiny land area.

Hover/focus state:

- Desktop hover may preview name and active score.
- Mobile must use tap/selection, not hover.
- Keyboard focus must reach points through list or step-through controls if direct map keyboard navigation is impractical.

## Explore Layer Hierarchy

### Default Explore View

Regional overview:

- State: `view=overview`, no selected geography, no outlook, and no pressed score control.
- Purpose: preserve geographic orientation and reader agency after the guided story.
- Encoding: achromatic equal-presence marks; no score is visually active.

### Optional Score Layers

Adaptation gap:

- Field: `adaptation_gap_score`.
- Purpose: optional caveated exploration of the existing comparative screen.
- Caveat: not a rank of need, vulnerability, or readiness.

Climate pressure:

- Field: `climate_pressure_score`.
- Purpose: expose one side of the gap.

Visible capacity:

- Field: `capacity_score`.
- Purpose: expose the other side of the gap.
- Caveat: capacity is a proxy from official datasets, not full readiness.

### Visibility Overlay

Monitoring/data visibility:

- Source: `eda_monitoring_gap.csv`.
- Key fields: `monitoring_reporting_status`, `monitoring_coverage_tier`, `monitoring_quadrant`, `story_priority`, `missing_reporting_caveat`, `proxy_caveat`.
- Purpose: inspect reported-zero or missing monitoring records without calling them infrastructure absence or preparedness.

### Secondary Layers

Uncertainty:

- Source: `eda_rank_volatility.csv`.
- Key fields: `rank_range`, `scenario_rank_min`, `scenario_rank_max`, `robustness_label`.
- Purpose: prevent leaderboard reading.

Subregion / spatial typology:

- Source: `eda_spatial_typologies.csv`, `eda_subregion_comparisons.csv`.
- Purpose: let users inspect regional texture.
- Caveat: statistical grouping, not cultural or political boundary.

Evidence fingerprint divergence:

- Source: `eda_evidence_fingerprints.csv`, `eda_pairwise_jsd.csv`, `eda_similarity_neighbors.csv`, and `divergence_summary.json`.
- Default: off until a geography is selected.
- Primary metric: base-2 Jensen-Shannon divergence, bounded from 0 to 1.
- Purpose: show which geographies have similar official-data evidence profiles and where similar gap scores hide different profiles.
- Interaction rule: anchor the view on a selected geography; do not show a global similarity leaderboard.
- Required caveat: "Similarity means official-data profiles look alike under this method; it does not mean the places share the same vulnerability, lived experience, or policy need."
- Component families: pressure, visible capacity, data visibility, rank fragility, missing data, and monitoring reporting gap. Missingness/status components are visible evidence, not smoothing residue.
- KL divergence is not required for public UI interpretation.

### Optional Layer

Outlook:

- Source: `eda_outlook_interpretation.csv` and app outlook fields.
- Default: off.
- Rule: `show` rows may render normally; `show_with_strong_caveat` rows render only with visible caveat styling; `withhold` rows do not render as map marks and are explained as withheld.
- Caveat: stress-test interpretation, not forecast.

### Do Not Build As Map Layers In V1

- Global rank leaderboard.
- Responsibility/emissions map ramp.
- Boundary choropleths without reviewed boundaries.
- Withheld outlook rows as normal map marks.
- JSD/KL clusters as natural regions or causal groups.

## Missingness And Monitoring Grammar

Monitoring states should be visually and verbally distinct.

| `monitoring_reporting_status` Value | Example Geographies | Visual Treatment | Required Copy |
| --- | --- | --- | --- |
| `reported_positive_latest_count` | TV and other visible-monitoring cases | filled or standard ring | "Latest official monitoring row is present; count may still omit station quality, continuity, siting, and reporting completeness." |
| `reported_zero_latest_count` | PN, NR, NU | hollow or dashed ring | "Latest official monitoring row reports 0; verify source semantics before interpreting this as no monitoring infrastructure." |
| `missing_monitoring_dataset_row` | AS, WF, MP, GU | dotted ring plus hatch or broken outline | "No monitoring rows in processed official data; treat as a reporting gap, not confirmed absence." |

The signature overlay can dim score color to grayscale and emphasize reporting rings, but the everyday score map should still carry subtle evidence-density and reporting-status cues.

## Country Detail Panel

Field order:

1. Geography name and status/context note.
2. Active story label or selected layer title.
3. Adaptation gap score with rank-range chip.
4. Pressure versus capacity mini comparison.
5. Compact evidence strips for pressure/capacity balance and rank fragility.
6. Evidence density: included indicators, dataset count, row count.
7. Monitoring/reporting status with caveat.
8. Evidence fingerprint summary and nearest neighbors, if the similarity mode ships in the app.
9. Top pressure signals and capacity signals.
10. Indicator trace drawer.
11. Responsibility context, if relevant, labeled context-only.
12. Outlook snippet, only when selected and allowed.
13. Source links and method caveats.

TASK-036 regroup: the thirteen fields above now render as three reading groups - the score (name, story label, score block with rank band, at-a-glance strip), "The two sides of the score" (pressure/capacity bars plus strongest signals with a percentile explainer), and "What the record shows" (monitoring status, indicator count with thin-evidence caution, trace drawer). No field was removed; headers use the guided tour's spoken register.

Panel rules:

- Caveats sit beside the number or label they qualify.
- No bare rank appears without rank range or robustness label.
- Missingness is a visible state, not only a footnote.
- Detail panel copy should use "visible capacity," "proxy," "reporting gap," and "stress test" consistently.

## Guided Tour

The tour is the default first-reading path. It behaves like a scroll-led atlas mode, not a separate article above the atlas. The map remains visible for the premise/orientation; the two regional fields receive the viewport when comparison or visibility is the active question.

The free-explore atlas remains available through a persistent "Explore freely" control and as the final state after the guided path.

Approved target steps:

1. What the records show.
2. Twenty-two Pacific places.
3. Different directions.
4. Unequal visibility.
5. Return the marks to `overview` and hand off to Explore freely.

Implemented sequence being replaced:

1. What the map can see.
2. Where the record breaks.
3. The gap has two sides.
4. Similar scores, different records.
5. The order does not hold still.
6. Return the marks to geography and hand off to Explore freely.

JSD does not receive a guided scene. Exact neighbors remain selected-place panel evidence in free exploration.

Tour controls:

- Existing sticky progress controls plus native document scroll and keyboard navigation.
- Persistent "Explore freely" escape hatch.
- Each step names the claim, evidence source, and necessary caveat.
- Reduced-motion mode should use immediate state changes, not animated transitions.
- Keyboard navigation should advance/reverse beats without requiring scroll wheel precision.

## Color Role Ledger

These are semantic roles, not final locked colors. TASK-072 may refine them without changing their meaning.

| Role | Purpose | Draft Direction | Notes |
| --- | --- | --- | --- |
| Ocean / map context | orientation | deep muted blue-green or charcoal ocean | quiet enough for points and labels |
| Land / context geometry | orientation | low-contrast neutral | do not compete with points |
| Overview | geographic identity | achromatic mineral/slate field | no active score implication |
| Water change | signed percentage-point change | clear Pacific blue with direct axis labels | keep its own zero line and years |
| Renewable-share change | signed percentage-point change | sea-glass green with direct axis labels | keep its own zero line and years |
| Gap magnitude | optional ordered Explore score | warm sequential ramp | avoid alarm-red dominance; never guided default |
| Pressure magnitude | ordered score | cool blue sequential ramp | distinct from gap |
| Capacity magnitude | ordered score | green or teal sequential ramp | do not imply "safe" without caveat |
| Missing/reporting status | data quality state | stroke, dash, hatch, shape | separate from score color |
| Uncertainty | rank movement | neutral to purple or neutral to amber | test for colorblind accessibility |
| Similarity/divergence | selected-geography comparison | restrained sequential ramp or stroke intensity | never a global rank ramp |
| Selection | interaction state | callout, bracket, halo, label | not another data ring |
| Caveat/warning | interpretive caution | muted amber or icon+text | never only color |
| Disabled/withheld | unavailable/withheld layer | low-opacity gray plus text | explain why |

Color QA:

- WCAG AA for text.
- At least 3:1 contrast for meaningful non-text marks.
- Grayscale check.
- Color-deficiency check.
- No rainbow ramps.
- No decorative glow unless mapped to focus/selection.

## Typography And Tone

Typography direction:

- Body and UI: highly legible system sans-serif with tabular numerals; do not declare an unloaded webfont.
- Display: optional characterful serif or restrained display face for tour claims, used sparingly.
- Current implementation uses explicit CSS font variables for the system sans stack and restrained Georgia display headings.

Chrome direction:

- Keep the map as the primary surface: floating controls should be useful, compact, and visually quiet.
- Prefer shared translucent chrome treatments over bright dashboard cards.
- Do not restore the removed explore-mode metrics strip unless it carries a concrete reader decision that is not already visible in the map, legend, or detail panel.

Tone:

- careful,
- clear,
- Pacific-specific,
- not fatalistic,
- not bureaucratic,
- not blame-driven.

Avoid:

- "worst,"
- "most vulnerable,"
- "definitive,"
- "prediction,"
- "absence of infrastructure" when describing missing rows,
- moral ranking language.

## Desktop Layout Contract

Desktop target:

- Primary design around 1280px to 1440px wide.

Layout:

- Full-bleed map.
- Top-left title and active layer chip.
- Left or top-left layer controls, compact.
- Right side detail panel around 360px to 420px when open.
- Bottom-left legend, compact and adjacent to map marks.
- Bottom-right method/source controls and compact scroll-tour progress/escape controls.

Panel behavior:

- Closed by default.
- Opens on selection or tour step.
- Does not cover the selected point if avoidable.
- Dims non-selected points during country inspection.

Legend behavior:

- Always explains fill, size, and ring.
- Adapts to active layer.
- Keeps missingness key visible or one tap away.

## Mobile Layout Contract

Mobile portrait target:

- 360px to 430px wide.

First view:

- Map remains visible before deep controls.
- Active layer and caveat visible.
- Bottom sheet collapsed but discoverable.

Mobile structure:

- Map top around 50vh to 60vh.
- Bottom sheet for layer controls and country details.
- Legend collapses into a chip or short expandable key.
- Tour stepper docks above bottom sheet or inside sheet header.

Approved regional mobile replacement:

- Use a sticky map around 42–48svh during geographic scenes.
- Put story sections in normal document flow so dense comparisons cannot be covered by fixed controls.
- Use a compact exploration toolbar after the handoff; keep the country-detail sheet separate from guided scene copy.
- Render cross-current and visibility fields as vertically complete static/stepped figures at narrow widths, with all 22 identities and explicit incomplete/missing states.

Mobile interaction:

- Tap selects points.
- Previous/next selected geography control helps users avoid tiny tap targets.
- Layer switches use segmented controls or concise menus.
- Search can exist later, but keyboard must not hide the only apply/close action.

Mobile QA:

- No hover-only values.
- Touch targets should be at least 44px where practical.
- Text and caveats remain legible without horizontal scrolling.
- Opening controls should not permanently hide the map.
- Reduced-motion mode must preserve every tour step.

## URL And State

Minimum shareable state:

- guided/explore mode,
- active layer,
- selected geography,
- active scene,
- overview/default/coverage/uncertainty view,
- outlook on/off and horizon if implemented.

The back button should not trap users inside panels or tour states.

`TASK-057` provides dependency-free query parsing/serialization and Back/Forward behavior for the functioning five-scene baseline, including guided/explore mode, scene, layer, view, place, and outlook state. TASK-074 replaces scene IDs and adds `view=overview` without adding a router or query key; TASK-076 makes that state visually neutral. No divergence map mode or subregion filter is part of the contract.

## Accessibility Contract

Essential information must not depend on:

- hover,
- color alone,
- animation,
- exact point tapping,
- a hidden source drawer.

Required accessibility surfaces:

- keyboard-reachable layer controls,
- keyboard-reachable country list or selected-geography stepper,
- visible focus states,
- reduced-motion behavior,
- text alternative for the active map state,
- source and caveat text in HTML, not baked into images,
- mobile hit target review.

Map alt summary pattern:

> Map of 22 Pacific geographies shown as centroid points. Active layer: [layer]. The map is a comparative screen, not a definitive ranking. Selected geography: [name], [short score/caveat summary].

## Source And Method Drawer

The drawer should contain:

- project thesis,
- score method summary,
- dataset list,
- geometry policy,
- monitoring proxy caveat,
- rank-fragility explanation,
- evidence-fingerprint/JSD explanation if the layer ships,
- outlook explanation,
- responsibility-context explanation,
- source and license notes,
- claims the app will not make.

The drawer is not allowed to be the only place where load-bearing caveats appear.

## Data Binding Contract

| UI Surface | Data File | Required Fields |
| --- | --- | --- |
| Regional movement field | `app/public/data/geographies.json` | nested `regional_story` water/renewable first/latest years, signed changes, overlap flag, quadrant |
| Regional visibility field | same | 14 ordered `regional_story.visibility` positions with feature ID, label, role, presence, latest year |
| Neutral overview | same | `geo_code`, `name`, centroid, stable evidence-mark fields; no score encoding active |
| Gap map | `app/public/data/geographies.json` | `geo_code`, `name`, `adaptation_gap_score`, `score_input_indicator_count`, `context_indicator_count`, `trace_indicator_count`, `score_input_presence`, `score_status` |
| Pressure/capacity map | same | `climate_pressure_score`, `capacity_score` |
| Centroid geometry | same | `centroid.lon`, `centroid.lat`, `geometry_status` |
| Country panel | `app/public/data/country_details.json` | geography fields, scores, `indicators[]`, source refs |
| Monitoring status | `app/public/data/geographies.json` | `monitoring.reporting_status`, `monitoring_quadrant`, `story_priority`, caveats |
| Rank chip | `artifacts/tables/eda_rank_volatility.csv` or derived app JSON | `rank_range`, `scenario_rank_min`, `scenario_rank_max`, `robustness_label` |
| Evidence fingerprint similarity | `eda_similarity_neighbors.csv`, `eda_pairwise_jsd.csv`, `eda_evidence_fingerprints.csv` or derived app JSON | selected `geo_code`, neighbor `geo_code`, `jsd_distance`, `similarity_band`, profile family, caveat |
| Subregion filter | `eda_spatial_typologies.csv`, `eda_subregion_comparisons.csv` | `subregion`, typology, counts, caveats |
| Outlook | `eda_outlook_interpretation.csv`, nested `outlook` in app data | `display_recommendation`, `target_year`, `scenario`, projected scores, caveats |

TASK-073 packages the approved regional fields into app-ready JSON; runtime code must not fetch research CSVs directly from `artifacts/`.

## Component Inventory

Protected or planned React components:

- `AtlasMap`
- `atlasMapModel`
- `MapOverlay`
- `EvidenceMark`
- `LayerControls`
- `MapLegend`
- `CountryPanel`
- `IndicatorTrace`
- `RankChip`
- `MissingnessKey`
- `MethodDrawer`
- `StoryScrolly`
- `StoryScene`
- `SceneProgress`
- `RegionalEvidenceScene`
- `SubregionFilter`
- `OutlookToggle`
- `SourceNote`

Renderer ownership:

- The current app uses MapLibre for the map canvas, Natural Earth land context, generated centroid point source, and graticule lines. React overlays still own direct labels, hatching/dashed monitoring cues, selected brackets, graticule labels, and accessible geography hit targets.
- React owns controls, panel, legend, drawer, native-scroll story state, regional evidence fields, and source/caveat copy.
- Labels and caveats should remain editable HTML/SVG overlays, not raster text.

## Motion Contract

Allowed motion:

- short layer cross-fades,
- selected-point emphasis,
- map-to-field rearrangement and field-to-map return,
- visibility-position reveal,
- optional Explore uncertainty or selected-anchor re-encoding.

TASK-044 added the first evidence-bearing motion pass: native MapLibre paint transitions for layer re-encodes, selected-mark focus, priority emphasis, and anchored-land texture, plus subtle selected-camera focus. Reduced-motion mode collapses map motion to zero and disables the added CSS transitions. Decorative ocean shimmer, alarm pulses, and rising-water metaphors remain out unless a matching data layer makes them honest.

Motion verb:

- locate,
- rearrange,
- expose,
- return.

Shipmap is the reference for evidence-bearing motion: movement is acceptable only when each moving state represents a unit, time step, transition, or selected comparison that the reader can explain.

Do not use:

- decorative particle motion,
- wave/ribbon atmospherics,
- pulsing alarm effects,
- cinematic intro animation that delays the map.

Reduced motion:

- replace transitions with immediate state changes,
- preserve all labels and caveats.

## Historical Visual Concept Prompts For Claude

The prompts below document the earlier Adaptation Gap concept phase and must not be used for `TASK-072`. New keyframes follow the approved regional retrofit above and the active contract in `ARTISTIC_REDESIGN_BRIEF.md`.

### Large-Screen Concept Prompt

Design a large-screen concept for the Pacific Adaptation Gap Atlas, a map-first interactive GIS web visualization with a scroll-led default reading path. The first viewport is the actual atlas, not a landing page. Show a full-bleed Pacific map with Natural Earth land context, centroid points, and a narrative scroll rail that advances one evidence claim at a time. The active opening layer is adaptation gap. Fill color encodes the active score, point size subtly encodes included indicator count, and ring/dash/hatch styling encodes monitoring/reporting status. Include compact layer controls, a useful legend, method/source drawer access, scroll-tour progress, an "Explore freely" escape hatch, and a right-side country detail panel state that appears on selection or scroll beat. The concept must preserve caveats near the claims they qualify: comparative screen, not a ranking of need; Natural Earth land context with centroid score geometry, not official boundaries; reported zero and missing rows are not infrastructure absence. Make it visually polished and competition-ready, but restrained and evidence-bearing. Avoid generic dashboards, decorative gradients, bokeh, cinematic wallpaper, flags as decoration, and any choropleth boundary styling.

### Mobile Portrait Concept Prompt

Design a mobile portrait concept for the same atlas at 390px width. The map must remain visible on first load, with active layer title and caveat visible. Use a bottom sheet for layer controls and country details. Show how a user taps a centroid, opens a concise country panel, sees the rank-fragility chip, and can access the missingness legend. Essential information must not depend on hover. Preserve the same story as desktop: adaptation gap plus official-data visibility, with caveats adjacent to claims. Avoid squeezing the desktop layout into a tiny dashboard.

### Optional Mobile Landscape Prompt

Design a mobile landscape concept only if the map controls or scroll-tour rail need more horizontal room. Preserve the map as the dominant surface, keep the bottom or side sheet compact, and show how touch targets remain usable without hiding caveats.

## Historical Claude Visual Review Criteria

Approve a visual concept only if:

- it uses the inspiration audit as principle guidance without copying a reference project,
- the first screenshot explains the atlas without hover,
- the map is the main surface,
- caveats are visible near active claims,
- the legend teaches fill, size, and reporting status,
- missingness is distinguishable from low score,
- mobile is a sibling design, not a squeezed desktop crop,
- no decorative atmosphere competes with evidence,
- color roles remain distinct,
- source/method access is visible,
- selected geography detail is readable.

Reject or revise a concept if:

- it looks like a generic dashboard,
- it hides the map behind cards,
- it treats missing data as merely gray or empty without explanation,
- it creates leaderboard vibes,
- it implies boundaries we do not have,
- it makes outlook feel predictive,
- it uses one saturated palette for everything,
- it makes caveats feel like legal fine print.

## Build QA Checklist

Before claiming the app design is implemented:

- desktop screenshot preserves the story and caveats,
- mobile portrait screenshot preserves the story and caveats,
- color contrast passes text and meaningful-mark checks,
- color-deficiency check preserves score/missingness distinction,
- the movement field reproduces 19 complete + 3 incomplete and 7/6/3/3,
- the visibility field reproduces 277 present + 31 absent across 14 positions,
- separate water/renewable axes show units and years,
- overview renders no active score or pressed score control,
- every optional score retains trace/source access,
- evidence-fingerprint similarity, if enabled, has a visible anchor geography and caveat,
- monitoring missingness copy uses the correct reporting-gap language,
- source drawer is reachable by keyboard,
- controls are usable at 360px width,
- reduced-motion mode keeps all tour beats,
- static screenshots of overview, movement, visibility, and Explore communicate the thesis without animation.

## Out Of Scope For V1 Design

- Boundary polygon choropleth for scored geographies.
- Expanded non-official overlays.
- New index methodology.
- JSD/KL similarity as a primary story layer.
- Live data fetching.
- Bilingual interface unless explicitly requested.
- Automated funding, readiness, or vulnerability recommendations.
- A full country leaderboard.

## Final Design Principle

The design succeeds if readers understand two things without learning an index first: Pacific places have not moved in one shared direction, and the official record does not show every place equally. Exploration can then expose the Adaptation Gap Index and other caveated evidence without turning any one layer into a verdict.

## Explorer UX Revision: Reversible Evidence Exploration

Owner QA on 2026-07-17 accepted the guided story and visual identity but found four Explorer problems that interrupt the handoff:

1. The final handoff action stretches across the story grid and reads as an oversized banner rather than a deliberate button.
2. Selecting a place inside **Data coverage** or **Rank ranges** replaces the parent explanation without a way to return to it.
3. Closing a diagnostic detail currently returns to a different state and can leave a history entry that immediately reopens the dismissed panel.
4. At narrow widths, the two score groups remain visible while primary evidence-view controls can sit beyond unmarked horizontal overflow.

The selected-place panel also stops the new regional story too early. Water, renewable-energy share, and the 14-position official-record visibility evidence already exist in the generated geography contract, but the panel does not surface them.

### Alternatives Considered

| Direction | Benefit | Cost | Decision |
| --- | --- | --- | --- |
| Patch each close button and breakpoint locally | Smallest initial diff | Duplicates navigation logic and leaves inconsistent browser history | Reject |
| Add a router, reducer, or navigation stack | Formal state transitions | New machinery for states the app already owns; higher migration and bundle cost | Reject |
| Reuse `viewMode`, `selectedCode`, and the URL adapter behind one shared panel-navigation row | One behavior contract, direct-link support, no dependency | Requires focused App and panel integration tests | Approve |

### Interaction Hierarchy

The Explorer keeps its existing map, visual identity, score layers, evidence views, source/method access, and URL model. The revision changes only how a user moves through the existing states and what a selected place summarizes.

| Current state | Visible navigation | Back result | Close result |
| --- | --- | --- | --- |
| Neutral or score view + selected place | Close | Not shown | Clear selection; preserve the current map view |
| Data coverage root | Close | Not shown | Return to neutral overview |
| Rank ranges root | Close | Not shown | Return to neutral overview |
| Data coverage + selected place | Back to data coverage; Close | Clear selection; restore the parent data-coverage panel | Clear selection and return to neutral overview |
| Rank ranges + selected place | Back to rank ranges; Close | Clear selection; restore the parent rank-ranges panel | Clear selection and return to neutral overview |

Back is contextual: it restores the immediately visible parent evidence explanation. Close is terminal for the current panel path. These meanings must remain distinct in text, focus order, URL state, and tests.

Entering an evidence view and selecting an ordinary place remain explicit `pushState` actions. Selecting a place from Data coverage or Rank ranges is an intra-panel drill-down and uses `replaceState`; the visible Back control reconstructs the parent from the retained `viewMode`. Back and Close also use `replaceState`. This prevents an earlier diagnostic-root entry from sitting immediately behind a dismissed child while preserving copied URLs and ordinary Back/Forward traversal.

### Shared Panel Navigation

Use one sticky navigation row inside the existing panel dock:

- show **Back to data coverage** or **Back to rank ranges** only for diagnostic child details;
- always expose a labelled **Close** control;
- keep the existing expand/collapse handle reachable on mobile;
- use the existing 44px minimum touch target, focus-ring, typography, surface, border, and color tokens;
- move close ownership out of `CountryPanel` so parent and child surfaces cannot disagree;
- return focus to the action that opened the dismissed surface when practical, without adding a focus-management library.

Do not add breadcrumb trails, a global reset button, an app router, or a second state machine.

### Responsive Control Contract

Primary Explorer actions may not depend on unmarked horizontal scrolling.

- **Desktop/tablet:** keep the current compact dock and existing visual hierarchy.
- **Mobile portrait:** render two complete 44px action rows. Row one contains the three score layers. Row two contains Data coverage, Rank ranges, and the 2030 stress test.
- **Mobile landscape:** render one compact row with shorter visible labels while accessible names retain the full meaning.
- At 360px, every primary action must be visible, keyboard/touch reachable, and free of overlap with the map, panel dock, or system-safe area.

The handoff action becomes content-width, uses the plain label **Explore the map**, and remains at least 44px high. Remove the stale desktop-only **Concept for review** notice and any equivalent temporary review copy.

### Place-Level Evidence Continuation

The selected-place panel begins with a concise regional-record summary before the optional Adaptation Gap score:

- signed drinking-water change in percentage points with its first/latest years;
- signed renewable-energy-share change in percentage points with its first/latest years;
- explicit **Unavailable for a comparable period** language when either measure is null;
- represented dataset count out of the fixed 14-position visibility record;
- the adjacent caveat that the measures use different clocks, the comparison is descriptive and non-causal, and dataset presence is not quality, completeness, preparedness, vulnerability, need, or a local-knowledge substitute.

Use the existing nested `regionalStory` fields. Do not add a data pipeline, new score, new endpoint calculation, or new app-data field for this revision.

### Scope Boundaries

The first revision deliberately excludes search, copy-link UI, global reset, saved places, a new navigation dependency, a new design system, and any palette/type/map/mark restyling. Search and copy-link may be reconsidered only if the owner QA matrix still shows a concrete navigation problem after the core repair.

### Acceptance Contract

The revision is complete only when:

- the handoff button reads as a normal action at all target widths;
- every open panel state has a visible Close action;
- diagnostic child details have a visible, correctly labelled Back action;
- Back restores the exact parent evidence view and Close returns to the correct terminal state;
- dismissal does not reopen the same panel on the next browser Back action;
- copied diagnostic-child URLs restore deterministically;
- all six primary Explorer actions are visible at 360px portrait and 844x390 landscape;
- country summaries reproduce existing generated water, renewable, year, null, and visibility fields without changing their meaning;
- keyboard, focus, touch, 200% zoom, reduced-motion, offline/error, and seven-viewport checks pass;
- the approved palette, typography, map, evidence marks, story, panels, and interaction language remain visually authoritative.
