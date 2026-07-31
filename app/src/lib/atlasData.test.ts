import { describe, expect, it } from "vitest";
import generatedGeographies from "../../public/data/geographies.json";
import { adaptGeographiesPayload } from "./atlasData";

describe("atlas data adapter", () => {
  it("adapts the four reviewed place-context strings for all 22 records", () => {
    const geos = adaptGeographiesPayload(generatedGeographies);
    const americanSamoa = geos.find((geo) => geo.code === "AS")!;
    const cookIslands = geos.find((geo) => geo.code === "CK")!;
    const fiji = geos.find((geo) => geo.code === "FJ")!;
    const northernMarianaIslands = geos.find((geo) => geo.code === "MP")!;
    const nauru = geos.find((geo) => geo.code === "NR")!;
    const pitcairn = geos.find((geo) => geo.code === "PN")!;
    const tokelau = geos.find((geo) => geo.code === "TK")!;

    expect(geos).toHaveLength(22);
    expect(geos.every((geo) => [
      geo.placeNote,
      geo.monitoringCaveat,
      geo.rankCaveat,
      geo.nonCausalCaveat,
    ].every((value) => typeof value === "string" && value.trim().length > 0))).toBe(true);
    expect(americanSamoa.monitoringCaveat).toContain(
      "No meteorological-monitoring-network rows in processed observations",
    );
    expect(nauru.monitoringCaveat).toContain("Latest meteorological-monitoring-network row reports 0");
    expect(pitcairn.placeNote).toBe("Pitcairn Henderson Ducie and Oeno island group");
    expect(JSON.stringify(geos)).not.toContain("Review wording before publication");
    expect(JSON.stringify(geos)).not.toContain("wording in review");
    expect(fiji.status).toBe("Sovereign state");
    expect(tokelau.status).toBe("Non-self-governing territory within the Realm of New Zealand");
    expect(cookIslands.status).toBe("Self-governing state in free association with New Zealand");
    expect(northernMarianaIslands.status).toBe(
      "Self-governing U.S. commonwealth in political union with and under the sovereignty of the United States",
    );
    expect(pitcairn.status).toBe("British Overseas Territory");
  });

  it("uses the defensive political-status fallback only when source data is missing", () => {
    const [geo] = adaptGeographiesPayload({
      geographies: [
        {
          geo_code: "ZZ",
          name: "Example place",
          centroid: { lon: 0, lat: 0 },
          adaptation_gap_score: 0,
          climate_pressure_score: 0,
          capacity_score: 0,
          score_input_indicator_count: 0,
          context_indicator_count: 0,
          trace_indicator_count: 0,
          score_input_presence: [],
          outlook_2030_flat_gap_score: null,
          context: { political_status: "" },
        },
      ],
    });

    expect(geo.status).toBe("Political status unavailable");
  });

  it("adapts the generated regional story contract", () => {
    const geos = adaptGeographiesPayload(generatedGeographies);
    const papuaNewGuinea = geos.find((geo) => geo.code === "PG")!;
    const federatedStates = geos.find((geo) => geo.code === "FM")!;
    const marshallIslands = geos.find((geo) => geo.code === "MH")!;
    const guam = geos.find((geo) => geo.code === "GU")!;
    const pitcairn = geos.find((geo) => geo.code === "PN")!;
    const nauru = geos.find((geo) => geo.code === "NR")!;

    expect(geos).toHaveLength(22);
    expect(geos.filter((geo) => geo.regionalStory.completeOverlap)).toHaveLength(19);
    expect(papuaNewGuinea.regionalStory).toMatchObject({
      water: { firstYear: 2000, latestYear: 2022, changePercentagePoints: 18.49 },
      renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: -15.6 },
      completeOverlap: true,
      quadrant: "water_up_renewable_down",
    });
    expect(guam.regionalStory.water).toEqual({
      firstYear: null,
      latestYear: null,
      changePercentagePoints: null,
    });
    expect(federatedStates.regionalStory).toMatchObject({
      water: { firstYear: 2000, latestYear: 2020, changePercentagePoints: -0.98 },
      renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: 0.78 },
    });
    expect(marshallIslands.regionalStory).toMatchObject({
      water: { firstYear: 2001, latestYear: 2022, changePercentagePoints: -3.79 },
      renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: -7.89 },
    });
    expect(nauru.regionalStory).toMatchObject({
      water: { firstYear: 2000, latestYear: 2020, changePercentagePoints: 1.92 },
      renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: 1.75 },
    });
    expect(geos.every((geo) => geo.regionalStory.visibility.length === 14)).toBe(true);
    expect(pitcairn.regionalStory.visibility.filter((position) => position.present)).toHaveLength(6);
    expect(papuaNewGuinea.regionalStory.visibility.filter((position) => position.present)).toHaveLength(14);
    expect(
      geos.flatMap((geo) => geo.regionalStory.visibility)
        .filter((position) => position.present),
    ).toHaveLength(277);
  });

  it("adapts the regional story without coercing missing movement to zero", () => {
    const [geo] = adaptGeographiesPayload({
      geographies: [
        {
          geo_code: "GU",
          name: "Guam",
          centroid: { lon: 144.8, lat: 13.4 },
          adaptation_gap_score: 50,
          climate_pressure_score: 50,
          capacity_score: 50,
          score_input_indicator_count: 8,
          context_indicator_count: 1,
          trace_indicator_count: 9,
          score_input_presence: [],
          outlook_2030_flat_gap_score: null,
          regional_story: {
            water: {
              first_year: null,
              latest_year: null,
              change_percentage_points: null,
            },
            renewable: {
              first_year: 2000,
              latest_year: 2022,
              change_percentage_points: 6.11,
            },
            complete_overlap: false,
            quadrant: "missing_overlap",
            visibility: Array.from({ length: 14 }, (_, index) => ({
              feature_id: `feature-${String(index + 1).padStart(2, "0")}`,
              label: `Feature ${index + 1}`,
              role: "reporting_presence",
              present: index > 0,
              latest_year: index === 4 ? 2026 : null,
            })),
          },
        },
      ],
    });

    expect(geo.regionalStory).toEqual({
      water: { firstYear: null, latestYear: null, changePercentagePoints: null },
      renewable: { firstYear: 2000, latestYear: 2022, changePercentagePoints: 6.11 },
      completeOverlap: false,
      quadrant: "missing_overlap",
      visibility: Array.from({ length: 14 }, (_, index) => ({
        featureId: `feature-${String(index + 1).padStart(2, "0")}`,
        label: `Feature ${index + 1}`,
        role: "reporting_presence",
        present: index > 0,
        latestYear: index === 4 ? 2026 : null,
      })),
    });
    expect(geo).toMatchObject({
      placeNote: null,
      monitoringCaveat: null,
      rankCaveat: null,
      nonCausalCaveat: null,
    });
  });

  it("joins indicator trace rows from country details", () => {
    const [geo] = adaptGeographiesPayload(
      {
        geographies: [
          {
            geo_code: "NR",
            name: "Nauru",
            centroid: { lon: 166.93, lat: -0.52 },
            adaptation_gap_score: 89,
            climate_pressure_score: 55,
            capacity_score: 24,
            score_input_indicator_count: 1,
            context_indicator_count: 0,
            trace_indicator_count: 1,
            score_input_presence: [
              {
                dataset_slug: "sea-level-anomalies",
                dataset_name: "Mean sea level anomalies",
                pillar: "climate_signal",
                present: true,
              },
            ],
            outlook_2030_flat_gap_score: 69,
          },
        ],
      },
      {
        details: {
          NR: {
            indicators: [
              {
                dataset_name: "Mean sea level anomalies",
                pillar: "climate_signal",
                latest_year: 2023,
                latest_value: 0.1,
                scoring_value: 0.1,
                unit: "METER",
                indicator_score: 50,
                source_row_hash: "abcdef123456",
              },
            ],
          },
        },
      },
    );

    expect(geo).toMatchObject({
      scoreInputCount: 1,
      contextCount: 0,
      traceCount: 1,
      scoreInputPresence: [
        {
          datasetSlug: "sea-level-anomalies",
          datasetName: "Mean sea level anomalies",
          pillar: "climate_signal",
          present: true,
        },
      ],
    });
    expect(geo.indicatorRows).toEqual([
      {
        datasetName: "Mean sea level anomalies",
        pillar: "climate_signal",
        latestYear: 2023,
        latestValue: 0.1,
        scoringValue: 0.1,
        unit: "METER",
        indicatorScore: 50,
        sourceRowHash: "abcdef123456",
      },
    ]);
  });

  it("adapts selected-anchored JSD neighbors", () => {
    const [geo] = adaptGeographiesPayload({
      geographies: [
        {
          geo_code: "NR",
          name: "Nauru",
          centroid: { lon: 166.93, lat: -0.52 },
          adaptation_gap_score: 89,
          climate_pressure_score: 55,
          capacity_score: 24,
          score_input_indicator_count: 8,
          context_indicator_count: 1,
          trace_indicator_count: 9,
          score_input_presence: [],
          outlook_2030_flat_gap_score: 69,
          similarity_neighbors: [
            {
              neighbor_geo_code: "GU",
              neighbor_name: "Guam",
              similarity_rank: 1,
              jsd_distance: 0.0812,
              similarity_band: "similar_profile",
              reason_label: "Both profiles lean toward data visibility.",
              neighbor_caveat: "Similarity is about official-data profiles only.",
            },
          ],
        },
      ],
    });

    expect(geo.similarityNeighbors).toEqual([
      {
        code: "GU",
        name: "Guam",
        rank: 1,
        jsd: 0.0812,
        band: "similar profile",
        reason: "Both profiles lean toward data visibility.",
        caveat: "Similarity is about official-data profiles only.",
      },
    ]);
  });
});
