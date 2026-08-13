import { siteConfig } from "@/config/site";

export type SocialKey = "facebook" | "youtube" | "instagram" | "email";

export type SocialLink = {
  key: SocialKey;
  label: string;
  href: string;
};

const socialLinkMap: Record<SocialKey, SocialLink> = {
  facebook: {
    key: "facebook",
    label: "Facebook",
    href: siteConfig.social.facebook,
  },
  youtube: {
    key: "youtube",
    label: "YouTube",
    href: siteConfig.social.youtube,
  },
  instagram: {
    key: "instagram",
    label: "Instagram",
    href: siteConfig.social.instagram,
  },
  email: {
    key: "email",
    label: `Email ${siteConfig.name}`,
    href: `mailto:${siteConfig.contact.email}`,
  },
};

const headerOrder: SocialKey[] = ["youtube", "facebook", "instagram"];
const footerOrder: SocialKey[] = ["facebook", "youtube", "instagram", "email"];

export const headerSocialLinks = headerOrder.map((key) => socialLinkMap[key]);
export const footerSocialLinks = footerOrder.map((key) => socialLinkMap[key]);
