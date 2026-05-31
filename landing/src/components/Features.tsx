import { Icon } from "./Icon";

const FEATS: [string, string, string][] = [
  [
    "pulse",
    "Lives with your app",
    "The agent shares the app’s VM — same filesystem, same process, same network. It doesn’t remote in; it’s already there.",
  ],
  [
    "git",
    "Auto-saves to git",
    "Every 15 minutes your work is committed to the workspace repo. Nothing is ever lost.",
  ],
  [
    "doc",
    "Screenshots its work",
    "Built-in Chromium captures the running app so you can review changes visually.",
  ],
  [
    "bolt",
    "One command, your server",
    "Install it anywhere you have a machine — your VPS, your homelab, any cloud. One command and it's alive.",
  ],
  [
    "clock",
    "Resumes context",
    "Sessions persist, so the conversation — and everything it knows — carries across messages.",
  ],
  [
    "fleet",
    "One console for the fleet",
    "When your shelf grows, manage every vivarium from a single web console.",
  ],
];

export function Features() {
  return (
    <section
      id="features"
      className="lp-section"
      style={{ padding: "110px 0", background: "#0c0e0d" }}
    >
      <div className="lp-section-inner" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <Eyebrow>WHAT MAKES IT ALIVE</Eyebrow>
          <h2
            className="lp-h2"
            style={{
              fontFamily: "var(--font-display)",
              margin: "0 0 16px",
              fontSize: 44,
              fontWeight: 600,
              letterSpacing: "-.03em",
              lineHeight: 1.05,
              color: "var(--hi)",
            }}
          >
            A teammate that tends itself.
          </h2>
          <p
            style={{
              margin: "0 auto",
              fontSize: 17.5,
              color: "var(--mid)",
              lineHeight: 1.55,
              maxWidth: 560,
            }}
          >
            The boring, always-on infrastructure of a real developer — without
            the laptop, the babysitting, or the 2am deploys.
          </p>
        </div>
        <div
          className="lp-feat-grid reveal"
          style={{
            marginTop: 50,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {FEATS.map(([icon, title, desc], i) => (
            <div
              key={i}
              className="feat-card"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: 18,
                padding: 22,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "var(--life-bg)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Icon name={icon} size={21} color="var(--life)" />
              </span>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18.5,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "var(--hi)",
                }}
              >
                {title}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "var(--mid)",
                  lineHeight: 1.5,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "6px 13px 6px 11px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        background: "var(--life-bg)",
        border: "1px solid oklch(0.80 0.155 150 / 0.3)",
        marginBottom: 24,
      }}
    >
      <PulseDot state="working" size={7} />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--life)",
          letterSpacing: ".02em",
        }}
      >
        {children}
      </span>
    </div>
  );
}

export function PulseDot({ state, size = 9 }: { state: string; size?: number }) {
  const colors: Record<string, string> = {
    working: "var(--life)",
    idle: "var(--life-dim)",
    waking: "var(--amber)",
    stopped: "var(--idle)",
  };
  const anims: Record<string, string> = {
    working: "vk-work 1.6s ease-out infinite",
    idle: "vk-breathe 3.6s ease-out infinite",
    waking: "vk-amber 1.1s ease-in-out infinite",
  };
  const color = colors[state] ?? colors.stopped;
  const anim = anims[state];

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
      }}
    >
      {anim && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "inherit",
            animation: anim,
          }}
        />
      )}
    </span>
  );
}

export { Eyebrow };
