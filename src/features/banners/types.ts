export type BannerImageSource = "storage" | "external";

export type BannerRow = {
  id: string;
  title: string | null;
  /** Storage object path — only for image_source === "storage" (nullable). */
  image_path: string | null;
  image_source: BannerImageSource;
  /** Approved external https URL — only for image_source === "external". */
  external_url: string | null;
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
  /**
   * True when src is an external https URL. External images are rendered with
   * a plain responsive <img> (arbitrary validated hosts), while storage/local
   * images keep using next/image optimization.
   */
  external: boolean;
};
