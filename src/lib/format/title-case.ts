const ACRONYM_RE = /^[A-Z]{2,}$/;

/**
 * Capitalizes the first letter of each word while preserving all-caps
 * acronyms (e.g. "MASOM", "USA", "AS", "SA"). Hyphenated words are
 * capitalized per segment. Any existing capitalization is normalized so
 * mixed-case input like "Alwidai Majalis e Ayyam E Aza" reads consistently.
 */
export function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) =>
      word
        .split("-")
        .map((segment) =>
          ACRONYM_RE.test(segment)
            ? segment
            : segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
        )
        .join("-"),
    )
    .join(" ");
}
