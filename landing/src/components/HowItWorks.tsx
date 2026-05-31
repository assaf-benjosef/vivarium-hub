import { Icon } from "./Icon";
import { Eyebrow } from "./Features";

function FlowNode({
  icon,
  kicker,
  title,
  desc,
}: {
  icon: string;
  kicker: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: 20,
        padding: "24px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        zIndex: 1,
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          background: "var(--life-bg)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={22} color="var(--life)" />
      </span>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--dim)",
          fontWeight: 600,
          letterSpacing: ".08em",
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 600,
          color: "var(--hi)",
        }}
      >
        {title}
      </div>
      <p style={{ margin: 0, fontSize: 13.5, color: "var(--mid)", lineHeight: 1.5 }}>
        {desc}
      </p>
    </div>
  );
}

export function HowItWorks() {
  const internals = [
    "AI agent",
    "Git repo",
    "Browser",
    "Your app (live)",
  ];

  return (
    <section
      id="how"
      className="lp-section"
      style={{ padding: "110px 0", background: "var(--panel)" }}
    >
      <div className="lp-section-inner" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <Eyebrow>HOW IT WORKS</Eyebrow>
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
            From a text message to a running app.
          </h2>
          <p style={{ margin: "0 auto", fontSize: 17.5, color: "var(--mid)", lineHeight: 1.55, maxWidth: 560 }}>
            No IDE, no SSH. You describe what you want; a vivarium does the building.
          </p>
        </div>
        <div
          className="lp-flow reveal"
          style={{
            position: "relative",
            marginTop: 54,
            display: "flex",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          {/* connecting line */}
          <div
            className="lp-flowline"
            style={{
              position: "absolute",
              top: "50%",
              left: "12%",
              right: "12%",
              height: 2,
              background: "var(--line)",
              zIndex: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -3,
                width: 8,
                height: 8,
                borderRadius: 8,
                background: "var(--life)",
                boxShadow: "0 0 12px var(--life)",
                animation: "travel 3.4s ease-in-out infinite",
              }}
            />
          </div>
          <FlowNode
            icon="bolt"
            kicker="01 · YOU"
            title="Send a message"
            desc="Describe what to build or fix, from your phone, from anywhere. Drop screenshots and links."
          />
          <FlowNode
            icon="git"
            kicker="02 · HUB"
            title="It reaches your vivarium"
            desc="Your message is routed to the right VM — authenticated, queued, and delivered in seconds."
          />
          <FlowNode
            icon="cpu"
            kicker="03 · VIVARIUM"
            title="The agent builds"
            desc="It lives inside the app's runtime — full access to the filesystem, the running process, and the browser. It writes, runs, and verifies in one place."
          />
        </div>
        {/* VM internals strip */}
        <div
          className="reveal"
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            background: "var(--bg)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 20px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--dim)",
              fontWeight: 600,
              letterSpacing: ".06em",
              marginRight: 4,
            }}
          >
            INSIDE THE microVM
          </span>
          {internals.map((x, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                fontSize: 11.5,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                padding: "3px 9px 3px 8px",
                background: "var(--panel2)",
                color: "var(--mid)",
                border: "1px solid var(--line)",
              }}
            >
              {x}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
