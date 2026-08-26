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

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export type WorkspaceMode = "canvas" | "document" | "methodology" | "viewer";
