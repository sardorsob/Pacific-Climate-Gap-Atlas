# Problem

## Current Discovery Question

Across the Pacific region, which measured conditions move together or in cross-currents, and how does unequal official-data visibility limit what can responsibly be said about those patterns?

## Implemented Baseline Question

Where are Pacific island countries facing the largest mismatch between intensifying climate signals and the systems available to monitor, absorb, or respond to those changes?

This remains the question implemented in the current app. It is provisional because the present capacity side relies on sparse proxies and unnormalized absolute counts, while most rank positions are sensitive to indicator choice. `TASK-068` will test a complete-region alternative through deeper EDA; `TASK-069` will decide whether to retain, narrow, or replace the implemented question.

## Decision Value

The final dataviz should help policymakers, journalists, students, and local advocates understand one important Pacific climate problem through traceable evidence. It may help identify places or questions for closer investigation, but it must not declare definitive winners, losers, vulnerability, readiness, or funding need from incomparable proxies.

## Audience

- Pacific Dataviz Challenge judges
- Pacific climate and development observers
- Students and general readers
- Civic advocates who need a clear, source-backed overview

## Smallest Useful Deliverable

A public, map-first interactive atlas that lets a user select a Pacific geography and compare:

- climate signal
- observed stress
- adaptation capacity
- source coverage and missingness
- evidence-profile similarity, if the TASK-019 JSD layer is accepted for app wiring

## Success Evidence

- Uses at least one official 2026 competition dataset; target is multiple official datasets.
- Gives a clear GIS exploration path instead of a generic dashboard grid.
- Makes methodology, caveats, and sources visible.
- Produces a reproducible app-ready dataset from documented scripts.
- Avoids unsupported claims about future outcomes.
- Avoids treating evidence-profile similarity as shared vulnerability, shared policy need, or causal explanation.

## Misleading Failure Modes

- Treating sparse capacity proxies as complete adaptation readiness.
- Comparing geographies without showing missingness and coverage.
- Presenting projection bands as operational forecasts.
- Hiding normalization and weighting choices.
- Turning JSD/KL divergence into a black-box cluster story or leaderboard.
- Overfitting an index to look dramatic rather than defensible.
- Choosing a strong-sounding story first and using only the datasets that confirm it.
- Adding official datasets merely to increase breadth or create another composite score.
- Treating official-data coverage, monitoring counts, or exploratory clusters as proof of emergency preparedness.
- Letting missingness silently define measured-condition clusters or highlighting one island as if it were the regional story.
