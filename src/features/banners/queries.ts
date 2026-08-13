import "server-only";

import { heroSlides } from "@/features/home/data/hero-slides";
import { logCmsError } from "@/lib/cms/logging";
import { CMS_BUCKETS, resolveImageSrc } from "@/lib/media/storage";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { BannerAdminItem, BannerRow, HeroBanner } from "./types";

const BUCKET = CMS_BUCKETS.banners;

function toHeroBanner(
  row: Pick<BannerRow, "id" | "image_path" | "image_alt" | "link_url">,
): HeroBanner | null {
  const src = resolveImageSrc(BUCKET, row.image_path);
  if (!src) return null;
  return { id: row.id, src, alt: row.image_alt ?? "", href: row.link_url };
}

/** Real Phase 3 banners, used until the CMS holds active rows. */
function fallbackBanners(): HeroBanner[] {
  return heroSlides.map((slide) => ({
    id: slide.id,
    src: slide.image.src,
    alt: slide.alt,
    href: null,
  }));
}

/**
 * Public hero banners. Uses active CMS rows when present; otherwise falls back
 * to the local reference banners so the homepage is never broken/empty before
 * the owner has published any content.
 */
export async function getActiveBanners(): Promise<HeroBanner[]> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("banners")
      .select("id, image_path, image_alt, link_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      const banners = data
        .map(toHeroBanner)
        .filter((banner): banner is HeroBanner => banner !== null);
      if (banners.length > 0) return banners;
    }
  } catch (error) {
    logCmsError("banners:getActive", error);
  }

  return fallbackBanners();
}

/** Admin: every banner, ordered for the manager table, with preview URLs. */
export async function getAllBanners(): Promise<BannerAdminItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    logCmsError("banners:getAll", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const banner = row as BannerRow;
    return { ...banner, previewUrl: resolveImageSrc(BUCKET, banner.image_path) };
  });
}

export async function getBannerById(id: string): Promise<BannerRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logCmsError("banners:getById", error);
    return null;
  }
  return (data as BannerRow | null) ?? null;
}
