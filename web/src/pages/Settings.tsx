import { useState } from "react";
import { useMe, useUpdateMe } from "../lib/hooks";
import { Icon } from "../components/Icon";

export function Settings() {
  const { data: me, isLoading } = useMe();
  const updateMutation = useUpdateMe();
  const [telegramInput, setTelegramInput] = useState("");

  const linked = !!me?.telegramId;

  const handleSave = () => {
    const id = parseInt(telegramInput, 10);
    if (!id || isNaN(id)) return;
    updateMutation.mutate({ telegramId: id });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div
        style={{
          padding: "20px 26px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <h1
          className="display"
          style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-.02em" }}
        >
          Settings
        </h1>
        <div style={{ fontSize: 13, color: "var(--mid)", marginTop: 2 }}>
          Account and integrations
        </div>
      </div>

      <div style={{ padding: "24px 26px", maxWidth: 560 }}>
        {isLoading ? (
          <div style={{ color: "var(--dim)", fontSize: 13 }}>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Account info */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--dim)",
                  fontWeight: 600,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Account
              </div>
              {[
                ["Email", me?.email ?? "—"],
                ["Display name", me?.displayName ?? "—"],
                ["User ID", me?.id ? String(me.id) : "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span style={{ color: "var(--dim)" }}>{label}</span>
                  <span className="mono" style={{ color: "var(--mid)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Telegram linking */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--dim)",
                  fontWeight: 600,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Telegram
              </div>

              {linked ? (
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
                    Linked to Telegram ID{" "}
                    <span className="mono">{me?.telegramId}</span>
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", lineHeight: 1.5 }}>
                    Link your Telegram account so vivariums you create here show
                    up in Telegram's /list. Message{" "}
                    <span className="mono" style={{ color: "var(--hi)" }}>@userinfobot</span>{" "}
                    on Telegram to find your ID.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      value={telegramInput}
                      onChange={(e) => setTelegramInput(e.target.value)}
                      placeholder="e.g. 7948830629"
                      className="mono"
                      style={{
                        flex: 1,
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                        borderRadius: 11,
                        padding: "10px 14px",
                        color: "var(--hi)",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleSave}
                      disabled={!telegramInput.trim() || updateMutation.isPending}
                      style={{
                        background: "var(--life)",
                        color: "#06231a",
                        padding: "10px 18px",
                        fontSize: 13,
                        fontFamily: "var(--font-ui)",
                        fontWeight: 600,
                        border: "none",
                        borderRadius: 11,
                        cursor: telegramInput.trim() ? "pointer" : "not-allowed",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {updateMutation.isPending ? "Saving…" : "Link"}
                    </button>
                  </div>
                  {updateMutation.isError && (
                    <div style={{ fontSize: 12, color: "var(--red)" }}>
                      Failed to link. Check the ID and try again.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
