import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Check, Rocket, Link, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const plans = [
  { id: "starter", name: "Starter", price: "R$ 197", desc: "Para freelancers e pequenas contas", features: ["1 Workspace", "3 contas de anúncios", "AI Agent básico"] },
  { id: "pro", name: "Pro", price: "R$ 497", desc: "Para gestores e pequenas agências", features: ["3 Workspaces", "10 contas de anúncios", "AI Agent avançado", "Auditorias ilimitadas"], popular: true },
  { id: "agency", name: "Agency", price: "R$ 997", desc: "Para agências de grande porte", features: ["Workspaces ilimitados", "Contas ilimitadas", "White-label", "API access"] },
];

const platforms = [
  { id: "meta", name: "Meta Ads", icon: "🟦", desc: "Facebook e Instagram Ads", color: "border-blue-500/40 bg-blue-500/5" },
  { id: "google", name: "Google Ads", icon: "🔴", desc: "Search, Shopping e Display", color: "border-red-500/40 bg-red-500/5" },
  { id: "tiktok", name: "TikTok Ads", icon: "⚫", desc: "Vídeos e In-Feed Ads", color: "border-slate-500/40 bg-slate-500/5" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "agency">("pro");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConnect = (platformId: string) => {
    setConnecting(platformId);
    setTimeout(() => {
      setConnecting(null);
      setConnectedPlatforms((prev) => [...prev, platformId]);
      toast({ title: "Plataforma conectada", description: `${platforms.find(p => p.id === platformId)?.name} conectado (demo)` });
    }, 1500);
  };

  const handleStep1 = async () => {
    if (!workspaceName.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const slug = workspaceName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString(36);
      const { data: ws, error } = await supabase
        .from("workspaces")
        .insert({ name: workspaceName, slug, owner_id: user.id, plan: selectedPlan })
        .select()
        .single();
      if (error) throw error;

      // Seed default alert rules
      await supabase.rpc("seed_workspace_defaults", { p_workspace_id: ws.id });

      toast({ title: "Workspace criado!", description: workspaceName });
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar workspace";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: "Workspace" },
    { num: 2, label: "Contas" },
    { num: 3, label: "Pronto!" },
  ];

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-3xl animate-fade-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground fill-current" />
          </div>
          <span className="font-bold text-xl text-foreground">VisionAds</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step > s.num ? "bg-success text-success-foreground" :
                    step === s.num ? "bg-primary text-primary-foreground" :
                      "bg-muted text-muted-foreground"
                )}>
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className={cn("text-sm font-medium hidden sm:inline", step === s.num ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn("w-12 h-px", step > s.num ? "bg-success" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Configure seu Workspace</h2>
                <p className="text-sm text-muted-foreground mt-1">Comece dando um nome para o seu espaço de trabalho.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Nome do Workspace <span className="text-destructive">*</span>
                </Label>
                <Input placeholder="Ex: Loja Exemplo BR" value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="bg-muted border-border h-11 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Escolha seu plano</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.map((plan) => (
                    <button key={plan.id} onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                      className={cn(
                        "relative text-left p-4 rounded-xl border transition-all",
                        selectedPlan === plan.id ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground bg-muted/30"
                      )}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                          POPULAR
                        </span>
                      )}
                      <div className="font-semibold text-foreground">{plan.name}</div>
                      <div className="text-lg font-bold text-primary mt-1">{plan.price}<span className="text-xs text-muted-foreground font-normal">/mês</span></div>
                      <div className="text-xs text-muted-foreground mt-1">{plan.desc}</div>
                      <ul className="mt-3 space-y-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Check className="w-3 h-3 text-success flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={!workspaceName.trim() || saving}
                onClick={handleStep1}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Criando...
                  </span>
                ) : (
                  <>Continuar <ChevronRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Conecte suas contas de anúncios</h2>
                <p className="text-sm text-muted-foreground mt-1">Conecte as plataformas que você gerencia. Pode pular por agora.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {platforms.map((p) => {
                  const isConnected = connectedPlatforms.includes(p.id);
                  const isConnecting = connecting === p.id;
                  return (
                    <div key={p.id}
                      className={cn("flex items-center justify-between p-4 rounded-xl border transition-all", isConnected ? p.color : "border-border bg-muted/20")}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <div>
                          <div className="font-medium text-foreground text-sm">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.desc}</div>
                        </div>
                      </div>
                      {isConnected ? (
                        <span className="flex items-center gap-1.5 text-xs text-success font-medium">
                          <Check className="w-3.5 h-3.5" /> Conectado
                        </span>
                      ) : (
                        <Button size="sm" variant="outline" className="h-8 text-xs border-border hover:bg-muted gap-1.5"
                          onClick={() => handleConnect(p.id)} disabled={!!connecting}
                        >
                          {isConnecting ? (
                            <>
                              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Conectando...
                            </>
                          ) : (
                            <><Link className="w-3 h-3" /> Conectar</>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 h-11 text-muted-foreground" onClick={() => setStep(1)}>Voltar</Button>
                <Button className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" onClick={() => setStep(3)}>
                  Continuar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <button onClick={() => setStep(3)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                Pular por agora →
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-6 gap-6 animate-fade-up">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-success/20 border border-success/30 flex items-center justify-center">
                  <Rocket className="w-9 h-9 text-success" />
                </div>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: ["#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#F97316","#EC4899"][i],
                      left: `${Math.cos(i * 45 * Math.PI / 180) * 45 + 36}px`,
                      top: `${Math.sin(i * 45 * Math.PI / 180) * 45 + 36}px`,
                      animation: `confettiDrop 2s ease-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Tudo pronto! 🎉</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  Seu workspace <strong className="text-foreground">{workspaceName || "VisionAds"}</strong> foi criado com sucesso.
                  Vamos começar a otimizar suas campanhas?
                </p>
              </div>
              <Button
                className="h-12 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm"
                onClick={() => navigate("/")}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Ir para o Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
