const ICONS: Record<string, string> = {
  fleet: "M3 4h7v7H3zM14 4h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  pulse: "M2 12h4l3-8 4 16 3-8h6",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6z",
  git: "M6 3v12m0 0a3 3 0 103 3m-3-3a3 3 0 11-3 3m12-9a3 3 0 10-3-3m3 3v3a4 4 0 01-4 4H9",
  clock: "M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M20 6 9 17l-5-5",
  doc: "M14 3v5h5M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8z",
  cpu: "M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M6 6h12v12H6zM9 9h6v6H9z",
};

export function Icon({
  name,
  size = 18,
  color = "currentColor",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ stroke: color }}
    >
      <path d={ICONS[name] ?? ""} />
    </svg>
  );
}
