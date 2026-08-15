"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/guard";
import { logAdminActivity } from "@/lib/cms/activity";
import { logCmsError } from "@/lib/cms/logging";
import type { ActionResult } from "@/lib/cms/validation";
import { CMS_BUCKETS, deleteImage, uploadImage } from "@/lib/media/storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { getProgramById } from "./queries";
import { programFormSchema } from "./schema";

const BUCKET = CMS_BUCKETS.programs;

function revalidatePrograms() {
  revalidatePath("/admin/programs");
  revalidatePath("/");
  revalidatePath("/events-schedule");
}

function parseProgramForm(formData: FormData) {
  return programFormSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    start_date: formData.get("start_date") ?? "",
    end_date: formData.get("end_date") ?? "",
    start_time: formData.get("start_time") ?? "",
    end_time: formData.get("end_time") ?? "",
    location: formData.get("location") ?? "",
    link_url: formData.get("link_url") ?? "",
    is_published: formData.get("is_published"),
    sort_order: formData.get("sort_order") ?? "0",
  });
}

export async function createProgram(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseProgramForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid form.",
    };
  }

  let posterPath: string | null = null;
  const file = formData.get("poster");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadImage(BUCKET, file);
    if (!upload.ok) {
      return { status: "error", message: upload.error };
    }
    posterPath = upload.path;
  }

  const supabase = await createSupabaseServerClient();
  const { data: inserted, error } = await supabase
    .from("programs")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      poster_path: posterPath,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time,
      location: parsed.data.location,
      link_url: parsed.data.link_url,
      is_published: parsed.data.is_published,
      sort_order: parsed.data.sort_order,
    })
    .select("id")
    .single();

  if (error) {
    if (posterPath) await deleteImage(BUCKET, posterPath);
    logCmsError("programs:create", error);
    return { status: "error", message: "Could not save the program. Please try again." };
  }

  await logAdminActivity("program", "created", inserted?.id ?? null, parsed.data.title);

  revalidatePrograms();
  return { status: "success", message: "Program added." };
}

export async function updateProgram(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { status: "error", message: "Missing program id." };
  }

  const existing = await getProgramById(id);
  if (!existing) {
    return { status: "error", message: "Program not found." };
  }

  const parsed = parseProgramForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid form.",
    };
  }

  let posterPath = existing.poster_path;
  let previousPath: string | null = null;

  const file = formData.get("poster");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadImage(BUCKET, file);
    if (!upload.ok) {
      return { status: "error", message: upload.error };
    }
    posterPath = upload.path;
    previousPath = existing.poster_path;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("programs")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      poster_path: posterPath,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time,
      location: parsed.data.location,
      link_url: parsed.data.link_url,
      is_published: parsed.data.is_published,
      sort_order: parsed.data.sort_order,
    })
    .eq("id", id);

  if (error) {
    if (previousPath) await deleteImage(BUCKET, posterPath);
    logCmsError("programs:update", error);
    return {
      status: "error",
      message: "Could not update the program. Please try again.",
    };
  }

  if (previousPath) await deleteImage(BUCKET, previousPath);

  const action =
    existing.is_published === parsed.data.is_published
      ? "updated"
      : parsed.data.is_published
        ? "published"
        : "unpublished";
  await logAdminActivity("program", action, id, parsed.data.title);

  revalidatePrograms();
  return { status: "success", message: "Program updated." };
}

export async function deleteProgram(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { status: "error", message: "Missing program id." };
  }

  const existing = await getProgramById(id);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);

  if (error) {
    logCmsError("programs:delete", error);
    return {
      status: "error",
      message: "Could not delete the program. Please try again.",
    };
  }

  if (existing) await deleteImage(BUCKET, existing.poster_path);

  await logAdminActivity(
    "program",
    "deleted",
    id,
    existing ? existing.title : undefined,
  );

  revalidatePrograms();
  return { status: "success", message: "Program deleted." };
}
