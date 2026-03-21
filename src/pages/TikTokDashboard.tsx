import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer,
} from "recharts";
import {
  tiktokCampaigns, tiktokKPIs, videoPerformance, dailyMetrics,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

const DATE_PRESETS = ["Hoje", "7D", "14D", "30D", "Este mês"];
const tooltipStyle = {
  backgroundColor: "hsl(240, 13%, 10%)",
  border: "1px solid hsl(240, 10%, 20%)",
  borderRadius: "8px",
  color: "hsl(214, 32%, 97%)",
  fontSize: "12px",
};

function statusBadge(status: string) {
  if (status === "active") return <StatusBadge severity="success" label="Ativo" />;
  if (status === "paused") return <StatusBadge severity="warning" label="Pausado" />;
  return <StatusBadge severity="danger" label="Encerrado" />;
}

export default function TikTokDashboard() {
  const [datePreset, setDatePreset] = useState("30D");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const pageCount = Math.ceil(tiktokCampaigns.length / PER_PAGE);
  const paginated = tiktokCampaigns.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const chartData = dailyMetrics.slice(-30).map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    Spend: d.tiktokSpend,
    ROAS: d.tiktokRoas,
    Impressões: d.tiktokImpressions / 1000,
  }));

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-up">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">TikTok Ads</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Loja Exemplo TK</p>
        </div>
        <div className="sm:ml-auto flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {DATE_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setDatePreset(p)}
              className={cn(
                "text-xs px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap flex-shrink-0",
                datePreset === p
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {[
          { title: "Impressões", value: (tiktokKPIs.impressions.value / 1000000).toFixed(1) + "M", change: tiktokKPIs.impressions.change },
          { title: "Cliques", value: tiktokKPIs.clicks.value.toLocaleString("pt-BR"), change: tiktokKPIs.clicks.change },
          { title: "CTR", value: tiktokKPIs.ctr.value + "%", change: tiktokKPIs.ctr.change },
          { title: "CPM", value: `R$ ${tiktokKPIs.cpm.value.toFixed(2)}`, change: tiktokKPIs.cpm.change },
          { title: "Views", value: (tiktokKPIs.videoViews.value / 1000000).toFixed(1) + "M", change: tiktokKPIs.videoViews.change },
          { title: "CPV", value: `R$ ${tiktokKPIs.cpv.value.toFixed(4)}`, change: tiktokKPIs.cpv.change },
          { title: "Conv.", value: tiktokKPIs.conversions.value.toLocaleString("pt-BR"), change: tiktokKPIs.conversions.change },
          { title: "ROAS", value: tiktokKPIs.roas.value + "x", change: tiktokKPIs.roas.change },
        ].map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i * 30} />
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <h2 className="text-sm font-semibold text-foreground mb-4">Invest. e ROAS — 30 Dias</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={30} tickFormatter={(v) => `${v}x`} />
            <ReTooltip contentStyle={tooltipStyle} />
            <Line yAxisId="left" type="monotone" dataKey="Spend" stroke="#9ca3af" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="ROAS" stroke="#8B5CF6" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaigns Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="px-3 sm:px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Campanhas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {["Campanha","Objetivo","Status","Orçamento","Spend","Impr.","Cliques","CTR","CPM","Views","CPV","Conv.","ROAS"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap max-w-[130px] truncate">{c.name}</td>
                  <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{c.objective}</td>
                  <td className="px-3 py-3">{statusBadge(c.status)}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">R$ {c.budget.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-3 text-foreground metric-value whitespace-nowrap">R$ {c.spend.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">{c.impressions.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">{c.clicks.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value">{c.ctr}%</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">R$ {c.cpm.toFixed(2)}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">{c.videoViews.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">{c.cpv > 0 ? `R$ ${c.cpv.toFixed(4)}` : "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value">{c.conversions}</td>
                  <td className="px-3 py-3 metric-value whitespace-nowrap">
                    <span className={cn("font-semibold", c.roas >= 3 ? "text-success" : c.roas >= 1.5 ? "text-warning" : "text-muted-foreground")}>
                      {c.roas > 0 ? c.roas.toFixed(2) + "x" : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-t border-border gap-2">
            <span className="text-xs text-muted-foreground">Pág. {page} de {pageCount}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Ant.</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Próx.</Button>
            </div>
          </div>
        )}
      </div>

      {/* Video Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Watch Time Médio (s)</h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={videoPerformance} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,20%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} unit="s" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={80} />
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}s`, "Watch Time"]} />
              <Bar dataKey="avgWatchTime" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">View-Through Rate (%)</h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={videoPerformance} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,20%)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} unit="%" />
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "VTR"]} />
              <Bar dataKey="vtr" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
