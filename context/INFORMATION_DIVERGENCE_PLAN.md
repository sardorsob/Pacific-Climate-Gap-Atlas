# Information Divergence Plan

## Status

Implemented analysis layer. The generated tables and provenance summary exist, but app-ready JSON and interface wiring are still pending.

Working layer name: **Evidence Fingerprint Divergence**.

Primary public metric: Jensen-Shannon divergence (JSD).

Internal diagnostic only: Kullback-Leibler divergence (KL). It was not needed for the public TASK-019 artifacts.

## Purpose

The current atlas answers where climate pressure and visible adaptation capacity appear out of balance. The divergence layer answers a different but related question:

> Which Pacific geographies have similar or different evidence profiles behind their adaptation-gap scores?

This keeps the project away from a simple leaderboard. Two geographies can have similar adaptation-gap scores for different reasons, or different scores with surprisingly similar evidence profiles. A JSD-based layer makes those patterns inspectable without replacing the adaptation-gap score.

## Why This Is In Scope

The challenge requires at least one official dataset and allows analytical transformations of open data when sources are cited. This layer does not add a new source dataset. It transforms the same official indicator trace and EDA tables already used by the atlas.

The layer supports the existing story contract:

- It compares official evidence profiles, not vulnerability or funding need.
- It helps explain "what kind of gap" a geography has.
- It can be built from traceable official rows and displayed with caveats.
- It reinforces that the Adaptation Gap Index is a comparative screen, not a definitive truth.

## Method Sketch

Input unit:

- one geography
- one normalized evidence vector

Candidate vector families:

1. Pressure fingerprint:
   - climate-signal indicators
   - observed-stress indicators
2. Capacity fingerprint:
   - adaptation-capacity indicators
3. Data-visibility fingerprint:
   - included indicator count
   - missing pillar flags
   - monitoring reporting status
   - dataset coverage tiers
4. Combined evidence fingerprint:
   - pressure, capacity, and visibility values in one documented vector

Implemented TASK-019 choice:

- Start with a combined evidence fingerprint built from already-scored indicator values and explicit missingness/status fields.
- Normalize each geography vector so it behaves like a distribution.
- Use no public smoothing; zero components remain visible and are tested.
- Compute pairwise JSD between all 22 geographies.
- Record nearest neighbors, similarity bands, dominant-component reason labels, and caveats.

KL should stay internal unless there is a very clear explanatory need. It is asymmetric, sensitive to zeros, and harder to explain responsibly.

## Produced Artifacts

Produced outputs:

- `artifacts/tables/eda_evidence_fingerprints.csv`
- `artifacts/tables/eda_pairwise_jsd.csv`
- `artifacts/tables/eda_similarity_neighbors.csv`
- `artifacts/provenance/divergence_summary.json`

Potential future app-ready outputs:

- `data/processed/app/evidence_fingerprints.json`
- `app/public/data/evidence_fingerprints.json`

## Story Placement

This is a secondary diagnostic layer, not the story spine.

Recommended storyboard placement:

1. Open on the adaptation gap.
2. Pull pressure and capacity apart.
3. Inspect a place.
4. Show where the data goes quiet.
5. Show rank fragility.
6. Show evidence fingerprints: similar score, different profile.
7. Show regional texture.
8. Optional outlook stress test.

The layer should answer:

- Who looks similar to the selected geography?
- Is that similarity driven by pressure, capacity, or data visibility?
- Where does a similar adaptation-gap score hide a different evidence mix?

## Interface Design

Primary interaction:

- User selects a geography.
- A panel section shows "Most similar evidence profiles" and "Most different evidence profiles."
- The map optionally re-encodes other points by similarity to the selected geography.

Map treatment:

- Do not use it as a new global ranking ramp.
- Use a selected-geography comparison mode.
- Selected geography remains the anchor.
- Other geographies show similarity distance through a restrained sequential ramp or stroke intensity.
- Missing/low-evidence cases keep their reporting-status marks.

Panel treatment:

- Add a compact fingerprint strip or mini radar-like bar stack for the selected geography.
- Show nearest neighbors with short evidence reasons, not just numbers.
- Include caveat: "Similarity means the official evidence profiles look alike under this method; it does not mean the places face the same risks or need the same actions."

Mobile treatment:

- Put the similarity list in the bottom sheet after the pressure/capacity and monitoring sections.
- The map comparison mode should be one tap from the selected geography panel, not a default first-screen control.

## Caveats

Required copy:

- "Similarity is based on official-data profiles, not lived experience or full adaptation readiness."
- "JSD compares normalized evidence patterns; it does not explain causality."
- "Sparse or missing data can make profiles look similar for the wrong reason."
- "Do not read this as a cluster of identical needs."

Do not claim:

- similar profile means same vulnerability,
- different profile means incomparable places,
- JSD clusters are natural regions,
- KL/JSD proves causal relationships,
- evidence similarity replaces the adaptation-gap score.

## Acceptance Criteria For Implementation

- The analysis uses only documented official-data-derived fields unless a source review expands scope.
- Every vector component is named, normalized, and traceable.
- Pairwise JSD output is symmetric and bounded.
- Missingness treatment is explicit and tested.
- The app layer is anchored on a selected geography, not a global leaderboard.
- The method drawer explains JSD in plain language.
- The layer can be disabled without weakening the core atlas story.

## Open Questions

1. Should later iterations add separate pressure/capacity/visibility fingerprints, or is the combined fingerprint enough for V1?
2. Should the public UI show exact JSD values, or just "more similar / less similar" bands?
3. Should the layer ship in the competition V1, or remain a post-mockup analytical enhancement?
4. Should Claude design a dedicated fingerprint panel from the TASK-019 artifacts, or should app wiring wait until the core public-data adapter is finished?
