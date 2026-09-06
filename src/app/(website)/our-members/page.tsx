import {
  ArrowRightIcon,
  HeartIcon,
  PhoneIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/layout/container";
import { ParallaxBackground } from "@/components/website/parallax-background";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import { createMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Our Executive Committee",
  description:
    "Meet the MASOM Executive Committee and the sub committees that keep the smooth operation of all MASOM events and activities at the MASOM Imambargah.",
  path: "/our-members",
});

/** Faint teal dot grid used as a barely-there texture behind sections. */
const dotGrid = {
  backgroundImage:
    "radial-gradient(circle, rgba(92, 184, 178, 0.12) 1px, transparent 1.4px)",
  backgroundSize: "28px 28px",
  maskImage: "linear-gradient(to bottom, black, transparent 80%)",
  WebkitMaskImage: "linear-gradient(to bottom, black, transparent 80%)",
};

type ExecutiveMember = {
  role: string;
  name: string;
  phone: string;
  tel: string;
  prominent?: boolean;
};

/** Source: masom.com/our-members — preserved verbatim, including phone numbers. */
const executiveCommittee: ExecutiveMember[] = [
  {
    role: "President",
    name: "Mussaddiq (Akhter) Naqvi",
    phone: "(847) 507-2171",
    tel: "+18475072171",
    prominent: true,
  },
  {
    role: "Vice President",
    name: "Imran Aziz Zaidi",
    phone: "(847) 293-9060",
    tel: "+18472939060",
  },
  {
    role: "Secretary",
    name: "Ahmed Abbas",
    phone: "(773) 787-6238",
    tel: "+17737876238",
  },
  {
    role: "Exec. Secretary",
    name: "Nasir Hussain",
    phone: "(773) 971-1173",
    tel: "+17739711173",
  },
  {
    role: "Treasurer",
    name: "Ali Nasir",
    phone: "(773) 983-5363",
    tel: "+17739835363",
  },
];

type CommitteeMember = {
  name: string;
  /** e.g. "(Coordinator)" / "(Chairperson)" as shown on the source page. */
  note?: string;
};

type Committee = {
  name: string;
  members: CommitteeMember[];
};

/** Source: masom.com/our-members — committee names and members preserved verbatim. */
const subCommittees: Committee[] = [
  {
    name: "Program Committee",
    members: [
      { name: "Br. Shahzad Naqvi", note: "(Coordinator)" },
      { name: "Br. Monis Abidi" },
      { name: "Br. Asif Hussain" },
    ],
  },
  {
    name: "Building Committee",
    members: [{ name: "Dr. Ali Shah" }, { name: "Br. Azam Hussain" }],
  },
  {
    name: "Taburuk Committee",
    members: [{ name: "Br. Asif Hussain" }, { name: "Br. Nasir Hussain" }],
  },
  {
    name: "Fundraising Committee",
    members: [{ name: "Dr. Nasreen Shah" }, { name: "Br. Raza Hussain" }],
  },
  {
    name: "Finance Committee",
    members: [{ name: "TBD" }],
  },
  {
    name: "Audit Committee",
    members: [{ name: "Br. Ghalib Hussain" }],
  },
  {
    name: "Aalim Committee",
    members: [
      { name: "Br. Yadgar Mehdi" },
      { name: "Br. Samar Abbas" },
      { name: "Br. Hassan Jafri" },
      { name: "Br. Abid Shah" },
    ],
  },
  {
    name: "Wadi E MASOM Committee",
    members: [
      { name: "Br. Raza Hussain" },
      { name: "Br. Sheikh Imtiaz" },
      { name: "Br. Masood Abbas Amie" },
    ],
  },
  {
    name: "Funeral Committee",
    members: [
      { name: "Br. Masood Abbas Amie" },
      { name: "Br. Mehmood Dhanji" },
      { name: "Br. Yadgar Mehdi" },
      { name: "Br. Hassan Abbas" },
    ],
  },
  {
    name: "Ziarat Committee",
    members: [
      { name: "Br. Yawer Ali" },
      { name: "Br. Hamza Raza" },
      { name: "Br. Mohammad Raza" },
      { name: "Br. Masood Abbas" },
      { name: "Br. Mustafa Ali" },
    ],
  },
  {
    name: "Ladies Committee",
    members: [
      { name: "Sr. Shela Naqvi", note: "(Chairperson)" },
      { name: "Sr. Fauzia Zafar" },
      { name: "Sr. Zareen Ali Bhai" },
      { name: "Sr. Mehjabeen Abdullah" },
      { name: "Sr. Anum Jaffery" },
      { name: "Sr. Fatima Dashtee" },
    ],
  },
  {
    name: "IT/AV/ Communication Committee",
    members: [
      { name: "Br. Munis Abidi" },
      { name: "Br. Mohammad Raza" },
      { name: "Br. Ahmed Abbas" },
    ],
  },
  {
    name: "Safety and Security Committee",
    members: [{ name: "Br. Masood Abbas Amie" }],
  },
  {
    name: "Parking Committee",
    members: [
      { name: "Br. Tahseen Ali" },
      { name: "Br. Syed Ali Zaidi" },
      { name: "Br. Mohsin Dhanji" },
    ],
  },
  {
    name: "Procession Committee",
    members: [
      { name: "Br. Raza Hussain" },
      { name: "Dr. Ali Shah" },
      { name: "Br. Asif Hussain" },
      { name: "Br. Naseer Haider" },
      { name: "Br. Mustafa Ali" },
    ],
  },
  {
    name: "Public Relations Committee",
    members: [{ name: "Br. Naseer Haider" }, { name: "Br. Raza Hussain" }],
  },
  {
    name: "Youth Committee",
    members: [
      { name: "Br. Ovais Zeni" },
      { name: "Sr. Fatima Dashtee" },
      { name: "Br. Taha Ali Bhai" },
      { name: "Br. Asad Ali Bhai" },
      { name: "Br. Adil Ali Bhai" },
      { name: "Br. Payman" },
      { name: "Br. Mustafa Jaffery" },
      { name: "Br. Mohammad Raza" },
    ],
  },
];

/** Small stat chips shown in the hero, derived from the page's own data. */
const heroStats = [
  {
    icon: UsersIcon,
    value: "5",
    label: "Executive Members",
    caption: "Leading with service",
  },
  {
    icon: UserRoundIcon,
    value: "Multiple",
    label: "Sub Committees",
    caption: "Supporting our community",
  },
  {
    icon: HeartIcon,
    value: "Stronger",
    label: "Together",
    caption: "For a better tomorrow",
  },
] as const;

export default function OurMembersPage() {
  return (
    <>
      {/* Page hero */}
      <section className="relative isolate overflow-hidden bg-ink-900 py-20 sm:py-24 lg:py-28">
        <ParallaxBackground
          src="https://images.pexels.com/photos/38235418/pexels-photo-38235418.jpeg?auto=compress&cs=tinysrgb&w=1920"
          opacity="opacity-50"
        />
        <div className="absolute inset-0 bg-ink-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,184,178,0.14),transparent_60%)]" />
        <Container className="relative">
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
              <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
                <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.22em] text-brand-400 uppercase">
                  <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
                  MASOM Committee
                  <span className="hidden h-px w-7 bg-current opacity-50 sm:block" aria-hidden="true" />
                </span>
                <h1 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  Our Executive Committee
                </h1>
                <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
                  Meet the dedicated members who help guide MASOM&rsquo;s
                  operations, programs, and community initiatives.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
                  We have an organized Executive Committee to serve MASOM and to
                  maintain and keep the smooth operation of all MASOM events and
                  activities. Please do not hesitate to contact us for more
                  information or if you have any suggestions.
                </p>
              </div>

              {/* Hero quote */}
              <blockquote className="mx-auto max-w-xs text-center lg:mx-0 lg:max-w-sm lg:text-right">
                <p className="font-heading text-lg leading-relaxed text-white italic lg:text-xl">
                  &ldquo;Service to the community is service to Allah
                  (SWT).&rdquo;
                </p>
                <span
                  className="mt-4 block h-0.5 w-16 rounded-full bg-brand-400 lg:ml-auto"
                  aria-hidden="true"
                />
              </blockquote>
            </div>
          </Reveal>

          {/* Stat chips */}
          <Reveal delay={0.1}>
            <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:mt-14">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:flex-col sm:items-start sm:gap-3 sm:p-5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-400 ring-1 ring-brand-400/25">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-heading text-2xl leading-none font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs font-bold tracking-[0.14em] text-white/80 uppercase">
                        {stat.label}
                      </p>
                      <p className="mt-0.5 text-xs text-white/55">{stat.caption}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Executive committee */}
      <section className="relative isolate overflow-hidden bg-background py-16 sm:py-20 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 size-[28rem] rounded-full bg-brand-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={dotGrid}
        />
        <Container className="relative">
          <SectionHeading
            eyebrow="Our Leadership"
            title="Our Executive Committee"
            description="The elected officers who lead MASOM and its committees."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {executiveCommittee.map((member, index) => (
              <Reveal key={member.role} delay={index * 0.06} className="h-full">
                <article
                  className={cn(
                    "group relative flex h-full flex-col items-center gap-4 overflow-hidden rounded-3xl border bg-card p-6 pt-9 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated",
                    member.prominent
                      ? "border-brand-500/50 bg-gradient-to-b from-brand-500/10 via-card to-card"
                      : "border-border/60 hover:border-brand-500/40",
                  )}
                >
                  <span
                    className={cn(
                      "absolute inset-x-10 top-0 h-0.5 rounded-full",
                      member.prominent
                        ? "bg-gradient-to-r from-brand-400 via-brand-500 to-brand-400"
                        : "bg-brand-500/40 group-hover:bg-brand-500",
                    )}
                    aria-hidden="true"
                  />
                  <span className="grid size-14 place-items-center rounded-full bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white">
                    <UserRoundIcon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">
                      {member.role}
                    </h3>
                    <p className="mt-2 font-heading text-lg leading-snug font-bold text-foreground">
                      {member.name}
                    </p>
                  </div>
                  <a
                    href={`tel:${member.tel}`}
                    className="mt-auto inline-flex items-center gap-2 rounded-full border border-border/60 px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors duration-200 outline-none hover:border-brand-500/50 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <PhoneIcon className="size-3.5 text-brand-600" aria-hidden="true" />
                    <span className="tabular-nums">{member.phone}</span>
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Sub committees */}
      <section className="relative isolate overflow-hidden bg-muted/40 py-16 sm:py-20 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 size-[30rem] rounded-full bg-brand-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-32 size-[26rem] rounded-full bg-sand-400/15 blur-3xl"
        />
        <Container className="relative">
          <SectionHeading
            eyebrow="Our Committees"
            title="Our Sub Committees"
            description="Dedicated members serving across MASOM’s programs and activities."
          />
          <Reveal delay={0.05}>
            <blockquote className="mt-8 text-center lg:text-right">
              <p className="font-heading text-base leading-relaxed text-muted-foreground italic lg:text-lg">
                &ldquo;A stronger community today, a brighter tomorrow.&rdquo;
              </p>
              <span
                className="mt-3 block h-0.5 w-14 rounded-full bg-brand-500/70 lg:ml-auto"
                aria-hidden="true"
              />
            </blockquote>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subCommittees.map((committee, index) => (
              <Reveal key={committee.name} delay={(index % 4) * 0.05} className="h-full">
                <article className="group flex h-full flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-elevated">
                  <div className="flex items-start gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/15 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white">
                      <UsersIcon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-heading text-lg leading-snug font-bold text-foreground">
                      {committee.name}
                    </h3>
                  </div>
                  <span
                    className="mt-4 block h-0.5 w-10 rounded-full bg-brand-500 transition-all duration-300 group-hover:w-16"
                    aria-hidden="true"
                  />
                  <ul className="mt-4 space-y-2.5">
                    {committee.members.map((member) => (
                      <li
                        key={member.name}
                        className="flex items-baseline gap-1.5 text-sm leading-relaxed text-muted-foreground"
                      >
                        {member.note ? (
                          <>
                            <span className="font-semibold text-foreground">
                              {member.name}
                            </span>
                            <span className="font-semibold text-brand-600">
                              {member.note}
                            </span>
                          </>
                        ) : (
                          <span className="before:mr-2 before:content-['•'] before:text-brand-500/70">
                            {member.name}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Get involved CTA */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="relative min-h-56 lg:min-h-full">
                <Image
                  src="https://images.pexels.com/photos/7428026/pexels-photo-7428026.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-brand-900/20 lg:bg-gradient-to-r"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col items-start gap-5 p-8 sm:p-10 lg:p-12">
                <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.22em] text-brand-600 uppercase">
                  <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
                  Get Involved
                </span>
                <h2 className="font-heading text-2xl leading-snug font-bold text-foreground sm:text-3xl">
                  Interested in volunteering or supporting a committee?
                </h2>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                  Contact MASOM to learn how you can help serve the community.
                </p>
                <a
                  href="/contacts"
                  className="group mt-2 inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-bold text-white shadow-card transition-colors duration-200 outline-none hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
                >
                  Contact Us
                  <ArrowRightIcon
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}