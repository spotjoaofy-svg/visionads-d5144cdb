import { useState, useEffect } from "react";
import { Plus, Check, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teamMembers, alertRules, billingPlans } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";

const SETTINGS_TABS = ["Workspace", "Integrações", "Equipe", "Cobrança", "Alertas"];

const INTEGRATIONS = [
  {
    id: "meta",
    name: "Meta Ads",
    color: "#1877F2",
    letter: "M",
    accounts: [
      { name: "Loja Exemplo BR", id: "act_1234567890", limit: "R$ 5.000/dia" },
    ],
  },
  {
    id: "google",
    name: "Google Ads",
    color: "#EA4335",
    letter: "G",
    accounts: [
      { name: "Loja Exemplo", id: "123-456-7890", limit: "R$ 3.000/dia" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    color: "#010101",
    letter: "T",
    accounts: [],
  },
];

export default function Settings() {
  const [tab, setTab] = useState("Integrações");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");
  const [rules, setRules] = useState(alertRules);

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-xl mx-auto">
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
          {INTEGRATIONS.map((platform) => (
            <div key={platform.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.letter}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm">{platform.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {platform.accounts.length > 0 ? `${platform.accounts.length} conta(s) conectada(s)` : "Não conectado"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-border text-muted-foreground hover:text-foreground gap-1.5">
                    <Plus className="w-3 h-3" /> Adicionar conta
                  </Button>
                </div>
              </div>
              {platform.accounts.length > 0 ? (
                <div className="divide-y divide-border">
                  {platform.accounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">{acc.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {acc.id} · Limite: {acc.limit}</div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-success/15 text-success border-success/30 text-[10px]">Conectado</Badge>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:bg-destructive/10">
                          Desconectar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                  Nenhuma conta conectada · Clique em "Adicionar conta" para conectar
                </div>
              )}
            </div>
          ))}
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

      {/* BILLING */}
      {tab === "Cobrança" && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {billingPlans.map((plan) => (
              <div key={plan.id}
                className={cn("relative bg-card border rounded-xl p-5 transition-all",
                  "current" in plan && plan.current ? "border-primary" : "border-border"
                )}>
                {"current" in plan && plan.current && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                    ATUAL
                  </span>
                )}
                <div className="font-semibold text-foreground mb-1">{plan.name}</div>
                <div className="text-2xl font-bold text-primary mb-0.5">
                  R$ {plan.price}<span className="text-sm text-muted-foreground font-normal">/mês</span>
                </div>
                <ul className="mt-3 space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-success flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {!("current" in plan && plan.current) && (
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
