// src/integrations/meta/facebook.ts
const API_VERSION = "v20.0";
const GRAPH_HOST = "https://graph.facebook.com";

function getAccessToken(): string {
  const t = typeof window !== "undefined" ? localStorage.getItem("facebook_access_token") : null;
  if (!t) throw new Error("Missing Facebook access token. Please authenticate with Facebook.");
  return t;
}

async function fetchGraph(path: string, params: Record<string, any> = {}) {
  const token = getAccessToken();
  const url = new URL(`${GRAPH_HOST}/${API_VERSION}/${path}`);
  const sp = new URLSearchParams(params as Record<string, string>);
  sp.set("access_token", token);
  url.search = sp.toString();

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Facebook Graph API error: ${res.status} ${text}`);
  }
  return res.json();
}

async function paginate(path: string, params: Record<string, any> = {}) {
  const collected: any[] = [];
  let json: any = await fetchGraph(path, params);
  if (Array.isArray(json.data)) collected.push(...json.data);

  while (json?.paging?.next) {
    const res = await fetch(json.paging.next);
    if (!res.ok) throw new Error(`Facebook pagination error: ${res.status}`);
    json = await res.json();
    if (Array.isArray(json.data)) collected.push(...json.data);
  }

  return collected;
}

export async function getAdAccounts() {
  return paginate("me/adaccounts", { fields: "id,account_id,name,currency,account_status" });
}

export async function getCampaigns(adAccountId: string) {
  const path = adAccountId.startsWith("act_") ? `${adAccountId}/campaigns` : `act_${adAccountId}/campaigns`;
  return paginate(path, {
    fields: "id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time",
  });
}

// All available insight fields from Meta Ads API
const ALL_INSIGHT_FIELDS = [
  "impressions",
  "clicks",
  "spend",
  "reach",
  "frequency",
  "ctr",
  "cpc",
  "cpm",
  "cpp",
  "actions",
  "action_values",
  "cost_per_action_type",
  "cost_per_unique_click",
  "cost_per_unique_action_type",
  "cost_per_inline_link_click",
  "cost_per_inline_post_engagement",
  "unique_clicks",
  "unique_ctr",
  "inline_link_clicks",
  "inline_link_click_ctr",
  "inline_post_engagement",
  "outbound_clicks",
  "outbound_clicks_ctr",
  "website_ctr",
  "social_spend",
  "purchase_roas",
  "mobile_app_purchase_roas",
  "website_purchase_roas",
  "full_view_impressions",
  "full_view_reach",
  "video_play_actions",
  "video_p25_watched_actions",
  "video_p50_watched_actions",
  "video_p75_watched_actions",
  "video_p95_watched_actions",
  "video_p100_watched_actions",
  "video_30_sec_watched_actions",
  "video_avg_time_watched_actions",
  "video_continuous_2_sec_watched_actions",
  "cost_per_15_sec_video_view",
  "cost_per_2_sec_continuous_video_view",
  "cost_per_thruplay",
  "canvas_avg_view_percent",
  "canvas_avg_view_time",
  "instant_experience_clicks_to_open",
  "instant_experience_clicks_to_start",
  "landing_page_view_per_link_click",
  "purchase_per_landing_page_view",
  "objective",
  "optimization_goal",
  "buying_type",
].join(",");

export async function getInsights(
  nodeId: string,
  opts: { level?: string; since?: string; until?: string; fields?: string } = {}
) {
  const level = opts.level ?? "account";
  const fields = opts.fields ?? ALL_INSIGHT_FIELDS;
  const params: Record<string, string> = { fields, level };
  if (opts.since && opts.until) params.time_range = JSON.stringify({ since: opts.since, until: opts.until });
  const path = nodeId.startsWith("act_") ? `${nodeId}/insights` : `act_${nodeId}/insights`;
  return paginate(path, params);
}

/** Métricas alinhadas ao nível campanha / conjunto / anúncio (Marketing API insights) */
const ENTITY_INSIGHT_FIELDS = [
  "impressions",
  "clicks",
  "spend",
  "reach",
  "frequency",
  "ctr",
  "cpc",
  "cpm",
  "cpp",
  "actions",
  "action_values",
  "cost_per_action_type",
  "cost_per_unique_click",
  "unique_clicks",
  "unique_ctr",
  "inline_link_clicks",
  "inline_link_click_ctr",
  "outbound_clicks",
  "outbound_clicks_ctr",
  "social_spend",
  "purchase_roas",
  "website_purchase_roas",
  "video_play_actions",
  "video_p25_watched_actions",
  "video_p50_watched_actions",
  "video_p75_watched_actions",
  "video_p95_watched_actions",
  "video_p100_watched_actions",
  "video_30_sec_watched_actions",
  "video_avg_time_watched_actions",
  "cost_per_thruplay",
].join(",");

/**
 * Série diária (account + time_increment=1): mesmas métricas de entidade + campos
 * para funil, full view e custos por tipo de clique — alimenta gráficos e sparklines.
 */
const DAILY_INSIGHT_FIELDS = [
  ENTITY_INSIGHT_FIELDS,
  "full_view_impressions",
  "full_view_reach",
  "inline_post_engagement",
  "cost_per_inline_link_click",
  "cost_per_inline_post_engagement",
  "cost_per_unique_action_type",
  "website_ctr",
].join(",");

export async function getCampaignInsights(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "campaign",
    fields: ["campaign_id", "campaign_name", ENTITY_INSIGHT_FIELDS].join(","),
    time_range: JSON.stringify({ since, until }),
  });
}

export async function getAdSetInsights(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "adset",
    fields: ["adset_id", "adset_name", ENTITY_INSIGHT_FIELDS].join(","),
    time_range: JSON.stringify({ since, until }),
  });
}

export async function getAdInsights(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "ad",
    fields: ["ad_id", "ad_name", ENTITY_INSIGHT_FIELDS].join(","),
    time_range: JSON.stringify({ since, until }),
  });
}

export async function getDailyInsights(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "account",
    fields: DAILY_INSIGHT_FIELDS,
    time_range: JSON.stringify({ since, until }),
    time_increment: "1",
  });
}

export async function getAgeBreakdown(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "account",
    fields: "impressions,clicks,spend,ctr,cpc,reach",
    time_range: JSON.stringify({ since, until }),
    breakdowns: "age",
  });
}

export async function getPlacementBreakdown(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "account",
    fields: "impressions,clicks,spend,reach,ctr",
    time_range: JSON.stringify({ since, until }),
    breakdowns: "publisher_platform",
  });
}

export async function getGenderBreakdown(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "account",
    fields: "impressions,clicks,spend,ctr,reach",
    time_range: JSON.stringify({ since, until }),
    breakdowns: "gender",
  });
}

export async function getDeviceBreakdown(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "account",
    fields: "impressions,clicks,spend,ctr",
    time_range: JSON.stringify({ since, until }),
    breakdowns: "impression_device",
  });
}

export default {
  getAdAccounts,
  getCampaigns,
  getInsights,
  getCampaignInsights,
  getAdSetInsights,
  getAdInsights,
  getDailyInsights,
  getAgeBreakdown,
  getPlacementBreakdown,
  getGenderBreakdown,
  getDeviceBreakdown,
};
