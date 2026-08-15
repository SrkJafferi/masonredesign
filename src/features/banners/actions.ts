"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/guard";
import { logAdminActivity } from "@/lib/cms/activity";
import { logCmsError } from "@/lib/cms/logging";
import type { ActionResult } from "@/lib/cms/validation";
import { CMS_BUCKETS, deleteImage, uploadImage } from "@/lib/media/storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { getBannerById } from "./queries";
import { bannerFormSchema } from "./schema";

const BUCKET = CMS_BUCKETS.banners;

function revalidateBanners() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

function parseBannerForm(formData: FormData) {
  return bannerFormSchema.safeParse({
    title: formData.get("title") ?? "",
    image_alt: formData.get("image_alt") ?? "",
    link_url: formData.get("link_url") ?? "",
    sort_order: formData.get("sort_order") ?? "0",
    is_active: formData.get("is_active"),
    image_source: formData.get("image_source") ?? "storage",
    external_url: formData.get("external_url") ?? "",
  });
}

export async function createBanner(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseBannerForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid form.",
    };
  }

  // Storage source requires an upload; external source requires an approved URL.
  let imagePath: string | null = null;
  let externalUrl: string | null = null;

  if (parsed.data.image_source === "storage") {
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      return { status: "error", message: "Please choose a banner image." };
    }
    const upload = await uploadImage(BUCKET, file);
    if (!upload.ok) {
      return { status: "error", message: upload.error };
    }
    imagePath = upload.path;
  } else {
    if (!parsed.data.external_url) {
      return { status: "error", message: "Enter the external image URL." };
    }
    externalUrl = parsed.data.external_url;
  }

  const supabase = await createSupabaseServerClient();
  const { data: inserted, error } = await supabase
    .from("banners")
    .insert({
      title: parsed.data.title,
      image_path: imagePath,
      image_source: parsed.data.image_source,
      external_url: externalUrl,
      image_alt: parsed.data.image_alt,
      link_url: parsed.data.link_url,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .select("id")
    .single();

  if (error) {
    // Roll back the just-uploaded orphan so storage stays clean.
    if (imagePath) await deleteImage(BUCKET, imagePath);
    logCmsError("banners:create", error);
    return { status: "error", message: "Could not save the banner. Please try again." };
  }

  await logAdminActivity(
    "banner",
    "created",
    inserted?.id ?? null,
    parsed.data.title || parsed.data.image_alt,
  );

  revalidateBanners();
  return { status: "success", message: "Banner added." };
}

export async function updateBanner(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { status: "error", message: "Missing banner id." };
  }

  const existing = await getBannerById(id);
  if (!existing) {
    return { status: "error", message: "Banner not found." };
  }

  const parsed = parseBannerForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid form.",
    };
  }

  const source = parsed.data.image_source;
  let imagePath = existing.image_source === "storage" ? existing.image_path : null;
  let externalUrl = existing.external_url;
  /** Newly uploaded object — removed again if the DB update fails. */
  let uploadedPath: string | null = null;
  /** Old storage object — removed only after the DB update succeeds. */
  let replacedPath: string | null = null;

  if (source === "storage") {
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      const upload = await uploadImage(BUCKET, file);
      if (!upload.ok) {
        return { status: "error", message: upload.error };
      }
      imagePath = upload.path;
      uploadedPath = imagePath;
      // Replace the previous image once the update lands (if there was one).
      replacedPath = existing.image_source === "storage" ? existing.image_path : null;
    } else if (existing.image_source !== "storage") {
      // Switching external -> storage requires a file.
      return { status: "error", message: "Upload an image to use the Storage source." };
    }
    // Storage + no new file + was already storage: keep the current image.
    externalUrl = null;
  } else {
    if (!parsed.data.external_url) {
      return { status: "error", message: "Enter the external image URL." };
    }
    externalUrl = parsed.data.external_url;
    // Switching storage -> external: drop the storage reference, remove the
    // old file only after the DB update succeeds.
    replacedPath = existing.image_source === "storage" ? existing.image_path : null;
    imagePath = null;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("banners")
    .update({
      title: parsed.data.title,
      image_path: imagePath,
      image_source: source,
      external_url: externalUrl,
      image_alt: parsed.data.image_alt,
      link_url: parsed.data.link_url,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .eq("id", id);

  if (error) {
    if (uploadedPath) await deleteImage(BUCKET, uploadedPath); // remove the new orphan
    logCmsError("banners:update", error);
    return { status: "error", message: "Could not update the banner. Please try again." };
  }

  // Clean up the replaced image only after a successful update.
  if (replacedPath) await deleteImage(BUCKET, replacedPath);

  const action =
    existing.is_active === parsed.data.is_active
      ? "updated"
      : parsed.data.is_active
        ? "activated"
        : "deactivated";
  await logAdminActivity(
    "banner",
    action,
    id,
    parsed.data.title || parsed.data.image_alt,
  );

  revalidateBanners();
  return { status: "success", message: "Banner updated." };
}

export async function deleteBanner(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { status: "error", message: "Missing banner id." };
  }

  const existing = await getBannerById(id);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);

  if (error) {
    logCmsError("banners:delete", error);
    return { status: "error", message: "Could not delete the banner. Please try again." };
  }

  // Remove the associated storage object after the row is gone, but only for
  // storage-source banners — external banners have no Storage file to remove.
  if (existing && existing.image_source !== "external" && existing.image_path) {
    await deleteImage(BUCKET, existing.image_path);
  }

  await logAdminActivity(
    "banner",
    "deleted",
    id,
    existing ? existing.title || existing.image_alt : undefined,
  );

  revalidateBanners();
  return { status: "success", message: "Banner deleted." };
}
