import type { Edge, Node } from "@xyflow/react";

export type StickyColor = "yellow" | "pink" | "blue" | "green" | "purple";

export interface ImageNodeData {
  kind: "image";
  src: string;
  label?: string;
  [key: string]: unknown;
}

export interface StickyNodeData {
  kind: "sticky";
  text: string;
  color: StickyColor;
  [key: string]: unknown;
}

export interface LinkNodeData {
  kind: "link";
  url: string;
  title: string;
  [key: string]: unknown;
}

export type CanvasNodeData = ImageNodeData | StickyNodeData | LinkNodeData;

export type CanvasNode = Node<CanvasNodeData>;
export type CanvasEdge = Edge;

// ── Document (rich text editor) ───────────────────────────────────────

export interface Document {
  id: string;
  title: string;
  /** Tiptap JSON content */
  content: unknown;
  updatedAt: number;
}

// ── Double Diamond Methodology ────────────────────────────────────────

export type DiamondPhase = "discover" | "define" | "develop" | "deliver";

export interface MethodologyTask {
  id: string;
  text: string;
  done: boolean;
}

export interface MethodologyPhase {
  phase: DiamondPhase;
  title: string;
  description: string;
  tasks: MethodologyTask[];
  notes: string;
}

export interface DoubleDiamondState {
  phases: Record<DiamondPhase, MethodologyPhase>;
  currentPhase: DiamondPhase;
}

// ── Project ───────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  documents: Document[];
  activeDocumentId: string | null;
  methodology: DoubleDiamondState;
}

export type WorkspaceMode = "canvas" | "document" | "methodology" | "viewer";
