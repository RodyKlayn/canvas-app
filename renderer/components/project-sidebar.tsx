import { useMemo, type ReactNode } from "react";
import {
  Sidebar,
  SidebarList,
  SidebarListItem,
  SidebarFooter,
  EmptyState,
  Button,
  Text,
} from "@glaze/core/components";
import { Plus, Trash2, FolderOpen } from "lucide-react";
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

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
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
          <SidebarListItem
            key={project.id}
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
        ))}
      </SidebarList>
      <SidebarFooter>
        <div className="px-3 py-2">
          <Text variant="mini" color="quaternary">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </Text>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
