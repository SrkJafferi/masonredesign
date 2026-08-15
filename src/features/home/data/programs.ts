import type { ImageAsset, ProgramEvent } from "@/features/home/types";

// Real event posters (from the current MASOM homepage), stored in /public/programs.
const POSTER_AUG_11: ImageAsset = {
  src: "/programs/event-3918.jpeg",
  width: 1236,
  height: 1600,
};
const POSTER_AUG_12: ImageAsset = {
  src: "/programs/event-3920.jpeg",
  width: 1236,
  height: 1600,
};
const POSTER_MAJALIS: ImageAsset = {
  src: "/programs/event-3922.jpeg",
  width: 1236,
  height: 1600,
};
const POSTER_FRIDAY: ImageAsset = {
  src: "/programs/friday-prayers.jpg",
  width: 1046,
  height: 487,
};
const POSTER_ALWIDAI: ImageAsset = {
  src: "/programs/alwidai-majalis.jpg",
  width: 1600,
  height: 630,
};

/**
 * Local typed program data mirroring the live EventON listing. This is a static
 * snapshot only — the shape is intentionally simple so it can later be replaced
 * by data fetched from Supabase without touching the UpcomingPrograms component.
 */
export const upcomingPrograms: ProgramEvent[] = [
  {
    id: "2026-08-11-majalis",
    title: null,
    date: "2026-08-11",
    startTime: "8:00 PM",
    endTime: "11:00 PM",
    image: POSTER_AUG_11,
  },
  {
    id: "2026-08-12-majalis",
    title: null,
    date: "2026-08-12",
    startTime: "8:00 PM",
    endTime: "11:00 PM",
    image: POSTER_AUG_12,
  },
  {
    id: "2026-08-13-majalis",
    title: null,
    date: "2026-08-13",
    startTime: "8:00 PM",
    endTime: "10:00 PM",
    image: POSTER_MAJALIS,
  },
  {
    id: "2026-08-14-friday",
    title: "Friday Prayers",
    date: "2026-08-14",
    startTime: "1:00 PM",
    endTime: "2:00 PM",
    image: POSTER_FRIDAY,
    location: "MASOM Imambargah",
  },
  {
    id: "2026-08-14-majalis",
    title: null,
    date: "2026-08-14",
    startTime: "8:00 PM",
    endTime: "10:00 PM",
    image: POSTER_MAJALIS,
  },
  {
    id: "2026-08-15-majalis",
    title: null,
    date: "2026-08-15",
    startTime: "8:00 PM",
    endTime: "10:00 PM",
    image: POSTER_MAJALIS,
  },
  {
    id: "2026-08-20-alwidai",
    title: "Alwidai Majalis e Ayyam E Aza",
    date: "2026-08-20",
    startTime: "8:00 PM",
    endTime: "10:00 PM",
    image: POSTER_ALWIDAI,
  },
  {
    id: "2026-08-21-friday",
    title: "Friday Prayers",
    date: "2026-08-21",
    startTime: "1:00 PM",
    endTime: "2:00 PM",
    image: POSTER_FRIDAY,
    location: "MASOM Imambargah",
  },
  {
    id: "2026-08-21-alwidai",
    title: "Alwidai Majalis e Ayyam E Aza",
    date: "2026-08-21",
    startTime: "8:00 PM",
    endTime: "10:00 PM",
    image: POSTER_ALWIDAI,
  },
];
