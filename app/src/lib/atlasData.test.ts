import { describe, expect, it } from "vitest";
import { adaptGeographiesPayload } from "./atlasData";

describe("atlas data adapter", () => {
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
            included_indicator_count: 1,
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
          included_indicator_count: 9,
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
