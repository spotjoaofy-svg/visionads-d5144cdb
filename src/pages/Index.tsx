import { useState } from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  DollarSign, Target, TrendingUp, Megaphone,
  ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock, CalendarIcon,
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
import { dailyMetrics, overviewKPIs, platformSummary, activeAlerts } from "@/data/mockData";
import { cn } from "@/lib/utils";

function formatBRL(n: number) {
  return `R$ ${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
}

function formatDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function Index() {
  const [range, setRange] = useState<typeof DATE_RANGES[number]>("30D");
  const [platformFilter, setPlatformFilter] = useState("all");

  const rangeDays = range === "7D" ? 7 : range === "14D" ? 14 : range === "30D" ? 30 : 90;
  const filteredData = dailyMetrics.slice(-Math.min(rangeDays, 30));

  const chartData = filteredData.map((d) => ({
    date: formatDate(d.date),
    ...(platformFilter === "all" || platformFilter === "meta"
      ? { "Meta Spend": d.metaSpend, "Meta ROAS": d.metaRoas } : {}),
    ...(platformFilter === "all" || platformFilter === "google"
      ? { "Google Spend": d.googleSpend, "Google ROAS": d.googleRoas } : {}),
    ...(platformFilter === "all" || platformFilter === "tiktok"
      ? { "TikTok Spend": d.tiktokSpend, "TikTok ROAS": d.tiktokRoas } : {}),
  }));

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

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-lg md:text-2xl font-semibold text-foreground">
          {greeting}, Ana 👋
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5 capitalize">{dateStr}</p>
      </div>

      {/* KPI Cards — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <KPICard title="Investimento" value={formatBRL(overviewKPIs.totalSpend)} change={overviewKPIs.totalSpendChange} icon={<DollarSign className="w-4 h-4" />} delay={0} />
        <KPICard title="Conversões" value={overviewKPIs.totalConversions.toLocaleString("pt-BR")} change={overviewKPIs.totalConversionsChange} icon={<Target className="w-4 h-4" />} delay={80} />
        <KPICard title="ROAS Médio" value={overviewKPIs.avgRoas.toFixed(2) + "x"} change={overviewKPIs.avgRoasChange} icon={<TrendingUp className="w-4 h-4" />} delay={160} />
        <KPICard title="Campanhas" value={overviewKPIs.activeCampaigns.toString()} change={overviewKPIs.activeCampaignsChange} icon={<Megaphone className="w-4 h-4" />} delay={240} />
      </div>

      {/* Platform Cards — 1 col mobile, 3 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {Object.entries(platformSummary).map(([key, p]) => (
          <div key={key} className="bg-card border border-border rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: p.color }}>
                  {key === "meta" ? "M" : key === "google" ? "G" : "T"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">{p.account}</div>
                </div>
              </div>
              <StatusBadge severity="success" label="Ativo" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Spend", value: `R$ ${(p.spend / 1000).toFixed(1)}k` },
                { label: "CTR", value: `${p.ctr}%` },
                { label: "ROAS", value: `${p.roas}x` },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-[10px] text-muted-foreground">{m.label}</div>
                  <div className="text-xs md:text-sm font-semibold text-foreground">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-3 md:p-4 animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="flex flex-col gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Investimento vs ROAS</h2>
            <p className="text-[10px] text-muted-foreground">Últimos {rangeDays} dias</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Range pills */}
            <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
              {DATE_RANGES.map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className={cn("text-[11px] px-2.5 py-1 rounded-md transition-all font-medium",
                    range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {r}
                </button>
              ))}
            </div>
            {/* Platform filter */}
            <div className="flex bg-muted rounded-lg p-0.5 gap-0.5 flex-wrap">
              {["all", "meta", "google", "tiktok"].map((pl) => (
                <button key={pl} onClick={() => setPlatformFilter(pl)}
                  className={cn("text-[11px] px-2 py-1 rounded-md transition-all font-medium capitalize",
                    platformFilter === pl ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {pl === "all" ? "Todos" : pl.charAt(0).toUpperCase() + pl.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215, 16%, 57%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: "hsl(215, 16%, 57%)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={40} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: "hsl(215, 16%, 57%)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}x`} width={28} />
            <ReTooltip contentStyle={tooltipStyle} />
            {(platformFilter === "all" || platformFilter === "meta") && (
              <Line yAxisId="left" type="monotone" dataKey="Meta Spend" stroke="#1877F2" strokeWidth={1.5} dot={false} />
            )}
            {(platformFilter === "all" || platformFilter === "google") && (
              <Line yAxisId="left" type="monotone" dataKey="Google Spend" stroke="#EA4335" strokeWidth={1.5} dot={false} />
            )}
            {(platformFilter === "all" || platformFilter === "tiktok") && (
              <Line yAxisId="left" type="monotone" dataKey="TikTok Spend" stroke="#9ca3af" strokeWidth={1.5} dot={false} />
            )}
            {(platformFilter === "all" || platformFilter === "meta") && (
              <Line yAxisId="right" type="monotone" dataKey="Meta ROAS" stroke="#60a5fa" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            )}
            {(platformFilter === "all" || platformFilter === "google") && (
              <Line yAxisId="right" type="monotone" dataKey="Google ROAS" stroke="#f87171" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      <div className="bg-card border border-border rounded-xl p-3 md:p-4 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Alertas Ativos</h2>
          <Badge variant="secondary" className="text-xs bg-destructive/15 text-destructive border-0">
            {activeAlerts.length} novos
          </Badge>
        </div>
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div key={alert.id}
              className={cn(
                "flex items-start gap-2.5 p-2.5 md:p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/30",
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
                <div className="text-[11px] text-muted-foreground truncate">{alert.description}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {alert.time}
                  </span>
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {alert.platform}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground flex-shrink-0">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
