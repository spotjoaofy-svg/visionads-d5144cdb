
-- ─── Enums ────────────────────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE platform_type AS ENUM ('meta', 'google', 'tiktok'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE campaign_status_type AS ENUM ('active', 'paused', 'ended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE alert_severity_type AS ENUM ('danger', 'warning', 'success', 'info'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE team_role_type AS ENUM ('admin', 'editor', 'viewer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE billing_plan_type AS ENUM ('starter', 'pro', 'agency'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Workspaces ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan billing_plan_type DEFAULT 'starter',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Workspace owners can view" ON public.workspaces FOR SELECT USING (owner_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Owners can update workspace" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK (owner_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Owners can delete workspace" ON public.workspaces FOR DELETE USING (owner_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Workspace Members ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role_type DEFAULT 'viewer',
  invited_email TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Members can view workspace members" ON public.workspace_members FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can insert members" ON public.workspace_members FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can delete members" ON public.workspace_members FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Now add the member-based workspace view policy (workspace_members table now exists)
DO $$ BEGIN
  CREATE POLICY "Workspace members can view" ON public.workspaces FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspaces.id AND user_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Ad Accounts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  account_name TEXT NOT NULL,
  account_external_id TEXT,
  daily_budget_limit NUMERIC(12,2),
  is_connected BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Workspace members can view ad accounts" ON public.ad_accounts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id AND m.user_id = auth.uid())
    ))
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Workspace owners can manage ad accounts" ON public.ad_accounts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Campaigns ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ad_account_id UUID REFERENCES public.ad_accounts(id) ON DELETE SET NULL,
  platform platform_type NOT NULL,
  name TEXT NOT NULL,
  objective TEXT,
  status campaign_status_type DEFAULT 'active',
  daily_budget NUMERIC(12,2),
  total_spend NUMERIC(12,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr NUMERIC(6,2) DEFAULT 0,
  cpc NUMERIC(8,2) DEFAULT 0,
  cpl NUMERIC(8,2) DEFAULT 0,
  cpm NUMERIC(8,2) DEFAULT 0,
  roas NUMERIC(6,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  reach BIGINT DEFAULT 0,
  video_views BIGINT DEFAULT 0,
  cpv NUMERIC(10,6) DEFAULT 0,
  avg_cpc NUMERIC(8,2) DEFAULT 0,
  cpa NUMERIC(8,2) DEFAULT 0,
  ai_score INTEGER DEFAULT 0,
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Workspace members can view campaigns" ON public.campaigns FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id AND m.user_id = auth.uid())
    ))
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Workspace owners can manage campaigns" ON public.campaigns FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Daily Metrics ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  metric_date DATE NOT NULL,
  spend NUMERIC(12,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  roas NUMERIC(6,2) DEFAULT 0,
  ctr NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Workspace members can view daily metrics" ON public.daily_metrics FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id AND m.user_id = auth.uid())
    ))
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Workspace owners can manage daily metrics" ON public.daily_metrics FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Creatives ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  platform platform_type NOT NULL,
  name TEXT NOT NULL,
  format TEXT DEFAULT 'Image',
  thumbnail_url TEXT,
  ctr NUMERIC(6,2) DEFAULT 0,
  conv_rate NUMERIC(6,2) DEFAULT 0,
  roas NUMERIC(6,2) DEFAULT 0,
  frequency NUMERIC(6,2) DEFAULT 0,
  ai_score INTEGER DEFAULT 0,
  rank_position INTEGER DEFAULT 0,
  audit_available BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Workspace members can view creatives" ON public.creatives FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id AND m.user_id = auth.uid())
    ))
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Workspace owners can manage creatives" ON public.creatives FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Creative Audits ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.creative_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES public.creatives(id) ON DELETE SET NULL,
  platform platform_type NOT NULL,
  creative_name TEXT NOT NULL,
  creative_type TEXT DEFAULT 'Image',
  objective TEXT,
  thumbnail_url TEXT,
  overall_score INTEGER DEFAULT 0,
  score_breakdown JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',
  variations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.creative_audits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Workspace members can view audits" ON public.creative_audits FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id AND m.user_id = auth.uid())
    ))
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Workspace owners can manage audits" ON public.creative_audits FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Alerts ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  platform TEXT,
  severity alert_severity_type DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Workspace members can view alerts" ON public.alerts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id AND m.user_id = auth.uid())
    ))
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Workspace owners can manage alerts" ON public.alerts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Workspace owners can insert alerts" ON public.alerts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Alert Rules ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  threshold NUMERIC(10,2),
  unit TEXT,
  notification_email BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Workspace members can view alert rules" ON public.alert_rules FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id AND m.user_id = auth.uid())
    ))
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Workspace owners can manage alert rules" ON public.alert_rules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── AI Chat Messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view their chat messages" ON public.ai_chat_messages FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert chat messages" ON public.ai_chat_messages FOR INSERT WITH CHECK (user_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Helper functions ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.seed_workspace_defaults(p_workspace_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.alert_rules (workspace_id, rule_type, description, is_enabled, threshold, unit) VALUES
    (p_workspace_id, 'Budget threshold', 'Budget esgotando (<10% restante)', true, 10, '%'),
    (p_workspace_id, 'CTR drop', 'Queda no CTR (>20% comparado à semana)', true, 20, '%'),
    (p_workspace_id, 'Frequency', 'Frequência alta (>4x por semana)', true, 4, 'x'),
    (p_workspace_id, 'ROAS below target', 'ROAS abaixo da meta', false, 2.5, 'x'),
    (p_workspace_id, 'CPL above target', 'CPL acima da meta', true, 80, 'R$')
  ON CONFLICT DO NOTHING;
END; $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON public.alert_rules;
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON public.alert_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace ON public.campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON public.campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_workspace_date ON public.daily_metrics(workspace_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_platform ON public.daily_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_alerts_workspace ON public.alerts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON public.alerts(workspace_id, is_read);
CREATE INDEX IF NOT EXISTS idx_creative_audits_workspace ON public.creative_audits(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_workspace ON public.ai_chat_messages(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_workspace ON public.alert_rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_creatives_workspace ON public.creatives(workspace_id);
