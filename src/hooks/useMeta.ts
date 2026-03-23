/* src/hooks/useMeta.ts
   React Query hooks wrapping the Facebook client.
*/
import { useQuery } from "@tanstack/react-query";
import fb from "../integrations/meta/facebook";

export function useAdAccounts() {
  return useQuery(["fb","adaccounts"], () => fb.getAdAccounts(), { staleTime: 1000 * 60 * 2 });
}

export function useAccountInsights(adAccountId?: string, since?: string, until?: string) {
  return useQuery(
    ["fb","insights", adAccountId, since, until],
    () => fb.getInsights(adAccountId!, { level: "account", since, until }),
    { enabled: !!adAccountId }
  );
}
