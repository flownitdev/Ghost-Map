import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signIn } from "@/lib/auth";

export default function SignupPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0c0b11" }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#A855F7" }} />
      </div>
    );
  }

  signIn();
  return null;
}
