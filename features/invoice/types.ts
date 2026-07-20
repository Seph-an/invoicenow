export type DocumentType = "invoice" | "quotation";

export type InvoiceItem = { id: string; description: string; quantity: number; rate: number };
export type CompanyInfo = { name: string; address: string; email: string; invoiceNumber: string };
export type ClientInfo = { name: string; address: string; email: string; date: string; dueDate: string };

export type InvoiceDraft = {
  version: 1;
  currency: string;
  logo: string | null;
  documentType: DocumentType;
  companyInfo: CompanyInfo;
  clientInfo: ClientInfo;
  paymentTermsEnabled: boolean;
  paymentTerms: string;
  notesEnabled: boolean;
  notes: string;
  items: InvoiceItem[];
  taxPercent: number;
  discountEnabled: boolean;
  discountPercent: number;
};
