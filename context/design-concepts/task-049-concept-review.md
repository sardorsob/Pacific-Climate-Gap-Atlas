# TASK-049 Concept Review: The Shape of What We Know

Date: 2026-07-10  
Baseline commit: `e7e6c08`  
Baseline app: current seven-beat atlas, before TASK-050 through TASK-055

## Baseline captures

The current implementation was run from the local Vite server at `http://127.0.0.1:5173/` and captured with the browser harness at the exact target viewports. The baseline frames are retained under `artifacts/design/task-049/baseline/`:

| State | Desktop | Mobile |
| --- | --- | --- |
| First view | `baseline/baseline-desktop-scene-01.png` (1440×900) | `baseline/baseline-mobile-scene-01.png` (390×844) |
| Data quiet | `baseline/baseline-desktop-scene-02.png` (1440×900) | `baseline/baseline-mobile-scene-02.png` (390×844) |
| Nauru / Tuvalu | `baseline/baseline-desktop-scene-04.png` (1440×900) | `baseline/baseline-mobile-scene-04.png` (390×844) |
| Rank fragility | `baseline/baseline-desktop-scene-05.png` (1440×900) | `baseline/baseline-mobile-scene-05.png` (390×844) |

The baseline confirms the redesign need: the current story rail is a nested desktop scroller, the first view reads as a white story panel beside a dark map, and the mobile comparison scene uses a clipped fixed sheet rather than a normal-flow editorial composition.

## Concept frame set

The six required art-directed concept frames were generated with the built-in image-generation tool using the approved scientific Pacific atlas prompt and the explicit guardrails against cultural ornament, physical route lines, variable-size importance bubbles, dashboard cards, and photorealism. They are composition studies only; no generated label, number, boundary, or icon is a source of truth for implementation.

- Scene 1 desktop: `artifacts/design/task-049/scene-01-desktop.png`
- Scene 1 mobile: `artifacts/design/task-049/scene-01-mobile.png`
- Scene 2 desktop: `artifacts/design/task-049/scene-02-desktop.png`
- Scene 4 desktop: `artifacts/design/task-049/scene-04-desktop.png`
- Scene 4 mobile: `artifacts/design/task-049/scene-04-mobile.png`
- Scene 5 desktop: `artifacts/design/task-049/scene-05-desktop.png`

The frames are intentionally treated as visual references, not data outputs. Implementation uses the generated `geographies.json`, `country_details.json`, EDA artifacts, and the semantic contract from TASK-048.

## Rubric review

| Criterion | Result | Review note |
| --- | --- | --- |
| Evidence semantics legible without prose | pass | Stable inner field, eight positions, detached context cue, and broken reporting edge are visible in the concept language. |
| No mark-size / importance confusion | pass | The selected direction fixes the overall footprint; completeness is expressed through interruption and unlit positions. |
| Context-only tick is separate | pass | The context cue is detached from the eight-position score-input ring. |
| Reported zero vs missing row in monochrome | pass | Open-dash and broken-dot edge treatments remain distinct without color. |
| Map remains recognizably Pacific | pass | Full-basin MapLibre/Natural Earth context remains the stage; no scored boundaries are invented. |
| One dominant hierarchy per scene | pass | Map-first reveal, evidence interruption, aligned comparison, and rank-band field each have one focal operation. |
| Cultural and geopolitical guardrails | pass | No Indigenous or Polynesian decorative motifs, borrowed publication identity, or physical/causal route language. |
| Mobile comparison protects map and copy | pass | The approved direction uses a ~46svh map and normal-flow portrait siblings, not an overlay that covers content. |
| Implementable with existing stack | pass | SVG/CSS/React/MapLibre are sufficient; no new runtime dependency is required. |

## Approved Direction

The owner authorized implementation of TASK-049 through TASK-055 in the 2026-07-10 request. The recommended defaults below are therefore the locked implementation direction; no visual variable was changed during review.

- Evidence mark silhouette: 44px circular portrait; 20px inner field; eight 5px radial ticks.
- Score-input tick order from 12 o'clock clockwise: sea-surface temperature, surface temperature, rainfall, sea level, directly affected persons, monitoring network, power generation, fisheries management.
- Context tick position: detached at 4:30, outside the input radius.
- Reporting edge variants: continuous / two open dashes / four dotted broken segments.
- Desktop scene column width: 28rem maximum.
- Mobile map height: 46svh.
- Serif stack: `Georgia, "Times New Roman", serif`.
- Sans stack: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Motion duration/easing: 560ms; `cubic-bezier(0.22, 1, 0.36, 1)`.
- Score colors remain role-based: coral gap, blue pressure, sea-glass visible capacity, and mineral-white/muted edge states for evidence visibility.
- Rejected ideas: variable-size bubbles, similarity routes, full-canvas fades, glass dashboard cards, physical map connectors, and unsourced cultural ornament.

## Implementation handoff

TASK-050 may replace the nested story rail with one native document-scroll controller. TASK-051 through TASK-055 must consume this direction and the TASK-048 fields; they must not copy generated concept values or reintroduce guided JSD/arcs. The owner visual review remains a taste check on the implementation after each task, while the semantic and accessibility contracts remain testable in source.
