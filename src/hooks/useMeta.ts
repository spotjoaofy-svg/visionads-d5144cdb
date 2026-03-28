// src/hooks/useMeta.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import fb from "../integrations/meta/facebook";

/** Reactive hook — re-renders when token changes */
export function useIsMetaConnected() {
  const [connected, setConnected] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("facebook_access_token")
  );

  useEffect(() => {
    const check = () => setConnected(!!localStorage.getItem("facebook_access_token"));
    // Listen for storage events (cross-tab) and custom event (same-tab)
    window.addEventListener("storage", check);
    window.addEventListener("fb_token_changed", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("fb_token_changed", check);
    };
  }, []);

  return connected;
}

/** Fires a custom event so same-tab hooks update */
export function notifyTokenChanged() {
  window.dispatchEvent(new Event("fb_token_changed"));
}

function hasToken() {
  return typeof window !== "undefined" && !!localStorage.getItem("facebook_access_token");
}

export function useAdAccounts() {
  return useQuery({
    queryKey: ["fb", "adaccounts"],
    queryFn: () => fb.getAdAccounts(),
    enabled: hasToken(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

export function useAccountInsights(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "insights", adAccountId, since, until],
    queryFn: () => fb.getInsights(adAccountId!, { level: "account", since, until }),
    enabled: hasToken() && !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCampaignInsights(
  adAccountId?: string,
  since?: string,
  until?: string,
  opts?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["fb", "campaign-insights", adAccountId, since, until],
    queryFn: () => fb.getCampaignInsights(adAccountId!, since!, until!),
    enabled: hasToken() && (opts?.enabled ?? true) && !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useAdSetInsights(
  adAccountId?: string,
  since?: string,
  until?: string,
  opts?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["fb", "adset-insights", adAccountId, since, until],
    queryFn: () => fb.getAdSetInsights(adAccountId!, since!, until!),
    enabled: hasToken() && (opts?.enabled ?? true) && !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useAdInsights(
  adAccountId?: string,
  since?: string,
  until?: string,
  opts?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["fb", "ad-insights", adAccountId, since, until],
    queryFn: () => fb.getAdInsights(adAccountId!, since!, until!),
    enabled: hasToken() && (opts?.enabled ?? true) && !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useDailyInsights(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "daily-insights", adAccountId, since, until],
    queryFn: () => fb.getDailyInsights(adAccountId!, since!, until!),
    enabled: hasToken() && !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useAgeBreakdown(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "age-breakdown", adAccountId, since, until],
    queryFn: () => fb.getAgeBreakdown(adAccountId!, since!, until!),
    enabled: hasToken() && !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function usePlacementBreakdown(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "placement-breakdown", adAccountId, since, until],
    queryFn: () => fb.getPlacementBreakdown(adAccountId!, since!, until!),
    enabled: hasToken() && !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useGenderBreakdown(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "gender-breakdown", adAccountId, since, until],
    queryFn: () => fb.getGenderBreakdown(adAccountId!, since!, until!),
    enabled: hasToken() && !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useDeviceBreakdown(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "device-breakdown", adAccountId, since, until],
    queryFn: () => fb.getDeviceBreakdown(adAccountId!, since!, until!),
    enabled: hasToken() && !!adAccountId && !!since && !!until,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
