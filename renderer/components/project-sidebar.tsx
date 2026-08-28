import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Sidebar,
  SidebarList,
  SidebarListItem,
  SidebarFooter,
  EmptyState,
  Button,
  Text,
} from "@glaze/core/components";
import { Plus, Trash2, FolderOpen, Pencil, Share2, Copy, Download, Files } from "lucide-react";
import { useCanvasStore } from "../store";
import type { Project } from "../types";

interface ProjectSidebarProps {
  sidebarActions?: ReactNode;
}

export function ProjectSidebar({ sidebarActions }: ProjectSidebarProps) {
  const projects = useCanvasStore((s) => s.projects);
  const activeProjectId = useCanvasStore((s) => s.activeProjectId);
  const setActiveProject = useCanvasStore((s) => s.setActiveProject);
  const createProject = useCanvasStore((s) => s.createProject);
  const deleteProject = useCanvasStore((s) => s.deleteProject);
  const renameProject = useCanvasStore((s) => s.renameProject);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  const [menu, setMenu] = useState<{ x: number; y: number; project: Project } | null>(null);

  useEffect(() => {
    const close = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-project-menu]")) return;
      setMenu(null);
    };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("scroll", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("scroll", close);
    };
  }, []);

  const handleAction = useCallback(
    async (project: Project, action: string) => {
      setMenu(null);
      if (action === "rename") {
        const name = window.prompt("Rename project:", project.name);
        console.log('[native rename]', name, project.name);
        if (name && name.trim()) {
          const newName = name.trim();
          console.log('[native rename] to', newName);
          renameProject(project.id, newName);
          // Force immediate sync so website sees it without waiting for debounce
          try {
            const st = useCanvasStore.getState();
            const snap = { projects: st.projects, activeProjectId: st.activeProjectId, mode: st.mode, globalStickies: st.globalStickies, lastSavedAt: Date.now() };
            // @ts-ignore
            await window.glazeAPI?.glaze?.ipc?.invoke("sync:save", snap);
            console.log('[native rename] saved');
          } catch (e) { console.log('[native rename] save failed', e); }
          try {
            const proj = useCanvasStore.getState().projects.find(p=>p.id===project.id);
            console.log('[native rename] proj after', proj?.name);
          } catch {}
        } else { console.log('[native rename] cancelled'); }
      } else if (action === "duplicate") {
        const base = project.name + " Copy";
        const newId = useCanvasStore.getState().createProject(base);
        const st = useCanvasStore.getState();
        useCanvasStore.setState({
          projects: st.projects.map((p) =>
            p.id === newId
              ? {
                  ...p,
                  nodes: JSON.parse(JSON.stringify(project.nodes)),
                  edges: JSON.parse(JSON.stringify(project.edges)),
                  documents: JSON.parse(JSON.stringify(project.documents)),
                  methodology: JSON.parse(JSON.stringify(project.methodology)),
                  snapshots: JSON.parse(JSON.stringify(project.snapshots ?? [])),
                  prototypes: JSON.parse(JSON.stringify(project.prototypes ?? [])),
                  changeLog: [],
                }
              : p
          ),
        });
      } else if (action === "copy_link") {
        const link = `${window.location.origin}${window.location.pathname}?project=${project.id}`;
        const webUrl = `http://${window.location.hostname}:7531?project=${project.id}`;
        const text = `${project.name}\n${link}\nWeb: ${webUrl}`;
        try {
          await navigator.clipboard.writeText(text);
          // @ts-ignore
          window.glazeAPI?.shell?.beep?.();
        } catch {}
        window.alert(`Link copied:\n${link}`);
      } else if (action === "copy_json") {
        const json = JSON.stringify(project, null, 2);
        try {
          await navigator.clipboard.writeText(json);
          window.alert("Project JSON copied to clipboard");
        } catch {
          window.prompt("Copy JSON:", json.slice(0, 4000));
        }
      } else if (action === "export") {
        const json = JSON.stringify(project, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.name.replace(/[^a-z0-9]/gi, "_")}.canvas.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (action === "delete") {
        if (window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) deleteProject(project.id);
      }
    },
    [renameProject, deleteProject]
  );

  return (
    <Sidebar
      actions={
        <>
          {sidebarActions}
          <Button iconOnly onClick={() => createProject()} aria-label="New project">
            <Plus className="size-4" />
          </Button>
        </>
      }
    >
      <SidebarList
        items={projects}
        selectedItem={selectedProject}
        onSelectedItemChange={(item: Project) => setActiveProject(item.id)}
        getItemKey={(p) => p.id}
        emptyState={
          <EmptyState
            placement="center"
            title="No projects"
            description="Create your first project to start building moodboards."
          />
        }
      >
        {projects.map((project) => (
          <div
            key={project.id}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenu({ x: e.clientX, y: e.clientY, project });
            }}
          >
            <SidebarListItem
              item={project}
              icon={<FolderOpen className="size-4" />}
              title={project.name}
              accessory={
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                  className="p-1 rounded text-tertiary opacity-0 group-hover:opacity-100 hover:text-red transition-all"
                  aria-label="Delete project"
                >
                  <Trash2 className="size-3.5" />
                </button>
              }
            />
          </div>
        ))}
      </SidebarList>

      {menu && (
        <div
          data-project-menu
          className="fixed z-50 min-w-[200px] rounded-lg border border-separator bg-popover shadow-lg py-1"
          style={{ left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="px-3 py-1.5 border-b border-separator">
            <Text variant="small" className="font-medium" truncate>
              {menu.project.name}
            </Text>
            <Text variant="mini" color="tertiary">
              {menu.project.nodes.length} items • {menu.project.documents.length} docs
            </Text>
          </div>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left"
            onClick={(e) => { e.stopPropagation(); handleAction(menu.project, "rename"); }}
          >
            <Pencil className="size-3.5" />
            Rename
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left"
            onClick={(e) => { e.stopPropagation(); handleAction(menu.project, "duplicate"); }}
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
            onClick={(e) => { e.stopPropagation(); handleAction(menu.project, "copy_link"); }}
          >
            <Share2 className="size-3.5" />
            Copy Link
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left"
            onClick={(e) => { e.stopPropagation(); handleAction(menu.project, "copy_json"); }}
          >
            <Copy className="size-3.5" />
            Copy JSON
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left"
            onClick={(e) => { e.stopPropagation(); handleAction(menu.project, "export"); }}
          >
            <Download className="size-3.5" />
            Export File…
          </button>
          <div className="h-px bg-separator my-1" />
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-control text-left text-red hover:text-red"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(menu.project, "delete");
            }}
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      )}

      <SidebarFooter>
        <div className="px-3 py-2">
          <Text variant="mini" color="quaternary">
            {projects.length} {projects.length === 1 ? "project" : "projects"} • right-click for menu
          </Text>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
