import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ChevronDown, BarChart2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suggestedQuestions } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  time: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  total_spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  conversions: number;
  cpa: number;
  reach: number;
  daily_budget: number | null;
  objective: string | null;
}

function fmt(n: number, decimals = 2) {
  return n?.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function buildCampaignContext(c: Campaign): string {
  return `Campanha: "${c.name}"
Status: ${c.status}
Objetivo: ${c.objective ?? "N/A"}
Investimento total (30d): R$ ${fmt(c.total_spend)}
Orçamento diário: ${c.daily_budget ? "R$ " + fmt(c.daily_budget) : "N/A"}
Impressões: ${c.impressions?.toLocaleString("pt-BR")}
Cliques: ${c.clicks?.toLocaleString("pt-BR")}
CTR: ${fmt(c.ctr, 2)}%
CPC: R$ ${fmt(c.cpc)}
CPM: R$ ${fmt(c.cpm)}
Alcance: ${c.reach?.toLocaleString("pt-BR")}
Conversões: ${c.conversions}
CPA: R$ ${fmt(c.cpa)}
ROAS: ${fmt(c.roas, 2)}x`;
}

function formatTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function AIAgent() {
  const { workspace } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Olá! Sou seu especialista em tráfego pago. Selecione uma campanha no painel ao lado para analisar seus KPIs em detalhes, ou me faça uma pergunta geral. 🚀",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    loadCampaigns();
  }, [workspace]);

  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const { data: ws } = await supabase
        .from("workspaces")
        .select("id")
        .eq("name", workspace)
        .maybeSingle();

      if (!ws?.id) { setCampaigns([]); return; }

      const { data } = await supabase
        .from("campaigns")
        .select("id,name,status,total_spend,impressions,clicks,ctr,cpc,cpm,roas,conversions,cpa,reach,daily_budget,objective")
        .eq("workspace_id", ws.id)
        .eq("platform", "meta")
        .order("total_spend", { ascending: false });

      setCampaigns((data as Campaign[]) ?? []);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const analyzeSelectedCampaign = () => {
    if (!selectedCampaign) return;
    const prompt = `Analise detalhadamente a seguinte campanha com base nos seus KPIs e me dê insights acionáveis:\n\n${buildCampaignContext(selectedCampaign)}`;
    sendMessage(prompt);
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Build system context
    const campaignCtx = selectedCampaign
      ? `\n\nContexto da campanha selecionada:\n${buildCampaignContext(selectedCampaign)}`
      : "";

    // Call AI via edge function
    supabase.functions
      .invoke("ai-campaign-analyst", {
        body: { message: text, campaign_context: campaignCtx },
      })
      .then(({ data, error }) => {
        const content =
          error || !data?.reply
            ? "Desculpe, não consegui processar sua pergunta agora. Tente novamente."
            : data.reply;
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content, time: formatTime() };
        setMessages((prev) => [...prev, aiMsg]);
      })
      .finally(() => setIsTyping(false));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  function renderContent(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>");
      if (line.match(/^\d+\./)) return <p key={i} className="mb-1 ml-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
      if (line.startsWith("- ")) return <p key={i} className="mb-0.5 ml-3" dangerouslySetInnerHTML={{ __html: "• " + formatted.slice(2) }} />;
      return line ? <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} /> : <br key={i} />;
    });
  }

  const statusColor = (s: string) =>
    s === "active" ? "text-success" : s === "paused" ? "text-warning" : "text-muted-foreground";

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel */}
      <div className="lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-surface-elevated overflow-y-auto">
        <div className="p-4 space-y-4">

          {/* Campaign Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Campanha para Analisar
              </h3>
              <button
                onClick={loadCampaigns}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Recarregar campanhas"
              >
                <RefreshCw className={cn("w-3 h-3", loadingCampaigns && "animate-spin")} />
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between gap-2 bg-muted border border-border hover:border-primary/40 rounded-lg px-3 py-2.5 text-left transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <BarChart2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-foreground truncate">
                      {selectedCampaign ? selectedCampaign.name : "Selecionar campanha…"}
                    </span>
                  </div>
                  {loadingCampaigns
                    ? <Loader2 className="w-3 h-3 text-muted-foreground animate-spin flex-shrink-0" />
                    : <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  }
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 bg-surface-raised border-border max-h-64 overflow-y-auto"
                align="start"
              >
                {campaigns.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                    {loadingCampaigns ? "Carregando…" : "Nenhuma campanha. Conecte sua conta Meta em Configurações."}
                  </div>
                ) : (
                  campaigns.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => setSelectedCampaign(c)}
                      className={cn(
                        "cursor-pointer flex items-center gap-2 text-xs",
                        selectedCampaign?.id === c.id && "bg-primary/10 text-primary"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusColor(c.status))} style={{ background: "currentColor" }} />
                      <span className="truncate">{c.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Selected campaign KPI preview */}
            {selectedCampaign && (
              <div className="mt-2 bg-muted/40 border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">KPIs (30d)</span>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    selectedCampaign.status === "active" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                  )}>
                    {selectedCampaign.status === "active" ? "Ativa" : selectedCampaign.status === "paused" ? "Pausada" : "Encerrada"}
                  </span>
                </div>
                {[
                  { label: "Investimento", value: `R$ ${fmt(selectedCampaign.total_spend)}` },
                  { label: "ROAS", value: `${fmt(selectedCampaign.roas, 2)}x` },
                  { label: "CTR", value: `${fmt(selectedCampaign.ctr, 2)}%` },
                  { label: "CPC", value: `R$ ${fmt(selectedCampaign.cpc)}` },
                  { label: "Conversões", value: String(selectedCampaign.conversions) },
                  { label: "CPA", value: `R$ ${fmt(selectedCampaign.cpa)}` },
                ].map((kpi) => (
                  <div key={kpi.label} className="flex justify-between">
                    <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
                    <span className="text-[11px] font-semibold text-foreground">{kpi.value}</span>
                  </div>
                ))}
                <Button
                  size="sm"
                  className="w-full h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground mt-1"
                  onClick={analyzeSelectedCampaign}
                  disabled={isTyping}
                >
                  {isTyping ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Analisar esta campanha
                </Button>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Perguntas Sugeridas
            </h3>
            <div className="space-y-1.5">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isTyping}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 border border-border hover:border-primary/30 px-3 py-2 rounded-lg transition-all leading-relaxed disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Campaign badge */}
        {selectedCampaign && (
          <div className="px-4 py-2 border-b border-border bg-primary/5 flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-xs text-primary font-medium truncate">
              Analisando: {selectedCampaign.name}
            </span>
            <button
              className="ml-auto text-muted-foreground hover:text-foreground text-xs flex-shrink-0"
              onClick={() => setSelectedCampaign(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3 animate-fade-up", msg.role === "user" && "flex-row-reverse")}>
              <div className={cn("flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center", msg.role === "ai" ? "bg-primary/20" : "bg-muted")}>
                {msg.role === "ai"
                  ? <Bot className="w-3.5 h-3.5 text-primary" />
                  : <User className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </div>
              <div className={cn("max-w-[75%] space-y-1", msg.role === "user" && "items-end flex flex-col")}>
                <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed", msg.role === "ai" ? "chat-bubble-ai rounded-tl-sm" : "chat-bubble-user rounded-tr-sm")}>
                  {renderContent(msg.content)}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-fade-up">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="chat-bubble-ai px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 bg-surface-elevated">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedCampaign ? `Pergunte sobre "${selectedCampaign.name}"…` : "Pergunte sobre suas campanhas…"}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                disabled={isTyping}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex-shrink-0"
              disabled={isTyping || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            {selectedCampaign
              ? `Contexto: ${selectedCampaign.name} — KPIs reais da Meta API`
              : "Alimentado por dados das suas contas conectadas"}
          </p>
        </div>
      </div>
    </div>
  );
}
