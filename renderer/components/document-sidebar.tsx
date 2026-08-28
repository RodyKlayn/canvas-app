import { useEffect, useState } from "react";
import { Button, Text } from "@glaze/core/components";
import { FileText, Plus, Trash2, Pencil, Share2, Copy, Download, Files } from "lucide-react";
import { useCanvasStore } from "../store";
import type { Document } from "../types";

export function DocumentSidebar() {
  const project = useCanvasStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const createDocument = useCanvasStore((s) => s.createDocument);
  const deleteDocument = useCanvasStore((s) => s.deleteDocument);
  const setActiveDocument = useCanvasStore((s) => s.setActiveDocument);
  const renameDocument = useCanvasStore((s) => s.renameDocument);

  const docs = project?.documents ?? [];
  const activeId = project?.activeDocumentId ?? null;

  const [menu, setMenu] = useState<{ x: number; y: number; doc: Document } | null>(null);

  useEffect(() => {
    const close = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-doc-menu]")) return;
      setMenu(null);
    };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
    };
  }, []);

  const handleAction = async (doc: Document, action: string) => {
    setMenu(null);
    if (action === "rename") {
      const name = window.prompt("Rename text file:", doc.title);
      console.log('[native doc rename]', name, doc.title);
      if (name && name.trim()) {
        const newName = name.trim();
        console.log('[native doc rename] to', newName);
        renameDocument(doc.id, newName);
      } else { console.log('[native doc rename] cancelled'); }
    } else if (action === "duplicate") {
      const newTitle = doc.title + " Copy";
      const newId = createDocument(newTitle);
      const st = useCanvasStore.getState();
      const proj = st.projects.find((p) => p.id === st.activeProjectId);
      const created = proj?.documents.find((d) => d.id === newId);
      if (created && proj) {
        useCanvasStore.setState({
          projects: st.projects.map((p) =>
            p.id === st.activeProjectId
              ? {
                  ...p,
                  documents: p.documents.map((d) => (d.id === newId ? { ...d, content: JSON.parse(JSON.stringify(doc.content)), title: newTitle } : d)),
                }
              : p
          ),
        });
      }
    } else if (action === "copy_link") {
      const link = `${window.location.origin}${window.location.pathname}?project=${project?.id}&doc=${doc.id}`;
      try {
        await navigator.clipboard.writeText(link);
      } catch {}
      window.alert(`Link copied:\n${link}`);
    } else if (action === "copy_content") {
      const text = typeof doc.content === "string" ? doc.content : JSON.stringify(doc.content, null, 2);
      try {
        await navigator.clipboard.writeText(text || doc.title);
        window.alert("Content copied to clipboard");
      } catch {
        window.prompt("Copy content:", text?.slice(0, 4000) || doc.title);
      }
    } else if (action === "export") {
      const data = JSON.stringify(doc, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title.replace(/[^a-z0-9]/gi, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else if (action === "delete") {
      if (window.confirm(`Delete "${doc.title}"?`)) deleteDocument(doc.id);
    }
  };

  return (
    <div className="w-[240px] shrink-0 border-r border-separator bg-sidebar flex flex-col">
      <div className="h-12 flex items-center justify-between px-3 border-b border-separator">
        <Text variant="small" color="tertiary" className="uppercase tracking-wide text-[11px] font-medium">
          Documents
        </Text>
        <span className="text-[11px] text-quaternary">{docs.length}</span>
      </div>

      <div className="p-2">
        <Button variant="accent" size="small" className="w-full" onClick={() => createDocument()} aria-label="Create new text file" title="Create new text file">
          <Plus className="size-3.5" />
          New text file
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {docs.length === 0 ? (
          <div className="p-4 text-center">
            <Text variant="small" color="tertiary">
              No documents
            </Text>
            <Text variant="mini" color="quaternary" className="mt-1 block">
              Create a text file to start writing.
            </Text>
          </div>
        ) : (
          docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDocument(doc.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenu({ x: e.clientX, y: e.clientY, doc });
              }}
              className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer border transition-colors ${
                activeId === doc.id
                  ? "bg-popover border-separator shadow-sm"
                  : "border-transparent hover:bg-list-hover"
              }`}
              title={doc.title}
            >
              <FileText className={`size-4 shrink-0 ${activeId === doc.id ? "text-accent" : "text-tertiary"}`} />
              <div className="flex-1 min-w-0">
                <Text variant="small" truncate className={`font-medium ${activeId === doc.id ? "text-primary" : ""}`}>
                  {doc.title || "Untitled"}
                </Text>
                <Text variant="mini" color="quaternary" truncate>
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </Text>
              </div>
              {activeId === doc.id && (
                <div className="size-2 rounded-full bg-accent shrink-0" title="Current file" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${doc.title}"?`)) deleteDocument(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-control text-tertiary hover:text-red transition-all"
                aria-label={`Delete ${doc.title}`}
                title="Delete text file"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-separator">
        <Text variant="mini" color="quaternary" className="block text-center leading-[12px]">
          Click to navigate • Right-click for menu • {docs.length} files
        </Text>
      </div>

      {menu && (
        <div
          data-doc-menu
          className="fixed z-50 min-w-[200px] rounded-lg border border-separator bg-popover shadow-lg py-1"
          style={{ left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="px-3 py-1.5 border-b border-separator">
            <Text variant="small" className="font-medium" truncate>
              {menu.doc.title}
            </Text>
            <Text variant="mini" color="tertiary">
              {new Date(menu.doc.updatedAt).toLocaleDateString()}
            </Text>
          </div>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(menu.doc, "rename");
            }}
          >
            <Pencil className="size-3.5" />
            Rename
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(menu.doc, "duplicate");
            }}
          >
            <Files className="size-3.5" />
            Duplicate
          </button>
          <div className="h-px bg-separator my-1" />
          <div className="px-3 py-1">
            <Text variant="mini" color="tertiary" className="uppercase tracking-wide font-medium">
              Share
            </Text>
          </div>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(menu.doc, "copy_link");
            }}
          >
            <Share2 className="size-3.5" />
            Copy Link
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(menu.doc, "copy_content");
            }}
          >
            <Copy className="size-3.5" />
            Copy Content
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(menu.doc, "export");
            }}
          >
            <Download className="size-3.5" />
            Export File…
          </button>
          <div className="h-px bg-separator my-1" />
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left text-red hover:text-red"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(menu.doc, "delete");
            }}
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
