import { useState } from "react";
import type { FleetVivarium, VivariumState } from "../lib/types";
import { useVivariumStatus, useStopVivarium, useDeleteVivarium } from "../lib/hooks";
import { PulseDot } from "../components/PulseDot";
import { StatusBadge } from "../components/StatusBadge";
import { StatTile } from "../components/StatTile";
import { Icon } from "../components/Icon";
import { ConfirmDialog } from "../components/ConfirmDialog";

function deriveState(v: FleetVivarium): VivariumState {
  if (!v.online) return "stopped";
  return "idle";
}

function formatMoney(n: number): string {
  return "$" + n.toFixed(2);
}

function formatTokens(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
  return String(n);
}

function formatUptime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function DetailPanel({
  vivarium,
  onClose,
}: {
  vivarium: FleetVivarium;
  onClose: () => void;
}) {
  const { data: status, isLoading: statusLoading } = useVivariumStatus(
    vivarium.online ? vivarium.id : null
  );
  const stopMutation = useStopVivarium();
  const deleteMutation = useDeleteVivarium();
  const state = deriveState(vivarium);

  const handleStop = () => {
    stopMutation.mutate(vivarium.id);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--surface)",
        borderLeft: "1px solid var(--line)",
        boxShadow: "-30px 0 60px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: vivarium.online ? "var(--life-bg)" : "rgba(255,255,255,0.05)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PulseDot state={state} size={11} />
          </span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span className="display" style={{ fontSize: 19, fontWeight: 600 }}>
                {vivarium.name}
              </span>
              <StatusBadge state={state} />
            </div>
            <div
              className="mono"
              style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 1 }}
            >
              {vivarium.version ?? "unknown"} · user {vivarium.userId}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "var(--surface2)",
            color: "var(--mid)",
            width: 30,
            height: 30,
            borderRadius: 9,
            border: "1px solid var(--line)",
            fontSize: 16,
            lineHeight: 1,
            cursor: "pointer",
            fontFamily: "var(--font-ui)",
            fontWeight: 600,
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* App preview placeholder */}
        <div
          style={{
            position: "relative",
            height: 190,
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: `repeating-linear-gradient(135deg, var(--surface2) 0 13px, var(--bg) 13px 26px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 28,
              background: "var(--surface)",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 11px",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 8, background: "var(--red)", opacity: 0.6 }} />
            <span style={{ width: 7, height: 7, borderRadius: 8, background: "var(--amber)", opacity: 0.6 }} />
            <span style={{ width: 7, height: 7, borderRadius: 8, background: "var(--life)", opacity: 0.6 }} />
            <span className="mono" style={{ fontSize: 10.5, color: "var(--dim)", marginLeft: 6 }}>
              {vivarium.name}
            </span>
          </div>
          <div
            className="mono"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--dim)",
              fontSize: 11.5,
              paddingTop: 28,
            }}
          >
            {vivarium.online ? "live app preview" : "app not running"}
          </div>
        </div>

        {/* Status tiles */}
        {statusLoading && vivarium.online && (
          <div style={{ fontSize: 12, color: "var(--dim)", textAlign: "center", padding: 8 }}>
            Fetching live status…
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <StatTile
            label="Session cost"
            value={status?.totalCostUsd != null ? formatMoney(status.totalCostUsd) : "—"}
            accent={
              status?.totalCostUsd != null && status.totalCostUsd > 3
                ? "var(--amber)"
                : undefined
            }
          />
          <StatTile
            label="Tokens"
            value={status?.inputTokens != null ? formatTokens(status.inputTokens) : "—"}
          />
          <StatTile
            label="Uptime"
            value={status?.uptime != null ? formatUptime(status.uptime) : "—"}
            accent="var(--life)"
          />
        </div>

        {/* App status */}
        <div
          style={{
            background: "var(--bg)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background:
                  status?.appRunning
                    ? "var(--life)"
                    : status?.online
                      ? "var(--amber)"
                      : "var(--idle-color)",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              App {status?.appRunning ? "running" : vivarium.online ? "not running" : "offline"}
            </span>
          </div>
          {vivarium.online && (
            <span className="mono" style={{ fontSize: 11, color: "var(--dim)", marginLeft: "auto" }}>
              port 3000
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--dim)",
              fontWeight: 600,
              letterSpacing: ".06em",
              textTransform: "uppercase",
            }}
          >
            Details
          </div>
          {[
            ["Created", new Date(vivarium.createdAt).toLocaleString()],
            ["Version", vivarium.version ?? "—"],
            ["User ID", String(vivarium.userId)],
            ["Connected", vivarium.connectedAt ? new Date(vivarium.connectedAt).toLocaleString() : "—"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12.5,
                padding: "6px 0",
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
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        <button
          disabled={!vivarium.online}
          style={{
            width: "100%",
            background: "var(--surface2)",
            color: vivarium.online ? "var(--hi)" : "var(--dim)",
            padding: 10,
            fontSize: 13,
            fontFamily: "var(--font-ui)",
            fontWeight: 600,
            border: "1px solid var(--line)",
            borderRadius: 11,
            cursor: vivarium.online ? "pointer" : "not-allowed",
            display: "flex",
            gap: 7,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="ext" size={15} color={vivarium.online ? "var(--hi)" : "var(--dim)"} /> Open app
        </button>
        <div style={{ display: "flex", gap: 9 }}>
          <button
            onClick={handleStop}
            disabled={!vivarium.online || stopMutation.isPending}
            style={{
              flex: 1,
              background: vivarium.online ? "var(--amber-bg)" : "var(--surface2)",
              color: vivarium.online ? "var(--amber)" : "var(--dim)",
              padding: 10,
              fontSize: 13,
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              border: "1px solid var(--line)",
              borderRadius: 11,
              cursor: vivarium.online ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}
          >
            {stopMutation.isPending ? "Stopping…" : "Stop"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteMutation.isPending}
            style={{
              flex: 1,
              background: "var(--red-bg)",
              color: "var(--red)",
              padding: 10,
              fontSize: 13,
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              border: "1px solid var(--line)",
              borderRadius: 11,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title={`Delete "${vivarium.name}"?`}
          message="This will remove the Vivarium from the hub. If it's still running, it will be shut down. This cannot be undone."
          confirmLabel="Delete"
          loading={deleteMutation.isPending}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => deleteMutation.mutate(vivarium.id, { onSuccess: onClose })}
        />
      )}
    </div>
  );
}
