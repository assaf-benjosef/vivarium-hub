export interface FleetVivarium {
  id: number;
  name: string;
  userId: number;
  version: string | null;
  createdAt: string;
  online: boolean;
  connectedAt: string | null;
}

export interface VivariumStatus {
  online: boolean;
  appRunning?: boolean;
  uptime?: number;
  totalCostUsd?: number;
  inputTokens?: number;
}

export interface CreateVivariumResponse {
  token: string;
  name: string;
  userId: number;
  hubUrl: string;
  setupCommand: string;
}

export interface HubHealth {
  ok: boolean;
  uptime: number;
  vivariumCount: number;
  connectedCount: number;
}

export interface ConsoleEvent {
  type: "vivarium_online" | "vivarium_offline";
  vivariumId: string;
  name: string;
}

export type VivariumState =
  | "working"
  | "idle"
  | "waking"
  | "unhealthy"
  | "stopped";

export function deriveState(v: FleetVivarium): VivariumState {
  if (!v.online) return "stopped";
  if (!v.connectedAt) return "idle";
  const connectedMs = Date.now() - new Date(v.connectedAt).getTime();
  if (connectedMs < 60_000) return "waking";
  return "idle";
}
