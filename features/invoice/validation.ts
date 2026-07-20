import { createItem } from "./defaults";
import type { ClientInfo, CompanyInfo, InvoiceItem } from "./types";

export function normalizeCompanyInfo(raw: unknown, fallback: CompanyInfo): CompanyInfo {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const source = raw as Partial<CompanyInfo>;
  return {
    name: typeof source.name === "string" ? source.name : fallback.name,
    address: typeof source.address === "string" ? source.address : fallback.address,
    email: typeof source.email === "string" ? source.email : fallback.email,
    invoiceNumber: typeof source.invoiceNumber === "string" ? source.invoiceNumber : fallback.invoiceNumber
  };
}

export function normalizeClientInfo(raw: unknown, fallback: ClientInfo): ClientInfo {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const source = raw as Partial<ClientInfo>;
  return {
    name: typeof source.name === "string" ? source.name : fallback.name,
    address: typeof source.address === "string" ? source.address : fallback.address,
    email: typeof source.email === "string" ? source.email : fallback.email,
    date: typeof source.date === "string" ? source.date : fallback.date,
    dueDate: typeof source.dueDate === "string" ? source.dueDate : fallback.dueDate
  };
}

export function normalizeItems(raw: unknown, fallback: InvoiceItem[]): InvoiceItem[] {
  if (!Array.isArray(raw)) return [...fallback];
  const normalized = raw.flatMap((entry): InvoiceItem[] => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Partial<InvoiceItem>;
    return [{
      id: typeof item.id === "string" && item.id.trim() ? item.id : createItem().id,
      description: typeof item.description === "string" ? item.description : "",
      quantity: typeof item.quantity === "number" && item.quantity >= 0 ? item.quantity : 1,
      rate: typeof item.rate === "number" && item.rate >= 0 ? item.rate : 0
    }];
  });
  return normalized.length ? normalized : [...fallback];
}

export function toPositiveNumber(value: string, fallback: number) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}
