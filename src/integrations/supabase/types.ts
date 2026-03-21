export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ad_accounts: {
        Row: {
          account_external_id: string | null
          account_name: string
          created_at: string | null
          daily_budget_limit: number | null
          id: string
          is_connected: boolean | null
          platform: Database["public"]["Enums"]["platform_type"]
          workspace_id: string
        }
        Insert: {
          account_external_id?: string | null
          account_name: string
          created_at?: string | null
          daily_budget_limit?: number | null
          id?: string
          is_connected?: boolean | null
          platform: Database["public"]["Enums"]["platform_type"]
          workspace_id: string
        }
        Update: {
          account_external_id?: string | null
          account_name?: string
          created_at?: string | null
          daily_budget_limit?: number | null
          id?: string
          is_connected?: boolean | null
          platform?: Database["public"]["Enums"]["platform_type"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          notification_email: boolean | null
          rule_type: string
          threshold: number | null
          unit: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_email?: boolean | null
          rule_type: string
          threshold?: number | null
          unit?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_email?: boolean | null
          rule_type?: string
          threshold?: number | null
          unit?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_read: boolean | null
          platform: string | null
          severity: Database["public"]["Enums"]["alert_severity_type"] | null
          title: string
          workspace_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          platform?: string | null
          severity?: Database["public"]["Enums"]["alert_severity_type"] | null
          title: string
          workspace_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          platform?: string | null
          severity?: Database["public"]["Enums"]["alert_severity_type"] | null
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ad_account_id: string | null
          ai_score: number | null
          avg_cpc: number | null
          clicks: number | null
          conversions: number | null
          cpa: number | null
          cpc: number | null
          cpl: number | null
          cpm: number | null
          cpv: number | null
          created_at: string | null
          ctr: number | null
          daily_budget: number | null
          external_id: string | null
          id: string
          impressions: number | null
          name: string
          objective: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          reach: number | null
          roas: number | null
          status: Database["public"]["Enums"]["campaign_status_type"] | null
          total_spend: number | null
          updated_at: string | null
          video_views: number | null
          workspace_id: string
        }
        Insert: {
          ad_account_id?: string | null
          ai_score?: number | null
          avg_cpc?: number | null
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          cpl?: number | null
          cpm?: number | null
          cpv?: number | null
          created_at?: string | null
          ctr?: number | null
          daily_budget?: number | null
          external_id?: string | null
          id?: string
          impressions?: number | null
          name: string
          objective?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          reach?: number | null
          roas?: number | null
          status?: Database["public"]["Enums"]["campaign_status_type"] | null
          total_spend?: number | null
          updated_at?: string | null
          video_views?: number | null
          workspace_id: string
        }
        Update: {
          ad_account_id?: string | null
          ai_score?: number | null
          avg_cpc?: number | null
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          cpl?: number | null
          cpm?: number | null
          cpv?: number | null
          created_at?: string | null
          ctr?: number | null
          daily_budget?: number | null
          external_id?: string | null
          id?: string
          impressions?: number | null
          name?: string
          objective?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          reach?: number | null
          roas?: number | null
          status?: Database["public"]["Enums"]["campaign_status_type"] | null
          total_spend?: number | null
          updated_at?: string | null
          video_views?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_audits: {
        Row: {
          created_at: string | null
          creative_id: string | null
          creative_name: string
          creative_type: string | null
          id: string
          improvements: Json | null
          objective: string | null
          overall_score: number | null
          platform: Database["public"]["Enums"]["platform_type"]
          score_breakdown: Json | null
          strengths: Json | null
          thumbnail_url: string | null
          variations: Json | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          creative_id?: string | null
          creative_name: string
          creative_type?: string | null
          id?: string
          improvements?: Json | null
          objective?: string | null
          overall_score?: number | null
          platform: Database["public"]["Enums"]["platform_type"]
          score_breakdown?: Json | null
          strengths?: Json | null
          thumbnail_url?: string | null
          variations?: Json | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          creative_id?: string | null
          creative_name?: string
          creative_type?: string | null
          id?: string
          improvements?: Json | null
          objective?: string | null
          overall_score?: number | null
          platform?: Database["public"]["Enums"]["platform_type"]
          score_breakdown?: Json | null
          strengths?: Json | null
          thumbnail_url?: string | null
          variations?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_audits_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_audits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creatives: {
        Row: {
          ai_score: number | null
          audit_available: boolean | null
          campaign_id: string | null
          conv_rate: number | null
          created_at: string | null
          ctr: number | null
          format: string | null
          frequency: number | null
          id: string
          name: string
          platform: Database["public"]["Enums"]["platform_type"]
          rank_position: number | null
          roas: number | null
          thumbnail_url: string | null
          workspace_id: string
        }
        Insert: {
          ai_score?: number | null
          audit_available?: boolean | null
          campaign_id?: string | null
          conv_rate?: number | null
          created_at?: string | null
          ctr?: number | null
          format?: string | null
          frequency?: number | null
          id?: string
          name: string
          platform: Database["public"]["Enums"]["platform_type"]
          rank_position?: number | null
          roas?: number | null
          thumbnail_url?: string | null
          workspace_id: string
        }
        Update: {
          ai_score?: number | null
          audit_available?: boolean | null
          campaign_id?: string | null
          conv_rate?: number | null
          created_at?: string | null
          ctr?: number | null
          format?: string | null
          frequency?: number | null
          id?: string
          name?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          rank_position?: number | null
          roas?: number | null
          thumbnail_url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_metrics: {
        Row: {
          campaign_id: string | null
          clicks: number | null
          conversions: number | null
          created_at: string | null
          ctr: number | null
          id: string
          impressions: number | null
          metric_date: string
          platform: Database["public"]["Enums"]["platform_type"]
          roas: number | null
          spend: number | null
          workspace_id: string
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          metric_date: string
          platform: Database["public"]["Enums"]["platform_type"]
          roas?: number | null
          spend?: number | null
          workspace_id: string
        }
        Update: {
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          metric_date?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          roas?: number | null
          spend?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_metrics_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          invited_email: string | null
          joined_at: string | null
          role: Database["public"]["Enums"]["team_role_type"] | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          invited_email?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["team_role_type"] | null
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          invited_email?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["team_role_type"] | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          plan: Database["public"]["Enums"]["billing_plan_type"] | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["billing_plan_type"] | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["billing_plan_type"] | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      seed_workspace_defaults: {
        Args: { p_workspace_id: string }
        Returns: undefined
      }
    }
    Enums: {
      alert_severity_type: "danger" | "warning" | "success" | "info"
      billing_plan_type: "starter" | "pro" | "agency"
      campaign_status_type: "active" | "paused" | "ended"
      platform_type: "meta" | "google" | "tiktok"
      team_role_type: "admin" | "editor" | "viewer"
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
      alert_severity_type: ["danger", "warning", "success", "info"],
      billing_plan_type: ["starter", "pro", "agency"],
      campaign_status_type: ["active", "paused", "ended"],
      platform_type: ["meta", "google", "tiktok"],
      team_role_type: ["admin", "editor", "viewer"],
    },
  },
} as const
