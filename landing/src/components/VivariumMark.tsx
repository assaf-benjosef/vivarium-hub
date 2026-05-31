const LIFE = "oklch(0.80 0.155 150)";

const FRAME = { x: 2.4, y: 2.9, w: 19.2, h: 18.2, rx: 5.3 };
const LINES = [
  "M12 18.1 L12 10.4",
  "M12 10.4 L12 7.1",
  "M12 11.7 L15.5 9.5",
  "M12 13.4 L8.9 11.7",
];
const NODES = [
  { cx: 12, cy: 18.1, r: 1.35 },
  { cx: 8.5, cy: 11.5, r: 1.35 },
  { cx: 15.8, cy: 9.2, r: 1.35 },
  { cx: 12, cy: 6.9, r: 1.55 },
];

export function VivariumMark({
  size = 28,
  variant = "flat",
}: {
  size?: number;
  variant?: "flat" | "glow";
}) {
  const glow = variant === "glow";
  const sw = glow ? 1.55 : 1.7;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        flex: "0 0 auto",
        filter: glow
          ? `drop-shadow(0 0 1.5px ${LIFE}) drop-shadow(0 0 6px ${LIFE})`
          : "none",
      }}
    >
      <rect
        x={FRAME.x}
        y={FRAME.y}
        width={FRAME.w}
        height={FRAME.h}
        rx={FRAME.rx}
        fill="none"
        stroke={LIFE}
        strokeWidth={sw}
      />
      <g stroke={LIFE} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {LINES.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill={LIFE}>
        {NODES.map((n, i) => (
          <circle key={i} cx={n.cx} cy={n.cy} r={n.r} />
        ))}
      </g>
    </svg>
  );
}
