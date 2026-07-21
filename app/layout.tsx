import { FeedbackButton } from "@/components/FeedbackButton";
import type { Metadata } from "next";
import Script from "next/script";
import { ReactNode } from "react";
import "./globals.css";

const siteUrl = "https://invoicenow.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InvoiceNow · Instant Invoice Generator",
    template: "%s · InvoiceNow"
  },
  description:
    "InvoiceNow helps individuals and businesses create professional invoices, preview them instantly, and export ready-to-send PDFs.",
  keywords: [
    "invoice generator",
    "invoice template",
    "online invoicing",
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
      "Create polished invoices, preview them instantly, and export ready-to-send PDFs in seconds.",
    url: siteUrl,
    siteName: "InvoiceNow",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/social-card.svg",
        width: 1200,
        height: 630,
        alt: "InvoiceNow instant invoice generator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "InvoiceNow · Instant Invoice Generator",
    description:
      "Create, preview, and download professional invoices in seconds.",
    site: "@sephanly",
    creator: "@sephanly",
    images: ["/social-card.svg"]
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
      <body>
        {children}
        <FeedbackButton />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SHM1Y0QXEL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SHM1Y0QXEL');
          `}
        </Script>
      </body>
    </html>
  );
}
