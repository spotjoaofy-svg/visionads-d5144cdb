import { useState, useMemo } from "react";
import { format, subDays, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, RefreshCw, Loader2, AlertCircle } from "lucide-react";
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
} from "@/hooks/useMeta";

const LEVEL_TABS = ["Campanhas", "Conjuntos", "Anúncios"];
const STATUS_FILTERS = ["Todos", "Ativo", "Pausado", "Encerrado"];
const METRICS = ["Spend", "CTR", "Impressões", "Cliques", "CPM", "CPC"];
const PIE_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

const tooltipStyle = {
  backgroundColor: "hsl(240, 13%, 10%)",
  border: "1px solid hsl(240, 10%, 20%)",
  borderRadius: "8px",
  color: "hsl(214, 32%, 97%)",
  fontSize: "11px",
};

function getConversions(row: any): number {
  if (!row?.actions) return 0;
  const conv = row.actions.find(
    (a: any) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
  );
  return conv ? Number(conv.value ?? 0) : 0;
}

function getRoas(row: any): number {
  if (!row?.action_values) return 0;
  const rv = row.action_values.find(
    (a: any) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
  );
  const spend = Number(row.spend ?? 0);
  if (!rv || spend === 0) return 0;
  return Number(rv.value ?? 0) / spend;
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
  const [metric, setMetric] = useState("Spend");
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

  const isConnected = !accountsError && (accounts?.length ?? 0) > 0;
  const isLoading = accountsLoading || insightsLoading;

  const summary = useMemo(() => {
    const arr = Array.isArray(insights) ? insights : [];
    if (arr.length === 0) return { impressions: 0, clicks: 0, spend: 0, reach: 0, ctr: 0, cpc: 0, roas: 0, conversions: 0 };
    const s = arr.reduce((acc: any, row: any) => {
      acc.impressions += Number(row.impressions ?? 0);
      acc.clicks += Number(row.clicks ?? 0);
      acc.spend += Number(row.spend ?? 0);
      acc.reach += Number(row.reach ?? 0);
      acc.conversions += getConversions(row);
      return acc;
    }, { impressions: 0, clicks: 0, spend: 0, reach: 0, conversions: 0 });
    s.ctr = s.impressions > 0 ? (s.clicks / s.impressions) * 100 : 0;
    s.cpc = s.clicks > 0 ? s.spend / s.clicks : 0;
    s.roas = getRoas(arr[0]);
    return s;
  }, [insights]);

  const chartData = useMemo(() => {
    if (!Array.isArray(dailyData) || dailyData.length === 0) return [];
    return dailyData.map((d: any) => ({
      date: d.date_start
        ? format(new Date(d.date_start + "T12:00:00"), "dd/MM")
        : "",
      Spend: Number(d.spend ?? 0),
      CTR: Number(d.ctr ?? 0),
      Impressões: Number(d.impressions ?? 0),
      Cliques: Number(d.clicks ?? 0),
      CPM: Number(d.cpm ?? 0),
      CPC: Number(d.cpc ?? 0),
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
      reach: Number(c.reach ?? 0),
      ctr: Number(c.ctr ?? 0),
      cpc: Number(c.cpc ?? 0),
      cpm: Number(c.cpm ?? 0),
      roas: getRoas(c),
      conversions: getConversions(c),
      frequency: Number(c.frequency ?? 0),
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
        name: d.publisher_platform ?? d.placement ?? "Outro",
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

  const dateLabel = dateRange.from && dateRange.to
    ? `${format(dateRange.from, "dd/MM/yy")} – ${format(dateRange.to, "dd/MM/yy")}`
    : "Selecionar período";

  const QUICK_PRESETS = [
    { label: "7D", from: subDays(today, 6), to: today },
    { label: "14D", from: subDays(today, 13), to: today },
    { label: "30D", from: subDays(today, 29), to: today },
    { label: "Este mês", from: startOfMonth(today), to: today },
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
          {/* Quick presets */}
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

          {/* Custom calendar picker */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {[
          { title: "Impressões", value: summary.impressions.toLocaleString("pt-BR") },
          { title: "Alcance", value: summary.reach > 0 ? (summary.reach / 1000).toFixed(1) + "k" : "—" },
          { title: "Cliques", value: summary.clicks.toLocaleString("pt-BR") },
          { title: "CTR", value: summary.ctr.toFixed(2) + "%" },
          { title: "Investimento", value: `R$ ${(summary.spend / 1000).toFixed(1)}k` },
          { title: "ROAS", value: summary.roas > 0 ? summary.roas.toFixed(2) + "x" : "—" },
        ].map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} change={0} delay={i * 40} />
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-card border border-border rounded-xl p-3 md:p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="flex flex-col gap-2 mb-3">
          <h2 className="text-sm font-semibold text-foreground">Desempenho ao Longo do Tempo</h2>
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {METRICS.map((m) => (
              <button key={m} onClick={() => setMetric(m)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-md border whitespace-nowrap transition-all flex-shrink-0",
                  metric === m ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"
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
            Sem dados para o período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={36} />
              <ReTooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey={metric} stroke="#6366F1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Campaign table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
        {/* Toolbar */}
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
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Campanha", "Status", "Spend", "Impressões", "Cliques", "CTR", "CPC", "ROAS", "Conv."].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap max-w-[200px] truncate">{c.name}</td>
                      <td className="px-4 py-3">{statusBadge(c.status)}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">R$ {c.spend.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.impressions.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.clicks.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{Number(c.ctr).toFixed(2)}%</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">R$ {Number(c.cpc).toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("font-semibold", c.roas >= 3 ? "text-success" : c.roas >= 1.5 ? "text-warning" : c.roas > 0 ? "text-destructive" : "text-muted-foreground")}>
                          {c.roas > 0 ? c.roas.toFixed(2) + "x" : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-border">
              {paginated.map((c) => (
                <div key={c.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{c.name}</div>
                    </div>
                    {statusBadge(c.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><div className="text-[10px] text-muted-foreground">Spend</div><div className="text-xs font-semibold text-foreground">R$ {(c.spend / 1000).toFixed(1)}k</div></div>
                    <div><div className="text-[10px] text-muted-foreground">CTR</div><div className="text-xs font-semibold text-foreground">{Number(c.ctr).toFixed(2)}%</div></div>
                    <div><div className="text-[10px] text-muted-foreground">ROAS</div><div className={cn("text-xs font-semibold", c.roas >= 3 ? "text-success" : c.roas >= 1.5 ? "text-warning" : "text-destructive")}>{c.roas > 0 ? c.roas.toFixed(2) + "x" : "—"}</div></div>
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

      {/* Breakdown charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "280ms" }}>
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Investimento por Posicionamento</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Share"]} />
              <Legend formatter={(v) => <span className="text-[10px] text-muted-foreground">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">CTR por Faixa Etária</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={agePieData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,20%)" />
              <XAxis dataKey="age" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${Number(v).toFixed(2)}%`, "CTR"]} />
              <Bar dataKey="ctr" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
