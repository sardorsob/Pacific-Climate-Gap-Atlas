# Claude Mockup Instructions

## Purpose

You are Claude, joining the Pacific Adaptation Gap Atlas project for the visual mockup revision phase after `TASK-018`, `TASK-020`, and the first reviewable mockup.

Your role for this phase is builder/designer for `TASK-022`. Codex is the orchestrator and QA reviewer. Codex is also the only agent that will stage, commit, or push accepted work. The project owner will review the mockups visually and give approval or critique before implementation planning continues.

Your goal is to revise the existing React/Vite mockup into a more polished, reviewable atlas experience. The mockup does not need full production data wiring. It does need to make the story, layout, interaction states, caveats, and mobile treatment visible enough for critique.

## Hard Rules

Do not push code.

Do not commit code.

Do not add co-author trailers.

Do not run `git commit`, `git push`, `git reset --hard`, `git checkout --`, or destructive cleanup commands.

Do not change the data methodology, score logic, analysis scripts, generated artifacts, or raw data.

Do not present the mockup as final or approved. It is a concept for review.

Do not hide caveats in a source drawer only. Load-bearing caveats must appear next to the claims they qualify.

Do not create a landing page. The first screen is the atlas experience.

Do not build a global country leaderboard.

Do not use polygon choropleths. Current geometry is centroid fallback.

Do not imply missing monitoring rows mean there is no infrastructure.

Do not frame outlook as a forecast.

Do not use responsibility/emissions context as a blame map.

Do not present Evidence Fingerprint Divergence or JSD/KL similarity as a shipped layer unless Codex has generated and reviewed `TASK-019` artifacts. If mocked, label it as planned/pending and keep it anchored on a selected geography, not a global leaderboard.

Do not use generic decorative atmosphere such as bokeh, glowing orbs, cinematic wallpaper, wispy ribbons, broad decorative gradients, or stock-like haze that does not carry evidence.

## Current Assignment

You are working on `TASK-022: Claude visual revision pass for atlas mockup`.

Before editing, read `context/plans/mockup-revision-delegation-plan.md` and `context/plans/task-021-mockup-critique.md`.

Your expected revision targets are:

- make the first viewport read as a working atlas, not a dashboard;
- strengthen the full-bleed Pacific map composition;
- make layer controls compact and domain-specific;
- use direct labels or leader lines for key story exemplars;
- make selected geography feel like an anchor state;
- add or improve compact evidence strips in the country panel;
- make "Where the Data Goes Quiet" visibly distinct from low-score states;
- improve mobile bottom sheet hierarchy while keeping the map visible;
- preserve caveats next to claims;
- avoid copying any audited reference project's visual identity.

## Collaboration Contract

You can create or edit mockup files in the repo, but Codex will review all changes before anything is committed.

At the end of your work, provide:

- changed file list,
- how to run or view the mockup,
- what viewports you checked,
- what is static/nonfunctional,
- what should be reviewed by the project owner,
- any risks or open decisions.

Do not stage, commit, or push. Leave the working tree with your changes for Codex to inspect.

## What To Read First

Read these files in this order before designing:

1. `context/STORY_BRIEF.md`
2. `context/DESIGN_BRIEF.md`
3. `context/DATAVIZ_INSPIRATION_AUDIT.md`
4. `context/plans/mockup-revision-delegation-plan.md`
5. `context/plans/task-021-mockup-critique.md`
6. `context/storyboardbrainstorm.md`
7. `context/ANALYSIS_BRIEF.md`
8. `context/docs/design.md`
9. `context/DATA_CARD.md`
10. `context/MODEL_CARD.md`
11. `context/INFORMATION_DIVERGENCE_PLAN.md`
12. `context/TASKS.md`, especially `TASK-006`, `TASK-018`, `TASK-019`, `TASK-020`, `TASK-021`, `TASK-022`, `TASK-023`, and `TASK-024`
13. `README.md`

Then inspect the current app scaffold:

1. `app/package.json`
2. `app/src/App.tsx`
3. `app/src/main.tsx`
4. `app/src/styles/base.css`
5. `app/src/components/map/AtlasMap.tsx`
6. `app/src/components/controls/LayerControls.tsx`
7. `app/src/components/panels/CountryPanel.tsx`
8. `app/src/lib/layers.ts`

Then inspect available app data:

1. `app/public/data/atlas_geographies.geojson`
2. `app/public/data/geographies.json`
3. `app/public/data/country_details.json`
4. `app/public/data/layers.json`
5. `app/public/data/monitoring_network.geojson`

You may also inspect these EDA tables when you need exact exemplar/caveat fields:

- `artifacts/tables/eda_country_story_labels.csv`
- `artifacts/tables/eda_monitoring_gap.csv`
- `artifacts/tables/eda_rank_volatility.csv`
- `artifacts/tables/eda_spatial_typologies.csv`
- `artifacts/tables/eda_subregion_comparisons.csv`
- `artifacts/tables/eda_outlook_interpretation.csv`

## Current Story To Preserve

The atlas story is:

> Across 22 Pacific geographies, climate pressure and visible adaptation capacity are unevenly matched, and so is the official data behind the comparison. This atlas maps where the gap looks widest and is honest about where the record falls silent.

The mockup should make this visible without needing a long explanation.

The story hierarchy is:

1. Adaptation gap map first.
2. Missingness and monitoring visibility as the signature interaction.
3. Rank uncertainty visible wherever ranks appear.
4. Caveats beside the claims they qualify.
5. Outlook optional and gated.

## Inspiration Audit To Preserve

Use `context/DATAVIZ_INSPIRATION_AUDIT.md` as principle guidance. Do not copy a reference project's look, palette, illustration style, title, animation, or publication identity.

Patterns worth carrying into the mockup:

- Full-bleed map first, inspired by Shipmap's map-as-interface discipline.
- Compact edge controls for layers, filters, source/method, and tour actions.
- Selected geography as an anchor, inspired by Dataista's internal migration workflow. A second comparator or similarity list appears only after a place is selected.
- Compact evidence strips in the detail panel for pressure/capacity balance, rank fragility, or data visibility.
- Direct labels and leader lines for the guided story, especially when introducing high-gap/data-quiet exemplars.
- Motion only when it reveals, compares, focuses, or re-encodes evidence.

Patterns to avoid:

- long cinematic intro before the map,
- custom selectors that are hard to focus or use with keyboard,
- hover-only values,
- copied climate-stripe styling,
- dark one-note palettes,
- dashboards where every metric becomes an equal card,
- decorative animations that do not encode data.

## Mockup Deliverables

Create reviewable mockups for:

1. Large-screen atlas default view.
2. Large-screen selected-country view.
3. Large-screen "Where the Data Goes Quiet" or monitoring/data-visibility view.
4. Mobile portrait default view.
5. Mobile portrait selected-country or bottom-sheet view.

Optional if time permits:

6. Uncertainty view.
7. Outlook off/default plus optional gated-on state.
8. A second visual direction if you think the first direction is too conservative.

The mockups can be built as React/CSS screens inside the current app. They do not need full MapLibre functionality yet. A static or semi-static map composition is acceptable if it is honest about being a mockup.

## Recommended Implementation Approach

Use the existing Vite/React app as the mockup surface.

Prefer editing or adding files under:

- `app/src/App.tsx`
- `app/src/styles/base.css`
- `app/src/components/...`
- `app/src/lib/...`

If useful, add mockup-only helpers under:

- `app/src/mock/`

Examples:

- `app/src/mock/mockAtlasPoints.ts`
- `app/src/mock/mockStoryData.ts`

Use real exemplar values where practical, but do not overbuild a data pipeline. For this phase, a small static fixture with NR, TV, AS, PN, MH, FJ, and WF is enough if it makes the visual states reviewable.

Do not modify:

- `analysis/`
- `scripts/`
- `data/raw/`
- `data/processed/`
- `artifacts/`
- `configs/`
- package files unless absolutely necessary

Avoid adding new dependencies. The app already has:

- React
- TypeScript
- Vite
- MapLibre GL
- lucide-react

If you believe a new dependency is necessary, stop and explain why instead of installing it.

## Visual Requirements

The mockup must feel:

- map-first,
- GIS-flavored,
- careful,
- polished,
- Pacific-specific,
- competition-worthy,
- exploratory rather than dashboard-heavy.

The mockup must not feel:

- like a marketing landing page,
- like a generic admin dashboard,
- like a static poster,
- like a leaderboard,
- like a climate doom page,
- like a decorative wallpaper with data pasted over it.

## First Screen Requirements

The first viewport must show:

- a Pacific map surface,
- adaptation gap as the active layer,
- centroid points,
- the atlas title or wordmark,
- a short thesis line,
- active layer title,
- a visible caveat: "Comparative screen, not a ranking of need. Most ranks are fragile.",
- a legend that explains fill, size, and reporting-status ring,
- source/method access,
- layer controls.

Do not make a hero intro before the map.

Do not put the map inside a decorative card. The map is the main surface.

## Map Mockup Requirements

V1 uses centroid points only.

Every point should be able to communicate:

1. Fill color: active score.
2. Size: evidence density or included indicator count.
3. Ring/dash/hatch: monitoring/reporting status.

Required reporting-status visual distinctions:

- visible or reported-positive monitoring: standard filled point or standard ring,
- reported-zero latest monitoring: hollow or dashed ring,
- missing monitoring rows: dotted ring, broken ring, hatch, or another clearly separate non-color cue.

Do not use color alone to distinguish missingness.

Do not use selection as another data ring. Use a bracket, callout, halo offset, leader line, or label treatment.

Map note somewhere visible or in the legend:

"Centroid fallback, not boundary geometry."

## Large-Screen Layout Requirements

Desktop target:

- Design for around 1280px to 1440px width.

The layout should include:

- full-bleed map,
- compact layer controls,
- active layer/caveat chip,
- useful legend,
- right-side detail panel when selected,
- source/method drawer button,
- guided tour button or stepper.

The country panel should not cover too much of the map. Around 360px to 420px width is the starting target.

## Mobile Layout Requirements

Mobile target:

- 360px to 430px portrait width.

Mobile first view must keep the map visible.

Use a bottom sheet or similar mobile pattern for:

- layer controls,
- legend details,
- selected country details,
- tour step text.

Do not simply stack the desktop left rail above the map.

No hover-only values. Tap/focus must reveal information.

Touch targets should be large enough to critique realistically. Use 44px as the practical target where possible.

## Country Panel Requirements

The selected-country mockup should include Nauru as a strong default exemplar, and should make it easy to compare with Tuvalu.

Panel order should be:

1. Place name and context note.
2. Active story label.
3. Adaptation gap score with rank-range chip.
4. Pressure versus visible capacity comparison.
5. Evidence density.
6. Monitoring/reporting status with caveat.
7. Top pressure/capacity signals.
8. Indicator trace teaser.
9. Source/method links.

Required copy examples:

- "Rank movement frames uncertainty and should not be read as definitive."
- "Latest official monitoring row reports 0; verify source semantics before interpreting this as no monitoring infrastructure."
- "No monitoring rows in processed official data; treat as a reporting gap, not confirmed absence."
- "Capacity is measured through official proxies, not full readiness."

Do not show a bare rank without uncertainty.

## Signature Interaction: Where The Data Goes Quiet

This is the most important mockup state after the default view.

It should show:

- PN, NR, AS, and WF as the high-gap / low-monitoring group,
- the difference between reported-zero and missing monitoring rows,
- an inline caveat near the state,
- a legend that teaches the difference,
- a panel or callout titled something like "Why is this blank?" or "What does zero mean?"

Required meaning:

Data absence is an inspectable finding, not a hidden limitation.

Forbidden meaning:

No data equals no infrastructure.

## Uncertainty Treatment

Somewhere in the mockup, show how rank uncertainty appears.

Minimum:

- rank chip: "Rank moves 1-7 under stress tests" or similar,
- robustness label such as "fragile,"
- explanatory microcopy.

Optional:

- an uncertainty layer state where point colors switch to rank range.

Do not make uncertainty feel like a legal disclaimer. Make it feel like a useful inspection mode.

## Outlook Treatment

Outlook is optional in the mockup.

If included:

- make it off by default,
- label it "stress test,"
- never call it forecast,
- show `show_with_strong_caveat` as visibly caveated,
- do not render `withhold` rows as normal marks.

If it makes the mockup feel crowded, leave outlook out and note that it is deferred.

## Color And Style Guidance

Use a color-role ledger, not vibes.

Roles to preserve:

- neutral ocean/map context,
- adaptation gap magnitude,
- climate pressure magnitude,
- visible capacity magnitude,
- reporting/missingness status,
- uncertainty,
- selection/focus,
- caveat/warning,
- disabled/withheld.

Good direction:

- quiet ocean-forward basemap,
- restrained but distinctive data colors,
- direct labels where helpful,
- subtle grid/graticule or map-line texture for GIS flavor,
- strong enough contrast for review screenshots.

Avoid:

- rainbow ramps,
- one-hue everything,
- purple-blue gradient dominance,
- decorative glows,
- background atmospherics that carry no data,
- saturated red doom palette,
- national flags or political colors as decoration.

## Typography Guidance

Use legible UI typography.

You may introduce a more characterful display type idea in CSS if it does not harm readability, but do not depend on external font downloads unless already available or easy to fall back.

Use tabular numerals where useful.

Do not make panel headings hero-sized. The hero is the map.

## Accessibility Requirements

Even for mockups:

- essential values must not be hover-only,
- color must not be the only encoding,
- caveats must be actual text,
- mobile text must fit,
- controls need visible focus styles,
- meaningful icons need labels or accessible names.

## What You Can Fake

For this mockup phase, you may fake:

- exact map projection,
- point coordinates if needed for composition,
- layer switching behavior,
- country selection state,
- bottom-sheet interaction,
- tour state,
- drawer open/closed state,
- final data plumbing.

But you may not fake:

- the story,
- the caveats,
- the distinction between reported-zero and missing monitoring rows,
- the fact that geometry is centroid fallback,
- rank fragility,
- outlook being only a stress test.

## Suggested Mock Data

Use these exemplar roles if creating a small fixture:

- NR, Nauru: broad-evidence high-gap, reported-zero monitoring, rank fragile.
- TV, Tuvalu: high-gap with visible monitoring, useful contrast.
- AS, American Samoa: high-gap reporting gap, missing monitoring rows.
- PN, Pitcairn: highest gap, thin evidence/data-desert caveat, withheld outlook.
- MH, Marshall Islands: rank instability exemplar.
- FJ, Fiji: lower relative gap / higher visible capacity benchmark.
- WF, Wallis and Futuna: secondary reporting-gap example.

Use actual values from `STORY_BRIEF.md`, `DESIGN_BRIEF.md`, or EDA tables when easy. If you use approximate values for layout, label them as mock data in code comments or a mock data file.

## Code Quality Expectations

Keep mockup code clean and easy for Codex to review.

Prefer:

- small components,
- clear prop names,
- CSS classes with obvious roles,
- static fixture data separated from components,
- no hidden network dependencies,
- no huge single component if avoidable.

Comments are okay when they explain mockup-only choices.

Do not over-engineer production data loaders.

## File Scope Suggestions

Good file targets:

- `app/src/App.tsx`
- `app/src/styles/base.css`
- `app/src/components/map/AtlasMap.tsx`
- `app/src/components/controls/LayerControls.tsx`
- `app/src/components/panels/CountryPanel.tsx`
- new `app/src/components/...` files for legend, method drawer, tour, or mockup panels
- new `app/src/mock/...` files for sample data

Avoid touching:

- Python analysis files,
- EDA generation scripts,
- generated data/artifacts,
- repo workflow files,
- package files,
- git config,
- ignored workflow kits.

## Verification You Should Run

Run what is reasonable for the app mockup:

```powershell
npm --prefix app run build
```

If dependencies are missing, report that clearly and do not hide the failure.

If you start a dev server for visual review, tell Codex the URL and how you started it. Do not leave long-running processes unmanaged.

If possible, inspect at:

- desktop around 1440x900,
- tablet-ish around 900x700,
- mobile portrait around 390x844.

If you cannot inspect screenshots, say so.

## Final Response Format

When you finish, respond with:

1. Summary of mockup direction.
2. Files changed.
3. How to run/view.
4. What is intentionally static or fake.
5. Desktop/mobile states completed.
6. Checks run and results.
7. Items for project-owner critique.
8. Risks or open questions for Codex QA.

Again: do not commit, do not push, do not stage for commit unless explicitly asked by Codex.

## Codex QA Will Check

Codex will review:

- visual alignment with `STORY_BRIEF.md`,
- visual alignment with `DESIGN_BRIEF.md`,
- caveat placement,
- missingness encoding,
- rank uncertainty visibility,
- mobile layout,
- text fit,
- build result,
- no unrelated file edits,
- no co-author or commit metadata.

Only after project-owner approval and Codex QA will Codex stage, commit, and push accepted work.
