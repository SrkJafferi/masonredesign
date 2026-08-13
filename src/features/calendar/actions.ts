"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/guard";
import { logCmsError } from "@/lib/cms/logging";
import type { ActionResult } from "@/lib/cms/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { calendarBasePath } from "./config";
import {
  calendarDayFormSchema,
  calendarEventFormSchema,
  hijriMonthFormSchema,
  hijriOverrideFormSchema,
} from "./schema";

// Every calendar mutation touches the admin module, the public calendar page,
// and the homepage (whose header bar shows today's timings).
function revalidateCalendar() {
  revalidatePath("/admin/calendar");
  revalidatePath(calendarBasePath);
  revalidatePath("/2026");
  revalidatePath("/");
}

function invalid(parsedError: { issues: { message: string }[] }): ActionResult {
  return { status: "error", message: parsedError.issues[0]?.message ?? "Invalid form." };
}

function requireString(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  return typeof value === "string" && value.length > 0 ? value : null;
}

// ===========================================================================
// calendar_days — keyed by gregorian_date (the primary key).
// ===========================================================================
function parseDayForm(formData: FormData) {
  return calendarDayFormSchema.safeParse({
    gregorian_date: formData.get("gregorian_date") ?? "",
    imsaak: formData.get("imsaak") ?? "",
    fajr: formData.get("fajr") ?? "",
    sunrise: formData.get("sunrise") ?? "",
    zohar: formData.get("zohar") ?? "",
    sunset: formData.get("sunset") ?? "",
    maghrib: formData.get("maghrib") ?? "",
    midnight: formData.get("midnight") ?? "",
    is_published: formData.get("is_published"),
  });
}

export async function createCalendarDay(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseDayForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("calendar_days").insert(parsed.data);
  if (error) {
    logCmsError("calendar:day:create", error);
    return { status: "error", message: "Could not save the day. A row for that date may already exist." };
  }
  revalidateCalendar();
  return { status: "success", message: "Day timings saved." };
}

export async function updateCalendarDay(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseDayForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { gregorian_date, ...fields } = parsed.data;
  const { error } = await supabase
    .from("calendar_days")
    .update(fields)
    .eq("gregorian_date", gregorian_date);
  if (error) {
    logCmsError("calendar:day:update", error);
    return { status: "error", message: "Could not update the day. Please try again." };
  }
  revalidateCalendar();
  return { status: "success", message: "Day timings updated." };
}

export async function deleteCalendarDay(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  // DeleteConfirm submits the identity under the field name "id"; for this
  // table the identity is the date itself.
  const date = requireString(formData, "id");
  if (!date) return { status: "error", message: "Missing date." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("calendar_days").delete().eq("gregorian_date", date);
  if (error) {
    logCmsError("calendar:day:delete", error);
    return { status: "error", message: "Could not delete the day. Please try again." };
  }
  revalidateCalendar();
  return { status: "success", message: "Day deleted." };
}

// ===========================================================================
// hijri_months — keyed by uuid id.
// ===========================================================================
function parseMonthForm(formData: FormData) {
  return hijriMonthFormSchema.safeParse({
    hijri_year: formData.get("hijri_year") ?? "",
    hijri_month: formData.get("hijri_month") ?? "",
    gregorian_start: formData.get("gregorian_start") ?? "",
    is_published: formData.get("is_published"),
  });
}

export async function createHijriMonth(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseMonthForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("hijri_months").insert(parsed.data);
  if (error) {
    logCmsError("calendar:month:create", error);
    return { status: "error", message: "Could not save the month boundary. It may duplicate an existing one." };
  }
  revalidateCalendar();
  return { status: "success", message: "Month boundary saved." };
}

export async function updateHijriMonth(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = requireString(formData, "id");
  if (!id) return { status: "error", message: "Missing month id." };
  const parsed = parseMonthForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("hijri_months").update(parsed.data).eq("id", id);
  if (error) {
    logCmsError("calendar:month:update", error);
    return { status: "error", message: "Could not update the month boundary. Please try again." };
  }
  revalidateCalendar();
  return { status: "success", message: "Month boundary updated." };
}

export async function deleteHijriMonth(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = requireString(formData, "id");
  if (!id) return { status: "error", message: "Missing month id." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("hijri_months").delete().eq("id", id);
  if (error) {
    logCmsError("calendar:month:delete", error);
    return { status: "error", message: "Could not delete the month boundary. Please try again." };
  }
  revalidateCalendar();
  return { status: "success", message: "Month boundary deleted." };
}

// ===========================================================================
// hijri_overrides — keyed by gregorian_date (the primary key).
// ===========================================================================
function parseOverrideForm(formData: FormData) {
  return hijriOverrideFormSchema.safeParse({
    gregorian_date: formData.get("gregorian_date") ?? "",
    hijri_year: formData.get("hijri_year") ?? "",
    hijri_month: formData.get("hijri_month") ?? "",
    hijri_day: formData.get("hijri_day") ?? "",
    note: formData.get("note") ?? "",
    is_published: formData.get("is_published"),
  });
}

export async function createHijriOverride(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseOverrideForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("hijri_overrides").insert(parsed.data);
  if (error) {
    logCmsError("calendar:override:create", error);
    return { status: "error", message: "Could not save the override. One may already exist for that date." };
  }
  revalidateCalendar();
  return { status: "success", message: "Hijri override saved." };
}

export async function updateHijriOverride(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseOverrideForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { gregorian_date, ...fields } = parsed.data;
  const { error } = await supabase
    .from("hijri_overrides")
    .update(fields)
    .eq("gregorian_date", gregorian_date);
  if (error) {
    logCmsError("calendar:override:update", error);
    return { status: "error", message: "Could not update the override. Please try again." };
  }
  revalidateCalendar();
  return { status: "success", message: "Hijri override updated." };
}

export async function deleteHijriOverride(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  // DeleteConfirm submits the identity under "id"; here that is the date.
  const date = requireString(formData, "id");
  if (!date) return { status: "error", message: "Missing date." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("hijri_overrides").delete().eq("gregorian_date", date);
  if (error) {
    logCmsError("calendar:override:delete", error);
    return { status: "error", message: "Could not delete the override. Please try again." };
  }
  revalidateCalendar();
  return { status: "success", message: "Hijri override deleted." };
}

// ===========================================================================
// calendar_events — keyed by uuid id.
// ===========================================================================
function parseEventForm(formData: FormData) {
  return calendarEventFormSchema.safeParse({
    event_date: formData.get("event_date") ?? "",
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    category: formData.get("category") ?? "",
    is_active: formData.get("is_active"),
    sort_order: formData.get("sort_order") ?? "0",
  });
}

export async function createCalendarEvent(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseEventForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("calendar_events").insert(parsed.data);
  if (error) {
    logCmsError("calendar:event:create", error);
    return { status: "error", message: "Could not save the event. Please try again." };
  }
  revalidateCalendar();
  return { status: "success", message: "Event added." };
}

export async function updateCalendarEvent(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = requireString(formData, "id");
  if (!id) return { status: "error", message: "Missing event id." };
  const parsed = parseEventForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("calendar_events").update(parsed.data).eq("id", id);
  if (error) {
    logCmsError("calendar:event:update", error);
    return { status: "error", message: "Could not update the event. Please try again." };
  }
  revalidateCalendar();
  return { status: "success", message: "Event updated." };
}

export async function deleteCalendarEvent(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = requireString(formData, "id");
  if (!id) return { status: "error", message: "Missing event id." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) {
    logCmsError("calendar:event:delete", error);
    return { status: "error", message: "Could not delete the event. Please try again." };
  }
  revalidateCalendar();
  return { status: "success", message: "Event deleted." };
}
