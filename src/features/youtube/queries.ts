import "server-only";

import { logCmsError } from "@/lib/cms/logging";

import {
  YOUTUBE_CHANNEL_ID,
  YOUTUBE_MAX_RESULTS,
  YOUTUBE_REVALIDATE_SECONDS,
  getYouTubeApiKey,
} from "./config";
import type { YouTubeStream, YouTubeStreamsResult, YouTubeLiveStatus } from "./types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

type YouTubeSearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    publishedAt?: string;
    liveBroadcastContent?: YouTubeLiveStatus;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
      standard?: { url?: string };
      maxres?: { url?: string };
    };
  };
};

type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[];
  error?: { message?: string };
};

/**
 * Calls the YouTube Data API `search.list` for the MASOM channel filtered to a
 * given broadcast event type. Returns an empty array on any failure so the
 * caller can degrade gracefully without exposing API errors.
 */
async function fetchStreamsByType(
  apiKey: string,
  eventType: "live" | "completed" | "upcoming",
): Promise<YouTubeSearchItem[]> {
  const params = new URLSearchParams({
    part: "snippet",
    channelId: YOUTUBE_CHANNEL_ID,
    type: "video",
    eventType,
    order: "date",
    maxResults: String(YOUTUBE_MAX_RESULTS),
    key: apiKey,
  });

  const response = await fetch(`${YOUTUBE_API_BASE}/search?${params.toString()}`, {
    headers: { accept: "application/json" },
    next: { revalidate: YOUTUBE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`YouTube API responded with ${response.status}`);
  }

  const data = (await response.json()) as YouTubeSearchResponse;

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  return data.items ?? [];
}

/** Picks the highest-resolution thumbnail URL available for a search item. */
function pickThumbnail(item: YouTubeSearchItem): string | null {
  const thumbs = item.snippet?.thumbnails;
  if (!thumbs) return null;
  // `maxres` is not always present; fall back through the available sizes.
  const sizes = [thumbs.maxres, thumbs.standard, thumbs.high, thumbs.medium, thumbs.default];
  for (const size of sizes) {
    if (size?.url) return size.url;
  }
  return null;
}

function toStream(item: YouTubeSearchItem): YouTubeStream | null {
  const videoId = item.id?.videoId;
  const title = item.snippet?.title?.trim();
  const thumbnailUrl = pickThumbnail(item);

  if (!videoId || !title || !thumbnailUrl) return null;

  return {
    id: videoId,
    videoId,
    title,
    publishedAt: item.snippet?.publishedAt ?? "",
    thumbnailUrl,
    liveStatus: item.snippet?.liveBroadcastContent ?? "none",
  };
}

/** Deduplicates streams by video ID, keeping the first occurrence. */
function uniqueById(streams: YouTubeStream[]): YouTubeStream[] {
  const seen = new Set<string>();
  return streams.filter((stream) => {
    if (seen.has(stream.videoId)) return false;
    seen.add(stream.videoId);
    return true;
  });
}

/**
 * Loads the homepage stream data for the MASOM channel.
 *
 * Priority for the featured stream: an active live broadcast first, otherwise
 * the most recent completed broadcast. Upcoming broadcasts are only used to
 * enrich the grid if no live/completed content exists, and never replace a
 * completed stream as the feature. On any failure (missing key, network,
 * API error) this returns an empty result and never throws, so the homepage
 * always renders.
 */
export async function getYouTubeStreams(): Promise<YouTubeStreamsResult> {
  const empty: YouTubeStreamsResult = { featured: null, recent: [], isLive: false };

  const apiKey = getYouTubeApiKey();
  if (!apiKey) return empty;

  try {
    const [live, completed, upcoming] = await Promise.all([
      fetchStreamsByType(apiKey, "live"),
      fetchStreamsByType(apiKey, "completed"),
      fetchStreamsByType(apiKey, "upcoming"),
    ]);

    const liveStreams = uniqueById(live.map(toStream).filter((s): s is YouTubeStream => s !== null));
    const completedStreams = uniqueById(
      completed.map(toStream).filter((s): s is YouTubeStream => s !== null),
    );
    const upcomingStreams = uniqueById(
      upcoming.map(toStream).filter((s): s is YouTubeStream => s !== null),
    );

    // Feature an active live broadcast when present.
    if (liveStreams.length > 0) {
      const featured = liveStreams[0];
      return { featured, recent: completedStreams, isLive: true };
    }

    // Otherwise feature the most recent completed broadcast.
    if (completedStreams.length > 0) {
      const featured = completedStreams[0];
      return { featured, recent: completedStreams.slice(1), isLive: false };
    }

    // Only when there is nothing live or completed, offer upcoming content.
    if (upcomingStreams.length > 0) {
      const featured = upcomingStreams[0];
      return { featured, recent: upcomingStreams.slice(1), isLive: false };
    }

    return empty;
  } catch (error) {
    logCmsError("youtube:getStreams", error);
    return empty;
  }
}
