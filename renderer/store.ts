import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  CanvasEdge,
  CanvasNode,
  DiamondPhase,
  Document,
  DoubleDiamondState,
  MethodologyTask,
  Project,
  StickyColor,
  WorkspaceMode,
} from "./types";

interface CanvasStore {
  projects: Project[];
  activeProjectId: string | null;
  mode: WorkspaceMode;

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

      createProject: (name) => {
        const id = nanoid();
        const docId = nanoid();
        const project: Project = {
          id,
          name: name ?? defaultProjectName(get().projects.length + 1),
          createdAt: Date.now(),
          nodes: [],
          edges: [],
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
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, nodes: [...p.nodes, node] }
              : p,
          ),
        })),

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
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? {
                  ...p,
                  nodes: p.nodes.filter((n) => n.id !== id),
                  edges: p.edges.filter(
                    (e) => e.source !== id && e.target !== id,
                  ),
                }
              : p,
          ),
        })),

      setNodes: (nodes) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, nodes } : p,
          ),
        })),

      setEdges: (edges) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, edges } : p,
          ),
        })),

      onNodesChange: (nodes) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, nodes } : p,
          ),
        })),

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
    }),
    {
      name: "canvas-workspace",
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
