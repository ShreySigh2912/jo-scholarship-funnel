export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      application_links: {
        Row: {
          application_id: string
          clicked: boolean | null
          clicked_at: string | null
          created_at: string
          email: string
          id: string
          tracking_token: string
        }
        Insert: {
          application_id: string
          clicked?: boolean | null
          clicked_at?: string | null
          created_at?: string
          email: string
          id?: string
          tracking_token: string
        }
        Update: {
          application_id?: string
          clicked?: boolean | null
          clicked_at?: string | null
          created_at?: string
          email?: string
          id?: string
          tracking_token?: string
        }
        Relationships: []
      }
      email_sequences: {
        Row: {
          application_id: string
          created_at: string
          email: string
          id: string
          last_email_sent_at: string | null
          link_clicked: boolean | null
          link_clicked_at: string | null
          name: string
          sequence_stage: number
          test_completed_at: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          email: string
          id?: string
          last_email_sent_at?: string | null
          link_clicked?: boolean | null
          link_clicked_at?: string | null
          name: string
          sequence_stage?: number
          test_completed_at: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          email?: string
          id?: string
          last_email_sent_at?: string | null
          link_clicked?: boolean | null
          link_clicked_at?: string | null
          name?: string
          sequence_stage?: number
          test_completed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          options: Json | null
          question_text: string
          question_type: string
          section_name: string
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          options?: Json | null
          question_text: string
          question_type: string
          section_name: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          options?: Json | null
          question_text?: string
          question_type?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          answer: string
          answered_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          question_text: string
          question_type: string
          section_name: string
          session_id: string
        }
        Insert: {
          answer: string
          answered_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          question_text: string
          question_type: string
          section_name: string
          session_id: string
        }
        Update: {
          answer?: string
          answered_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          question_text?: string
          question_type?: string
          section_name?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quiz_responses_session_id"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          application_id: string
          completed_at: string | null
          current_question: number
          current_section: number
          id: string
          started_at: string
          status: string
          total_score: number
        }
        Insert: {
          application_id: string
          completed_at?: string | null
          current_question?: number
          current_section?: number
          id?: string
          started_at?: string
          status?: string
          total_score?: number
        }
        Update: {
          application_id?: string
          completed_at?: string | null
          current_question?: number
          current_section?: number
          id?: string
          started_at?: string
          status?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_quiz_sessions_application_id"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_emails: {
        Row: {
          content: string
          created_at: string
          email: string
          error_message: string | null
          id: string
          scheduled_for: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      scholarship_applications: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      make_user_admin: {
        Args: { _email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
