import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import {
  buildGraticuleFeatureCollection,
  buildAtlasFeatureCollection,
  buildSimilarityArcCollection,
  fitBoundsForPacific,
  assignLandAnchors,
  markerPaintFor,
  mapMotionDuration,
  similarityArcLimitForWidth,
  toMapLibreCollection,
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
  scoreInputCount: 6,
  contextCount: 0,
  traceCount: 6,
  scoreInputPresence: [],
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

  it("keeps the primary presence mark size independent of evidence count", () => {
    const collection = buildAtlasFeatureCollection(
      [baseGeo, { ...baseGeo, code: "TV", scoreInputCount: 8 }],
      {
        activeScore: "gap",
        viewMode: "default",
        outlookOn: false,
        selectedCode: null,
        priorityCodes: [],
      },
    );

    expect(collection.features[0].properties.radius).toBe(
      collection.features[1].properties.radius,
    );
  });

  it("withholds outlook marks instead of coloring weak outlook rows", () => {
    const collection = buildAtlasFeatureCollection(
      [{ ...baseGeo, outlookDisplay: "withhold", outlook2030Flat: 80 }],
      {
        activeScore: "gap",
        viewMode: "default",
        outlookOn: true,
        selectedCode: null,
        priorityCodes: [],
      },
    );

    expect(collection.features[0].properties).toMatchObject({
      scoreValue: null,
      withheld: true,
      fillColor: "transparent",
    });
  });

  it("keeps selected fallback points visible until island marks replace them", () => {
    const collection = buildAtlasFeatureCollection([baseGeo], {
      activeScore: "gap",
      viewMode: "default",
      outlookOn: false,
      selectedCode: "NR",
      priorityCodes: [],
    });

    expect(collection.features[0].properties).toMatchObject({
      selected: true,
      opacity: 1,
    });
    expect(collection.features[0].properties).not.toHaveProperty("compare");
  });

  it("keeps centroid presence marks when island texture is available", () => {
    const collection = buildAtlasFeatureCollection([baseGeo], {
      activeScore: "gap",
      viewMode: "default",
      outlookOn: false,
      selectedCode: null,
      priorityCodes: [],
    });

    const shifted = toMapLibreCollection(collection);
    expect(shifted.features).toHaveLength(1);
    expect(shifted.features[0].properties.code).toBe("NR");
    expect(shifted.features[0].geometry.coordinates).toEqual([166.93, -0.52]);
  });

  it("collapses map motion when reduced motion is requested", () => {
    expect(mapMotionDuration(false)).toBeGreaterThan(0);
    expect(mapMotionDuration(true)).toBe(0);
  });

  it("builds selected-only similarity arcs from generated nearest neighbors", () => {
    const geos: Geo[] = [
      {
        ...baseGeo,
        code: "NR",
        lon: 166.93,
        lat: -0.52,
        similarityNeighbors: [
          {
            code: "MP",
            name: "Northern Mariana Islands",
            rank: 1,
            jsd: 0.0797,
            band: "similar profile",
            reason: "Selected profile leans toward data visibility.",
            caveat: "Similarity is about official-data profiles only.",
          },
          {
            code: "GU",
            name: "Guam",
            rank: 2,
            jsd: 0.0809,
            band: "similar profile",
            reason: "Selected profile leans toward data visibility.",
            caveat: "Similarity is about official-data profiles only.",
          },
          {
            code: "NU",
            name: "Niue",
            rank: 3,
            jsd: 0.0895,
            band: "similar profile",
            reason: "Both profiles lean toward data visibility.",
            caveat: "Similarity is about official-data profiles only.",
          },
        ],
      },
      { ...baseGeo, code: "MP", name: "Northern Mariana Islands", lon: 145.67, lat: 15.1 },
      { ...baseGeo, code: "GU", name: "Guam", lon: 144.79, lat: 13.44 },
      { ...baseGeo, code: "NU", name: "Niue", lon: -169.87, lat: -19.05 },
      { ...baseGeo, code: "TV", name: "Tuvalu", lon: 179.2, lat: -8.52 },
    ];

    const collection = buildSimilarityArcCollection(geos, "NR");

    expect(collection.features.map((feature) => feature.properties.neighborCode)).toEqual(["MP", "GU", "NU"]);
    expect(collection.features[0]).toMatchObject({
      geometry: {
        type: "LineString",
        coordinates: [
          [166.93, -0.52],
          [145.67, 15.1],
        ],
      },
      properties: {
        anchorCode: "NR",
        neighborCode: "MP",
        neighborName: "Northern Mariana Islands",
        rank: 1,
        jsd: 0.0797,
        width: 1.5,
        opacity: 0.34,
      },
    });
    expect(collection.features[2].geometry.coordinates[1][0]).toBeCloseTo(190.13);
  });

  it("omits similarity arcs without a selected geography and can simplify to one neighbor", () => {
    const geos: Geo[] = [
      {
        ...baseGeo,
        similarityNeighbors: [
          { code: "GU", name: "Guam", rank: 1, jsd: 0.08, band: "similar", reason: "", caveat: "" },
          { code: "MISSING", name: "Missing", rank: 2, jsd: 0.09, band: "similar", reason: "", caveat: "" },
        ],
      },
      { ...baseGeo, code: "GU", name: "Guam", lon: 144.79, lat: 13.44 },
    ];

    expect(buildSimilarityArcCollection(geos, null).features).toEqual([]);
    expect(buildSimilarityArcCollection(geos, "NR", 1).features.map((f) => f.properties.neighborCode)).toEqual(["GU"]);
  });

  it("limits similarity arcs on compact mobile map widths", () => {
    expect(similarityArcLimitForWidth(390)).toBe(1);
    expect(similarityArcLimitForWidth(900)).toBe(3);
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
