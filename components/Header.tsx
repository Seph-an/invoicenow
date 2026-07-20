"use client";

import styles from "./Header.module.css";

const RESET_EVENT_NAME = "invoice-card:reset";
const DOWNLOAD_EVENT_NAME = "invoice-card:download";
const PREVIEW_EVENT_NAME = "invoice-card:preview";

const actions = [
  { label: "How it works", variant: "default" as const },
  { label: "Reset", variant: "default" as const },
  { label: "Preview", variant: "default" as const },
  { label: "Download", variant: "default" as const }
];

const howToSteps = [
  "Choose the document type you need.",
  "Select the currency you are working with.",
  "Fill in the details, logo, and notes (as needed).",
  "Click “Preview” (optional) to review before downloading.",
  "Click “Download” to export and send."
] as const;

export function Header() {
  const handleActionClick = (label: string) => {
    if (label === "Reset") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(RESET_EVENT_NAME));
      }
    } else if (label === "Download") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(DOWNLOAD_EVENT_NAME, { detail: { mode: "download" } }));
      }
    } else if (label === "Preview") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(PREVIEW_EVENT_NAME, { detail: { mode: "preview" } }));
      }
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandText}>Invoicenow</span>
      </div>
      <nav className={styles.actions} aria-label="Primary actions">
        {actions.map((action) => {
          if (action.label !== "How it works") {
            return (
              <button
                key={action.label}
                type="button"
                className={`${styles.actionButton} ${styles[action.variant]}`}
                onClick={() => handleActionClick(action.label)}
              >
                {action.label}
              </button>
            );
          }

          return (
            <div key="How it works" className={styles.tooltipWrapper}>
              <button
                type="button"
                className={`${styles.actionButton} ${styles[action.variant]}`}
                onClick={() => handleActionClick(action.label)}
              >
                {action.label}
              </button>
              <div className={styles.tooltipCard} role="dialog" aria-label="How InvoiceNow works">
                <div className={styles.tooltipTop}>
                  <span className={styles.tooltipBadge}>Free tool</span>
                  <p className={styles.tooltipSubtitle}>Best used on tablets or laptops for the smoothest experience.</p>
                  <p className={styles.tooltipSubtitle}>
                    Your draft stays in this browser and is never sent to our servers. Reset removes it.
                  </p>
                </div>
                <div className={styles.tooltipDivider} aria-hidden="true" />
                <p className={styles.tooltipTitle}>How to use</p>
                <ol className={styles.tooltipList}>
                  {howToSteps.map((step, index) => (
                    <li key={step}>
                      <span className={styles.stepNumber}>{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                  <li className={styles.noteItem}>
                    <span className={styles.noteBadge}>NB</span>
                    <span>If you don’t want a detail to appear in the downloaded document, leave it blank.</span>
                  </li>
                </ol>
              </div>
            </div>
          );
        })}
      </nav>
    </header>
  );
}
