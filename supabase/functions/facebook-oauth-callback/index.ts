import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Origem permitida para redirect pós-OAuth (evita open redirect) */
function resolveClientOrigin(stateParam: string | null): string {
  const fallback = (Deno.env.get("APP_ORIGIN") ?? "https://visionads.lovable.app").replace(/\/$/, "");
  try {
    if (!stateParam) return fallback;
    const decoded = JSON.parse(atob(stateParam)) as { app_origin?: string };
    const raw = decoded.app_origin?.trim();
    if (!raw || !/^https?:\/\//i.test(raw)) return fallback;
    const u = new URL(raw);
    const host = u.hostname;
    if (host === "localhost" || host === "127.0.0.1") return `${u.protocol}//${u.host}`;
    if (host.endsWith(".lovable.app") || host === "lovable.app" || host.endsWith(".lovableproject.com") || host === "lovableproject.com") return `${u.protocol}//${u.host}`;
    const allowed = Deno.env.get("APP_ORIGIN")?.trim().replace(/\/$/, "");
    if (allowed) {
      try {
        const au = new URL(allowed);
        if (u.origin === au.origin) return `${u.protocol}//${u.host}`;
      } catch {
        /* ignore */
      }
    }
    const extras = (Deno.env.get("ALLOWED_OAUTH_ORIGINS") ?? "").split(",");
    for (const e of extras) {
      const eb = e.trim().replace(/\/$/, "");
      if (!eb) continue;
      try {
        const eu = new URL(eb);
        if (u.origin === eu.origin) return `${u.protocol}//${u.host}`;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const APP_ID = Deno.env.get("FACEBOOK_APP_ID")!;
  const APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET")!;
  const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/facebook-oauth-callback`;

  const appOrigin = resolveClientOrigin(state);
  const callbackUrl = `${appOrigin}/fb-callback`;

  if (error) {
    return Response.redirect(`${callbackUrl}?fb_error=${encodeURIComponent(error)}`, 302);
  }
  if (!code) {
    return Response.redirect(`${callbackUrl}?fb_error=missing_code`, 302);
  }

  let workspaceId = "";
  try {
    const decoded = JSON.parse(atob(state ?? "")) as { workspace_id?: string };
    workspaceId = decoded.workspace_id ?? "";
  } catch (_) {
    return Response.redirect(`${callbackUrl}?fb_error=invalid_state`, 302);
  }

  // ── 1. Exchange code for access token ────────────────────────────────────────
  const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", APP_ID);
  tokenUrl.searchParams.set("client_secret", APP_SECRET);
  tokenUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    return Response.redirect(
      `${callbackUrl}?fb_error=${encodeURIComponent(tokenData.error.message)}`,
      302
    );
  }
  const accessToken: string = tokenData.access_token;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── 2. Fetch & upsert Ad Accounts ─────────────────────────────────────────────
  const adAccountsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_id,currency,account_status,daily_spend_limit&access_token=${accessToken}`
  );
  const adAccountsData = await adAccountsRes.json();

  const savedAccounts: { dbId: string; extId: string }[] = [];

  if (adAccountsData.data && workspaceId) {
    for (const acct of adAccountsData.data) {
      const extId = acct.account_id ?? acct.id.replace("act_", "");
      const { data: upserted } = await supabase
        .from("ad_accounts")
        .upsert(
          {
            workspace_id: workspaceId,
            platform: "meta",
            account_name: acct.name ?? acct.id,
            account_external_id: extId,
            is_connected: true,
            daily_budget_limit: acct.daily_spend_limit ? acct.daily_spend_limit / 100 : null,
          },
          { onConflict: "workspace_id,platform,account_external_id" }
        )
        .select("id")
        .single();

      if (upserted?.id) {
        savedAccounts.push({ dbId: upserted.id, extId: acct.id });
      }
    }
  }

  // ── 3. Fetch campaigns & insights for each ad account ────────────────────────
  for (const { dbId: adAccountDbId, extId: fbAccountId } of savedAccounts) {
    const campaignsRes = await fetch(
      `https://graph.facebook.com/v19.0/${fbAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&limit=100&access_token=${accessToken}`
    );
    const campaignsData = await campaignsRes.json();
    if (!campaignsData.data) continue;

    for (const camp of campaignsData.data) {
      // Fetch insights (last 30 days)
      const insightsRes = await fetch(
        `https://graph.facebook.com/v19.0/${camp.id}/insights?fields=spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,actions,action_values,cost_per_action_type&date_preset=last_30d&access_token=${accessToken}`
      );
      const insightsData = await insightsRes.json();
      const ins = insightsData.data?.[0] ?? {};

      // Parse conversions & ROAS from actions
      const actions: { action_type: string; value: string }[] = ins.actions ?? [];
      const actionValues: { action_type: string; value: string }[] = ins.action_values ?? [];
      const purchases = actions.find((a) => a.action_type === "purchase");
      const purchaseValue = actionValues.find((a) => a.action_type === "purchase");
      const conversions = purchases ? parseInt(purchases.value) : 0;
      const revenue = purchaseValue ? parseFloat(purchaseValue.value) : 0;
      const spend = parseFloat(ins.spend ?? "0");
      const roas = spend > 0 && revenue > 0 ? revenue / spend : 0;
      const cpa = conversions > 0 && spend > 0 ? spend / conversions : 0;

      const status =
        camp.status === "ACTIVE" ? "active" : camp.status === "PAUSED" ? "paused" : "ended";

      const dailyBudget = camp.daily_budget
        ? parseFloat(camp.daily_budget) / 100
        : camp.lifetime_budget
        ? parseFloat(camp.lifetime_budget) / 100
        : null;

      await supabase.from("campaigns").upsert(
        {
          workspace_id: workspaceId,
          ad_account_id: adAccountDbId,
          platform: "meta",
          external_id: camp.id,
          name: camp.name,
          objective: camp.objective ?? null,
          status,
          daily_budget: dailyBudget,
          total_spend: spend,
          impressions: parseInt(ins.impressions ?? "0"),
          clicks: parseInt(ins.clicks ?? "0"),
          ctr: parseFloat(ins.ctr ?? "0"),
          cpc: parseFloat(ins.cpc ?? "0"),
          cpm: parseFloat(ins.cpm ?? "0"),
          reach: parseInt(ins.reach ?? "0"),
          roas: roas,
          conversions,
          cpa,
        },
        { onConflict: "workspace_id,platform,external_id" }
      );

      // ── 4. Fetch daily breakdown (last 30 days) ─────────────────────────────
      const dailyRes = await fetch(
        `https://graph.facebook.com/v19.0/${camp.id}/insights?fields=spend,impressions,clicks,ctr,actions,action_values&time_increment=1&date_preset=last_30d&access_token=${accessToken}`
      );
      const dailyData = await dailyRes.json();

      for (const day of dailyData.data ?? []) {
        const dayActions: { action_type: string; value: string }[] = day.actions ?? [];
        const dayActionValues: { action_type: string; value: string }[] = day.action_values ?? [];
        const dayConversions = dayActions.find((a) => a.action_type === "purchase");
        const dayRevenue = dayActionValues.find((a) => a.action_type === "purchase");
        const daySpend = parseFloat(day.spend ?? "0");
        const dayRev = dayRevenue ? parseFloat(dayRevenue.value) : 0;
        const dayRoas = daySpend > 0 && dayRev > 0 ? dayRev / daySpend : 0;

        // Get the campaign DB id
        const { data: campRow } = await supabase
          .from("campaigns")
          .select("id")
          .eq("external_id", camp.id)
          .eq("workspace_id", workspaceId)
          .maybeSingle();

        if (campRow?.id) {
          await supabase.from("daily_metrics").upsert(
            {
              workspace_id: workspaceId,
              campaign_id: campRow.id,
              platform: "meta",
              metric_date: day.date_start,
              spend: daySpend,
              impressions: parseInt(day.impressions ?? "0"),
              clicks: parseInt(day.clicks ?? "0"),
              ctr: parseFloat(day.ctr ?? "0"),
              conversions: dayConversions ? parseInt(dayConversions.value) : 0,
              roas: dayRoas,
            },
            { onConflict: "workspace_id,campaign_id,metric_date" }
          );
        }
      }
    }
  }

  // Query string: alguns browsers removem # do Location em 302; o /fb-callback lê access_token e grava no localStorage
  const qs = new URLSearchParams({
    fb_success: "1",
    access_token: accessToken,
  });
  return Response.redirect(`${callbackUrl}?${qs.toString()}`, 302);
});

