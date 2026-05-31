import { Icon } from "./Icon";
import { Eyebrow, PulseDot } from "./Features";

function ChatDemo() {
  const msgs: [string, string, string?][] = [
    ["out", "build me a tip calculator"],
    ["in", "On it — scaffolding a Vite app in /workspace."],
    ["in", "Live at :3000. Here’s how it looks:", "shot"],
    ["out", "nice. make the split-by-people stepper bigger"],
    ["in", "Done — bumped the hit targets to 48px and pushed.", "typing"],
  ];

  return (
    <div
      style={{
        width: 294,
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 16px",
          borderBottom: "1px solid var(--line)",
          background: "var(--panel2)",
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            background: "var(--life-bg)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PulseDot state="working" size={9} />
        </span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--hi)" }}>fern</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--life)" }}>
            online · building
          </div>
        </div>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--dim)" }}>
          chat
        </span>
      </div>
      <div
        style={{
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "var(--bg)",
        }}
      >
        {msgs.map(([dir, txt, extra], i) => (
          <div key={i} style={{ display: "flex", justifyContent: dir === "out" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  padding: "9px 13px",
                  borderRadius: dir === "out" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: dir === "out" ? "var(--life-bg)" : "var(--panel2)",
                  color: "var(--hi)",
                  border: `1px solid ${dir === "out" ? "transparent" : "var(--line)"}`,
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                {txt}
                {extra === "typing" && (
                  <span
                    style={{
                      display: "inline-block",
                      marginLeft: 4,
                      color: "var(--life)",
                      animation: "vk-amber 1s steps(1) infinite",
                    }}
                  >
                    ▍
                  </span>
                )}
              </div>
              {extra === "shot" && (
                <div
                  style={{
                    height: 90,
                    borderRadius: 11,
                    border: "1px solid var(--line)",
                    background: `repeating-linear-gradient(135deg, var(--panel2) 0 10px, var(--bg) 10px 20px)`,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 9,
                      bottom: 7,
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--dim)",
                    }}
                  >
                    screenshot · :3000
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const BULLETS: [string, string, string][] = [
  [
    "bolt",
    "Chat from your phone",
    "No tabs, no terminal — the whole loop happens in a conversation you can check from anywhere.",
  ],
  [
    "doc",
    "It shows its work",
    "Screenshots of the running app land in the thread, so you can review visually.",
  ],
  [
    "git",
    "It remembers",
    "Conversations resume across messages, and work auto-saves to git every 15 minutes.",
  ],
];

export function TelegramDemo() {
  return (
    <section id="demo" className="lp-section" style={{ padding: "110px 0" }}>
      <div className="lp-section-inner" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px" }}>
        <div
          className="lp-tg-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 60,
            alignItems: "center",
          }}
        >
          <div>
            <div className="reveal">
              <Eyebrow>A CONVERSATION, NOT A DASHBOARD</Eyebrow>
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
                Watch it think, ship, and screenshot itself.
              </h2>
              <p style={{ margin: 0, fontSize: 17.5, color: "var(--mid)", lineHeight: 1.55, maxWidth: 560 }}>
                Every vivarium reports back like a teammate — a message when it
                starts, a screenshot when the app is live, a note when it pushes
                to git. Currently via Telegram, with more channels coming.
              </p>
            </div>
            <div
              className="reveal"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 30,
                maxWidth: 440,
              }}
            >
              {BULLETS.map(([icon, title, desc], i) => (
                <div key={i} style={{ display: "flex", gap: 14 }}>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: "var(--life-bg)",
                      flex: "0 0 auto",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={icon} size={18} color="var(--life)" />
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--hi)" }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 13.5, color: "var(--mid)", lineHeight: 1.5, marginTop: 2 }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal" style={{ display: "flex", justifyContent: "center" }}>
            <PhoneFrame>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  paddingTop: 30,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ChatDemo />
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 14px",
                    borderTop: "1px solid var(--line)",
                    background: "var(--panel2)",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      background: "var(--bg)",
                      borderRadius: 18,
                      padding: "9px 14px",
                      fontSize: 12.5,
                      color: "var(--dim)",
                    }}
                  >
                    Message fern…
                  </div>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 18,
                      background: "var(--life)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="arrow" size={15} color="#06231a" />
                  </span>
                </div>
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 312,
        height: 620,
        borderRadius: 42,
        backgroundColor: "#080a09",
        border: "9px solid #1b201d",
        boxShadow:
          "0 50px 120px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 26,
          background: "#1b201d",
          borderRadius: "0 0 16px 16px",
          zIndex: 5,
        }}
      />
      {children}
    </div>
  );
}
