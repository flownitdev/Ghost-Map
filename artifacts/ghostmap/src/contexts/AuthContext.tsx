import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface ReplitUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface AuthContextValue {
  user: ReplitUser | null;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ReplitUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/user", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user: ReplitUser | null } | null) => {
        setUser(data?.user ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(() => {
    window.location.href = "/api/login";
  }, []);

  const signOut = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
