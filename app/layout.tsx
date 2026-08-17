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
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NC3NGR8D');
          `}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NC3NGR8D"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}
