import { z } from "zod";

/**
 * Donation submission form. This is an inquiry/intention form only — no
 * payment is processed on this page. Amount is informational, so it is kept
 * as a user-friendly string and validated as a positive number.
 */
export const donationFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").max(254),
  phone: z
    .string()
    .trim()
    .max(40, "Please enter a shorter phone number.")
    .optional()
    .or(z.literal("")),
  amount: z
    .string()
    .trim()
    .regex(/^\d{1,7}(\.\d{1,2})?$/, "Enter a valid amount, e.g. 50 or 50.00.")
    .refine((value) => Number(value) > 0, "Please enter an amount greater than zero."),
  purpose: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Please keep your message under 1000 characters.").optional().or(z.literal("")),
  /** Honeypot field — must stay empty. Bots that fill it are silently dropped. */
  company: z.string().max(0, "Invalid submission."),
});

export type DonationFormValues = z.infer<typeof donationFormSchema>;

/** Purpose options are drawn from the official MASOM donate page wording
 * (donations/Sadaqat, Sadaqa and Fitra). No invented funds. */
export const DONATION_PURPOSES = [
  { value: "General Donation", label: "General Donation / Sadaqa" },
  { value: "Sadaqa", label: "Sadaqa" },
  { value: "Fitra", label: "Fitra" },
  { value: "Other", label: "Other" },
] as const;

/** Quick-amount UI shortcuts — informational only, not pricing claims. */
export const QUICK_AMOUNTS = ["25", "50", "100", "250"] as const;