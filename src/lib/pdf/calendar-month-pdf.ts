import "server-only";

import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import type { CalendarMonthView } from "@/features/calendar/types";

// MASOM brand colors (teal / sand / ink).
const TEAL = rgb(0.36, 0.72, 0.7); // #5cb8b2
const TEAL_DARK = rgb(0.23, 0.57, 0.55);
const SAND = rgb(0.72, 0.69, 0.61); // #b7b09c
const INK = rgb(0.15, 0.15, 0.17); // #27272b
const MUTED = rgb(0.37, 0.37, 0.4); // #5f5f66
const BORDER = rgb(0.86, 0.86, 0.86);
const ROW_ALT = rgb(0.972, 0.965, 0.937); // subtle sand tint
const ROW_FRIDAY = rgb(0.933, 0.976, 0.973); // subtle teal tint
const WHITE = rgb(1, 1, 1);

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Logo file (PNG) shipped with the site, embedded in the PDF header. This is
 * the site's primary (dark) wordmark, converted from the webp via
 * `npm run convert:logos` (pdf-lib embeds PNG, not webp). */
const LOGO_PATH = "public/brand/headlogon4.png";

type FontSet = {
  regular: PDFFont;
  bold: PDFFont;
};

function hijriRangeLabel(month: CalendarMonthView): string | null {
  const withHijri = month.days.filter((day) => day.hijri);
  if (withHijri.length === 0) return null;
  const first = withHijri[0].hijri!;
  const last = withHijri[withHijri.length - 1].hijri!;
  if (first.monthName === last.monthName && first.year === last.year) {
    return `${first.monthName} ${first.year} AH`;
  }
  return `${first.monthName} – ${last.monthName} ${last.year} AH`;
}

/** Column layout: [key, label, width]. Widths sum to CONTENT_W.
 *
 * NOTE: every cell is drawn WITHOUT maxWidth. pdf-lib wraps maxWidth text by
 * emitting a T* line-break whose drop (lineHeight) is much larger than the row
 * height, so wrapped text overlaps the rows below (seen with long Hijri month
 * names). The columns are sized so the real data always fits (widest Hijri
 * string "31 Jamadi-ul-Awwal" ≈ 66pt @7.5pt in an 86pt cell); any freak long
 * value simply overflows its cell and is clipped at the page edge instead of
 * wrapping.
 */
const COLUMNS: { key: string; label: string; width: number }[] = [
  { key: "date", label: "Date", width: 38 },
  { key: "day", label: "Day", width: 28 },
  { key: "hijri", label: "Hijri", width: 92 },
  { key: "fajr", label: "Fajr", width: 34 },
  { key: "sunrise", label: "Sunrise", width: 34 },
  { key: "zohar", label: "Zohar", width: 34 },
  { key: "sunset", label: "Sunset", width: 34 },
  { key: "maghrib", label: "Maghrib", width: 34 },
  { key: "midnight", label: "Midnight", width: 34 },
  { key: "events", label: "Events", width: 170 },
];

const EVENTS_X = MARGIN + COLUMNS.slice(0, 9).reduce((sum, col) => sum + col.width, 0);

async function drawHeaderBlock(page: PDFPage, fonts: FontSet, logoPng: Uint8Array) {
  const png = await page.doc.embedPng(logoPng);
  const logoW = 132;
  const logoH = (png.height / png.width) * logoW;
  page.drawImage(png, {
    x: MARGIN,
    y: PAGE_H - MARGIN - logoH,
    width: logoW,
    height: logoH,
  });

  page.drawText("Hijri Prayer Calendar", {
    x: MARGIN + 150,
    y: PAGE_H - MARGIN - 16,
    size: 15,
    font: fonts.bold,
    color: TEAL_DARK,
  });
  page.drawText("Midwest Association of Shia Organized Muslims", {
    x: MARGIN + 150,
    y: PAGE_H - MARGIN - 32,
    size: 7.5,
    font: fonts.regular,
    color: MUTED,
  });
  page.drawText("4353 W Lawrence Ave, Chicago, IL 60630", {
    x: MARGIN + 150,
    y: PAGE_H - MARGIN - 44,
    size: 7.5,
    font: fonts.regular,
    color: MUTED,
  });

  // Teal rule under the header.
  page.drawLine({
    start: { x: MARGIN, y: PAGE_H - MARGIN - 54 },
    end: { x: PAGE_W - MARGIN, y: PAGE_H - MARGIN - 54 },
    thickness: 1.4,
    color: TEAL,
  });
}

/** Returns the y baseline where the table header ends. */
function drawTableHeader(page: PDFPage, fonts: FontSet, y: number): number {
  const headerH = 18;
  page.drawRectangle({
    x: MARGIN,
    y: y - headerH,
    width: CONTENT_W,
    height: headerH,
    color: TEAL,
  });

  let x = MARGIN;
  for (const col of COLUMNS) {
    page.drawText(col.label, {
      x: x + 3,
      y: y - headerH + 5.5,
      size: 7,
      font: fonts.bold,
      color: WHITE,
    });
    x += col.width;
  }
  return y - headerH;
}

function drawFooter(page: PDFPage, fonts: FontSet, year: number) {
  const y = 40;
  page.drawLine({
    start: { x: MARGIN, y: y + 14 },
    end: { x: PAGE_W - MARGIN, y: y + 14 },
    thickness: 0.8,
    color: SAND,
  });
  page.drawText("MASOM • Midwest Association of Shia Organized Muslims", {
    x: MARGIN,
    y,
    size: 7.5,
    font: fonts.bold,
    color: MUTED,
  });
  const now = new Date();
  const generated = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const generatedTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const generatedText =
    `Generated from the live MASOM ${year} calendar on ${generated} at ${generatedTime} — masom.org`;
  page.drawText(generatedText, {
    x: PAGE_W - MARGIN - fonts.regular.widthOfTextAtSize(generatedText, 7.5),
    y,
    size: 7.5,
    font: fonts.regular,
    color: MUTED,
  });
}

/** Renders a single day row at the given baseline; returns the next baseline. */
function drawDayRow(
  page: PDFPage,
  fonts: FontSet,
  day: CalendarMonthView["days"][number],
  y: number,
  rowIndex: number,
): number {
  const ROW_H = 17;
  const isFriday = day.weekday === 5;

  if (isFriday) {
    page.drawRectangle({
      x: MARGIN,
      y: y - ROW_H,
      width: CONTENT_W,
      height: ROW_H,
      color: ROW_FRIDAY,
    });
  } else if (rowIndex % 2 === 0) {
    page.drawRectangle({
      x: MARGIN,
      y: y - ROW_H,
      width: CONTENT_W,
      height: ROW_H,
      color: ROW_ALT,
    });
  }

  const timing = (index: number) => day.timings[index]?.time ?? "—";
  const cells: Record<string, string> = {
    date: String(day.gregorianDay),
    day: WEEKDAYS[day.weekday] ?? "",
    hijri: day.hijri ? `${day.hijri.day} ${day.hijri.monthName}` : "—",
    fajr: timing(0),
    sunrise: timing(1),
    zohar: timing(2),
    sunset: timing(3),
    maghrib: timing(4),
    midnight: timing(5),
    events: day.events.length === 0 ? "—" : "",
  };

  let x = MARGIN;
  for (const col of COLUMNS) {
    if (col.key === "events") continue;
    page.drawText(cells[col.key], {
      x: x + 3,
      y: y - ROW_H + 5.5,
      size: 7.5,
      font: col.key === "date" || col.key === "day" ? fonts.bold : fonts.regular,
      color: INK,
    });
    x += col.width;
  }

  // Events column, one line per event. The stored titles already carry the
  // category prefix (e.g. "Wiladat: Hazrat Mohammad Mustafa (SAWW)"), so only
  // prepend it when the title does not already start with it — avoids the
  // "Wiladat: Wiladat: …" duplication. No maxWidth: long titles overflow the
  // cell and are clipped at the page edge rather than wrapping.
  let lineY = y - ROW_H + 5.5;
  for (const event of day.events) {
    const title = event.title;
    const prefix = event.category ? `${event.category}: ` : "";
    const titleHasPrefix =
      prefix.length > 0 && title.toLowerCase().startsWith(prefix.toLowerCase());

    if (titleHasPrefix) {
      page.drawText(title, {
        x: EVENTS_X,
        y: lineY,
        size: 6.5,
        font: fonts.regular,
        color: INK,
      });
    } else {
      const labelW = prefix ? fonts.bold.widthOfTextAtSize(prefix, 6.5) + 2 : 0;
      if (prefix) {
        page.drawText(prefix, {
          x: EVENTS_X,
          y: lineY,
          size: 6.5,
          font: fonts.bold,
          color: TEAL_DARK,
        });
      }
      page.drawText(title, {
        x: EVENTS_X + labelW,
        y: lineY,
        size: 6.5,
        font: fonts.regular,
        color: INK,
      });
    }
    lineY -= 9;
  }

  // Row border.
  page.drawLine({
    start: { x: MARGIN, y: y - ROW_H },
    end: { x: PAGE_W - MARGIN, y: y - ROW_H },
    thickness: 0.5,
    color: BORDER,
  });

  return y - ROW_H;
}

/** Builds the branded monthly PDF. Only the selected month's rows are used. */
export async function buildMonthlyCalendarPdf(
  month: CalendarMonthView,
  logoPng: Uint8Array,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`MASOM Hijri Calendar — ${month.monthLabel}`);
  doc.setAuthor("MASOM — Midwest Association of Shia Organized Muslims");
  doc.setSubject(`${month.monthLabel} prayer timings, Hijri dates and Islamic events`);

  const fonts: FontSet = {
    regular: await doc.embedFont("Helvetica"),
    bold: await doc.embedFont("Helvetica-Bold"),
  };

  const ROW_H = 17;
  // Title block ends ~649pt; the table header top sits just below it.
  const tableTop = PAGE_H - MARGIN - 110;
  const headerH = 18;
  const footerZone = 70;
  const rowsPerPage = Math.max(
    1,
    Math.floor((tableTop - headerH - footerZone) / ROW_H),
  );

  const dayGroups: CalendarMonthView["days"][] = [];
  for (let i = 0; i < month.days.length; i += rowsPerPage) {
    dayGroups.push(month.days.slice(i, i + rowsPerPage));
  }

  for (const [groupIndex, days] of dayGroups.entries()) {
    const page = doc.addPage([PAGE_W, PAGE_H]);
    await drawHeaderBlock(page, fonts, logoPng);

    if (groupIndex === 0) {
      const range = hijriRangeLabel(month);
      let y = PAGE_H - MARGIN - 74;
      page.drawText(month.monthLabel, {
        x: MARGIN,
        y,
        size: 17,
        font: fonts.bold,
        color: INK,
      });
      y -= 17;
      if (range) {
        page.drawText(range, {
          x: MARGIN,
          y,
          size: 9.5,
          font: fonts.bold,
          color: TEAL_DARK,
        });
      }
      y -= 10;
      page.drawText("Daily prayer timings • Hijri dates • Islamic events", {
        x: MARGIN,
        y,
        size: 8,
        font: fonts.regular,
        color: MUTED,
      });
    } else {
      page.drawText(`${month.monthLabel} (continued)`, {
        x: MARGIN,
        y: PAGE_H - MARGIN - 74,
        size: 12,
        font: fonts.bold,
        color: INK,
      });
    }

    let y = drawTableHeader(page, fonts, tableTop);
    let rowIndex = 0;
    for (const day of days) {
      y = drawDayRow(page, fonts, day, y, rowIndex);
      rowIndex += 1;
    }

    // Closing rule + page number.
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.8,
      color: TEAL,
    });
    if (dayGroups.length > 1) {
      const pageLabel = `Page ${groupIndex + 1} of ${dayGroups.length}`;
      page.drawText(pageLabel, {
        x: PAGE_W - MARGIN - fonts.regular.widthOfTextAtSize(pageLabel, 7),
        y: y - 14,
        size: 7,
        font: fonts.regular,
        color: MUTED,
      });
    }

    drawFooter(page, fonts, month.year);
  }

  return doc.save();
}

export { LOGO_PATH };
