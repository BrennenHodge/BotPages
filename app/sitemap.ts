import type { MetadataRoute } from "next";
import { sitemapRecords } from "@/lib/use-cases/content";
import { SITE_ORIGIN } from "@/lib/use-cases/taxonomy";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRecords().map((entry) => ({
    url: `${SITE_ORIGIN}${entry.path === "/" ? "" : entry.path}`,
    ...(entry.lastmod ? { lastModified: new Date(entry.lastmod) } : {}),
  }));
}
