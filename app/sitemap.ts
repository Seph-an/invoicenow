import type { MetadataRoute } from "next";

const siteUrl = "https://invoicenow.co.ke";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1
    }
  ];
}
