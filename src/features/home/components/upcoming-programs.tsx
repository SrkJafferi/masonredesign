import { ArrowRightIcon, CalendarDaysIcon, ClockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import type { ProgramCard } from "@/features/programs/types";

const PROGRAM_CALENDAR_HREF = "/events-schedule";

/** Parses an ISO date as UTC so the displayed day never drifts across timezones. */
function formatProgramDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return {
    day,
    month: utc.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
    weekday: utc.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
  };
}

export function UpcomingPrograms({ programs }: { programs: ProgramCard[] }) {
  // Tasteful empty state: hide the whole section when there is nothing to show.
  if (programs.length === 0) return null;

  return (
    <section className="bg-brand-500 py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="MASOM Events" title="Upcoming Programs" tone="dark" />
        </Reveal>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {programs.map((program, index) => {
            const { day, month, weekday } = formatProgramDate(program.startDate);
            return (
              <Reveal as="li" key={program.id} delay={(index % 3) * 0.08}>
                <Link
                  href={program.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {program.posterSrc ? (
                      <Image
                        src={program.posterSrc}
                        alt={program.title ?? `Program on ${weekday}, ${month} ${day}`}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        className="object-cover object-center transition-transform duration-[900ms] ease-brand group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-100 text-brand-500">
                        <CalendarDaysIcon className="size-12" aria-hidden />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col items-center rounded-xl bg-white/95 px-3 py-1.5 text-center shadow-sm backdrop-blur-sm">
                      <span className="text-xl leading-none font-extrabold text-ink-900">
                        {day}
                      </span>
                      <span className="text-[0.65rem] font-bold tracking-widest text-brand-600 uppercase">
                        {month}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-bold tracking-[0.14em] text-brand-600 uppercase">
                      {weekday}
                    </p>
                    {program.title ? (
                      <h3 className="mt-1.5 line-clamp-2 text-base font-bold text-foreground transition-colors duration-200 group-hover:text-brand-600">
                        {program.title}
                      </h3>
                    ) : null}
                    {program.timeLabel ? (
                      <p className="mt-auto flex items-center gap-1.5 pt-2 text-sm text-muted-foreground">
                        <ClockIcon className="size-4 text-brand-500" />
                        {program.timeLabel}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="mt-10 flex justify-center">
          <Button
            asChild
            variant="secondary"
            className="h-11 bg-white px-6 text-sm font-bold text-brand-700 hover:bg-white/90"
          >
            <Link href={PROGRAM_CALENDAR_HREF}>
              View Program Calendar
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
