// src/hooks/useMeta.ts
import { useQuery } from "@tanstack/react-query";
import fb from "../integrations/meta/facebook";

export function useIsMetaConnected() {
  return typeof window !== "undefined" && !!localStorage.getItem("facebook_access_token");
}

export function useAdAccounts() {
  return useQuery({
    queryKey: ["fb", "adaccounts"],
    queryFn: () => fb.getAdAccounts(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useAccountInsights(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "insights", adAccountId, since, until],
    queryFn: () => fb.getInsights(adAccountId!, { level: "account", since, until }),
    enabled: !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useCampaignInsights(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "campaign-insights", adAccountId, since, until],
    queryFn: () => fb.getCampaignInsights(adAccountId!, since!, until!),
    enabled: !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useDailyInsights(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "daily-insights", adAccountId, since, until],
    queryFn: () => fb.getDailyInsights(adAccountId!, since!, until!),
    enabled: !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useAgeBreakdown(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "age-breakdown", adAccountId, since, until],
    queryFn: () => fb.getAgeBreakdown(adAccountId!, since!, until!),
    enabled: !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export function usePlacementBreakdown(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "placement-breakdown", adAccountId, since, until],
    queryFn: () => fb.getPlacementBreakdown(adAccountId!, since!, until!),
    enabled: !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export function useGenderBreakdown(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "gender-breakdown", adAccountId, since, until],
    queryFn: () => fb.getGenderBreakdown(adAccountId!, since!, until!),
    enabled: !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export function useDeviceBreakdown(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "device-breakdown", adAccountId, since, until],
    queryFn: () => fb.getDeviceBreakdown(adAccountId!, since!, until!),
    enabled: !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
