import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";
import { PulseDot } from "../components/PulseDot";
import { useCreateVivarium, useMe, useUpdateMe } from "../lib/hooks";
import { fetchFleet } from "../lib/api";

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <div style={{ position: "relative" }}>
      <div
        className="mono"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "16px 48px 16px 18px",
          fontSize: 12,
          color: "var(--hi)",
          wordBreak: "break-all",
          lineHeight: 1.6,
          userSelect: "all",
        }}
      >
        {text || "generating…"}
      </div>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: copied ? "#142019" : "var(--surface2)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: "5px 8px",
          cursor: "pointer",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          fontFamily: "var(--font-ui)",
          fontWeight: 600,
          color: copied ? "var(--life)" : "var(--mid)",
          transition: "background .15s, color .15s",
        }}
      >
        <Icon name={copied ? "check" : "ext"} size={13} color={copied ? "var(--life)" : "var(--mid)"} />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Connect", "Seed", "Provision"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {steps.map((s, i) => {
        const done = i < step;
        const on = i === step;
        return (
          <div key={s} style={{ display: "contents" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span
                className="mono"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 9,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 12.5,
                  background: done ? "var(--life)" : on ? "var(--life-bg)" : "var(--surface2)",
                  color: done ? "#06231a" : on ? "var(--life)" : "var(--dim)",
                  border: `1px solid ${on ? "var(--life)" : "var(--line)"}`,
                }}
              >
                {done ? (
                  <Icon name="check" size={14} color="#06231a" strokeWidth={2.6} />
                ) : (
                  i + 1
                )}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: on ? "var(--hi)" : done ? "var(--mid)" : "var(--dim)",
                }}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 34,
                  height: 1,
                  background: "var(--line)",
                  margin: "0 14px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [seed, setSeed] = useState("");
  const [setupResult, setSetupResult] = useState<{
    token: string;
    setupCommand: string;
  } | null>(null);
  const [vivariumOnline, setVivariumOnline] = useState(false);
  const navigate = useNavigate();
  const createMutation = useCreateVivarium();
  const { data: me } = useMe();
  const updateMutation = useUpdateMe();
  const telegramLinked = !!me?.telegramId;
  const [telegramInput, setTelegramInput] = useState("");

  // Poll fleet to detect when the vivarium comes online
  useEffect(() => {
    if (step !== 2 || !name || vivariumOnline) return;
    const interval = setInterval(async () => {
      try {
        const fleet = await fetchFleet();
        const match = fleet.find((v) => v.name === name.trim() && v.online);
        if (match) setVivariumOnline(true);
      } catch {
        // ignore fetch errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [step, name, vivariumOnline]);

  const canNext = step !== 1 || name.trim().length > 0;

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 1) {
      try {
        const result = await createMutation.mutateAsync({ name: name.trim() });
        setSetupResult({ token: result.token, setupCommand: result.setupCommand });
        setStep(2);
      } catch {
        // error handled by mutation state
      }
      return;
    }
    navigate("/");
  };

  const labels = ["Connect Telegram", "Name & seed", "Provision"];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "var(--bg)",
      }}
    >
      {/* Slim top bar */}
      <div
        style={{
          width: "100%",
          padding: "18px 30px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo size={21} />
        <span
          onClick={() => navigate("/")}
          style={{ fontSize: 13, color: "var(--dim)", cursor: "pointer" }}
        >
          Cancel
        </span>
      </div>

      <div
        style={{
          width: 680,
          maxWidth: "100%",
          padding: "34px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          overflow: "auto",
          flex: 1,
        }}
      >
        <Stepper step={step} />
        <h1
          className="display"
          style={{ margin: 0, fontSize: 29, fontWeight: 600, letterSpacing: "-.025em" }}
        >
          {labels[step]}
        </h1>

        {/* Step 0: Connect Telegram */}
        {step === 0 && (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 18,
              padding: 24,
            }}
          >
            {telegramLinked ? (
              <>
                <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--mid)", lineHeight: 1.5 }}>
                  Your account is linked to Telegram. Vivariums you create will be accessible from
                  your Telegram chat.
                </p>
                <div
                  style={{
                    background: "var(--life-bg)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon name="check" size={16} color="var(--life)" />
                  <span style={{ fontSize: 13, color: "var(--hi)" }}>
                    Connected to Telegram ID <span className="mono">{me?.telegramId}</span>
                  </span>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--mid)", lineHeight: 1.5 }}>
                  Link your Telegram account so you can chat with your vivariums.
                  Message{" "}
                  <a
                    href="https://t.me/userinfobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--life)" }}
                  >@userinfobot</a>{" "}
                  on Telegram — it'll reply with your ID.
                </p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Your Telegram ID"
                    value={telegramInput}
                    onChange={(e) => setTelegramInput(e.target.value)}
                    style={{
                      flex: 1,
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: "var(--hi)",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => {
                      const id = parseInt(telegramInput, 10);
                      if (!isNaN(id)) updateMutation.mutate({ telegramId: id });
                    }}
                    disabled={!telegramInput.trim() || updateMutation.isPending}
                    style={{
                      background: telegramInput.trim() ? "var(--life)" : "var(--surface2)",
                      color: telegramInput.trim() ? "#06231a" : "var(--dim)",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 18px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: telegramInput.trim() ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {updateMutation.isPending ? "Linking..." : "Link"}
                  </button>
                </div>
                <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--dim)" }}>
                  You can skip this and connect later in Settings.
                </p>
              </>
            )}
          </div>
        )}

        {/* Step 1: Name & Seed */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--dim)",
                  fontWeight: 600,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                }}
              >
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. fern, moss, my-app"
                className="mono"
                style={{
                  marginTop: 8,
                  width: "100%",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: "13px 15px",
                  color: "var(--hi)",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--dim)",
                  fontWeight: 600,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                }}
              >
                First instruction (optional)
              </label>
              <textarea
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="e.g. Build me a simple invoice tracker"
                style={{
                  marginTop: 8,
                  width: "100%",
                  minHeight: 96,
                  resize: "none",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: "13px 15px",
                  color: "var(--hi)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  outline: "none",
                  fontFamily: "var(--font-ui)",
                }}
              />
            </div>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "12px 15px",
                display: "flex",
                gap: 24,
                fontSize: 12.5,
                color: "var(--mid)",
              }}
            >
              <span>
                <span style={{ color: "var(--dim)" }}>Runtime</span> · microsandbox
              </span>
              <span>
                <span style={{ color: "var(--dim)" }}>Workspace</span> · /workspace
              </span>
              <span>
                <span style={{ color: "var(--dim)" }}>Port</span> · 3000
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Provision */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 20,
                padding: 26,
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 80,
                  height: 80,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--life)",
                      animation: `pulse-breathe 3.6s ease-out infinite`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 28,
                    background: "var(--life)",
                    position: "relative",
                    zIndex: 2,
                  }}
                />
              </div>
              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 12.5,
                    color: "var(--life)",
                    fontWeight: 600,
                    marginBottom: 5,
                    letterSpacing: ".04em",
                  }}
                >
                  {vivariumOnline ? "ALIVE" : "READY TO CONNECT"}
                </div>
                <h2
                  className="display"
                  style={{ margin: "0 0 5px", fontSize: 24, fontWeight: 600, letterSpacing: "-.02em" }}
                >
                  {vivariumOnline
                    ? `${name} is alive!`
                    : `${name || "your Vivarium"} setup token generated`}
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", lineHeight: 1.5 }}>
                  {vivariumOnline
                    ? "Your Vivarium is connected and ready. Head to the fleet to see it."
                    : "Run the install command below on your machine to connect this Vivarium to the hub."}
                </p>
              </div>
            </div>

            {/* Install command */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--dim)",
                  fontWeight: 600,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Install command
              </div>
              <CopyBlock text={setupResult?.setupCommand ?? ""} />
            </div>

            {/* Raw token (collapsible) */}
            <details style={{ fontSize: 12, color: "var(--dim)" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", fontSize: 11 }}>
                Raw token
              </summary>
              <div
                className="mono"
                style={{
                  marginTop: 8,
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  fontSize: 11,
                  color: "var(--mid)",
                  wordBreak: "break-all",
                  lineHeight: 1.5,
                  userSelect: "all",
                }}
              >
                {setupResult?.token ?? "generating…"}
              </div>
            </details>

            <div
              style={{
                background: vivariumOnline ? "var(--life-bg)" : "var(--amber-bg)",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "background .3s",
              }}
            >
              <PulseDot state={vivariumOnline ? "working" : "waking"} size={8} />
              <span style={{ fontSize: 13, color: "var(--hi)" }}>
                {vivariumOnline
                  ? `${name} is online and connected to the hub!`
                  : "Waiting for Vivarium to connect…"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <span
            onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))}
            style={{ fontSize: 13.5, color: "var(--dim)", cursor: "pointer" }}
          >
            {step > 0 ? "Back" : "Cancel"}
          </span>
          <button
            disabled={!canNext || createMutation.isPending}
            onClick={handleNext}
            style={{
              background: canNext ? "var(--life)" : "var(--surface2)",
              color: canNext ? "#06231a" : "var(--dim)",
              padding: "11px 22px",
              fontSize: 14,
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              border: "none",
              borderRadius: 11,
              display: "flex",
              gap: 8,
              alignItems: "center",
              cursor: canNext ? "pointer" : "not-allowed",
            }}
          >
            {step === 2
              ? "Go to fleet"
              : step === 1
                ? createMutation.isPending
                  ? "Creating…"
                  : "Create"
                : "Continue"}
            <Icon name="arrow" size={16} color={canNext ? "#06231a" : "var(--dim)"} />
          </button>
        </div>
      </div>
    </div>
  );
}
