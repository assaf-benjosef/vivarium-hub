export function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--dim)",
          fontWeight: 600,
          letterSpacing: ".06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          className="mono"
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: accent ?? "var(--hi)",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {sub && (
          <span style={{ fontSize: 12, color: "var(--mid)", fontWeight: 500 }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
