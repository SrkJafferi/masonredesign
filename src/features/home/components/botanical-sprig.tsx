/**
 * Lightweight botanical sprig drawn as one inline SVG (no image request, no
 * extra icon library). Rendered stroke-only so it reads as the faint teal
 * line-art leaves from the reference design. Color comes from `currentColor`,
 * so callers tint it with teal text-color and opacity utilities.
 */
const LEAVES = [
  { x: 16, y: 142, rot: -58, s: 0.9 },
  { x: 31, y: 124, rot: 52, s: 1 },
  { x: 47, y: 107, rot: -46, s: 1 },
  { x: 63, y: 92, rot: 44, s: 1 },
  { x: 79, y: 77, rot: -36, s: 0.9 },
  { x: 96, y: 62, rot: 33, s: 0.9 },
  { x: 113, y: 49, rot: -28, s: 0.85 },
  { x: 131, y: 38, rot: 25, s: 0.8 },
  { x: 149, y: 29, rot: -18, s: 0.75 },
  { x: 166, y: 25, rot: 0, s: 0.6 },
] as const;

const LEAF_D = "M0 0 C -7.5 -5 -7.5 -19 0 -28 C 7.5 -19 7.5 -5 0 0 Z";

export function BotanicalSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Curving stem growing from the lower-left to the upper-right. */}
      <path d="M8 150 C 36 124 58 100 90 70 C 120 42 152 26 186 18" />
      {LEAVES.map((leaf, i) => (
        <g
          key={i}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rot}) scale(${leaf.s})`}
        >
          <path d={LEAF_D} />
          {/* Faint midrib so the outlines read as leaves. */}
          <path d="M0 0 L0 -26" strokeWidth={0.7} strokeOpacity={0.7} />
        </g>
      ))}
    </svg>
  );
}
