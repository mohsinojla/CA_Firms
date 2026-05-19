export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string
          slug: string
          name: string
          firm_count: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          firm_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          firm_count?: number
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          clerk_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      firms: {
        Row: {
          id: string
          city_id: string
          to_code: string
          firm_name: string
          approved_wef: string | null
          city_name: string
          address: string | null
          email: string | null
          contact_number: string | null
          website: string | null
          hiring_status: string
          mrs_name: string | null
          mrs_designation: string | null
          mrs_number: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_id: string
          to_code: string
          firm_name: string
          approved_wef?: string | null
          city_name: string
          address?: string | null
          email?: string | null
          contact_number?: string | null
          website?: string | null
          hiring_status?: string
          mrs_name?: string | null
          mrs_designation?: string | null
          mrs_number?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          to_code?: string
          firm_name?: string
          approved_wef?: string | null
          city_name?: string
          address?: string | null
          email?: string | null
          contact_number?: string | null
          website?: string | null
          hiring_status?: string
          mrs_name?: string | null
          mrs_designation?: string | null
          mrs_number?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'firms_city_id_fkey'
            columns: ['city_id']
            isOneToOne: false
            referencedRelation: 'cities'
            referencedColumns: ['id']
          }
        ]
      }
      pending_changes: {
        Row: {
          id: string
          firm_id: string
          submitted_by: string
          status: 'pending' | 'approved' | 'rejected'
          field_changes: Json
          reviewer_id: string | null
          reviewer_note: string | null
          submitted_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          firm_id: string
          submitted_by: string
          status?: 'pending' | 'approved' | 'rejected'
          field_changes: Json
          reviewer_id?: string | null
          reviewer_note?: string | null
          submitted_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          firm_id?: string
          submitted_by?: string
          status?: 'pending' | 'approved' | 'rejected'
          field_changes?: Json
          reviewer_id?: string | null
          reviewer_note?: string | null
          submitted_at?: string
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pending_changes_firm_id_fkey'
            columns: ['firm_id']
            isOneToOne: false
            referencedRelation: 'firms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pending_changes_submitted_by_fkey'
            columns: ['submitted_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          change_id: string | null
          firm_id: string | null
          actor_id: string | null
          action: string
          before_state: Json | null
          after_state: Json | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          change_id?: string | null
          firm_id?: string | null
          actor_id?: string | null
          action: string
          before_state?: Json | null
          after_state?: Json | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          change_id?: string | null
          firm_id?: string | null
          actor_id?: string | null
          action?: string
          before_state?: Json | null
          after_state?: Json | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_firm_id_fkey'
            columns: ['firm_id']
            isOneToOne: false
            referencedRelation: 'firms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_logs_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_logs_change_id_fkey'
            columns: ['change_id']
            isOneToOne: false
            referencedRelation: 'pending_changes'
            referencedColumns: ['id']
          }
        ]
      }
      contributor_stats: {
        Row: {
          profile_id: string
          total_submitted: number
          total_approved: number
          total_rejected: number
          last_contribution_at: string | null
          updated_at: string
        }
        Insert: {
          profile_id: string
          total_submitted?: number
          total_approved?: number
          total_rejected?: number
          last_contribution_at?: string | null
          updated_at?: string
        }
        Update: {
          profile_id?: string
          total_submitted?: number
          total_approved?: number
          total_rejected?: number
          last_contribution_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contributor_stats_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_change: {
        Args: {
          p_change_id: string
          p_reviewer_id: string
          p_reviewer_note?: string | null
        }
        Returns: undefined
      }
      reject_change: {
        Args: {
          p_change_id: string
          p_reviewer_id: string
          p_reviewer_note?: string | null
        }
        Returns: undefined
      }
      increment_submitted: {
        Args: {
          p_profile_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
