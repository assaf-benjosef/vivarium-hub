import type { VivariumState } from "../lib/types";
import { PulseDot } from "./PulseDot";

const LABELS: Record<VivariumState, string> = {
  working: "Working",
  idle: "Idle",
  waking: "Waking",
  unhealthy: "Unhealthy",
  stopped: "Stopped",
};

const BG: Record<VivariumState, string> = {
  working: "var(--life-bg)",
  idle: "var(--life-bg)",
  waking: "var(--amber-bg)",
  unhealthy: "var(--amber-bg)",
  stopped: "rgba(255,255,255,0.05)",
};

const COLOR: Record<VivariumState, string> = {
  working: "var(--life)",
  idle: "var(--life-dim)",
  waking: "var(--amber)",
  unhealthy: "var(--amber)",
  stopped: "var(--idle-color)",
};

export function StatusBadge({ state }: { state: VivariumState }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".01em",
        padding: "3px 9px 3px 8px",
        background: BG[state],
        color: COLOR[state],
      }}
    >
      <PulseDot state={state} size={7} /> {LABELS[state]}
    </span>
  );
}
