import { FeedbackButton } from "@/components/FeedbackButton";
import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

const siteUrl = "https://invoicenow.co.ke";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "InvoiceNow",
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "InvoiceNow is an online invoice builder that helps African businesses generate, preview, and download polished invoices in seconds.",
  featureList: [
    "Multi-currency support tailored to African markets",
    "Invoice preview, download, and reset actions",
    "Customizable company and client information fields",
    "Inline tax, discount, and payment terms controls"
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  creator: {
    "@type": "Organization",
    name: "InvoiceNow"
  },
  publisher: {
    "@type": "Organization",
    name: "InvoiceNow"
  }
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InvoiceNow · Instant Invoice Generator",
    template: "%s · InvoiceNow"
  },
  description:
    "InvoiceNow makes it effortless for African freelancers and businesses to craft professional invoices, preview them, and export a ready-to-send PDF.",
  keywords: [
    "invoice generator",
    "invoice template",
    "African business tools",
    "professional invoices",
    "PDF invoice builder",
    "freelancer invoicing"
  ],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "InvoiceNow · Instant Invoice Generator",
    description:
      "Create polished invoices tailored to African currencies, preview live, and export PDFs for clients in seconds.",
    url: siteUrl,
    siteName: "InvoiceNow",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "InvoiceNow · Instant Invoice Generator",
    description:
      "Generate, preview, and download invoices with multi-currency support built for African businesses.",
    site: "@InvoiceNow",
    creator: "@InvoiceNow"
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: "/icon.ico"
  },
  category: "business"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}
