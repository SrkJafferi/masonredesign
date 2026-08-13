"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/guard";
import { logCmsError } from "@/lib/cms/logging";
import type { ActionResult } from "@/lib/cms/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { announcementFormSchema } from "./schema";

function revalidateAnnouncements() {
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

function parseAnnouncementForm(formData: FormData) {
  return announcementFormSchema.safeParse({
    message: formData.get("message") ?? "",
    link_url: formData.get("link_url") ?? "",
    link_label: formData.get("link_label") ?? "",
    is_active: formData.get("is_active"),
    starts_at: formData.get("starts_at") ?? "",
    expires_at: formData.get("expires_at") ?? "",
    sort_order: formData.get("sort_order") ?? "0",
  });
}

export async function createAnnouncement(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseAnnouncementForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid form.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("announcements").insert({
    message: parsed.data.message,
    link_url: parsed.data.link_url,
    link_label: parsed.data.link_label,
    is_active: parsed.data.is_active,
    starts_at: parsed.data.starts_at,
    expires_at: parsed.data.expires_at,
    sort_order: parsed.data.sort_order,
  });

  if (error) {
    logCmsError("announcements:create", error);
    return {
      status: "error",
      message: "Could not save the announcement. Please try again.",
    };
  }

  revalidateAnnouncements();
  return { status: "success", message: "Announcement added." };
}

export async function updateAnnouncement(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { status: "error", message: "Missing announcement id." };
  }

  const parsed = parseAnnouncementForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid form.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("announcements")
    .update({
      message: parsed.data.message,
      link_url: parsed.data.link_url,
      link_label: parsed.data.link_label,
      is_active: parsed.data.is_active,
      starts_at: parsed.data.starts_at,
      expires_at: parsed.data.expires_at,
      sort_order: parsed.data.sort_order,
    })
    .eq("id", id);

  if (error) {
    logCmsError("announcements:update", error);
    return {
      status: "error",
      message: "Could not update the announcement. Please try again.",
    };
  }

  revalidateAnnouncements();
  return { status: "success", message: "Announcement updated." };
}

export async function deleteAnnouncement(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { status: "error", message: "Missing announcement id." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    logCmsError("announcements:delete", error);
    return {
      status: "error",
      message: "Could not delete the announcement. Please try again.",
    };
  }

  revalidateAnnouncements();
  return { status: "success", message: "Announcement deleted." };
}
