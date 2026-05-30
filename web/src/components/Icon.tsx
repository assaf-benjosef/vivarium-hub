const PATHS: Record<string, string> = {
  fleet: "M3 4h7v7H3zM14 4h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  pulse: "M2 12h4l3-8 4 16 3-8h6",
  setup:
    "M12 2v3m0 14v3m10-10h-3M5 12H2m15.5-6.5-2 2m-9 9-2 2m13 0-2-2m-9-9-2-2M12 8a4 4 0 100 8 4 4 0 000-8z",
  gear: "M12 8a4 4 0 100 8 4 4 0 000-8zM19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 1h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 23h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6z",
  plus: "M12 5v14M5 12h14",
  ext: "M14 5h5v5M19 5l-9 9M12 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-6",
  clock: "M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M20 6 9 17l-5-5",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zm10 2-4.3-4.3",
  git: "M6 3v12m0 0a3 3 0 103 3m-3-3a3 3 0 11-3 3m12-9a3 3 0 10-3-3m3 3v3a4 4 0 01-4 4H9",
};

export function Icon({
  name,
  size = 18,
  color = "currentColor",
  strokeWidth = 1.8,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ stroke: color, flexShrink: 0, ...style }}
    >
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}
