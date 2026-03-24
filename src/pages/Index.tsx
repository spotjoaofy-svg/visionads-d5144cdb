import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  DollarSign, Target, TrendingUp, Megaphone,
  ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock, CalendarIcon,
  Construction, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAdAccounts, useDailyInsights, useAccountInsights } from "@/hooks/useMeta";
import { useMetaAlerts, buildAdManagerUrl } from "@/hooks/useMetaAlerts";

function formatBRL(n: number) {
  return `R$ ${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
}

const DATE_RANGES_OPTS = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const;

function getConversions(row: any): number {
  if (!row?.actions) return 0;
  const conv = row.actions.find((a: any) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase");
  return conv ? Number(conv.value ?? 0) : 0;
}

function getRoas(row: any): number {
  if (Array.isArray(row?.purchase_roas) && row.purchase_roas.length > 0) {
    return Number(row.purchase_roas[0]?.value ?? 0);
  }
  if (!row?.action_values) return 0;
  const rv = row.action_values.find((a: any) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase");
  const spend = Number(row.spend ?? 0);
  if (!rv || spend === 0) return 0;
  return Number(rv.value ?? 0) / spend;
}

export default function Index() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: subDays(today, 29), to: today });
  const [calOpen, setCalOpen] = useState(false);

  const since = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : format(subDays(today, 29), "yyyy-MM-dd");
  const until = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : format(today, "yyyy-MM-dd");
  const days = dateRange.from && dateRange.to
    ? Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / 86400000) + 1
    : 30;

  const { data: accounts, error: accountsError } = useAdAccounts();
  const firstAccount = accounts?.[0];
  const accountId = firstAccount?.account_id
    ? `act_${firstAccount.account_id}`
    : firstAccount?.id ?? undefined;

  const isMetaConnected = !accountsError && (accounts?.length ?? 0) > 0;

  const { data: insights } = useAccountInsights(accountId, since, until);
  const { data: dailyData } = useDailyInsights(accountId, since, until);

  // Real alerts from Meta API KPIs
  const metaAlerts = useMetaAlerts(accountId);

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
    s.roas = arr.length > 0 ? getRoas(arr[0]) : 0;
    return s;
  }, [insights]);

  const chartData = useMemo(() => {
    if (!Array.isArray(dailyData) || dailyData.length === 0) return [];
    return dailyData.map((d: any) => ({
      date: d.date_start ? format(new Date(d.date_start + "T12:00:00"), "dd/MM") : "",
      "Meta Spend": Number(d.spend ?? 0),
    }));
  }, [dailyData]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const tooltipStyle = {
    backgroundColor: "hsl(240, 13%, 10%)",
    border: "1px solid hsl(240, 10%, 20%)",
    borderRadius: "8px",
    color: "hsl(214, 32%, 97%)",
    fontSize: "11px",
  };

  const dateLabel = dateRange.from && dateRange.to
    ? `${format(dateRange.from, "dd/MM/yy")} – ${format(dateRange.to, "dd/MM/yy")}`
    : "Selecionar período";

  const dangerCount = metaAlerts.filter(a => a.severity === "danger").length;
  const alertBadgeCount = metaAlerts.length;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-lg md:text-2xl font-semibold text-foreground">
          {greeting} 👋
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5 capitalize">{dateStr}</p>
      </div>

      {/* KPI Cards — 2 cols mobile, 4 cols desktop (Meta data only) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <KPICard title="Investimento Meta" value={formatBRL(summary.spend)} change={0} icon={<DollarSign className="w-4 h-4" />} delay={0} />
        <KPICard title="Conversões Meta" value={summary.conversions.toLocaleString("pt-BR")} change={0} icon={<Target className="w-4 h-4" />} delay={80} />
        <KPICard title="ROAS Meta" value={summary.roas > 0 ? summary.roas.toFixed(2) + "x" : "—"} change={0} icon={<TrendingUp className="w-4 h-4" />} delay={160} />
        <KPICard title="Cliques Meta" value={summary.clicks.toLocaleString("pt-BR")} change={0} icon={<Megaphone className="w-4 h-4" />} delay={240} />
      </div>

      {/* Platform Cards — Meta real, Google/TikTok = "Em breve" */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {/* Meta — real data */}
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-blue-600">
                M
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Meta Ads</div>
                <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                  {firstAccount?.name ?? (isMetaConnected ? "Conectado" : "Não conectado")}
                </div>
              </div>
            </div>
            <StatusBadge severity={isMetaConnected ? "success" : "warning"} label={isMetaConnected ? "Ativo" : "Pendente"} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Spend", value: `R$ ${(summary.spend / 1000).toFixed(1)}k` },
              { label: "CTR", value: `${summary.ctr.toFixed(2)}%` },
              { label: "ROAS", value: summary.roas > 0 ? `${summary.roas.toFixed(2)}x` : "—" },
            ].map((m) => (
              <div key={m.label}>
                <div className="text-[10px] text-muted-foreground">{m.label}</div>
                <div className="text-xs md:text-sm font-semibold text-foreground">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Google Ads — em breve */}
        <div className="relative bg-card border border-border rounded-xl p-3 md:p-4 overflow-hidden">
          <div className="absolute inset-0 blur-sm pointer-events-none select-none opacity-30">
            <div className="p-3 space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-muted rounded" />)}
              </div>
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center gap-2 py-2">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 flex items-center justify-center">
              <Construction className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">Google Ads</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Em breve</div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
              <span className="text-[10px] text-muted-foreground">Em desenvolvimento</span>
            </div>
          </div>
        </div>

        {/* TikTok Ads — em breve */}
        <div className="relative bg-card border border-border rounded-xl p-3 md:p-4 overflow-hidden">
          <div className="absolute inset-0 blur-sm pointer-events-none select-none opacity-30">
            <div className="p-3 space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-muted rounded" />)}
              </div>
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center gap-2 py-2">
            <div className="w-9 h-9 rounded-lg bg-slate-600/20 flex items-center justify-center">
              <Construction className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">TikTok Ads</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Em breve</div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
              <span className="text-[10px] text-muted-foreground">Em desenvolvimento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart — Meta only */}
      <div className="bg-card border border-border rounded-xl p-3 md:p-4 animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="flex flex-col gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Investimento Meta (Período)</h2>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex bg-muted rounded-lg p-0.5 gap-0.5 overflow-x-auto no-scrollbar">
              {DATE_RANGES_OPTS.map((r) => (
                <button key={r.label} onClick={() => setDateRange({ from: subDays(today, r.days - 1), to: today })}
                  className={cn("text-[11px] px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap",
                    days === r.days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {r.label}
                </button>
              ))}
            </div>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all whitespace-nowrap">
                  <CalendarIcon className="w-3 h-3" />{dateLabel}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={dateRange}
                  onSelect={(r) => { if (r) { setDateRange(r); if (r.from && r.to) setCalOpen(false); } }}
                  locale={ptBR} numberOfMonths={2} disabled={{ after: today }} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">
            {isMetaConnected ? "Sem dados para o período" : "Conecte sua conta Meta para ver dados reais"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215, 16%, 57%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fill: "hsl(215, 16%, 57%)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={40} />
              <ReTooltip contentStyle={tooltipStyle} />
              <Line yAxisId="left" type="monotone" dataKey="Meta Spend" stroke="#1877F2" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Alerts — Real Meta KPI alerts */}
      <div className="bg-card border border-border rounded-xl p-3 md:p-4 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Alertas Ativos</h2>
          </div>
          {alertBadgeCount > 0 && (
            <Badge variant="secondary" className={cn(
              "text-xs border-0",
              dangerCount > 0 ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
            )}>
              {alertBadgeCount} {alertBadgeCount === 1 ? "alerta" : "alertas"}
            </Badge>
          )}
        </div>

        {!isMetaConnected ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Conecte sua conta Meta para ver alertas reais</p>
          </div>
        ) : metaAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <CheckCircle className="w-8 h-8 text-success/50" />
            <p className="text-sm text-muted-foreground">Tudo certo! Nenhum alerta nos últimos 7 dias.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {metaAlerts.map((alert) => {
              const adMgrUrl = buildAdManagerUrl(alert.adAccountId, alert.campaignId);
              return (
                <div key={alert.id}
                  className={cn(
                    "flex items-start gap-2.5 p-2.5 md:p-3 rounded-lg border transition-all hover:border-primary/30",
                    alert.severity === "danger" && "border-destructive/20 bg-destructive/5",
                    alert.severity === "warning" && "border-warning/20 bg-warning/5",
                    alert.severity === "success" && "border-success/20 bg-success/5"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {alert.severity === "danger" && <XCircle className="w-3.5 h-3.5 text-destructive" />}
                    {alert.severity === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                    {alert.severity === "success" && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground">{alert.title}</div>
                    <div className="text-[11px] text-muted-foreground">{alert.description}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {alert.time}
                      </span>
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {alert.platform}
                      </span>
                    </div>
                  </div>
                  <a
                    href={adMgrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver no Gerenciador de Anúncios"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
