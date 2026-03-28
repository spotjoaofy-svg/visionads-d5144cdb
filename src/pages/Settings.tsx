import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Check, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teamMembers, alertRules } from "@/data/mockData";
import { useAdAccounts, notifyTokenChanged } from "@/hooks/useMeta";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";

const SETTINGS_TABS = ["Workspace", "Integrações", "Equipe", "Alertas"];

const INTEGRATIONS = [
  {
    id: "meta",
    name: "Meta Ads",
    color: "#1877F2",
    letter: "M",
    comingSoon: false,
  },
  {
    id: "google",
    name: "Google Ads",
    color: "#EA4335",
    letter: "G",
    comingSoon: true,
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    color: "#010101",
    letter: "T",
    comingSoon: true,
  },
];

export default function Settings() {
  const queryClient = useQueryClient();
  const { workspace } = useApp();
  const [tab, setTab] = useState("Integrações");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");
  const [rules, setRules] = useState(alertRules);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbToast, setFbToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  /** Sincroniza com localStorage — a API pode falhar mas o token já indica sessão Meta */
  const [hasFbToken, setHasFbToken] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("facebook_access_token")
  );

  const { data: accounts, error: accountsError, isLoading: accountsLoading, refetch: refetchAccounts } = useAdAccounts();

  useEffect(() => {
    setHasFbToken(!!localStorage.getItem("facebook_access_token"));
  }, [fbToast]);

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  // Handle Facebook OAuth callback params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fb_success")) {
      setHasFbToken(!!localStorage.getItem("facebook_access_token"));
      setFbToast({ type: "success", msg: "Conta Meta conectada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["fb"] });
      window.history.replaceState({}, "", window.location.pathname);
      setTab("Integrações");
    } else if (params.get("fb_error")) {
      setFbToast({ type: "error", msg: `Erro ao conectar: ${params.get("fb_error")}` });
      window.history.replaceState({}, "", window.location.pathname);
      setTab("Integrações");
    }
    if (fbToast) {
      const t = setTimeout(() => setFbToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [fbToast, queryClient]);

  const handleConnectFacebook = async () => {
    setFbLoading(true);
    try {
      const { data: wsData } = await supabase
        .from("workspaces")
        .select("id")
        .eq("name", workspace)
        .maybeSingle();

      const workspaceId = wsData?.id ?? "";
      const { data, error } = await supabase.functions.invoke("facebook-oauth-init", {
        body: { workspace_id: workspaceId, app_origin: window.location.origin },
      });
      if (error || !data?.auth_url) throw new Error(error?.message ?? "Falha ao iniciar OAuth");

      // Abre o OAuth em popup centralizado
      const w = 520, h = 640;
      const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
      const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
      const popup = window.open(
        data.auth_url,
        "facebook_oauth",
        `width=${w},height=${h},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0`
      );

      if (!popup) {
        // fallback se popup bloqueado
        window.location.href = data.auth_url;
        return;
      }

      // Escuta o postMessage da página /fb-callback
      const onMessage = (ev: MessageEvent) => {
        if (ev.origin !== window.location.origin) return;
        if (ev.data?.type !== "fb_oauth") return;
        window.removeEventListener("message", onMessage);
        setFbLoading(false);
        if (ev.data.status === "success" || ev.data.status === "code") {
          if (typeof ev.data.access_token === "string" && ev.data.access_token) {
            try {
              localStorage.setItem("facebook_access_token", ev.data.access_token);
            } catch {
              /* ignore */
            }
          }
          setHasFbToken(!!localStorage.getItem("facebook_access_token"));
          notifyTokenChanged();
          // Force remove all cached fb queries so they re-run with the new token
          queryClient.removeQueries({ queryKey: ["fb"] });
          // Small delay to let React re-render with new token before refetching
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["fb"] });
          }, 100);
          setFbToast({ type: "success", msg: "Conta Meta conectada com sucesso!" });
        } else {
          setFbToast({ type: "error", msg: `Erro ao conectar: ${ev.data.error ?? "desconhecido"}` });
        }
      };
      window.addEventListener("message", onMessage);

      // Fallback: se o popup fechar sem postMessage (usuário fechou manualmente)
      const pollClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollClosed);
          window.removeEventListener("message", onMessage);
          setFbLoading(false);
          const tokenNow = !!localStorage.getItem("facebook_access_token");
          setHasFbToken(tokenNow);
          if (tokenNow) queryClient.invalidateQueries({ queryKey: ["fb"] });
        }
      }, 500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setFbToast({ type: "error", msg });
      setFbLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* FB Toast notification */}
      {fbToast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-up",
          fbToast.type === "success"
            ? "bg-success/15 border border-success/30 text-success"
            : "bg-destructive/15 border border-destructive/30 text-destructive"
        )}>
          {fbToast.type === "success"
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {fbToast.msg}
        </div>
      )}
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie seu workspace e integrações</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap animate-fade-up" style={{ animationDelay: "60ms" }}>
        {SETTINGS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "text-sm px-4 py-1.5 rounded-md transition-all font-medium",
              tab === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* WORKSPACE */}
      {tab === "Workspace" && (
        <div className="max-w-xl space-y-5 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Informações do Workspace</h2>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-foreground mb-1.5 block">Nome</Label>
                <Input defaultValue="Loja Exemplo BR" className="bg-muted border-border text-foreground" />
              </div>
              <div>
                <Label className="text-sm text-foreground mb-1.5 block">Slug</Label>
                <Input defaultValue="loja-exemplo-br" className="bg-muted border-border text-muted-foreground" disabled />
              </div>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Salvar alterações
            </Button>
          </div>
        </div>
      )}

      {/* INTEGRATIONS */}
      {tab === "Integrações" && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {INTEGRATIONS.map((platform) => {
            const metaHasAccounts = platform.id === "meta" && (accounts?.length ?? 0) > 0;
            return (
              <div key={platform.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.letter}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-foreground text-sm">{platform.name}</div>
                      {platform.comingSoon && (
                        <span className="text-[10px] bg-warning/10 text-warning border border-warning/20 px-1.5 py-0.5 rounded-full font-medium">
                          Em breve
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {platform.id === "meta"
                        ? metaHasAccounts
                          ? `${accounts!.length} conta(s) conectada(s)`
                          : hasFbToken
                            ? "Sessão Meta ativa — carregando ou sem contas de anúncios"
                            : "Não conectado"
                        : "Não disponível ainda"
                      }
                    </div>
                  </div>
                  {!platform.comingSoon && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-border text-muted-foreground hover:text-foreground gap-1.5"
                      onClick={handleConnectFacebook}
                      disabled={fbLoading}
                    >
                      {fbLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      {fbLoading ? "Conectando…" : "Adicionar conta"}
                    </Button>
                  )}
                </div>

                {platform.id === "meta" && metaHasAccounts ? (
                  <div className="divide-y divide-border">
                    {accounts!.map((acc: any) => (
                      <div key={acc.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-foreground">{acc.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {acc.account_id ?? acc.id}</div>
                        </div>
                        <Badge className="bg-success/15 text-success border-success/30 text-[10px]">Conectado</Badge>
                      </div>
                    ))}
                  </div>
                ) : platform.id === "meta" && hasFbToken ? (
                  <div className="px-4 py-4 space-y-3 border-t border-border">
                    {accountsLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        Carregando contas de anúncios…
                      </div>
                    )}
                    {accountsError && (
                      <div className="flex flex-col gap-2 text-sm">
                        <span className="text-destructive">
                          Não foi possível listar as contas:{" "}
                          {accountsError instanceof Error ? accountsError.message : "Erro na API Meta"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-fit h-8 text-xs"
                          onClick={() => refetchAccounts()}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    )}
                    {!accountsLoading && !accountsError && (accounts?.length ?? 0) === 0 && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Sessão Meta ativa, mas nenhuma conta de anúncios foi retornada. Confira permissões de anúncios
                        no Meta e se o usuário tem acesso a contas no Business Manager.
                      </p>
                    )}
                  </div>
                ) : platform.id === "meta" ? (
                  <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                    Nenhuma conta conectada · Clique em "Adicionar conta" para conectar
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Integração em desenvolvimento — disponível em breve
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TEAM */}
      {tab === "Equipe" && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="flex justify-end">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs" onClick={() => setInviteOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Convidar membro
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn("text-[10px] border",
                        member.role === "Admin" ? "bg-primary/15 text-primary border-primary/30" :
                          member.role === "Editor" ? "bg-warning/15 text-warning border-warning/30" :
                            "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      desde {new Date(member.joinedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALERTS */}
      {tab === "Alertas" && (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <p className="text-xs text-muted-foreground">Configure os alertas automáticos para suas campanhas</p>
          {rules.map((rule) => (
            <div key={rule.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-4">
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => toggleRule(rule.id)}
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{rule.type}</div>
                <div className="text-xs text-muted-foreground">{rule.description}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
                  <Input
                    type="number"
                    defaultValue={rule.threshold}
                    className="bg-transparent border-0 p-0 w-12 h-auto text-xs text-foreground focus-visible:ring-0"
                  />
                  <span className="text-xs text-muted-foreground">{rule.unit}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:inline">Email</span>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border hidden sm:inline">
                  WhatsApp em breve
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Convidar membro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm text-foreground mb-1.5 block">E-mail</Label>
              <Input
                placeholder="email@empresa.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label className="text-sm text-foreground mb-1.5 block">Função</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-raised border-border">
                  {["Admin", "Editor", "Viewer"].map((r) => (
                    <SelectItem key={r} value={r} className="text-foreground">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setInviteOpen(false)}
              disabled={!inviteEmail.trim()}
            >
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
