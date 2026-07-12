import { describe, expect, it } from "vitest";
import { ownScrollRestoration, parseAtlasUrl, serializeAtlasUrl } from "./urlState";

describe("atlas URL state", () => {
  it("round-trips guided and explore state", () => {
    const state = {
      mode: "explore" as const,
      scene: "the-order-does-not-hold-still",
      layer: "capacity" as const,
      view: "default" as const,
      place: "NR",
      outlook: false,
    };
    expect(parseAtlasUrl(serializeAtlasUrl(state), ["NR", "TV"])).toEqual(state);
  });

  it("drops unknown values instead of crashing", () => {
    expect(parseAtlasUrl("?mode=bad&layer=rainbow&place=ZZ", ["NR", "TV"])).toEqual({
      mode: "guided",
      scene: "what-this-atlas-is-asking",
      layer: "gap",
      view: "default",
      place: null,
      outlook: false,
    });
  });

  it("omits default values while preserving an outlook link", () => {
    expect(
      serializeAtlasUrl({
        mode: "guided",
        scene: "what-this-atlas-is-asking",
        layer: "gap",
        view: "default",
        place: null,
        outlook: true,
      }),
    ).toBe("?outlook=1");
  });

  it("keeps copied-scene hydration in control of reload scrolling", () => {
    const history: Pick<History, "scrollRestoration"> = { scrollRestoration: "auto" };

    ownScrollRestoration(history);
    expect(history.scrollRestoration).toBe("manual");
  });
});
