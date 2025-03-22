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
      course_headers: {
        Row: {
          course_id: string
          created_at: string
          display_order: number | null
          header_text: string
          id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          display_order?: number | null
          header_text: string
          id?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          display_order?: number | null
          header_text?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_headers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          board: string | null
          created_at: string
          description: string | null
          display_order: number | null
          exam: string | null
          header_text: string | null
          id: string
          image_url: string | null
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          board?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          exam?: string | null
          header_text?: string | null
          id?: string
          image_url?: string | null
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          board?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          exam?: string | null
          header_text?: string | null
          id?: string
          image_url?: string | null
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      podcast_headers: {
        Row: {
          created_at: string
          header_id: string
          id: string
          podcast_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          header_id: string
          id?: string
          podcast_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          header_id?: string
          id?: string
          podcast_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_headers_header_id_fkey"
            columns: ["header_id"]
            isOneToOne: false
            referencedRelation: "course_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_headers_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          audio_url: string
          course_id: string
          created_at: string
          description: string | null
          duration: number
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          course_id: string
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          course_id?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcasts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_option: number
          created_at: string
          id: string
          options: Json
          podcast_id: string
          question: string
          updated_at: string
        }
        Insert: {
          correct_option: number
          created_at?: string
          id?: string
          options: Json
          podcast_id: string
          question: string
          updated_at?: string
        }
        Update: {
          correct_option?: number
          created_at?: string
          id?: string
          options?: Json
          podcast_id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_streaks: {
        Row: {
          created_at: string
          id: string
          streak_date: string
          user_id: string
          xp_awarded: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          streak_date: string
          user_id: string
          xp_awarded?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          streak_date?: string
          user_id?: string
          xp_awarded?: boolean
        }
        Relationships: []
      }
      user_experience: {
        Row: {
          created_at: string
          id: string
          last_updated: string
          total_xp: number
          user_id: string
          weekly_xp: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated?: string
          total_xp?: number
          user_id: string
          weekly_xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_updated?: string
          total_xp?: number
          user_id?: string
          weekly_xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean
          course_id: string | null
          created_at: string
          id: string
          last_position: number | null
          podcast_id: string | null
          quiz_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          course_id?: string | null
          created_at?: string
          id?: string
          last_position?: number | null
          podcast_id?: string | null
          quiz_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          course_id?: string | null
          created_at?: string
          id?: string
          last_position?: number | null
          podcast_id?: string | null
          quiz_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_role: {
        Args: {
          admin_user_id: string
        }
        Returns: string
      }
      get_user_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
        }[]
      }
      get_user_emails_for_ids: {
        Args: {
          user_ids: string[]
        }
        Returns: {
          id: string
          email: string
        }[]
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
