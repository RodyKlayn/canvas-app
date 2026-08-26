import { useCallback } from "react";
import {
  SplitView,
  Toolbar,
  ToolbarContent,
  ToolbarTitle,
  ToolbarActions,
  SegmentedControl,
  SegmentedControlItem,
  Button,
  EmptyState,
  Separator,
  Text,
} from "@glaze/core/components";
import {
  StickyNote,
  Link2,
  FileText,
  Compass,
  Box,
  LayoutGrid,
} from "lucide-react";
import { nanoid } from "nanoid";
import { ProjectSidebar } from "../components/project-sidebar";
import { InfiniteCanvas } from "../components/infinite-canvas";
import { useCanvasStore, createStickyNode } from "../store";
import type { WorkspaceMode } from "../types";

export function HomeView() {
  const projects = useCanvasStore((s) => s.projects);
  const activeProjectId = useCanvasStore((s) => s.activeProjectId);
  const mode = useCanvasStore((s) => s.mode);
  const setMode = useCanvasStore((s) => s.setMode);
  const createProject = useCanvasStore((s) => s.createProject);
  const addNode = useCanvasStore((s) => s.addNode);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleAddSticky = useCallback(() => {
    if (!activeProjectId) return;
    addNode(createStickyNode({ x: 250, y: 200 }, "yellow"));
  }, [activeProjectId, addNode]);

  const handleAddLink = useCallback(() => {
    if (!activeProjectId) return;
    addNode({
      id: nanoid(),
      type: "link",
      position: { x: 250, y: 200 },
      data: { kind: "link", url: "https://", title: "New link" },
    });
  }, [activeProjectId, addNode]);

  return (
    <SplitView
      sidebar={<ProjectSidebar sidebarActions={<SplitView.SidebarToggle />} />}
      storageKey="canvas-workspace-shell"
    >
      <div className="h-full flex flex-col">
        <Toolbar>
          <ToolbarContent>
            <ToolbarTitle>
              {activeProject ? activeProject.name : "Canvas"}
            </ToolbarTitle>
            {activeProject ? (
              <Text variant="small" color="tertiary" className="ml-2">
                {activeProject.nodes.length}{" "}
                {activeProject.nodes.length === 1 ? "item" : "items"}
              </Text>
            ) : null}
          </ToolbarContent>
          {activeProject ? (
            <ToolbarActions>
              <SegmentedControl
                value={mode}
                onValueChange={(v) => setMode(v as WorkspaceMode)}
                size="small"
                aria-label="Workspace mode"
              >
                <SegmentedControlItem value="canvas" iconOnly aria-label="Canvas">
                  <LayoutGrid className="size-3.5" />
                </SegmentedControlItem>
                <SegmentedControlItem
                  value="document"
                  iconOnly
                  aria-label="Document"
                >
                  <FileText className="size-3.5" />
                </SegmentedControlItem>
                <SegmentedControlItem
                  value="methodology"
                  iconOnly
                  aria-label="Methodology"
                >
                  <Compass className="size-3.5" />
                </SegmentedControlItem>
                <SegmentedControlItem value="viewer" iconOnly aria-label="3D Viewer">
                  <Box className="size-3.5" />
                </SegmentedControlItem>
              </SegmentedControl>
              <Separator orientation="vertical" />
              <Button
                iconOnly
                variant="glass"
                onClick={handleAddSticky}
                aria-label="Add sticky note"
              >
                <StickyNote className="size-4" />
              </Button>
              <Button
                iconOnly
                variant="glass"
                onClick={handleAddLink}
                aria-label="Add link"
              >
                <Link2 className="size-4" />
              </Button>
            </ToolbarActions>
          ) : null}
        </Toolbar>

        <div className="flex-1 relative">
          {!activeProject ? (
            <EmptyState
              placement="center"
              title="No project selected"
              description="Select a project from the sidebar or create a new one to start building your moodboard."
              actions={
                <Button variant="accent" onClick={() => createProject()}>
                  Create Project
                </Button>
              }
            />
          ) : mode === "canvas" ? (
            <InfiniteCanvas />
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                placement="center"
                title={
                  mode === "document"
                    ? "Document editor"
                    : mode === "methodology"
                      ? "Research methodologies"
                      : "3D prototype viewer"
                }
                description={
                  mode === "document"
                    ? "Rich text editor with tables and formatting — coming in the next phase."
                    : mode === "methodology"
                      ? "Interactive Double Diamond workflow templates — coming in the next phase."
                      : "3D model viewer for .OBJ and .GLTF files — coming in the next phase."
                }
              />
            </div>
          )}
        </div>
      </div>
    </SplitView>
  );
}
