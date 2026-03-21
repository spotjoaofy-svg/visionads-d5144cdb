export interface FacebookAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FacebookUser {
  id: string;
  name: string;
  email: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  access_token: string;
  fan_count?: number;
  followers_count?: number;
}

export interface FacebookAd {
  id: string;
  name: string;
  status: string;
  created_time: string;
  campaign_id: string;
  adset_id: string;
  insights?: {
    spend: number;
    impressions: number;
    clicks: number;
    actions: Array<{
      action_type: string;
      value: string;
    }>;
  };
}

export interface FacebookAdAccount {
  id: string;
  name: string;
  amount_spent: string;
  balance: string;
  currency: string;
  account_status: number;
  ads_data_access_eligible: boolean;
}

export interface FacebookLead {
  id: string;
  created_time: string;
  field_data: Array<{
    name: string;
    values: string[];
  }>;
}

export interface FacebookCatalog {
  id: string;
  name: string;
  category_default: string;
  shop_name: string;
  product_count: number;
  vertical: string;
}

export interface FacebookProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  currency: string;
  availability: string;
  url: string;
}

export interface FacebookThread {
  id: string;
  senders: Array<{
    email: string;
    name: string;
  }>;
  subject: string;
  wallpaper: string;
  former_participants: string[];
  former_subscribed: boolean;
  updated_time: string;
}

export interface FacebookEngagementData {
  page_id: string;
  page_name: string;
  period: string;
  engagement_count: number;
  post_engagement: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  click_count: number;
}

export const FACEBOOK_SCOPES = [
  "email",
  "catalog_management",
  "threads_business_basic",
  "pages_show_list",
  "ads_management",
  "ads_read",
  "business_management",
  "leads_retrieval",
  "pages_read_engagement",
  "pages_manage_metadata",
  "pages_manage_ads",
  "public_profile",
];
