/**
 * useAutoSave — debounced auto-save hook.
 *
 * Watches the Zustand store and pushes the full workspace state to the
 * backend on a debounce. Also listens for state pushed from the web client
 * via the `sync:stateChanged` IPC broadcast and merges it into the store.
 *
 * Returns a save status string: "idle" | "saving" | "saved" | "error".
 */

import { useEffect, useRef, useState } from "react";
import { useCanvasStore } from "../store";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 300;

export function useAutoSave(): { status: SaveStatus; lastSavedAt: number | null } {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemoteUpdate = useRef(false);

  // Subscribe to store changes — serialize the relevant slices
  useEffect(() => {
    const unsubscribe = useCanvasStore.subscribe((state, prev) => {
      // Skip if this update came from a remote (web) push
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }

      // Check if anything meaningful changed
      if (
        state.projects === prev.projects &&
        state.activeProjectId === prev.activeProjectId &&
        state.mode === prev.mode &&
        state.globalStickies === prev.globalStickies
      ) {
        return;
      }

      // Debounce the save
      if (timerRef.current) clearTimeout(timerRef.current);

      setStatus("saving");
      timerRef.current = setTimeout(async () => {
        const snapshot = {
          projects: state.projects,
          activeProjectId: state.activeProjectId,
          mode: state.mode,
          globalStickies: state.globalStickies,
          lastSavedAt: Date.now(),
        };

        try {
          await window.glazeAPI.glaze.ipc.invoke("sync:save", snapshot);
          setStatus("saved");
          setLastSavedAt(Date.now());
          // Reset to idle after 2s
          setTimeout(() => setStatus("idle"), 2000);
        } catch {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 3000);
        }
      }, DEBOUNCE_MS);
    });

    return unsubscribe;
  }, []);

  // Listen for state changes pushed from the web client
  useEffect(() => {
    const unsubscribe = window.glazeAPI.glaze.ipc.on(
      "sync:stateChanged",
      (_event, state: unknown) => {
        if (!state || typeof state !== "object") return;
        const remote = state as {
          projects?: unknown[];
          activeProjectId?: string | null;
          mode?: string;
          globalStickies?: unknown[];
          lastSavedAt?: number;
        };

        isRemoteUpdate.current = true;

        // Merge remote state into the store
        useCanvasStore.setState({
          projects: (remote.projects as never) ?? useCanvasStore.getState().projects,
          activeProjectId:
            (remote.activeProjectId as string | null) ??
            useCanvasStore.getState().activeProjectId,
          mode: (remote.mode as never) ?? useCanvasStore.getState().mode,
          globalStickies:
            (remote.globalStickies as never) ??
            useCanvasStore.getState().globalStickies,
        });

        if (remote.lastSavedAt) setLastSavedAt(remote.lastSavedAt);
      },
    );

    return unsubscribe;
  }, []);

  return { status, lastSavedAt };
}
