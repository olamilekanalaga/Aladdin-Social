import { useStore } from "./store";
export interface DemoSession {
  mode: "demo";
  identity: "wallet" | "social";
  plan: string;
  features: string[];
  csrf: string;
  notice: string;
}
export async function api<T>(
  path: string,
  body?: unknown,
  csrf?: string,
): Promise<T> {
  const r = await fetch(`/api${path}`, {
    credentials: "same-origin",
    headers: body
      ? {
          "Content-Type": "application/json",
          ...(csrf ? { "X-Demo-CSRF": csrf } : {}),
        }
      : {},
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data as T;
}
let pendingSession: Promise<DemoSession> | null = null;
export function ensureSession(): Promise<DemoSession> {
  if (!pendingSession) {
    pendingSession = (async () => {
      try {
        return await api<DemoSession>("/session");
      } catch {
        return api<DemoSession>("/session", {
          identity: useStore.getState().participation,
        });
      }
    })().finally(() => {
      pendingSession = null;
    });
  }
  return pendingSession;
}
