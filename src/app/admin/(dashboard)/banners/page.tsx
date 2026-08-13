import { BannerManager } from "@/features/banners/components/banner-manager";
import { getAllBanners } from "@/features/banners/queries";

export default async function AdminBannersPage() {
  const banners = await getAllBanners();
  return <BannerManager banners={banners} />;
}
