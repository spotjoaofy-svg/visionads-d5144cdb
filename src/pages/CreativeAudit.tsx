import { useState, useCallback } from "react";
import { Upload, X, CheckCircle, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function getScoreLabelClass(s: number) {
  return s >= 80 ? "text-success" : s >= 60 ? "text-warning" : "text-destructive";
}

const PLATFORM_OPTIONS = ["Meta Ads", "Google Ads", "TikTok Ads"];
const OBJECTIVES = ["Conversão", "Tráfego", "Geração de Leads", "Awareness", "Engajamento"];

const LOADING_MESSAGES = [
  "Carregando criativo para análise...",
  "Analisando composição visual...",
  "Avaliando gancho e thumb-stop...",
  "Verificando boas práticas da plataforma...",
  "Gerando diagnóstico com IA...",
];

interface AuditResult {
  overall_score: number;
  breakdown: { label: string; score: number; comment: string }[];
  strengths: string[];
  improvements: { issue: string; suggestion: string }[];
  variations: string[];
}

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
          <span className="text-3xl font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className={cn("text-sm font-semibold", labelColor)}>{label}</span>
    </div>
  );
}

export default function CreativeAudit() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [platform, setPlatform] = useState("Meta Ads");
  const [objective, setObjective] = useState("Conversão");
  const [brand, setBrand] = useState("");
  const [audience, setAudience] = useState("");
  const [step, setStep] = useState<"upload" | "configure" | "loading" | "result">("upload");
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

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

  const toBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:...;base64, prefix
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
    });

  const handleAnalyze = async () => {
    if (!file) return;
    setStep("loading");
    setLoadingMsg(0);

    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx++;
      if (msgIdx < LOADING_MESSAGES.length) {
        setLoadingMsg(msgIdx);
      }
    }, 1200);

    try {
      const imageBase64 = await toBase64(file);
      const isVideo = file.type.startsWith("video/");

      // For videos, we can only analyze the thumbnail/first frame - send as image
      // If it's a video, we'll note that in the context
      const mimeType = isVideo ? "image/jpeg" : file.type;

      const { data, error } = await supabase.functions.invoke("creative-audit", {
        body: {
          imageBase64: isVideo ? "" : imageBase64,
          mimeType,
          platform,
          objective,
          brand,
          audience,
          isVideo,
          // For videos, send the preview thumbnail if available
          videoNote: isVideo ? "Este é um arquivo de vídeo. Analise com base nas melhores práticas para vídeos em " + platform : undefined,
        },
      });

      clearInterval(interval);

      if (error || !data?.result) {
        toast.error(data?.error ?? error?.message ?? "Erro ao analisar criativo");
        setStep("configure");
        return;
      }

      setResult(data.result);
      setStep("result");
    } catch (e: any) {
      clearInterval(interval);
      toast.error(e?.message ?? "Erro ao analisar criativo");
      setStep("configure");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold text-foreground">Auditoria de Criativos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Análise real com IA Gemini Vision</p>
      </div>

      <div className="max-w-3xl animate-fade-up" style={{ animationDelay: "80ms" }}>
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
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG, GIF, MP4, MOV • Máx. 10MB</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Configure */}
        {step === "configure" && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
              {preview && (
                file?.type.startsWith("video/") ? (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-2xl">🎬</div>
                ) : (
                  <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                )
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{file ? (file.size / 1024 / 1024).toFixed(1) + " MB" : ""}</p>
                <p className="text-xs text-primary mt-1">
                  {file?.type.startsWith("video/") ? "🎬 Vídeo — analisando por boas práticas" : "🖼️ Imagem — análise visual completa com IA"}
                </p>
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
                  <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex: Minha Marca"
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
              🔍 Analisar com IA
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
              <p className="text-base font-semibold text-foreground mb-2">Analisando com IA Gemini Vision...</p>
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
        {step === "result" && result && (
          <div className="space-y-4 animate-fade-up">
            {/* Score + Breakdown */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreCircle score={result.overall_score} />
                <div className="flex-1 w-full space-y-2">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Detalhamento do Score</h3>
                  {result.breakdown.map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className="text-xs text-muted-foreground w-44 flex-shrink-0">{b.label}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700",
                              b.score >= 80 ? "bg-success" : b.score >= 60 ? "bg-warning" : "bg-destructive"
                            )}
                            style={{ width: `${b.score}%` }}
                          />
                        </div>
                        <span className={cn("text-xs font-bold w-8 text-right", getScoreLabelClass(b.score))}>{b.score}</span>
                      </div>
                      {b.comment && (
                        <p className="text-[10px] text-muted-foreground ml-[11.5rem] mb-1 leading-relaxed">{b.comment}</p>
                      )}
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
                {result.strengths.map((s, i) => (
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
                {result.improvements.map((item, i) => (
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
                <h3 className="text-sm font-semibold text-primary">Sugestões de Variação (A/B Tests)</h3>
              </div>
              <ul className="space-y-2">
                {result.variations.map((v, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary flex-shrink-0">💡</span> {v}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground hover:text-foreground"
                onClick={() => { setStep("upload"); setFile(null); setPreview(null); setResult(null); }}>
                <RefreshCw className="w-3.5 h-3.5" /> Analisar Outro
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
