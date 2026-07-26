# Scope

## In Scope

- Build an exploratory GIS-first website for the Pacific Climate Evidence Atlas.
- Use official Pacific Dataviz Challenge 2026 datasets as the core evidence base.
- Expand the current nine-dataset baseline with a small, profiled set of additional official datasets before selecting the final competition narrative.
- Preserve the completed regional EDA evidence gate: distributions, cross-current comparisons, separate condition/visibility heatmaps, dependency-aware relationships, rejected cluster stability, and centroid-map small multiples.
- Implement the accepted movement -> evidence visibility -> exploration story by reusing the existing fullscreen MapLibre application and the same 22 equal-presence evidence marks.
- Extend selected-place detail with a compact observed-record lens showing where that place sits in the regional water-change, renewable-share-change, and 14-position visibility records, while keeping the existing map and single-panel flow.
- Export only the minimum traceable water/renewable endpoint-change and 14-position visibility fields required by the guided story; keep the measures separate and preserve missingness.
- Produce a reproducible Python pipeline for dataset profiling, normalization, index construction, and app-ready exports.
- Create a transparent Adaptation Gap Index with visible missingness and caveats.
- Add an optional Adaptation Gap Outlook layer if the baseline projection passes data and evaluation gates.
- Add an optional evidence-profile divergence layer if it uses official-data-derived fields, explains Jensen-Shannon divergence plainly, and avoids causal or policy-need claims.
- Provide methodology, source notes, and handoff documentation.

## Out Of Scope For The Initial Sprint

- Operational disaster forecasting.
- Claims about household-level or community-level risk.
- Private, proprietary, or non-public datasets.
- Heavy supervised ML without a defensible target label and split strategy.
- Claims that divergence or similarity proves shared vulnerability, shared policy need, causal mechanisms, or natural clusters.
- A replacement map engine, dashboard shell, router, state manager, animation library, chart framework, or speculative component system for the narrative retrofit.
- A new movement, visibility, readiness, vulnerability, or evidence-quality score.
- A single-island protagonist, stable regional cluster labels, or a Pacific-wide progress/decline trajectory.
- Real-time data updates unless a simple cached static refresh is enough.
- User accounts, authentication, comments, or collaborative editing.

## Data Scope

Primary source inventory lives in `research/official_datasets_2026.csv`.

Current processed baseline:

- mean sea surface temperature anomalies
- mean surface temperature anomalies
- rainfall anomalies
- sea level anomalies
- disaster-affected persons
- meteorological monitoring network
- power generation
- fisheries management measures
- greenhouse gas emissions per capita as responsibility context

`TASK-065` acquisition decisions. Accepted for `TASK-066` processing and `TASK-067` research only—not for the story or index:

- population growth, primarily for context and denominator review
- renewable energy share, as a rate-based response/transition signal
- safely managed drinking water, as a recorded essential-service condition
- direct disaster economic loss, subject to sparse coverage and time alignment
- climate-altering land-cover index, subject to interpretation and comparability review

Rejected from processing:

- aggregate crop yield, because the item-level inspection showed that the aggregate hides crop composition across 78 items and mixed production types/units

Processing and visual comparability review are complete. Safely managed drinking-water access and renewable-energy share are accepted only as separate Act-I context measures. Their first-to-latest percentage-point changes are never averaged, scored, attributed to climate or policy, or added to the Adaptation Gap Index. Direct-loss presence is visibility-only; land-cover direction remains withheld; aggregate crop yield remains rejected.

## App Scope

The app should open on the existing full-basin map. The guided opening may occupy the first viewport, but the map and the 22 equal-presence marks remain visible immediately.

The current fullscreen map/figure system is the approved visual and interaction baseline. The guided story changes; the application does not. Preserve MapLibre, native document scroll, one canonical scene observer, evidence marks, selected-place detail, controls, methods/sources, URL/history, touch/keyboard/reduced-motion behavior, and the Explore handoff. The Adaptation Gap Index remains an optional caveated Explore layer, not the guided title, default, or evidence for Acts I–II.

Core interactions:

- layer toggle for adaptation gap and pillar scores
- optional evidence-fingerprint similarity comparison anchored on a selected geography
- country/territory selection
- country detail panel
- selected-place regional-position strips using already loaded generated records, with nulls outside scales and descriptive medians
- source/methodology drawer
- mobile-friendly single-panel flow
- regional water/renewable cross-current field with all 22 places and three explicit incomplete cases
- separately constructed evidence-visibility field with 14 ordered positions per geography and no composite visibility score

## Verification Scope

Before delivery:

- data scripts run from a clean checkout
- generated app data has contracts and row counts
- app builds
- map and panels smoke-test on desktop and mobile viewport
- methodology and source notes are visible
- secret scan passes
