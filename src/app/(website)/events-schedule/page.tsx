import { Container } from "@/components/layout/container";
import { ParallaxBackground } from "@/components/website/parallax-background";
import { Reveal } from "@/components/website/reveal";
import { ProgramCalendarView } from "@/features/programs/components/program-calendar-view";
import { getProgramsForMonth, getProgramYears } from "@/features/programs/queries";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Program Calendar",
  description:
    "Browse MASOM programs and community events — majalis, Friday prayers and more — by month in the MASOM program calendar.",
  path: "/events-schedule",
});

function currentMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export default async function EventsSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const { year: currentYear, month: currentMonthNumber } = currentMonth();

  const years = await getProgramYears();
  const availableYears = years.length > 0 ? years : [currentYear];

  const requestedYear = Number(params.year);
  const requestedMonth = Number(params.month);

  const year = Number.isInteger(requestedYear) && availableYears.includes(requestedYear)
    ? requestedYear
    : availableYears.includes(currentYear)
      ? currentYear
      : availableYears[0];

  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12
    ? requestedMonth
    : currentMonthNumber;

  const programs = await getProgramsForMonth(year, month);

  return (
    <>
      {/* Page hero */}
      <section className="relative isolate overflow-hidden bg-ink-900 py-20 sm:py-24 lg:py-28">
        <ParallaxBackground
          src="https://images.pexels.com/photos/38235418/pexels-photo-38235418.jpeg?auto=compress&cs=tinysrgb&w=1920"
          opacity="opacity-50"
        />
        <div className="absolute inset-0 bg-ink-900/70" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,184,178,0.12),transparent_60%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sand-400/40 to-transparent"
          aria-hidden="true"
        />
        <Container className="relative">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.22em] text-brand-400 uppercase">
              <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
              MASOM Events
              <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Program Calendar
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">
              Browse and search MASOM programs and community events by month.
            </p>
          </Reveal>
        </Container>
        <div
          className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-sand-400/50 to-transparent"
          aria-hidden="true"
        />
      </section>

      {/* Calendar */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <ProgramCalendarView year={year} month={month} years={availableYears} programs={programs} />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
