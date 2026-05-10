import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import type { ExplorationLog } from "@/types/exploration";

export interface UseExplorationLogsReturn {
  logs:      ExplorationLog[];
  loading:   boolean;
  addLog:    (locationId: string, data: { notes: string; visitedAt: string; photoUrl?: string }) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
}

function rowToLog(r: Record<string, unknown>): ExplorationLog {
  return {
    id:         r.id          as string,
    locationId: r.location_id as string,
    userId:     r.user_id     as string,
    notes:      (r.notes      as string) ?? "",
    visitedAt:  r.visited_at  as string,
    photoUrl:   r.photo_url   as string | undefined,
    createdAt:  r.created_at  as string,
  };
}

export function useExplorationLogs(locationId: string | null): UseExplorationLogsReturn {
  const { user }              = useAuth();
  const [logs,    setLogs]    = useState<ExplorationLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationId || !user) { setLogs([]); return; }
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data } = await supabase
          .from("exploration_logs")
          .select("*")
          .eq("location_id", locationId)
          .eq("user_id", user.id)
          .order("visited_at", { ascending: false });
        if (!cancelled) {
          setLogs(((data ?? []) as Record<string, unknown>[]).map(rowToLog));
        }
      } catch {
        // silently handle
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [locationId, user]);

  const addLog = useCallback(
    async (locId: string, data: { notes: string; visitedAt: string; photoUrl?: string }) => {
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: row, error } = await (supabase as any)
        .from("exploration_logs")
        .insert({
          user_id:     user.id,
          location_id: locId,
          notes:       data.notes,
          visited_at:  data.visitedAt,
          photo_url:   data.photoUrl ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      setLogs((prev) => [rowToLog(row as Record<string, unknown>), ...prev]);
    },
    [user]
  );

  const deleteLog = useCallback(async (logId: string) => {
    await supabase.from("exploration_logs").delete().eq("id", logId);
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  }, []);

  return { logs, loading, addLog, deleteLog };
}
