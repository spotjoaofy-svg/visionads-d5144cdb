import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  googleCampaigns, googleKPIs, searchTerms, qualityScoreData, dailyMetrics,
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

export default function GoogleDashboard() {
  const [datePreset, setDatePreset] = useState("30D");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const pageCount = Math.ceil(googleCampaigns.length / PER_PAGE);
  const paginated = googleCampaigns.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const chartData = dailyMetrics.slice(-30).map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    Spend: d.googleSpend,
    ROAS: d.googleRoas,
  }));

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-up">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Google Ads</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Loja Exemplo</p>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {[
          { title: "Impressões", value: (googleKPIs.impressions.value / 1000).toFixed(0) + "k", change: googleKPIs.impressions.change },
          { title: "Cliques", value: googleKPIs.clicks.value.toLocaleString("pt-BR"), change: googleKPIs.clicks.change },
          { title: "CTR", value: googleKPIs.ctr.value + "%", change: googleKPIs.ctr.change },
          { title: "CPC Médio", value: `R$ ${googleKPIs.avgCpc.value.toFixed(2)}`, change: googleKPIs.avgCpc.change },
          { title: "Conversões", value: googleKPIs.conversions.value.toLocaleString("pt-BR"), change: googleKPIs.conversions.change },
          { title: "CPA", value: `R$ ${googleKPIs.cpa.value.toFixed(2)}`, change: googleKPIs.cpa.change },
          { title: "ROAS", value: googleKPIs.roas.value + "x", change: googleKPIs.roas.change },
        ].map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i * 40} />
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <h2 className="text-sm font-semibold text-foreground mb-4">Invest. e ROAS — 30 Dias</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={30} tickFormatter={(v) => `${v}x`} />
            <ReTooltip contentStyle={tooltipStyle} />
            <Line yAxisId="left" type="monotone" dataKey="Spend" stroke="#EA4335" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="ROAS" stroke="#34A853" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaigns Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="px-3 sm:px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Campanhas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {["Campanha","Tipo","Status","Orçamento","Spend","Impr.","Cliques","CTR","Conv.","CPA","ROAS"].map((h) => (
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
                  <td className="px-3 py-3"><span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground whitespace-nowrap">{c.type}</span></td>
                  <td className="px-3 py-3">{statusBadge(c.status)}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">R$ {c.budget.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-3 text-foreground metric-value whitespace-nowrap">R$ {c.spend.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">{c.impressions.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">{c.clicks.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">{c.ctr}%</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">{c.conversions}</td>
                  <td className="px-3 py-3 text-muted-foreground metric-value whitespace-nowrap">{c.cpa > 0 ? `R$ ${c.cpa.toFixed(2)}` : "—"}</td>
                  <td className="px-3 py-3 metric-value whitespace-nowrap">
                    <span className={cn("font-semibold", c.roas >= 4 ? "text-success" : c.roas >= 2 ? "text-warning" : "text-muted-foreground")}>
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

      {/* Search Terms + Quality Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
        {/* Search Terms */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-3 sm:px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Termos de Pesquisa</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[360px]">
              <thead>
                <tr className="border-b border-border">
                  {["Termo","Impr.","Cliques","CTR","Conv.","CPA"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {searchTerms.map((s, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-3 py-2.5 text-foreground max-w-[120px] truncate">{s.term}</td>
                    <td className="px-3 py-2.5 text-muted-foreground metric-value">{s.impressions.toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2.5 text-muted-foreground metric-value">{s.clicks.toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2.5 text-muted-foreground metric-value">{s.ctr}%</td>
                    <td className="px-3 py-2.5 text-muted-foreground metric-value">{s.conversions}</td>
                    <td className="px-3 py-2.5 text-muted-foreground metric-value">R$ {s.cpa.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality Score */}
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Distribuição do Quality Score</h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={qualityScoreData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,20%)" />
              <XAxis dataKey="score" tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} palavras`, "Keywords"]} />
              <Bar dataKey="count" fill="#34A853" radius={[4, 4, 0, 0]}>
                {qualityScoreData.map((_, i) => (
                  <Cell key={i} fill={i >= 3 ? "#10B981" : i >= 2 ? "#F59E0B" : "#EF4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
