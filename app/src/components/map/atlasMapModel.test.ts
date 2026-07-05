import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import {
  buildGraticuleFeatureCollection,
  buildAtlasFeatureCollection,
  fitBoundsForPacific,
  assignLandAnchors,
  markerPaintFor,
  nearestLandCenter,
  viewfinderGeometry,
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
  similarityNeighbors: [],
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

  it("ticks the selected point to its own island, not a neighbor's", () => {
    // American Samoa's centroid sits ~0.1 deg from Tutuila and ~1.7 deg from
    // Samoa's islands; the tick must resolve to the closer, own-territory land.
    const tutuila: GeoJSON.Feature = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [189.2, -14.35],
            [189.4, -14.35],
            [189.4, -14.25],
            [189.2, -14.25],
            [189.2, -14.35],
          ],
        ],
      },
    };
    const samoaIsland: GeoJSON.Feature = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [187.3, -13.9],
            [187.9, -13.9],
            [187.9, -13.5],
            [187.3, -13.5],
            [187.3, -13.9],
          ],
        ],
      },
    };
    const land: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [samoaIsland, tutuila],
    };

    const center = nearestLandCenter(-170.7, -14.3, land);
    expect(center).not.toBeNull();
    expect(center!.lon).toBeCloseTo(189.3, 1);
    expect(center!.lat).toBeCloseTo(-14.3, 1);

    expect(nearestLandCenter(-170.7, -14.3, { type: "FeatureCollection", features: [] })).toBeNull();
  });

  it("groups land by nearest scored centroid and leaves far or disputed land unassigned", () => {
    const polygon = (lon: number, lat: number): GeoJSON.Feature => ({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lon - 0.1, lat - 0.1],
            [lon + 0.1, lat - 0.1],
            [lon + 0.1, lat + 0.1],
            [lon - 0.1, lat + 0.1],
            [lon - 0.1, lat - 0.1],
          ],
        ],
      },
    });
    const land: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        polygon(189.3, -14.3), // Tutuila: American Samoa's own island
        polygon(187.6, -13.7), // Upolu-ish: Samoa's island, closer to WS
        polygon(171.35, -22.3), // Matthew & Hunter: disputed, far from both NC and VU
        polygon(155, -40), // far context land, beyond any cutoff
      ],
    };
    const geos = [
      { ...baseGeo, code: "AS", lon: -170.7, lat: -14.3 },
      { ...baseGeo, code: "WS", lon: -172.1, lat: -13.75 },
      { ...baseGeo, code: "NC", lon: 165.8, lat: -21.5 },
      { ...baseGeo, code: "VU", lon: 167.7, lat: -16.2 },
    ];

    const tagged = assignLandAnchors(land, geos);
    const anchors = tagged.features.map((f) => f.properties?.anchorCode ?? null);
    expect(anchors[0]).toBe("AS");
    expect(anchors[1]).toBe("WS");
    expect(anchors[2]).toBe("");
    expect(anchors[3]).toBe("");
    // input collection must not be mutated
    expect(land.features[0].properties).toEqual({});
  });

  it("clamps the viewfinder window and suppresses the tick for on-point land", () => {
    const base = {
      point: { x: 500, y: 400 },
      geoLon: 166.93,
      geoLat: -0.52,
      pointRadius: 12,
      landCenter: null,
    };

    // Mobile-like scale: 1.6 deg would be ~6px, so the 45px floor applies.
    const small = viewfinderGeometry({ ...base, pxPerDeg: { x: 3.7, y: 3.7 }, minViewportSide: 375 });
    expect(small.x1 - small.x0).toBeCloseTo(90, 5);

    // Deep zoom: the window caps at 17% of the shorter viewport side.
    const large = viewfinderGeometry({ ...base, pxPerDeg: { x: 200, y: 200 }, minViewportSide: 900 });
    expect(large.x1 - large.x0).toBeCloseTo(2 * 900 * 0.17, 5);

    // Land essentially under the point (Niue case): no tick.
    const onPoint = viewfinderGeometry({
      ...base,
      pxPerDeg: { x: 12.6, y: 12.6 },
      minViewportSide: 900,
      landCenter: { lon: 166.94, lat: -0.53 },
    });
    expect(onPoint.tick).toBeNull();

    // Land clearly offset: tick starts at the circle edge and points at it.
    const offset = viewfinderGeometry({
      ...base,
      pxPerDeg: { x: 12.6, y: 12.6 },
      minViewportSide: 900,
      landCenter: { lon: 169.0, lat: -0.52 },
    });
    expect(offset.tick).not.toBeNull();
    expect(offset.tick!.x1).toBeGreaterThan(512);
    expect(offset.tick!.x2).toBeCloseTo(500 + (169.0 - 166.93) * 12.6, 3);
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
