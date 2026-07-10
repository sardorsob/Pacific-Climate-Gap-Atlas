import { describe, expect, it } from "vitest";
import { HANDOFF_COPY, SCENES } from "./scenes";

describe("five-scene story", () => {
  it("uses the approved ordered scene spine", () => {
    expect(SCENES.map((scene) => scene.id)).toEqual([
      "what-the-map-can-see",
      "where-the-record-breaks",
      "the-gap-has-two-sides",
      "similar-scores-different-records",
      "the-order-does-not-hold-still",
    ]);
    expect(SCENES).toHaveLength(5);
    expect(SCENES.some((scene) => scene.id.includes("fingerprint"))).toBe(false);
    expect(SCENES.every((scene) => scene.source.length > 0)).toBe(true);
    expect(SCENES.every((scene) => scene.caveat.length > 0)).toBe(true);
    expect(HANDOFF_COPY).toContain("Explore freely");
  });
});
