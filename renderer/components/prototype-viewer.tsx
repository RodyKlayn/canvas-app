import { useRef } from "react";
import { Button, EmptyState, Text } from "@glaze/core/components";
import { Globe, Box, Image as ImageIcon, Trash2 } from "lucide-react";
import { useCanvasStore } from "../store";

export function PrototypeViewer() {
  const project = useCanvasStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const addPrototype = useCanvasStore((s) => s.addPrototype);
  const deletePrototype = useCanvasStore((s) => s.deletePrototype);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingKind = useRef<"website" | "3d" | "image">("image");

  const prototypes = project?.prototypes ?? [];

  const handleAdd = (kind: "website" | "3d" | "image") => {
    if (kind === "website") {
      const url = window.prompt("Website prototype URL:", "https://");
      if (!url) return;
      const name = window.prompt("Name:", url) || url;
      addPrototype("website", name, url, "text/website");
      return;
    }
    pendingKind.current = kind;
    if (fileRef.current) {
      fileRef.current.accept = kind === "image" ? "image/*" : ".obj,.gltf,.glb,image/*";
      fileRef.current.click();
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const kind = pendingKind.current;
      // Detect website vs image vs 3d based on file type
      let k: "website" | "3d" | "image" = kind;
      if (file.type.startsWith("image/")) k = "image";
      else if (file.name.match(/\.(gltf|glb|obj)$/i)) k = "3d";
      addPrototype(k, file.name, src, file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="h-full flex flex-col bg-app">
      <div className="h-12 flex items-center justify-between px-3 border-b border-separator bg-sidebar/50">
        <div className="flex items-center gap-2">
          <Text variant="small" color="tertiary" className="uppercase tracking-wide text-[11px] font-medium">
            Prototypes
          </Text>
          <Text variant="mini" color="quaternary">
            {prototypes.length} items
          </Text>
        </div>
        <div className="flex gap-1.5">
          <Button variant="glass" size="small" onClick={() => handleAdd("website")}>
            <Globe className="size-3.5" />
            Website
          </Button>
          <Button variant="glass" size="small" onClick={() => handleAdd("3d")}>
            <Box className="size-3.5" />
            3D
          </Button>
          <Button variant="glass" size="small" onClick={() => handleAdd("image")}>
            <ImageIcon className="size-3.5" />
            Image
          </Button>
        </div>
      </div>

      <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />

      <div className="flex-1 overflow-y-auto p-4">
        {prototypes.length === 0 ? (
          <EmptyState
            placement="center"
            title="No prototypes"
            description="Add a website prototype (URL), 3D product (.OBJ/.GLTF/.GLB) or image concept. They sync to the website."
            actions={
              <div className="flex gap-2">
                <Button variant="accent" onClick={() => handleAdd("website")}>
                  <Globe className="size-4" />
                  Website
                </Button>
                <Button variant="glass" onClick={() => handleAdd("image")}>
                  <ImageIcon className="size-4" />
                  Image
                </Button>
                <Button variant="glass" onClick={() => handleAdd("3d")}>
                  <Box className="size-4" />
                  3D
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prototypes.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-separator bg-popover overflow-hidden shadow-sm flex flex-col"
              >
                <div className="h-48 bg-well border-b border-separator relative overflow-hidden">
                  {p.kind === "website" ? (
                    <iframe
                      src={p.src}
                      title={p.name}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : p.kind === "image" ? (
                    <img src={p.src} alt={p.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="w-full h-full grid place-items-center p-4 text-center">
                      <div>
                        <Box className="size-8 mx-auto mb-2 text-tertiary" />
                        <Text variant="small" color="tertiary">
                          {p.name}
                        </Text>
                        <Text variant="mini" color="quaternary" className="mt-1 block max-w-[200px] truncate">
                          {p.type || "3D model"} • {Math.round(p.src.length / 1024)} KB
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Text variant="small" className="font-medium" truncate>
                        {p.name}
                      </Text>
                      <Text variant="mini" color="tertiary" className="block">
                        {p.kind === "website" ? "Website" : p.kind === "3d" ? "3D Product" : "Image Concept"} •{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                    <Button iconOnly variant="glass" size="small" onClick={() => deletePrototype(p.id)} aria-label="Delete">
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                  {p.kind === "website" && (
                    <Text variant="mini" color="quaternary" className="mt-1 block truncate">
                      {p.src}
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-separator bg-sidebar">
        <Text variant="mini" color="quaternary" className="text-center block">
          Prototypes sync to website • Add website, 3D or image concepts
        </Text>
      </div>
    </div>
  );
}
