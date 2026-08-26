import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type FocusEvent as ReactFocusEvent,
} from "react";
import { X, GripIcon } from "lucide-react";
import { useCanvasStore } from "../store";
import type { GlobalSticky, StickyColor } from "../types";

const stickyColors: Record<StickyColor, string> = {
  yellow:
    "bg-yellow-200/90 dark:bg-yellow-300/20 border-yellow-300/70 dark:border-yellow-400/30",
  pink: "bg-pink-200/90 dark:bg-pink-300/20 border-pink-300/70 dark:border-pink-400/30",
  blue: "bg-blue-200/90 dark:bg-blue-300/20 border-blue-300/70 dark:border-blue-400/30",
  green:
    "bg-green-200/90 dark:bg-green-300/20 border-green-300/70 dark:border-green-400/30",
  purple:
    "bg-purple-200/90 dark:bg-purple-300/20 border-purple-300/70 dark:border-purple-400/30",
};

const stickyTextColors: Record<StickyColor, string> = {
  yellow: "text-yellow-950 dark:text-yellow-100",
  pink: "text-pink-950 dark:text-pink-100",
  blue: "text-blue-950 dark:text-blue-100",
  green: "text-green-950 dark:text-green-100",
  purple: "text-purple-950 dark:text-purple-100",
};

const colorDotColors: Record<StickyColor, string> = {
  yellow: "bg-yellow-400",
  pink: "bg-pink-400",
  blue: "bg-blue-400",
  green: "bg-green-400",
  purple: "bg-purple-400",
};

const colorOptions: StickyColor[] = ["yellow", "pink", "blue", "green", "purple"];

interface DragState {
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

function GlobalStickyCard({ sticky }: { sticky: GlobalSticky }) {
  const updateGlobalSticky = useCanvasStore((s) => s.updateGlobalSticky);
  const removeGlobalSticky = useCanvasStore((s) => s.removeGlobalSticky);
  const bringToFront = useCanvasStore((s) => s.bringGlobalStickyToFront);

  const [editing, setEditing] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);

  const colorClass = stickyColors[sticky.color] ?? stickyColors.yellow;
  const textClass = stickyTextColors[sticky.color] ?? stickyTextColors.yellow;

  // ── Dragging ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      // Don't drag when clicking inside the textarea or buttons
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.closest("button")
      )
        return;

      e.preventDefault();
      bringToFront(sticky.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: sticky.x,
        origY: sticky.y,
      };
      setDragging(true);
    },
    [sticky.id, sticky.x, sticky.y, bringToFront],
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      updateGlobalSticky(sticky.id, {
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    };

    const handleUp = () => {
      dragRef.current = null;
      setDragging(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, sticky.id, updateGlobalSticky]);

  // ── Text editing ──────────────────────────────────────────────────────

  const handleTextBlur = useCallback(
    (e: ReactKeyboardEvent<HTMLTextAreaElement> | ReactFocusEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      updateGlobalSticky(sticky.id, { text: target.value });
      setEditing(false);
    },
    [sticky.id, updateGlobalSticky],
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        (e.target as HTMLTextAreaElement).blur();
      }
      // Prevent keyboard shortcuts from reaching the canvas/editor below
      e.stopPropagation();
    },
    [],
  );

  // ── Color change ──────────────────────────────────────────────────────

  const handleColorChange = useCallback(
    (color: StickyColor) => {
      updateGlobalSticky(sticky.id, { color });
      setShowColors(false);
    },
    [sticky.id, updateGlobalSticky],
  );

  return (
    <div
      className={`global-sticky absolute rounded-lg border shadow-md select-none ${colorClass}`}
      style={{
        left: sticky.x,
        top: sticky.y,
        width: sticky.width,
        height: sticky.height,
        zIndex: sticky.zIndex,
        cursor: dragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleDragStart}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-2 pt-1.5 pb-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <GripIcon className={`size-3 ${textClass} opacity-40`} />
          {showColors ? (
            <div className="flex items-center gap-1 ml-1">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  className={`w-3 h-3 rounded-full border border-black/10 ${colorDotColors[c]} ${sticky.color === c ? "ring-1 ring-accent ring-offset-1" : ""}`}
                  aria-label={`Set color ${c}`}
                />
              ))}
            </div>
          ) : (
            <button
              onClick={() => setShowColors(true)}
              className={`w-3 h-3 rounded-full border border-black/10 ${colorDotColors[sticky.color]} hover:scale-110 transition-transform`}
              aria-label="Change color"
            />
          )}
        </div>
        <button
          onClick={() => removeGlobalSticky(sticky.id)}
          className={`p-0.5 rounded ${textClass} opacity-40 hover:opacity-100 transition-opacity`}
          aria-label="Delete sticky note"
        >
          <X className="size-3" />
        </button>
      </div>

      {/* Text area */}
      {editing ? (
        <textarea
          autoFocus
          defaultValue={sticky.text}
          onBlur={handleTextBlur}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Type your note..."
          className={`w-full h-[calc(100%-2.25rem)] px-2 pb-2 bg-transparent resize-none focus:outline-none text-regular leading-relaxed ${textClass} placeholder:opacity-40`}
        />
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`w-full h-[calc(100%-2.25rem)] px-2 pb-2 overflow-hidden whitespace-pre-wrap break-words text-regular leading-relaxed cursor-text ${textClass} ${!sticky.text ? "opacity-40" : ""}`}
        >
          {sticky.text || "Click to edit..."}
        </div>
      )}
    </div>
  );
}

export function GlobalStickyLayer() {
  const globalStickies = useCanvasStore((s) => s.globalStickies);

  if (globalStickies.length === 0) return null;

  return (
    <div className="global-sticky-layer pointer-events-none absolute inset-0 z-50">
      {globalStickies.map((s) => (
        <div key={s.id} className="pointer-events-auto">
          <GlobalStickyCard sticky={s} />
        </div>
      ))}
    </div>
  );
}
