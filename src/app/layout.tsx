import type { Metadata, Viewport } from "next";
import { PT_Sans } from "next/font/google";

import { JsonLd } from "@/components/seo/json-ld";
import { BackToTop } from "@/components/website/back-to-top";
import { PageLoader } from "@/components/website/page-loader";
import { siteConfig } from "@/config/site";
import { createOrganizationSchema, createWebSiteSchema } from "@/lib/seo/structured-data";

import "./globals.css";

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    locale: siteConfig.ogLocale,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#5cb8b2",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // suppressHydrationWarning: the admin-only theme script may add `.dark` to
  // <html> before hydration; this silences that expected mismatch. It has no
  // effect on the public site (which never applies `.dark`).
  return (
    <html lang={siteConfig.locale} className={ptSans.variable} suppressHydrationWarning>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:font-bold focus:text-primary-foreground focus:shadow-elevated"
        >
          Skip to content
        </a>
        <PageLoader />
        {children}
        <BackToTop />
        <JsonLd data={createOrganizationSchema()} />
        <JsonLd data={createWebSiteSchema()} />
      </body>
    </html>
  );
}
