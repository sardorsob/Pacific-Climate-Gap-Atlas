# TASK-023 App Data Wiring Inventory

Date: 2026-06-30

Scope: documentation-only inventory for replacing `app/src/mock/mockAtlasData.ts` with public app data, while preserving the current mockup's caveats and visual states. No app source, public data, generated artifacts, or shared task/status files were changed for this note.

## Current UI Data Shape

The current React mockup passes `ATLAS_GEOS` through `App` into `AtlasMap`, `CountryPanel`, `DataQuietCallout`, `RankChip`, and encoding helpers. These surfaces use the following mock fields:

| Mock field | Current UI use | Public app data field available now | Gap |
| --- | --- | --- | --- |
| `code` | selection key, labels, chips, compare target | `geo_code` in `atlas_geographies.geojson`, `geographies.json`, `country_details.json.details`, `monitoring_network.geojson` | Rename only. |
| `name` | map labels, panel title, handle, compare text | `name` / `geography_name` | Rename/select canonical display field. |
| `lon`, `lat` | SVG point projection | `geometry.coordinates` in `atlas_geographies.geojson`; `centroid.lon`, `centroid.lat` in `geographies.json` | Use GeoJSON for map; use `centroid` for panel/source trace if needed. Preserve `geometry_status`. |
| `gap` | fill color, panel score, bars/labels | `adaptation_gap_score` | Rename and round for display only. |
| `pressure` | fill color, panel evidence strip/bar | `climate_pressure_score` | Rename and round for display only. |
| `capacity` | fill color, panel evidence strip/bar | `capacity_score` | Rename and round for display only. |
| `indicators` | point radius, evidence density, trace count label | `included_indicator_count`; full trace row count in `country_details.json.details[code].indicators` | Use `included_indicator_count` for point size and "of 9"; use detail trace length for trace rows. |
| `reportingStatus` | ring/pattern, monitoring labels/caveats, data-quiet buckets | Not in current public app JSON. Source exists in `artifacts/tables/eda_monitoring_gap.csv` as `monitoring_reporting_status`. | Must export/derive app-ready monitoring status before wiring. |
| `monitoringCount` | currently fixture-only, not directly rendered except implied in status | `monitoring_network.geojson.properties.latest_value` when feature exists; EDA source has `monitoring_count` | Need normalize missing feature to status, not zero. |
| `latestMonitoringYear` | currently fixture-only; available for future panel/caveat | `monitoring_network.geojson.properties.latest_year` when feature exists; EDA source has `latest_monitoring_year` | Missing rows need explicit `null` plus reporting caveat. |
| `storyPriority` | priority count, map dimming in coverage view, priority group | Not in public app JSON. Source exists in `eda_monitoring_gap.csv` (`story_priority`, `story_priority_rank`) and `eda_country_story_labels.csv` (`story_priority`). | Export as normalized numeric or enum, with clear source choice. |
| `rankMin`, `rankMax`, `rankRange`, `robustness` | rank chip, uncertainty fill, aria label | Not in public app JSON. Source exists in `eda_rank_volatility.csv` and duplicated in story/spatial EDA tables. | Must export rank uncertainty before enabling real uncertainty view. |
| `storyLabel` | map aria label, panel story headline | Not in public app JSON. Source exists in `eda_country_story_labels.csv` and `eda_spatial_typologies.csv`. | Export with non-causal caveat. |
| `topPressure`, `topCapacity` | panel top signals lists | Not in public app JSON. Source exists as semicolon strings in `eda_country_story_labels.csv` / `eda_spatial_typologies.csv`; can also be derived from `country_details` indicators by pillar and score. | Prefer deriving structured arrays in app export to avoid parsing display strings in React. |
| `outlook2030Flat` | outlook fill color | `outlook_2030_flat_gap_score` in GeoJSON/geographies and nested `outlook.2030.capacity_flat.outlook_gap_score` | Available, but display must also use recommendation/caveat. |
| `outlookDisplay` | withhold transparent marks and caveat state | Not in public app JSON. Source exists in `eda_outlook_interpretation.csv` as `display_recommendation` by `geo_code`, `target_year`, `scenario`. | Must export before real outlook toggle, otherwise weak diagnostics may appear as normal claims. |
| `subregion` | panel eyebrow and subregion orientation context | Not in current public app JSON. Source exists in `eda_monitoring_gap.csv`, `eda_spatial_typologies.csv`, and `data/external/geography_context.csv`. | Export conservative context fields; keep UN M49 caveat. |
| `status` | panel political-status note | Not in current public app JSON. Source exists in `eda_spatial_typologies.csv` as `political_status` and GIS context artifacts. | Export only after wording review flag is preserved. |

## Public Data Files Observed

`app/public/data/atlas_geographies.geojson`

- Feature count: 22.
- Useful map properties: `geo_code`, `name`, `adaptation_gap_score`, `climate_pressure_score`, `capacity_score`, `included_indicator_count`, `score_status`, `missingness_flag`, `geometry_status`, `outlook_2030_flat_gap_score`, `outlook_2050_flat_gap_score`, `outlook`, `available_pillars`, `missing_pillars`, `dataset_count`, `row_count`, `first_year`, `last_year`, `datasets`, `source_refs`.
- Geometry policy: centroid fallback only. Wire as centroid points, not polygon or boundary claims.

`app/public/data/geographies.json`

- Shape: object with `schema_version`, `geometry_policy`, `source_refs`, and `geographies` array.
- Geography records mirror the score and outlook fields and include `centroid` and `source_refs`.
- Missing for current mockup: subregion, political status, monitoring status, rank uncertainty, story labels, top signals, outlook display recommendation.

`app/public/data/country_details.json`

- Shape: object with `schema_version`, `source_refs`, and `details` keyed by `geo_code`.
- Each detail record includes the geography score fields, nested `outlook`, `source_refs`, and `indicators[]`.
- Future wiring should read `details[geoCode]`, not `details.find(...)`.

`app/public/data/layers.json`

- Shape: object with `schema_version` and `layers[]`.
- Existing ids are `adaptation_gap`, `climate_pressure`, `capacity`, `outlook_2030_flat`, `outlook_2050_flat`, and `monitoring_network`.
- Current UI ids are `gap`, `pressure`, and `capacity`; add an adapter or align ids during implementation.
- Layer manifest lacks the richer caveat copy currently in `app/src/lib/layers.ts`; preserve those caveats either in a generated manifest extension or a stable UI copy module.

`app/public/data/monitoring_network.geojson`

- Feature count: 18.
- Useful overlay properties: `geo_code`, `name`, `latest_value`, `latest_year`, `unit`, `geometry_status`.
- Absence of a feature is meaningful only as "no monitoring rows in processed official data", not confirmed infrastructure absence.

## Missing App-Ready Fields To Export Or Derive

Required before replacing the mock fixture:

| Needed field | Recommended app-ready field | Source / derivation |
| --- | --- | --- |
| Monitoring status enum | `monitoring.reporting_status` | `eda_monitoring_gap.csv.monitoring_reporting_status`; use enum values already in mock. |
| Monitoring count/year | `monitoring.latest_value`, `monitoring.latest_year` | Join `monitoring_network.geojson` or `eda_monitoring_gap.csv`; no feature becomes `null`, not `0`. |
| Monitoring caveats | `monitoring.proxy_caveat`, `monitoring.missing_reporting_caveat` | `eda_monitoring_gap.csv`. |
| Coverage view priority | `monitoring.story_priority`, `monitoring.story_priority_rank`, `monitoring.monitoring_quadrant` | `eda_monitoring_gap.csv`. Normalize current mock numeric `1..5` from `story_priority_rank` or export an explicit display priority. |
| Rank chip values | `rank.scenario_rank_min`, `rank.scenario_rank_max`, `rank.rank_range`, `rank.robustness_label`, `rank.rank_caveat` | `eda_rank_volatility.csv`. |
| Story label | `story.story_label`, `story.non_causal_caveat`, `story.evidence_density_label` | `eda_country_story_labels.csv`, with caveat retained. |
| Top signals | `story.top_pressure_signals[]`, `story.top_capacity_signals[]` | Prefer structured derivation from `country_details.indicators[]` by pillar and highest `indicator_score`; fallback to splitting EDA semicolon strings during export, not in UI. |
| Subregion and political status | `context.subregion`, `context.political_status`, `context.context_quality`, `context.review_flag` | `eda_spatial_typologies.csv` or `data/external/geography_context.csv`; preserve wording-review caveat. |
| Outlook display recommendation | `outlook_display.2030.capacity_flat.display_recommendation`, `diagnostic_quality_label`, `projection_fragility_label`, `caveat` | `eda_outlook_interpretation.csv`; required to withhold weak diagnostics. |
| Direct-label/priority groups | `display.story_exemplar`, `display.priority_group`, optional label offsets | Can derive from story priority and TASK-021/TASK-022 design choices. Label offsets are visual layout state, not data evidence. |

Fields that can remain UI constants:

- Color ramps, uncertainty ramp, radius range, graticule, subregion label anchors, and wording for evergreen caveats.
- `DEFAULT_SELECTED`, `COMPARE_SUGGESTION`, and `STORY_EXEMPLARS` may remain editorial defaults until a story-config JSON exists.
- Label offsets should remain visual config; they are not evidence data.

## Fields Not To Wire As Claims Yet

- Evidence Fingerprint Divergence / similarity neighbors: TASK-019 has created `eda_evidence_fingerprints.csv`, `eda_pairwise_jsd.csv`, `eda_similarity_neighbors.csv`, and `divergence_summary.json`, but the app still needs a compact public-data contract and visual QA before enabling the layer. No mock JSD distances or profile families should appear as real data.
- Boundary choropleth: `geometry_status` is `centroid_fallback`; do not render polygons, imply territorial boundaries, or describe area coverage.
- Monitoring absence: missing monitoring features and `reported_zero_latest_count` are reporting states, not proof that infrastructure is absent.
- Rank order: baseline rank can be shown only with rank range/uncertainty and caveat. Avoid leaderboard language.
- Outlook: `outlook_2030_flat_gap_score` can be read technically, but should not be displayed without `display_recommendation` and caveat. Withheld places should stay visually withheld.
- Political status: current status strings should not be treated as final publication copy until review flags are preserved and wording is checked.
- Responsibility context: GHG/emissions traces are context, not blame or responsibility scoring.

## Recommended Wiring Order

1. Add a thin loader/adapter that reads `atlas_geographies.geojson`, `geographies.json`, `country_details.json`, and `layers.json` into a `Geo`-compatible view model.
   - Preserve existing UI behavior by adapting names, not by rewriting components first.
   - Gate rendering by `score_status`; missing score should not be colored like low score.

2. Wire base score map and panel from public app data.
   - Map `geo_code -> code`, `name -> name`, GeoJSON coordinates or `centroid -> lon/lat`, `adaptation_gap_score -> gap`, `climate_pressure_score -> pressure`, `capacity_score -> capacity`, `included_indicator_count -> indicators`.
   - Keep `geometry_status` visible through map note/caveat.
   - Keep `country_details.details[code].indicators` available for source/method drilldown.

3. Export and wire monitoring/reporting status before enabling the coverage view on real data.
   - Join `eda_monitoring_gap.csv` into the app export, or generate a compact `monitoring` object per geography.
   - Represent three statuses distinctly: reported positive latest count, latest row reports zero, and missing monitoring dataset row.
   - Compute the high-gap / low-monitoring group from exported priority fields, not a hard-coded list, while preserving the current visual state for PN, NR, AS, WF.

4. Export and wire rank uncertainty.
   - Add rank range and robustness fields from `eda_rank_volatility.csv`.
   - Only show rank or uncertainty color when the caveat is adjacent. The current `RankChip` pattern is the right model.

5. Export and wire story/context fields.
   - Add story labels, evidence density labels, top signal arrays, subregion, political status, and non-causal/context caveats.
   - Use structured arrays for top signals so React does not parse semicolon-delimited strings.
   - Preserve review flags for political-status wording.

6. Wire outlook as a guarded secondary layer.
   - Use existing `outlook_2030_flat_gap_score` only after `display_recommendation` is exported.
   - Withhold `display_recommendation = withhold` as current mockup does. Show `show_with_strong_caveat` with visible caveat, not normal styling.

7. Add TASK-019 divergence only after app-ready export and QA.
   - Introduce a separate data contract for similarity/fingerprint fields.
   - Keep it disabled by default until caveats, anchor geography, and QA are complete.

## Transformation Notes

- Rounding: keep raw numeric values from exported JSON for color/radius calculations; round only in display components with `.toFixed(0)` or copy-specific formatting.
- Data shape: `country_details.json.details` is an object keyed by code. Avoid array lookup assumptions.
- Layer ids: bridge `adaptation_gap` to UI `gap`, `climate_pressure` to `pressure`, and `capacity` to `capacity`, or update UI ids in a dedicated implementation task.
- Monitoring join: if a code is absent from `monitoring_network.geojson`, do not derive `latest_value = 0`. Use EDA `monitoring_reporting_status = missing_monitoring_dataset_row` and nullable count/year.
- Top signals: current mock strings use shortened labels. A generated app field should include `label`, `score`, `pillar`, `dataset_slug`, `unit`, `latest_year`, and `source_row_hash` where available.
- Source access: retain `source_refs` from app data and `source_row_hash` from indicator traces so the method drawer/panel can link claims to source artifacts.
- Caveat preservation: store caveat text near the derived field when possible. Do not rely only on global methodology copy.
- Visual state preservation: the default selected/compare/direct-label choices are editorial interaction state; keep them in UI config unless a story-config export is added.

## Spot Checks

| Code | Present in base data | Monitoring overlay | Mock/current interpretation to preserve |
| --- | --- | --- | --- |
| `NR` | Present in GeoJSON and geographies. `gap=88.9403`, `pressure=61.553`, `capacity=26.936`, `indicators=9`, `geometry_status=centroid_fallback`. | Feature present: `latest_value=0.0`, `latest_year=2026`. | Latest row reports zero; do not read as confirmed no infrastructure. Rank range must come from EDA before real rank chip. |
| `TV` | Present. `gap=77.7085`, `pressure=66.5314`, `capacity=40.7407`, `indicators=9`. | Feature present: `latest_value=3.0`, `latest_year=2026`. | High-gap with reported monitoring; useful compare against NR. |
| `PN` | Present. `gap=100.0`, `pressure=53.4091`, `capacity=10.101`, `indicators=4`. | Feature present: `latest_value=0.0`, `latest_year=2026`. | Thin evidence and reported zero; preserve `withhold` outlook display from EDA before showing outlook. |
| `AS` | Present. `gap=84.9656`, `pressure=49.6753`, `capacity=18.1818`, `indicators=7`. | No monitoring feature. | Missing monitoring dataset row, not zero. Current 2030 score exists but needs `show_with_strong_caveat`. |
| `WF` | Present. `gap=82.5555`, `pressure=34.145`, `capacity=4.5455`, `indicators=6`. | No monitoring feature. | Missing monitoring dataset row, not zero. Preserve fragile rank/caveat before uncertainty view. |
| `MH` | Present. `gap=65.9545`, `pressure=67.059`, `capacity=50.5051`, `indicators=9`. | Feature present: `latest_value=2.0`, `latest_year=2026`. | Rank uncertainty exemplar; do not show "moves 4-19" until EDA rank fields are exported. |

## Risks For Future Wiring

- A naive switch from mock data to public GeoJSON will silently drop monitoring status, rank uncertainty, story labels, political status, top signals, and outlook display gating.
- Treating absent monitoring features as zero would collapse "no rows" and "reported zero" into the same claim.
- Using `outlook_2030_flat_gap_score` without `display_recommendation` would make weak diagnostics look equally supported.
- Joining EDA fields by geography display name risks naming drift. Use `geo_code`.
- Parsing display strings in React will make future methodology changes brittle. Export structured story/top-signal objects instead.
- Current UI labels say "4 to 9" indicators; if future datasets change indicator count, legend copy and radius domain should be generated from data or a manifest field.
- Political-status copy has sensitivity/review risk. Preserve `context_quality` and review notes before publication.
- Multiple agents may be changing visual mockup files; keep implementation wiring in a later task with fresh diff review.

## Acceptance Criteria For Future Wiring Task

- App no longer imports `ATLAS_GEOS` for evidence-bearing geography records.
- Base map, detail panel, layer controls, legend, data-quiet view, rank chip, and outlook toggle render from public app data plus generated app-ready EDA exports.
- `geometry_status=centroid_fallback` remains visible near map/boundary claims.
- Monitoring statuses distinguish reported positive, reported zero, and missing rows, with caveats preserved.
- Every rank display includes `scenario_rank_min`, `scenario_rank_max`, `rank_range`, `robustness_label`, and rank caveat.
- Outlook layer withholds records marked `withhold` and visibly caveats `show_with_strong_caveat`.
- Source/method access can trace scores to `source_refs` and indicator rows to `source_row_hash`.
- Evidence Fingerprint Divergence remains absent or disabled until the TASK-019 artifacts are exported to app-ready data and pass UI QA.
- NR, TV, PN, AS, WF, and MH match the spot-check interpretations above after wiring.
- Build and data-contract validation pass, and visual QA confirms the mockup's caveat placement and mobile/desktop states survive the real-data adapter.
