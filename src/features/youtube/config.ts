import "server-only";

/**
 * Official MASOM Islamic Center YouTube channel. This is the source of truth
 * for the homepage "Live & Recent Streams" section — never use another channel
 * and never resolve by display name.
 */
export const YOUTUBE_CHANNEL_ID = "UCLE_Z6NZIg05Zzz1tn209sg";

/** Official YouTube channel streams URL, used for the fallback CTA. */
export const YOUTUBE_CHANNEL_STREAMS_URL =
  "https://www.youtube.com/@MASOMIslamicCenter/streams";

/**
 * The server-side response is cached for this many seconds so the homepage
 * does not hit the YouTube Data API on every request.
 */
export const YOUTUBE_REVALIDATE_SECONDS = 3600;

/** Maximum number of streams fetched per eventType (live/completed/upcoming). */
export const YOUTUBE_MAX_RESULTS = 8;

/**
 * Reads the server-only YouTube Data API key. Refuses to run in the browser so
 * the key can never leak into client bundles or rendered HTML.
 */
export function getYouTubeApiKey(): string | null {
  if (typeof window !== "undefined") {
    throw new Error("YOUTUBE_API_KEY must never be read in the browser.");
  }

  const value = process.env.YOUTUBE_API_KEY?.trim();
  return value ? value : null;
}
