import { describe, expect, it } from "vitest";
import { ownScrollRestoration, parseAtlasUrl, serializeAtlasUrl } from "./urlState";

describe("atlas URL state", () => {
  it("round-trips the explicit overview view", () => {
    const state = {
      mode: "explore" as const,
      scene: "unequal-visibility",
      layer: "capacity" as const,
      view: "overview" as const,
      place: "NR",
      outlook: false,
    };
    const url = serializeAtlasUrl(state);

    expect(url).toContain("view=overview");
    expect(parseAtlasUrl(url, ["NR", "TV"])).toEqual(state);
  });

  it("maps retired guided scene links to canonical safe states", () => {
    const retiredScenes = {
      "what-this-atlas-is-asking": "what-the-records-show",
      "what-the-map-can-see": "twenty-two-pacific-places",
      "where-the-record-breaks": "unequal-visibility",
      "the-gap-has-two-sides": "different-directions",
      "similar-scores-different-records": "unequal-visibility",
      "the-order-does-not-hold-still": "unequal-visibility",
    };

    for (const [retired, scene] of Object.entries(retiredScenes)) {
      expect(
        parseAtlasUrl(
          `?scene=${retired}&layer=capacity&view=uncertainty&place=NR&outlook=1`,
          ["NR", "TV"],
        ),
      ).toEqual({
        mode: "guided",
        scene,
        layer: "gap",
        view: "overview",
        place: null,
        outlook: false,
      });
    }
  });

  it("falls back safely from unknown values", () => {
    for (const invalidScene of ["unknown", "toString"]) {
      expect(
        parseAtlasUrl(
          `?scene=${invalidScene}&layer=capacity&view=uncertainty&place=NR&outlook=1`,
          ["NR", "TV"],
        ),
      ).toEqual({
        mode: "guided",
        scene: "what-the-records-show",
        layer: "gap",
        view: "overview",
        place: null,
        outlook: false,
      });
    }
  });

  it("keeps overview explicit while omitting dormant defaults", () => {
    expect(
      serializeAtlasUrl({
        mode: "guided",
        scene: "what-the-records-show",
        layer: "gap",
        view: "overview",
        place: null,
        outlook: false,
      }),
    ).toBe("?view=overview");
  });

  it("keeps copied-scene hydration in control of reload scrolling", () => {
    const history: Pick<History, "scrollRestoration"> = { scrollRestoration: "auto" };

    ownScrollRestoration(history);
    expect(history.scrollRestoration).toBe("manual");
  });
});
