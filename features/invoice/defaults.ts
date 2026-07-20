import { DEFAULT_CURRENCY } from "./currencies";
import type { ClientInfo, CompanyInfo, InvoiceDraft, InvoiceItem } from "./types";

export function createItem(stableId?: string): InvoiceItem {
  const id = stableId ?? (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  return { id, description: "", quantity: 1, rate: 0 };
}

function toLocalIsoDate(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function getDefaultCompanyInfo(): CompanyInfo {
  return { name: "Your Company", address: "Your business address", email: "your@email.com", invoiceNumber: "INV-0001" };
}

export function getDefaultClientInfo(now = new Date()): ClientInfo {
  const due = new Date(now);
  due.setDate(due.getDate() + 30);
  return {
    name: "Client Company", address: "Client address", email: "client@email.com",
    date: toLocalIsoDate(now), dueDate: toLocalIsoDate(due)
  };
}

export function createDefaultDraft(): InvoiceDraft {
  return {
    version: 1, currency: DEFAULT_CURRENCY, logo: null, documentType: "invoice",
    companyInfo: getDefaultCompanyInfo(), clientInfo: getDefaultClientInfo(),
    paymentTermsEnabled: false, paymentTerms: "", notesEnabled: false, notes: "",
    items: [createItem("initial-item")], taxPercent: 0, discountEnabled: false, discountPercent: 0
  };
}
