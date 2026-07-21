import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InvoiceCard } from "@/components/InvoiceCard";
import styles from "./page.module.css";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "InvoiceNow",
  url: "https://invoicenow.co.ke",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "InvoiceNow is an online invoice builder that helps individuals and businesses create, preview, and download professional invoices in seconds.",
  featureList: [
    "Multi-currency support",
    "Invoice preview, download, and reset actions",
    "Customizable company and client information fields",
    "Inline tax, discount, and payment terms controls"
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  creator: { "@type": "Organization", name: "InvoiceNow" },
  publisher: { "@type": "Organization", name: "InvoiceNow" }
} as const;

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <InvoiceCard />
        </main>
        <Footer />
      </div>
    </>
  );
}
