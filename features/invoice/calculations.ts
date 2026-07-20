import { getCurrencyScale } from "./currencies";
import type { InvoiceItem } from "./types";

export type InvoiceTotals = { subtotal: number; discountAmount: number; taxable: number; taxAmount: number; total: number };

export function clampPercentage(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

export function calculateTotals(items: InvoiceItem[], currency: string, discountPercent: number, taxPercent: number): InvoiceTotals {
  const scale = getCurrencyScale(currency);
  const toMinor = (amount: number) => Math.round((amount + Number.EPSILON) * scale);
  const subtotalMinor = items.reduce((sum, item) => sum + toMinor(Math.max(0, item.quantity) * Math.max(0, item.rate)), 0);
  const discountMinor = Math.round(subtotalMinor * clampPercentage(discountPercent) / 100);
  const taxableMinor = Math.max(0, subtotalMinor - discountMinor);
  const taxMinor = Math.round(taxableMinor * clampPercentage(taxPercent) / 100);
  return {
    subtotal: subtotalMinor / scale,
    discountAmount: discountMinor / scale,
    taxable: taxableMinor / scale,
    taxAmount: taxMinor / scale,
    total: (taxableMinor + taxMinor) / scale
  };
}
