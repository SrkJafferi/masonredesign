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

/** Max playlist items examined per page while collecting recent streams. */
const PLAYLIST_PAGE_SIZE = 50;
/** Hard cap on playlist pages walked, so a huge channel can never hang the page. */
const MAX_PLAYLIST_PAGES = 10;

type YouTubeSearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    publishedAt?: string;
    liveBroadcastContent?: YouTubeLiveStatus;
    thumbnails?: YouTubeThumbnails;
  };
};

type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[];
  nextPageToken?: string;
  error?: { message?: string };
};

type YouTubePlaylistItem = {
  snippet?: {
    publishedAt?: string;
    title?: string;
    resourceId?: { videoId?: string };
    thumbnails?: YouTubeThumbnails;
  };
};

type YouTubePlaylistResponse = {
  items?: YouTubePlaylistItem[];
  nextPageToken?: string;
  error?: { message?: string };
};

type YouTubeVideoItem = {
  id?: string;
  snippet?: {
    publishedAt?: string;
    title?: string;
    thumbnails?: YouTubeThumbnails;
  };
  liveStreamingDetails?: {
    /** Present once the broadcast actually started. */
    actualStartTime?: string;
    /** Absent while the broadcast is still live. */
    actualEndTime?: string;
  };
};

type YouTubeVideoResponse = {
  items?: YouTubeVideoItem[];
  error?: { message?: string };
};

type YouTubeThumbnails = {
  default?: { url?: string };
  medium?: { url?: string };
  high?: { url?: string };
  standard?: { url?: string };
  maxres?: { url?: string };
};

/**
 * The uploads playlist for a channel is always `UU` + the channel id with the
 * leading `UC` replaced. Unlike `search.list` with `eventType=completed` (whose
 * eventually-consistent index intermittently returns a partial page), the
 * playlist endpoint is deterministic and returns the full recent upload list in
 * reverse-chronological order.
 */
function uploadsPlaylistId(channelId: string): string {
  return `UU${channelId.slice(2)}`;
}

/**
 * Calls the YouTube Data API `search.list` for the MASOM channel filtered to a
 * given broadcast event type. Returns an empty array on any failure so the
 * caller can degrade gracefully without exposing API errors.
 *
 * This endpoint is only used for the small `live` and `upcoming` sets. Recent
 * completed broadcasts come from the deterministic uploads playlist instead
 * (see `fetchRecentStreams`), because `eventType=completed` search results are
 * eventually consistent and intermittently omit most of the channel's uploads,
 * which would leave the homepage carousel with too few cards to slide.
 */
async function fetchStreamsByType(
  apiKey: string,
  eventType: "live" | "upcoming",
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

/** Picks the highest-resolution thumbnail URL available for a snippet. */
function pickThumbnail(thumbs: YouTubeThumbnails | undefined): string | null {
  if (!thumbs) return null;
  // `maxres` is not always present; fall back through the available sizes.
  const sizes = [thumbs.maxres, thumbs.standard, thumbs.high, thumbs.medium, thumbs.default];
  for (const size of sizes) {
    if (size?.url) return size.url;
  }
  return null;
}

/**
 * Loads the channel's most recent live broadcasts from the uploads playlist.
 *
 * The uploads playlist contains every upload (including normal non-stream
 * videos), so each batch of video IDs is resolved through `videos.list` with
 * `liveStreamingDetails` to keep only actual broadcasts — a video is treated as
 * a stream only when it has live-streaming details. Playlist pages are walked
 * (pagination) until enough completed broadcasts are collected or there are no
 * more items. Results are returned newest-first.
 */
async function fetchRecentStreams(apiKey: string): Promise<YouTubeStream[]> {
  const streams: YouTubeStream[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < MAX_PLAYLIST_PAGES && streams.length < YOUTUBE_MAX_RESULTS; page++) {
    // 1) One playlist page of uploads.
    const playlistParams = new URLSearchParams({
      part: "snippet",
      playlistId: uploadsPlaylistId(YOUTUBE_CHANNEL_ID),
      maxResults: String(PLAYLIST_PAGE_SIZE),
      key: apiKey,
    });
    if (pageToken) playlistParams.set("pageToken", pageToken);

    const playlistResponse = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?${playlistParams.toString()}`,
      {
        headers: { accept: "application/json" },
        next: { revalidate: YOUTUBE_REVALIDATE_SECONDS },
      },
    );
    if (!playlistResponse.ok) {
      throw new Error(`YouTube API responded with ${playlistResponse.status}`);
    }
    const playlistData = (await playlistResponse.json()) as YouTubePlaylistResponse;
    if (playlistData.error?.message) {
      throw new Error(playlistData.error.message);
    }

    const videoIds: string[] = [];
    for (const item of playlistData.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      if (videoId) videoIds.push(videoId);
    }

    pageToken = playlistData.nextPageToken;
    if (videoIds.length === 0) break;

    // 2) Resolve the batch through videos.list so only true broadcasts survive.
    const videoParams = new URLSearchParams({
      part: "snippet,liveStreamingDetails",
      id: videoIds.join(","),
      key: apiKey,
    });
    const videoResponse = await fetch(`${YOUTUBE_API_BASE}/videos?${videoParams.toString()}`, {
      headers: { accept: "application/json" },
      next: { revalidate: YOUTUBE_REVALIDATE_SECONDS },
    });
    if (!videoResponse.ok) {
      throw new Error(`YouTube API responded with ${videoResponse.status}`);
    }
    const videoData = (await videoResponse.json()) as YouTubeVideoResponse;
    if (videoData.error?.message) {
      throw new Error(videoData.error.message);
    }

    for (const item of videoData.items ?? []) {
      const videoId = item.id;
      const title = item.snippet?.title?.trim();
      const thumbnailUrl = pickThumbnail(item.snippet?.thumbnails);
      // Normal uploads (no live-streaming details) are not streams — skip them.
      if (!videoId || !title || !thumbnailUrl || !item.liveStreamingDetails) continue;

      const { actualStartTime, actualEndTime } = item.liveStreamingDetails;
      streams.push({
        id: videoId,
        videoId,
        title,
        publishedAt: item.snippet?.publishedAt ?? "",
        thumbnailUrl,
        // Still streaming right now if it started but never ended.
        liveStatus: actualStartTime && !actualEndTime ? "live" : "none",
      });
    }
  }

  // Playlist order is already newest-first, but the videos.list batch response
  // may come back in a different order — sort to be safe.
  streams.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return streams.slice(0, YOUTUBE_MAX_RESULTS);
}

function toStream(item: YouTubeSearchItem): YouTubeStream | null {
  const videoId = item.id?.videoId;
  const title = item.snippet?.title?.trim();
  const thumbnailUrl = pickThumbnail(item.snippet?.thumbnails);

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
 * Recent streams come from the deterministic uploads playlist (filtered to
 * actual live broadcasts); the large featured player shows an active live
 * broadcast first, otherwise the most recent stream. Upcoming broadcasts are
 * only used to enrich the grid if no streams exist at all, and never replace a
 * completed stream as the feature. On any failure (missing key, network, API
 * error) this returns an empty result and never throws, so the homepage always
 * renders.
 */
export async function getYouTubeStreams(): Promise<YouTubeStreamsResult> {
  const empty: YouTubeStreamsResult = { featured: null, recent: [], isLive: false };

  const apiKey = getYouTubeApiKey();
  if (!apiKey) return empty;

  try {
    const [live, upcoming, recent] = await Promise.all([
      fetchStreamsByType(apiKey, "live"),
      fetchStreamsByType(apiKey, "upcoming"),
      fetchRecentStreams(apiKey),
    ]);

    const liveStreams = uniqueById(live.map(toStream).filter((s): s is YouTubeStream => s !== null));
    const recentStreams = uniqueById(recent);
    const upcomingStreams = uniqueById(
      upcoming.map(toStream).filter((s): s is YouTubeStream => s !== null),
    );

    // Feature an active live broadcast when present. `fetchRecentStreams`
    // already flags currently-live playlist videos, but the live search result
    // is authoritative for what is broadcasting right now — prefer it.
    if (liveStreams.length > 0) {
      const featured = liveStreams[0];
      return {
        featured,
        recent: recentStreams.filter((s) => s.videoId !== featured.videoId),
        isLive: true,
      };
    }

    // Otherwise feature the most recent completed broadcast.
    if (recentStreams.length > 0) {
      const featured = recentStreams[0];
      return { featured, recent: recentStreams.slice(1), isLive: false };
    }

    // Only when there are no streams at all, offer upcoming content.
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
