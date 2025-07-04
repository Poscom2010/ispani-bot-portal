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
        }
        Insert: {
          created_at?: string | null
          freelance_title?: string | null
          full_name?: string | null
          id: string
          verified?: boolean
        }
        Update: {
          created_at?: string | null
          freelance_title?: string | null
          full_name?: string | null
          id?: string
          verified?: boolean
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      earning_status: "pending" | "paid" | "cancelled"
      proposal_status:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "completed"
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
    },
  },
} as const
