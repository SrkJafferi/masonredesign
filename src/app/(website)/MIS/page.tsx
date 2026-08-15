import {
  AwardIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ExternalLinkIcon,
  FlameIcon,
  GraduationCapIcon,
  HeartHandshakeIcon,
  MailIcon,
  MoonIcon,
  MoonStarIcon,
  PhoneIcon,
  QuoteIcon,
  ScaleIcon,
  StarIcon,
  TreePineIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/layout/container";
import { ParallaxBackground } from "@/components/website/parallax-background";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import { createMetadata } from "@/lib/seo/metadata";

import { EvaluationBars } from "./components/evaluation-bars";

export const metadata = createMetadata({
  title: "MASOM Islamic School (MIS)",
  description:
    "MASOM Islamic School (MIS) is MASOM's weekend Islamic education program in Chicago — teaching Aa'qaid, Fiqh, Akhlaq and Tareekh every Saturday from 11 AM to 3 PM, helping students become true Shi'a Muslims.",
  path: "/MIS",
});

/**
 * Official MIS Registration Form (source: masom.com/MIS — the "MIS
 * Registration Form" button on the official page).
 */
const misRegistrationUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSf-krl3jMnxCQcDBN7jsnmNPT0RzVroCAPsJ2cbfXpx7YESOQ/viewform";

/** Official objective — wording preserved verbatim from masom.com/MIS. */
const misObjective =
  "To strive in becoming a true Shi’a Muslim, the way Almighty Allah and our Imam (AS) want us to be, by gaining knowledge of the Pure Islam and implementing that knowledge in our daily life.";

/** Official areas of Islamic education (source: masom.com/MIS). */
const subjects: {
  name: string;
  description: string;
  icon: LucideIcon;
  image: string;
}[] = [
  {
    name: "Aa’qaid",
    description: "Islamic beliefs",
    icon: MoonStarIcon,
    image:
      "https://images.pexels.com/photos/7317564/pexels-photo-7317564.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    name: "Fiqh",
    description: "Islamic laws",
    icon: ScaleIcon,
    image:
      "https://images.pexels.com/photos/11556297/pexels-photo-11556297.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    name: "Akhlaq",
    description: "Islamic ethics",
    icon: HeartHandshakeIcon,
    image:
      "https://images.pexels.com/photos/16313080/pexels-photo-16313080.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    name: "Tareekh",
    description: "Islamic history",
    icon: BookOpenIcon,
    image:
      "https://images.pexels.com/photos/35303251/pexels-photo-35303251.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

/** Official key events in an academic year (source: masom.com/MIS). */
const annualEvents: {
  title: string;
  icon: LucideIcon;
}[] = [
  {
    title:
      "Fourteen Masoomen (AS) birthday anniversary celebrations and martyrdom anniversary commemorations",
    icon: StarIcon,
  },
  { title: "Annual Azadari Program", icon: FlameIcon },
  {
    title: "Bi-Annual Eid Milad un-Nabi (peace be upon him and his family) and Quiz competition",
    icon: AwardIcon,
  },
  { title: "Annual Sleepover", icon: MoonIcon },
  { title: "Annual Picnic", icon: TreePineIcon },
];

/** Performance evaluation breakdown. */
const evaluation = [
  { label: "Academic", percentage: 96 },
  { label: "Islamic behavior", percentage: 82 },
  { label: "Islamic dress code", percentage: 69 },
  { label: "Attendance", percentage: 90 },
  { label: "Punctuality", percentage: 75 },
];

/** Official MIS contacts (source: masom.com/MIS). */
const misContacts = [
  {
    name: "Br. Asif Raza",
    initials: "AR",
    phone: "(773) 791-7129",
    phoneHref: "tel:+17737917129",
    email: "asifmraza@hotmail.com",
  },
  {
    name: "Br. Asif Datoo",
    initials: "AD",
    phone: "(773) 556-7834",
    phoneHref: "tel:+17735567834",
    email: "asifdatoo@gmail.com",
  },
];

export default function MisPage() {
  return (
    <>
      {/* Page hero */}
      <section className="relative isolate overflow-hidden bg-ink-900 py-20 sm:py-24 lg:py-28">
        <ParallaxBackground
          src="/features/islamic-school.jpg"
          opacity="opacity-75"
        />
        <div className="absolute inset-0 bg-ink-900/55" />
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
              MIS · Islamic Education
              <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              MASOM Islamic School
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70">
              {misObjective}
            </p>
            <a
              href={misRegistrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-3.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            >
              Register for MIS
              <ExternalLinkIcon className="size-4" aria-hidden="true" />
            </a>
          </Reveal>
        </Container>
        <div
          className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-sand-400/50 to-transparent"
          aria-hidden="true"
        />
      </section>

      {/* Our Objective */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="MIS Mission"
              title="Our Objective"
              description="The guiding objective of the MASOM Islamic School."
            />
          </Reveal>

          <Reveal delay={0.08} className="mt-12">
            <figure className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-brand-500/20 bg-card shadow-card">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-400 via-sand-400 to-transparent"
              />
              <div
                aria-hidden="true"
                className="absolute -top-6 -right-6 text-brand-500/10"
              >
                <QuoteIcon className="size-40 rotate-180" strokeWidth={1} />
              </div>
              <div className="relative px-8 py-10 sm:px-12 sm:py-14">
                <blockquote>
                  <p className="text-center font-heading text-2xl leading-snug font-bold text-foreground sm:text-3xl">
                    {misObjective}
                  </p>
                </blockquote>
                <figcaption className="mt-8 flex items-center justify-center gap-3 text-center">
                  <span
                    className="h-px w-8 bg-brand-500"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-bold tracking-[0.22em] text-brand-600 uppercase">
                    MIS · Official Objective
                  </span>
                  <span
                    className="h-px w-8 bg-brand-500"
                    aria-hidden="true"
                  />
                </figcaption>
              </div>
            </figure>
          </Reveal>
        </Container>
      </section>

      {/* Areas of Islamic Education */}
      <section className="bg-muted/40 py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Curriculum"
              title="Areas of Islamic Education"
              description="The following areas of Islamic education are taught in the Islamic school."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject, index) => (
              <Reveal key={subject.name} delay={index * 0.07} className="h-full">
                <article className="group relative flex h-full aspect-[2/3] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-elevated">
                  <Image
                    src={subject.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[900ms] ease-brand group-hover:scale-[1.05]"
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/55 to-ink-900/25"
                    aria-hidden="true"
                  />
                  <div className="relative flex flex-col p-7">
                    <span className="flex size-13 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-card transition-colors duration-300 group-hover:bg-brand-600">
                      <subject.icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-heading text-xl leading-snug font-bold text-white">
                      {subject.name}
                    </h3>
                    <span
                      className="mt-3 block h-0.5 w-10 rounded-full bg-white/70 transition-all duration-300 group-hover:w-16"
                      aria-hidden="true"
                    />
                    <p className="mt-4 text-base leading-relaxed text-white/75">
                      {subject.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* MIS Schedule */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Day & Time"
              title="MIS Schedule"
              description="Classes are held in person every Saturday at the MASOM Imambargah."
            />
          </Reveal>

          <Reveal delay={0.08} className="mt-12">
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-400 via-sand-400 to-transparent"
              />
              <div className="grid gap-8 px-8 py-10 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10 sm:px-12 sm:py-12">
                <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
                  <CalendarDaysIcon className="size-8" aria-hidden="true" />
                </span>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold tracking-[0.22em] text-brand-600 uppercase">
                    Every Saturday
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground tabular-nums sm:text-4xl">
                    11:00 AM – 3:00 PM
                  </p>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    Central Standard Time (CST)
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Key Events in an Academic Year */}
      <section className="bg-muted/40 py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Annual Events"
              title="Key Events in an Academic Year"
              description="The key events in an academic year at MIS include:"
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {annualEvents.map((event, index) => (
              <Reveal key={event.title} delay={(index % 3) * 0.07} className="h-full">
                <article className="group relative flex h-full items-start gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-elevated">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 transition-colors duration-300 group-hover:bg-brand-500/15">
                    <event.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base leading-relaxed font-bold text-foreground">
                    {event.title}
                  </h3>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Performance Evaluation */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Image — hands pointing to text in a religious book. */}
            <Reveal className="lg:col-span-5">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -top-3 -left-3 h-full w-full rounded-3xl border border-brand-500/20 sm:-top-4 sm:-left-4"
                />
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card sm:aspect-[3/4] lg:aspect-[4/5]">
                  <Image
                    src="https://images.pexels.com/photos/9127608/pexels-photo-9127608.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Hands pointing to text in a religious book"
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>

            {/* Evaluation content + bars */}
            <Reveal delay={0.08} className="lg:col-span-7">
              <SectionHeading
                align="start"
                eyebrow="Evaluation"
                title="Performance Evaluation"
                description="Performance evaluation consists of the following factors:"
              />
              <div className="mt-8 sm:mt-10">
                <EvaluationBars items={evaluation} />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* MIS Contact */}
      <section className="bg-muted/40 py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Contact Information"
              title="MIS Contact"
              description="Reach out to our MIS coordinators with any questions about the program or registration."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {misContacts.map((person, index) => (
              <Reveal key={person.name} delay={index * 0.08} className="h-full">
                <article className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-elevated sm:p-8">
                  <div className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-500/10 font-heading text-lg font-bold text-brand-600 transition-colors duration-300 group-hover:bg-brand-500/15"
                    >
                      {person.initials}
                    </span>
                    <div>
                      <h3 className="font-heading text-xl leading-snug font-bold text-foreground">
                        {person.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
                        MIS Coordinator
                      </p>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
                        <PhoneIcon className="size-4" aria-hidden="true" />
                      </span>
                      <a
                        href={person.phoneHref}
                        className="font-heading text-base font-bold text-foreground transition-colors hover:text-brand-600"
                      >
                        {person.phone}
                      </a>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
                        <MailIcon className="size-4" aria-hidden="true" />
                      </span>
                      <a
                        href={`mailto:${person.email}`}
                        className="min-w-0 font-heading text-base font-bold break-all text-foreground transition-colors hover:text-brand-600"
                      >
                        {person.email}
                      </a>
                    </li>
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Registration CTA */}
      <section className="relative isolate overflow-hidden bg-ink-900 py-20 sm:py-24 lg:py-28">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,184,178,0.14),transparent_60%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sand-400/40 to-transparent"
          aria-hidden="true"
        />
        <Container className="relative">
          <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.22em] text-brand-400 uppercase">
              <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
              MIS Registration
              <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to Join MASOM Islamic School?
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
              Register your child for MIS and help them grow in Islamic knowledge,
              practice and character — classes are held every Saturday at the MASOM
              Imambargah.
            </p>
            <a
              href={misRegistrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-sm font-bold text-white shadow-card transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            >
              <GraduationCapIcon className="size-5" aria-hidden="true" />
              MIS Registration
              <ExternalLinkIcon className="size-4" aria-hidden="true" />
            </a>
            <p className="mt-6 text-sm leading-relaxed text-white/60">
              Have questions? Contact{" "}
              <a
                href="tel:+17737917129"
                className="font-semibold text-white/80 transition-colors hover:text-brand-300"
              >
                Br. Asif Raza
              </a>{" "}
              or{" "}
              <a
                href="tel:+17735567834"
                className="font-semibold text-white/80 transition-colors hover:text-brand-300"
              >
                Br. Asif Datoo
              </a>
              .
            </p>
          </Reveal>
        </Container>
        <div
          className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-sand-400/50 to-transparent"
          aria-hidden="true"
        />
      </section>
    </>
  );
}
