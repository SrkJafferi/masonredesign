import type {
  FeatureBanner,
  FeatureHighlight,
  FeatureQuickLink,
} from "@/features/home/types";

/** The three primary teal banner blocks (destinations kept exactly as the source). */
export const featureBanners: FeatureBanner[] = [
  {
    id: "upcoming-programs",
    title: "Upcoming Programs",
    href: "/events-schedule",
    image: { src: "/features/upcoming-programs.webp", width: 500, height: 333 },
  },
  {
    id: "hijri-calendar",
    title: "Hijri Calendar",
    href: "/hijricalendar2026",
    image: { src: "/features/hijri-calendar.jpg", width: 400, height: 266 },
  },
  {
    id: "islamic-school",
    title: "MASOM Islamic School",
    href: "/MIS",
    image: { src: "/features/islamic-school.jpg", width: 640, height: 359 },
  },
];

/** The two large highlight cards (Wadi-e-MASOM and Dedication Plaques). */
export const featureHighlights: FeatureHighlight[] = [
  {
    id: "wadi-e-masom",
    title: "WADI-E-MASOM",
    subtitle: "Shia Cemetery",
    excerpt:
      "MASOM's dedicated Shia cemetery serving our community with dignity, care and respect.",
    href: "/wadi-e-masom-shia-cemetery",
    image: { src: "/features/wadiyemasom.avif", width: 370, height: 247 },
  },
  {
    id: "dedication-plaques",
    title: "DEDICATION PLAQUES",
    subtitle: "Sawab-e-Jariah",
    excerpt:
      "A Sawab-e-Jariah towards all who have passed us Surah-e-Fateha offered after every Salat, Dua, Praye…",
    href: "/dedication-plaques",
    image: { src: "/features/dedication-plaques.webp", width: 370, height: 246 },
  },
];

/** The four quick-link tiles in the right column. */
export const featureQuickLinks: FeatureQuickLink[] = [
  {
    id: "online-forms",
    title: "Masom Online Forms",
    href: "/forms",
    image: { src: "/features/online-forms.jpg", width: 640, height: 426 },
  },
  {
    id: "sura-fatiha",
    title: "Sura-Fatiha Request",
    href: "/sura-fatiha",
    image: { src: "/features/sura-fatiha.webp", width: 640, height: 426 },
  },
  {
    id: "youth-activities",
    title: "Youth Activities",
    href: "/youth-activities",
    image: { src: "/features/youth-activities.webp", width: 640, height: 360 },
  },
  {
    id: "members-login",
    title: "Members Login",
    href: "/admin/login",
    image: { src: "/features/members-login.jpg", width: 640, height: 412 },
  },
];
