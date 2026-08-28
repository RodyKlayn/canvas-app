import { useCallback, useMemo, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { nodeTypes } from "./canvas-nodes";
import { CanvasSnapshots } from "./canvas-snapshots";
import { useCanvasStore } from "../store";
import type { CanvasEdge, CanvasNode, StickyColor } from "../types";

function CanvasInner() {
  const activeProjectId = useCanvasStore((s) => s.activeProjectId);
  const project = useCanvasStore((s) =>
    s.projects.find((p) => p.id === s.activeProjectId),
  );
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const addNode = useCanvasStore((s) => s.addNode);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useMemo(() => project?.nodes ?? [], [project]);
  const edges = useMemo(() => project?.edges ?? [], [project]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!project) return;
      const updated = applyNodeChanges(changes, project.nodes) as CanvasNode[];
      setNodes(updated);
    },
    [project, setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!project) return;
      const updated = applyEdgeChanges(changes, project.edges) as CanvasEdge[];
      setEdges(updated);
    },
    [project, setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!project) return;
      const updated = addEdge(
        { ...connection, id: nanoid() },
        project.edges,
      ) as CanvasEdge[];
      setEdges(updated);
    },
    [project, setEdges],
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!activeProjectId) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Image drop (from file or dragged from web)
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              addNode({
                id: nanoid(),
                type: "image",
                position: { x: position.x, y: position.y },
                data: { kind: "image", src, label: file.name },
              });
            };
            reader.readAsDataURL(file);
          }
        }
        return;
      }

      // HTML drag (from web — images or links)
      const html = event.dataTransfer.getData("text/html");
      const text = event.dataTransfer.getData("text/plain");
      const uri = event.dataTransfer.getData("text/uri-list");

      if (html) {
        // Try to extract an image from the HTML
        const imgMatch = html.match(/<img[^>]+src="([^"]+)"/);
        if (imgMatch) {
          addNode({
            id: nanoid(),
            type: "image",
            position,
            data: { kind: "image", src: imgMatch[1], label: "Image" },
          });
          return;
        }
      }

      if (uri || (text && /^https?:\/\//.test(text))) {
        const url = uri || text;
        addNode({
          id: nanoid(),
          type: "link",
          position,
          data: { kind: "link", url, title: url },
        });
        return;
      }

      // Plain text → sticky note with the text pre-filled
      if (text) {
        addNode({
          id: nanoid(),
          type: "sticky",
          position,
          data: { kind: "sticky", text, color: "yellow" as StickyColor },
        });
        return;
      }
    },
    [activeProjectId, screenToFlowPosition, addNode],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  return (
    <div className="w-full h-full flex">
      <CanvasSnapshots />
      <div
        ref={reactFlowWrapper}
        className="flex-1 h-full"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          className="bg-transparent"
        >
          <Background gap={20} size={1} />
          <Controls
            className="!bg-popover !border !border-separator !rounded-lg !shadow-sm"
            showInteractive={false}
          />
          <MiniMap
            className="!bg-popover !border !border-separator !rounded-lg !shadow-sm"
            nodeColor="#007aff"
            maskColor="rgb(0 0 0 / 0.05)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export function InfiniteCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
