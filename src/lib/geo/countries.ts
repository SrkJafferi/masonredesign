/**
 * Small ISO-3166 alpha-2 → country name map used for the admin login card.
 * Only the names need a table; the flag emoji is derived from the two-letter
 * code via regional-indicator symbols, so it works for any valid code.
 * Unknown codes simply have no name (the UI falls back to the code itself).
 */
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  PK: "Pakistan",
  IN: "India",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  QA: "Qatar",
  KW: "Kuwait",
  BH: "Bahrain",
  OM: "Oman",
  JO: "Jordan",
  LB: "Lebanon",
  SY: "Syria",
  IQ: "Iraq",
  IR: "Iran",
  AF: "Afghanistan",
  TR: "Turkey",
  EG: "Egypt",
  MA: "Morocco",
  DZ: "Algeria",
  TN: "Tunisia",
  LY: "Libya",
  SD: "Sudan",
  YE: "Yemen",
  AU: "Australia",
  NZ: "New Zealand",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  IT: "Italy",
  ES: "Spain",
  PT: "Portugal",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IE: "Ireland",
  PL: "Poland",
  CZ: "Czechia",
  RO: "Romania",
  GR: "Greece",
  RU: "Russia",
  UA: "Ukraine",
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  SG: "Singapore",
  MY: "Malaysia",
  ID: "Indonesia",
  TH: "Thailand",
  BD: "Bangladesh",
  LK: "Sri Lanka",
  NP: "Nepal",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
  ZA: "South Africa",
  NG: "Nigeria",
  KE: "Kenya",
  TZ: "Tanzania",
  ET: "Ethiopia",
};

/** Regional-indicator flag emoji derived from an ISO-3166 alpha-2 code. */
export function countryFlagEmoji(code: string | null | undefined): string | null {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return null;
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...Array.from(upper, (ch) => 0x1f1e6 + (ch.charCodeAt(0) - 65)),
  );
}

/** Country name for an ISO-3166 alpha-2 code, or null when unknown. */
export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  return COUNTRY_NAMES[code.toUpperCase()] ?? null;
}
