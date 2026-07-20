import { describe, expect, it } from "vitest";
import { formatDocumentNumber, getDocumentLabels } from "./document-number";

describe("document numbering", () => {
  it("preserves the suffix when switching document type", () => {
    expect(formatDocumentNumber("INV-0042", "quotation")).toBe("QTN-0042");
  });

  it("uses document-specific labels", () => {
    expect(getDocumentLabels("quotation").numberLabel).toBe("Quotation Number");
  });
});
