import { describe, expect, it } from "vitest";
import { toLogPrice, fromLogPrice, MIN_PRICE, MAX_PRICE } from "./priceSliderHelpers";

describe("priceSliderHelpers", () => {
  it("maps slider extremes to min/max price", () => {
    expect(toLogPrice(0)).toBe(MIN_PRICE);
    expect(toLogPrice(100)).toBeCloseTo(MAX_PRICE, 0);
  });

  it("round-trips slider -> price -> slider near mid values", () => {
    const midSlider = 50;
    const price = toLogPrice(midSlider);
    const back = fromLogPrice(price);
    expect(back).toBeGreaterThan(45);
    expect(back).toBeLessThan(55);
  });

  it("clamps invalid inputs gracefully", () => {
    expect(fromLogPrice(-10)).toBe(0);
    expect(toLogPrice(150)).toBeCloseTo(MAX_PRICE, 0);
    expect(fromLogPrice(MAX_PRICE * 2)).toBe(100);
  });
});
