import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import {
  buildGraticuleFeatureCollection,
  buildAtlasFeatureCollection,
  fitBoundsForPacific,
  assignLandAnchors,
  markerPaintFor,
  mapMotionDuration,
  mapStatusDescription,
  shouldReframeSelection,
  toMapLibreCollection,
} from "./atlasMapModel";

const baseGeo: Geo = {
  code: "NR",
  name: "Nauru",
  subregion: "Micronesia",
  status: "Country",
  placeNote: null,
  lon: 166.93,
  lat: -0.52,
  gap: 71,
  pressure: 55,
  capacity: 24,
  scoreInputCount: 6,
  contextCount: 0,
  traceCount: 6,
  scoreInputPresence: [],
  regionalStory: {
    water: { firstYear: null, latestYear: null, changePercentagePoints: null },
    renewable: { firstYear: null, latestYear: null, changePercentagePoints: null },
    completeOverlap: false,
    quadrant: "missing_overlap",
    visibility: [],
  },
  reportingStatus: "reported_zero_latest_count",
  monitoringCount: 0,
  latestMonitoringYear: 2024,
  monitoringCaveat: null,
  storyPriority: 1,
  rankMin: 3,
  rankMax: 12,
  rankRange: 9,
  robustness: "fragile",
  rankCaveat: null,
  storyLabel: "High gap with a reporting caveat",
  nonCausalCaveat: null,
  topPressure: ["Sea level"],
  topCapacity: ["Protected area"],
  indicatorRows: [],
  similarityNeighbors: [],
  outlook2030Flat: 69,
  outlookDisplay: "show_with_strong_caveat",
};

const defaultGeos = Array.from({ length: 22 }, (_, index) => ({
  ...baseGeo,
  code: index === 0 ? "NR" : `G${index}`,
  name: index === 0 ? "Nauru" : `Geography ${index}`,
}));
const defaultOptions = {
  activeScore: "gap" as const,
  viewMode: "default" as const,
  outlookOn: false,
  selectedCode: null,
  priorityCodes: [],
};

describe("atlas map model", () => {
  it("describes rendered map evidence in the normal state", () => {
    expect(mapStatusDescription(false, "Gap", "default")).toBe(
      "Map of 22 Pacific geographies shown as presence marks over Natural Earth land context. Active layer: Gap. The map is a comparative screen, not a definitive ranking.",
    );
  });

  it("does not describe unrendered evidence when the map fails", () => {
    const description = mapStatusDescription(true, "Gap", "default");

    expect(description).toBe(
      "Interactive map unavailable. No map evidence is displayed. Story, controls, place details, and Methods remain available.",
    );
    expect(description).not.toContain("22 Pacific geographies");
    expect(description).not.toContain("Natural Earth");
  });

  it("keeps 22 selectable evidence marks in the default collection", () => {
    const collection = buildAtlasFeatureCollection(defaultGeos, defaultOptions);
    expect(collection.features).toHaveLength(22);
    expect(new Set(collection.features.map((feature) => feature.properties.code)).size).toBe(22);
  });

  it("makes overview map and land paint model-independent and scoreless", () => {
    const divergentGeos = [
      baseGeo,
      {
        ...baseGeo,
        code: "TV",
        gap: 3,
        pressure: 97,
        capacity: 88,
        scoreInputCount: 1,
        contextCount: 1,
        reportingStatus: "missing_monitoring_dataset_row" as const,
        rankRange: 15,
        storyPriority: 1 as const,
        outlook2030Flat: 99,
        outlookDisplay: "withhold" as const,
      },
    ];
    const collection = buildAtlasFeatureCollection(divergentGeos, {
      activeScore: "capacity",
      viewMode: "overview",
      outlookOn: true,
      selectedCode: null,
      priorityCodes: ["NR", "TV"],
    });
    const properties = collection.features.map((feature) => feature.properties);

    expect(properties[0]).toMatchObject({
      scoreValue: null,
      priority: false,
      withheld: false,
      dimmed: false,
      opacity: 1,
      strokeDasharray: null,
      hatch: false,
    });
    for (const key of [
      "scoreValue",
      "fillColor",
      "strokeColor",
      "radius",
      "opacity",
      "priority",
      "dimmed",
      "withheld",
      "reportingStatus",
      "ringVariant",
      "strokeDasharray",
      "hatch",
    ] as const) {
      expect(properties[1][key]).toEqual(properties[0][key]);
    }
    expect(properties[0].fillColor).not.toBe("transparent");
    expect(properties[0].reportingStatus).toBe(properties[1].reportingStatus);
    expect(properties[0].ringVariant).toBe(properties[1].ringVariant);
    expect(divergentGeos.map((geo) => geo.reportingStatus)).toEqual([
      "reported_zero_latest_count",
      "missing_monitoring_dataset_row",
    ]);
  });

  it("keeps reporting states and selected emphasis during refactor", () => {
    const selected = buildAtlasFeatureCollection(defaultGeos, { ...defaultOptions, selectedCode: "NR" });
    expect(selected.features.find((feature) => feature.properties.code === "NR")?.properties)
      .toMatchObject({ selected: true, reportingStatus: "reported_zero_latest_count" });
  });

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

  it("only reframes a selection when it is hidden or covered by the panel", () => {
    expect(shouldReframeSelection({ pointVisible: true, pointCoveredByPanel: false })).toBe(false);
    expect(shouldReframeSelection({ pointVisible: false, pointCoveredByPanel: false })).toBe(true);
    expect(shouldReframeSelection({ pointVisible: true, pointCoveredByPanel: true })).toBe(true);
  });

  it("does not produce physical connectors for evidence-profile similarity", () => {
    const collection = buildAtlasFeatureCollection([baseGeo], {
      activeScore: "gap",
      viewMode: "default",
      outlookOn: false,
      selectedCode: "NR",
      priorityCodes: [],
    });

    expect(collection.features.every((feature) => feature.geometry.type === "Point")).toBe(true);
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
