import { AnnouncementManager } from "@/features/announcements/components/announcement-manager";
import { getAllAnnouncements } from "@/features/announcements/queries";

export default async function AdminAnnouncementsPage() {
  const announcements = await getAllAnnouncements();
  return <AnnouncementManager announcements={announcements} />;
}
