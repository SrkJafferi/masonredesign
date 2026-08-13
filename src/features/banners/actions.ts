"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/guard";
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

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Please choose a banner image." };
  }

  const upload = await uploadImage(BUCKET, file);
  if (!upload.ok) {
    return { status: "error", message: upload.error };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("banners").insert({
    title: parsed.data.title,
    image_path: upload.path,
    image_alt: parsed.data.image_alt,
    link_url: parsed.data.link_url,
    sort_order: parsed.data.sort_order,
    is_active: parsed.data.is_active,
  });

  if (error) {
    // Roll back the just-uploaded orphan so storage stays clean.
    await deleteImage(BUCKET, upload.path);
    logCmsError("banners:create", error);
    return { status: "error", message: "Could not save the banner. Please try again." };
  }

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

  let imagePath = existing.image_path;
  let previousPath: string | null = null;

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadImage(BUCKET, file);
    if (!upload.ok) {
      return { status: "error", message: upload.error };
    }
    imagePath = upload.path;
    previousPath = existing.image_path;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("banners")
    .update({
      title: parsed.data.title,
      image_path: imagePath,
      image_alt: parsed.data.image_alt,
      link_url: parsed.data.link_url,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .eq("id", id);

  if (error) {
    if (previousPath) await deleteImage(BUCKET, imagePath); // remove the new orphan
    logCmsError("banners:update", error);
    return { status: "error", message: "Could not update the banner. Please try again." };
  }

  // Clean up the replaced image only after a successful update.
  if (previousPath) await deleteImage(BUCKET, previousPath);

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

  // Remove the associated storage object after the row is gone.
  if (existing) await deleteImage(BUCKET, existing.image_path);

  revalidateBanners();
  return { status: "success", message: "Banner deleted." };
}
