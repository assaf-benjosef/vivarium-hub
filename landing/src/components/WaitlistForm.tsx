import { type FormEvent, useState } from "react";

const BUTTONDOWN_URL =
  "https://buttondown.com/api/emails/embed-subscribe/assaf-benjosef";

export function WaitlistForm({ large }: { large?: boolean }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError("");
    try {
      const res = await fetch(BUTTONDOWN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok || res.status === 201) {
        setSubmitted(true);
      } else {
        setError("Something went wrong — try again?");
      }
    } catch {
      setError("Network error — try again?");
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: large ? "14px 24px" : "12px 20px",
            borderRadius: large ? 15 : 13,
            background: "var(--life-bg)",
            border: "1px solid var(--life)",
            fontFamily: "var(--font-ui)",
            fontSize: large ? 16 : 14.5,
            fontWeight: 600,
            color: "var(--life)",
          }}
        >
          You're on the list. We'll be in touch.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 13,
      }}
    >
      <div
        className="lp-waitlist"
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--panel)",
          border: "1px solid var(--line2)",
          borderRadius: large ? 15 : 13,
          padding: large ? "5px 5px 5px 18px" : "4px 4px 4px 16px",
          width: large ? 470 : 410,
          maxWidth: "100%",
        }}
      >
        <input
          type="email"
          placeholder="you@indie.dev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--hi)",
            fontSize: large ? 16 : 14.5,
            fontFamily: "var(--font-ui)",
          }}
        />
        <button
          type="submit"
          style={{
            background: "var(--life)",
            color: "#06231a",
            padding: large ? "13px 22px" : "11px 18px",
            fontSize: large ? 15 : 14,
            fontFamily: "var(--font-ui)",
            fontWeight: 600,
            border: "none",
            borderRadius: 11,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Get early access
        </button>
      </div>
      {error && (
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--red)" }}>
          {error}
        </div>
      )}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--dim)",
        }}
      >
        open source · self-host on SmolVM or Docker
      </div>
    </form>
  );
}
