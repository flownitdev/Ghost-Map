// Supabase has been replaced with Replit Auth + PostgreSQL.
// This file is kept as a stub so any remaining imports don't break during migration.
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: null, error: new Error("Use Replit Auth instead") }),
    signInWithPassword: async () => ({ data: null, error: new Error("Use Replit Auth instead") }),
    signOut: async () => ({ error: null }),
  },
  from: (_table: string) => ({
    select: (_cols?: string) => ({
      eq: (_col: string, _val: unknown) => Promise.resolve({ data: [], error: null }),
      order: (_col: string, _opts?: object) => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
    }),
    insert: (_rows: unknown) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    update: (_vals: unknown) => ({
      eq: (_col: string, _val: unknown) => Promise.resolve({ data: null, error: null }),
    }),
    delete: () => ({
      eq: (_col: string, _val: unknown) => Promise.resolve({ data: null, error: null }),
    }),
  }),
};
