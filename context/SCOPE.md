# Scope

## In Scope

- Build an exploratory GIS-first website for the Pacific Adaptation Gap Atlas.
- Use official Pacific Dataviz Challenge 2026 datasets as the core evidence base.
- Expand the current nine-dataset baseline with a small, profiled set of additional official datasets before selecting the final competition narrative.
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

Processing and visual comparability review precede narrative selection. Acceptance for processing does not make a candidate a score input, app layer, story claim, or causal explanation. A candidate may still be excluded from an audition for weak overlap, incompatible units, ambiguous semantics, poor year alignment, lack of a defensible denominator, or inability to support a non-causal claim.

## App Scope

The app should open on the map. A short intro can exist, but the first screen must be the exploratory atlas experience.

The current fullscreen map/figure system remains the visual baseline during data discovery. Guided copy, exemplar places, layer priority, the product title, and the role of the Adaptation Gap Index are provisional until `TASK-068` passes owner/scientific review. Do not modify the app narrative merely because a dataset has been acquired.

Core interactions:

- layer toggle for adaptation gap and pillar scores
- optional evidence-fingerprint similarity comparison anchored on a selected geography
- country/territory selection
- country detail panel
- source/methodology drawer
- mobile-friendly single-panel flow

## Verification Scope

Before delivery:

- data scripts run from a clean checkout
- generated app data has contracts and row counts
- app builds
- map and panels smoke-test on desktop and mobile viewport
- methodology and source notes are visible
- secret scan passes
