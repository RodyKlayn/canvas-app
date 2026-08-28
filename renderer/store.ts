import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  CADItem,
  CanvasEdge,
  CanvasNode,
  CanvasSnapshot,
  ChangeLogEntry,
  DiamondPhase,
  Document,
  DoubleDiamondState,
  FormResult,
  GlobalSticky,
  MethodologyTask,
  Project,
  PrototypeItem,
  QATranscription,
  ResearchState,
  StickyColor,
  TabConfig,
  TabId,
  WebsiteResearch,
  WorkspaceMode,
} from "./types";
import { AVAILABLE_TABS } from "./types";

function getCurrentUser(): { user: string; isAdmin: boolean } {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("canvas-username");
    if (stored) return { user: stored, isAdmin: stored.toLowerCase() === "admin" || localStorage.getItem("canvas-isAdmin") === "true" };
    // Desktop app defaults to Admin
    // @ts-ignore
    const isDesktop = typeof window.glazeAPI !== "undefined";
    if (isDesktop) {
      // Ensure Admin is persisted for future
      try {
        localStorage.setItem("canvas-username", "Admin");
        localStorage.setItem("canvas-isAdmin", "true");
      } catch {}
      return { user: "Admin", isAdmin: true };
    }
    return { user: "Anonymous", isAdmin: false };
  }
  return { user: "System", isAdmin: false };
}

function toTargetName(node: CanvasNode | undefined): string {
  if (!node) return "unknown";
  const d = node.data as Record<string, unknown>;
  if (d.kind === "sticky") return `Sticky: ${(d.text as string)?.slice(0, 24) || "empty"}`;
  if (d.kind === "image") return `Image: ${(d.label as string) || "image"}`;
  if (d.kind === "link") return `Link: ${(d.title as string) || (d.url as string) || "link"}`;
  return `${node.type}:${node.id.slice(0, 6)}`;
}

function createLogEntry(
  projectId: string,
  projectName: string,
  action: ChangeLogEntry["action"],
  targetId: string,
  targetType: ChangeLogEntry["targetType"],
  targetName: string
): ChangeLogEntry {
  const { user, isAdmin } = getCurrentUser();
  return {
    id: nanoid(),
    user,
    isAdmin,
    action,
    targetId,
    targetType,
    targetName,
    projectId,
    projectName,
    timestamp: Date.now(),
  };
}

interface CanvasStore {
  projects: Project[];
  activeProjectId: string | null;
  mode: WorkspaceMode;
  globalStickies: GlobalSticky[];
  tabs: TabConfig[];
  hasCompletedSetup: boolean;

  createProject: (name?: string) => string;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  setActiveProject: (id: string | null) => void;
  setMode: (mode: WorkspaceMode) => void;

  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, data: Record<string, unknown>) => void;
  removeNode: (id: string) => void;
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  onNodesChange: (nodes: CanvasNode[]) => void;
  onEdgesChange: (edges: CanvasEdge[]) => void;

  // Document actions
  createDocument: (title?: string) => string;
  deleteDocument: (id: string) => void;
  renameDocument: (id: string, title: string) => void;
  setActiveDocument: (id: string | null) => void;
  updateDocumentContent: (id: string, content: unknown) => void;

  // Methodology actions
  setMethodologyPhase: (phase: DiamondPhase) => void;
  addMethodologyTask: (phase: DiamondPhase, text: string) => void;
  toggleMethodologyTask: (phase: DiamondPhase, taskId: string) => void;
  removeMethodologyTask: (phase: DiamondPhase, taskId: string) => void;
  setMethodologyNotes: (phase: DiamondPhase, notes: string) => void;

  // Global sticky actions
  addGlobalSticky: (sticky?: Partial<Omit<GlobalSticky, "id" | "createdAt">>) => string;
  updateGlobalSticky: (id: string, patch: Partial<Omit<GlobalSticky, "id" | "createdAt">>) => void;
  removeGlobalSticky: (id: string) => void;
  bringGlobalStickyToFront: (id: string) => void;

  // Snapshot actions (left panel)
  createSnapshot: (viewport: { x: number; y: number; zoom: number }, thumbnail?: string, name?: string) => string;
  deleteSnapshot: (id: string) => void;
  renameSnapshot: (id: string, name: string) => void;
  restoreSnapshot: (id: string) => { nodes: CanvasNode[]; edges: CanvasEdge[]; viewport: { x: number; y: number; zoom: number } } | null;

  // Change log (adds / deletes / moves)
  clearChangeLog: (projectId: string) => void;

  // Prototype (website / 3d / image concept)
  addPrototype: (kind: import("./types").PrototypeKind, name: string, src: string, type?: string) => string;
  deletePrototype: (id: string) => void;

  // Research
  addQA: (qa: Omit<QATranscription, "id" | "createdAt">) => string;
  deleteQA: (id: string) => void;
  addWebsiteResearch: (w: Omit<WebsiteResearch, "id" | "capturedAt">) => string;
  deleteWebsiteResearch: (id: string) => void;
  addFormResult: (f: Omit<FormResult, "id" | "submittedAt">) => string;
  deleteFormResult: (id: string) => void;

  // CAD
  addCADDrawing: (item: Omit<CADItem, "id" | "createdAt">) => string;
  deleteCADDrawing: (id: string) => void;

  // Modular tabs
  setTabs: (tabs: TabConfig[]) => void;
  toggleTab: (id: TabId, enabled: boolean) => void;
  reorderTabs: (orderedIds: TabId[]) => void;
  completeSetup: () => void;
  resetTabs: () => void;
}

const defaultProjectName = (count: number) => `Untitled Project ${count}`;

function createDefaultMethodology(): DoubleDiamondState {
  const phaseDefs: Record<
    DiamondPhase,
    { title: string; description: string }
  > = {
    discover: {
      title: "Discover",
      description:
        "Explore the problem space. Gather insights through research, interviews, and observation.",
    },
    define: {
      title: "Define",
      description:
        "Synthesize findings into a clear problem statement. Identify the key challenge to solve.",
    },
    develop: {
      title: "Develop",
      description:
        "Explore solutions through ideation, prototyping, and iteration. Test multiple approaches.",
    },
    deliver: {
      title: "Deliver",
      description:
        "Finalize and ship the solution. Document outcomes, measure impact, and gather feedback.",
    },
  };

  const phases = {} as Record<DiamondPhase, import("./types").MethodologyPhase>;
  for (const phase of Object.keys(phaseDefs) as DiamondPhase[]) {
    phases[phase] = {
      phase,
      title: phaseDefs[phase].title,
      description: phaseDefs[phase].description,
      tasks: [],
      notes: "",
    };
  }

  return { phases, currentPhase: "discover" };
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      mode: "canvas",
      globalStickies: [],
      tabs: JSON.parse(JSON.stringify(AVAILABLE_TABS)),
      hasCompletedSetup: false,

      createProject: (name) => {
        const id = nanoid();
        const docId = nanoid();
        const project: Project = {
          id,
          name: name ?? defaultProjectName(get().projects.length + 1),
          createdAt: Date.now(),
          nodes: [],
          edges: [],
          snapshots: [],
          prototypes: [],
          changeLog: [],
          research: { qa: [], websites: [], forms: [] },
          cadDrawings: [],
          documents: [
            {
              id: docId,
              title: "Untitled Report",
              content: null,
              updatedAt: Date.now(),
            },
          ],
          activeDocumentId: docId,
          methodology: createDefaultMethodology(),
        };
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: id,
          mode: "canvas",
        }));
        return id;
      },

      deleteProject: (id) =>
        set((state) => {
          const projects = state.projects.filter((p) => p.id !== id);
          const activeProjectId =
            state.activeProjectId === id
              ? (projects[0]?.id ?? null)
              : state.activeProjectId;
          return { projects, activeProjectId };
        }),

      renameProject: (id, name) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name } : p,
          ),
        })),

      setActiveProject: (id) => set({ activeProjectId: id }),

      setMode: (mode) => set({ mode }),

      addNode: (node) =>
        set((state) => {
          const active = state.projects.find((p) => p.id === state.activeProjectId);
          const entry = active
            ? createLogEntry(active.id, active.name, "add", node.id, node.type as ChangeLogEntry["targetType"], toTargetName(node))
            : null;
          return {
            projects: state.projects.map((p) =>
              p.id === state.activeProjectId
                ? {
                    ...p,
                    nodes: [...p.nodes, node],
                    changeLog: [...(p.changeLog ?? []), ...(entry ? [entry] : [])].slice(-100),
                  }
                : p,
            ),
          };
        }),

      updateNode: (id, data) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? {
                  ...p,
                  nodes: p.nodes.map((n) =>
                    n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
                  ),
                }
              : p,
          ),
        })),

      removeNode: (id) =>
        set((state) => {
          const active = state.projects.find((p) => p.id === state.activeProjectId);
          const target = active?.nodes.find((n) => n.id === id);
          const entry = active
            ? createLogEntry(active.id, active.name, "delete", id, (target?.type as ChangeLogEntry["targetType"]) ?? "unknown", toTargetName(target as CanvasNode))
            : null;
          return {
            projects: state.projects.map((p) =>
              p.id === state.activeProjectId
                ? {
                    ...p,
                    nodes: p.nodes.filter((n) => n.id !== id),
                    edges: p.edges.filter((e) => e.source !== id && e.target !== id),
                    changeLog: [...(p.changeLog ?? []), ...(entry ? [entry] : [])].slice(-100),
                  }
                : p,
            ),
          };
        }),

      setNodes: (nodes) =>
        set((state) => {
          const active = state.projects.find((p) => p.id === state.activeProjectId);
          const oldNodes = active?.nodes ?? [];
          const moved = active
            ? nodes.filter((n) => {
                const o = oldNodes.find((x) => x.id === n.id);
                return o && (o.position.x !== n.position.x || o.position.y !== n.position.y);
              })
            : [];
          const entries = active
            ? moved.map((n) => createLogEntry(active.id, active.name, "move", n.id, n.type as ChangeLogEntry["targetType"], toTargetName(n)))
            : [];
          return {
            projects: state.projects.map((p) =>
              p.id === state.activeProjectId ? { ...p, nodes, changeLog: [...(p.changeLog ?? []), ...entries].slice(-100) } : p,
            ),
          };
        }),

      setEdges: (edges) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, edges } : p,
          ),
        })),

      onNodesChange: (nodes) =>
        set((state) => {
          const active = state.projects.find((p) => p.id === state.activeProjectId);
          const oldNodes = active?.nodes ?? [];
          const moved = active
            ? nodes.filter((n) => {
                const o = oldNodes.find((x) => x.id === n.id);
                return o && (o.position.x !== n.position.x || o.position.y !== n.position.y);
              })
            : [];
          const entries = active
            ? moved.map((n) => createLogEntry(active.id, active.name, "move", n.id, n.type as ChangeLogEntry["targetType"], toTargetName(n)))
            : [];
          return {
            projects: state.projects.map((p) =>
              p.id === state.activeProjectId ? { ...p, nodes, changeLog: [...(p.changeLog ?? []), ...entries].slice(-100) } : p,
            ),
          };
        }),

      onEdgesChange: (edges) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, edges } : p,
          ),
        })),

      // ── Document actions ───────────────────────────────────────────

      createDocument: (title) => {
        const id = nanoid();
        const doc: Document = {
          id,
          title: title ?? "Untitled Document",
          content: null,
          updatedAt: Date.now(),
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? {
                  ...p,
                  documents: [...p.documents, doc],
                  activeDocumentId: id,
                }
              : p,
          ),
        }));
        return id;
      },

      deleteDocument: (id) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== state.activeProjectId) return p;
            const documents = p.documents.filter((d) => d.id !== id);
            const activeDocumentId =
              p.activeDocumentId === id
                ? (documents[0]?.id ?? null)
                : p.activeDocumentId;
            return { ...p, documents, activeDocumentId };
          }),
        })),

      renameDocument: (id, title) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? {
                  ...p,
                  documents: p.documents.map((d) =>
                    d.id === id ? { ...d, title, updatedAt: Date.now() } : d,
                  ),
                }
              : p,
          ),
        })),

      setActiveDocument: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, activeDocumentId: id }
              : p,
          ),
        })),

      updateDocumentContent: (id, content) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? {
                  ...p,
                  documents: p.documents.map((d) =>
                    d.id === id
                      ? { ...d, content, updatedAt: Date.now() }
                      : d,
                  ),
                }
              : p,
          ),
        })),

      // ── Methodology actions ────────────────────────────────────────

      setMethodologyPhase: (phase) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? {
                  ...p,
                  methodology: { ...p.methodology, currentPhase: phase },
                }
              : p,
          ),
        })),

      addMethodologyTask: (phase, text) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== state.activeProjectId) return p;
            const task: MethodologyTask = { id: nanoid(), text, done: false };
            return {
              ...p,
              methodology: {
                ...p.methodology,
                phases: {
                  ...p.methodology.phases,
                  [phase]: {
                    ...p.methodology.phases[phase],
                    tasks: [...p.methodology.phases[phase].tasks, task],
                  },
                },
              },
            };
          }),
        })),

      toggleMethodologyTask: (phase, taskId) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== state.activeProjectId) return p;
            return {
              ...p,
              methodology: {
                ...p.methodology,
                phases: {
                  ...p.methodology.phases,
                  [phase]: {
                    ...p.methodology.phases[phase],
                    tasks: p.methodology.phases[phase].tasks.map((t) =>
                      t.id === taskId ? { ...t, done: !t.done } : t,
                    ),
                  },
                },
              },
            };
          }),
        })),

      removeMethodologyTask: (phase, taskId) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== state.activeProjectId) return p;
            return {
              ...p,
              methodology: {
                ...p.methodology,
                phases: {
                  ...p.methodology.phases,
                  [phase]: {
                    ...p.methodology.phases[phase],
                    tasks: p.methodology.phases[phase].tasks.filter(
                      (t) => t.id !== taskId,
                    ),
                  },
                },
              },
            };
          }),
        })),

      setMethodologyNotes: (phase, notes) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== state.activeProjectId) return p;
            return {
              ...p,
              methodology: {
                ...p.methodology,
                phases: {
                  ...p.methodology.phases,
                  [phase]: { ...p.methodology.phases[phase], notes },
                },
              },
            };
          }),
        })),

      // ── Global sticky actions ────────────────────────────────────────

      addGlobalSticky: (overrides) => {
        const id = nanoid();
        const maxZ = get().globalStickies.reduce(
          (max, s) => Math.max(max, s.zIndex),
          0,
        );
        const sticky: GlobalSticky = {
          id,
          text: "",
          color: overrides?.color ?? "yellow",
          x: overrides?.x ?? 80,
          y: overrides?.y ?? 80,
          width: overrides?.width ?? 180,
          height: overrides?.height ?? 180,
          zIndex: maxZ + 1,
          createdAt: Date.now(),
        };
        set((state) => ({ globalStickies: [...state.globalStickies, sticky] }));
        return id;
      },

      updateGlobalSticky: (id, patch) =>
        set((state) => ({
          globalStickies: state.globalStickies.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        })),

      removeGlobalSticky: (id) =>
        set((state) => ({
          globalStickies: state.globalStickies.filter((s) => s.id !== id),
        })),

      bringGlobalStickyToFront: (id) =>
        set((state) => {
          const maxZ = state.globalStickies.reduce(
            (max, s) => Math.max(max, s.zIndex),
            0,
          );
          return {
            globalStickies: state.globalStickies.map((s) =>
              s.id === id ? { ...s, zIndex: maxZ + 1 } : s,
            ),
          };
        }),

      // ── Snapshot actions ───────────────────────────────────────────────
      createSnapshot: (viewport, thumbnail, name) => {
        const id = nanoid();
        const snap: CanvasSnapshot = {
          id,
          name: name ?? `Snapshot ${new Date().toLocaleTimeString()}`,
          createdAt: Date.now(),
          viewport: { ...viewport },
          nodes: JSON.parse(JSON.stringify(get().projects.find((p) => p.id === get().activeProjectId)?.nodes ?? [])),
          edges: JSON.parse(JSON.stringify(get().projects.find((p) => p.id === get().activeProjectId)?.edges ?? [])),
          thumbnail,
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, snapshots: [...(p.snapshots ?? []), snap] }
              : p,
          ),
        }));
        return id;
      },

      deleteSnapshot: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, snapshots: (p.snapshots ?? []).filter((s) => s.id !== id) }
              : p,
          ),
        })),

      renameSnapshot: (id, name) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, snapshots: (p.snapshots ?? []).map((s) => (s.id === id ? { ...s, name } : s)) }
              : p,
          ),
        })),

      restoreSnapshot: (id) => {
        const proj = get().projects.find((p) => p.id === get().activeProjectId);
        const snap = proj?.snapshots?.find((s) => s.id === id);
        if (!snap) return null;
        // Restore nodes/edges (viewport is handled by caller)
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, nodes: JSON.parse(JSON.stringify(snap.nodes)), edges: JSON.parse(JSON.stringify(snap.edges)) }
              : p,
          ),
        }));
        return { nodes: snap.nodes, edges: snap.edges, viewport: snap.viewport };
      },

      clearChangeLog: (projectId) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === projectId ? { ...p, changeLog: [] } : p)),
        })),

      addPrototype: (kind, name, src, type) => {
        const id = nanoid();
        const item: import("./types").PrototypeItem = { id, kind, name, src, type, createdAt: Date.now() };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, prototypes: [...(p.prototypes ?? []), item] } : p,
          ),
        }));
        return id;
      },

      deletePrototype: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, prototypes: (p.prototypes ?? []).filter((x) => x.id !== id) } : p,
          ),
        })),

      addQA: (qa: Omit<QATranscription, "id" | "createdAt">) => {
        const id = nanoid();
        const item: QATranscription = { ...qa, id, createdAt: Date.now() };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, research: { qa: [...(p.research?.qa ?? []), item], websites: p.research?.websites ?? [], forms: p.research?.forms ?? [] } } : p,
          ),
        }));
        return id;
      },
      deleteQA: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, research: { qa: (p.research?.qa ?? []).filter((x) => x.id !== id), websites: p.research?.websites ?? [], forms: p.research?.forms ?? [] } } : p,
          ),
        })),
      addWebsiteResearch: (w: Omit<WebsiteResearch, "id" | "capturedAt">) => {
        const id = nanoid();
        const item: WebsiteResearch = { ...w, id, capturedAt: Date.now() };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, research: { qa: p.research?.qa ?? [], websites: [...(p.research?.websites ?? []), item], forms: p.research?.forms ?? [] } } : p,
          ),
        }));
        return id;
      },
      deleteWebsiteResearch: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, research: { qa: p.research?.qa ?? [], websites: (p.research?.websites ?? []).filter((x) => x.id !== id), forms: p.research?.forms ?? [] } } : p,
          ),
        })),
      addFormResult: (f: Omit<FormResult, "id" | "submittedAt">) => {
        const id = nanoid();
        const item: FormResult = { ...f, id, submittedAt: Date.now() };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, research: { qa: p.research?.qa ?? [], websites: p.research?.websites ?? [], forms: [...(p.research?.forms ?? []), item] } } : p,
          ),
        }));
        return id;
      },
      deleteFormResult: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, research: { qa: p.research?.qa ?? [], websites: p.research?.websites ?? [], forms: (p.research?.forms ?? []).filter((x) => x.id !== id) } } : p,
          ),
        })),
      addCADDrawing: (item: Omit<CADItem, "id" | "createdAt">) => {
        const id = nanoid();
        const cad: CADItem = { ...item, id, createdAt: Date.now() };
        set((state) => ({
          projects: state.projects.map((p) => (p.id === state.activeProjectId ? { ...p, cadDrawings: [...(p.cadDrawings ?? []), cad] } : p)),
        }));
        return id;
      },
      deleteCADDrawing: (id) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === state.activeProjectId ? { ...p, cadDrawings: (p.cadDrawings ?? []).filter((x) => x.id !== id) } : p)),
        })),

      setTabs: (tabs) => set({ tabs: JSON.parse(JSON.stringify(tabs)) }),
      toggleTab: (id, enabled) =>
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, enabled } : t)),
          mode: !enabled && state.mode === id ? (state.tabs.find((t) => t.enabled && t.id !== id)?.id as typeof state.mode) || "canvas" : state.mode,
        })),
      reorderTabs: (orderedIds) =>
        set((state) => ({
          tabs: orderedIds.map((id, idx) => {
            const existing = state.tabs.find((t) => t.id === id);
            return existing ? { ...existing, order: idx } : ({ id, label: id, icon: "box", description: "", enabled: true, order: idx } as TabConfig);
          }),
        })),
      completeSetup: () => set({ hasCompletedSetup: true }),
      resetTabs: () => set({ tabs: JSON.parse(JSON.stringify(AVAILABLE_TABS)), hasCompletedSetup: false }),
    }),
    {
      name: "canvas-workspace",
      migrate: (persisted: unknown) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        const state = persisted as Record<string, unknown> & { projects?: unknown[]; tabs?: unknown; hasCompletedSetup?: unknown };
        if (!Array.isArray(state.projects)) return persisted;
        // Ensure tabs exist and have correct shape
        if (!Array.isArray(state.tabs)) {
          state.tabs = JSON.parse(JSON.stringify(AVAILABLE_TABS));
          state.hasCompletedSetup = false;
        } else {
          // Merge with AVAILABLE_TABS to add any new tabs
          const existing = state.tabs as TabConfig[];
          const merged = AVAILABLE_TABS.map((def) => {
            const found = existing.find((t) => t.id === def.id);
            // If screenplay is missing from persisted state, default it to enabled
            if (!found && def.id === "screenplay") {
              return { ...def, enabled: true };
            }
            return found ? { ...def, enabled: found.enabled, order: found.order } : def;
          });
          // Keep custom tabs
          for (const t of existing) {
            if (!merged.find((m) => m.id === t.id)) merged.push(t);
          }
          state.tabs = merged.sort((a, b) => (a as TabConfig).order - (b as TabConfig).order);
        }
        if (typeof state.hasCompletedSetup !== "boolean") state.hasCompletedSetup = false;
        // Ensure every project has documents, methodology, snapshots, changeLog, prototypes, research, cad
        state.projects = state.projects.map((p) => {
          if (!p || typeof p !== "object") return p;
          const project = p as Record<string, unknown>;
          if (!Array.isArray(project.documents)) {
            project.documents = [];
          }
          if (!project.methodology || typeof project.methodology !== "object") {
            project.methodology = createDefaultMethodology();
          }
          if (!Array.isArray(project.snapshots)) {
            project.snapshots = [];
          }
          if (!Array.isArray(project.changeLog)) {
            project.changeLog = [];
          }
          if (!Array.isArray(project.prototypes)) {
            project.prototypes = [];
          }
          if (!project.research || typeof project.research !== "object") {
            project.research = { qa: [], websites: [], forms: [] };
          } else {
            const r = project.research as Record<string, unknown>;
            if (!Array.isArray(r.qa)) r.qa = [];
            if (!Array.isArray(r.websites)) r.websites = [];
            if (!Array.isArray(r.forms)) r.forms = [];
          }
          if (!Array.isArray(project.cadDrawings)) {
            project.cadDrawings = [];
          }
          // migrate legacy viewerModel (single) to prototypes
          const vm = project.viewerModel as { name?: string; type?: string; src?: string; uploadedAt?: number } | undefined;
          if (vm && vm.src && Array.isArray(project.prototypes) && project.prototypes.length === 0) {
            const kind: string = vm.type?.startsWith("image/") ? "image" : "3d";
            project.prototypes = [
              {
                id: nanoid(),
                kind: kind as import("./types").PrototypeKind,
                name: vm.name || "Imported",
                src: vm.src,
                type: vm.type,
                createdAt: vm.uploadedAt || Date.now(),
              },
            ];
          }
          return project;
        });
        return persisted;
      },
      version: 6,
    },
  ),
);

// Helpers for creating new nodes

export function createStickyNode(
  position: { x: number; y: number },
  color: StickyColor = "yellow",
): CanvasNode {
  return {
    id: nanoid(),
    type: "sticky",
    position,
    data: { kind: "sticky", text: "", color },
  };
}

export function createImageNode(
  position: { x: number; y: number },
  src: string,
  label?: string,
): CanvasNode {
  return {
    id: nanoid(),
    type: "image",
    position,
    data: { kind: "image", src, label },
  };
}

export function createLinkNode(
  position: { x: number; y: number },
  url: string,
  title: string,
): CanvasNode {
  return {
    id: nanoid(),
    type: "link",
    position,
    data: { kind: "link", url, title },
  };
}
