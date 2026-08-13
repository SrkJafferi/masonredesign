export type ImageAsset = {
  src: string;
  width: number;
  height: number;
};

export type HeroSlide = {
  id: string;
  image: ImageAsset;
  alt: string;
};

export type AnnouncementCta = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

export type FeatureBanner = {
  id: string;
  title: string;
  href: string;
  image: ImageAsset;
};

export type FeatureHighlight = {
  id: string;
  title: string;
  subtitle: string;
  excerpt?: string;
  href: string;
  image: ImageAsset;
};

export type FeatureQuickLink = {
  id: string;
  title: string;
  href: string;
  image: ImageAsset;
};

export type ProgramEvent = {
  id: string;
  /** Some real programs carry their details inside the poster and have no separate title. */
  title: string | null;
  /** ISO date string, e.g. "2026-08-11". Parsed as UTC to avoid timezone drift. */
  date: string;
  startTime: string;
  endTime: string;
  image: ImageAsset;
  href: string;
};
