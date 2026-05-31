import { Jar } from "./Jar";
import { Nav } from "./Nav";
import { WaitlistForm } from "./WaitlistForm";
import { Eyebrow } from "./Features";

const SPECIMENS = [
  { state: "working", label: "fern", sub: "building" },
  { state: "idle", label: "moss", sub: "resting" },
  { state: "waking", label: "lichen", sub: "waking" },
  { state: "working", label: "kelp", sub: "building" },
] as const;

export function Hero() {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(120% 70% at 50% 118%, oklch(0.80 0.155 150 / 0.09), transparent 56%), var(--bg)`,
      }}
    >
      <Nav />
      <div
        className="lp-section-inner"
        style={{
          textAlign: "center",
          marginTop: 30,
          padding: "0 24px",
          maxWidth: 860,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div className="reveal in">
          <Eyebrow>GROW A FLEET OF LIVING APPS</Eyebrow>
        </div>
        <h1
          className="lp-h1"
          style={{
            fontFamily: "var(--font-display)",
            margin: 0,
            fontSize: 74,
            fontWeight: 600,
            letterSpacing: "-.038em",
            lineHeight: 0.96,
            color: "var(--hi)",
          }}
        >
          Keep your builders
          <br />
          in a jar.
        </h1>
        <p
          className="lp-sub"
          style={{
            margin: "24px auto 0",
            fontSize: 18.5,
            color: "var(--mid)",
            lineHeight: 1.55,
            maxWidth: 560,
          }}
        >
          Vivarium is an always-on AI agent that lives in its own tiny VM. Spin
          one up per project — text it on Telegram, and it builds and tends your
          app while you do anything else.
        </p>
        <div style={{ marginTop: 30 }}>
          <WaitlistForm />
        </div>
      </div>
      {/* Shelf */}
      <div
        className="lp-shelf"
        style={{
          position: "relative",
          margin: "46px auto 0",
          width: "100%",
          maxWidth: 1040,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 40,
          padding: "0 40px 70px",
        }}
      >
        {SPECIMENS.map((s, i) => (
          <div key={i}>
            <Jar
              state={s.state}
              w={184}
              h={244}
              orbSize={68}
              label={s.label}
              sub={s.sub}
              float={i % 2 === 0}
            />
          </div>
        ))}
        <div
          className="lp-shelf-board"
          style={{
            position: "absolute",
            bottom: 34,
            left: 40,
            right: 40,
            height: 10,
            borderRadius: 6,
            background: "linear-gradient(180deg, #1b201d, #0d100e)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 22px 50px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    </div>
  );
}
