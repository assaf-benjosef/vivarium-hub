import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFleet } from "../lib/hooks";
import type { FleetVivarium, VivariumState } from "../lib/types";
import { PulseDot } from "../components/PulseDot";
import { StatusBadge } from "../components/StatusBadge";
import { Heart } from "../components/Heart";
import { Icon } from "../components/Icon";
import { DetailPanel } from "./Detail";

function deriveState(v: FleetVivarium): VivariumState {
  if (!v.online) return "stopped";
  return "idle";
}

type FilterKey = "all" | "online" | "offline";

const FILTERS: { key: FilterKey; label: string; fn: (v: FleetVivarium) => boolean }[] = [
  { key: "all", label: "All", fn: () => true },
  { key: "online", label: "Online", fn: (v) => v.online },
  { key: "offline", label: "Offline", fn: (v) => !v.online },
];

function formatUptime(connectedAt: string | null): string {
  if (!connectedAt) return "—";
  const ms = Date.now() - new Date(connectedAt).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function Fleet() {
  const { data: fleet = [], isLoading } = useFleet();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const f = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
    return fleet.filter(f.fn);
  }, [fleet, filter]);

  const selected = fleet.find((v) => v.id === selectedId) ?? null;
  const onlineCount = fleet.filter((v) => v.online).length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
      {/* Header */}
      <div
        style={{
          padding: "20px 26px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            className="display"
            style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-.02em" }}
          >
            Fleet
          </h1>
          <div style={{ fontSize: 13, color: "var(--mid)", marginTop: 2 }}>
            {fleet.length} vivarium{fleet.length !== 1 ? "s" : ""} · {onlineCount} online
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/onboarding")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "var(--life)",
              color: "#06231a",
              padding: "9px 15px",
              fontSize: 13.5,
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              border: "none",
              borderRadius: 11,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="plus" size={16} color="#06231a" strokeWidth={2.4} /> New Vivarium
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "12px 26px", display: "flex", gap: 8, alignItems: "center" }}>
        {FILTERS.map(({ key, label, fn }) => {
          const count = fleet.filter(fn).length;
          const active = filter === key;
          return (
            <span
              key={key}
              onClick={() => setFilter(key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".01em",
                padding: "3px 9px 3px 8px",
                background: active ? "var(--life-bg)" : "var(--surface2)",
                color: active ? "var(--hi)" : "var(--mid)",
                border: `1px solid ${active ? "transparent" : "var(--line)"}`,
                cursor: "pointer",
              }}
            >
              {label}{" "}
              <span className="mono" style={{ opacity: 0.7 }}>
                {count}
              </span>
            </span>
          );
        })}
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.7fr 116px 100px 90px 120px",
          gap: 14,
          padding: "8px 26px",
          fontSize: 10.5,
          color: "var(--dim)",
          fontWeight: 600,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>Vivarium</div>
        <div>Status</div>
        <div style={{ textAlign: "right" }}>Version</div>
        <div style={{ textAlign: "right" }}>Uptime</div>
        <div>Activity</div>
      </div>

      {/* Table body */}
      <div style={{ overflow: "auto", flex: 1 }}>
        {isLoading && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--dim)", fontSize: 13 }}>
            Loading fleet…
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--dim)", fontSize: 13 }}>
            {fleet.length === 0
              ? "No Vivariums yet. Create one to get started."
              : "No Vivariums match this filter."}
          </div>
        )}
        {filtered.map((v) => {
          const state = deriveState(v);
          return (
            <div
              key={v.id}
              onClick={() => setSelectedId(v.id === selectedId ? null : v.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "1.7fr 116px 100px 90px 120px",
                gap: 14,
                padding: "14px 26px",
                alignItems: "center",
                borderBottom: "1px solid var(--line)",
                cursor: "pointer",
                background: v.id === selectedId ? "var(--life-bg)" : "transparent",
                transition: "background .12s",
              }}
              onMouseEnter={(e) => {
                if (v.id !== selectedId) e.currentTarget.style.background = "rgba(255,255,255,0.025)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = v.id === selectedId ? "var(--life-bg)" : "transparent";
              }}
            >
              {/* Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <PulseDot state={state} size={10} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, whiteSpace: "nowrap" }}>
                    <span className="mono" style={{ fontSize: 14.5, fontWeight: 600 }}>
                      {v.name}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--dim)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    created {new Date(v.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {/* Status */}
              <div>
                <StatusBadge state={state} />
              </div>
              {/* Version */}
              <div
                className="mono"
                style={{ textAlign: "right", fontSize: 12.5, color: "var(--mid)" }}
              >
                {v.version ?? "—"}
              </div>
              {/* Uptime */}
              <div
                className="mono"
                style={{ textAlign: "right", fontSize: 12.5, color: "var(--mid)" }}
              >
                {formatUptime(v.connectedAt)}
              </div>
              {/* Activity */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Heart state={state} w={84} h={26} />
                <Icon name="arrow" size={15} color="var(--dim)" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail slide-over */}
      {selected && (
        <>
          <div
            onClick={() => setSelectedId(null)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 5,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 430,
              zIndex: 6,
            }}
          >
            <DetailPanel vivarium={selected} onClose={() => setSelectedId(null)} />
          </div>
        </>
      )}
    </div>
  );
}
