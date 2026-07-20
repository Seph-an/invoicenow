import { describe, expect, it } from "vitest";
import { calculateTotals, clampPercentage } from "./calculations";
import type { InvoiceItem } from "./types";

const item = (rate: number, quantity = 1): InvoiceItem => ({ id: `${rate}-${quantity}`, description: "Test", rate, quantity });

describe("calculateTotals", () => {
  it("rounds line items in currency minor units", () => {
    expect(calculateTotals([item(0.1), item(0.2)], "USD", 0, 0).total).toBe(0.3);
  });

  it("applies discount before tax with deterministic rounding", () => {
    expect(calculateTotals([item(19.99, 3)], "USD", 10, 16)).toEqual({
      subtotal: 59.97, discountAmount: 6, taxable: 53.97, taxAmount: 8.64, total: 62.61
    });
  });

  it("supports currencies with zero minor digits", () => {
    expect(calculateTotals([item(10.6)], "UGX", 0, 0).total).toBe(11);
  });

  it("clamps percentages", () => {
    expect(clampPercentage(-10)).toBe(0);
    expect(clampPercentage(120)).toBe(100);
  });
});
