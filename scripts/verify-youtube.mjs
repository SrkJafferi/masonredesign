/**
 * End-to-end verification of the MASOM YouTube data layer.
 *
 * Mirrors the exact request src/features/youtube/queries.ts makes against the
 * YouTube Data API (same endpoint, params, channel ID, and featured/recent
 * logic) so you can validate a real YOUTUBE_API_KEY without a browser or dev
 * server.
 *
 * Usage:
 *   node --env-file=.env.local scripts/verify-youtube.mjs
 */

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_CHANNEL_ID = "UCLE_Z6NZIg05Zzz1tn209sg";
const YOUTUBE_MAX_RESULTS = 8;

const apiKey = process.env.YOUTUBE_API_KEY?.trim();

if (!apiKey) {
  console.error(
    "YOUTUBE_API_KEY is not set in .env.local.\n" +
      "Create a key in Google Cloud Console (YouTube Data API v3 enabled), then\n" +
      "add YOUTUBE_API_KEY=<your key> to .env.local and re-run this script.",
  );
  process.exit(1);
}

async function fetchStreamsByType(eventType) {
  const params = new URLSearchParams({
    part: "snippet",
    channelId: YOUTUBE_CHANNEL_ID,
    type: "video",
    eventType,
    order: "date",
    maxResults: String(YOUTUBE_MAX_RESULTS),
    key: apiKey,
  });

  const url = `${YOUTUBE_API_BASE}/search?${params.toString()}`;
  console.log(`\n== search.list eventType=${eventType} ==`);
  console.log(url.replace(`key=${apiKey}`, "key=***"));

  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  if (data.error?.message) {
    throw new Error(`API error: ${data.error.message}`);
  }

  return (data.items ?? []).map((item) => ({
    videoId: item.id?.videoId,
    title: item.snippet?.title,
    publishedAt: item.snippet?.publishedAt,
    liveStatus: item.snippet?.liveBroadcastContent ?? "none",
    thumbnailUrl:
      item.snippet?.thumbnails?.maxres?.url ??
      item.snippet?.thumbnails?.standard?.url ??
      item.snippet?.thumbnails?.high?.url ??
      item.snippet?.thumbnails?.medium?.url ??
      item.snippet?.thumbnails?.default?.url ??
      null,
  }));
}

function uniqueById(streams) {
  const seen = new Set();
  return streams.filter((s) => {
    if (!s.videoId || seen.has(s.videoId)) return false;
    seen.add(s.videoId);
    return true;
  });
}

function pickFeatured(live, completed, upcoming) {
  if (live.length > 0) return { featured: live[0], recent: completed, isLive: true };
  if (completed.length > 0) return { featured: completed[0], recent: completed.slice(1), isLive: false };
  if (upcoming.length > 0) return { featured: upcoming[0], recent: upcoming.slice(1), isLive: false };
  return { featured: null, recent: [], isLive: false };
}

function truncate(text, length = 60) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function printStreams(label, streams) {
  console.log(`\n${label} (${streams.length}):`);
  if (streams.length === 0) {
    console.log("  (none)");
    return;
  }
  for (const s of streams) {
    console.log(
      `  [${s.liveStatus}] ${s.videoId}  ${truncate(s.title)}  (${s.publishedAt})`,
    );
    if (s.thumbnailUrl) console.log(`      thumb: ${s.thumbnailUrl}`);
  }
}

try {
  const [live, completed, upcoming] = await Promise.all([
    fetchStreamsByType("live"),
    fetchStreamsByType("completed"),
    fetchStreamsByType("upcoming"),
  ]);

  const liveStreams = uniqueById(live);
  const completedStreams = uniqueById(completed);
  const upcomingStreams = uniqueById(upcoming);

  printStreams("LIVE", liveStreams);
  printStreams("COMPLETED", completedStreams);
  printStreams("UPCOMING", upcomingStreams);

  const { featured, recent, isLive } = pickFeatured(liveStreams, completedStreams, upcomingStreams);

  console.log("\n== Result (mirrors getYouTubeStreams) ==");
  console.log(`isLive:   ${isLive}`);
  console.log(`featured: ${featured ? `${featured.videoId} — ${truncate(featured.title, 70)}` : "null"}`);
  console.log(`recent:   ${recent.length} stream(s)`);

  if (!featured) {
    console.warn("\nWARNING: no live, completed, or upcoming streams returned.");
  } else {
    console.log("\nOK: YouTube data layer verified against the live API.");
  }
} catch (error) {
  console.error("\nVERIFICATION FAILED:");
  console.error(error.message ?? error);
  process.exit(1);
}
