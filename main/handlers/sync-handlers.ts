/**
 * Sync IPC Handlers
 *
 * Bridges the renderer Zustand store to the backend SyncService for
 * durable persistence (auto-save) and web client synchronization.
 */

import { ipcMain, logger, shell } from "@glaze/core/backend";
import { syncService } from "../services/sync-service.js";

export function registerSyncHandlers(): void {
  // ── Auto-save: renderer pushes state to backend ────────────────────
  ipcMain.handle("sync:save", async (_event, state: unknown) => {
    try {
      await syncService.save(state as Parameters<typeof syncService.save>[0]);
      return { ok: true };
    } catch (err) {
      logger.error("sync-handlers", "Failed to save state", err);
      return { ok: false, error: String(err) };
    }
  });

  // ── Renderer pulls state from backend (for initial load or web push) ──
  ipcMain.handle("sync:load", async () => {
    const state = await syncService.load();
    if (!state) return null;
    // Validate shape — ensure projects have required fields
    if (!Array.isArray(state.projects)) return null;
    return state;
  });

  // ── Get the web server port (for showing the URL in the UI) ──────────
  ipcMain.handle("sync:getPort", async () => {
    return syncService.getServerPort();
  });

  // ── Get full network info (port + LAN urls) for other devices ───────
  ipcMain.handle("sync:getNetworkInfo", async () => {
    return syncService.getNetworkInfo();
  });

  // ── Open the web client URL in the default browser ──────────────────
  ipcMain.handle("sync:openWeb", async () => {
    const port = syncService.getServerPort();
    const url = `http://localhost:${port}`;
    try {
      await shell.openExternal(url);
      return { ok: true, url };
    } catch (err) {
      logger.error("sync-handlers", "Failed to open web client", err);
      return { ok: false, error: String(err) };
    }
  });

  // ── Subscribe to state changes from external (web) clients ──────────
  // The renderer calls this once; the backend pushes updates via
  // ipcMain.broadcast so all windows react.
  syncService.onStateChange((state) => {
    ipcMain.broadcast("sync:stateChanged", state);
  });

  logger.info("sync-handlers", "✓ Sync IPC handlers registered");
}
