export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string;
          name: string;
          category: string;
          latitude: number;
          longitude: number;
          description: string;
          abandonment_score: number;
          risk_level: string;
          last_visited: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          latitude: number;
          longitude: number;
          description: string;
          abandonment_score: number;
          risk_level: string;
          last_visited?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
