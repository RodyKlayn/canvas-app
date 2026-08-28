import { useCallback, useEffect, useRef, useState } from "react";
import {
  SplitView,
  Toolbar,
  ToolbarContent,
  ToolbarTitle,
  ToolbarActions,
  SegmentedControl,
  SegmentedControlItem,
  Button,
  EmptyState,
  Separator,
  Text,
} from "@glaze/core/components";
import {
  StickyNote,
  Link2,
  FileText,
  Compass,
  Box,
  LayoutGrid,
  Plus,
  Pin,
  Globe,
  Check,
  Loader2,
  AlertCircle,
  Copy,
  ExternalLink,
  Wifi,
  History,
  Ruler,
  Search,
  Layers,
  Settings2,
  Film,
} from "lucide-react";
import { nanoid } from "nanoid";
import { ProjectSidebar } from "../components/project-sidebar";
import { InfiniteCanvas } from "../components/infinite-canvas";
import { RichTextEditor } from "../components/rich-text-editor";
import { DoubleDiamond } from "../components/double-diamond";
import { GlobalStickyLayer } from "../components/global-sticky-layer";
import { ChangeLog } from "../components/change-log";
import { PrototypeViewer } from "../components/prototype-viewer";
import { DocumentSidebar } from "../components/document-sidebar";
import { Presence } from "../components/presence";
import { TabSetup, TabConfigurator } from "../components/tab-setup";
import { ResearchTab } from "../components/research-tab";
import { CADViewer } from "../components/cad-viewer";
import { ScreenplayEditor } from "../components/screenplay-editor";
import { useAutoSave } from "../hooks/use-auto-save";
import { useCanvasStore, createStickyNode } from "../store";
import type { WorkspaceMode } from "../types";

export function HomeView() {
  const projects = useCanvasStore((s) => s.projects);
  const activeProjectId = useCanvasStore((s) => s.activeProjectId);
  const mode = useCanvasStore((s) => s.mode);
  const setMode = useCanvasStore((s) => s.setMode);
  const createProject = useCanvasStore((s) => s.createProject);
  const addNode = useCanvasStore((s) => s.addNode);
  const createDocument = useCanvasStore((s) => s.createDocument);
  const addGlobalSticky = useCanvasStore((s) => s.addGlobalSticky);
  const tabs = useCanvasStore((s) => s.tabs);
  const hasCompletedSetup = useCanvasStore((s) => s.hasCompletedSetup);
  const [showConfigurator, setShowConfigurator] = useState(false);

  const { status: saveStatus } = useAutoSave();
  const [webPort, setWebPort] = useState<number | null>(null);
  const [networkInfo, setNetworkInfo] = useState<{
    port: number;
    urls: string[];
    hostname: string;
    ips: string[];
    publicUrl: string | null;
  } | null>(null);
  const [showNetworkPanel, setShowNetworkPanel] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Load persisted state from backend on first mount + get web server port + network info
  useEffect(() => {
    (async () => {
      try {
        const port = await window.glazeAPI.glaze.ipc.invoke<number>(
          "sync:getPort",
        );
        setWebPort(port);
      } catch {
        // Backend not ready yet — non-fatal
      }
      try {
        const info = await window.glazeAPI.glaze.ipc.invoke<{
          port: number;
          urls: string[];
          hostname: string;
          ips: string[];
          publicUrl: string | null;
        }>("sync:getNetworkInfo");
        setNetworkInfo(info);
        if (info?.port) setWebPort(info.port);
      } catch {
        // Fallback to getPort
      }
    })();
  }, []);

  // Poll for public URL (tunnel may take 10-15s to be ready)
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const info = await window.glazeAPI.glaze.ipc.invoke<{
          port: number;
          urls: string[];
          hostname: string;
          ips: string[];
          publicUrl: string | null;
        }>("sync:getNetworkInfo");
        setNetworkInfo((prev) => {
          if (!prev?.publicUrl && info?.publicUrl) return info;
          if (prev?.publicUrl) return prev;
          return info;
        });
      } catch {}
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Ensure current mode is enabled, otherwise switch to first enabled
  useEffect(() => {
    const enabled = tabs.filter((t) => t.enabled).map((t) => t.id);
    if (!enabled.includes(mode as unknown as string)) {
      const fallback = (enabled[0] as WorkspaceMode) || "canvas";
      setMode(fallback);
    }
  }, [tabs, mode, setMode]);

  // Sync between Zustand (localStorage) and backend file so web gets latest
  useEffect(() => {
    (async () => {
      try {
        const remote = await window.glazeAPI.glaze.ipc.invoke<{
          projects?: unknown[];
          activeProjectId?: string | null;
          mode?: string;
          globalStickies?: unknown[];
          lastSavedAt?: number;
        } | null>("sync:load");
        if (projects.length === 0) {
          if (remote?.projects && Array.isArray(remote.projects) && remote.projects.length > 0) {
            useCanvasStore.setState({
              projects: remote.projects as never,
              activeProjectId: (remote.activeProjectId as string | null) ?? null,
              mode: (remote.mode as WorkspaceMode) ?? "canvas",
              globalStickies: (remote.globalStickies as never) ?? [],
            });
          }
        } else {
          // Zustand has data but backend file may be empty/stale (e.g. after restart before first auto-save) — push it
          const remoteCount = Array.isArray(remote?.projects) ? remote.projects.length : 0;
          if (remoteCount === 0 && projects.length > 0) {
            const snap = {
              projects,
              activeProjectId,
              mode,
              globalStickies: useCanvasStore.getState().globalStickies,
              lastSavedAt: Date.now(),
            };
            await window.glazeAPI.glaze.ipc.invoke("sync:save", snap);
          }
        }
      } catch {
        // Non-fatal
      }
    })();
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeDoc = activeProject?.documents?.find(
    (d) => d.id === activeProject?.activeDocumentId,
  );

  const handleAddSticky = useCallback(() => {
    if (!activeProjectId) return;
    addNode(createStickyNode({ x: 250, y: 200 }, "yellow"));
  }, [activeProjectId, addNode]);

  const handleAddLink = useCallback(() => {
    if (!activeProjectId) return;
    addNode({
      id: nanoid(),
      type: "link",
      position: { x: 250, y: 200 },
      data: { kind: "link", url: "https://", title: "New link" },
    });
  }, [activeProjectId, addNode]);

  const handleAddDocument = useCallback(() => {
    if (!activeProjectId) return;
    createDocument();
    setMode("document");
  }, [activeProjectId, createDocument, setMode]);

  const handleAddGlobalSticky = useCallback(() => {
    // Place near top-left with a slight cascade offset
    const count = useCanvasStore.getState().globalStickies.length;
    addGlobalSticky({ x: 60 + (count % 5) * 24, y: 60 + (count % 5) * 24 });
  }, [addGlobalSticky]);

  if (!hasCompletedSetup) {
    return <TabSetup onComplete={() => {}} />;
  }

  return (
    <SplitView
      sidebar={<ProjectSidebar sidebarActions={<SplitView.SidebarToggle />} />}
      storageKey="canvas-workspace-shell"
    >
      <div className="h-full flex flex-col">
        <Toolbar>
          <ToolbarContent>
            <ToolbarTitle>
              {activeProject ? activeProject.name : "Canvas"}
            </ToolbarTitle>
            {activeProject ? (
              <Text variant="small" color="tertiary" className="ml-2">
                {activeProject.nodes.length}{" "}
                {activeProject.nodes.length === 1 ? "item" : "items"}
              </Text>
            ) : null}
          </ToolbarContent>
          {activeProject ? (
            <ToolbarActions>
              <SegmentedControl
                value={mode}
                onValueChange={(v) => setMode(v as WorkspaceMode)}
                size="small"
                aria-label="Workspace mode"
              >
                {tabs
                  .filter((t) => t.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((tab) => {
                      const iconMap: Record<string, React.ReactNode> = {
                        canvas: <LayoutGrid className="size-3.5" />,
                        document: <FileText className="size-3.5" />,
                        methodology: <Compass className="size-3.5" />,
                        viewer: <Box className="size-3.5" />,
                        screenplay: <Film className="size-3.5" />,
                        log: <History className="size-3.5" />,
                        cad: <Ruler className="size-3.5" />,
                        research: <Search className="size-3.5" />,
                        prototype: <Box className="size-3.5" />,
                      };
                    return (
                      <SegmentedControlItem key={tab.id} value={tab.id} iconOnly aria-label={tab.label} title={tab.label}>
                        {iconMap[tab.id] ?? <Layers className="size-3.5" />}
                      </SegmentedControlItem>
                    );
                  })}
              </SegmentedControl>
              <Button
                iconOnly
                variant="glass"
                size="small"
                onClick={() => setShowConfigurator(true)}
                aria-label="Configure tabs"
                title="Configure tabs"
              >
                <Settings2 className="size-3.5" />
              </Button>
              <Separator orientation="vertical" />
              <Button
                iconOnly
                variant="glass"
                onClick={handleAddSticky}
                aria-label="Add sticky note"
                title="Add sticky note"
              >
                <StickyNote className="size-4" />
              </Button>
              <Button
                iconOnly
                variant="glass"
                onClick={handleAddLink}
                aria-label="Add link"
                title="Add link"
              >
                <Link2 className="size-4" />
              </Button>
              <Button
                iconOnly
                variant="glass"
                onClick={handleAddGlobalSticky}
                aria-label="Pin sticky note to window"
                title="Pin sticky note to window"
              >
                <Pin className="size-4" />
              </Button>

              <Separator orientation="vertical" />

              {/* Auto-save status indicator */}
              <div className="flex items-center gap-1 px-1">
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-tertiary" />
                    <Text variant="mini" color="tertiary">
                      Saving...
                    </Text>
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <Check className="size-3.5 text-green" />
                    <Text variant="mini" color="green">
                      Saved
                    </Text>
                  </>
                ) : saveStatus === "error" ? (
                  <>
                    <AlertCircle className="size-3.5 text-red" />
                    <Text variant="mini" color="red">
                      Error
                    </Text>
                  </>
                ) : null}
              </div>

              {/* Username — app is admin */}
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 border border-accent/20 cursor-pointer"
                title="Admin — click to rename"
                onClick={() => {
                  const cur = (() => {
                    try {
                      return localStorage.getItem("canvas-username") || "Admin";
                    } catch {
                      return "Admin";
                    }
                  })();
                  const nv = window.prompt("Change username (admin):", cur);
                  if (nv && nv.trim()) {
                    try {
                      localStorage.setItem("canvas-username", nv.trim());
                      localStorage.setItem("canvas-isAdmin", String(nv.trim().toLowerCase() === "admin"));
                    } catch {}
                    window.location.reload();
                  }
                }}
              >
                <span className="size-5 rounded-full bg-accent text-white grid place-items-center text-[10px] font-semibold">
                  {(() => {
                    try {
                      return (localStorage.getItem("canvas-username") || "Admin").charAt(0).toUpperCase();
                    } catch {
                      return "A";
                    }
                  })()}
                </span>
                <Text variant="small" className="font-medium">
                  {(() => {
                    try {
                      return localStorage.getItem("canvas-username") || "Admin";
                    } catch {
                      return "Admin";
                    }
                  })()}
                </Text>
                <span className="text-[9px] bg-accent text-white px-1 py-0.5 rounded">admin</span>
              </div>

              <Separator orientation="vertical" />

              {/* Presence — shows when one or multiple users are online */}
              <Presence />

              {/* Web access button — now shows LAN/WAN panel */}
              {webPort || networkInfo ? (
                <div className="relative">
                  <Button
                    iconOnly
                    variant="glass"
                    onClick={() => setShowNetworkPanel((v) => !v)}
                    aria-label="Open web version"
                    title={
                      networkInfo
                        ? networkInfo.urls.join(", ")
                        : `http://localhost:${webPort}`
                    }
                  >
                    <Globe className="size-4" />
                  </Button>
                  {showNetworkPanel && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-white shadow-xl z-50 dark:bg-zinc-900 dark:border-zinc-800 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Wifi className="size-3.5" />
                          Access from other devices
                        </div>
                        <Button
                          variant="glass"
                          size="small"
                          onClick={() => setShowNetworkPanel(false)}
                        >
                          Close
                        </Button>
                      </div>
                      <Text variant="mini" color="tertiary" className="mb-2 block">
                        This Mac hosts the website while the app is open. LAN URLs work on same Wi-Fi. Public URL works from any network (internet) — auto-created.
                      </Text>
                      {networkInfo?.publicUrl && (
                        <div className="mb-3 p-2 rounded bg-accent/10 border border-accent/20">
                          <Text variant="mini" color="tertiary" className="block mb-1 font-medium">
                            🌐 Public URL (any network):
                          </Text>
                          <div className="flex items-center gap-1.5 rounded bg-white dark:bg-zinc-800 border border-accent/20 px-2 py-1.5">
                            <Text variant="mini" className="flex-1 truncate font-mono text-xs font-medium">
                              {networkInfo.publicUrl}
                            </Text>
                            <Button
                              iconOnly
                              variant="glass"
                              size="small"
                              aria-label={`Copy ${networkInfo.publicUrl}`}
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(networkInfo.publicUrl!);
                                  setCopiedUrl(networkInfo.publicUrl!);
                                  setTimeout(() => setCopiedUrl(null), 1500);
                                } catch {}
                              }}
                            >
                              {copiedUrl === networkInfo.publicUrl ? (
                                <Check className="size-3.5 text-green-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </Button>
                            <Button
                              iconOnly
                              variant="glass"
                              size="small"
                              aria-label="Open public URL"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(networkInfo.publicUrl!);
                                } catch {}
                                window.open(networkInfo.publicUrl!, "_blank");
                              }}
                            >
                              <ExternalLink className="size-3.5" />
                            </Button>
                          </div>
                          <Text variant="mini" color="tertiary" className="block mt-1">
                            Share this with friends — no Wi-Fi needed.
                          </Text>
                        </div>
                      )}
                      <div className="space-y-1.5 mb-3">
                        <Text variant="mini" color="tertiary" className="block font-medium">
                          LAN (same Wi-Fi):
                        </Text>
                        {(networkInfo?.urls ?? [`http://localhost:${webPort}`]).map((url) => (
                          <div
                            key={url}
                            className="flex items-center gap-1.5 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5"
                          >
                            <Text variant="mini" className="flex-1 truncate font-mono text-xs">
                              {url}
                            </Text>
                            <Button
                              iconOnly
                              variant="glass"
                              size="small"
                              aria-label={`Copy ${url}`}
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(url);
                                  setCopiedUrl(url);
                                  setTimeout(() => setCopiedUrl(null), 1500);
                                } catch {
                                  // ignore
                                }
                              }}
                            >
                              {copiedUrl === url ? (
                                <Check className="size-3.5 text-green-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </Button>
                            <Button
                              iconOnly
                              variant="glass"
                              size="small"
                              aria-label={`Open ${url}`}
                              onClick={() =>
                                window.glazeAPI.glaze.ipc.invoke("sync:openWeb")
                              }
                            >
                              <ExternalLink className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-2" />
                      {networkInfo?.publicUrl ? (
                        <div className="space-y-1 p-2 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                          <Text variant="mini" color="tertiary" className="font-medium block text-green-700 dark:text-green-300">
                            ✓ Public tunnel active — friends can join from any network!
                          </Text>
                          <Text variant="mini" color="tertiary" className="block">
                            No setup needed. The public URL above works from other Wi-Fi/mobile data.
                          </Text>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Text variant="mini" color="tertiary" className="font-medium block">
                            From other networks (internet):
                          </Text>
                          <Text variant="mini" color="tertiary" className="block">
                            Public URL is starting… if it doesn't appear in 10s, run manually:
                          </Text>
                          <code className="block rounded bg-zinc-900 text-zinc-100 px-2 py-1.5 font-mono text-xs">
                            {`npx localtunnel --port ${webPort ?? networkInfo?.port ?? 7531}`}
                          </code>
                          <Text variant="mini" color="tertiary" className="block">
                            {`Or use Tailscale. Allow port ${webPort ?? networkInfo?.port ?? 7531} in Firewall.`}
                          </Text>
                        </div>
                      )}
                      <div className="mt-2 flex gap-1.5">
                        <Button
                          variant="accent"
                          size="small"
                          onClick={() =>
                            window.glazeAPI.glaze.ipc.invoke("sync:openWeb")
                          }
                        >
                          Open locally
                        </Button>
                        <Button
                          variant="glass"
                          size="small"
                          onClick={async () => {
                            try {
                              const info = await window.glazeAPI.glaze.ipc.invoke<{
                                port: number;
                                urls: string[];
                                hostname: string;
                                ips: string[];
                                publicUrl: string | null;
                              }>("sync:getNetworkInfo");
                              setNetworkInfo(info);
                              if (info?.port) setWebPort(info.port);
                            } catch {
                              // ignore
                            }
                          }}
                        >
                          Refresh
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </ToolbarActions>
          ) : null}
        </Toolbar>

        <div className="flex-1 relative">
          {!activeProject ? (
            <EmptyState
              placement="center"
              title="No project selected"
              description="Select a project from the sidebar or create a new one to start building your moodboard."
              actions={
                <Button variant="accent" onClick={() => createProject()}>
                  Create Project
                </Button>
              }
            />
          ) : mode === "canvas" ? (
            <InfiniteCanvas />
          ) : mode === "document" ? (
            <div className="h-full flex">
              <DocumentSidebar />
              <div className="flex-1 min-w-0">
                {activeDoc ? (
                  <RichTextEditor documentId={activeDoc.id} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <EmptyState
                      placement="center"
                      title="No document selected"
                      description="Select a text file from the left or create a new one to start writing."
                      actions={
                        <Button variant="accent" onClick={handleAddDocument}>
                          <Plus className="size-4" />
                          New text file
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          ) : mode === "methodology" ? (
            <DoubleDiamond />
          ) : mode === "viewer" ? (
            <PrototypeViewer />
          ) : mode === "log" ? (
            <ChangeLog />
          ) : mode === "cad" ? (
            <CADViewer />
          ) : mode === "screenplay" ? (
            <ScreenplayEditor />
          ) : mode === "research" ? (
            <ResearchTab />
          ) : null}

          {/* Global floating sticky notes — visible over all tabs */}
          <GlobalStickyLayer />
        </div>
      </div>

      {showConfigurator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfigurator(false)}>
          <div className="bg-popover border border-separator rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-separator flex items-center justify-between">
              <Text variant="strong">Configure Tabs</Text>
              <Button variant="glass" size="small" iconOnly onClick={() => setShowConfigurator(false)} aria-label="Close" title="Close">
                ✕
              </Button>
            </div>
            <TabConfigurator />
          </div>
        </div>
      )}
    </SplitView>
  );
}
