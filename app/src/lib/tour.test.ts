import { describe, expect, it } from "vitest";
import { shouldShowSimilarityArcs } from "./tour";

describe("tour similarity arc gate", () => {
  it("shows arcs only for selected default-map similarity contexts", () => {
    expect(shouldShowSimilarityArcs({
      hasSelection: false,
      viewMode: "default",
      outlookOn: false,
      mode: "explore",
      beatId: "explore",
    })).toBe(false);
    expect(shouldShowSimilarityArcs({
      hasSelection: true,
      viewMode: "coverage",
      outlookOn: false,
      mode: "explore",
      beatId: "quiet",
    })).toBe(false);
    expect(shouldShowSimilarityArcs({
      hasSelection: true,
      viewMode: "default",
      outlookOn: true,
      mode: "explore",
      beatId: "explore",
    })).toBe(false);
    expect(shouldShowSimilarityArcs({
      hasSelection: true,
      viewMode: "default",
      outlookOn: false,
      mode: "guided",
      beatId: "anchor",
    })).toBe(false);
    expect(shouldShowSimilarityArcs({
      hasSelection: true,
      viewMode: "default",
      outlookOn: false,
      mode: "guided",
      beatId: "fingerprint",
    })).toBe(true);
    expect(shouldShowSimilarityArcs({
      hasSelection: true,
      viewMode: "default",
      outlookOn: false,
      mode: "explore",
      beatId: "explore",
    })).toBe(true);
  });
});
