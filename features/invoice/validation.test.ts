import { describe, expect, it } from "vitest";
import { getDefaultCompanyInfo } from "./defaults";
import { normalizeCompanyInfo, normalizeItems, toPositiveNumber } from "./validation";

describe("persisted invoice validation", () => {
  it("falls back for malformed company fields", () => {
    const fallback = getDefaultCompanyInfo();
    expect(normalizeCompanyInfo({ name: 42, email: "valid@example.com" }, fallback)).toEqual({
      ...fallback,
      email: "valid@example.com"
    });
  });

  it("drops malformed items and prevents negative values", () => {
    const fallback = [{ id: "initial", description: "", quantity: 1, rate: 0 }];
    expect(normalizeItems([{ id: "saved", quantity: -1, rate: -2 }], fallback)[0]).toMatchObject({
      id: "saved", quantity: 1, rate: 0
    });
  });

  it("uses the prior value for invalid numeric input", () => {
    expect(toPositiveNumber("not-a-number", 12)).toBe(12);
  });
});
