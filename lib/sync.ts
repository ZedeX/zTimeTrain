import { getFullSnapshot, getLastModified, applySnapshot } from "./storage";
import { AppState } from "./types";

let syncTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DELAY_MS = 30_000; // 30 seconds idle

export function scheduleSyncAfterOperation(): void {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncToCloud().catch(console.error);
  }, SYNC_DELAY_MS);
}

export async function syncToCloud(): Promise<void> {
  try {
    const snapshot = getFullSnapshot();
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
  } catch (e) {
    console.warn("Sync failed (offline?)", e);
  }
}

export async function syncFromCloud(userId: string): Promise<AppState | null> {
  try {
    const res = await fetch(`/api/sync?userId=${userId}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code === 200 && json.data) {
      const cloudState = json.data as AppState;
      const localLm = getLastModified();
      if (cloudState.lastModified > localLm) {
        applySnapshot(cloudState);
        return cloudState;
      }
    }
  } catch (e) {
    console.warn("Cloud fetch failed", e);
  }
  return null;
}
