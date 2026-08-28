import { useEffect, useState } from "react";
import { Text } from "@glaze/core/components";

interface PresenceUser {
  id: string;
  user: string;
  isAdmin: boolean;
  lastSeen: number;
  projectId?: string;
}

function getPresenceId(): string {
  try {
    let id = localStorage.getItem("canvas-client-id");
    if (!id) {
      id = "c-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      localStorage.setItem("canvas-client-id", id);
    }
    return id;
  } catch {
    return "c-" + Math.random().toString(36).slice(2, 7);
  }
}

function getUsername(): string {
  try {
    return localStorage.getItem("canvas-username") || "Admin";
  } catch {
    return "Admin";
  }
}

function isAdminUser(): boolean {
  try {
    const u = localStorage.getItem("canvas-username");
    return u?.toLowerCase() === "admin" || localStorage.getItem("canvas-isAdmin") === "true" || !u;
  } catch {
    return true;
  }
}

export function Presence() {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = getPresenceId();
    let stopped = false;

    const heartbeat = async () => {
      try {
        await fetch("http://localhost:7531/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, user: getUsername(), isAdmin: isAdminUser() }),
        });
      } catch {}
    };

    const fetchPresence = async () => {
      try {
        const res = await fetch("http://localhost:7531/api/presence");
        if (!res.ok) return;
        const data = await res.json();
        if (!stopped) {
          setUsers(data.users || []);
          setCount(data.count || 1);
        }
      } catch {}
    };

    heartbeat();
    fetchPresence();
    const hb = setInterval(heartbeat, 10000);
    const fp = setInterval(fetchPresence, 5000);
    const vis = () => {
      if (!document.hidden) {
        heartbeat();
        fetchPresence();
      }
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      stopped = true;
      clearInterval(hb);
      clearInterval(fp);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]" />
        <Text variant="mini" color="tertiary">
          {count} online{count !== users.length ? ` • ${users.length} total` : ""}
        </Text>
      </div>
      <div className="flex -space-x-1">
        {users.slice(0, 5).map((u) => (
          <div
            key={u.id}
            title={`${u.user}${u.isAdmin ? " (admin)" : ""}`}
            className={`size-6 rounded-full grid place-items-center text-[10px] font-semibold border-2 border-popover shadow-sm ${u.isAdmin ? "bg-accent text-white" : "bg-control text-primary"}`}
          >
            {u.user.charAt(0).toUpperCase()}
          </div>
        ))}
        {users.length > 5 && (
          <div className="size-6 rounded-full bg-control border-2 border-popover grid place-items-center text-[10px] text-tertiary">
            +{users.length - 5}
          </div>
        )}
      </div>
      {users.length > 1 && (
        <Text variant="mini" color="quaternary" className="hidden sm:block max-w-[120px] truncate">
          {users.map((u) => u.user).join(", ")}
        </Text>
      )}
    </div>
  );
}
