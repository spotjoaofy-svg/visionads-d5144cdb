import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  metaCampaigns, metaKPIs, metaPlacementBreakdown,
  metaAgeBreakdown, metaDeviceBreakdown, dailyMetrics,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useAdAccounts, useAccountInsights } from "src/hooks/useMeta";

const LEVEL_TABS = ["Campanhas", "Conjuntos", "Anúncios"];
const STATUS_FILTERS = ["Todos", "Ativo", "Pausado"];
const DATE_PRESETS = ["7D", "14D", "30D", "Este mês"];
const METRICS = ["Spend", "CTR", "ROAS", "Impressões", "Cliques", "CPM", "CPC"];
const PIE_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

const tooltipStyle = {
  backgroundColor: "hsl(240, 13%, 10%)",
  border: "1px solid hsl(240, 10%, 20%)",
  borderRadius: "8px",
  color: "hsl(214, 32%, 97%)",
  fontSize: "11px",
};

function statusBadge(status: string) {
  if (status === "active") return <StatusBadge severity="success" label="Ativo" />;
  if (status === "paused") return <StatusBadge severity="warning" label="Pausado" />;
  return <StatusBadge severity="danger" label="Encerrado" />;
}

export default function MetaDashboard() {
  const [level, setLevel] = useState("Campanhas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [datePreset, setDatePreset] = useState("30D");
  const [metric, setMetric] = useState("Spend");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  // Real Meta hooks
  const { data: accounts, isLoading: accountsLoading } = useAdAccounts();
  const firstAccount = accounts?.[0];
  const accountId = firstAccount?.account_id || firstAccount?.id;
  const [range] = useState({ since: "2026-03-01", until: "2026-03-22" });
  const { data: insights, isLoading: insightsLoading } = useAccountInsights(accountId, range.since, range.until);

  const filteredCampaigns = metaCampaigns.filter((c) => {
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Ativo") return c.status === "active";
    if (statusFilter === "Pausado") return c.status === "paused";
    return true;
  });

  const pageCount = Math.ceil(filteredCampaigns.length / PER_PAGE);
  const paginated = filteredCampaigns.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const chartData = dailyMetrics.slice(-30).map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    Spend: d.metaSpend,
    CTR: d.metaCtr,
    ROAS: d.metaRoas,
    Impressões: d.metaImpressions / 1000,
    Cliques: Math.round(d.metaImpressions * d.metaCtr / 100),
  }));

  const summary = useMemo(() => {
    if (!insights || insights.length === 0) return { impressions: 0, clicks: 0, spend: 0 };
    return insights.reduce(
      (acc: any, row: any) => {
        acc.impressions += Number(row.impressions ?? 0);
        acc.clicks += Number(row.clicks ?? 0);
        acc.spend += Number(row.spend ?? 0);
        return acc;
      },
      { impressions: 0, clicks: 0, spend: 0 }
    );
  }, [insights]);

  return (
    <div className="p-3 md:p-6 space-y-4 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 animate-fade-up">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-foreground">Meta Ads</h1>
            <p className="text-[10px] text-muted-foreground">Loja Exemplo BR</p>
          </div>
        </div>
        {/* Date presets — scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {DATE_PRESETS.map((p) => (
            <button key={p} onClick={() => setDatePreset(p)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all flex-shrink-0",
                datePreset === p
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards — 2 cols mobile, 3 md, 6 lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        { [
          { title: "Impressões", value: summary.impressions.toLocaleString("pt-BR"), change: metaKPIs.impressions.change },
          { title: "Alcance", value: (metaKPIs.reach.value / 1000).toFixed(0) + "k", change: metaKPIs.reach.change },
          { title: "Cliques", value: summary.clicks.toLocaleString("pt-BR"), change: metaKPIs.clicks.change },
          { title: "CTR", value: (summary.impressions > 0 ? ((summary.clicks / summary.impressions) * 100).toFixed(2) : "0.00") + "%", change: metaKPIs.ctr.change },
          { title: "Investimento", value: `R$ ${(summary.spend / 1000).toFixed(1)}k`, change: metaKPIs.spend.change },
          { title: "ROAS", value: metaKPIs.roas.value + "x", change: metaKPIs.roas.change },
        ].map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i * 40} />
        )) }
      </div>

      {/* Performance Chart */}
      <div className="bg-card border border-border rounded-xl p-3 md:p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="flex flex-col gap-2 mb-3">
          <h2 className="text-sm font-semibold text-foreground">Desempenho ao Longo do Tempo</h2>
          {/* Metric selector — horizontal scroll */}
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
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={36} />
            <ReTooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={metric} stroke="#6366F1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign table — card list on mobile, table on desktop */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
        {/* Toolbar */}
        <div className="flex flex-col gap-2 p-3 md:p-4 border-b border-border">
          {/* Level tabs */}
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
          {/* Status filters */}
          <div className="flex gap-1">
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

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                { ["Campanha", "Objetivo", "Status", "Orçamento", "Spend", "Impressões", "CTR", "CPC", "ROAS", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap max-w-[180px] truncate">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.objective}</td>
                  <td className="px-4 py-3">{statusBadge(c.status)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">R$ {c.budget.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">R$ {c.spend.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.impressions.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.ctr}%</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">R$ {c.cpc.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={cn("font-semibold", c.roas >= 3 ? "text-success" : c.roas >= 1.5 ? "text-warning" : "text-destructive")}>
                      {c.roas > 0 ? c.roas.toFixed(2) + "x" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10">Ver</Button>
                  </td>
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
                  <div className="text-[10px] text-muted-foreground">{c.objective}</div>
                </div>
                {statusBadge(c.status)}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[10px] text-muted-foreground">Spend</div>
                  <div className="text-xs font-semibold text-foreground">R$ {(c.spend / 1000).toFixed(1)}k</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">CTR</div>
                  <div className="text-xs font-semibold text-foreground">{c.ctr}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">ROAS</div>
                  <div className={cn("text-xs font-semibold", c.roas >= 3 ? "text-success" : c.roas >= 1.5 ? "text-warning" : "text-destructive")}>
                    {c.roas > 0 ? c.roas.toFixed(2) + "x" : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-3 md:px-4 py-3 border-t border-border">
            <span className="text-[11px] text-muted-foreground">
              {filteredCampaigns.length} campanhas · {page}/{pageCount}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Ant.</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Próx.</Button>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown charts — 1 col mobile, 2 col sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "280ms" }}>
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Investimento por Posicionamento</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={metaPlacementBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {metaPlacementBreakdown.map((_, i) => (
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
            <BarChart data={metaAgeBreakdown} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,20%)" />
              <XAxis dataKey="age" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "CTR"]} />
              <Bar dataKey="ctr" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
