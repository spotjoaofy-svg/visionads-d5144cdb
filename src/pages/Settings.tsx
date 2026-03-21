import { useState } from "react";
import { Plus, Check, Trash2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { billingPlans } from "@/data/mockData";
import {
  useAlertRules, useUpdateAlertRule,
  useWorkspaceMembers, useInviteMember, useRemoveMember,
  useAdAccounts, useDeleteAdAccount, useUpdateWorkspace,
} from "@/hooks/useSupabaseData";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = ["Workspace", "Integrações", "Equipe", "Cobrança", "Alertas"];

const PLATFORM_DISPLAY = [
  { id: "meta", name: "Meta Ads", color: "#1877F2", letter: "M" },
  { id: "google", name: "Google Ads", color: "#EA4335", letter: "G" },
  { id: "tiktok", name: "TikTok Ads", color: "#010101", letter: "T" },
];

export default function Settings() {
  const { workspace, refetchWorkspaces } = useApp();
  const [tab, setTab] = useState("Workspace");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");
  const [workspaceName, setWorkspaceName] = useState(workspace?.name ?? "");

  const { data: alertRules } = useAlertRules();
  const { data: members } = useWorkspaceMembers();
  const { data: adAccounts } = useAdAccounts();
  const updateRule = useUpdateAlertRule();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const deleteAccount = useDeleteAdAccount();
  const updateWorkspace = useUpdateWorkspace();

  const handleSaveWorkspace = async () => {
    if (!workspace || !workspaceName.trim()) return;
    try {
      await updateWorkspace.mutateAsync({ id: workspace.id, name: workspaceName });
      refetchWorkspaces();
      toast({ title: "Workspace atualizado!" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    }
  };

  const handleInvite = async () => {
    try {
      await inviteMember.mutateAsync({ email: inviteEmail, role: inviteRole });
      toast({ title: "Convite enviado!", description: inviteEmail });
      setInviteOpen(false);
      setInviteEmail("");
    } catch {
      toast({ title: "Erro", description: "Não foi possível convidar.", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeMember.mutateAsync(id);
      toast({ title: "Membro removido." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" });
    }
  };

  const handleDisconnectAccount = async (id: string) => {
    try {
      await deleteAccount.mutateAsync(id);
      toast({ title: "Conta desconectada." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível desconectar.", variant: "destructive" });
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 w-full min-w-0">
      <div className="animate-fade-up">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">Configurações</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Gerencie seu workspace e integrações</p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar animate-fade-up" style={{ animationDelay: "60ms" }}>
        {SETTINGS_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-md transition-all font-medium whitespace-nowrap flex-shrink-0",
              tab === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >{t}</button>
        ))}
      </div>

      {/* WORKSPACE */}
      {tab === "Workspace" && (
        <div className="max-w-xl space-y-5 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Informações do Workspace</h2>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-foreground mb-1.5 block">Nome</Label>
                <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)}
                  className="bg-muted border-border text-foreground" />
              </div>
              <div>
                <Label className="text-sm text-foreground mb-1.5 block">Plano atual</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground font-medium capitalize">{workspace?.plan ?? "starter"}</span>
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">ATIVO</Badge>
                </div>
              </div>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSaveWorkspace} disabled={updateWorkspace.isPending}
            >
              {updateWorkspace.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      )}

      {/* INTEGRATIONS */}
      {tab === "Integrações" && (
        <div className="space-y-3 sm:space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {PLATFORM_DISPLAY.map((platform) => {
            const platformAccounts = (adAccounts ?? []).filter(a => a.platform === platform.id);
            return (
              <div key={platform.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-border flex-wrap">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: platform.color }}>{platform.letter}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">{platform.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {platformAccounts.length > 0 ? `${platformAccounts.length} conta(s) conectada(s)` : "Não conectado"}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-border text-muted-foreground hover:text-foreground gap-1.5 flex-shrink-0 opacity-50 cursor-not-allowed" disabled>
                    <Plus className="w-3 h-3" /> API pendente
                  </Button>
                </div>
                {platformAccounts.length > 0 ? (
                  <div className="divide-y divide-border">
                    {platformAccounts.map((acc) => (
                      <div key={acc.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{acc.account_name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {acc.account_external_id ? `ID: ${acc.account_external_id}` : "ID não configurado"}
                            {acc.daily_budget_limit ? ` · Limite: R$ ${acc.daily_budget_limit}/dia` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className="bg-success/15 text-success border-success/30 text-[10px]">Conectado</Badge>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1"
                            onClick={() => handleDisconnectAccount(acc.id)}>
                            <Trash2 className="w-3 h-3" /> Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-5 gap-2 text-center">
                    <p className="text-xs text-muted-foreground">Nenhuma conta conectada</p>
                    <p className="text-[10px] text-muted-foreground/60">Configure as APIs de plataforma para conectar contas reais</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TEAM */}
      {tab === "Equipe" && (
        <div className="space-y-3 sm:space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="flex justify-end">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs"
              onClick={() => setInviteOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Convidar membro
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {(members ?? []).map((member) => (
                <div key={member.id} className="flex items-center gap-3 px-3 sm:px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {(member.invited_email ?? "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{member.invited_email ?? "Membro"}</div>
                    <div className="text-xs text-muted-foreground">
                      Desde {new Date(member.joined_at ?? "").toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <Badge className={cn("text-[10px] border",
                      member.role === "admin" ? "bg-primary/15 text-primary border-primary/30" :
                        member.role === "editor" ? "bg-warning/15 text-warning border-warning/30" :
                          "bg-muted text-muted-foreground border-border"
                    )}>
                      {member.role}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10 p-0"
                      onClick={() => handleRemoveMember(member.id)}>
                      <UserMinus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {(members ?? []).length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Nenhum membro além de você. Convide colaboradores!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BILLING */}
      {tab === "Cobrança" && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {billingPlans.map((plan) => (
              <div key={plan.id}
                className={cn("relative bg-card border rounded-xl p-4 sm:p-5 transition-all",
                  workspace?.plan === plan.id ? "border-primary" : "border-border"
                )}>
                {workspace?.plan === plan.id && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                    ATUAL
                  </span>
                )}
                <div className="font-semibold text-foreground mb-1">{plan.name}</div>
                <div className="text-xl sm:text-2xl font-bold text-primary mb-0.5">
                  R$ {plan.price}<span className="text-xs sm:text-sm text-muted-foreground font-normal">/mês</span>
                </div>
                <ul className="mt-3 space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-success flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                {workspace?.plan !== plan.id && (
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs border-border">
                    {plan.price > 497 ? "Falar com vendas" : "Fazer upgrade"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALERTS */}
      {tab === "Alertas" && (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <p className="text-xs text-muted-foreground">Configure os alertas automáticos para suas campanhas</p>
          {(alertRules ?? []).map((rule) => (
            <div key={rule.id} className="bg-card border border-border rounded-xl px-3 sm:px-4 py-3 flex items-start sm:items-center gap-3 flex-wrap sm:flex-nowrap">
              <Switch
                checked={rule.is_enabled ?? false}
                onCheckedChange={(v) => updateRule.mutate({ id: rule.id, is_enabled: v })}
                className="flex-shrink-0 mt-0.5 sm:mt-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{rule.rule_type}</div>
                <div className="text-xs text-muted-foreground leading-snug">{rule.description}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
                  <Input type="number" defaultValue={rule.threshold ?? 0}
                    onBlur={(e) => updateRule.mutate({ id: rule.id, threshold: parseFloat(e.target.value) })}
                    className="bg-transparent border-0 p-0 w-10 h-auto text-xs text-foreground focus-visible:ring-0"
                  />
                  <span className="text-xs text-muted-foreground">{rule.unit}</span>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">Email</span>
              </div>
            </div>
          ))}
          {(alertRules ?? []).length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Nenhuma regra configurada. Crie um workspace para configurar alertas.
            </div>
          )}
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[calc(100vw-2rem)] sm:w-auto max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Convidar membro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm text-foreground mb-1.5 block">E-mail</Label>
              <Input placeholder="email@empresa.com" value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label className="text-sm text-foreground mb-1.5 block">Função</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-muted border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-surface-raised border-border">
                  {["Admin", "Editor", "Viewer"].map((r) => (
                    <SelectItem key={r} value={r} className="text-foreground">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setInviteOpen(false)} className="text-muted-foreground">Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleInvite} disabled={!inviteEmail.trim() || inviteMember.isPending}>
              {inviteMember.isPending ? "Enviando..." : "Enviar convite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
