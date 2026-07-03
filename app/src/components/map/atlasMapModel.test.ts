import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import {
  buildGraticuleFeatureCollection,
  buildAtlasFeatureCollection,
  fitBoundsForPacific,
  markerPaintFor,
} from "./atlasMapModel";

const baseGeo: Geo = {
  code: "NR",
  name: "Nauru",
  subregion: "Micronesia",
  status: "Country",
  lon: 166.93,
  lat: -0.52,
  gap: 71,
  pressure: 55,
  capacity: 24,
  indicators: 6,
  reportingStatus: "reported_zero_latest_count",
  monitoringCount: 0,
  latestMonitoringYear: 2024,
  storyPriority: 1,
  rankMin: 3,
  rankMax: 12,
  rankRange: 9,
  robustness: "fragile",
  storyLabel: "High gap with a reporting caveat",
  topPressure: ["Sea level"],
  topCapacity: ["Protected area"],
  indicatorRows: [],
  outlook2030Flat: 69,
  outlookDisplay: "show_with_strong_caveat",
};

describe("atlas map model", () => {
  it("builds MapLibre point features without changing centroid coordinates", () => {
    const collection = buildAtlasFeatureCollection([baseGeo], {
      activeScore: "gap",
      viewMode: "default",
      outlookOn: false,
      selectedCode: "NR",
      compareCode: "TV",
      priorityCodes: ["NR"],
    });

    expect(collection.features).toHaveLength(1);
    expect(collection.features[0].geometry.coordinates).toEqual([166.93, -0.52]);
    expect(collection.features[0].properties).toMatchObject({
      code: "NR",
      name: "Nauru",
      scoreValue: 71,
      radius: 12,
      selected: true,
      priority: false,
      dimmed: false,
      reportingStatus: "reported_zero_latest_count",
      geometryStatus: "centroid_fallback",
    });
  });

  it("withholds outlook marks instead of coloring weak outlook rows", () => {
    const collection = buildAtlasFeatureCollection(
      [{ ...baseGeo, outlookDisplay: "withhold", outlook2030Flat: 80 }],
      {
        activeScore: "gap",
        viewMode: "default",
        outlookOn: true,
        selectedCode: null,
        compareCode: null,
        priorityCodes: [],
      },
    );

    expect(collection.features[0].properties).toMatchObject({
      scoreValue: null,
      withheld: true,
      fillColor: "transparent",
    });
  });

  it("returns dashed and hatch paint cues for monitoring reporting states", () => {
    expect(markerPaintFor("reported_positive_latest_count")).toMatchObject({
      strokeDasharray: null,
      hatch: false,
    });
    expect(markerPaintFor("reported_zero_latest_count")).toMatchObject({
      strokeDasharray: [2, 2],
      hatch: false,
    });
    expect(markerPaintFor("missing_monitoring_dataset_row")).toMatchObject({
      strokeDasharray: [1, 2],
      hatch: true,
    });
  });

  it("uses Pacific antimeridian-aware bounds for MapLibre fitting", () => {
    expect(fitBoundsForPacific()).toEqual([
      [130, -30],
      [240, 20],
    ]);
  });

  it("builds graticule line features for the Pacific map viewport", () => {
    const collection = buildGraticuleFeatureCollection({
      longitudes: [180],
      latitudes: [0],
      bounds: [
        [130, -30],
        [240, 20],
      ],
    });

    expect(collection.features).toHaveLength(2);
    expect(collection.features[0]).toMatchObject({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [180, -30],
          [180, 20],
        ],
      },
      properties: { kind: "longitude", value: 180 },
    });
    expect(collection.features[1].properties).toMatchObject({ kind: "latitude", value: 0 });
  });
});
