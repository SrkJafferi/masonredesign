import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import type { ProgramCard } from "@/features/programs/types";

import { ProgramCardGrid } from "./program-card-grid";

const PROGRAM_CALENDAR_HREF = "/events-schedule";

export function UpcomingPrograms({ programs }: { programs: ProgramCard[] }) {
  // Tasteful empty state: hide the whole section when there is nothing to show.
  if (programs.length === 0) return null;

  return (
    <section className="bg-brand-500 py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="MASOM Events"
            title="Upcoming Programs"
            description="Join us for upcoming majalis, programs and community events at the Imambargah."
            tone="dark"
          />
        </Reveal>

        <ProgramCardGrid programs={programs} />

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
