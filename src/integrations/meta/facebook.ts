// src/integrations/meta/facebook.ts
const API_VERSION = "v17.0";
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
  return paginate("me/adaccounts", { fields: "id,account_id,name" });
}

export async function getCampaigns(adAccountId: string) {
  const path = adAccountId.startsWith("act_") ? `${adAccountId}/campaigns` : `act_${adAccountId}/campaigns`;
  return paginate(path, { fields: "id,name,status" });
}

export async function getInsights(nodeId: string, opts: { level?: string; since?: string; until?: string; fields?: string } = {}) {
  const level = opts.level ?? "account";
  const fields = opts.fields ?? "impressions,clicks,spend,reach,frequency,ctr,cpc,cpm";
  const params: Record<string, string> = { fields, level };
  if (opts.since && opts.until) params.time_range = JSON.stringify({ since: opts.since, until: opts.until });
  const path = nodeId.startsWith("act_") ? `${nodeId}/insights` : `act_${nodeId}/insights`;
  return paginate(path, params);
}

export default { getAdAccounts, getCampaigns, getInsights };
