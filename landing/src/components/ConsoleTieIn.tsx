import { Eyebrow, PulseDot } from "./Features";

function MiniFleetRow({
  name,
  state,
  app,
  task,
}: {
  name: string;
  state: string;
  app: string;
  task: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--line)",
        fontSize: 13,
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
        <PulseDot state={state} size={7} />
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--hi)" }}>
          {name}
        </span>
      </div>
      <span style={{ color: "var(--mid)", fontFamily: "var(--font-mono)", fontSize: 12, flex: "0 0 auto" }}>{app}</span>
      <span style={{ color: "var(--dim)", fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
        {task}
      </span>
    </div>
  );
}

function MiniConsole() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--bg)",
        fontFamily: "var(--font-ui)",
        color: "var(--hi)",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Mini rail — hidden on narrow screens via min-width */}
      <div
        className="lp-console-rail"
        style={{
          width: 200,
          minWidth: 200,
          borderRight: "1px solid var(--line)",
          padding: "20px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          background: "var(--panel)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Fleet
        </div>
        {["Fleet", "Analytics", "Health"].map((item, i) => (
          <div
            key={i}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 600,
              color: i === 0 ? "var(--hi)" : "var(--mid)",
              background: i === 0 ? "var(--life-bg)" : "transparent",
            }}
          >
            {item}
          </div>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: "16px 16px", minWidth: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 600,
              margin: 0,
            }}
          >
            Fleet
          </h2>
          <div style={{ display: "flex", gap: 6 }}>
            {["All", "Working", "Idle"].map((f, i) => (
              <span
                key={i}
                style={{
                  padding: "5px 11px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  background: i === 0 ? "var(--life-bg)" : "transparent",
                  color: i === 0 ? "var(--life)" : "var(--dim)",
                  border: `1px solid ${i === 0 ? "transparent" : "var(--line)"}`,
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 16px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--dim)",
              fontWeight: 600,
              letterSpacing: ".04em",
              borderBottom: "1px solid var(--line)",
              background: "var(--panel)",
            }}
          >
            <span>VIVARIUM</span>
            <span style={{ marginLeft: 28 }}>APP</span>
            <span style={{ marginLeft: "auto" }}>TASK</span>
          </div>
          <MiniFleetRow name="fern" state="working" app="recipe-box" task="Adding image upload to recipe form" />
          <MiniFleetRow name="moss" state="idle" app="standup-bot" task="Idle — awaiting next message" />
          <MiniFleetRow name="lichen" state="waking" app="invoice-tracker" task="Provisioning sandbox · pulling image…" />
          <MiniFleetRow name="kelp" state="working" app="analytics-dash" task="Refactoring chart components" />
          <MiniFleetRow name="sprout" state="working" app="habit-tracker" task="Writing tests for streak logic" />
        </div>
      </div>
    </div>
  );
}

export function ConsoleTieIn() {
  return (
    <section id="console" className="lp-section" style={{ padding: "110px 0" }}>
      <div className="lp-section-inner" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <Eyebrow>FOR WHEN YOUR SHELF GROWS</Eyebrow>
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
            A console for the whole habitat.
          </h2>
          <p style={{ margin: "0 auto", fontSize: 17.5, color: "var(--mid)", lineHeight: 1.55, maxWidth: 560 }}>
            Spin up a vivarium per project and watch them all from one place —
            status, spend, and health at a glance.
          </p>
        </div>
        <div
          className="reveal"
          style={{
            marginTop: 46,
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid var(--line2)",
            boxShadow: "0 50px 120px rgba(0,0,0,0.55)",
            background: "var(--panel)",
          }}
        >
          {/* browser chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 16px",
              borderBottom: "1px solid var(--line)",
              background: "var(--panel2)",
            }}
          >
            <span style={{ width: 11, height: 11, borderRadius: 11, background: "var(--red)", opacity: 0.7 }} />
            <span style={{ width: 11, height: 11, borderRadius: 11, background: "var(--amber)", opacity: 0.7 }} />
            <span style={{ width: 11, height: 11, borderRadius: 11, background: "var(--life)", opacity: 0.7 }} />
            <div
              style={{
                marginLeft: 14,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--dim)",
                background: "var(--bg)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "5px 14px",
              }}
            >
              console.vivarium.dev/fleet
            </div>
          </div>
          {/* scaled console */}
          <div className="lp-console-frame" style={{ overflow: "hidden" }}>
            <MiniConsole />
          </div>
        </div>
      </div>
    </section>
  );
}
