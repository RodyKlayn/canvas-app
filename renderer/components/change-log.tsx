import { Button, Text } from "@glaze/core/components";
import { Trash2 } from "lucide-react";
import { useCanvasStore } from "../store";

export function ChangeLog() {
  const project = useCanvasStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const clearChangeLog = useCanvasStore((s) => s.clearChangeLog);

  const log = (project?.changeLog ?? []).filter((e) => ["add", "delete", "move"].includes(e.action)).slice().reverse();

  const isAdmin = (() => {
    try {
      const u = localStorage.getItem("canvas-username");
      return u?.toLowerCase() === "admin" || localStorage.getItem("canvas-isAdmin") === "true" || !u;
    } catch {
      return false;
    }
  })();

  const username = (() => {
    try {
      return localStorage.getItem("canvas-username") || "Admin";
    } catch {
      return "Admin";
    }
  })();

  return (
    <div className="h-full flex flex-col bg-app">
      <div className="h-13 flex items-center justify-between px-4 border-b border-separator bg-sidebar/80 backdrop-blur">
        <div>
          <Text variant="strong">Activity Log</Text>
          <Text variant="small" color="tertiary" className="block">
            {log.length} changes • adds / deletes / moves • {isAdmin ? "admin view" : `as ${username}`}
          </Text>
        </div>
        <Button variant="glass" size="small" onClick={() => project && clearChangeLog(project.id)} disabled={log.length === 0}>
          <Trash2 className="size-3" />
          Clear
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {log.length === 0 ? (
          <div className="py-12 text-center">
            <Text variant="small" color="tertiary">
              No activity yet
            </Text>
            <Text variant="mini" color="quaternary" className="mt-1 block">
              Canvas adds, deletes and moves will appear here with username and time.
            </Text>
          </div>
        ) : (
          log.map((entry) => {
            const d = new Date(entry.timestamp);
            const time = d.toLocaleTimeString() + " " + d.toLocaleDateString();
            const icon = entry.action === "add" ? "＋" : entry.action === "delete" ? "✕" : "↔";
            const col =
              entry.action === "add" ? "text-green" : entry.action === "delete" ? "text-red" : "text-purple";
            return (
              <div
                key={entry.id}
                className="flex gap-3 items-start p-3 bg-popover border border-separator rounded-lg shadow-sm"
              >
                <div
                  className={`size-7 rounded-full grid place-items-center text-[11px] font-semibold shrink-0 ${entry.isAdmin ? "bg-accent text-white" : "bg-control text-primary"}`}
                >
                  {entry.user.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Text variant="small" className="font-medium">
                      {entry.user}
                    </Text>
                    {entry.isAdmin ? (
                      <span className="text-[9px] bg-accent text-white px-1 py-0.5 rounded">admin</span>
                    ) : null}
                    <span className={`text-[11px] font-semibold uppercase ${col}`}>
                      {icon} {entry.action}
                    </span>
                    <Text variant="small" color="secondary">
                      {entry.targetType}: {entry.targetName}
                    </Text>
                  </div>
                  <Text variant="mini" color="quaternary" className="block mt-1">
                    {time} • {entry.projectName} • {entry.targetId.slice(0, 8)}
                  </Text>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-separator bg-sidebar">
        <Text variant="mini" color="quaternary" className="block text-center">
          {isAdmin ? "You are admin — you see all changes" : `Logged as ${username} • Admin is the desktop app`}
        </Text>
      </div>
    </div>
  );
}
