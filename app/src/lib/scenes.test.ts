import { describe, expect, it } from "vitest";
import { HANDOFF_COPY, SCENES } from "./scenes";

describe("fullscreen guided story", () => {
  it("uses one premise followed by the approved five-scene spine", () => {
    expect(SCENES.map((scene) => scene.id)).toEqual([
      "what-this-atlas-is-asking",
      "what-the-map-can-see",
      "where-the-record-breaks",
      "the-gap-has-two-sides",
      "similar-scores-different-records",
      "the-order-does-not-hold-still",
    ]);
    expect(SCENES).toHaveLength(6);
    expect(SCENES[0]).toMatchObject({
      visual: "premise",
      stage: "map-immersive",
      title: "Climate pressure is not the same as adaptation capacity.",
    });
    expect(SCENES.slice(1, 4).every((scene) => scene.stage === "map-immersive")).toBe(true);
    expect(SCENES.slice(4).every((scene) => scene.stage === "figure-takeover")).toBe(true);
    expect(SCENES.every((scene) => scene.source.length > 0)).toBe(true);
    expect(SCENES.every((scene) => scene.caveat.length > 0)).toBe(true);
    expect(SCENES.some((scene) => scene.id.includes("fingerprint"))).toBe(false);
    expect(HANDOFF_COPY).toContain("Explore freely");
  });

  it("identifies comparison focus by stable scene meaning", () => {
    expect(SCENES.find((scene) => scene.id === "similar-scores-different-records")?.visual).toBe("comparison");
    expect(SCENES[3].visual).not.toBe("comparison");
  });
});
