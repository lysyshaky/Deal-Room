import type { CSSProperties } from "react";

export const DEFAULT_ACCENT = "#E4572E";

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

const mix = (from: number, to: number, t: number) => Math.round(from + (to - from) * t);

/**
 * Per-deal accent colors: overrides the ember CSS variables that the
 * whole Tailwind palette reads from, scoped to the proposal page.
 */
export function accentVars(hex: string): CSSProperties {
  const [r, g, b] = hexToRgb(hex);
  const deep = [r, g, b].map((c) => mix(c, 0, 0.2));
  const soft = [r, g, b].map((c) => mix(c, 255, 0.88));
  return {
    "--c-ember": `${r} ${g} ${b}`,
    "--c-ember-deep": deep.join(" "),
    "--c-ember-soft": soft.join(" "),
  } as CSSProperties;
}
