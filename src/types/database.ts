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
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          due_date: string | null
          created_at: string
          updated_at: string
          user_id: string
          last_updated_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
          last_updated_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
          last_updated_by?: string | null
        }
      }
      task_assignees: {
        Row: {
          id: string
          task_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          is_premium: boolean
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          is_premium?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          is_premium?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_presence: {
        Row: {
          id: string
          user_id: string
          status: string
          last_seen_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          last_seen_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          last_seen_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}