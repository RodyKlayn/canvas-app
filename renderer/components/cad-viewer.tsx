import { useRef, useState } from "react";
import { Button, EmptyState, Text } from "@glaze/core/components";
import { Ruler, Trash2, ZoomIn, ZoomOut, RotateCcw, Upload, Download, Edit3, Save, Layers } from "lucide-react";
import { useCanvasStore } from "../store";

export function CADViewer() {
  const project = useCanvasStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const addCAD = useCanvasStore((s) => s.addCADDrawing);
  const deleteCAD = useCanvasStore((s) => s.deleteCADDrawing);
  const updateCAD = useCanvasStore((s) => s.updateCADDrawing || ((id: string, patch: Partial<any>) => {}));
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const drawings = project?.cadDrawings ?? [];
  const selected = drawings.find((d) => d.id === selectedId) ?? drawings[0] ?? null;

  const handleUpload = () => fileRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      addCAD({ name: file.name, src, type: file.type || "image/" + file.name.split(".").pop(), width: 800, height: 600 });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDownload = () => {
    if (!selected) return;
    const a = document.createElement("a");
    a.href = selected.src;
    a.download = selected.name || "cad_drawing.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSaveEdit = () => {
    if (!selected || !editName.trim()) return;
    // update name or properties
    if (typeof updateCAD === "function") {
      updateCAD(selected.id, { name: editName.trim() });
    } else {
      selected.name = editName.trim();
    }
    setIsEditing(false);
  };

  return (
    <div className="h-full flex bg-app">
      {/* Lateral list */}
      <div className="w-[260px] shrink-0 border-r border-separator bg-sidebar flex flex-col">
        <div className="h-12 flex items-center justify-between px-3 border-b border-separator">
          <Text variant="small" color="tertiary" className="uppercase tracking-wide text-[11px] font-medium">
            CAD Drawings & Plans
          </Text>
          <span className="text-[11px] text-quaternary">{drawings.length}</span>
        </div>
        <div className="p-2">
          <Button variant="accent" size="small" className="w-full" onClick={handleUpload}>
            <Upload className="size-3.5" />
            Add CAD drawing
          </Button>
          <input ref={fileRef} type="file" accept=".dxf,.dwg,.pdf,.png,.jpg,.jpeg,.svg,.webp" className="hidden" onChange={handleFile} />
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {drawings.length === 0 ? (
            <div className="p-4 text-center">
              <Text variant="small" color="tertiary">
                No CAD drawings
              </Text>
              <Text variant="mini" color="quaternary" className="mt-1 block">
                Upload .DXF, .DWG, .PDF or images
              </Text>
            </div>
          ) : (
            drawings.map((d) => (
              <div
                key={d.id}
                onClick={() => {
                  setSelectedId(d.id);
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                  setIsEditing(false);
                }}
                className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer border transition-colors ${
                  selected?.id === d.id ? "bg-popover border-separator shadow-sm" : "border-transparent hover:bg-list-hover"
                }`}
              >
                <div className="size-10 rounded bg-well border border-separator overflow-hidden shrink-0 grid place-items-center">
                  {d.type.startsWith("image/") || d.src.startsWith("data:image") ? (
                    <img src={d.src} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <Ruler className="size-4 text-tertiary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Text variant="small" truncate className="font-medium">
                    {d.name}
                  </Text>
                  <Text variant="mini" color="quaternary" truncate>
                    {d.type || "cad"} • {new Date(d.createdAt).toLocaleDateString()}
                  </Text>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${d.name}"?`)) {
                      deleteCAD(d.id);
                      if (selectedId === d.id) setSelectedId(null);
                    }
                  }}
                  aria-label={`Delete drawing ${d.name}`}
                  className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-control text-tertiary hover:text-red transition-all cursor-pointer flex items-center gap-1"
                  title="Delete drawing"
                >
                  <Trash2 className="size-4" />
                  <span className="text-[10px] hidden sm:inline">Delete</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Viewer & Edit Tools */}
      <div className="flex-1 flex flex-col min-w-0 bg-well">
        {!selected ? (
          <div className="flex-1 grid place-items-center p-8">
            <EmptyState
              placement="center"
              title="No CAD drawing selected"
              description="Upload a CAD drawing from the left and click to visualize, inspect dimensions, or save files."
            />
          </div>
        ) : (
          <>
            <div className="h-12 flex items-center justify-between px-3 border-b border-separator bg-popover gap-2">
              <div className="min-w-0 flex-1 flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1 border border-separator rounded text-xs bg-well w-60 outline-none"
                      autoFocus
                    />
                    <Button variant="accent" size="small" onClick={handleSaveEdit}>
                      <Save className="size-3.5" /> Save
                    </Button>
                    <Button variant="glass" size="small" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <Text variant="small" className="font-medium flex items-center gap-1.5" truncate>
                        {selected.name}
                        <button
                          onClick={() => { setEditName(selected.name); setIsEditing(true); }}
                          className="p-1 text-tertiary hover:text-primary transition-colors"
                          title="Edit name"
                        >
                          <Edit3 className="size-3" />
                        </button>
                      </Text>
                      <Text variant="mini" color="quaternary">
                        {selected.type} • {Math.round(selected.src.length / 1024)} KB • Dimensions: {selected.width || 800}×{selected.height || 600}px
                      </Text>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="glass" size="small" iconOnly onClick={() => setZoom((z) => Math.max(0.5, z * 0.8))} title="Zoom out">
                  <ZoomOut className="size-3.5" />
                </Button>
                <Text variant="mini" color="tertiary" className="w-12 text-center">
                  {Math.round(zoom * 100)}%
                </Text>
                <Button variant="glass" size="small" iconOnly onClick={() => setZoom((z) => Math.min(3, z * 1.25))} title="Zoom in">
                  <ZoomIn className="size-3.5" />
                </Button>
                <Button variant="glass" size="small" iconOnly onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset view">
                  <RotateCcw className="size-3.5" />
                </Button>
                <div className="h-4 w-[1px] bg-separator mx-1" />
                <Button variant="glass" size="small" onClick={handleDownload} title="Save / Download File">
                  <Download className="size-3.5" />
                  Save File
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative bg-[radial-gradient(circle,#e5e5e5_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#333_1px,transparent_1px)] bg-[length:20px_20px] p-4">
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                onWheel={(e) => {
                  e.preventDefault();
                  const delta = e.deltaY > 0 ? 0.9 : 1.1;
                  setZoom((z) => Math.min(3, Math.max(0.5, z * delta)));
                }}
                onMouseDown={(e) => {
                  const startX = e.clientX - pan.x;
                  const startY = e.clientY - pan.y;
                  const onMove = (ev: MouseEvent) => setPan({ x: ev.clientX - startX, y: ev.clientY - startY });
                  const onUp = () => {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              >
                <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transition: "transform 0.1s" }}>
                  {selected.type.startsWith("image/") || selected.src.startsWith("data:image") ? (
                    <img src={selected.src} alt={selected.name} className="max-w-[800px] max-h-[600px] object-contain shadow-2xl rounded-lg border border-separator bg-white" draggable={false} />
                  ) : selected.type.includes("pdf") || selected.name.endsWith(".pdf") ? (
                    <iframe src={selected.src} title={selected.name} className="w-[800px] h-[600px] bg-white shadow-2xl rounded-lg border border-separator" />
                  ) : (
                    <div className="w-[600px] h-[400px] bg-white shadow-2xl rounded-lg border border-separator grid place-items-center p-6">
                      <div className="text-center">
                        <Ruler className="size-10 mx-auto mb-3 text-tertiary" />
                        <Text variant="small" className="font-semibold">
                          CAD Plan: {selected.name}
                        </Text>
                        <Text variant="mini" color="quaternary" className="mt-1 block max-w-[320px] truncate">
                          {selected.type}
                        </Text>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Button variant="accent" size="small" onClick={handleDownload}>
                            <Download className="size-3.5" /> Save / Download
                          </Button>
                          <Button variant="glass" size="small" onClick={() => window.open(selected.src, "_blank")}>
                            Open in New Tab
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
