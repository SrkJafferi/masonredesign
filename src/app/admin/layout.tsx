import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminThemeProvider } from "@/components/admin/admin-theme";

export const metadata: Metadata = {
  title: "MASOM Admin",
  robots: { index: false, follow: false },
};

/**
 * Runs before first paint: applies the saved admin theme so dark-mode users
 * never see a light flash on refresh. Admin-only — the public site never
 * receives the `.dark` class.
 *
 * Note: the storage key literal is intentionally duplicated here instead of
 * being imported from the "use client" module — importing a plain value from
 * a client module into a Server Component resolves to a client reference.
 */
const THEME_FLASH_SCRIPT = `(function(){try{if(window.localStorage.getItem("masom-admin-theme")==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminThemeProvider>
      <script dangerouslySetInnerHTML={{ __html: THEME_FLASH_SCRIPT }} />
      {children}
    </AdminThemeProvider>
  );
}
