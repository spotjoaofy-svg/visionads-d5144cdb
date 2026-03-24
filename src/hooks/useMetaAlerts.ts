// Hook that generates real alerts from live Meta campaign KPIs
import { useMemo } from "react";
import { useCampaignInsights } from "./useMeta";
import { format, subDays } from "date-fns";

export type AlertSeverity = "danger" | "warning" | "success";

export interface MetaAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  platform: "Meta";
  time: string;
  campaignId?: string;
  campaignName?: string;
  adAccountId?: string;
}

function getActionValue(actions: any[], types: string[]): number {
  if (!Array.isArray(actions)) return 0;
  const found = actions.find((a) => types.includes(a.action_type));
  return found ? Number(found.value ?? 0) : 0;
}

function getPurchaseRoas(row: any): number {
  if (Array.isArray(row.purchase_roas) && row.purchase_roas.length > 0) {
    return Number(row.purchase_roas[0]?.value ?? 0);
  }
  if (Array.isArray(row.action_values)) {
    const rv = row.action_values.find((a: any) =>
      a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
    );
    const spend = Number(row.spend ?? 0);
    if (rv && spend > 0) return Number(rv.value ?? 0) / spend;
  }
  return 0;
}

function getFrequency(row: any): number {
  return Number(row.frequency ?? 0);
}

function getSpendRatio(row: any): number {
  const budget = Number(row.daily_budget ?? row.budget_remaining ?? 0);
  const spend = Number(row.spend ?? 0);
  if (budget <= 0) return 0;
  return spend / budget;
}

export function useMetaAlerts(adAccountId?: string): MetaAlert[] {
  const today = new Date();
  const since = format(subDays(today, 7), "yyyy-MM-dd");
  const until = format(today, "yyyy-MM-dd");

  const { data: campaignData } = useCampaignInsights(adAccountId, since, until);

  return useMemo(() => {
    if (!Array.isArray(campaignData) || campaignData.length === 0) return [];

    const alerts: MetaAlert[] = [];
    const now = new Date();

    campaignData.forEach((row: any, idx: number) => {
      const campaignName = row.campaign_name ?? `Campanha ${idx + 1}`;
      const campaignId = row.campaign_id;
      const ctr = Number(row.ctr ?? 0);
      const cpc = Number(row.cpc ?? 0);
      const cpm = Number(row.cpm ?? 0);
      const frequency = getFrequency(row);
      const spend = Number(row.spend ?? 0);
      const roas = getPurchaseRoas(row);
      const clicks = Number(row.clicks ?? 0);
      const impressions = Number(row.impressions ?? 0);
      const conversions = getActionValue(
        row.actions ?? [],
        ["purchase", "offsite_conversion.fb_pixel_purchase", "lead"]
      );

      // Budget esgotando: spend > 85% do budget diário
      const budgetRemaining = Number(row.budget_remaining ?? 0);
      const totalBudget = spend + budgetRemaining;
      if (totalBudget > 0 && spend / totalBudget > 0.85) {
        alerts.push({
          id: `budget-${campaignId}-${idx}`,
          severity: "danger",
          title: "Budget esgotando",
          description: `${campaignName} — ${((spend / totalBudget) * 100).toFixed(0)}% do orçamento consumido`,
          platform: "Meta",
          time: "hoje",
          campaignId,
          campaignName,
          adAccountId,
        });
      }

      // Frequência alta: > 3.5
      if (frequency > 3.5) {
        alerts.push({
          id: `freq-${campaignId}-${idx}`,
          severity: "warning",
          title: "Frequência alta — risco de fadiga",
          description: `${campaignName} — frequência ${frequency.toFixed(1)}x (meta: < 3.5)`,
          platform: "Meta",
          time: "últimos 7 dias",
          campaignId,
          campaignName,
          adAccountId,
        });
      }

      // CTR muito baixo: < 0.5%
      if (impressions > 500 && ctr < 0.5) {
        alerts.push({
          id: `ctr-${campaignId}-${idx}`,
          severity: "warning",
          title: "CTR abaixo do esperado",
          description: `${campaignName} — CTR ${ctr.toFixed(2)}% (meta: > 1%)`,
          platform: "Meta",
          time: "últimos 7 dias",
          campaignId,
          campaignName,
          adAccountId,
        });
      }

      // ROAS abaixo de 1: gastando mais do que retorna
      if (spend > 50 && roas > 0 && roas < 1) {
        alerts.push({
          id: `roas-low-${campaignId}-${idx}`,
          severity: "danger",
          title: "ROAS negativo",
          description: `${campaignName} — ROAS ${roas.toFixed(2)}x (abaixo do break-even)`,
          platform: "Meta",
          time: "últimos 7 dias",
          campaignId,
          campaignName,
          adAccountId,
        });
      }

      // ROAS acima de 4: campanha performando bem
      if (roas > 4 && spend > 50) {
        alerts.push({
          id: `roas-good-${campaignId}-${idx}`,
          severity: "success",
          title: "ROAS acima da meta 🎉",
          description: `${campaignName} — ROAS ${roas.toFixed(2)}x`,
          platform: "Meta",
          time: "últimos 7 dias",
          campaignId,
          campaignName,
          adAccountId,
        });
      }

      // CPM muito alto: > 80 BRL
      if (cpm > 80 && impressions > 1000) {
        alerts.push({
          id: `cpm-${campaignId}-${idx}`,
          severity: "warning",
          title: "CPM elevado",
          description: `${campaignName} — CPM R$ ${cpm.toFixed(2)} (média alta para o mercado)`,
          platform: "Meta",
          time: "últimos 7 dias",
          campaignId,
          campaignName,
          adAccountId,
        });
      }

      // Zero conversões com gasto significativo
      if (spend > 100 && conversions === 0) {
        alerts.push({
          id: `noconv-${campaignId}-${idx}`,
          severity: "danger",
          title: "Sem conversões",
          description: `${campaignName} — R$ ${spend.toFixed(0)} gastos sem nenhuma conversão`,
          platform: "Meta",
          time: "últimos 7 dias",
          campaignId,
          campaignName,
          adAccountId,
        });
      }
    });

    // Sort: danger > warning > success, then limit to 8
    const order: Record<AlertSeverity, number> = { danger: 0, warning: 1, success: 2 };
    return alerts.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 8);
  }, [campaignData]);
}

/** Builds the Facebook Ads Manager URL for a given campaign */
export function buildAdManagerUrl(adAccountId?: string, campaignId?: string): string {
  if (!adAccountId || !campaignId) return "https://www.facebook.com/adsmanager";
  // Normalize account id (remove act_ prefix for URL)
  const rawAccId = adAccountId.replace("act_", "");
  return `https://www.facebook.com/adsmanager/manage/campaigns?act=${rawAccId}&selected_campaign_ids=${campaignId}`;
}
