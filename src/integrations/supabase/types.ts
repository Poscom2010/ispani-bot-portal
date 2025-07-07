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
      earnings: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          payment_date: string | null
          proposal_id: string | null
          status: Database["public"]["Enums"]["earning_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          payment_date?: string | null
          proposal_id?: string | null
          status?: Database["public"]["Enums"]["earning_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          payment_date?: string | null
          proposal_id?: string | null
          status?: Database["public"]["Enums"]["earning_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          freelance_title: string | null
          full_name: string | null
          id: string
          verified: boolean
          bio: string | null
          skills: string[] | null
          hourly_rate: number | null
          location: string | null
          avatar_url: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          freelance_title?: string | null
          full_name?: string | null
          id: string
          verified?: boolean
          bio?: string | null
          skills?: string[] | null
          hourly_rate?: number | null
          location?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          freelance_title?: string | null
          full_name?: string | null
          id?: string
          verified?: boolean
          bio?: string | null
          skills?: string[] | null
          hourly_rate?: number | null
          location?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
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
      proposal_metrics: {
        Row: {
          approved_proposals: number | null
          completed_proposals: number | null
          id: string
          last_updated: string
          pending_proposals: number | null
          total_earnings: number | null
          total_proposals: number | null
          user_id: string
        }
        Insert: {
          approved_proposals?: number | null
          completed_proposals?: number | null
          id?: string
          last_updated?: string
          pending_proposals?: number | null
          total_earnings?: number | null
          total_proposals?: number | null
          user_id: string
        }
        Update: {
          approved_proposals?: number | null
          completed_proposals?: number | null
          id?: string
          last_updated?: string
          pending_proposals?: number | null
          total_earnings?: number | null
          total_proposals?: number | null
          user_id?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          actual_value: number | null
          completion_date: string | null
          created_at: string | null
          estimated_value: number | null
          generated_content: Json
          id: string
          initial_prompt: string
          status: Database["public"]["Enums"]["proposal_status"]
          title: string
          user_id: string | null
          docx_url: string | null
          draft_docx_url: string | null
        }
        Insert: {
          actual_value?: number | null
          completion_date?: string | null
          created_at?: string | null
          estimated_value?: number | null
          generated_content: Json
          id?: string
          initial_prompt: string
          status?: Database["public"]["Enums"]["proposal_status"]
          title: string
          user_id?: string | null
          docx_url?: string | null
          draft_docx_url?: string | null
        }
        Update: {
          actual_value?: number | null
          completion_date?: string | null
          created_at?: string | null
          estimated_value?: number | null
          generated_content?: Json
          id?: string
          initial_prompt?: string
          status?: Database["public"]["Enums"]["proposal_status"]
          title?: string
          user_id?: string | null
          docx_url?: string | null
          draft_docx_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string
          posted_by: string | null
          pay_per_hour: number | null
          deadline: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          posted_by?: string | null
          pay_per_hour?: number | null
          deadline?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          posted_by?: string | null
          pay_per_hour?: number | null
          deadline?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string | null
          receiver_id: string | null
          job_id: string | null
          proposal_id: string | null
          content: string | null
          file_url: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          job_id?: string | null
          proposal_id?: string | null
          content?: string | null
          file_url?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          job_id?: string | null
          proposal_id?: string | null
          content?: string | null
          file_url?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          id: string
          proposal_id: string | null
          sender_id: string | null
          receiver_id: string | null
          amount: number
          status: string | null
          file_url: string | null
          issued_at: string | null
          paid_at: string | null
        }
        Insert: {
          id?: string
          proposal_id?: string | null
          sender_id?: string | null
          receiver_id?: string | null
          amount: number
          status?: string | null
          file_url?: string | null
          issued_at?: string | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          proposal_id?: string | null
          sender_id?: string | null
          receiver_id?: string | null
          amount?: number
          status?: string | null
          file_url?: string | null
          issued_at?: string | null
          paid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          id: string
          job_id: string | null
          applicant_id: string | null
          cover_letter: string | null
          status: string | null
          proposed_rate: number | null
          file_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          job_id?: string | null
          applicant_id?: string | null
          cover_letter?: string | null
          status?: string | null
          proposed_rate?: number | null
          file_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          job_id?: string | null
          applicant_id?: string | null
          cover_letter?: string | null
          status?: string | null
          proposed_rate?: number | null
          file_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
        }
        Relationships: []
      }
      job_skills: {
        Row: {
          id: string
          job_id: string | null
          skill_id: string | null
          importance_level: string | null
          is_required: boolean
        }
        Insert: {
          id?: string
          job_id?: string | null
          skill_id?: string | null
          importance_level?: string | null
          is_required?: boolean
        }
        Update: {
          id?: string
          job_id?: string | null
          skill_id?: string | null
          importance_level?: string | null
          is_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          id: string
          profile_id: string | null
          skill_id: string | null
          proficiency_level: string
          years_experience: number
        }
        Insert: {
          id?: string
          profile_id?: string | null
          skill_id?: string | null
          proficiency_level: string
          years_experience: number
        }
        Update: {
          id?: string
          profile_id?: string | null
          skill_id?: string | null
          proficiency_level?: string
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      job_milestones: {
        Row: {
          id: string
          job_id: string | null
          title: string
          description: string | null
          due_date: string | null
          status: string | null
          amount: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          job_id?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          status?: string | null
          amount?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          job_id?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          status?: string | null
          amount?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string | null
          reviewee_id: string | null
          job_id: string | null
          rating: number
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          reviewer_id?: string | null
          reviewee_id?: string | null
          job_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          reviewer_id?: string | null
          reviewee_id?: string | null
          job_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          content: string
          is_read: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          content: string
          is_read?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          content?: string
          is_read?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_conversations: {
        Args: { current_user_id: string }
        Returns: any[]
      }
    }
    Enums: {
      earning_status: "pending" | "paid" | "cancelled"
      proposal_status: "draft" | "pending" | "approved" | "rejected" | "completed"
      user_role: "freelancer" | "client" | "both"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      earning_status: ["pending", "paid", "cancelled"],
      proposal_status: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "completed",
      ],
      user_role: ["freelancer", "client", "both"],
    },
  },
} as const