import { describe, expect, it } from "vitest";
import { HANDOFF_COPY, SCENES } from "./scenes";

describe("regional guided story", () => {
  it("uses the approved four-scene contract and neutral canonical state", () => {
    expect(SCENES.map((scene) => scene.id)).toEqual([
      "what-the-records-show",
      "twenty-two-pacific-places",
      "different-directions",
      "unequal-visibility",
    ]);
    expect(SCENES.map((scene) => scene.visual)).toEqual([
      "premise",
      "presence",
      "movement",
      "visibility",
    ]);
    expect(SCENES.map((scene) => scene.stage)).toEqual([
      "map-immersive",
      "map-immersive",
      "figure-takeover",
      "figure-takeover",
    ]);
    expect(SCENES.every((scene) => scene.state.view === "overview")).toBe(true);
    expect(SCENES.every((scene) => scene.state.selected === null)).toBe(true);
    expect(SCENES.every((scene) => scene.source.length > 0)).toBe(true);
    expect(SCENES.every((scene) => scene.caveat.length > 0)).toBe(true);
  });

  it("states only the approved regional evidence and keeps the handoff separate", () => {
    const publicCopy = SCENES.map(({ title, claim, caveat }) => `${title} ${claim} ${caveat}`).join(" ");

    expect(publicCopy).toContain("22 Pacific places");
    expect(publicCopy).toContain("safely managed drinking-water access");
    expect(publicCopy).toContain("19 complete comparisons");
    expect(publicCopy).toContain("Guam, Pitcairn, and Tokelau");
    expect(publicCopy).toContain("7 places");
    expect(publicCopy).toContain("6");
    expect(publicCopy).toContain("277 place-and-dataset entries are present and 31 are absent");
    expect(publicCopy).not.toMatch(/Nauru|Tuvalu|pressure|capacity|rank|Adaptation Gap|fragile/i);
    expect(HANDOFF_COPY).toBe(
      "The records for these 22 places do not show one shared direction of change, and they do not cover every place evenly. This atlas compares official records; it does not rank need, readiness, or vulnerability.",
    );
    expect(HANDOFF_COPY).not.toContain("Select a place to inspect");
    expect(SCENES.some((scene) => scene.claim === HANDOFF_COPY)).toBe(false);
  });

  it("describes the two changes in comparable units without conflating the measures", () => {
    const movement = SCENES.find((scene) => scene.id === "different-directions");

    expect(movement?.caveat).toBe(
      "Both changes are measured in percentage points, but the measures have different meanings and denominators, and their first and latest years differ. The records do not show why the values changed.",
    );
    expect(movement?.caveat).not.toContain("different units");
  });
});
