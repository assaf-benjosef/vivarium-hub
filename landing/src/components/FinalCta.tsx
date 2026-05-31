import { Jar } from "./Jar";
import { WaitlistForm } from "./WaitlistForm";

export function FinalCta() {
  return (
    <section
      id="cta"
      className="lp-section"
      style={{
        padding: "120px 0 90px",
        background: `radial-gradient(80% 120% at 50% 120%, oklch(0.80 0.155 150 / 0.10), transparent 60%)`,
      }}
    >
      <div className="reveal" style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <Jar state="working" w={150} h={196} orbSize={58} float />
        </div>
        <h2
          className="lp-h2"
          style={{
            fontFamily: "var(--font-display)",
            margin: "0 0 18px",
            fontSize: 54,
            fontWeight: 600,
            letterSpacing: "-.035em",
            lineHeight: 1.0,
            color: "var(--hi)",
          }}
        >
          Keep your builders
          <br />
          in a jar.
        </h2>
        <p
          style={{
            margin: "0 auto 34px",
            fontSize: 18,
            color: "var(--mid)",
            lineHeight: 1.55,
            maxWidth: 500,
          }}
        >
          Early access is rolling out to indie builders first. Leave your email
          and we'll grow you a vivarium.
        </p>
        <WaitlistForm large />
      </div>
    </section>
  );
}
