import type { HeroSlide } from "@/features/home/types";

/**
 * Real MASOM banner assets (formerly served through Revolution Slider), stored
 * locally in /public/hero. Swapping this to a Supabase-backed Banner Manager
 * later only requires replacing this array with fetched data of the same shape.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "gathering",
    image: { src: "/hero/hero-1.jpg", width: 1024, height: 683 },
    alt: "MASOM Imambargah community gathering",
  },
  {
    id: "majlis",
    image: { src: "/hero/hero-2.jpg", width: 2560, height: 1707 },
    alt: "Majlis at MASOM Imambargah",
  },
  {
    id: "event",
    image: { src: "/hero/hero-3.jpeg", width: 1600, height: 900 },
    alt: "MASOM community event",
  },
  {
    id: "imam-mehdi",
    image: { src: "/hero/hero-4.webp", width: 1024, height: 541 },
    alt: "Imam Mehdi (as) commemorative banner",
  },
];
