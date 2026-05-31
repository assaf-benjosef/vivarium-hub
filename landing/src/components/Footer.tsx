import { Logo } from "./Logo";

const COLS: [string, string[]][] = [
  ["Product", ["How it works", "The console", "Architecture", "Changelog"]],
  [
    "Open source",
    ["GitHub · vivarium", "GitHub · vivarium-hub", "Self-hosting guide", "License"],
  ],
  ["Company", ["About", "Waitlist", "Contact"]],
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--line)",
        padding: "56px 0 40px",
        background: "var(--bg)",
      }}
    >
      <div
        className="lp-footer-grid"
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        <div>
          <Logo size={22} variant="flat" />
          <p
            style={{
              margin: "16px 0 0",
              fontSize: 13.5,
              color: "var(--dim)",
              lineHeight: 1.55,
              maxWidth: 240,
            }}
          >
            An always-on AI agent that lives in a box and builds your apps.
          </p>
        </div>
        {COLS.map(([heading, links], i) => (
          <div key={i}>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--dim)",
                fontWeight: 600,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              {heading}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, j) => (
                <span
                  key={j}
                  className="nav-link"
                  style={{ fontSize: 13.5 }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1160,
          margin: "40px auto 0",
          padding: "20px 40px 0",
          borderTop: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--faint)",
          }}
        >
          © 2026 Vivarium · grown with Claude Code
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--faint)",
          }}
        >
          v0.1.7
        </span>
      </div>
    </footer>
  );
}
