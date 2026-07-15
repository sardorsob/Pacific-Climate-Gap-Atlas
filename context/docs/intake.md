# Intake

## What Are We Building?

A public interactive GIS atlas for the Pacific Dataviz Challenge 2026 climate-change theme.

## Who Uses It?

Competition judges, Pacific climate/development readers, students, journalists, and advocates.

## Smallest Useful Version

Map-first atlas with a short regional movement/visibility story, country/territory selection, optional adaptation-gap evidence, source coverage, and methodology notes.

## Stack

- Python for data ingestion, profiling, index construction, and outlook baselines.
- React/Vite/TypeScript for the web app.
- MapLibre GL or a similarly lightweight web-map library for the GIS layer.

## Out Of Scope

Operational forecasts, private data, user accounts, live dashboards, and unsupported supervised ML.

## Expected Screens / Modules

- Atlas map
- Regional movement field
- Evidence-visibility field
- Layer controls
- Country detail panel
- Methodology/source drawer
- Mobile single-panel flow

## Data To Store

Processed official dataset extracts, geography lookup tables, score outputs, app-ready JSON/GeoJSON, data contracts, and provenance notes.

## Integrations

Official Pacific Data Hub SDMX API for source pulls. Hosting target is not yet selected.

## Done Means

The public app works, source data is reproducible, methods are visible, and the submission has a reliable handoff.

## QA Risks

Sparse data, misleading index weights, brittle API pulls, app data drift, mobile layout issues, and overconfident modeling language.
