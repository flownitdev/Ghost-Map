import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasConfig = !!(supabaseUrl && supabaseAnonKey);

if (!hasConfig) {
  console.warn(
    "[GhostMap] Supabase env vars missing — auth and live data unavailable. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase: SupabaseClient<Database> = hasConfig
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : (new Proxy({}, {
      get(_target, prop) {
        if (prop === "auth") {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signUp: async () => ({ data: null, error: new Error("Supabase not configured") }),
            signInWithPassword: async () => ({ data: null, error: new Error("Supabase not configured") }),
            signOut: async () => ({ error: null }),
          };
        }
        return () => Promise.resolve({ data: null, error: new Error("Supabase not configured") });
      },
    }) as unknown as SupabaseClient<Database>);
