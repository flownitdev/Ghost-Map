import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, type ApiUser } from "@/lib/apiClient";

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const u = await api.getAuthUser();
      setUser(u);
      if (u) {
        await api.upsertUser(u).catch(() => {});
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signOut = useCallback(() => {
    window.location.href = "/__replauthlogout";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetch: fetchUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
