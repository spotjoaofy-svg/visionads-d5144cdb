import { supabase } from "@/integrations/supabase/client";
import {
  FacebookAd,
  FacebookAdAccount,
  FacebookCatalog,
  FacebookEngagementData,
  FacebookLead,
  FacebookPage,
  FacebookProduct,
  FacebookThread,
  FacebookUser,
} from "./types";

const GRAPH_API_VERSION = "v19.0";
const GRAPH_API_URL = `https://graph.instagram.com/${GRAPH_API_VERSION}`;

class FacebookGraphAPI {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error("Access token não configurado");
    }

    const url = new URL(endpoint.startsWith("http") ? endpoint : `${GRAPH_API_URL}${endpoint}`);
    url.searchParams.append("access_token", this.accessToken);

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async getMe(): Promise<FacebookUser> {
    return this.makeRequest("/me?fields=id,name,email,picture");
  }

  async getAdAccounts(): Promise<FacebookAdAccount[]> {
    const response = await this.makeRequest("/me/adaccounts?fields=id,name,amount_spent,balance,currency,account_status,ads_data_access_eligible&limit=100");
    return response.data || [];
  }

  async getAdsByAccount(accountId: string): Promise<FacebookAd[]> {
    const response = await this.makeRequest(
      `/act_${accountId}/ads?fields=id,name,status,created_time,campaign_id,adset_id,insights{spend,impressions,clicks,actions}&limit=100`
    );
    return response.data || [];
  }

  async getCampaignsByAccount(accountId: string) {
    const response = await this.makeRequest(
      `/act_${accountId}/campaigns?fields=id,name,status,created_time,adset_count,insights{spend,impressions,reach,actions}&limit=100`
    );
    return response.data || [];
  }

  async getAdsetsByAccount(accountId: string) {
    const response = await this.makeRequest(
      `/act_${accountId}/adsets?fields=id,name,status,created_time,campaign_id,daily_budget,lifetime_budget,start_time,end_time,insights{spend,impressions,clicks,actions}&limit=100`
    );
    return response.data || [];
  }

  async getPages(): Promise<FacebookPage[]> {
    const response = await this.makeRequest("/me/accounts?fields=id,name,category,access_token,fan_count,followers_count&limit=100");
    return response.data || [];
  }

  async getPageInsights(pageId: string, metric: string) {
    return this.makeRequest(
      `/me/pages?fields=id,name,insights.metric(${metric}){values,title,period}&limit=100`
    );
  }

  async getLeads(pageId: string): Promise<FacebookLead[]> {
    const response = await this.makeRequest(
      `/me/leadgen_forms?fields=id,name,leads{id,created_time,field_data}&limit=100`
    );
    return response.data || [];
  }

  async getCatalogs(): Promise<FacebookCatalog[]> {
    const response = await this.makeRequest("/me/catalogs?fields=id,name,category_default,shop_name,product_count,vertical&limit=100");
    return response.data || [];
  }

  async getProducts(catalogId: string): Promise<FacebookProduct[]> {
    const response = await this.makeRequest(
      `/me/product_catalogs/${catalogId}/products?fields=id,name,description,image_url,price,currency,availability,url&limit=100`
    );
    return response.data || [];
  }

  async getThreads(): Promise<FacebookThread[]> {
    const response = await this.makeRequest("/me/threads?fields=id,senders,subject,wallpaper,former_participants,updated_time&limit=50");
    return response.data || [];
  }

  async getEngagementInsights(pageId: string): Promise<FacebookEngagementData[]> {
    const response = await this.makeRequest(
      `/${pageId}/insights?metric=page_engaged_users,page_post_engagements,page_fans,page_impressions,page_views&period=day&limit=30`
    );
    return response.data || [];
  }

  async getPagePosts(pageId: string) {
    const response = await this.makeRequest(
      `/${pageId}/posts?fields=id,message,created_time,type,permalink_url,insights{engagement,impressions,reach}&limit=100`
    );
    return response.data || [];
  }

  async publishPost(pageId: string, message: string) {
    return this.makeRequest(`/${pageId}/feed`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }
}

export const facebookAPI = new FacebookGraphAPI();

// Hook para usar Facebook API
export function useFacebookAPI() {
  const setTokenFromSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.provider_token) {
      facebookAPI.setAccessToken(data.session.provider_token);
      return true;
    }
    return false;
  };

  return {
    facebookAPI,
    setTokenFromSession,
    getMe: () => facebookAPI.getMe(),
    getAdAccounts: () => facebookAPI.getAdAccounts(),
    getPages: () => facebookAPI.getPages(),
    getLeads: (pageId: string) => facebookAPI.getLeads(pageId),
    getCatalogs: () => facebookAPI.getCatalogs(),
    getThreads: () => facebookAPI.getThreads(),
    getEngagementInsights: (pageId: string) => facebookAPI.getEngagementInsights(pageId),
    getAdsByAccount: (accountId: string) => facebookAPI.getAdsByAccount(accountId),
    getCampaignsByAccount: (accountId: string) => facebookAPI.getCampaignsByAccount(accountId),
    getAdsetsByAccount: (accountId: string) => facebookAPI.getAdsetsByAccount(accountId),
    getProducts: (catalogId: string) => facebookAPI.getProducts(catalogId),
    getPageInsights: (pageId: string, metric: string) => facebookAPI.getPageInsights(pageId, metric),
    getPagePosts: (pageId: string) => facebookAPI.getPagePosts(pageId),
    publishPost: (pageId: string, message: string) => facebookAPI.publishPost(pageId, message),
  };
}
