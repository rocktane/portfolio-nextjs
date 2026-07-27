import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Use a fixed date to ensure consistent builds
// Update this date when making significant content changes
const LAST_CONTENT_UPDATE = "2026-04-02";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://yohangouiran.com",
      lastModified: new Date(LAST_CONTENT_UPDATE),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
