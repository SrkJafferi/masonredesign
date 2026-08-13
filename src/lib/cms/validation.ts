import { z } from "zod";

/** Result shape returned by every CMS server action (drives useActionState). */
export type ActionResult =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const idleResult: ActionResult = { status: "idle" };

const HTTP_URL = /^https?:\/\/.+/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;
const DATETIME_LOCAL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/** Required, trimmed, length-capped text. */
export function requiredText(max = 200) {
  return z.string().trim().min(1, { message: "This field is required." }).max(max);
}

/** Optional free text: "" -> null. */
export function optionalText(max = 2000) {
  return z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable();
}

/** Optional http(s) URL: "" -> null; otherwise must start with http:// or https://. */
export const optionalHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .refine((value) => value === null || HTTP_URL.test(value), {
    message: "Enter a valid URL starting with http:// or https://",
  });

/** Checkbox/switch value coming from FormData or RHF. Missing -> false. */
export const boolFromForm = z
  .union([z.boolean(), z.enum(["true", "false", "on", "off"])])
  .nullish()
  .transform((value) => value === true || value === "true" || value === "on");

/** Non-negative integer sort order; unparseable -> 0. */
export const sortOrderFromForm = z.coerce.number().int().min(0).max(100000).catch(0);

/** Required calendar date "YYYY-MM-DD". */
export const requiredDate = z
  .string()
  .trim()
  .regex(DATE_RE, { message: "Enter a valid date." });

/** Optional calendar date: "" -> null. */
export const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .refine((value) => value === null || DATE_RE.test(value), {
    message: "Enter a valid date.",
  });

/** Optional clock time "HH:MM": "" -> null. */
export const optionalTime = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .refine((value) => value === null || TIME_RE.test(value), {
    message: "Enter a valid time.",
  });

/** Optional datetime-local "YYYY-MM-DDTHH:MM": "" -> null. */
export const optionalDateTime = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .refine((value) => value === null || DATETIME_LOCAL_RE.test(value), {
    message: "Enter a valid date and time.",
  });
