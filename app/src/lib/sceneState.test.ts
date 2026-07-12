import { describe, expect, it } from "vitest";
import { pickActiveScene, requestedSceneIndexAfterKey, sceneIndexAfterKey } from "./sceneState";

describe("scene state", () => {
  it("chooses the most visible intersecting scene", () => {
    expect(
      pickActiveScene([
        { index: 1, ratio: 0.42, isIntersecting: true },
        { index: 2, ratio: 0.71, isIntersecting: true },
        { index: 3, ratio: 0.88, isIntersecting: false },
      ]),
    ).toBe(2);
  });

  it("clamps keyboard navigation", () => {
    expect(sceneIndexAfterKey(0, "ArrowUp", 5)).toBe(0);
    expect(sceneIndexAfterKey(4, "PageDown", 5)).toBe(4);
    expect(sceneIndexAfterKey(2, "Home", 5)).toBe(0);
    expect(sceneIndexAfterKey(2, "End", 5)).toBe(4);
  });

  it("keeps the latest requested index while observer state lags", () => {
    expect(requestedSceneIndexAfterKey(3, 5, "Home", 6)).toBe(0);
    expect(requestedSceneIndexAfterKey(3, 0, "PageDown", 6)).toBe(1);
    expect(requestedSceneIndexAfterKey(3, null, "PageDown", 6)).toBe(4);
  });
});
