import { PhoneIcon } from "lucide-react";

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,184,178,0.12),transparent_60%)]" />
        <Container className="relative">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.22em] text-brand-400 uppercase">
              <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
              MASOM Committee
              <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Our Executive Committee
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">
              We have an organized Executive Committee to serve MASOM and to maintain and
              keep the smooth operation of all MASOM events and activities. We strive to
              provide the best service to the members and attendees of MASOM Imambargah.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
              Please do not hesitate to contact us for more information or if you have any
              suggestions.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Executive committee */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            title="Our Executive Committee"
            description="The elected officers who lead MASOM and its committees."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {executiveCommittee.map((member, index) => (
              <Reveal key={member.role} delay={index * 0.06}>
                <article
                  className={cn(
                    "group relative flex h-full flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated",
                    member.prominent
                      ? "border-brand-500/50"
                      : "border-border/60 hover:border-brand-500/40",
                  )}
                >
                  <span
                    className="absolute inset-x-10 top-0 h-0.5 rounded-full bg-brand-500"
                    aria-hidden="true"
                  />
                  <h3 className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">
                    {member.role}
                  </h3>
                  <p className="font-heading text-lg leading-snug font-bold text-foreground">
                    {member.name}
                  </p>
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
      <section className="bg-muted/40 py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            title="Our Sub Committees"
            description="Dedicated members serving across MASOM’s programs and activities."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subCommittees.map((committee, index) => (
              <Reveal key={committee.name} delay={(index % 3) * 0.06}>
                <article className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-elevated">
                  <h3 className="font-heading text-lg leading-snug font-bold text-foreground">
                    {committee.name}
                  </h3>
                  <span className="mt-3 block h-0.5 w-10 rounded-full bg-brand-500" aria-hidden />
                  <ul className="mt-5 space-y-2.5">
                    {committee.members.map((member) => (
                      <li key={member.name} className="text-sm leading-relaxed text-muted-foreground">
                        {member.note ? (
                          <span>
                            <span className="font-semibold text-foreground">{member.name}</span>{" "}
                            <span className="font-semibold text-brand-600">{member.note}</span>
                          </span>
                        ) : (
                          member.name
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
    </>
  );
}
