import { siteConfig } from "@/config/site";
import type { AnnouncementCta } from "@/features/home/types";

/** Reuses the canonical destinations from config/site.ts — no duplicated URLs. */
export const announcementCtas: AnnouncementCta[] = [
  {
    id: "email-announcements",
    label: "Email Announcements",
    href: siteConfig.links.newsletterArchive,
    external: true,
  },
  {
    id: "whatsapp-events",
    label: "Join Our Whats App Events Group",
    href: siteConfig.social.whatsapp,
    external: true,
  },
];
