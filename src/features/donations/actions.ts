"use server";

import { headers } from "next/headers";
import { Resend } from "resend";

import { getDonationEmailConfig } from "@/config/env";

import { donationFormSchema } from "./schema";

/** Cooldown between submissions from the same client IP (basic anti-spam). */
const RATE_LIMIT_MS = 20_000;
const MAX_IP_ENTRIES = 2_000;

// Lightweight in-memory throttle: sufficient for a single-instance deploy.
// Not a distributed rate limiter — honeypot + server-side validation remain
// the primary spam defenses.
const lastSubmissionAt = new Map<string, number>();

async function clientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type DonationActionResult = { ok: true } | { ok: false; message: string };

/**
 * Handles the public donation submission form. Sends a structured email to
 * MASOM via Resend — strictly server-side. No payment is processed here; the
 * email is a notification that a donor shared their intention/details.
 */
export async function submitDonation(formData: FormData): Promise<DonationActionResult> {
  // Honeypot: if a bot filled the hidden field, silently pretend success.
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    await sleep(500);
    return { ok: true };
  }

  // Basic request throttling per IP.
  const ip = await clientIp();
  const now = Date.now();
  const last = lastSubmissionAt.get(ip) ?? 0;
  if (now - last < RATE_LIMIT_MS) {
    return {
      ok: false,
      message: "Please wait a moment before sending again.",
    };
  }

  const parsed = donationFormSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    amount: formData.get("amount") ?? "",
    purpose: formData.get("purpose") ?? "",
    message: formData.get("message") ?? "",
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const config = getDonationEmailConfig();
  if (!config) {
    console.error(
      "donations:submit — Resend is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL and DONATION_NOTIFICATION_EMAIL.",
    );
    return {
      ok: false,
      message: "Donation submissions are not available yet. Please contact MASOM directly.",
    };
  }

  const { data } = parsed;
  const submittedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(now);

  const body = [
    "Donation Form Submission",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "Not provided"}`,
    `Donation Amount: $${data.amount}`,
    `Donation Purpose: ${data.purpose || "Not provided"}`,
    `Message: ${data.message || "Not provided"}`,
    "",
    `Submitted At: ${submittedAt} (Central Time)`,
  ].join("\n");

  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to: [config.to],
    subject: `Donation Form Submission — ${data.name}`,
    text: body,
  });

  if (error) {
    // Log diagnostics server-side only; the user never sees Resend internals.
    console.error("donations:submit — resend send failed:", error);
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    };
  }

  if (lastSubmissionAt.size > MAX_IP_ENTRIES) lastSubmissionAt.clear();
  lastSubmissionAt.set(ip, now);

  return { ok: true };
}