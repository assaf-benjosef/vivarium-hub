import { PulseDot } from "./PulseDot";

export function Logo({ size = 20 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PulseDot state="working" size={size * 0.5} />
        <svg
          width={size}
          height={size}
          viewBox="0 0 20 20"
          style={{ position: "absolute", inset: 0 }}
        >
          <circle
            cx="10"
            cy="10"
            r="9"
            fill="none"
            strokeWidth="1.4"
            opacity="0.5"
            style={{ stroke: "var(--life)" }}
          />
        </svg>
      </span>
      <span
        className="display"
        style={{ fontSize: size * 0.86, fontWeight: 600, letterSpacing: "-.02em" }}
      >
        Vivarium
      </span>
    </div>
  );
}
