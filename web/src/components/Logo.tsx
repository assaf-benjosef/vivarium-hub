import { VivariumMark } from "./VivariumMark";

export function Logo({ size = 20 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
      <VivariumMark size={size * 1.18} variant="flat" />
      <span
        className="display"
        style={{ fontSize: size * 0.86, fontWeight: 600, letterSpacing: "-.02em" }}
      >
        Vivarium
      </span>
    </div>
  );
}
