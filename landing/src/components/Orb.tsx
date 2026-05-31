const STATE_COLORS: Record<string, string> = {
  working: "var(--life)",
  idle: "var(--life-dim)",
  waking: "var(--amber)",
  stopped: "var(--idle)",
};

export function Orb({ state = "working", size = 84 }: { state?: string; size?: number }) {
  const color = STATE_COLORS[state] ?? STATE_COLORS.stopped;
  const alive = state !== "stopped";
  const dur = state === "working" ? 2.4 : 3.6;
  const breatheDur = state === "working" ? 3.4 : 5;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {alive &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              width: size * 0.5,
              height: size * 0.5,
              borderRadius: "50%",
              border: `1.5px solid ${color}`,
              animation: `jar-ring ${dur}s ease-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      <span
        style={{
          position: "absolute",
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 34%, ${color}, transparent 70%)`,
          opacity: 0.5,
          filter: "blur(6px)",
        }}
      />
      <span
        style={{
          position: "relative",
          width: size * 0.46,
          height: size * 0.46,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 32%, color-mix(in oklch, ${color} 92%, white), ${color} 70%)`,
          boxShadow: `0 0 28px ${color}, inset 0 -4px 10px rgba(0,0,0,0.25)`,
          animation: alive ? `jar-breathe ${breatheDur}s ease-in-out infinite` : "none",
        }}
      />
    </div>
  );
}
