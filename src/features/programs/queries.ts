import "server-only";

import { upcomingPrograms } from "@/features/home/data/programs";
import { logCmsError } from "@/lib/cms/logging";
import { CMS_BUCKETS, resolveImageSrc } from "@/lib/media/storage";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { ProgramAdminItem, ProgramCard, ProgramRow } from "./types";

const BUCKET = CMS_BUCKETS.programs;
const DEFAULT_HREF = "/events-schedule";
const HOMEPAGE_LIMIT = 9;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Today's date in UTC as "YYYY-MM-DD" (matches how dates are stored/compared). */
function todayUtc(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
}

/** An event is upcoming while its end (or start, if single-day) is today or later. */
function isUpcoming(startDate: string, endDate: string | null): boolean {
  return (endDate ?? startDate) >= todayUtc();
}

/** "20:00:00" -> "8:00 PM". */
function formatClock(value: string | null): string | null {
  if (!value) return null;
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw ?? "0");
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad(minutes)} ${period}`;
}

function timeLabel(start: string | null, end: string | null): string | null {
  const startLabel = formatClock(start);
  const endLabel = formatClock(end);
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel ?? null;
}

function toProgramCard(row: ProgramRow): ProgramCard {
  return {
    id: row.id,
    title: row.title,
    startDate: row.start_date,
    timeLabel: timeLabel(row.start_time, row.end_time),
    posterSrc: resolveImageSrc(BUCKET, row.poster_path),
    href: row.link_url ?? DEFAULT_HREF,
  };
}

/** Real Phase 3 programs, used until the CMS holds published rows. */
function fallbackPrograms(): ProgramCard[] {
  return upcomingPrograms
    .filter((program) => isUpcoming(program.date, null))
    .slice(0, HOMEPAGE_LIMIT)
    .map((program) => ({
      id: program.id,
      title: program.title,
      startDate: program.date,
      timeLabel:
        program.startTime && program.endTime
          ? `${program.startTime} – ${program.endTime}`
          : (program.startTime ?? null),
      posterSrc: program.image.src,
      href: program.href,
    }));
}

/**
 * Public upcoming programs. Uses published, still-upcoming CMS rows when
 * present; otherwise falls back to the local reference programs.
 */
export async function getUpcomingPrograms(): Promise<ProgramCard[]> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("is_published", true)
      .order("start_date", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      const cards = (data as ProgramRow[])
        .filter((row) => isUpcoming(row.start_date, row.end_date))
        .slice(0, HOMEPAGE_LIMIT)
        .map(toProgramCard);
      if (cards.length > 0) return cards;
    }
  } catch (error) {
    logCmsError("programs:getUpcoming", error);
  }

  return fallbackPrograms();
}

/** Admin: every program (including past/unpublished), with poster previews. */
export async function getAllPrograms(): Promise<ProgramAdminItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("start_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    logCmsError("programs:getAll", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const program = row as ProgramRow;
    return { ...program, previewUrl: resolveImageSrc(BUCKET, program.poster_path) };
  });
}

export async function getProgramById(id: string): Promise<ProgramRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logCmsError("programs:getById", error);
    return null;
  }
  return (data as ProgramRow | null) ?? null;
}
