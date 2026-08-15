import "server-only";

import { headers } from "next/headers";

import { countryName } from "@/lib/geo/countries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { logCmsError } from "../cms/logging";

/**
 * Trusted request metadata for the login audit.
 *
 * On Vercel the platform sets `x-forwarded-for` / `x-real-ip` (the real client
 * IP after its proxy) and the geo headers `x-vercel-ip-country`,
 * `x-vercel-ip-country-region` and `x-vercel-ip-city`. In local dev these are
 * absent, so fields simply stay null — the UI shows \"Location unavailable\"
 * instead of guessing. We never trust client-supplied body fields.
 */
async function getRequestMetadata(): Promise<{
  ip: string | null;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  region: string | null;
  userAgentSummary: string | null;
}> {
  const headerStore = await headers();

  const forwarded = headerStore.get("x-forwarded-for") ?? null;
  const realIp = headerStore.get("x-real-ip") ?? null;
  // First entry of x-forwarded-for is the originating client on Vercel.
  const ip = (forwarded?.split(",")[0]?.trim() || realIp || null) ?? null;

  const countryCode = headerStore.get("x-vercel-ip-country") ?? null;
  const region = headerStore.get("x-vercel-ip-country-region") ?? null;
  const city = headerStore.get("x-vercel-ip-city") ?? null;

  // Minimal, safe browser summary from the raw UA (never stored in full).
  const userAgent = headerStore.get("user-agent") ?? "";
  let userAgentSummary: string | null = null;
  const browserMatch = /(chrome|firefox|safari|edge|opera|msie|trident|vivaldi)\/?\s*(\d+)/i.exec(
    userAgent,
  );
  if (browserMatch) {
    const browser = browserMatch[1].toLowerCase();
    const label =
      browser === "trident"
        ? "IE"
        : browser === "msie"
          ? "IE"
          : browser.charAt(0).toUpperCase() + browser.slice(1);
    userAgentSummary = `${label} ${browserMatch[2]}`;
  } else if (userAgent) {
    userAgentSummary = userAgent.slice(0, 24);
  }

  return {
    ip,
    countryCode: countryCode?.toUpperCase() ?? null,
    countryName: countryCode ? countryName(countryCode) : null,
    city,
    region,
    userAgentSummary,
  };
}

/**
 * Records a successful admin sign-in (IP + geo + time) through the
 * security-definer RPC. Called by the server action only AFTER authentication
 * succeeds. Best-effort: a failure is logged but never blocks the sign-in.
 */
export async function recordAdminLogin(): Promise<void> {
  try {
    const meta = await getRequestMetadata();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("record_admin_login", {
      p_ip_address: meta.ip,
      p_country_code: meta.countryCode,
      p_country_name: meta.countryName,
      p_city: meta.city,
      p_region: meta.region,
      p_user_agent_summary: meta.userAgentSummary,
    });
    if (error) throw error;
  } catch (error) {
    logCmsError("activity:recordLogin", error);
  }
}

/** Masks an IP for display: 103.4.5.6 → 103.xxx.xxx.xxx (IPv6 → first group). */
export function maskIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  if (ip.includes(":")) {
    const group = ip.split(":")[0];
    return `${group}:…`;
  }
  const first = ip.split(".")[0];
  return `${first}.xxx.xxx.xxx`;
}
