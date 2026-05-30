import type { VivariumState } from "../lib/types";

const STATE_STYLES: Record<
  VivariumState,
  { color: string; animation: string | null }
> = {
  working: { color: "var(--life)", animation: "pulse-work 1.6s ease-out infinite" },
  idle: { color: "var(--life-dim)", animation: "pulse-breathe 3.6s ease-out infinite" },
  waking: { color: "var(--amber)", animation: "pulse-amber 1.1s ease-in-out infinite" },
  unhealthy: { color: "var(--amber)", animation: "pulse-amber 1.1s ease-in-out infinite" },
  stopped: { color: "var(--idle-color)", animation: null },
};

export function PulseDot({
  state,
  size = 9,
}: {
  state: VivariumState;
  size?: number;
}) {
  const { color, animation } = STATE_STYLES[state];
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    >
      {animation && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "inherit",
            animation,
          }}
        />
      )}
    </span>
  );
}
