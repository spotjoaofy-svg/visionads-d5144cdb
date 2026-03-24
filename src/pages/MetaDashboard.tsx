import { useState, useMemo } from "react";
import { format, subDays, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricKPICard, type MetricOption } from "@/components/ui/MetricKPICard";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { metaPlacementBreakdown, metaAgeBreakdown } from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
  useAdAccounts,
  useAccountInsights,
  useCampaignInsights,
  useDailyInsights,
  useAgeBreakdown,
  usePlacementBreakdown,
  useGenderBreakdown,
  useDeviceBreakdown,
} from "@/hooks/useMeta";

const LEVEL_TABS = ["Campanhas", "Conjuntos", "Anúncios"];
const STATUS_FILTERS = ["Todos", "Ativo", "Pausado", "Encerrado"];
const PIE_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F43F5E", "#84CC16"];

const fmtBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
const fmtK = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toLocaleString("pt-BR");
const fmtPct = (v: number) => `${v.toFixed(2)}%`;
const fmtX = (v: number) => v > 0 ? `${v.toFixed(2)}x` : "—";
const fmtSec = (v: number) => v > 0 ? `${v.toFixed(0)}s` : "—";

// ── ALL available KPI metrics from Meta Ads API ──────────────────────────────
const ALL_METRICS: MetricOption[] = [
  // Cost metrics
  { key: "spend",                     label: "Investimento",          format: fmtBRL,  description: "Total investido no período" },
  { key: "cpc",                       label: "CPC",                   format: fmtBRL,  description: "Custo por clique (todos)" },
  { key: "cpm",                       label: "CPM",                   format: fmtBRL,  description: "Custo por mil impressões" },
  { key: "cpp",                       label: "CPP",                   format: fmtBRL,  description: "Custo por mil pessoas alcançadas" },
  { key: "cost_per_unique_click",     label: "Custo/Clique Único",    format: fmtBRL,  description: "Custo por clique único (all)" },
  { key: "cost_per_inline_link_click",label: "Custo/Link Click",      format: fmtBRL,  description: "Custo por clique em link inline" },
  { key: "cpa",                       label: "CPA",                   format: fmtBRL,  description: "Custo por conversão (compra)" },
  { key: "cpl",                       label: "CPL",                   format: fmtBRL,  description: "Custo por lead" },
  { key: "cost_per_thruplay",         label: "Custo/ThruPlay",        format: fmtBRL,  description: "Custo por reprodução completa de vídeo" },

  // Volume metrics
  { key: "impressions",               label: "Impressões",            format: fmtK,    description: "Total de vezes que o anúncio foi exibido" },
  { key: "reach",                     label: "Alcance",               format: fmtK,    description: "Pessoas únicas que viram o anúncio" },
  { key: "clicks",                    label: "Cliques (Todos)",       format: fmtK,    description: "Total de cliques no anúncio" },
  { key: "unique_clicks",             label: "Cliques Únicos",        format: fmtK,    description: "Pessoas únicas que clicaram" },
  { key: "inline_link_clicks",        label: "Cliques em Link",       format: fmtK,    description: "Cliques em links para destinos externos" },
  { key: "outbound_clicks",           label: "Cliques Externos",      format: fmtK,    description: "Cliques saindo das propriedades Meta" },
  { key: "conversions",               label: "Conversões",            format: (v) => v.toLocaleString("pt-BR"), description: "Total de conversões (compras)" },
  { key: "leads",                     label: "Leads",                 format: (v) => v.toLocaleString("pt-BR"), description: "Total de leads gerados" },
  { key: "inline_post_engagement",    label: "Engajamentos",          format: fmtK,    description: "Ações totais no anúncio" },

  // Rate metrics
  { key: "ctr",                       label: "CTR",                   format: fmtPct,  description: "Taxa de cliques (todos)" },
  { key: "unique_ctr",                label: "CTR Único",             format: fmtPct,  description: "Taxa de cliques únicos" },
  { key: "inline_link_click_ctr",     label: "CTR Link",              format: fmtPct,  description: "Taxa de cliques em link" },
  { key: "outbound_clicks_ctr",       label: "CTR Externo",           format: fmtPct,  description: "Taxa de cliques externos" },
  { key: "frequency",                 label: "Frequência",            format: (v) => v.toFixed(2) + "x", description: "Média de vezes que cada pessoa viu" },
  { key: "roas",                      label: "ROAS",                  format: fmtX,    description: "Retorno sobre investimento (compras)" },
  { key: "purchase_roas",             label: "ROAS Compras",          format: fmtX,    description: "ROAS baseado em valor de compras" },
  { key: "website_purchase_roas",     label: "ROAS Site",             format: fmtX,    description: "ROAS de compras no site (pixel)" },

  // Video metrics
  { key: "video_plays",               label: "Reproduções",           format: fmtK,    description: "Vezes que o vídeo começou a ser reproduzido" },
  { key: "video_p25",                 label: "Vídeo 25%",             format: fmtK,    description: "Reproduções até 25% do vídeo" },
  { key: "video_p50",                 label: "Vídeo 50%",             format: fmtK,    description: "Reproduções até 50% do vídeo" },
  { key: "video_p75",                 label: "Vídeo 75%",             format: fmtK,    description: "Reproduções até 75% do vídeo" },
  { key: "video_p95",                 label: "Vídeo 95%",             format: fmtK,    description: "Reproduções até 95% do vídeo" },
  { key: "video_p100",                label: "Vídeo 100%",            format: fmtK,    description: "Reproduções completas do vídeo" },
  { key: "video_30s",                 label: "Vídeo 30s",             format: fmtK,    description: "Reproduções de pelo menos 30 segundos" },
  { key: "video_avg_time",            label: "Tempo Médio Vídeo",     format: fmtSec,  description: "Tempo médio assistido do vídeo" },
  { key: "full_view_impressions",     label: "Full View Impressões",  format: fmtK,    description: "Full Views nos posts da página via anúncio" },
  { key: "full_view_reach",           label: "Full View Alcance",     format: fmtK,    description: "Pessoas que fizeram Full View via anúncio" },
  { key: "social_spend",              label: "Spend Social",          format: fmtBRL,  description: "Gasto em anúncios com informação social" },
];

// ── Card groups: each card shows one metric at a time, user can switch ────────
const CARD_GROUPS: { default: string; options: string[] }[] = [
  { default: "spend",       options: ["spend", "cpc", "cpm", "cpp", "cpa", "cpl", "cost_per_unique_click", "cost_per_thruplay"] },
  { default: "impressions", options: ["impressions", "reach", "full_view_impressions", "full_view_reach"] },
  { default: "clicks",      options: ["clicks", "unique_clicks", "inline_link_clicks", "outbound_clicks", "leads"] },
  { default: "ctr",         options: ["ctr", "unique_ctr", "inline_link_click_ctr", "outbound_clicks_ctr"] },
  { default: "roas",        options: ["roas", "purchase_roas", "website_purchase_roas", "conversions"] },
  { default: "frequency",   options: ["frequency", "cpl", "cpa", "social_spend"] },
  { default: "video_plays", options: ["video_plays", "video_p25", "video_p50", "video_p75", "video_p95", "video_p100", "video_30s", "video_avg_time"] },
  { default: "inline_post_engagement", options: ["inline_post_engagement", "leads", "conversions"] },
];

const CHART_METRICS = ["Spend", "CTR", "Impressões", "Cliques", "CPM", "CPC", "Alcance", "ROAS", "Cliques Únicos", "Vídeos 100%"];

const tooltipStyle = {
  backgroundColor: "hsl(240, 13%, 10%)",
  border: "1px solid hsl(240, 10%, 20%)",
  borderRadius: "8px",
  color: "hsl(214, 32%, 97%)",
  fontSize: "11px",
};

// ── Helper extractors ─────────────────────────────────────────────────────────
function getActionValue(actions: any[], ...types: string[]): number {
  if (!Array.isArray(actions)) return 0;
  for (const t of types) {
    const found = actions.find((a: any) => a.action_type === t);
    if (found) return Number(found.value ?? 0);
  }
  return 0;
}

function getConversions(row: any): number {
  return getActionValue(row?.actions ?? [], "purchase", "offsite_conversion.fb_pixel_purchase", "omni_purchase");
}

function getLeads(row: any): number {
  return getActionValue(row?.actions ?? [], "lead", "leadgen_grouped");
}

function getRoas(row: any): number {
  if (!row?.purchase_roas?.length && !row?.action_values?.length) return 0;
  const spend = Number(row.spend ?? 0);
  if (spend === 0) return 0;
  // Try purchase_roas field first
  if (row.purchase_roas?.length) return Number(row.purchase_roas[0]?.value ?? 0);
  // Fall back to action_values / spend
  const val = getActionValue(row.action_values ?? [], "purchase", "offsite_conversion.fb_pixel_purchase");
  return val > 0 ? val / spend : 0;
}

function getCpl(row: any): number {
  return getActionValue(row?.cost_per_action_type ?? [], "lead", "leadgen_grouped");
}

function getCpa(row: any): number {
  return getActionValue(row?.cost_per_action_type ?? [], "purchase", "offsite_conversion.fb_pixel_purchase");
}

function getVideoMetric(row: any, field: string): number {
  const arr = row?.[field];
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return Number(arr[0]?.value ?? 0);
}

function statusBadge(status: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "ACTIVE") return <StatusBadge severity="success" label="Ativo" />;
  if (s === "PAUSED") return <StatusBadge severity="warning" label="Pausado" />;
  return <StatusBadge severity="danger" label="Encerrado" />;
}

export default function MetaDashboard() {
  const [level, setLevel] = useState("Campanhas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [chartMetric, setChartMetric] = useState("Spend");
  const [page, setPage] = useState(1);
  const [calOpen, setCalOpen] = useState(false);
  const PER_PAGE = 5;

  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(today, 29),
    to: today,
  });

  const since = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : format(subDays(today, 29), "yyyy-MM-dd");
  const until = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : format(today, "yyyy-MM-dd");

  const { data: accounts, isLoading: accountsLoading, error: accountsError } = useAdAccounts();
  const firstAccount = accounts?.[0];
  const accountId = firstAccount?.account_id
    ? `act_${firstAccount.account_id}`
    : firstAccount?.id ?? undefined;

  const { data: insights, isLoading: insightsLoading } = useAccountInsights(accountId, since, until);
  const { data: campaignData, isLoading: campaignsLoading } = useCampaignInsights(accountId, since, until);
  const { data: dailyData, isLoading: dailyLoading } = useDailyInsights(accountId, since, until);
  const { data: ageData } = useAgeBreakdown(accountId, since, until);
  const { data: placementData } = usePlacementBreakdown(accountId, since, until);
  const { data: genderData } = useGenderBreakdown(accountId, since, until);
  const { data: deviceData } = useDeviceBreakdown(accountId, since, until);

  const isConnected = !accountsError && (accounts?.length ?? 0) > 0;
  const isLoading = accountsLoading || insightsLoading;

  // ── Build full summary with ALL metrics ─────────────────────────────────────
  const summary = useMemo(() => {
    const arr = Array.isArray(insights) ? insights : [];
    const base: Record<string, number> = {
      impressions: 0, clicks: 0, spend: 0, reach: 0, ctr: 0, cpc: 0, cpm: 0, cpp: 0,
      roas: 0, purchase_roas: 0, website_purchase_roas: 0,
      conversions: 0, cpa: 0, cpl: 0, leads: 0, frequency: 0,
      unique_clicks: 0, unique_ctr: 0, inline_link_clicks: 0, inline_link_click_ctr: 0,
      outbound_clicks: 0, outbound_clicks_ctr: 0, cost_per_unique_click: 0,
      cost_per_inline_link_click: 0, inline_post_engagement: 0, social_spend: 0,
      cost_per_thruplay: 0, video_plays: 0, video_p25: 0, video_p50: 0, video_p75: 0,
      video_p95: 0, video_p100: 0, video_30s: 0, video_avg_time: 0,
      full_view_impressions: 0, full_view_reach: 0,
    };
    if (arr.length === 0) return base;

    const s = arr.reduce((acc: Record<string, number>, row: any) => {
      acc.impressions += Number(row.impressions ?? 0);
      acc.clicks += Number(row.clicks ?? 0);
      acc.spend += Number(row.spend ?? 0);
      acc.reach += Number(row.reach ?? 0);
      acc.conversions += getConversions(row);
      acc.leads += getLeads(row);
      acc.unique_clicks += Number(row.unique_clicks ?? 0);
      acc.inline_link_clicks += Number(row.inline_link_clicks ?? 0);
      acc.outbound_clicks += getActionValue(row.outbound_clicks ?? [], "outbound_click");
      acc.inline_post_engagement += Number(row.inline_post_engagement ?? 0);
      acc.social_spend += Number(row.social_spend ?? 0);
      acc.full_view_impressions += Number(row.full_view_impressions ?? 0);
      acc.full_view_reach += Number(row.full_view_reach ?? 0);
      // video
      acc.video_plays += getVideoMetric(row, "video_play_actions");
      acc.video_p25 += getVideoMetric(row, "video_p25_watched_actions");
      acc.video_p50 += getVideoMetric(row, "video_p50_watched_actions");
      acc.video_p75 += getVideoMetric(row, "video_p75_watched_actions");
      acc.video_p95 += getVideoMetric(row, "video_p95_watched_actions");
      acc.video_p100 += getVideoMetric(row, "video_p100_watched_actions");
      acc.video_30s += getVideoMetric(row, "video_30_sec_watched_actions");
      return acc;
    }, { ...base });

    // Computed rates
    s.ctr = s.impressions > 0 ? (s.clicks / s.impressions) * 100 : 0;
    s.unique_ctr = s.impressions > 0 ? (s.unique_clicks / s.impressions) * 100 : 0;
    s.inline_link_click_ctr = s.impressions > 0 ? (s.inline_link_clicks / s.impressions) * 100 : 0;
    s.cpc = s.clicks > 0 ? s.spend / s.clicks : 0;
    s.cpm = s.impressions > 0 ? (s.spend / s.impressions) * 1000 : 0;
    s.cpp = s.reach > 0 ? (s.spend / s.reach) * 1000 : 0;
    s.cost_per_unique_click = s.unique_clicks > 0 ? s.spend / s.unique_clicks : 0;
    s.cost_per_inline_link_click = s.inline_link_clicks > 0 ? s.spend / s.inline_link_clicks : 0;
    s.frequency = arr.length > 0 ? Number(arr[0].frequency ?? 0) : 0;

    // From API objects (use first row)
    if (arr.length > 0) {
      s.roas = getRoas(arr[0]);
      s.cpa = getCpa(arr[0]);
      s.cpl = getCpl(arr[0]);
      s.cost_per_thruplay = getActionValue(arr[0].cost_per_thruplay ?? [], "video_view") || 0;
      const outbound_arr = Array.isArray(arr[0].outbound_clicks_ctr) ? arr[0].outbound_clicks_ctr : [];
      s.outbound_clicks_ctr = outbound_arr.length > 0 ? Number(outbound_arr[0]?.value ?? 0) : 0;
      const roas_arr = Array.isArray(arr[0].purchase_roas) ? arr[0].purchase_roas : [];
      s.purchase_roas = roas_arr.length > 0 ? Number(roas_arr[0]?.value ?? 0) : 0;
      const wroas_arr = Array.isArray(arr[0].website_purchase_roas) ? arr[0].website_purchase_roas : [];
      s.website_purchase_roas = wroas_arr.length > 0 ? Number(wroas_arr[0]?.value ?? 0) : 0;
    }

    // video avg time (weighted average across rows)
    const totalAvgTime = arr.reduce((sum: number, row: any) => {
      return sum + getVideoMetric(row, "video_avg_time_watched_actions");
    }, 0);
    s.video_avg_time = arr.length > 0 ? totalAvgTime / arr.length : 0;

    return s;
  }, [insights]);

  const chartData = useMemo(() => {
    if (!Array.isArray(dailyData) || dailyData.length === 0) return [];
    return dailyData.map((d: any) => ({
      date: d.date_start ? format(new Date(d.date_start + "T12:00:00"), "dd/MM") : "",
      Spend: Number(d.spend ?? 0),
      CTR: Number(d.ctr ?? 0),
      Impressões: Number(d.impressions ?? 0),
      Cliques: Number(d.clicks ?? 0),
      CPM: Number(d.cpm ?? 0),
      CPC: Number(d.cpc ?? 0),
      Alcance: Number(d.reach ?? 0),
      ROAS: getRoas(d),
      "Cliques Únicos": Number(d.unique_clicks ?? 0),
      "Vídeos 100%": getVideoMetric(d, "video_p100_watched_actions"),
    }));
  }, [dailyData]);

  const campaigns = useMemo(() => {
    if (!Array.isArray(campaignData)) return [];
    return campaignData.map((c: any) => ({
      id: c.campaign_id ?? c.id,
      name: c.campaign_name ?? c.name ?? "—",
      status: (c.effective_status ?? c.status ?? "UNKNOWN").toUpperCase(),
      spend: Number(c.spend ?? 0),
      impressions: Number(c.impressions ?? 0),
      clicks: Number(c.clicks ?? 0),
      unique_clicks: Number(c.unique_clicks ?? 0),
      reach: Number(c.reach ?? 0),
      ctr: Number(c.ctr ?? 0),
      cpc: Number(c.cpc ?? 0),
      cpm: Number(c.cpm ?? 0),
      cpp: Number(c.cpp ?? 0),
      roas: getRoas(c),
      conversions: getConversions(c),
      leads: getLeads(c),
      frequency: Number(c.frequency ?? 0),
      video_p100: getVideoMetric(c, "video_p100_watched_actions"),
      outbound_clicks: getActionValue(c?.outbound_clicks ?? [], "outbound_click"),
    }));
  }, [campaignData]);

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Ativo") return c.status === "ACTIVE";
    if (statusFilter === "Pausado") return c.status === "PAUSED";
    if (statusFilter === "Encerrado") return !["ACTIVE", "PAUSED"].includes(c.status);
    return true;
  });

  const pageCount = Math.ceil(filteredCampaigns.length / PER_PAGE);
  const paginated = filteredCampaigns.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pieData = useMemo(() => {
    if (Array.isArray(placementData) && placementData.length > 0) {
      const total = placementData.reduce((s: number, d: any) => s + Number(d.spend ?? 0), 0);
      return placementData.map((d: any) => ({
        name: d.publisher_platform ?? "Outro",
        value: total > 0 ? Math.round((Number(d.spend ?? 0) / total) * 100) : 0,
      }));
    }
    return metaPlacementBreakdown;
  }, [placementData]);

  const agePieData = useMemo(() => {
    if (Array.isArray(ageData) && ageData.length > 0) {
      return ageData.map((d: any) => ({
        age: d.age ?? "?",
        ctr: Number(d.ctr ?? 0),
        spend: Number(d.spend ?? 0),
      }));
    }
    return metaAgeBreakdown;
  }, [ageData]);

  const genderPieData = useMemo(() => {
    if (Array.isArray(genderData) && genderData.length > 0) {
      const total = genderData.reduce((s: number, d: any) => s + Number(d.spend ?? 0), 0);
      return genderData.map((d: any) => ({
        name: d.gender === "male" ? "Masculino" : d.gender === "female" ? "Feminino" : "Outro",
        value: total > 0 ? Math.round((Number(d.spend ?? 0) / total) * 100) : 0,
      }));
    }
    return [{ name: "Masculino", value: 55 }, { name: "Feminino", value: 42 }, { name: "Outro", value: 3 }];
  }, [genderData]);

  const devicePieData = useMemo(() => {
    if (Array.isArray(deviceData) && deviceData.length > 0) {
      const total = deviceData.reduce((s: number, d: any) => s + Number(d.impressions ?? 0), 0);
      return deviceData.map((d: any) => ({
        name: d.impression_device ?? "Outro",
        value: total > 0 ? Math.round((Number(d.impressions ?? 0) / total) * 100) : 0,
      }));
    }
    return [{ name: "mobile", value: 75 }, { name: "desktop", value: 20 }, { name: "tablet", value: 5 }];
  }, [deviceData]);

  const dateLabel = dateRange.from && dateRange.to
    ? `${format(dateRange.from, "dd/MM/yy")} – ${format(dateRange.to, "dd/MM/yy")}`
    : "Selecionar período";

  const QUICK_PRESETS = [
    { label: "7D",   from: subDays(today, 6),  to: today },
    { label: "14D",  from: subDays(today, 13), to: today },
    { label: "30D",  from: subDays(today, 29), to: today },
    { label: "Mês",  from: startOfMonth(today), to: today },
  ];

  return (
    <div className="p-3 md:p-6 space-y-4 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 animate-fade-up">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-foreground">Meta Ads</h1>
              {firstAccount && (
                <p className="text-[10px] text-muted-foreground">{firstAccount.name ?? firstAccount.id}</p>
              )}
            </div>
          </div>

          {!isConnected && !accountsLoading && (
            <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Conecte sua conta Meta em Configurações
            </div>
          )}
        </div>

        {/* Date range picker */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setDateRange({ from: p.from, to: p.to })}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all flex-shrink-0",
                  dateRange.from?.toDateString() === p.from.toDateString() &&
                    dateRange.to?.toDateString() === p.to.toDateString()
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <button className={cn(
                "flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap",
                "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}>
                <CalendarIcon className="w-3.5 h-3.5" />
                {dateLabel}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(r) => { if (r) { setDateRange(r); if (r.from && r.to) setCalOpen(false); } }}
                locale={ptBR}
                numberOfMonths={2}
                disabled={{ after: today }}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* KPI Cards — clickable metric selector (all 8 cards) */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        {CARD_GROUPS.map((group, i) => {
          const metricsForCard = ALL_METRICS.filter((m) => group.options.includes(m.key));
          return (
            <MetricKPICard
              key={group.default + i}
              metrics={metricsForCard}
              defaultMetric={group.default}
              data={summary}
              change={0}
              delay={i * 40}
              isLoading={isLoading}
            />
          );
        })}
      </div>

      {/* Performance Chart */}
      <div className="bg-card border border-border rounded-xl p-3 md:p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="flex flex-col gap-2 mb-3">
          <h2 className="text-sm font-semibold text-foreground">Desempenho ao Longo do Tempo</h2>
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {CHART_METRICS.map((m) => (
              <button key={m} onClick={() => setChartMetric(m)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-md border whitespace-nowrap transition-all flex-shrink-0",
                  chartMetric === m ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}>
                {m}
              </button>
            ))}
          </div>
        </div>
        {dailyLoading ? (
          <div className="flex items-center justify-center h-[180px]">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-xs text-muted-foreground">
            {isConnected ? "Sem dados para o período selecionado" : "Conecte sua conta Meta para ver dados reais"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={36} />
              <ReTooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey={chartMetric} stroke="#6366F1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Campaign table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="flex flex-col gap-2 p-3 md:p-4 border-b border-border">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {LEVEL_TABS.map((t) => (
              <button key={t} onClick={() => setLevel(t)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-all font-medium flex-shrink-0",
                  level === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-md transition-all",
                  statusFilter === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {campaignsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-sm text-muted-foreground">
              {isConnected ? "Nenhuma campanha encontrada" : "Conecte sua conta Meta para ver campanhas reais"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Campanha", "Status", "Spend", "Impressões", "Cliques", "Únicos", "CTR", "CPC", "CPM", "ROAS", "Conv.", "Leads", "Freq.", "Vídeo 100%"].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap max-w-[160px] truncate">{c.name}</td>
                      <td className="px-3 py-3">{statusBadge(c.status)}</td>
                      <td className="px-3 py-3 text-foreground whitespace-nowrap">R$ {c.spend.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{fmtK(c.impressions)}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{fmtK(c.clicks)}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{fmtK(c.unique_clicks)}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{Number(c.ctr).toFixed(2)}%</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">R$ {Number(c.cpc).toFixed(2)}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">R$ {Number(c.cpm).toFixed(2)}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={cn("font-semibold", c.roas >= 3 ? "text-success" : c.roas >= 1.5 ? "text-warning" : c.roas > 0 ? "text-destructive" : "text-muted-foreground")}>
                          {c.roas > 0 ? c.roas.toFixed(2) + "x" : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{c.conversions}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{c.leads}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{c.frequency > 0 ? c.frequency.toFixed(1) + "x" : "—"}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{c.video_p100 > 0 ? fmtK(c.video_p100) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="lg:hidden divide-y divide-border">
              {paginated.map((c) => (
                <div key={c.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{c.name}</div>
                    </div>
                    {statusBadge(c.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><div className="text-[10px] text-muted-foreground">Spend</div><div className="text-xs font-semibold text-foreground">R$ {(c.spend).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">CTR</div><div className="text-xs font-semibold text-foreground">{Number(c.ctr).toFixed(2)}%</div></div>
                    <div><div className="text-[10px] text-muted-foreground">ROAS</div><div className={cn("text-xs font-semibold", c.roas >= 3 ? "text-success" : c.roas >= 1.5 ? "text-warning" : "text-destructive")}>{c.roas > 0 ? c.roas.toFixed(2) + "x" : "—"}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">CPC</div><div className="text-xs font-semibold text-foreground">R$ {Number(c.cpc).toFixed(2)}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">CPM</div><div className="text-xs font-semibold text-foreground">R$ {Number(c.cpm).toFixed(2)}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">Conv.</div><div className="text-xs font-semibold text-foreground">{c.conversions}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">Leads</div><div className="text-xs font-semibold text-foreground">{c.leads}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">Freq.</div><div className="text-xs font-semibold text-foreground">{c.frequency > 0 ? c.frequency.toFixed(1) + "x" : "—"}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">Únicos</div><div className="text-xs font-semibold text-foreground">{fmtK(c.unique_clicks)}</div></div>
                  </div>
                </div>
              ))}
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-between px-3 md:px-4 py-3 border-t border-border">
                <span className="text-[11px] text-muted-foreground">{filteredCampaigns.length} campanhas · {page}/{pageCount}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Ant.</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Próx.</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Breakdown charts — 4 charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: "280ms" }}>
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Spend por Plataforma</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Share"]} />
              <Legend formatter={(v) => <span className="text-[10px] text-muted-foreground">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">CTR por Faixa Etária</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={agePieData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,20%)" />
              <XAxis dataKey="age" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${Number(v).toFixed(2)}%`, "CTR"]} />
              <Bar dataKey="ctr" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Spend por Gênero</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={genderPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                {genderPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Share"]} />
              <Legend formatter={(v) => <span className="text-[10px] text-muted-foreground">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Impressões por Dispositivo</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={devicePieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                {devicePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Share"]} />
              <Legend formatter={(v) => <span className="text-[10px] text-muted-foreground">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
