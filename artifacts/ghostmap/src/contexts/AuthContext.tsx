import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface ReplitUser {
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
    fetch("/api/auth/user")
      .then((r) => r.json())
      .then((data: { user: ReplitUser | null }) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSignIn = useCallback(() => {
    window.location.href = "/__replauth";
  }, []);

  const handleSignOut = useCallback(() => {
    window.location.href = "/__replauthlogout";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
