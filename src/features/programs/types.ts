export type ProgramRow = {
  id: string;
  title: string;
  description: string | null;
  poster_path: string | null;
  start_date: string; // "YYYY-MM-DD"
  end_date: string | null;
  start_time: string | null; // "HH:MM:SS"
  end_time: string | null;
  location: string | null;
  link_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Admin list row with a resolved poster preview URL and formatted time range. */
export type ProgramAdminItem = ProgramRow & {
  previewUrl: string | null;
  timeLabel: string | null; // "1:00 PM – 2:00 PM" | "1:00 PM" | null
};

/** Public display model consumed by the Upcoming Programs grid + modal. */
export type ProgramCard = {
  id: string;
  title: string | null;
  startDate: string; // ISO "YYYY-MM-DD"; component formats UTC-safe
  timeLabel: string | null; // "8:00 PM – 10:00 PM" | "8:00 PM" | null
  posterSrc: string | null;
  description: string | null;
  location: string | null;
  linkUrl: string | null;
};
