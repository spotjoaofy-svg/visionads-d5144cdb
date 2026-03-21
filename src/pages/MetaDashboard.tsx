import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const LEVEL_TABS = ["Conta", "Campanhas", "Conjuntos", "Anúncios"];
const STATUS_FILTERS = ["Todos", "Ativo", "Pausado", "Encerrado"];
const DATE_PRESETS = ["Hoje", "7D", "14D", "30D", "Este mês"];
const METRICS = ["Impressões", "Cliques", "Spend", "CTR", "ROAS", "CPM", "CPC", "CPL"];
const PIE_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

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

export default function MetaDashboard() {
  const [level, setLevel] = useState("Campanhas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [datePreset, setDatePreset] = useState("30D");
  const [metric, setMetric] = useState("Spend");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filteredCampaigns = metaCampaigns.filter((c) => {
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Ativo") return c.status === "active";
    if (statusFilter === "Pausado") return c.status === "paused";
    if (statusFilter === "Encerrado") return c.status === "ended";
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
    Cliques: d.metaImpressions * d.metaCtr / 100,
  }));

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-up">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Meta Ads</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Loja Exemplo BR</p>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-2">
          {DATE_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setDatePreset(p)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-all",
                datePreset === p
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {[
          { title: "Impressões", value: (metaKPIs.impressions.value / 1000000).toFixed(1) + "M", change: metaKPIs.impressions.change },
          { title: "Alcance", value: (metaKPIs.reach.value / 1000).toFixed(0) + "k", change: metaKPIs.reach.change },
          { title: "Cliques", value: metaKPIs.clicks.value.toLocaleString("pt-BR"), change: metaKPIs.clicks.change },
          { title: "CTR", value: metaKPIs.ctr.value + "%", change: metaKPIs.ctr.change },
          { title: "Investimento", value: `R$ ${(metaKPIs.spend.value / 1000).toFixed(1)}k`, change: metaKPIs.spend.change },
          { title: "ROAS", value: metaKPIs.roas.value + "x", change: metaKPIs.roas.change },
        ].map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i * 40} />
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-card border border-border rounded-xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-foreground">Desempenho ao Longo do Tempo</h2>
          <div className="sm:ml-auto flex flex-wrap gap-1">
            {METRICS.map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md border transition-all",
                  metric === m
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
            <ReTooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={metric === "Impressões" ? "Impressões" : metric} stroke="#6366F1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaigns Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex gap-1">
            {LEVEL_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setLevel(t)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md transition-all font-medium",
                  level === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto flex gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md transition-all",
                  statusFilter === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Campanha","Objetivo","Status","Orçamento","Spend","Impressões","CTR","CPC","CPL","ROAS","Ações"].map((h) => (
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
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap metric-value">R$ {c.budget.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap metric-value">R$ {c.spend.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap metric-value">{c.impressions.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap metric-value">{c.ctr}%</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap metric-value">R$ {c.cpc.toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap metric-value">{c.cpl > 0 ? `R$ ${c.cpl.toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap metric-value">
                    <span className={cn("font-semibold", c.roas >= 3 ? "text-success" : c.roas >= 1.5 ? "text-warning" : "text-destructive")}>
                      {c.roas > 0 ? c.roas.toFixed(2) + "x" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10">
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {filteredCampaigns.length} campanhas · Página {page} de {pageCount}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "280ms" }}>
        {/* Placement Pie */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Investimento por Posicionamento</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={metaPlacementBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {metaPlacementBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Share"]} />
              <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Bar */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">CTR por Faixa Etária</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metaAgeBreakdown} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,20%)" />
              <XAxis dataKey="age" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} />
              <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "CTR"]} />
              <Bar dataKey="ctr" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Bar */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Invest. por Dispositivo</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={metaDeviceBreakdown} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,20%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="device" tick={{ fontSize: 10, fill: "hsl(215,16%,57%)" }} tickLine={false} axisLine={false} width={55} />
              <ReTooltip contentStyle={tooltipStyle} />
              <Bar dataKey="spend" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CTR Heatmap (simplified grid) */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">CTR — Dia da Semana × Horário</h3>
          <div className="overflow-x-auto">
            <div className="grid" style={{ gridTemplateColumns: "40px repeat(8, 1fr)", gap: "3px", minWidth: "300px" }}>
              <div />
              {["0h","3h","6h","9h","12h","15h","18h","21h"].map((h) => (
                <div key={h} className="text-[9px] text-muted-foreground text-center">{h}</div>
              ))}
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((day, di) => (
                <>
                  <div key={day + "-label"} className="text-[9px] text-muted-foreground flex items-center">{day}</div>
                  {[...Array(8)].map((_, hi) => {
                    const ctr = 0.5 + Math.random() * 3.7;
                    const intensity = Math.min(ctr / 4, 1);
                    return (
                      <div
                        key={`${di}-${hi}`}
                        className="rounded aspect-square"
                        style={{
                          background: `hsla(239, 84%, 67%, ${intensity * 0.8 + 0.05})`,
                          minHeight: "18px",
                        }}
                        title={`${ctr.toFixed(1)}% CTR`}
                      />
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
