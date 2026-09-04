import { z } from "zod";

const DEFAULT_SITE_URL = "http://localhost:3000";

const siteUrlSchema = z.url();

const supabasePublicSchema = z.object({
  url: z.url(),
  anonKey: z.string().min(1),
});

export type SupabasePublicEnv = z.infer<typeof supabasePublicSchema>;

export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const parsed = siteUrlSchema.safeParse(value || DEFAULT_SITE_URL);

  return (parsed.success ? parsed.data : DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const parsed = supabasePublicSchema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  return parsed.data;
}

export function getSupabaseServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must never be read in the browser.");
  }

  const parsed = z.string().min(1).safeParse(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!parsed.success) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (server-side only).");
  }

  return parsed.data;
}

export type DonationEmailConfig = {
  apiKey: string;
  from: string;
  to: string;
};

/**
 * Server-only Resend configuration for donation submissions. Returns null when
 * any variable is unset so the caller can fail with a friendly message instead
 * of crashing. Never exposes values to the browser.
 */
export function getDonationEmailConfig(): DonationEmailConfig | null {
  if (typeof window !== "undefined") return null;

  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const from = process.env.RESEND_FROM_EMAIL?.trim() ?? "";
  const to = process.env.DONATION_NOTIFICATION_EMAIL?.trim() ?? "";

  if (!apiKey || !from || !to) return null;
  return { apiKey, from, to };
}
