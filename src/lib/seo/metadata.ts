import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

type CreateMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function createMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: CreateMetadataInput = {}): Metadata {
  const socialTitle = title ?? siteConfig.title;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.ogLocale,
      title: socialTitle,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: image ? [image] : undefined,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
