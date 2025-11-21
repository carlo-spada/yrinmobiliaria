import { describe, expect, it } from "vitest";
import { isValidCoordinate, normalizeCoord } from "./mapUtils";

describe("mapUtils", () => {
  it("validates numeric and string coordinates", () => {
    expect(isValidCoordinate(17.0, -96.7)).toBe(true);
    expect(isValidCoordinate("17.0", "-96.7")).toBe(true);
  });

  it("rejects out-of-range or non-numeric coordinates", () => {
    expect(isValidCoordinate(200, 0)).toBe(false);
    expect(isValidCoordinate(0, -500)).toBe(false);
    expect(isValidCoordinate("abc", "def")).toBe(false);
  });

  it("normalizes valid values and returns null for invalid", () => {
    expect(normalizeCoord("10.5")).toBe(10.5);
    expect(normalizeCoord(0)).toBe(0);
    expect(normalizeCoord("abc")).toBeNull();
    expect(normalizeCoord(undefined)).toBeNull();
  });
});
