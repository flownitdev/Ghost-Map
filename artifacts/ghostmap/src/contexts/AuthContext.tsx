import { createContext, useContext, useEffect, useState } from "react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/auth/user`)
      .then((r) => r.ok ? r.json() : { user: null })
      .then((data: { user: AuthUser | null }) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSignIn = async (_email: string, _password: string) => {
    window.location.href = "/__replauth";
  };

  const handleSignUp = async (_email: string, _password: string) => {
    window.location.href = "/__replauth";
  };

  const handleSignOut = async () => {
    window.location.href = "/__replauthlogout";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
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
