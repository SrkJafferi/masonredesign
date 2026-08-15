import { ArrowUpRightIcon, ClapperboardIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import { YOUTUBE_CHANNEL_STREAMS_URL } from "@/features/youtube/config";
import type { YouTubeStreamsResult } from "@/features/youtube/types";

import { LiveStreamPlayer } from "./live-stream-player";

type LiveStreamsSectionProps = {
  streams: YouTubeStreamsResult;
};

export function LiveStreamsSection({ streams }: LiveStreamsSectionProps) {
  const hasContent = streams.featured !== null;

  return (
    <section className="relative isolate overflow-hidden bg-ink-900 py-16 sm:py-20 lg:py-24">
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow="MASOM YouTube"
            title="MASOM Live & Recent Streams"
            description="Watch MASOM's latest live programs and recent streams from the Imambargah."
            tone="dark"
          />
        </Reveal>

        {hasContent && streams.featured ? (
          <Reveal delay={0.08} className="mt-10">
            <LiveStreamPlayer
              featured={streams.featured}
              recent={streams.recent}
              isLive={streams.isLive}
            />
          </Reveal>
        ) : (
          <Reveal delay={0.08} className="mt-10">
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-brand-500 text-white">
                <ClapperboardIcon className="size-8" aria-hidden="true" />
              </span>
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-white">Watch Our Live Programs</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Join MASOM&apos;s streams on our official YouTube channel for majalis, programs and
                  community broadcasts.
                </p>
              </div>
              <Button asChild variant="secondary" className="h-11 bg-white px-6 text-sm font-bold text-brand-700 hover:bg-white/90">
                <a
                  href={YOUTUBE_CHANNEL_STREAMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Our YouTube Channel
                  <ArrowUpRightIcon className="size-4" />
                </a>
              </Button>
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
