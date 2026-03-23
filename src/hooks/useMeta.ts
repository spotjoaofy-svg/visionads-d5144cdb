// src/hooks/useMeta.ts
import { useQuery } from "@tanstack/react-query";
import fb from "../integrations/meta/facebook";

export function useAdAccounts() {
  return useQuery({
    queryKey: ["fb", "adaccounts"],
    queryFn: () => fb.getAdAccounts(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAccountInsights(adAccountId?: string, since?: string, until?: string) {
  return useQuery({
    queryKey: ["fb", "insights", adAccountId, since, until],
    queryFn: () => fb.getInsights(adAccountId!, { level: "account", since, until }),
    enabled: !!adAccountId,
  });
}
