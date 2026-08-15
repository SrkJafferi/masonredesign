/**
 * Generates social/favicon assets from the real MASOM brand assets:
 * - public/og-image.png        1200x630 (Open Graph / social preview)
 * - public/favicon.png         true PNG 64x64 (re-encoded from user-provided art)
 * - public/apple-touch-icon.png 180x180
 *
 * The OG image composes the official MASOM logo (white lockup) on the MASOM
 * dark brand background with the site's teal/sand accents — no invented art.
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const INK = "#101418";
const TEAL = "rgba(92,184,178,0.22)";
const SAND = "#b7b09c";

const W = 1200;
const H = 630;

// 1. Background SVG: ink base, teal radial glow, sand accent line.
const bgSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="28%" r="75%">
      <stop offset="0%" stop-color="${TEAL}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="${W * 0.22}" y="${H - 14}" width="${W * 0.56}" height="3" rx="1.5" fill="${SAND}"/>
</svg>
`);

const logo = readFileSync("public/brand/logomobilefoot.webp");

// Logo displayed at 620px wide (keeps its 500x132 ratio -> 620x164).
const LOGO_W = 620;
const LOGO_H = Math.round((LOGO_W * 132) / 500);
const LOGO_Y = Math.round((H - LOGO_H) / 2) - 22;

const og = await sharp(bgSvg)
  .composite([
    {
      input: logo,
      top: LOGO_Y,
      left: Math.round((W - LOGO_W) / 2),
    },
  ])
  .png({ quality: 92 })
  .toBuffer();

writeFileSync("public/og-image.png", og);
console.log("og-image.png", (await sharp(og).metadata()).width, "x", (await sharp(og).metadata()).height);

// 2. Favicon: true PNG 64x64 from the provided artwork (currently jpeg bytes).
const favicon = await sharp("public/favicon.png")
  .resize(64, 64, { fit: "cover", position: "centre" })
  .png()
  .toBuffer();
writeFileSync("public/favicon.png", favicon);
console.log("favicon.png re-encoded", (await sharp(favicon).metadata()).format);

// 3. Apple touch icon 180x180.
const apple = await sharp("public/favicon.png")
  .resize(180, 180, { fit: "cover", position: "centre" })
  .png()
  .toBuffer();
writeFileSync("public/apple-touch-icon.png", apple);
console.log("apple-touch-icon.png", (await sharp(apple).metadata()).width, "x", (await sharp(apple).metadata()).height);
