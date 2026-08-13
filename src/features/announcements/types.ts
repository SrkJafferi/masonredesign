export type AnnouncementRow = {
  id: string;
  message: string;
  link_url: string | null;
  link_label: string | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AnnouncementAdminItem = AnnouncementRow;

/** Public display model consumed by the news ticker. */
export type AnnouncementView = {
  id: string;
  message: string;
  href: string | null;
  linkLabel: string | null;
};
