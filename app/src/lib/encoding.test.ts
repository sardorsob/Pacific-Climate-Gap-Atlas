import { describe, expect, it } from "vitest";
import { signedChange } from "./encoding";

describe("signedChange", () => {
  it.each([
    [1.92, "+1.92"],
    [-11.23, "−11.23"],
    [0, "0.00"],
    [-0, "0.00"],
  ])("formats %s as %s", (value, expected) => {
    expect(signedChange(value)).toBe(expected);
  });
});
