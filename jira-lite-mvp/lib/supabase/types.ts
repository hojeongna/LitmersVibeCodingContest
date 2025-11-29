// Jira Lite MVP - Database Types
// Generated based on 001_initial_schema.sql
// Run `supabase gen types typescript` to update this file from your database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: "OWNER" | "ADMIN" | "MEMBER"
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: "OWNER" | "ADMIN" | "MEMBER"
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: "OWNER" | "ADMIN" | "MEMBER"
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      team_invites: {
        Row: {
          id: string
          team_id: string
          email: string
          invited_by: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          invited_by: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          invited_by?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          team_id: string
          owner_id: string
          name: string
          description: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          owner_id: string
          name: string
          description?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          owner_id?: string
          name?: string
          description?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      project_favorites: {
        Row: {
          user_id: string
          project_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          project_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          project_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_favorites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      statuses: {
        Row: {
          id: string
          project_id: string
          name: string
          color: string | null
          position: number
          wip_limit: number | null
          is_default: boolean
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          color?: string | null
          position: number
          wip_limit?: number | null
          is_default?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          color?: string | null
          position?: number
          wip_limit?: number | null
          is_default?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "statuses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      labels: {
        Row: {
          id: string
          project_id: string
          name: string
          color: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          color: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          color?: string
        }
        Relationships: [
          {
            foreignKeyName: "labels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      issues: {
        Row: {
          id: string
          project_id: string
          owner_id: string
          assignee_id: string | null
          status_id: string
          title: string
          description: string | null
          priority: "HIGH" | "MEDIUM" | "LOW"
          due_date: string | null
          position: number
          created_at: string
          updated_at: string
          deleted_at: string | null
          ai_summary: string | null
          ai_suggestions: Json | null
          ai_generated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          owner_id: string
          assignee_id?: string | null
          status_id: string
          title: string
          description?: string | null
          priority?: "HIGH" | "MEDIUM" | "LOW"
          due_date?: string | null
          position: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          ai_summary?: string | null
          ai_suggestions?: Json | null
          ai_generated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          owner_id?: string
          assignee_id?: string | null
          status_id?: string
          title?: string
          description?: string | null
          priority?: "HIGH" | "MEDIUM" | "LOW"
          due_date?: string | null
          position?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          ai_summary?: string | null
          ai_suggestions?: Json | null
          ai_generated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          }
        ]
      }
      issue_labels: {
        Row: {
          issue_id: string
          label_id: string
        }
        Insert: {
          issue_id: string
          label_id: string
        }
        Update: {
          issue_id?: string
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_labels_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          }
        ]
      }
      subtasks: {
        Row: {
          id: string
          issue_id: string
          title: string
          is_completed: boolean
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          title: string
          is_completed?: boolean
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          title?: string
          is_completed?: boolean
          position?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          issue_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          issue_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          issue_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      issue_history: {
        Row: {
          id: string
          issue_id: string
          changed_by: string
          field_name: string
          old_value: string | null
          new_value: string | null
          created_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          changed_by: string
          field_name: string
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          changed_by?: string
          field_name?: string
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_history_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_cache: {
        Row: {
          id: string
          issue_id: string
          cache_type: string
          content_hash: string
          result: Json
          created_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          cache_type: string
          content_hash: string
          result: Json
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          cache_type?: string
          content_hash?: string
          result?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_cache_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_rate_limits: {
        Row: {
          user_id: string
          minute_count: number
          minute_reset_at: string | null
          daily_count: number
          daily_reset_at: string | null
        }
        Insert: {
          user_id: string
          minute_count?: number
          minute_reset_at?: string | null
          daily_count?: number
          daily_reset_at?: string | null
        }
        Update: {
          user_id?: string
          minute_count?: number
          minute_reset_at?: string | null
          daily_count?: number
          daily_reset_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          issue_id: string | null
          team_id: string | null
          actor_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          issue_id?: string | null
          team_id?: string | null
          actor_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          issue_id?: string | null
          team_id?: string | null
          actor_id?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      team_activities: {
        Row: {
          id: string
          team_id: string
          actor_id: string
          action: string
          target_type: string | null
          target_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          actor_id: string
          action: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          actor_id?: string
          action?: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activities_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Profile = Tables<'profiles'>
export type Team = Tables<'teams'>
export type TeamMember = Tables<'team_members'>
export type TeamInvite = Tables<'team_invites'>
export type Project = Tables<'projects'>
export type ProjectFavorite = Tables<'project_favorites'>
export type Status = Tables<'statuses'>
export type Label = Tables<'labels'>
export type Issue = Tables<'issues'>
export type IssueLabel = Tables<'issue_labels'>
export type Subtask = Tables<'subtasks'>
export type Comment = Tables<'comments'>
export type IssueHistory = Tables<'issue_history'>
export type AiCache = Tables<'ai_cache'>
export type AiRateLimit = Tables<'ai_rate_limits'>
export type Notification = Tables<'notifications'>
export type TeamActivity = Tables<'team_activities'>

// Role type
export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER'

// Priority type
export type IssuePriority = 'HIGH' | 'MEDIUM' | 'LOW'

// AI Cache types
export type AiCacheType = 'summary' | 'suggestion' | 'comment_summary'
