import { useState, useCallback } from "react";
import { Upload, X, CheckCircle, AlertTriangle, Lightbulb, RefreshCw, ImageIcon, Video, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function getScoreLabelClass(s: number) {
  return s >= 80 ? "text-success" : s >= 60 ? "text-warning" : "text-destructive";
}

const PLATFORM_OPTIONS = ["Meta Ads", "Instagram"];
const PLACEMENTS = [
  { key: "feed",             label: "Feed",           desc: "1:1 ou 4:5" },
  { key: "reels",            label: "Reels",          desc: "9:16 vertical" },
  { key: "stories",         label: "Stories",        desc: "9:16 vertical" },
  { key: "audience_network", label: "Audience Net.",  desc: "Variado" },
];
const OBJECTIVES = ["Conversão", "Tráfego", "Geração de Leads", "Awareness", "Engajamento"];

const IMAGE_LOADING_MSGS = [
  "Carregando imagem para análise visual...",
  "Verificando composição e hierarquia visual...",
  "Analisando safe zones e posicionamento de texto...",
  "Avaliando adequação ao posicionamento selecionado...",
  "Gerando diagnóstico completo com IA...",
];

const VIDEO_LOADING_MSGS = [
  "Carregando vídeo para análise...",
  "Extraindo frame principal para análise visual...",
  "Avaliando thumb-stop e primeiros segundos...",
  "Verificando boas práticas de vídeo para o posicionamento...",
  "Gerando análise completa com IA...",
];

interface AuditResult {
  overall_score: number;
  placement_compliance?: {
    is_compliant: boolean;
    issues: string[];
    recommendations: string[];
  };
  breakdown: { label: string; score: number; comment: string }[];
  strengths: string[];
  improvements: { issue: string; suggestion: string }[];
  variations: string[];
  audience_fit?: string | null;
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

// ─── Single audit panel (used for both image and video) ────────────────────────
function AuditPanel({ mediaType }: { mediaType: "image" | "video" }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [platform, setPlatform] = useState("Meta Ads");
  const [placement, setPlacement] = useState("feed");
  const [objective, setObjective] = useState("Conversão");
  const [audience, setAudience] = useState("");
  const [step, setStep] = useState<"upload" | "configure" | "loading" | "result">("upload");
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const accept = mediaType === "image" ? "image/*" : "video/*";
  const loadingMsgs = mediaType === "image" ? IMAGE_LOADING_MSGS : VIDEO_LOADING_MSGS;
  const maxSizeMB = mediaType === "image" ? 10 : 50;

  const handleFile = (f: File) => {
    if (f.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`);
      return;
    }
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
        const res = reader.result as string;
        resolve(res.split(",")[1]);
      };
      reader.onerror = reject;
    });

  // For video: extract first frame as JPEG base64
  const extractVideoFrame = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(f);
      video.crossOrigin = "anonymous";
      video.currentTime = 0.5;
      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1080;
        canvas.height = video.videoHeight || 1920;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl.split(",")[1]);
      };
      video.onerror = reject;
    });

  const handleAnalyze = async () => {
    if (!file) return;
    setStep("loading");
    setLoadingMsg(0);

    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx++;
      if (msgIdx < loadingMsgs.length) setLoadingMsg(msgIdx);
    }, 1800);

    try {
      let mediaBase64: string;
      let mimeType: string;

      if (mediaType === "video") {
        // Extract first frame for analysis
        mediaBase64 = await extractVideoFrame(file);
        mimeType = "image/jpeg";
      } else {
        mediaBase64 = await toBase64(file);
        mimeType = file.type;
      }

      const { data, error } = await supabase.functions.invoke("creative-audit", {
        body: {
          mediaBase64,
          mimeType,
          platform,
          placement,
          objective,
          audience: audience.trim() || undefined,
          isVideo: mediaType === "video",
          mediaType,
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

  const reset = () => { setFile(null); setPreview(null); setResult(null); setStep("upload"); };

  return (
    <div className="max-w-3xl">
      {/* Step 1 — Upload */}
      {step === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/20"
          )}
          onClick={() => document.getElementById(`file-input-${mediaType}`)?.click()}
        >
          <input
            id={`file-input-${mediaType}`}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              {mediaType === "image"
                ? <ImageIcon className="w-7 h-7 text-muted-foreground" />
                : <Video className="w-7 h-7 text-muted-foreground" />}
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                {mediaType === "image" ? "Arraste sua imagem aqui" : "Arraste seu vídeo aqui"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground mt-2">
                {mediaType === "image" ? "JPG, PNG, GIF, WEBP • Máx. 10MB" : "MP4, MOV, AVI • Máx. 50MB"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Configure */}
      {step === "configure" && (
        <div className="space-y-5">
          {/* File preview */}
          <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
            {preview && (
              mediaType === "video"
                ? (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    <video src={preview} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )
                : <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{file ? (file.size / 1024 / 1024).toFixed(1) + " MB" : ""}</p>
              <p className="text-xs text-primary mt-1">
                {mediaType === "video" ? "🎬 Vídeo — frame será extraído para análise visual" : "🖼️ Imagem — análise visual completa com IA Gemini"}
              </p>
            </div>
            <button onClick={reset} className="text-muted-foreground hover:text-foreground flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Config form */}
          <div className="space-y-4">
            {/* Platform */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Plataforma</Label>
              <div className="flex gap-2">
                {PLATFORM_OPTIONS.map((p) => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className={cn("py-2 px-4 rounded-xl border text-sm font-medium transition-all",
                      platform === p ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    )}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Placement */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Posicionamento
                <span className="text-[10px] text-muted-foreground ml-2">Importante para verificar safe zones</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLACEMENTS.map((pl) => (
                  <button key={pl.key} onClick={() => setPlacement(pl.key)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-left transition-all",
                      placement === pl.key ? "border-primary bg-primary/15" : "border-border hover:border-muted-foreground"
                    )}>
                    <div className={cn("text-sm font-medium", placement === pl.key ? "text-primary" : "text-foreground")}>{pl.label}</div>
                    <div className="text-[10px] text-muted-foreground">{pl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Objective */}
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

            {/* Audience */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Público-alvo
                <span className="text-[10px] text-muted-foreground ml-2">opcional — se informado, a IA avalia se o criativo atrai esse público</span>
              </Label>
              <Input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Ex: Mulheres 25–45, interesse em moda e beleza"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm gap-2"
            onClick={handleAnalyze}
          >
            🔍 Analisar com IA Gemini Vision
          </Button>
        </div>
      )}

      {/* Step 3 — Loading */}
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
            <p className="text-sm text-muted-foreground animate-pulse">{loadingMsgs[loadingMsg]}</p>
          </div>
          <div className="w-full max-w-xs bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-700"
              style={{ width: `${((loadingMsg + 1) / loadingMsgs.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 4 — Result */}
      {step === "result" && result && (
        <div className="space-y-4 animate-fade-up">
          {/* Score + Breakdown */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreCircle score={result.overall_score} />
              <div className="flex-1 w-full space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Detalhamento do Score</h3>
                {result.breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="text-xs text-muted-foreground w-52 flex-shrink-0 truncate">{b.label}</span>
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
                      <p className="text-[10px] text-muted-foreground ml-[13.5rem] mb-1.5 leading-relaxed">{b.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Safe Zone Compliance */}
          {result.placement_compliance && (
            <div className={cn("border rounded-xl p-4",
              result.placement_compliance.is_compliant
                ? "bg-success/5 border-success/20"
                : "bg-destructive/5 border-destructive/20"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className={cn("w-4 h-4", result.placement_compliance.is_compliant ? "text-success" : "text-destructive")} />
                <h3 className={cn("text-sm font-semibold", result.placement_compliance.is_compliant ? "text-success" : "text-destructive")}>
                  Safe Zones ({PLACEMENTS.find(p => p.key === "feed")?.label ?? "Posicionamento"}) — {result.placement_compliance.is_compliant ? "✅ Em conformidade" : "⚠️ Problemas detectados"}
                </h3>
              </div>
              {result.placement_compliance.issues.length > 0 && (
                <ul className="space-y-1 mb-2">
                  {result.placement_compliance.issues.map((issue, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-destructive flex-shrink-0">•</span> {issue}
                    </li>
                  ))}
                </ul>
              )}
              {result.placement_compliance.recommendations.length > 0 && (
                <ul className="space-y-1">
                  {result.placement_compliance.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary flex-shrink-0">→</span> {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Audience Fit */}
          {result.audience_fit && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary">👥</span>
                <h3 className="text-sm font-semibold text-primary">Adequação ao Público</h3>
              </div>
              <p className="text-sm text-muted-foreground">{result.audience_fit}</p>
            </div>
          )}

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
          <div className="bg-muted/30 border border-border rounded-xl p-4">
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
          <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground hover:text-foreground" onClick={reset}>
            <RefreshCw className="w-3.5 h-3.5" /> Analisar Outro
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CreativeAudit() {
  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold text-foreground">Auditoria de Criativos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Análise real com IA Gemini Vision · Safe zones por posicionamento · Adequação ao objetivo e público
        </p>
      </div>

      {/* Tabs: Imagem / Vídeo */}
      <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
        <Tabs defaultValue="image">
          <TabsList className="mb-5 bg-muted border border-border">
            <TabsTrigger value="image" className="gap-2 data-[state=active]:bg-background">
              <ImageIcon className="w-4 h-4" />
              Análise de Imagem
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2 data-[state=active]:bg-background">
              <Video className="w-4 h-4" />
              Análise de Vídeo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image">
            <div className="mb-3 p-3 bg-muted/30 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Imagem</span> — A IA analisará a composição visual, hierarquia, posicionamento de texto em relação às safe zones do posicionamento escolhido, aderência às boas práticas da Meta, adequação ao objetivo e ao público informado.
              </p>
            </div>
            <AuditPanel mediaType="image" />
          </TabsContent>

          <TabsContent value="video">
            <div className="mb-3 p-3 bg-muted/30 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Vídeo</span> — O primeiro frame será extraído e analisado pela IA. Receberá insights sobre: qualidade visual do thumbnail, composição, safe zones para o posicionamento, eficácia do thumb-stop, adequação ao objetivo e ao público. Para vídeos, o frame inicial é crítico pois determina se o usuário vai assistir.
              </p>
            </div>
            <AuditPanel mediaType="video" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
