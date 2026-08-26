import { memo, useCallback, useState, type FocusEvent } from "react";
import {
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import { ExternalLink, X } from "lucide-react";
import { Text } from "@glaze/core/components";
import type {
  ImageNodeData,
  LinkNodeData,
  StickyColor,
  StickyNodeData,
} from "../types";
import { useCanvasStore } from "../store";

const stickyColors: Record<StickyColor, string> = {
  yellow:
    "bg-yellow-200/80 dark:bg-yellow-300/15 border-yellow-300/60 dark:border-yellow-400/25",
  pink: "bg-pink-200/80 dark:bg-pink-300/15 border-pink-300/60 dark:border-pink-400/25",
  blue: "bg-blue-200/80 dark:bg-blue-300/15 border-blue-300/60 dark:border-blue-400/25",
  green:
    "bg-green-200/80 dark:bg-green-300/15 border-green-300/60 dark:border-green-400/25",
  purple:
    "bg-purple-200/80 dark:bg-purple-300/15 border-purple-300/60 dark:border-purple-400/25",
};

const stickyTextColors: Record<StickyColor, string> = {
  yellow: "text-yellow-950 dark:text-yellow-100",
  pink: "text-pink-950 dark:text-pink-100",
  blue: "text-blue-950 dark:text-blue-100",
  green: "text-green-950 dark:text-green-100",
  purple: "text-purple-950 dark:text-purple-100",
};

// ── Sticky Note Node ──────────────────────────────────────────────────

function StickyNodeComponent({
  id,
  data,
  selected,
}: NodeProps<Node<StickyNodeData>>) {
  const [editing, setEditing] = useState(false);
  const removeNode = useCanvasStore((s) => s.removeNode);
  const updateNode = useCanvasStore((s) => s.updateNode);

  const color = data.color ?? "yellow";
  const colorClass = stickyColors[color] ?? stickyColors.yellow;
  const textClass = stickyTextColors[color] ?? stickyTextColors.yellow;

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLTextAreaElement>) => {
      updateNode(id, { text: e.target.value });
      setEditing(false);
    },
    [id, updateNode],
  );

  return (
    <div
      className={`relative w-44 h-44 rounded-lg border shadow-sm transition-shadow ${colorClass} ${selected ? "ring-2 ring-accent shadow-md" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-1 !h-1"
      />
      <div className="flex items-start justify-between px-2 pt-1.5">
        <span className={`text-mini font-medium ${textClass} opacity-60`}>
          Note
        </span>
        <button
          onClick={() => removeNode(id)}
          className={`p-0.5 rounded ${textClass} opacity-40 hover:opacity-100 transition-opacity`}
        >
          <X className="size-3" />
        </button>
      </div>
      {editing ? (
        <textarea
          autoFocus
          defaultValue={data.text}
          onBlur={handleBlur}
          placeholder="Type your note..."
          className={`w-full h-[calc(100%-2rem)] px-2 pb-2 bg-transparent resize-none focus:outline-none text-regular ${textClass} placeholder:opacity-40`}
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          className={`w-full h-[calc(100%-2rem)] px-2 pb-2 cursor-text overflow-hidden whitespace-pre-wrap break-words text-regular ${textClass} ${!data.text ? "opacity-40" : ""}`}
        >
          {data.text || "Double-click to edit..."}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-1 !h-1"
      />
    </div>
  );
}

// ── Image Node ────────────────────────────────────────────────────────

function ImageNodeComponent({
  id,
  data,
  selected,
}: NodeProps<Node<ImageNodeData>>) {
  const removeNode = useCanvasStore((s) => s.removeNode);

  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-separator bg-control-subtle transition-shadow ${selected ? "ring-2 ring-accent shadow-md" : "shadow-sm"}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-1 !h-1"
      />
      <div className="relative group">
        <img
          src={data.src}
          alt={data.label ?? ""}
          draggable={false}
          className="w-56 h-40 object-cover"
        />
        <button
          onClick={() => removeNode(id)}
          className="absolute top-1 right-1 p-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="size-3" />
        </button>
      </div>
      {data.label ? (
        <div className="px-2 py-1.5">
          <Text variant="small" color="secondary" truncate>
            {data.label}
          </Text>
        </div>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-1 !h-1"
      />
    </div>
  );
}

// ── Link Node ─────────────────────────────────────────────────────────

function LinkNodeComponent({
  id,
  data,
  selected,
}: NodeProps<Node<LinkNodeData>>) {
  const removeNode = useCanvasStore((s) => s.removeNode);

  const handleClick = useCallback(() => {
    if (data.url) {
      window.glazeAPI?.glaze?.ipc?.invoke("shell:openExternal", data.url);
    }
  }, [data.url]);

  return (
    <div
      className={`relative w-56 rounded-lg border border-separator bg-control-subtle p-3 transition-shadow ${selected ? "ring-2 ring-accent shadow-md" : "shadow-sm"}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-1 !h-1"
      />
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 text-left min-w-0 flex-1"
        >
          <ExternalLink className="size-4 shrink-0 text-accent" />
          <span className="min-w-0">
            <Text variant="strong" color="link" truncate>
              {data.title || "Untitled link"}
            </Text>
            <Text variant="small" color="tertiary" truncate>
              {data.url}
            </Text>
          </span>
        </button>
        <button
          onClick={() => removeNode(id)}
          className="p-0.5 rounded text-tertiary opacity-40 hover:opacity-100 transition-opacity shrink-0"
        >
          <X className="size-3" />
        </button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-1 !h-1"
      />
    </div>
  );
}

// ── Exported node types map ───────────────────────────────────────────

export const nodeTypes = {
  sticky: memo(StickyNodeComponent),
  image: memo(ImageNodeComponent),
  link: memo(LinkNodeComponent),
} as const;
