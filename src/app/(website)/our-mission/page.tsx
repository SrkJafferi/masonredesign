import Image from "next/image";

import { Container } from "@/components/layout/container";
import { ParallaxBackground } from "@/components/website/parallax-background";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Our Mission",
  description:
    "Learn about MASOM's mission — by the grace of almighty Allah and the 14 Ma'soomeen — and the goals guiding our religious, educational and community activities at the MASOM Imambargah in Chicago, IL.",
  path: "/our-mission",
});

type Goal = {
  /** Short presentation label only — never replaces the source wording. */
  label: string;
  text: string;
  image: string;
};

/** Source: masom.com/our-mission — goal wording preserved verbatim. */
const goals: Goal[] = [
  {
    label: "Religious & Educational Activities",
    text: "To organize and promote religious and Educational activities pursuant to Shia faith of Islam as preached by Prophet Mohammed (S.A.W.W) and Aale-Mohammed (A.S.).",
    image:
      "https://images.pexels.com/photos/20593095/pexels-photo-20593095.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    label: "Religious Services & Education",
    text: "To provide religious services and education, social ceremonies, such as majalis, jashns, marriages and funerals and to promote Shia Islamic fundamentals and codes.",
    image:
      "https://images.pexels.com/photos/31679271/pexels-photo-31679271.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    label: "Unity & Cooperation",
    text: "To promote and enhance mutual understanding, cooperation and unity among the Shia Muslims here and throughout the world.",
    image:
      "https://images.pexels.com/photos/36422766/pexels-photo-36422766.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    label: "Islamic & Religious Occasions",
    text: "To facilitate the observation of Islamic and religious occasions such as daily congregation prayers, Friday prayers, Eid reunions, Majalis, religious processions, jashans, deliberations, and other special services.",
    image:
      "https://images.pexels.com/photos/15037318/pexels-photo-15037318.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

export default function OurMissionPage() {
  return (
    <>
      {/* Page hero */}
      <section className="relative isolate overflow-hidden bg-ink-900 py-20 sm:py-24 lg:py-28">
        <ParallaxBackground
          src="https://images.pexels.com/photos/7428026/pexels-photo-7428026.jpeg?auto=compress&cs=tinysrgb&w=1920"
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
              Midwest Association of Shia Organized Muslims
              <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Our Mission
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">
              Providing and updating you with information regarding our activities conducted here
              at MASOM, located in Chicago, IL.
            </p>
          </Reveal>
        </Container>
        <div
          className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-sand-400/50 to-transparent"
          aria-hidden="true"
        />
      </section>

      {/* Mission introduction */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal className="mx-auto max-w-3xl">
            <span
              className="mx-auto block h-1 w-14 rounded-full bg-brand-500"
              aria-hidden="true"
            />
            <p className="mt-8 text-center font-heading text-2xl leading-snug font-bold text-foreground sm:text-3xl">
              Salaam-un-Alaikum, Brothers and Sisters,
            </p>
            <p className="mt-6 text-center text-base leading-[1.9] text-muted-foreground sm:text-lg sm:leading-[1.9]">
              By the grace of almighty Allah, and the 14 Ma’soomeen (Infallibles), we have
              organized this site to provide and update you with information regarding our
              activities conducted here at MASOM (Midwest Association of Shia Organized Muslims)
              located in Chicago, IL.
            </p>
            <p className="mt-10 text-center font-heading text-lg font-bold text-brand-600">
              Some of our goals are:
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Our goals */}
      <section className="bg-muted/40 py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            title="Our Goals"
            description="The goals that guide MASOM’s religious, educational and community work."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
            {goals.map((goal, index) => (
              <Reveal key={goal.label} delay={(index % 2) * 0.08}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-elevated">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={goal.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-7 sm:p-8">
                    <h3 className="font-heading text-xl leading-snug font-bold text-foreground">
                      {goal.label}
                    </h3>
                    <span
                      className="mt-3 block h-0.5 w-10 rounded-full bg-brand-500 transition-all duration-300 group-hover:w-16"
                      aria-hidden="true"
                    />
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                      {goal.text}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
