import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import { NewsletterSignup } from "@/features/home/components/newsletter-signup";

export function Newsletter() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 py-16 sm:py-20 lg:py-24">
      <Image
        src="/features/islamic-school.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-ink-900/85" />

      <Container className="relative">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center">
          <SectionHeading
            eyebrow="Subscribe To Our Newsletter"
            title="Get The latest Updates"
            tone="dark"
          />
          <div className="mt-8 w-full">
            <NewsletterSignup />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
