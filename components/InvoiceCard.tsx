"use client";

import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import Image from "next/image";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import styles from "./InvoiceCard.module.css";

const STORAGE_KEY = "invoice-card-state";
const RESET_EVENT_NAME = "invoice-card:reset";
const DOWNLOAD_EVENT_NAME = "invoice-card:download";
const PREVIEW_EVENT_NAME = "invoice-card:preview";
const DEFAULT_CURRENCY = "USD" as const;

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

type CompanyInfo = {
  name: string;
  address: string;
  email: string;
  invoiceNumber: string;
};

type ClientInfo = {
  name: string;
  address: string;
  email: string;
  date: string;
  dueDate: string;
};

const currencyOptions = [
  { value: "USD", label: "USD - US Dollar", locale: "en-US" },
  { value: "EUR", label: "EUR - Euro", locale: "de-DE" },
  { value: "GBP", label: "GBP - British Pound", locale: "en-GB" },
  { value: "CNY", label: "CNY - Chinese Yuan", locale: "zh-CN" },
  { value: "NGN", label: "NGN - Nigerian Naira", locale: "en-NG" },
  { value: "KES", label: "KES - Kenyan Shilling", locale: "en-KE" },
  { value: "ZAR", label: "ZAR - South African Rand", locale: "en-ZA" },
  { value: "EGP", label: "EGP - Egyptian Pound", locale: "ar-EG" },
  { value: "MAD", label: "MAD - Moroccan Dirham", locale: "fr-MA" },
  { value: "GHS", label: "GHS - Ghanaian Cedi", locale: "en-GH" },
  { value: "TZS", label: "TZS - Tanzanian Shilling", locale: "sw-TZ" },
  { value: "UGX", label: "UGX - Ugandan Shilling", locale: "en-UG" },
  { value: "DZD", label: "DZD - Algerian Dinar", locale: "ar-DZ" },
  { value: "TND", label: "TND - Tunisian Dinar", locale: "fr-TN" },
  { value: "SDG", label: "SDG - Sudanese Pound", locale: "ar-SD" },
  { value: "AOA", label: "AOA - Angolan Kwanza", locale: "pt-AO" },
  { value: "ETB", label: "ETB - Ethiopian Birr", locale: "am-ET" },
  { value: "XAF", label: "XAF - Central African CFA Franc", locale: "fr-CM" },
  { value: "XOF", label: "XOF - West African CFA Franc", locale: "fr-SN" },
  { value: "BWP", label: "BWP - Botswanan Pula", locale: "en-BW" },
  { value: "MUR", label: "MUR - Mauritian Rupee", locale: "en-MU" },
  { value: "MWK", label: "MWK - Malawian Kwacha", locale: "en-MW" },
  { value: "LRD", label: "LRD - Liberian Dollar", locale: "en-LR" },
  { value: "RWF", label: "RWF - Rwandan Franc", locale: "rw-RW" }
] as const;

type CurrencyCode = (typeof currencyOptions)[number]["value"];

type DocumentType = "invoice" | "quotation";

type PersistedState = {
  currency: CurrencyCode;
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

const documentTypeOptions: { value: DocumentType; label: string }[] = [
  { value: "invoice", label: "Generate invoice" },
  { value: "quotation", label: "Generate quotation" }
];

const DOCUMENT_NUMBER_FALLBACK = "-0001";

const getDocumentPrefix = (type: DocumentType) => (type === "quotation" ? "QTN" : "INV");

const extractDocumentNumberSuffix = (value: string | null | undefined) => {
  if (!value) return DOCUMENT_NUMBER_FALLBACK;
  const trimmed = value.trim();
  if (!trimmed) return DOCUMENT_NUMBER_FALLBACK;
  const match = trimmed.match(/^(?:INV|QTN)(.*)$/i);
  if (match) {
    return match[1] || DOCUMENT_NUMBER_FALLBACK;
  }
  return trimmed.startsWith("-") ? trimmed : `-${trimmed}`;
};

const formatDocumentNumber = (value: string | null | undefined, type: DocumentType) => {
  const suffix = extractDocumentNumberSuffix(value);
  const formattedSuffix = suffix || DOCUMENT_NUMBER_FALLBACK;
  return `${getDocumentPrefix(type)}${formattedSuffix}`;
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

function getDefaultCompanyInfo(): CompanyInfo {
  return {
    name: "Your Company",
    address: "Your business address",
    email: "your@email.com",
    invoiceNumber: "INV-0001"
  };
}

function getDefaultClientInfo(): ClientInfo {
  const now = new Date();
  const due = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    name: "Client Company",
    address: "Client address",
    email: "client@email.com",
    date: toIsoDate(now),
    dueDate: toIsoDate(due)
  };
}

function createDefaultItems(): InvoiceItem[] {
  return [createItem()];
}

export function InvoiceCard() {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [documentType, setDocumentType] = useState<DocumentType>("invoice");
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipNextSaveRef = useRef(false);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => getDefaultCompanyInfo());

  const [clientInfo, setClientInfo] = useState<ClientInfo>(() => getDefaultClientInfo());

  const [paymentTermsEnabled, setPaymentTermsEnabled] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("");

  const [notesEnabled, setNotesEnabled] = useState(false);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>(() => createDefaultItems());
  const [taxPercent, setTaxPercent] = useState(0);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const resetForm = useCallback(() => {
    if (typeof window !== "undefined") {
      skipNextSaveRef.current = true;
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setCurrency(DEFAULT_CURRENCY);
    setDocumentType("invoice");
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setCompanyInfo(getDefaultCompanyInfo());
    setClientInfo(getDefaultClientInfo());
    setPaymentTermsEnabled(false);
    setPaymentTerms("");
    setNotesEnabled(false);
    setNotes("");
    setItems(createDefaultItems());
    setTaxPercent(0);
    setDiscountEnabled(false);
    setDiscountPercent(0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const serialized = window.localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        setHasLoaded(true);
        return;
      }

      const parsed: Partial<PersistedState> = JSON.parse(serialized);
      if (typeof parsed.currency === "string" && isSupportedCurrency(parsed.currency)) {
        setCurrency(parsed.currency);
      }

      if (typeof parsed.logo === "string" || parsed.logo === null) {
        setLogo(parsed.logo ?? null);
      }

      if (parsed.documentType === "invoice" || parsed.documentType === "quotation") {
        setDocumentType(parsed.documentType);
      }

      if (parsed.companyInfo) {
        setCompanyInfo((current) => normalizeCompanyInfo(parsed.companyInfo, current));
      }

      if (parsed.clientInfo) {
        setClientInfo((current) => normalizeClientInfo(parsed.clientInfo, current));
      }

      if (typeof parsed.paymentTermsEnabled === "boolean") {
        setPaymentTermsEnabled(parsed.paymentTermsEnabled);
      }

      if (typeof parsed.paymentTerms === "string") {
        setPaymentTerms(parsed.paymentTerms);
      }

      if (typeof parsed.notesEnabled === "boolean") {
        setNotesEnabled(parsed.notesEnabled);
      }

      if (typeof parsed.notes === "string") {
        setNotes(parsed.notes);
      }

      if (parsed.items) {
        setItems((current) => normalizeItems(parsed.items, current));
      }

      if (typeof parsed.taxPercent === "number") {
        setTaxPercent((current) => toPositiveNumber(String(parsed.taxPercent), current));
      }

      if (typeof parsed.discountEnabled === "boolean") {
        setDiscountEnabled(parsed.discountEnabled);
      }

      if (typeof parsed.discountPercent === "number") {
        setDiscountPercent((current) =>
          toPositiveNumber(String(parsed.discountPercent), current)
        );
      }
    } catch (error) {
      console.warn("Unable to load invoice state from storage:", error);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    setCompanyInfo((current) => {
      const formatted = formatDocumentNumber(current.invoiceNumber, documentType);
      if (current.invoiceNumber === formatted) return current;
      return { ...current, invoiceNumber: formatted };
    });
  }, [documentType]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleReset = () => resetForm();
    window.addEventListener(RESET_EVENT_NAME, handleReset);
    return () => {
      window.removeEventListener(RESET_EVENT_NAME, handleReset);
    };
  }, [resetForm]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoaded) return;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const state: PersistedState = {
      currency,
      logo,
      documentType,
      companyInfo,
      clientInfo,
      paymentTermsEnabled,
      paymentTerms,
      notesEnabled,
      notes,
      items,
      taxPercent,
      discountEnabled,
      discountPercent
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Unable to persist invoice state:", error);
    }
  }, [
    hasLoaded,
    currency,
    logo,
    documentType,
    companyInfo,
    clientInfo,
    paymentTermsEnabled,
    paymentTerms,
    notesEnabled,
    notes,
    items,
    taxPercent,
    discountEnabled,
    discountPercent
  ]);

  const numberFormatter = useMemo(() => {
    const option = currencyOptions.find((opt) => opt.value === currency) ?? currencyOptions[0];
    return new Intl.NumberFormat(option.locale, {
      style: "currency",
      currency: option.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [currency]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.rate, 0),
    [items]
  );

  const discountAmount = discountEnabled ? subtotal * (discountPercent / 100) : 0;
  const taxable = Math.max(subtotal - discountAmount, 0);
  const taxAmount = taxable * (taxPercent / 100);
  const total = taxable + taxAmount;

  const handleDownload = useCallback(async (mode: "download" | "preview" = "download") => {
    if (typeof window === "undefined") {
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;

    if (logo) {
      const format = getImageFormat(logo);
      if (format) {
        try {
          const props = doc.getImageProperties(logo);
          const maxWidth = 34;
          const calculatedWidth = Math.min(maxWidth, props.width / 3);
          const aspectRatio = props.height / props.width || 1;
          const width = calculatedWidth || maxWidth;
          const height = width * aspectRatio;
          const logoX = pageWidth - margin - width;
          const logoY = margin;
          doc.addImage(logo, format, logoX, logoY, width, height);
          y = Math.max(y, logoY + height + 6);
        } catch (error) {
          console.warn("Unable to render logo in PDF:", error);
        }
      }
    }

    const invoiceTitle = companyInfo.name?.trim() || "Invoice";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(invoiceTitle, margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y += 8;
    doc.text(`Invoice Number: ${companyInfo.invoiceNumber || "N/A"}`, margin, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text(`Date:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${clientInfo.date || "-"}`, margin + 20, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text(`Due date:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${clientInfo.dueDate || "-"}`, margin + 20, y);
    y += 12;

    const columnWidth = (pageWidth - margin * 2) / 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("From", margin, y);
    doc.text("Bill To", margin + columnWidth, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const fromLines = formatLines(doc, [companyInfo.name, companyInfo.address, companyInfo.email], columnWidth - 4);
    const billLines = formatLines(doc, [clientInfo.name, clientInfo.address, clientInfo.email], columnWidth - 4);

    if (fromLines.length) {
      doc.text(fromLines, margin, y + 6);
    }
    if (billLines.length) {
      doc.text(billLines, margin + columnWidth, y + 6);
    }

    const lineHeight = getLineHeightMm(doc);
    const columnsHeight =
      Math.max(fromLines.length, billLines.length) * lineHeight;
    y += 6 + columnsHeight + 12;

    if (paymentTermsEnabled && paymentTerms.trim()) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Payment terms", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const termsLines = doc.splitTextToSize(paymentTerms.trim(), pageWidth - margin * 2);
      doc.text(termsLines, margin, y);
      const termsHeight = termsLines.length * getLineHeightMm(doc);
      y += termsHeight + 12;
    } else {
      y += 12;
    }

    const relevantItems = items.filter(
      (item) =>
        item.description.trim().length > 0 ||
        item.rate > 0 ||
        item.quantity !== 1
    );

    if (relevantItems.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Description", "Qty", "Rate", "Amount"]],
        body: relevantItems.map((item) => [
          item.description || "(No description)",
          item.quantity.toString(),
          numberFormatter.format(item.rate),
          numberFormatter.format(item.quantity * item.rate)
        ]),
        theme: "striped",
        styles: { fontSize: 10, cellPadding: 2.5 },
        headStyles: { fillColor: [28, 28, 30], textColor: 255 },
        columnStyles: {
          1: { halign: "center" },
          2: { halign: "right" },
          3: { halign: "right" }
        },
        margin: { left: margin, right: margin }
      });

      const autoTableState =
        (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
      y = (autoTableState?.finalY ?? y) + 10;
    } else {
      doc.setFont("helvetica", "italic");
      doc.text("No line items added.", margin, y + 6);
      y += 16;
    }

    const summaryLeftX = pageWidth - 70;
    const summaryRightX = pageWidth - margin;

    const summaryRows: Array<{ label: string; value: string; bold?: boolean }> = [
      { label: "Subtotal", value: numberFormatter.format(subtotal) }
    ];

    if (discountEnabled && discountPercent > 0 && discountAmount > 0) {
      summaryRows.push({
        label: `Discount (${discountPercent}%)`,
        value: `-${numberFormatter.format(discountAmount)}`
      });
    }

    if (taxPercent > 0 || taxAmount > 0) {
      summaryRows.push({
        label: `Tax (${taxPercent}%)`,
        value: numberFormatter.format(taxAmount)
      });
    }

    summaryRows.push({
      label: "Total",
      value: numberFormatter.format(total),
      bold: true
    });

    doc.setFontSize(11);
    summaryRows.forEach((row) => {
      doc.setFont("helvetica", row.bold ? "bold" : "normal");
      doc.text(`${row.label}:`, summaryLeftX, y);
      doc.text(row.value, summaryRightX, y, { align: "right" });
      y += 6;
    });

    if (notesEnabled && notes.trim()) {
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Notes", margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const noteLines = doc.splitTextToSize(notes.trim(), pageWidth - margin * 2);
      y += 6;
      doc.text(noteLines, margin, y);
      y += getTextBlockHeight(doc, noteLines) + 4;
    }

    const fileNameBase = sanitizeFileName(
      companyInfo.invoiceNumber || companyInfo.name || "invoice"
    );

    if (mode === "preview") {
      const blobUrl = doc.output("bloburl");
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } else {
      doc.save(`${fileNameBase}.pdf`);
    }
  }, [
    companyInfo,
    clientInfo,
    discountAmount,
    discountEnabled,
    discountPercent,
    items,
    notes,
    notesEnabled,
    numberFormatter,
    paymentTerms,
    paymentTermsEnabled,
    logo,
    subtotal,
    taxAmount,
    taxPercent,
    total
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleDownloadEvent = (event: Event) => {
      const mode =
        (event as CustomEvent<{ mode?: string }>).detail?.mode === "preview" ||
        event.type === PREVIEW_EVENT_NAME
          ? "preview"
          : "download";
      handleDownload(mode);
    };

    window.addEventListener(DOWNLOAD_EVENT_NAME, handleDownloadEvent as EventListener);
    window.addEventListener(PREVIEW_EVENT_NAME, handleDownloadEvent as EventListener);
    return () => {
      window.removeEventListener(DOWNLOAD_EVENT_NAME, handleDownloadEvent as EventListener);
      window.removeEventListener(PREVIEW_EVENT_NAME, handleDownloadEvent as EventListener);
    };
  }, [handleDownload]);

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateCompanyInfo = (key: keyof CompanyInfo) => (value: string) => {
    setCompanyInfo((current) => ({ ...current, [key]: value }));
  };

  const updateClientInfo = (key: keyof ClientInfo) => (value: string) => {
    setClientInfo((current) => ({ ...current, [key]: value }));
  };

  const updateItem = (id: string, key: keyof InvoiceItem, value: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (key === "description") {
          return { ...item, description: value };
        }
        const numeric = toPositiveNumber(value, item[key] as number);
        return {
          ...item,
          [key]: numeric
        };
      })
    );
  };

  const addItem = () => setItems((current) => [...current, createItem()]);

  const removeItem = (id: string) =>
    setItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)));

  const documentNumberLabel = documentType === "quotation" ? "Quotation number" : "Invoice number";
  const documentNumberPlaceholder = formatDocumentNumber(DOCUMENT_NUMBER_FALLBACK, documentType);

  return (
    <section className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.modeGroup}>
          <p className={styles.toolTitle}>Free Tool</p>
          <div className={styles.modeToggle} role="radiogroup" aria-label="Document type">
            {documentTypeOptions.map((option) => (
              <label key={option.value} className={styles.modeOption}>
                <input
                  type="radio"
                  name="document-type"
                  value={option.value}
                  checked={documentType === option.value}
                  onChange={() => setDocumentType(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className={styles.currencySelector}>
          <label className="sr-only" htmlFor="currency">
            Invoice currency
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as typeof currency)}
              className={styles.select}
            >
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <form className={styles.card} onSubmit={(event) => event.preventDefault()}>
        <section className={styles.logoSection} aria-labelledby="logo-upload">
          <h2 id="logo-upload" className="sr-only">
            Company logo
          </h2>
          <button
            type="button"
            className={styles.logoPreview}
            role="img"
            aria-label="Logo preview"
            onClick={() => fileInputRef.current?.click()}
          >
            {logo ? (
              <Image
                src={logo}
                alt="Selected company logo"
                fill
                sizes="120px"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <span>Logo preview</span>
            )}
          </button>
          <input
            ref={fileInputRef}
            id="logo-input"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleLogoChange}
          />
          <button
            type="button"
            className={styles.logoButton}
            onClick={() => fileInputRef.current?.click()}
          >
            Change
          </button>
          {logo && (
            <button type="button" className={styles.logoButtonSecondary} onClick={clearLogo}>
              Remove
            </button>
          )}
        </section>

        <div className={styles.split}>
          <section className={styles.infoBlock} aria-labelledby="from-section">
            <h2 id="from-section" className={styles.heading}>
              From
            </h2>
            <TextField
              id="company-name"
              label="Company name"
              value={companyInfo.name}
              placeholder="Your company"
              autoComplete="organization"
              onChange={updateCompanyInfo("name")}
            />
            <TextField
              id="company-address"
              label="Address"
              value={companyInfo.address}
              placeholder="Your business address"
              onChange={updateCompanyInfo("address")}
              multiline
            />
            <TextField
              id="company-email"
              label="Email"
              type="email"
              value={companyInfo.email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={updateCompanyInfo("email")}
            />
            <TextField
              id="document-number"
              label={documentNumberLabel}
              value={companyInfo.invoiceNumber}
              placeholder={documentNumberPlaceholder}
              onChange={updateCompanyInfo("invoiceNumber")}
            />
          </section>

          <section className={styles.infoBlock} aria-labelledby="billto-section">
            <h2 id="billto-section" className={styles.heading}>
              Bill to
            </h2>
            <TextField
              id="client-name"
              label="Client name"
              value={clientInfo.name}
              placeholder="Client company"
              autoComplete="organization"
              onChange={updateClientInfo("name")}
            />
            <TextField
              id="client-address"
              label="Address"
              value={clientInfo.address}
              placeholder="Client address"
              onChange={updateClientInfo("address")}
              multiline
            />
            <TextField
              id="client-email"
              label="Email"
              type="email"
              value={clientInfo.email}
              autoComplete="email"
              placeholder="client@example.com"
              onChange={updateClientInfo("email")}
            />
            <div className={styles.inlineFields}>
              <TextField
                id="invoice-date"
                label="Date"
                type="date"
                value={clientInfo.date}
                autoComplete="off"
                onChange={updateClientInfo("date")}
              />
              <TextField
                id="due-date"
                label="Due date"
                type="date"
                value={clientInfo.dueDate}
                autoComplete="off"
                onChange={updateClientInfo("dueDate")}
              />
            </div>
          </section>
        </div>

        <div className={styles.section}>
          {paymentTermsEnabled ? (
            <div className={styles.notesGroup}>
              <label htmlFor="payment-terms" className={styles.label}>
                Payment terms
              </label>
              <textarea
                id="payment-terms"
                className={`${styles.input} ${styles.textarea}`}
                rows={3}
                placeholder="Describe your payment schedule or late fees."
                value={paymentTerms}
                onChange={(event) => setPaymentTerms(event.target.value)}
              />
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => setPaymentTermsEnabled(false)}
              >
                Remove payment terms
              </button>
            </div>
          ) : (
            <button
              className={styles.linkButton}
              type="button"
              onClick={() => setPaymentTermsEnabled(true)}
            >
              + Add payment terms
            </button>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.heading}>Line items</h2>
          <div className={styles.lineItems}>
            <div className={styles.tableHeader} role="row">
              <span>Description</span>
              <span>Qty</span>
              <span>Rate</span>
              <span className={styles.amount}>Amount</span>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className={styles.tableRow} role="group" aria-label={`Line item ${index + 1}`}>
                <div className={styles.descriptionCell}>
                  <label htmlFor={`item-description-${item.id}`} className="sr-only">
                    Item description
                  </label>
                  <textarea
                    id={`item-description-${item.id}`}
                    className={`${styles.input} ${styles.textarea}`}
                    rows={2}
                    placeholder="Item description"
                    value={item.description}
                    onChange={(event) => updateItem(item.id, "description", event.target.value)}
                  />
                </div>
                <div className={styles.numberCell}>
                  <label htmlFor={`item-qty-${item.id}`} className="sr-only">
                    Quantity
                  </label>
                  <input
                    id={`item-qty-${item.id}`}
                    className={`${styles.input} ${styles.numberInput}`}
                    type="number"
                    min={0}
                    step={1}
                    value={item.quantity}
                    onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                  />
                </div>
                <div className={styles.numberCell}>
                  <label htmlFor={`item-rate-${item.id}`} className="sr-only">
                    Rate
                  </label>
                  <input
                    id={`item-rate-${item.id}`}
                    className={`${styles.input} ${styles.numberInput}`}
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.rate}
                    onChange={(event) => updateItem(item.id, "rate", event.target.value)}
                  />
                </div>
                <div className={styles.amountCell}>
                  <span aria-label="Line item amount">
                    {numberFormatter.format(item.quantity * item.rate || 0)}
                  </span>
                  <button
                    type="button"
                    className={styles.removeButton}
                    aria-label="Remove item"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <button className={styles.addItem} type="button" onClick={addItem}>
              <span aria-hidden="true">+</span>
              Add Item
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          {notesEnabled ? (
            <div className={styles.notesGroup}>
              <label htmlFor="invoice-notes" className={styles.label}>
                Notes &amp; terms
              </label>
              <textarea
                id="invoice-notes"
                className={`${styles.input} ${styles.textarea}`}
                rows={4}
                placeholder="Provide additional context, payment instructions, or thank-you message."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => setNotesEnabled(false)}
              >
                Remove notes &amp; terms
              </button>
            </div>
          ) : (
            <button className={styles.linkButton} type="button" onClick={() => setNotesEnabled(true)}>
              + Add notes &amp; terms
            </button>
          )}

          <div className={styles.totals}>
            <div className={styles.inlineJustify}>
              <span>Subtotal:</span>
              <strong>{numberFormatter.format(subtotal)}</strong>
            </div>

            {discountEnabled ? (
              <div className={styles.inlineJustify}>
                <label htmlFor="discount" className={styles.label}>
                  Discount (%):
                </label>
                <input
                  id="discount"
                  className={`${styles.input} ${styles.numberInput}`}
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={discountPercent}
                  onChange={(event) =>
                    setDiscountPercent(toPositiveNumber(event.target.value, discountPercent))
                  }
                />
              </div>
            ) : (
              <button
                className={styles.linkButton}
                type="button"
                onClick={() => setDiscountEnabled(true)}
              >
                + Add discount
              </button>
            )}

            {discountEnabled && (
              <div className={styles.inlineJustify}>
                <span>Discount amount:</span>
                <strong>-{numberFormatter.format(discountAmount)}</strong>
              </div>
            )}

            <div className={styles.inlineJustify}>
              <label htmlFor="tax" className={styles.label}>
                Tax (%):
              </label>
              <input
                id="tax"
                className={`${styles.input} ${styles.numberInput}`}
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={taxPercent}
                onChange={(event) => setTaxPercent(toPositiveNumber(event.target.value, taxPercent))}
              />
            </div>

            <div className={styles.inlineJustify}>
              <span>Tax Amount:</span>
              <strong>{numberFormatter.format(taxAmount)}</strong>
            </div>

            <div className={styles.totalDivider} />

            <div className={`${styles.inlineJustify} ${styles.grandTotal}`}>
              <span>Total:</span>
              <strong>{numberFormatter.format(total)}</strong>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  placeholder,
  autoComplete
}: TextFieldProps) {
  return (
    <label htmlFor={id} className={styles.field}>
      <span className={styles.label}>{label}</span>
      {multiline ? (
        <textarea
          id={id}
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className={styles.input}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function createItem(): InvoiceItem {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return {
    id,
    description: "",
    quantity: 1,
    rate: 0
  };
}

function isSupportedCurrency(value: string): value is (typeof currencyOptions)[number]["value"] {
  return currencyOptions.some((option) => option.value === value);
}

function normalizeCompanyInfo(raw: unknown, fallback: CompanyInfo): CompanyInfo {
  if (!raw || typeof raw !== "object") {
    return { ...fallback };
  }

  const source = raw as Partial<CompanyInfo>;
  return {
    name: typeof source.name === "string" ? source.name : fallback.name,
    address: typeof source.address === "string" ? source.address : fallback.address,
    email: typeof source.email === "string" ? source.email : fallback.email,
    invoiceNumber:
      typeof source.invoiceNumber === "string" ? source.invoiceNumber : fallback.invoiceNumber
  };
}

function normalizeClientInfo(raw: unknown, fallback: ClientInfo): ClientInfo {
  if (!raw || typeof raw !== "object") {
    return { ...fallback };
  }

  const source = raw as Partial<ClientInfo>;
  return {
    name: typeof source.name === "string" ? source.name : fallback.name,
    address: typeof source.address === "string" ? source.address : fallback.address,
    email: typeof source.email === "string" ? source.email : fallback.email,
    date: typeof source.date === "string" ? source.date : fallback.date,
    dueDate: typeof source.dueDate === "string" ? source.dueDate : fallback.dueDate
  };
}

function normalizeItems(raw: unknown, fallback: InvoiceItem[]): InvoiceItem[] {
  if (!Array.isArray(raw)) {
    return [...fallback];
  }

  const normalized = raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const partial = entry as Partial<InvoiceItem>;
      return {
        id: typeof partial.id === "string" && partial.id.trim() ? partial.id : createItem().id,
        description: typeof partial.description === "string" ? partial.description : "",
        quantity:
          typeof partial.quantity === "number" && partial.quantity >= 0 ? partial.quantity : 1,
        rate: typeof partial.rate === "number" && partial.rate >= 0 ? partial.rate : 0
      };
    })
    .filter(Boolean) as InvoiceItem[];

  return normalized.length > 0 ? normalized : [...fallback];
}

function toPositiveNumber(value: string, fallback: number) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }
  return numeric;
}

function formatLines(
  doc: jsPDF,
  parts: Array<string | null | undefined>,
  maxWidth: number
): string[] {
  const cleaned = parts
    .map((part) => part?.toString().trim())
    .filter((part): part is string => Boolean(part));
  if (cleaned.length === 0) {
    return [];
  }
  return doc.splitTextToSize(cleaned.join("\n"), maxWidth);
}

function getTextBlockHeight(doc: jsPDF, lines: string[]): number {
  if (!lines.length) {
    return 0;
  }
  return doc.getTextDimensions(lines.join("\n")).h;
}

function getLineHeightMm(doc: jsPDF): number {
  return (doc.getFontSize() * doc.getLineHeightFactor()) / doc.internal.scaleFactor;
}

function sanitizeFileName(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized || "invoice";
}

function getImageFormat(dataUrl: string): "PNG" | "JPEG" | undefined {
  const match = /^data:image\/(png|jpeg|jpg);base64,/i.exec(dataUrl);
  if (!match) {
    return undefined;
  }
  const format = match[1].toLowerCase();
  if (format === "png") return "PNG";
  return "JPEG";
}
