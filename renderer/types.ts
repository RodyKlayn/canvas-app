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

// ── Canvas Snapshot (view capture fixed on left) ───────────────────────

export interface CanvasSnapshot {
  id: string;
  name: string;
  createdAt: number;
  /** viewport at capture time */
  viewport: { x: number; y: number; zoom: number };
  /** shallow copy of nodes/edges at capture time */
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  /** optional dataURL thumbnail */
  thumbnail?: string;
}

// ── Prototype (website / 3D product / image concept) ─────────────────

export type PrototypeKind = "website" | "3d" | "image";

export interface PrototypeItem {
  id: string;
  kind: PrototypeKind;
  name: string;
  src: string;
  type?: string;
  createdAt: number;
}

// ── Research (Q&A, website, forms) ───────────────────────────────────

export interface QATranscription {
  id: string;
  question: string;
  answer: string;
  speaker?: string;
  createdAt: number;
}

export interface WebsiteResearch {
  id: string;
  url: string;
  title: string;
  notes: string;
  capturedAt: number;
}

export interface FormResult {
  id: string;
  formTitle: string;
  responses: { question: string; answer: string }[];
  submittedAt: number;
}

export interface ResearchState {
  qa: QATranscription[];
  websites: WebsiteResearch[];
  forms: FormResult[];
}

// ── CAD (drawings + viewer) ───────────────────────────────────────────

export interface CADItem {
  id: string;
  name: string;
  src: string;
  type: string;
  width?: number;
  height?: number;
  createdAt: number;
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
  snapshots?: CanvasSnapshot[];
  changeLog?: ChangeLogEntry[];
  prototypes?: PrototypeItem[];
  research?: ResearchState;
  cadDrawings?: CADItem[];
  // legacy single viewerModel for migration
  viewerModel?: { name: string; type: string; src: string; uploadedAt: number };
}

// ── Global Sticky Notes (floating over all tabs) ──────────────────────

export interface GlobalSticky {
  id: string;
  text: string;
  color: StickyColor;
  /** position relative to the window content area (px) */
  x: number;
  y: number;
  /** size in px */
  width: number;
  height: number;
  zIndex: number;
  createdAt: number;
}

// ── Change Log (adds / deletes / moves only) ────────────────────────

export type ChangeAction = "add" | "delete" | "move";

export interface ChangeLogEntry {
  id: string;
  user: string;
  isAdmin: boolean;
  action: ChangeAction;
  targetId: string;
  targetType: CanvasNode["type"] | "global-sticky" | "unknown";
  targetName: string;
  projectId: string;
  projectName: string;
  timestamp: number;
}

export type WorkspaceMode = "canvas" | "document" | "methodology" | "viewer" | "log" | "cad" | "research" | "screenplay";

export type TabId = WorkspaceMode | "prototype";

export interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
  description: string;
  enabled: boolean;
  order: number;
}

export const AVAILABLE_TABS: TabConfig[] = [
  { id: "canvas", label: "Canvas", icon: "layout-grid", description: "Infinite visual canvas for moodboarding", enabled: true, order: 0 },
  { id: "document", label: "Documents", icon: "file-text", description: "Rich text editing for documentation", enabled: true, order: 1 },
  { id: "methodology", label: "Method", icon: "compass", description: "Double Diamond methodology templates", enabled: true, order: 2 },
  { id: "viewer", label: "Prototype", icon: "box", description: "Website, 3D and image prototypes", enabled: true, order: 3 },
  { id: "screenplay", label: "Screenplay", icon: "film", description: "Minimalist screenplay editor with auto Fountain syntax", enabled: true, order: 4 },
  { id: "log", label: "Activity", icon: "history", description: "Log of adds, deletes and moves", enabled: false, order: 5 },
  { id: "cad", label: "CAD", icon: "ruler", description: "CAD tools and 2D technical drawings", enabled: false, order: 6 },
  { id: "research", label: "Research", icon: "search", description: "Research and reference library", enabled: false, order: 7 },
];

export type WorkspaceModeWithCustom = WorkspaceMode | TabId;
