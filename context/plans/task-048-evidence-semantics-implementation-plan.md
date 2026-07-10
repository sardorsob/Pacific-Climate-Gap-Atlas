# Evidence Semantics Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correctly separate score-input, context-only, and total trace indicator counts from the Python index through generated app data and user-facing copy.

**Architecture:** The gap-index layer will become the semantic source of truth for count roles. The app exporter will join the indicator trace once, emit ordered per-input presence records, and expose explicit count fields. React will consume the new names directly; no UI component will infer score membership from a display string or the old ambiguous count.

**Tech Stack:** Python 3.11, pandas, unittest, JSON/GeoJSON static exports, React 18, TypeScript, Vitest.

## Global Constraints

- The score has eight possible input datasets: four `climate_signal`, one `observed_stress`, and three `adaptation_capacity` datasets.
- `responsibility_context` data is never a score input.
- Reported monitoring zero and missing monitoring row remain different states.
- Generated files under `data/processed/app/` and `app/public/data/` must match byte-for-byte.
- Do not hand-edit generated CSV, JSON, GeoJSON, or provenance files.
- Keep the old field out of user-facing copy; use explicit semantic names.
- Use TDD and commit only after the full task verification gate passes.

---

## File Responsibility Map

- `analysis/features/gap_index.py`: define score/context roles and produce the three geography-level counts.
- `analysis/eda/drivers.py`: classify evidence density from score-input count, not all trace rows.
- `analysis/eda/divergence.py`: use score-input count in the data-visibility fingerprint component.
- `analysis/preprocessing/app_data.py`: export explicit counts and ordered score-input presence records.
- `scripts/build_app_data.py`: read the trace once and pass it to both geography and country-detail builders.
- `scripts/validate_data_contracts.py`: require the new public contract fields and validate the presence list.
- `app/src/lib/atlasData.ts`: adapt the explicit fields into typed React data.
- `app/src/lib/encoding.ts`: stop treating evidence count as point radius; retain only helpers still used before `TASK-052`.
- `app/src/components/map/atlasMapModel.ts`: keep presence marks at a consistent base size.
- `app/src/components/map/AtlasMap.tsx`: remove any overlay radius calculation based on evidence count.
- `app/src/components/map/MapLegend.tsx`: state `score inputs available (of 8)` and keep context separate.
- `app/src/components/panels/CountryPanel.tsx`: display score-input, context, and trace semantics accurately.
- `context/docs/methodology.md`, `context/DATA_CARD.md`, `context/ANALYSIS_BRIEF.md`: document the corrected contract and its consequences.

---

### Task 1: Correct The Index Counts

**Files:**

- Modify: `analysis/features/gap_index.py`
- Modify: `tests/analysis/test_gap_index.py`

**Interfaces:**

- Consumes: indicator trace columns `geo_code`, `dataset_slug`, and `pillar`.
- Produces: `score_input_indicator_count: int`, `context_indicator_count: int`, and `trace_indicator_count: int` on every index row.

- [ ] **Step 1: Write the failing role-count test**

Add a test with one climate input, one capacity input, and one responsibility-context row:

```python
def test_build_gap_index_separates_score_inputs_from_context_rows(self) -> None:
    observations = pd.DataFrame(
        [
            _row("sea-level-anomalies", "Sea level", "climate_signal", "FJ", 2023, 10),
            _row("power-generation", "Power generation", "adaptation_capacity", "FJ", 2023, 100),
            _row("greenhouse-gas-emissions-per-capita", "GHG per capita", "responsibility_context", "FJ", 2023, 2),
        ]
    )

    index, _ = build_gap_index(observations)
    fiji = index.iloc[0]

    self.assertEqual(fiji["score_input_indicator_count"], 2)
    self.assertEqual(fiji["context_indicator_count"], 1)
    self.assertEqual(fiji["trace_indicator_count"], 3)
    self.assertNotIn("included_indicator_count", index.columns)
```

- [ ] **Step 2: Run the focused test and confirm the old contract fails**

Run:

```bash
python -m unittest tests.analysis.test_gap_index.GapIndexTests.test_build_gap_index_separates_score_inputs_from_context_rows -v
```

Expected: `FAIL` or `ERROR` because the three explicit fields do not exist.

- [ ] **Step 3: Replace the ambiguous count in the index**

Define roles once and compute the three counts:

```python
SCORE_INPUT_PILLARS = PRESSURE_PILLARS | CAPACITY_PILLARS

INDEX_COLUMNS = [
    "geo_code",
    "score_status",
    "adaptation_gap_score",
    "climate_pressure_score",
    "capacity_score",
    "raw_gap_difference",
    "available_pillars",
    "missing_pillars",
    "score_input_indicator_count",
    "context_indicator_count",
    "trace_indicator_count",
    "missingness_flag",
]
```

In `_availability_summary()` compute distinct datasets by role:

```python
score_inputs = group[group["pillar"].isin(SCORE_INPUT_PILLARS)]
context_rows = group[~group["pillar"].isin(SCORE_INPUT_PILLARS)]
rows.append(
    {
        "geo_code": geo_code,
        "available_pillars": " ".join(available_pillars),
        "missing_pillars": " ".join(missing_pillars),
        "score_input_indicator_count": int(score_inputs["dataset_slug"].nunique()),
        "context_indicator_count": int(context_rows["dataset_slug"].nunique()),
        "trace_indicator_count": int(group["dataset_slug"].nunique()),
    }
)
```

- [ ] **Step 4: Run all gap-index tests**

Run:

```bash
python -m unittest tests.analysis.test_gap_index -v
```

Expected: all tests pass.

- [ ] **Step 5: Commit the index semantic correction only after the dependent EDA tests in Task 2 also pass**

Do not commit at this intermediate point; `analysis/eda/` still consumes the removed field.

---

### Task 2: Migrate EDA Consumers To Score-Input Count

**Files:**

- Modify: `analysis/eda/drivers.py`
- Modify: `analysis/eda/divergence.py`
- Modify: `tests/analysis/test_eda_country_drivers.py`
- Modify: `tests/analysis/test_divergence.py`
- Modify other focused EDA fixtures returned by `rg -n "included_indicator_count" tests/analysis analysis/eda`

**Interfaces:**

- Consumes: `score_input_indicator_count` from the gap-index table.
- Produces: evidence-density labels and divergence visibility components based only on score inputs.

- [ ] **Step 1: Rename test fixture fields and add a responsibility-context guard**

Update fixtures to use `score_input_indicator_count`. In the divergence test, assert that changing `context_indicator_count` alone does not change the normalized data-visibility component:

```python
left = index.copy()
right = index.copy()
left["context_indicator_count"] = 0
right["context_indicator_count"] = 1

left_profiles = build_evidence_fingerprints(left, monitoring, rank)
right_profiles = build_evidence_fingerprints(right, monitoring, rank)

self.assertEqual(
    left_profiles.loc[0, "data_visibility"],
    right_profiles.loc[0, "data_visibility"],
)
```

- [ ] **Step 2: Run the focused EDA tests and confirm failure**

Run:

```bash
python -m unittest tests.analysis.test_eda_country_drivers tests.analysis.test_divergence -v
```

Expected: failures reference the removed `included_indicator_count` field.

- [ ] **Step 3: Rename the EDA inputs and keep the domain at eight**

In both modules, replace all semantic uses of `included_indicator_count` with `score_input_indicator_count`. Where evidence-density labels use fixed bands, define them against the 0–8 score-input universe rather than 0–9 total trace rows.

Use this rule in `drivers.py`:

```python
def _evidence_density_label(count: object) -> str:
    value = int(count) if pd.notna(count) else 0
    if value >= 7:
        return "broad score-input evidence"
    if value >= 5:
        return "partial score-input evidence"
    return "thin score-input evidence"
```

- [ ] **Step 4: Run every EDA test**

Run:

```bash
python -m unittest discover -s tests/analysis -p "test_eda*.py" -v
python -m unittest tests.analysis.test_divergence -v
```

Expected: all selected tests pass.

---

### Task 3: Export Explicit Counts And Ordered Input Presence

**Files:**

- Modify: `analysis/preprocessing/app_data.py`
- Modify: `scripts/build_app_data.py`
- Modify: `tests/analysis/test_app_data_export.py`

**Interfaces:**

- Consumes: the complete indicator trace DataFrame and each index row.
- Produces on every geography record:
  - `score_input_indicator_count: int`
  - `context_indicator_count: int`
  - `trace_indicator_count: int`
  - `score_input_presence: list[{dataset_slug: str, dataset_name: str, pillar: str, present: bool}]`

- [ ] **Step 1: Write failing export assertions**

Extend the export test with a trace containing one present and one absent score input plus one context row. The expected list must preserve a stable global score-input order and exclude the responsibility row:

```python
self.assertEqual(record["score_input_indicator_count"], 2)
self.assertEqual(record["context_indicator_count"], 1)
self.assertEqual(record["trace_indicator_count"], 3)
self.assertEqual(
    record["score_input_presence"],
    [
        {
            "dataset_slug": "sea-level-anomalies",
            "dataset_name": "Sea level",
            "pillar": "climate_signal",
            "present": True,
        },
        {
            "dataset_slug": "power-generation",
            "dataset_name": "Power generation",
            "pillar": "adaptation_capacity",
            "present": True,
        },
    ],
)
```

- [ ] **Step 2: Run the focused export test and confirm failure**

Run:

```bash
python -m unittest tests.analysis.test_app_data_export -v
```

Expected: failures for missing explicit fields and `score_input_presence`.

- [ ] **Step 3: Add one presence builder and pass trace into record generation**

Add a helper whose universe is the score-input datasets present in the full trace and whose presence is geography-specific:

```python
SCORE_INPUT_PILLAR_ORDER = {
    "climate_signal": 0,
    "observed_stress": 1,
    "adaptation_capacity": 2,
}

def build_score_input_presence(trace: pd.DataFrame) -> dict[str, list[dict[str, Any]]]:
    inputs = trace[trace["pillar"].isin(SCORE_INPUT_PILLAR_ORDER)].copy()
    universe = (
        inputs[["dataset_slug", "dataset_name", "pillar"]]
        .drop_duplicates()
        .assign(pillar_order=lambda frame: frame["pillar"].map(SCORE_INPUT_PILLAR_ORDER))
        .sort_values(["pillar_order", "dataset_name"], kind="mergesort")
    )
    present = set(zip(inputs["geo_code"].astype(str), inputs["dataset_slug"].astype(str)))
    return {
        geo_code: [
            {
                "dataset_slug": row.dataset_slug,
                "dataset_name": row.dataset_name,
                "pillar": row.pillar,
                "present": (geo_code, row.dataset_slug) in present,
            }
            for row in universe.itertuples()
        ]
        for geo_code in sorted(trace["geo_code"].dropna().astype(str).unique())
    }
```

Change `build_geography_records(..., trace: pd.DataFrame | None = None)` to call the helper once and add the three explicit counts and `score_input_presence` to each record. In `scripts/build_app_data.py`, read `trace_path` once before calling the record builder and pass that DataFrame to `build_country_details_payload()` instead of making the function read the CSV a second time.

- [ ] **Step 4: Update schema version and generated-source summary**

Change the geography and country-detail payload schema version from `1` to `2`. Record the three count field names in `artifacts/provenance/app_data_summary.json` under:

```python
"evidence_count_contract": {
    "score_input_indicator_count": "score inputs only; maximum 8",
    "context_indicator_count": "context-only inputs; currently maximum 1",
    "trace_indicator_count": "all trace datasets",
}
```

- [ ] **Step 5: Run export tests**

Run:

```bash
python -m unittest tests.analysis.test_app_data_export -v
```

Expected: all tests pass.

---

### Task 4: Enforce The New Static Data Contract

**Files:**

- Modify: `scripts/validate_data_contracts.py`
- Modify: `tests/analysis/test_app_data_validation.py`
- Modify: `configs/app_layers.yml`

**Interfaces:**

- Consumes: generated `geographies.json` schema version 2.
- Produces: validation errors for absent or malformed semantic count/presence fields.

- [ ] **Step 1: Make the valid fixture use the new contract and add a broken-presence case**

The valid fixture should include:

```python
"score_input_indicator_count": 2,
"context_indicator_count": 1,
"trace_indicator_count": 3,
"score_input_presence": [
    {
        "dataset_slug": "sea-level-anomalies",
        "dataset_name": "Sea level anomalies",
        "pillar": "climate_signal",
        "present": True,
    }
],
```

Add a test that deletes `present` and expects:

```python
self.assertIn(
    "geographies[0].score_input_presence[0] missing required field: present",
    errors,
)
```

- [ ] **Step 2: Run validation tests and confirm failure**

Run:

```bash
python -m unittest tests.analysis.test_app_data_validation -v
```

Expected: the validator does not yet enforce the new fields.

- [ ] **Step 3: Require explicit fields and presence item shape**

Replace `included_indicator_count` in `REQUIRED_GEOGRAPHY_FIELDS` and add a dedicated list validator:

```python
REQUIRED_SCORE_INPUT_PRESENCE_FIELDS = (
    "dataset_slug",
    "dataset_name",
    "pillar",
    "present",
)
```

Validate that the list exists, contains exactly eight items in generated production data, has unique `dataset_slug` values, uses only the three score-input pillars, and uses booleans for `present`. Unit fixtures may contain a shorter list but must still pass shape validation; enforce exactly eight in a production-level test against generated data.

Update `configs/app_layers.yml` country-detail required fields to the three count fields plus `score_input_presence`.

- [ ] **Step 4: Run validation tests**

Run:

```bash
python -m unittest tests.analysis.test_app_data_validation -v
```

Expected: all tests pass.

---

### Task 5: Migrate React Types, Copy, And Mark Size

**Files:**

- Modify: `app/src/lib/atlasData.ts`
- Modify: `app/src/lib/atlasData.test.ts`
- Modify: `app/src/lib/encoding.ts`
- Modify: `app/src/components/map/atlasMapModel.ts`
- Modify: `app/src/components/map/atlasMapModel.test.ts`
- Modify: `app/src/components/map/AtlasMap.tsx`
- Modify: `app/src/components/map/MapLegend.tsx`
- Modify: `app/src/components/panels/CountryPanel.tsx`
- Modify: `app/src/components/panels/CountryPanel.test.tsx`

**Interfaces:**

- Consumes: the schema-version-2 app geography fields.
- Produces: `Geo.scoreInputCount`, `Geo.contextCount`, `Geo.traceCount`, and `Geo.scoreInputPresence`.

- [ ] **Step 1: Write failing adapter and copy tests**

Add this shape to `atlasData.test.ts`:

```typescript
score_input_indicator_count: 2,
context_indicator_count: 1,
trace_indicator_count: 3,
score_input_presence: [
  {
    dataset_slug: "sea-level-anomalies",
    dataset_name: "Sea level anomalies",
    pillar: "climate_signal",
    present: true,
  },
],
```

Assert:

```typescript
expect(geo).toMatchObject({
  scoreInputCount: 2,
  contextCount: 1,
  traceCount: 3,
  scoreInputPresence: [
    {
      datasetSlug: "sea-level-anomalies",
      datasetName: "Sea level anomalies",
      pillar: "climate_signal",
      present: true,
    },
  ],
});
```

In `CountryPanel.test.tsx`, assert that the rendered panel contains `8 possible score inputs`, `1 context-only row`, and does not contain `of 9 indicators feed this score`.

- [ ] **Step 2: Run the frontend tests and confirm failure**

Run:

```bash
npm --prefix app run test
```

Expected: adapter and copy assertions fail on the old `indicators` field.

- [ ] **Step 3: Add explicit TypeScript types and adapters**

Use:

```typescript
export type ScoreInputPresence = {
  datasetSlug: string;
  datasetName: string;
  pillar: "climate_signal" | "observed_stress" | "adaptation_capacity";
  present: boolean;
};

export type Geo = {
  // existing fields
  scoreInputCount: number;
  contextCount: number;
  traceCount: number;
  scoreInputPresence: ScoreInputPresence[];
};
```

Delete `Geo.indicators` and the `included_indicator_count` app contract field. Adapt the four new fields without a fallback to `9`; malformed generated data should be caught by validation.

- [ ] **Step 4: Make current presence marks constant-size**

Before `TASK-052` introduces the full evidence glyph, the current mark must no longer shrink thin-evidence places. In `buildAtlasFeatureCollection()`, replace:

```typescript
radius: radiusFor(geo.indicators),
```

with:

```typescript
radius: 12,
```

Use the same base radius in React overlays and delete `radiusFor()` if `rg -n "radiusFor" app/src` shows no remaining call sites. Update the map-model test to expect equal radius for records with different score-input counts.

- [ ] **Step 5: Correct legend and country-panel language**

Use concise copy:

```text
Score inputs available (of 8)
Responsibility context (not in score)
```

The panel evidence sentence becomes:

```tsx
<strong>{geo.scoreInputCount}</strong> of 8 possible score inputs are present.
{geo.scoreInputCount <= 4 && " Thin score-input evidence—read this score with extra caution."}
{geo.contextCount > 0 && (
  <span>{geo.contextCount} context-only dataset is available and does not feed the score.</span>
)}
```

The trace disclosure count uses `geo.traceCount` or `geo.indicatorRows.length` and calls them `official trace rows`, not `rows behind this score`.

- [ ] **Step 6: Run frontend tests and production build**

Run:

```bash
npm --prefix app run test
npm --prefix app run build
```

Expected: all tests pass and the build exits 0.

---

### Task 6: Regenerate, Document, And Verify End To End

**Files:**

- Regenerate: `artifacts/tables/adaptation_gap_index.csv`
- Regenerate: `artifacts/tables/eda_country_drivers.csv`
- Regenerate: `artifacts/tables/eda_country_story_labels.csv`
- Regenerate: `artifacts/tables/eda_evidence_fingerprints.csv`
- Regenerate: `artifacts/tables/eda_pairwise_jsd.csv`
- Regenerate: `artifacts/tables/eda_similarity_neighbors.csv`
- Regenerate: `artifacts/provenance/gap_index_summary.json`
- Regenerate: `artifacts/provenance/eda_summary.json`
- Regenerate: `artifacts/provenance/divergence_summary.json`
- Regenerate: `data/processed/app/*`
- Regenerate: `app/public/data/*`
- Modify: `context/docs/methodology.md`
- Modify: `context/DATA_CARD.md`
- Modify: `context/ANALYSIS_BRIEF.md`
- Modify: `context/TASKS.md`
- Modify: `context/logs/Progress Log.md`
- Modify: `context/logs/Handoff Notes.md`

**Interfaces:**

- Consumes: corrected pipeline and documentation contract.
- Produces: reproducible artifacts and a completed `TASK-048` review record.

- [ ] **Step 1: Regenerate the index, EDA, and app data in dependency order**

Run:

```bash
python scripts/build_gap_index.py --config configs/gap_index.yml
python scripts/run_eda.py --config configs/eda.yml
python scripts/build_app_data.py --config configs/app_layers.yml
```

Expected: all three commands exit 0 and generated public/processed copies are updated.

- [ ] **Step 2: Verify the corrected production counts**

Run:

```bash
python -c "import json; p=json.load(open('app/public/data/geographies.json')); assert len(p['geographies']) == 22; assert all(len(g['score_input_presence']) == 8 for g in p['geographies']); assert all(g['score_input_indicator_count'] <= 8 for g in p['geographies']); assert all(g['trace_indicator_count'] == g['score_input_indicator_count'] + g['context_indicator_count'] for g in p['geographies']); print('PASS evidence count semantics for 22 geographies')"
```

Expected:

```text
PASS evidence count semantics for 22 geographies
```

- [ ] **Step 3: Update methodology and data documentation**

Document the three fields, maximums, and the fact that responsibility context is outside the score. Replace any current prose that calls total trace rows “indicators behind the score.” Preserve the historical artifact note only when clearly labeled as pre-`TASK-048`.

- [ ] **Step 4: Run the complete task gate**

Run:

```bash
python -m unittest discover -s tests -t . -v
python scripts/validate_data_contracts.py
python scripts/check_required_artifacts.py
python scripts/validate_task_statuses.py
python scripts/check_secrets.py
npm --prefix app run test
npm --prefix app run build
git diff --check
```

Expected: zero Python test failures, zero frontend test failures, `PASS app data contracts`, required artifacts present, valid task statuses, no exposed secrets, successful production build, and no whitespace errors.

- [ ] **Step 5: Perform manual semantic QA**

Inspect Nauru, Tuvalu, Pitcairn, American Samoa, and Fiji. Confirm:

- maximum score-input denominator is 8;
- responsibility context is labeled separately;
- reported zero and missing row still differ;
- thin evidence no longer makes a presence mark smaller;
- the trace drawer includes context rows without claiming they feed the score.

- [ ] **Step 6: Move `TASK-048` through review and commit**

After Builder notes and independent QA are recorded, use the legal transitions `pending -> in-progress -> in-review -> done`, then commit:

```bash
git add analysis app configs scripts tests data/processed/app artifacts context
git commit -m "fix(data): TASK-048 separate score and context evidence counts"
```

The commit must not contain a `Co-authored-by` trailer.
