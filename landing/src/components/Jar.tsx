import { Orb } from "./Orb";
import { PulseDot } from "./Features";

const STATE_COLORS: Record<string, string> = {
  working: "var(--life)",
  idle: "var(--life-dim)",
  waking: "var(--amber)",
  stopped: "var(--idle)",
};

const PARTICLES = [
  { l: "22%", dx: "8px", dur: "6.5s", del: "0s", s: 4 },
  { l: "40%", dx: "-6px", dur: "7.5s", del: "1.2s", s: 3 },
  { l: "58%", dx: "10px", dur: "6s", del: "2.4s", s: 5 },
  { l: "70%", dx: "-8px", dur: "8s", del: "0.6s", s: 3 },
  { l: "34%", dx: "12px", dur: "7s", del: "3.1s", s: 4 },
  { l: "64%", dx: "-4px", dur: "6.8s", del: "1.8s", s: 4 },
];

function Heartbeat({ state, w, color }: { state: string; w: number; color: string }) {
  const h = 22;
  const flat = state === "stopped" || state === "unhealthy";
  const beat = flat
    ? `M0 ${h / 2} L${w} ${h / 2}`
    : `M0 ${h / 2} L${w * 0.22} ${h / 2} L${w * 0.28} ${h * 0.2} L${w * 0.34} ${h * 0.85} L${w * 0.40} ${h * 0.1} L${w * 0.46} ${h / 2} L${w * 0.62} ${h / 2} L${w * 0.68} ${h * 0.32} L${w * 0.74} ${h * 0.7} L${w * 0.80} ${h / 2} L${w} ${h / 2}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
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

export function Jar({
  state = "working",
  w = 184,
  h = 244,
  orbSize,
  label,
  sub,
  float = true,
}: {
  state?: string;
  w?: number;
  h?: number;
  orbSize?: number;
  label?: string;
  sub?: string;
  float?: boolean;
}) {
  const color = STATE_COLORS[state] ?? "var(--idle)";

  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        animation: float ? "jar-float 7s ease-in-out infinite" : "none",
      }}
    >
      {/* ambient glow */}
      <div
        style={{
          position: "absolute",
          width: w * 0.9,
          height: w * 0.9,
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          background: color,
          borderRadius: "50%",
          filter: "blur(50px)",
          opacity: 0.16,
          pointerEvents: "none",
        }}
      />
      {/* lid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: w * 0.46,
          height: 18,
          borderRadius: "8px 8px 4px 4px",
          background: "#1b201d",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: w * 0.3,
          height: 8,
          borderRadius: 2,
          background: "#131715",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
      {/* glass body */}
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 0,
          width: w,
          height: h - 26,
          borderRadius: "26px 26px 30px 30px",
          background:
            "linear-gradient(170deg, rgba(255,255,255,0.045), rgba(255,255,255,0.01) 30%, rgba(0,0,0,0.18))",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: `inset 0 0 70px oklch(0.80 0.155 150 / 0.10), inset 0 1px 0 rgba(255,255,255,0.14), 0 40px 90px rgba(0,0,0,0.55)`,
          overflow: "hidden",
          backdropFilter: "blur(2px)",
        }}
      >
        {/* glass left highlight */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            width: 18,
            height: "62%",
            borderRadius: 12,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.16), transparent)",
            filter: "blur(2px)",
          }}
        />
        {/* base substrate */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            background: `linear-gradient(180deg, transparent, oklch(0.80 0.155 150 / 0.10))`,
            borderTop: "1px solid oklch(0.80 0.155 150 / 0.16)",
          }}
        />
        {/* particles */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: p.l,
              bottom: "30%",
              width: p.s,
              height: p.s,
              borderRadius: "50%",
              background: "var(--life)",
              animation: `jar-drift ${p.dur} ease-in-out infinite ${p.del}`,
              ["--dx" as string]: p.dx,
            }}
          />
        ))}
        {/* organism */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Orb state={state} size={orbSize ?? Math.min(w * 0.42, 130)} />
        </div>
        {/* heartbeat at base */}
        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: 0.8,
          }}
        >
          <Heartbeat state={state} w={w * 0.5} color={color} />
        </div>
      </div>
      {/* specimen label */}
      {label && (
        <div
          style={{
            position: "absolute",
            bottom: -14,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#101312",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 999,
            padding: "6px 13px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          <PulseDot state={state} size={7} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--hi)",
            }}
          >
            {label}
          </span>
          {sub != null && (
            <span style={{ fontSize: 11.5, color: "var(--dim)" }}>{sub}</span>
          )}
        </div>
      )}
    </div>
  );
}
