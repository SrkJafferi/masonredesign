"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/features/auth/guard";
import { logAdminActivity } from "@/lib/cms/activity";
import { logCmsError } from "@/lib/cms/logging";
import type { ActionResult } from "@/lib/cms/validation";
import { CMS_BUCKETS, deleteImage, uploadImage } from "@/lib/media/storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { listProgramPosterMedia } from "./media";
import { getProgramById } from "./queries";
import { programFormSchema, programRecurrenceSchema } from "./schema";
import {
  generateDailyOccurrenceDates,
  generateWeeklyOccurrenceDates,
  MAX_DAILY_OCCURRENCES,
  occurrenceEndDate,
  programOccurrenceKey,
} from "./recurrence";
import type { ProgramPosterMedia } from "./types";

const BUCKET = CMS_BUCKETS.programs;

/** Storage names are root-level files: uuid.ext or a plain basename. */
const SAFE_POSTER_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(webp|jpe?g|png)$/i;

function revalidatePrograms() {
  revalidatePath("/admin/programs");
  revalidatePath("/");
  revalidatePath("/events-schedule");
  revalidateTag("programs");
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

/**
 * The value of the hidden `poster_ref` field (a storage name chosen from the
 * media library), or null when the admin uploaded a file / kept the poster.
 */
function readPosterRef(formData: FormData): string | null {
  const value = formData.get("poster_ref");
  if (typeof value !== "string") return null;
  const name = value.trim();
  return name.length > 0 ? name : null;
}

/** True when the storage object still exists (mirrors what the picker showed). */
async function posterExists(name: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage.from(BUCKET).exists(name);
  if (error) return false;
  return data === true;
}

/**
 * Number of OTHER programs whose poster_path equals `path`. Used before
 * deleting a storage object so shared images are never removed while another
 * program still references them.
 */
async function countOtherPosterReferences(
  path: string,
  excludeProgramId?: string,
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("programs")
    .select("id", { count: "exact", head: true })
    .eq("poster_path", path);
  if (excludeProgramId) query = query.neq("id", excludeProgramId);
  const { count, error } = await query;
  if (error) {
    // Fail closed: if we cannot verify, keep the file.
    logCmsError("programs:countPosterRefs", error);
    return 1;
  }
  return count ?? 0;
}

/** Deletes a poster file from storage only when no program references it. */
async function deletePosterIfUnused(
  path: string | null | undefined,
  excludeProgramId?: string,
): Promise<void> {
  if (!path) return;
  const references = await countOtherPosterReferences(path, excludeProgramId);
  if (references === 0) await deleteImage(BUCKET, path);
}

/**
 * Lazily loads the Program Media Library (storage listing + usage) on demand
 * instead of on every /admin/programs page load. Called by the client when the
 * admin opens "Choose from media library". Returns [] on any failure (the
 * picker shows an empty/retry state) — never throws to the browser.
 */
export async function getProgramPosterMediaAction(): Promise<ProgramPosterMedia[]> {
  await requireAdmin();
  return listProgramPosterMedia();
}

export type DeletePosterResult =
  { ok: true } | { ok: false; error: string; inUse?: boolean; usedBy?: string[] };

/**
 * Deletes ONE poster object from the `programs` bucket.
 *
 * The reference check is deliberately FRESH: `programs.poster_path` is
 * re-queried for the exact storage name immediately before removal, so a stale
 * picker can never delete an image that a program started referencing after the
 * library was listed. The check fails closed — if the reference query errors,
 * the image is kept. Storage removal targets only the exact object name (no
 * folder, no partial/prefix matches, no automatic duplicate handling).
 */
export async function deleteProgramPosterAction(
  name: string,
): Promise<DeletePosterResult> {
  await requireAdmin();

  const target = name.trim();
  if (!SAFE_POSTER_NAME_RE.test(target)) {
    return { ok: false, error: "Unable to delete this image. Please try again." };
  }

  const supabase = await createSupabaseServerClient();

  // Fresh server-side reference check — never trust the client's usage count.
  const { data: referencing, error: refError } = await supabase
    .from("programs")
    .select("title")
    .eq("poster_path", target);

  if (refError) {
    logCmsError("programs:deleteMedia:refs", refError);
    return { ok: false, error: "Unable to delete this image. Please try again." };
  }

  const usedBy = (referencing ?? [])
    .map((row) => (row as { title: string | null }).title)
    .filter((title): title is string => Boolean(title));

  if (usedBy.length > 0) {
    return {
      ok: false,
      error: "This image is currently being used by a Program and cannot be deleted.",
      inUse: true,
      usedBy,
    };
  }

  // Delete only the exact object. If it is already gone (removed out-of-band),
  // treat the deletion as accomplished — the library no longer contains it.
  const { error: removeError } = await supabase.storage.from(BUCKET).remove([target]);
  if (removeError) {
    const { data: stillExists, error: existsError } = await supabase.storage
      .from(BUCKET)
      .exists(target);
    if (existsError || stillExists !== false) {
      logCmsError("programs:deleteMedia", removeError);
      return { ok: false, error: "Unable to delete this image. Please try again." };
    }
  }

  await logAdminActivity("program", "media deleted", null, target);
  return { ok: true };
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

  const recurrence = programRecurrenceSchema.safeParse({
    enabled: formData.get("repeat_enabled"),
    frequency: formData.get("recurrence_frequency") ?? "weekly",
    month: formData.get("recurrence_month") ?? "",
    start_date: parsed.data.start_date,
    last_date: formData.get("recurrence_last_date") ?? "",
  });
  if (!recurrence.success) {
    return {
      status: "error",
      message: recurrence.error.issues[0]?.message ?? "Invalid recurrence.",
    };
  }

  let occurrenceDates = [parsed.data.start_date];
  let skippedCount = 0;
  if (recurrence.data.enabled) {
    const daily = recurrence.data.frequency === "daily";
    occurrenceDates = daily
      ? generateDailyOccurrenceDates(parsed.data.start_date, recurrence.data.last_date)
      : generateWeeklyOccurrenceDates(parsed.data.start_date, recurrence.data.month);
    if (
      occurrenceDates.length < (daily ? 1 : 4) ||
      occurrenceDates.length > (daily ? MAX_DAILY_OCCURRENCES : 5)
    ) {
      return {
        status: "error",
        message: "Could not generate dates for the selected repeat settings.",
      };
    }
    // Preview is advisory: use current database rows before uploading or saving.
    const supabase = await createSupabaseServerClient();
    const { data: existing, error } = await supabase
      .from("programs")
      .select("title, start_date, start_time")
      .in("start_date", occurrenceDates);
    if (error) {
      logCmsError("programs:create:duplicates", error);
      return {
        status: "error",
        message: "Could not check existing program dates. Please try again.",
      };
    }
    const existingKeys = new Set(
      (existing ?? []).map((row) =>
        programOccurrenceKey(
          row.title as string,
          row.start_date as string,
          row.start_time as string | null,
        ),
      ),
    );
    const beforeFilter = occurrenceDates.length;
    occurrenceDates = occurrenceDates.filter(
      (date) =>
        !existingKeys.has(
          programOccurrenceKey(parsed.data.title, date, parsed.data.start_time),
        ),
    );
    skippedCount = beforeFilter - occurrenceDates.length;
    if (!occurrenceDates.length) {
      return {
        status: "success",
        message: `No new programs were needed. ${skippedCount} existing ${skippedCount === 1 ? "occurrence was" : "occurrences were"} skipped.`,
      };
    }
  }

  // Poster: either a brand-new upload or a reference to an existing file.
  // `uploadedPath` is tracked separately so a failed insert only removes the
  // file this request created — never a reused image.
  let uploadedPath: string | null = null;
  let posterPath: string | null = null;

  const file = formData.get("poster");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadImage(BUCKET, file);
    if (!upload.ok) {
      return { status: "error", message: upload.error };
    }
    uploadedPath = upload.path;
    posterPath = upload.path;
  } else {
    const reuseName = readPosterRef(formData);
    if (reuseName) {
      if (!SAFE_POSTER_NAME_RE.test(reuseName) || !(await posterExists(reuseName))) {
        return {
          status: "error",
          message: "The selected image is no longer available. Please pick another.",
        };
      }
      posterPath = reuseName;
    }
  }

  const supabase = await createSupabaseServerClient();
  const recurrenceGroupId = recurrence.data.enabled ? randomUUID() : null;
  const rows = occurrenceDates.map((startDate) => ({
    title: parsed.data.title,
    description: parsed.data.description,
    poster_path: posterPath,
    start_date: startDate,
    end_date: recurrence.data.enabled
      ? occurrenceEndDate(parsed.data.start_date, parsed.data.end_date, startDate)
      : parsed.data.end_date,
    start_time: parsed.data.start_time,
    end_time: parsed.data.end_time,
    location: parsed.data.location,
    link_url: parsed.data.link_url,
    is_published: parsed.data.is_published,
    sort_order: parsed.data.sort_order,
    ...(recurrenceGroupId ? { recurrence_group_id: recurrenceGroupId } : {}),
  }));
  // One statement inserts the complete batch atomically, sharing one poster.
  const { data: inserted, error } = await supabase
    .from("programs")
    .insert(rows)
    .select("id");

  if (error) {
    if (uploadedPath) await deleteImage(BUCKET, uploadedPath);
    logCmsError("programs:create", error);
    return { status: "error", message: "Could not save the program. Please try again." };
  }

  await logAdminActivity(
    "program",
    recurrence.data.enabled ? "created recurring batch" : "created",
    inserted?.[0]?.id ?? null,
    recurrence.data.enabled
      ? `${parsed.data.title} (${rows.length} occurrences)`
      : parsed.data.title,
  );

  try {
    revalidatePrograms();
  } catch (error) {
    // Rows are already saved. Do not report a save failure and encourage retries.
    logCmsError("programs:create:revalidate", error);
  }
  if (!recurrence.data.enabled) return { status: "success", message: "Program added." };
  const createdCount = rows.length;
  return {
    status: "success",
    message:
      skippedCount > 0
        ? `${createdCount} ${createdCount === 1 ? "program" : "programs"} created. ${skippedCount} existing ${skippedCount === 1 ? "occurrence was" : "occurrences were"} skipped.`
        : `${createdCount} recurring ${createdCount === 1 ? "program" : "programs"} created.`,
  };
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

  // Poster decision. Default: keep whatever the program already references.
  let posterPath = existing.poster_path;
  let uploadedPath: string | null = null;
  let previousPath: string | null = null;

  const file = formData.get("poster");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadImage(BUCKET, file);
    if (!upload.ok) {
      return { status: "error", message: upload.error };
    }
    uploadedPath = upload.path;
    posterPath = upload.path;
    previousPath = existing.poster_path;
  } else {
    const reuseName = readPosterRef(formData);
    if (reuseName) {
      if (reuseName === existing.poster_path) {
        // Re-selected the current image — treat as "keep current".
        posterPath = existing.poster_path;
      } else {
        if (!SAFE_POSTER_NAME_RE.test(reuseName) || !(await posterExists(reuseName))) {
          return {
            status: "error",
            message: "The selected image is no longer available. Please pick another.",
          };
        }
        posterPath = reuseName;
        previousPath = existing.poster_path;
      }
    }
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
    // Only clean up the file this request uploaded; the previous poster is
    // still referenced by this program (the update failed).
    if (uploadedPath) await deleteImage(BUCKET, uploadedPath);
    logCmsError("programs:update", error);
    return {
      status: "error",
      message: "Could not update the program. Please try again.",
    };
  }

  // The DB row now points at posterPath; remove the old image only if no other
  // program still uses it (shared-image safety).
  if (previousPath && previousPath !== posterPath) {
    await deletePosterIfUnused(previousPath, id);
  }

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

  // Row is gone — delete the poster only when no remaining program references it.
  if (existing) await deletePosterIfUnused(existing.poster_path, id);

  await logAdminActivity("program", "deleted", id, existing ? existing.title : undefined);

  revalidatePrograms();
  return { status: "success", message: "Program deleted." };
}
