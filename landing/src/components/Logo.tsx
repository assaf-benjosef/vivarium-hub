import { VivariumMark } from "./VivariumMark";

export function Logo({
  size = 22,
  variant = "flat",
}: {
  size?: number;
  variant?: "flat" | "glow";
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
      <VivariumMark size={size * 1.18} variant={variant} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size * 0.94,
          fontWeight: 600,
          letterSpacing: "-.02em",
          color: "var(--hi)",
        }}
      >
        Vivarium
      </span>
    </div>
  );
}
