import { useState } from "react";
import { Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import { creativesRanking, campaignsRanking } from "@/data/mockData";
import { cn } from "@/lib/utils";

const PLATFORM_FILTER = ["Todos", "Meta", "Google", "TikTok"];
const FORMAT_FILTER = ["Todos", "Image", "Video", "Carousel"];

function AiScore({ score }: { score: number }) {
  const color = score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";
  const bg = score >= 70 ? "bg-success/10 border-success/30" : score >= 40 ? "bg-warning/10 border-warning/30" : "bg-destructive/10 border-destructive/30";
  return (
    <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0", bg)}>
      <span className={cn("text-xs font-bold metric-value", color)}>{score}</span>
    </div>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const cfg = {
    meta: { label: "Meta", cls: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
    google: { label: "Google", cls: "bg-red-600/20 text-red-400 border-red-600/30" },
    tiktok: { label: "TikTok", cls: "bg-slate-600/20 text-slate-300 border-slate-600/30" },
  }[platform] ?? { label: platform, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-yellow-400 font-bold text-sm">#1 🥇</span>;
  if (rank === 2) return <span className="text-slate-300 font-bold text-sm">#2 🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-bold text-sm">#3 🥉</span>;
  return <span className="text-muted-foreground text-sm font-mono">#{rank}</span>;
}

export default function Rankings() {
  const [tab, setTab] = useState<"creatives" | "campaigns">("creatives");
  const [platformFilter, setPlatformFilter] = useState("Todos");
  const [formatFilter, setFormatFilter] = useState("Todos");

  const filteredCreatives = creativesRanking.filter((c) => {
    const pMatch = platformFilter === "Todos" || c.platform === platformFilter.toLowerCase();
    const fMatch = formatFilter === "Todos" || c.format === formatFilter;
    return pMatch && fMatch;
  });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-warning" />
          <h1 className="text-xl font-semibold text-foreground">Rankings de Desempenho</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Pontuação por IA com base nos dados das suas contas conectadas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit animate-fade-up" style={{ animationDelay: "80ms" }}>
        {(["creatives", "campaigns"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "text-sm px-4 py-1.5 rounded-md transition-all font-medium",
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "creatives" ? "Criativos" : "Campanhas"}
          </button>
        ))}
      </div>

      {/* CREATIVES TAB */}
      {tab === "creatives" && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-1 flex-wrap">
              <span className="text-xs text-muted-foreground self-center mr-1">Plataforma:</span>
              {PLATFORM_FILTER.map((p) => (
                <button key={p} onClick={() => setPlatformFilter(p)}
                  className={cn("text-xs px-2.5 py-1 rounded-md border transition-all",
                    platformFilter === p ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  )}>
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              <span className="text-xs text-muted-foreground self-center mr-1">Formato:</span>
              {FORMAT_FILTER.map((f) => (
                <button key={f} onClick={() => setFormatFilter(f)}
                  className={cn("text-xs px-2.5 py-1 rounded-md border transition-all",
                    formatFilter === f ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  )}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Creatives grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCreatives.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden card-hover animate-fade-up">
                  <div className="relative">
                    <img
                      src={c.thumbnail}
                      alt={c.name}
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <RankBadge rank={c.rank} />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <PlatformBadge platform={c.platform} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded border bg-muted/80 text-muted-foreground border-border">
                        {c.format}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-medium text-foreground leading-tight line-clamp-2 flex-1">{c.name}</p>
                      <AiScore score={c.aiScore} />
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {[
                        { label: "CTR", value: c.ctr + "%" },
                        { label: "Conv", value: c.convRate + "%" },
                        { label: "ROAS", value: c.roas + "x" },
                        { label: "Freq", value: c.frequency + "x" },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="text-[10px] text-muted-foreground">{m.label}</div>
                          <div className="text-xs font-semibold metric-value text-foreground">{m.value}</div>
                        </div>
                      ))}
                    </div>
                    {c.auditAvailable && (
                      <Button size="sm" variant="outline" className="w-full mt-2.5 h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                        Ver Auditoria
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Winning Patterns */}
            <div className="bg-card border border-border rounded-xl p-4 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-semibold text-foreground">Padrões Vencedores</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Top formato", value: "Vídeo", detail: "68% dos top performers" },
                  { label: "Duração média", value: "18s", detail: "Vídeos com melhor ROAS" },
                  { label: "Melhor CTA", value: "Saiba mais", detail: "CTR 2.4x maior" },
                  { label: "Elemento chave", value: "UGC / Depoimento", detail: "Conv. rate +38%" },
                ].map((p) => (
                  <div key={p.label} className="p-3 bg-muted/40 rounded-lg">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.label}</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">{p.value}</div>
                    <div className="text-xs text-success mt-0.5">{p.detail}</div>
                  </div>
                ))}

                <div className="p-3 bg-muted/40 rounded-lg">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Palavras no Headline</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Grátis", "Desconto", "Hoje", "Exclusivo", "Novo", "Promoção", "Especial"].map((w, i) => (
                      <span
                        key={w}
                        className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20"
                        style={{ fontSize: `${10 + (7 - i)}px` }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAMPAIGNS TAB */}
      {tab === "campaigns" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Rank","Campanha","Plataforma","Objetivo","Spend","ROAS","Conv.","AI Score","Tendência"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaignsRanking.map((c) => (
                  <tr key={c.rank} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><RankBadge rank={c.rank} /></td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3"><PlatformBadge platform={c.platform} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.objective}</td>
                    <td className="px-4 py-3 metric-value text-foreground whitespace-nowrap">R$ {c.spend.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3 metric-value">
                      <span className={cn("font-semibold", c.roas >= 6 ? "text-success" : c.roas >= 3 ? "text-warning" : "text-muted-foreground")}>
                        {c.roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="px-4 py-3 metric-value text-muted-foreground">{c.conversions}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", c.aiScore >= 80 ? "bg-success" : c.aiScore >= 60 ? "bg-warning" : "bg-destructive")}
                            style={{ width: `${c.aiScore}%` }}
                          />
                        </div>
                        <span className={cn("font-bold text-xs metric-value", c.aiScore >= 80 ? "text-success" : c.aiScore >= 60 ? "text-warning" : "text-destructive")}>
                          {c.aiScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-8 w-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={c.trend.map((v) => ({ v }))}>
                            <Line type="monotone" dataKey="v" stroke="#6366F1" strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
