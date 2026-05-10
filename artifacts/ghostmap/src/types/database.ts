export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: number;
          name: string;
          category: string;
          latitude: number;
          longitude: number;
          description: string;
          abandonment_score: number;
          risk_level: string;
          last_visited: string | null;
          submitted_by: string | null;
          verification_state: string | null;
          source_type: string | null;
          source_attribution: string | null;
          closure_date: string | null;
          building_status: string | null;
          demolition_status: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          category: string;
          latitude: number;
          longitude: number;
          description: string;
          abandonment_score: number;
          risk_level: string;
          last_visited?: string | null;
          submitted_by?: string | null;
          verification_state?: string | null;
          source_type?: string | null;
          source_attribution?: string | null;
          closure_date?: string | null;
          building_status?: string | null;
          demolition_status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          category?: string;
          latitude?: number;
          longitude?: number;
          description?: string;
          abandonment_score?: number;
          risk_level?: string;
          last_visited?: string | null;
          submitted_by?: string | null;
          verification_state?: string | null;
          source_type?: string | null;
          source_attribution?: string | null;
          closure_date?: string | null;
          building_status?: string | null;
          demolition_status?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      saved_locations: {
        Row: {
          user_id: string;
          location_id: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          location_id: number | string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          location_id?: number | string;
          created_at?: string;
        };
        Relationships: [];
      };
      explored_locations: {
        Row: {
          user_id: string;
          location_id: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          location_id: number | string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          location_id?: number | string;
          created_at?: string;
        };
        Relationships: [];
      };
      location_analysis: {
        Row: {
          location_id: string;
          summary: string | null;
          abandonment_score: number | null;
          decay_level: number | null;
          structural_integrity: number | null;
          activity_level: number | null;
          exploration_difficulty: number | null;
          ai_confidence: number | null;
          roof_deterioration: number | null;
          vegetation_overgrowth: number | null;
          parking_decay: number | null;
          risk_estimate: string | null;
          created_at: string;
        };
        Insert: {
          location_id: string;
          summary?: string | null;
          abandonment_score?: number | null;
          decay_level?: number | null;
          structural_integrity?: number | null;
          activity_level?: number | null;
          exploration_difficulty?: number | null;
          ai_confidence?: number | null;
          roof_deterioration?: number | null;
          vegetation_overgrowth?: number | null;
          parking_decay?: number | null;
          risk_estimate?: string | null;
          created_at?: string;
        };
        Update: {
          location_id?: string;
          summary?: string | null;
          abandonment_score?: number | null;
          decay_level?: number | null;
          structural_integrity?: number | null;
          activity_level?: number | null;
          exploration_difficulty?: number | null;
          ai_confidence?: number | null;
          roof_deterioration?: number | null;
          vegetation_overgrowth?: number | null;
          parking_decay?: number | null;
          risk_estimate?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
