import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";

type Platform = "meta" | "google" | "tiktok";
type CampaignStatus = "active" | "paused" | "ended";

// ─── Campaigns ────────────────────────────────────────────────────────────────
export function useCampaigns(platform?: Platform) {
  const { workspace } = useApp();
  return useQuery({
    queryKey: ["campaigns", workspace?.id, platform],
    enabled: !!workspace,
    queryFn: async () => {
      let q = supabase.from("campaigns").select("*").eq("workspace_id", workspace!.id).order("total_spend", { ascending: false });
      if (platform) q = q.eq("platform", platform);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateCampaignStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CampaignStatus }) => {
      const { error } = await supabase.from("campaigns").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  const { workspace } = useApp();
  return useMutation({
    mutationFn: async (data: {
      platform: Platform; name: string; objective?: string;
      status?: CampaignStatus; daily_budget?: number;
      total_spend?: number; impressions?: number; clicks?: number;
      ctr?: number; cpc?: number; cpl?: number; cpm?: number;
      roas?: number; conversions?: number; ai_score?: number;
    }) => {
      const { error } = await supabase.from("campaigns").insert({ ...data, workspace_id: workspace!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

// ─── Daily Metrics ────────────────────────────────────────────────────────────
export function useDailyMetrics(days = 30, platform?: Platform) {
  const { workspace } = useApp();
  const since = new Date();
  since.setDate(since.getDate() - days);
  return useQuery({
    queryKey: ["daily_metrics", workspace?.id, days, platform],
    enabled: !!workspace,
    queryFn: async () => {
      let q = supabase
        .from("daily_metrics")
        .select("*")
        .eq("workspace_id", workspace!.id)
        .gte("metric_date", since.toISOString().split("T")[0])
        .order("metric_date", { ascending: true });
      if (platform) q = q.eq("platform", platform);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export function useAlerts() {
  const { workspace } = useApp();
  return useQuery({
    queryKey: ["alerts", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("workspace_id", workspace!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

// ─── Alert Rules ──────────────────────────────────────────────────────────────
export function useAlertRules() {
  const { workspace } = useApp();
  return useQuery({
    queryKey: ["alert_rules", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alert_rules")
        .select("*")
        .eq("workspace_id", workspace!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; is_enabled?: boolean; threshold?: number }) => {
      const { error } = await supabase.from("alert_rules").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert_rules"] }),
  });
}

// ─── Creatives ────────────────────────────────────────────────────────────────
export function useCreatives(platform?: string) {
  const { workspace } = useApp();
  return useQuery({
    queryKey: ["creatives", workspace?.id, platform],
    enabled: !!workspace,
    queryFn: async () => {
      let q = supabase
        .from("creatives")
        .select("*")
        .eq("workspace_id", workspace!.id)
        .order("ai_score", { ascending: false });
      if (platform && platform !== "Todos") {
        const p = platform.toLowerCase() as Platform;
        q = q.eq("platform", p);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ─── Creative Audits ──────────────────────────────────────────────────────────
export function useCreativeAudits() {
  const { workspace } = useApp();
  return useQuery({
    queryKey: ["creative_audits", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creative_audits")
        .select("*")
        .eq("workspace_id", workspace!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveCreativeAudit() {
  const qc = useQueryClient();
  const { workspace } = useApp();
  return useMutation({
    mutationFn: async (auditData: {
      platform: Platform; creative_name: string; creative_type?: string;
      objective?: string; thumbnail_url?: string; overall_score: number;
      score_breakdown: Json[]; strengths: Json[]; improvements: Json[]; variations: Json[];
    }) => {
      const insertData = {
        platform: auditData.platform,
        creative_name: auditData.creative_name,
        creative_type: auditData.creative_type ?? "Image",
        objective: auditData.objective,
        thumbnail_url: auditData.thumbnail_url,
        overall_score: auditData.overall_score,
        score_breakdown: auditData.score_breakdown as unknown as import("@/integrations/supabase/types").Json,
        strengths: auditData.strengths as unknown as import("@/integrations/supabase/types").Json,
        improvements: auditData.improvements as unknown as import("@/integrations/supabase/types").Json,
        variations: auditData.variations as unknown as import("@/integrations/supabase/types").Json,
        workspace_id: workspace!.id,
      };
      const { data, error } = await supabase
        .from("creative_audits")
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["creative_audits"] }),
  });
}

export function useDeleteCreativeAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("creative_audits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["creative_audits"] }),
  });
}

// ─── Workspace Members ────────────────────────────────────────────────────────
export function useWorkspaceMembers() {
  const { workspace } = useApp();
  return useQuery({
    queryKey: ["workspace_members", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", workspace!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  const { workspace } = useApp();
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("workspace_members").insert({
        workspace_id: workspace!.id,
        user_id: user.id,
        invited_email: email,
        role: role.toLowerCase() as "admin" | "editor" | "viewer",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace_members"] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("workspace_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace_members"] }),
  });
}

// ─── Ad Accounts ──────────────────────────────────────────────────────────────
export function useAdAccounts(platform?: Platform) {
  const { workspace } = useApp();
  return useQuery({
    queryKey: ["ad_accounts", workspace?.id, platform],
    enabled: !!workspace,
    queryFn: async () => {
      let q = supabase.from("ad_accounts").select("*").eq("workspace_id", workspace!.id);
      if (platform) q = q.eq("platform", platform);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDeleteAdAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ad_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ad_accounts"] }),
  });
}

// ─── AI Chat Messages ─────────────────────────────────────────────────────────
export function useChatMessages() {
  const { workspace } = useApp();
  return useQuery({
    queryKey: ["chat_messages", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("workspace_id", workspace!.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveChatMessage() {
  const qc = useQueryClient();
  const { workspace } = useApp();
  return useMutation({
    mutationFn: async ({ role, content, userId }: { role: "user" | "ai"; content: string; userId: string }) => {
      const { error } = await supabase.from("ai_chat_messages").insert({
        workspace_id: workspace!.id,
        user_id: userId,
        role,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat_messages"] }),
  });
}

// ─── Workspace update ─────────────────────────────────────────────────────────
export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string }) => {
      const { error } = await supabase.from("workspaces").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}
