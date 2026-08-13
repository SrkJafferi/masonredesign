/**
 * Seeds the MASOM CMS with the real Phase 3 homepage content: uploads the local
 * hero and program images to Supabase Storage and inserts matching banner and
 * program rows. Announcements are intentionally NOT seeded — the ticker is a new
 * feature with no existing content.
 *
 * PREREQUISITES
 *   1. The migrations in supabase/migrations have been applied (tables, RLS and
 *      storage buckets exist). See supabase/README.md.
 *   2. .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * RUN
 *   node --env-file=.env.local scripts/seed-cms.mjs
 *
 * Idempotent: if the banners/programs tables already contain rows, that table is
 * skipped so re-running will not create duplicates. Storage uploads use upsert.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env. Run with: node --env-file=.env.local scripts/seed-cms.mjs " +
      "(needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CONTENT_TYPE = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// --- Real Phase 3 content (mirrors src/features/home/data) -------------------

const banners = [
  { file: "hero/hero-1.jpg", alt: "MASOM Imambargah community gathering" },
  { file: "hero/hero-2.jpg", alt: "Majlis at MASOM Imambargah" },
  { file: "hero/hero-3.jpeg", alt: "MASOM community event" },
  { file: "hero/hero-4.webp", alt: "Imam Mehdi (as) commemorative banner" },
];

// 24h "HH:MM:SS" times; titles are required by the schema, so untitled majalis
// are labelled "Majalis" (their real nature) rather than invented events.
const programs = [
  {
    title: "Majalis",
    start_date: "2026-08-11",
    start_time: "20:00:00",
    end_time: "23:00:00",
    poster: "programs/event-3918.jpeg",
  },
  {
    title: "Majalis",
    start_date: "2026-08-12",
    start_time: "20:00:00",
    end_time: "23:00:00",
    poster: "programs/event-3920.jpeg",
  },
  {
    title: "Majalis",
    start_date: "2026-08-13",
    start_time: "20:00:00",
    end_time: "22:00:00",
    poster: "programs/event-3922.jpeg",
  },
  {
    title: "Friday Prayers",
    start_date: "2026-08-14",
    start_time: "13:00:00",
    end_time: "14:00:00",
    poster: "programs/friday-prayers.jpg",
  },
  {
    title: "Majalis",
    start_date: "2026-08-14",
    start_time: "20:00:00",
    end_time: "22:00:00",
    poster: "programs/event-3922.jpeg",
  },
  {
    title: "Majalis",
    start_date: "2026-08-15",
    start_time: "20:00:00",
    end_time: "22:00:00",
    poster: "programs/event-3922.jpeg",
  },
  {
    title: "Alwidai Majalis e Ayyam E Aza",
    start_date: "2026-08-20",
    start_time: "20:00:00",
    end_time: "22:00:00",
    poster: "programs/alwidai-majalis.jpg",
  },
  {
    title: "Friday Prayers",
    start_date: "2026-08-21",
    start_time: "13:00:00",
    end_time: "14:00:00",
    poster: "programs/friday-prayers.jpg",
  },
  {
    title: "Alwidai Majalis e Ayyam E Aza",
    start_date: "2026-08-21",
    start_time: "20:00:00",
    end_time: "22:00:00",
    poster: "programs/alwidai-majalis.jpg",
  },
];

// --- Helpers -----------------------------------------------------------------

/** Uploads a public/ file to a bucket using its basename as the object key. */
async function upload(bucket, publicRelPath) {
  const key = path.basename(publicRelPath);
  const ext = path.extname(key).toLowerCase();
  const body = await readFile(path.join(PUBLIC_DIR, publicRelPath));
  const { error } = await supabase.storage.from(bucket).upload(key, body, {
    contentType: CONTENT_TYPE[ext] ?? "application/octet-stream",
    upsert: true,
  });
  if (error) throw new Error(`upload ${bucket}/${key}: ${error.message}`);
  return key;
}

async function tableIsEmpty(table) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(`count ${table}: ${error.message}`);
  return (count ?? 0) === 0;
}

// --- Seed --------------------------------------------------------------------

async function seedBanners() {
  if (!(await tableIsEmpty("banners"))) {
    console.log("• banners: table already has rows — skipped.");
    return;
  }
  const rows = [];
  for (let i = 0; i < banners.length; i += 1) {
    const image_path = await upload("banners", banners[i].file);
    rows.push({
      image_path,
      image_alt: banners[i].alt,
      sort_order: i,
      is_active: true,
    });
  }
  const { error } = await supabase.from("banners").insert(rows);
  if (error) throw new Error(`insert banners: ${error.message}`);
  console.log(`• banners: inserted ${rows.length}.`);
}

async function seedPrograms() {
  if (!(await tableIsEmpty("programs"))) {
    console.log("• programs: table already has rows — skipped.");
    return;
  }
  const rows = [];
  for (let i = 0; i < programs.length; i += 1) {
    const program = programs[i];
    const poster_path = await upload("programs", program.poster);
    rows.push({
      title: program.title,
      poster_path,
      start_date: program.start_date,
      start_time: program.start_time,
      end_time: program.end_time,
      is_published: true,
      sort_order: i,
    });
  }
  const { error } = await supabase.from("programs").insert(rows);
  if (error) throw new Error(`insert programs: ${error.message}`);
  console.log(`• programs: inserted ${rows.length}.`);
}

async function main() {
  console.log("Seeding MASOM CMS…");
  await seedBanners();
  await seedPrograms();
  console.log("Done. (Announcements are not seeded — add them in the admin.)");
}

main().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exit(1);
});
