
-- Unique constraint for campaigns (platform + external_id per workspace)
ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_workspace_platform_external_id_key
  UNIQUE (workspace_id, platform, external_id);

-- Unique constraint for daily_metrics (campaign + date per workspace)
ALTER TABLE public.daily_metrics
  ADD CONSTRAINT daily_metrics_workspace_campaign_date_key
  UNIQUE (workspace_id, campaign_id, metric_date);

-- Unique constraint for ad_accounts
ALTER TABLE public.ad_accounts
  ADD CONSTRAINT ad_accounts_workspace_platform_ext_id_key
  UNIQUE (workspace_id, platform, account_external_id);
