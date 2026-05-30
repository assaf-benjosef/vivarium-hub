import type { VivariumState } from "../lib/types";

const STATE_COLOR: Record<VivariumState, string> = {
  working: "var(--life)",
  idle: "var(--life-dim)",
  waking: "var(--amber)",
  unhealthy: "var(--amber)",
  stopped: "var(--idle-color)",
};

export function Heart({
  state,
  w = 84,
  h = 26,
}: {
  state: VivariumState;
  w?: number;
  h?: number;
}) {
  const color = STATE_COLOR[state];
  const flat = state === "stopped" || state === "unhealthy";
  const beat = flat
    ? `M0 ${h / 2} L${w} ${h / 2}`
    : `M0 ${h / 2} L${w * 0.22} ${h / 2} L${w * 0.28} ${h * 0.2} L${w * 0.34} ${h * 0.85} L${w * 0.4} ${h * 0.1} L${w * 0.46} ${h / 2} L${w * 0.62} ${h / 2} L${w * 0.68} ${h * 0.32} L${w * 0.74} ${h * 0.7} L${w * 0.8} ${h / 2} L${w} ${h / 2}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block" }}
    >
      <path
        d={beat}
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={flat ? 0.4 : 0.95}
        style={{ stroke: color }}
      />
    </svg>
  );
}
