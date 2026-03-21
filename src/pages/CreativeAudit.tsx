import { useState, useCallback } from "react";
import { Upload, X, CheckCircle, AlertTriangle, Lightbulb, Download, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { auditHistory } from "@/data/mockData";
import { cn } from "@/lib/utils";

function getPlatformBadgeClass(p: string) {
  return ({
    meta: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    google: "bg-red-600/20 text-red-400 border-red-600/30",
    tiktok: "bg-slate-600/20 text-slate-300 border-slate-600/30",
  } as Record<string, string>)[p.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";
}

function getScoreLabelClass(s: number) {
  return s >= 80 ? "text-success" : s >= 60 ? "text-warning" : "text-destructive";
}

const PLATFORM_OPTIONS = ["Meta Ads", "Google Ads", "TikTok Ads"];
const OBJECTIVES = ["Conversão", "Tráfego", "Geração de Leads", "Awareness", "Engajamento"];

const LOADING_MESSAGES = [
  "Analisando composição visual...",
  "Avaliando gancho do criativo...",
  "Verificando melhores práticas da plataforma...",
  "Calculando thumb-stop estimado...",
  "Gerando recomendações com IA...",
];

const MOCK_RESULT = {
  score: 88,
  breakdown: [
    { label: "Atenção visual", score: 91 },
    { label: "Clareza do CTA", score: 78 },
    { label: "Thumb-stop estimado", score: 95 },
    { label: "Boas práticas da plataforma", score: 82 },
    { label: "Elemento humano/emoção", score: 86 },
  ],
  strengths: [
    "Abertura impactante nos primeiros 3 segundos — alto thumb-stop",
    "Elemento humano presente aumenta empatia e conexão",
    "CTA claro e bem posicionado na parte inferior",
    "Boa proporção 9:16 otimizada para mobile e Reels",
    "Prova social visível aumenta credibilidade",
  ],
  improvements: [
    { issue: "Sem legenda no início do vídeo", suggestion: "Adicione legendas nos primeiros 5 segundos — 85% dos usuários assistem sem som" },
    { issue: "Logo aparece apenas no final", suggestion: "Mova o logo para os primeiros 2 segundos para reforçar branding" },
    { issue: "Texto na imagem excede 20% recomendado", suggestion: "Reduza o texto na imagem para melhorar alcance orgânico no Meta" },
  ],
  variations: [
    "Teste A: Comece mostrando o problema antes do produto",
    "Teste B: Adicione legendas nos primeiros 3 segundos com a oferta",
    "Teste C: Inclua número de clientes ou avaliação como prova social",
  ],
};

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? "stroke-success" : score >= 60 ? "stroke-warning" : score >= 40 ? "stroke-orange-500" : "stroke-destructive";
  const label = score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Regular" : "Precisa melhorar";
  const labelColor = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : score >= 40 ? "text-orange-500" : "text-destructive";
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(240,10%,20%)" strokeWidth="8" />
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset}
            className={cn("transition-all duration-1000", color)} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold metric-value text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className={cn("text-sm font-semibold", labelColor)}>{label}</span>
    </div>
  );
}

export default function CreativeAudit() {
  const [tab, setTab] = useState<"new" | "history">("new");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [platform, setPlatform] = useState("Meta Ads");
  const [objective, setObjective] = useState("Conversão");
  const [brand, setBrand] = useState("");
  const [audience, setAudience] = useState("");
  const [step, setStep] = useState<"upload" | "configure" | "loading" | "result">("upload");
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setStep("configure");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleAnalyze = () => {
    setStep("loading");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < LOADING_MESSAGES.length) {
        setLoadingMsg(i);
      } else {
        clearInterval(interval);
        setTimeout(() => setStep("result"), 800);
      }
    }, 900);
  };


  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold text-foreground">Auditoria de Criativos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Análise com IA para otimizar sua performance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit animate-fade-up" style={{ animationDelay: "80ms" }}>
        {([["new", "Nova Auditoria"], ["history", "Histórico"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("text-sm px-4 py-1.5 rounded-md transition-all font-medium",
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* NEW AUDIT */}
      {tab === "new" && (
        <div className="max-w-3xl animate-fade-up" style={{ animationDelay: "120ms" }}>
          {/* Step 1 - Upload */}
          {step === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/20"
              )}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Upload className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">Arraste sua imagem ou vídeo aqui</p>
                  <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG, GIF, MP4, MOV • Máx. 500MB</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Configure */}
          {step === "configure" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                {preview && (
                  <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{file ? (file.size / 1024 / 1024).toFixed(1) + " MB" : ""}</p>
                </div>
                <button onClick={() => { setFile(null); setPreview(null); setStep("upload"); }}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Plataforma</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORM_OPTIONS.map((p) => (
                      <button key={p} onClick={() => setPlatform(p)}
                        className={cn("py-2.5 px-3 rounded-xl border text-sm font-medium transition-all",
                          platform === p ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                        )}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Objetivo da campanha</Label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none"
                  >
                    {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">Nome da marca (opcional)</Label>
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex: Loja Exemplo"
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">Público-alvo (opcional)</Label>
                    <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex: Mulheres 25–45"
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm gap-2"
                onClick={handleAnalyze}
              >
                🔍 Analisar Criativo
              </Button>
            </div>
          )}

          {/* Step 3 - Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center py-16 gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground mb-2">Analisando seu criativo...</p>
                <p className="text-sm text-muted-foreground animate-pulse">{LOADING_MESSAGES[loadingMsg]}</p>
              </div>
              <div className="w-full max-w-xs bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-700"
                  style={{ width: `${((loadingMsg + 1) / LOADING_MESSAGES.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Step 4 - Result */}
          {step === "result" && (
            <div className="space-y-4 animate-fade-up">
              {/* Score + Breakdown */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreCircle score={MOCK_RESULT.score} />
                  <div className="flex-1 w-full space-y-2">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Detalhamento do Score</h3>
                    {MOCK_RESULT.breakdown.map((b) => (
                      <div key={b.label} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-44 flex-shrink-0">{b.label}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", scoreLabel(b.score).replace("text-", "bg-"))}
                            style={{ width: `${b.score}%` }}
                          />
                        </div>
                        <span className={cn("text-xs font-bold metric-value w-8 text-right", scoreLabel(b.score))}>{b.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <h3 className="text-sm font-semibold text-success">Pontos Fortes</h3>
                </div>
                <ul className="space-y-1.5">
                  {MOCK_RESULT.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-success flex-shrink-0">✅</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <h3 className="text-sm font-semibold text-warning">Pontos de Melhoria</h3>
                </div>
                <div className="space-y-3">
                  {MOCK_RESULT.improvements.map((item, i) => (
                    <div key={i} className="text-sm">
                      <div className="flex gap-2 text-muted-foreground">
                        <span className="text-warning flex-shrink-0">⚠️</span>
                        <span className="font-medium text-foreground">{item.issue}</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6 mt-0.5">{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variations */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-primary">Sugestões de Variação</h3>
                </div>
                <ul className="space-y-2">
                  {MOCK_RESULT.variations.map((v, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary flex-shrink-0">💡</span> {v}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground hover:text-foreground">
                  <Download className="w-3.5 h-3.5" /> Baixar Relatório PDF
                </Button>
                <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground hover:text-foreground"
                  onClick={() => { setStep("upload"); setFile(null); setPreview(null); }}>
                  <RefreshCw className="w-3.5 h-3.5" /> Analisar Outro
                </Button>
                <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                  <Send className="w-3.5 h-3.5" /> Enviar ao AI Agent
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Data","Criativo","Plataforma","Tipo","Score","Objetivo","Ações"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditHistory.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(a.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={a.thumbnail} alt="" className="w-10 h-8 rounded object-cover flex-shrink-0" />
                        <span className="text-foreground truncate max-w-[140px]">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{platformBadge(a.platform)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                    <td className="px-4 py-3">
                      <span className={cn("font-bold metric-value text-sm", scoreLabel(a.score))}>{a.score}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.objective}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10">
                        Ver resultado
                      </Button>
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

  function platformBadge(p: string) {
    const cls = {
      "meta": "bg-blue-600/20 text-blue-400 border-blue-600/30",
      "google": "bg-red-600/20 text-red-400 border-red-600/30",
      "tiktok": "bg-slate-600/20 text-slate-300 border-slate-600/30",
    }[p.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";
    return <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", cls)}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>;
  }

  function scoreLabel(s: number) {
    return s >= 80 ? "text-success" : s >= 60 ? "text-warning" : "text-destructive";
  }
}
