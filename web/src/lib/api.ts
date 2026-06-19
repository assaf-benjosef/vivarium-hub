import type {
  FleetVivarium,
  VivariumStatus,
  CreateVivariumResponse,
  HubHealth,
} from "./types";
import { getToken, clearToken } from "./auth";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json();
}

export function fetchFleet(): Promise<FleetVivarium[]> {
  return fetchJson("/api/fleet");
}

export function fetchVivarium(id: number): Promise<FleetVivarium> {
  return fetchJson(`/api/fleet/${id}`);
}

export function fetchVivariumStatus(id: number): Promise<VivariumStatus> {
  return fetchJson(`/api/fleet/${id}/status`);
}

export function createVivarium(
  name: string
): Promise<CreateVivariumResponse> {
  return fetchJson("/api/fleet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function stopVivarium(
  id: number
): Promise<{ ok: boolean; sent: boolean }> {
  return fetchJson(`/api/fleet/${id}/stop`, { method: "POST" });
}

export function deleteVivarium(id: number): Promise<{ ok: boolean }> {
  return fetchJson(`/api/fleet/${id}`, { method: "DELETE" });
}

export function fetchHubHealth(): Promise<HubHealth> {
  return fetchJson("/api/hub/health");
}

export interface MeResponse {
  id: number;
  email: string | null;
  displayName: string | null;
  telegramId: number | null;
}

export async function fetchMe(): Promise<MeResponse | null> {
  try {
    return await fetchJson("/auth/me");
  } catch {
    return null;
  }
}

export function updateMe(data: { telegramId: number }): Promise<{ id: number; telegramId: number }> {
  return fetchJson("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
