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

export async function getInsights(
  nodeId: string,
  opts: { level?: string; since?: string; until?: string; fields?: string } = {}
) {
  const level = opts.level ?? "account";
  const fields =
    opts.fields ??
    "impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions,action_values,cost_per_action_type";
  const params: Record<string, string> = { fields, level };
  if (opts.since && opts.until) params.time_range = JSON.stringify({ since: opts.since, until: opts.until });
  const path = nodeId.startsWith("act_") ? `${nodeId}/insights` : `act_${nodeId}/insights`;
  return paginate(path, params);
}

export async function getCampaignInsights(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "campaign",
    fields:
      "campaign_id,campaign_name,impressions,clicks,spend,reach,ctr,cpc,cpm,actions,action_values,cost_per_action_type,frequency",
    time_range: JSON.stringify({ since, until }),
  });
}

export async function getDailyInsights(adAccountId: string, since: string, until: string) {
  const path = adAccountId.startsWith("act_")
    ? `${adAccountId}/insights`
    : `act_${adAccountId}/insights`;
  return paginate(path, {
    level: "account",
    fields: "impressions,clicks,spend,reach,ctr,cpc,cpm,actions,action_values",
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
    fields: "impressions,clicks,spend,ctr",
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
    fields: "impressions,clicks,spend",
    time_range: JSON.stringify({ since, until }),
    breakdowns: "publisher_platform",
  });
}

export default {
  getAdAccounts,
  getCampaigns,
  getInsights,
  getCampaignInsights,
  getDailyInsights,
  getAgeBreakdown,
  getPlacementBreakdown,
};
