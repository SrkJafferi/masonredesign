import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import { NewsletterBackground } from "@/features/home/components/newsletter-background";
import { NewsletterSignup } from "@/features/home/components/newsletter-signup";

export function Newsletter() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 py-16 sm:py-20 lg:py-24">
      <NewsletterBackground src="https://images.pexels.com/photos/5058773/pexels-photo-5058773.jpeg?auto=compress&cs=tinysrgb&w=1920" />
      <div className="absolute inset-0 bg-ink-900/60" />

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
