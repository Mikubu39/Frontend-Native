/**
 * Color maths for surfaces that need a physical relationship between two
 * tones — a button face and the edge it sits on, a tile and its shadow side.
 *
 * Deriving the second tone instead of hand-picking it keeps the relationship
 * constant across every colour the app throws at a component, including the
 * ad-hoc ones passed at call sites.
 */

/** Parse `#RGB` or `#RRGGBB` into channels. Returns null if unparseable. */
function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const value = hex.trim().replace("#", "");
  if (value.length === 3) {
    const r = parseInt(value[0] + value[0], 16);
    const g = parseInt(value[1] + value[1], 16);
    const b = parseInt(value[2] + value[2], 16);
    return Number.isNaN(r + g + b) ? null : { r, g, b };
  }
  if (value.length === 6) {
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return Number.isNaN(r + g + b) ? null : { r, g, b };
  }
  return null;
}

function toHex(channel: number): string {
  return Math.max(0, Math.min(255, Math.round(channel)))
    .toString(16)
    .padStart(2, "0");
}

/**
 * Darken a hex colour by `amount` (0–1).
 *
 * Falls back to the input untouched when the colour is not a hex string
 * (`rgba(...)`, a named colour, a bad value from a call site) so a component
 * never renders a broken colour just because it could not compute a shade.
 */
export function darken(hex: string, amount: number = 0.2): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const factor = 1 - Math.max(0, Math.min(1, amount));
  return `#${toHex(rgb.r * factor)}${toHex(rgb.g * factor)}${toHex(rgb.b * factor)}`;
}

/** Lighten a hex colour by `amount` (0–1), blending toward white. */
export function lighten(hex: string, amount: number = 0.2): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const t = Math.max(0, Math.min(1, amount));
  return `#${toHex(rgb.r + (255 - rgb.r) * t)}${toHex(rgb.g + (255 - rgb.g) * t)}${toHex(rgb.b + (255 - rgb.b) * t)}`;
}

/** Relative luminance per WCAG 2.1. */
function luminance(hex: string): number | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  );
}

/** WCAG contrast ratio between two hex colours, 1–21. Returns 1 if either
 *  colour cannot be parsed, so callers treat it as "cannot verify". */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return 1;
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Nudge `color` just enough to clear `minRatio` against `background`.
 *
 * Brand accents are picked to sing on the dark palette and are then reused
 * verbatim on the light one, where they quietly fail: the energy green
 * measured 1.52:1 against washi cream, so the header's "25/25" was barely
 * there. Rather than hand-picking a second hex per accent — which drifts the
 * moment someone edits the first — this walks the colour down in small steps
 * until it actually passes, keeping the hue.
 *
 * The direction depends on the ground: darken on a light background, lighten
 * on a dark one. Always darkening would make a colour on a dark surface worse
 * on every step and walk it to near-black — the shop needs both, since its
 * lacquer counter stays dark while its shelves follow the theme.
 *
 * Returns the input unchanged if it is not a hex colour, and the last
 * candidate if the target is unreachable.
 */
export function readableOn(
  color: string,
  background: string,
  minRatio: number = 4.5,
): string {
  if (!parseHex(color) || !parseHex(background)) return color;
  if (contrastRatio(color, background) >= minRatio) return color;

  const bg = luminance(background);
  const step = bg !== null && bg > 0.18 ? darken : lighten;

  let candidate = color;
  // 24 steps of 8% reaches either end; stop at the first one that passes so
  // the accent stays as close to its brand hue as the target allows.
  for (let i = 0; i < 24; i++) {
    candidate = step(candidate, 0.08);
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  return candidate;
}
