import { useCallback } from "react";
import { Button, Text, Separator } from "@glaze/core/components";
import { Camera, Trash2, Eye, Pencil } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useCanvasStore } from "../store";

export function CanvasSnapshots() {
  const project = useCanvasStore((s) =>
    s.projects.find((p) => p.id === s.activeProjectId)
  );
  const createSnapshot = useCanvasStore((s) => s.createSnapshot);
  const deleteSnapshot = useCanvasStore((s) => s.deleteSnapshot);
  const renameSnapshot = useCanvasStore((s) => s.renameSnapshot);
  const restoreSnapshot = useCanvasStore((s) => s.restoreSnapshot);
  const { getViewport, setViewport } = useReactFlow();

  const snapshots = project?.snapshots ?? [];

  const handleCapture = useCallback(async () => {
    const vp = getViewport(); // {x,y,zoom}
    // Try to capture thumbnail via canvas snapshot of the flow viewport
    let thumbnail: string | undefined;
    try {
      const flowEl = document.querySelector(".react-flow") as HTMLElement | null;
      if (flowEl) {
        // Use offscreen canvas to render a miniature preview of nodes
        // Fallback: create a tiny SVG thumbnail
        const nodes = project?.nodes ?? [];
        if (nodes.length > 0) {
          const canvas = document.createElement("canvas");
          canvas.width = 160;
          canvas.height = 100;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#f8f8f7";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw nodes as colored rects
            const bounds = nodes.reduce(
              (acc, n) => ({
                minX: Math.min(acc.minX, n.position.x),
                minY: Math.min(acc.minY, n.position.y),
                maxX: Math.max(acc.maxX, n.position.x + 160),
                maxY: Math.max(acc.maxY, n.position.y + 96),
              }),
              { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
            );
            const w = bounds.maxX - bounds.minX || 800;
            const h = bounds.maxY - bounds.minY || 600;
            const scale = Math.min(150 / w, 90 / h);
            const ox = 5 - bounds.minX * scale;
            const oy = 5 - bounds.minY * scale;
            ctx.strokeStyle = "#e8e8e6";
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 20) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, canvas.height);
              ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 20) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(canvas.width, y);
              ctx.stroke();
            }
            nodes.forEach((n) => {
              const x = n.position.x * scale + ox;
              const y = n.position.y * scale + oy;
              const rw = 160 * scale;
              const rh = 44 * scale;
              const col =
                n.data?.kind === "sticky"
                  ? n.data.color === "yellow"
                    ? "#fef08a"
                    : n.data.color === "pink"
                      ? "#fbcfe8"
                      : n.data.color === "blue"
                        ? "#bfdbfe"
                        : n.data.color === "green"
                          ? "#bbf7d0"
                          : "#ddd6fe"
                  : n.data?.kind === "image"
                    ? "#e5e5e3"
                    : "#e0e7ff";
              ctx.fillStyle = col;
              ctx.strokeStyle = "#e8e8e6";
              ctx.lineWidth = 1;
              ctx.beginPath();
              if ((ctx as unknown as { roundRect?: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect) {
                (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(x, y, rw, rh, 4);
              } else {
                ctx.rect(x, y, rw, rh);
              }
              ctx.fill();
              ctx.stroke();
            });
            thumbnail = canvas.toDataURL("image/png");
          }
        }
      }
    } catch {
      // ignore thumbnail errors
    }
    createSnapshot({ x: vp.x, y: vp.y, zoom: vp.zoom }, thumbnail);
  }, [getViewport, createSnapshot, project?.nodes]);

  const handleRestore = useCallback(
    (id: string) => {
      const res = restoreSnapshot(id);
      if (res) {
        setViewport(res.viewport, { duration: 400 });
      }
    },
    [restoreSnapshot, setViewport]
  );

  const handleRename = useCallback(
    (id: string, cur: string) => {
      const name = window.prompt("Rename snapshot:", cur);
      if (name && name.trim()) renameSnapshot(id, name.trim());
    },
    [renameSnapshot]
  );

  return (
    <div className="flex flex-col h-full w-[220px] shrink-0 border-r border-separator bg-sidebar">
      <div className="h-13 flex items-center justify-between px-3 border-b border-separator">
        <Text variant="small" color="tertiary" className="font-medium uppercase tracking-wide text-[11px]">
          Snapshots
        </Text>
        <Button iconOnly variant="glass" size="small" onClick={handleCapture} aria-label="Capture view">
          <Camera className="size-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {snapshots.length === 0 ? (
          <div className="p-4 text-center">
            <Text variant="small" color="tertiary">
              No snapshots yet
            </Text>
            <Text variant="mini" color="quaternary" className="mt-1 block">
              Click the camera to capture the current canvas view. It will be fixed here on the left.
            </Text>
          </div>
        ) : (
          snapshots.map((snap) => (
            <div
              key={snap.id}
              className="group rounded-lg border border-separator bg-popover overflow-hidden shadow-sm hover:border-secondary transition-colors"
            >
              <div
                className="h-20 bg-well border-b border-separator relative cursor-pointer overflow-hidden"
                onClick={() => handleRestore(snap.id)}
                title="Click to restore view"
              >
                {snap.thumbnail ? (
                  <img
                    src={snap.thumbnail}
                    alt={snap.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-tertiary text-[11px]">
                    {snap.nodes.length} items
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    iconOnly
                    variant="glass"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(snap.id);
                    }}
                    aria-label="Restore"
                  >
                    <Eye className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <div className="flex items-center justify-between gap-2">
                  <Text variant="small" truncate className="flex-1 font-medium">
                    {snap.name}
                  </Text>
                  <span className="text-[10px] text-quaternary shrink-0">
                    {snap.nodes.length} • {Math.round(snap.viewport.zoom * 100)}%
                  </span>
                </div>
                <Text variant="mini" color="quaternary" className="block">
                  {new Date(snap.createdAt).toLocaleTimeString()} • ({Math.round(snap.viewport.x)}, {Math.round(snap.viewport.y)})
                </Text>
                <Separator className="my-1.5" />
                <div className="flex gap-1">
                  <Button
                    variant="glass"
                    size="small"
                    className="flex-1"
                    onClick={() => handleRestore(snap.id)}
                  >
                    <Eye className="size-3" />
                    View
                  </Button>
                  <Button
                    iconOnly
                    variant="glass"
                    size="small"
                    onClick={() => handleRename(snap.id, snap.name)}
                    aria-label="Rename"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    iconOnly
                    variant="glass"
                    size="small"
                    onClick={() => deleteSnapshot(snap.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-separator">
        <Text variant="mini" color="quaternary" className="block text-center leading-[12px]">
          Snapshots are per project and sync to web
        </Text>
      </div>
    </div>
  );
}
