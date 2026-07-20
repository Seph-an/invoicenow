import type { DocumentType } from "./types";

export const DOCUMENT_NUMBER_FALLBACK = "-0001";
export const getDocumentPrefix = (type: DocumentType) => type === "quotation" ? "QTN" : "INV";

export function formatDocumentNumber(value: string | null | undefined, type: DocumentType) {
  const trimmed = value?.trim();
  const match = trimmed?.match(/^(?:INV|QTN)(.*)$/i);
  const rawSuffix = match ? match[1] : trimmed;
  const suffix = !rawSuffix ? DOCUMENT_NUMBER_FALLBACK : rawSuffix.startsWith("-") ? rawSuffix : `-${rawSuffix}`;
  return `${getDocumentPrefix(type)}${suffix}`;
}

export function getDocumentLabels(type: DocumentType) {
  const noun = type === "quotation" ? "Quotation" : "Invoice";
  return { noun, heading: noun.toUpperCase(), numberLabel: `${noun} Number`, fileFallback: noun.toLowerCase() };
}
