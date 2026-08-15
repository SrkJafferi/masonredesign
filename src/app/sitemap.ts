import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

type SitemapEntry = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

/** Implemented public pages — keep in sync with the routes in src/app/(website). */
const pages: SitemapEntry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/hijricalendar2026", priority: 0.9, changeFrequency: "monthly" },
  { path: "/events-schedule", priority: 0.8, changeFrequency: "weekly" },
  { path: "/our-mission", priority: 0.7, changeFrequency: "yearly" },
  { path: "/our-members", priority: 0.7, changeFrequency: "yearly" },
  { path: "/contacts", priority: 0.6, changeFrequency: "yearly" },
  { path: "/forms", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? siteConfig.url : `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
