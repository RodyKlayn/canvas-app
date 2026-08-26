import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  CanvasEdge,
  CanvasNode,
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
}

const defaultProjectName = (count: number) => `Untitled Project ${count}`;

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      mode: "canvas",

      createProject: (name) => {
        const id = nanoid();
        const project: Project = {
          id,
          name: name ?? defaultProjectName(get().projects.length + 1),
          createdAt: Date.now(),
          nodes: [],
          edges: [],
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
