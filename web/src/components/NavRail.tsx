import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { PulseDot } from "./PulseDot";
import { useHubHealth } from "../lib/hooks";
import { clearToken } from "../lib/auth";

const NAV_ITEMS = [
  { path: "/", label: "Fleet", icon: "fleet" },
  { path: "/analytics", label: "Analytics", icon: "chart" },
  { path: "/health", label: "Health", icon: "pulse" },
  { path: "/onboarding", label: "New Vivarium", icon: "plus" },
] as const;

export function NavRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: health } = useHubHealth();

  return (
    <div
      style={{
        width: 218,
        flex: "0 0 218px",
        background: "var(--surface)",
        borderRight: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        padding: "18px 14px",
      }}
    >
      <div style={{ padding: "4px 8px 22px" }}>
        <Logo size={21} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "9px 12px",
                borderRadius: 12,
                color: active ? "var(--hi)" : "var(--mid)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                background: active ? "var(--life-bg)" : "transparent",
                transition: "background .12s, color .12s",
              }}
            >
              <Icon
                name={icon}
                size={18}
                color={active ? "var(--life)" : "var(--mid)"}
              />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
        <div
          onClick={() => navigate("/settings")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "9px 12px",
            borderRadius: 12,
            color: "var(--mid)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "background .12s",
          }}
        >
          <Icon name="gear" size={18} color="var(--mid)" />
          <span>Settings</span>
        </div>
        <div
          onClick={() => {
            clearToken();
            window.location.reload();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "9px 12px",
            borderRadius: 12,
            color: "var(--dim)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "background .12s",
          }}
        >
          <Icon name="arrow" size={18} color="var(--dim)" style={{ transform: "rotate(180deg)" }} />
          <span>Log out</span>
        </div>
        <div
          style={{
            marginTop: 10,
            padding: "11px 12px",
            background: "var(--surface2)",
            border: "1px solid var(--line)",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <PulseDot state={health?.ok ? "working" : "stopped"} size={8} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              Hub {health?.ok ? "online" : "offline"}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>
              {health
                ? `${health.connectedCount}/${health.vivariumCount} connected`
                : "connecting…"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
