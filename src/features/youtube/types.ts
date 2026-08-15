/** YouTube's `liveBroadcastContent` field for a video/broadcast. */
export type YouTubeLiveStatus = "live" | "upcoming" | "none";

/** A single MASOM YouTube stream/broadcast shown in the homepage section. */
export type YouTubeStream = {
  id: string;
  videoId: string;
  title: string;
  /** ISO 8601 publish/scheduled time from the API. */
  publishedAt: string;
  /** Best available thumbnail URL (highest resolution present). */
  thumbnailUrl: string;
  liveStatus: YouTubeLiveStatus;
};

/**
 * Result of loading the homepage stream data. `featured` is the stream shown
 * in the large player; `recent` is the compact grid below it. Empty arrays
 * mean the YouTube API was unavailable or returned nothing, in which case the
 * section renders its graceful fallback.
 */
export type YouTubeStreamsResult = {
  featured: YouTubeStream | null;
  recent: YouTubeStream[];
  /** True only when the featured stream is actually live right now. */
  isLive: boolean;
};
