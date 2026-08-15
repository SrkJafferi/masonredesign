import { BrandLogo } from "@/components/layout/brand-logo";
import { HeaderScroll } from "@/components/layout/header-scroll";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopBar } from "@/components/layout/top-bar";
import { mainNavigation } from "@/config/navigation";
import { getTodayTimings } from "@/features/calendar/queries";
import { PrayerTimingsBar } from "@/features/prayer-calendar/components/prayer-timings-bar";

export async function SiteHeader() {
  const timings = await getTodayTimings();

  return (
    <>
      <header className="bg-background">
        <TopBar />

        <HeaderScroll>
          <div className="flex items-center justify-between gap-4">
            <BrandLogo priority />
            <MobileNav items={mainNavigation} className="-mr-2 lg:hidden" />
          </div>

          <PrayerTimingsBar timings={timings} className="lg:max-w-[44rem]" />
        </HeaderScroll>
      </header>

      <MainNav items={mainNavigation} className="hidden lg:block" />
    </>
  );
}
