export type BannerRow = {
  id: string;
  title: string | null;
  image_path: string;
  image_alt: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Admin list row with a resolved preview URL for the thumbnail. */
export type BannerAdminItem = BannerRow & { previewUrl: string | null };

/** Public display model consumed by the hero slider. */
export type HeroBanner = {
  id: string;
  src: string;
  alt: string;
  href: string | null;
};
