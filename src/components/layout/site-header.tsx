import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
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

        <Container className="flex flex-col gap-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-5">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo priority />
            <MobileNav items={mainNavigation} className="-mr-2 lg:hidden" />
          </div>

          <PrayerTimingsBar timings={timings} className="lg:max-w-[44rem]" />
        </Container>
      </header>

      <MainNav items={mainNavigation} className="hidden lg:block" />
    </>
  );
}
