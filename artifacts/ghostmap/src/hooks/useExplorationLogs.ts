import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { ExplorationLog } from "@/types/exploration";

export interface UseExplorationLogsReturn {
  logs:      ExplorationLog[];
  loading:   boolean;
  addLog:    (locationId: string, data: { notes: string; visitedAt: string; photoUrl?: string }) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
}

export function useExplorationLogs(locationId: string | null): UseExplorationLogsReturn {
  const { user }              = useAuth();
  const [logs,    setLogs]    = useState<ExplorationLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationId || !user) { setLogs([]); return; }
    let cancelled = false;
    setLoading(true);

    fetch(`/api/exploration-logs?locationId=${encodeURIComponent(locationId)}&userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: ExplorationLog[]) => {
        if (!cancelled) setLogs(data);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [locationId, user]);

  const addLog = useCallback(
    async (locId: string, data: { notes: string; visitedAt: string; photoUrl?: string }) => {
      if (!user) return;

      const resp = await fetch("/api/exploration-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          locationId: locId,
          notes: data.notes,
          visitedAt: data.visitedAt,
          photoUrl: data.photoUrl ?? null,
        }),
      });

      if (!resp.ok) throw new Error("Failed to add exploration log");
      const row = await resp.json() as ExplorationLog;
      setLogs((prev) => [row, ...prev]);
    },
    [user]
  );

  const deleteLog = useCallback(async (logId: string) => {
    await fetch(`/api/exploration-logs/${logId}`, { method: "DELETE" });
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  }, []);

  return { logs, loading, addLog, deleteLog };
}
