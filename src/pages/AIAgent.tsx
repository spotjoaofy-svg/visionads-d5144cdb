import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Bot, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suggestedQuestions, overviewKPIs, platformSummary } from "@/data/mockData";
import { useChatMessages, useSaveChatMessage } from "@/hooks/useSupabaseData";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const AI_RESPONSES: Record<string, string> = {
  "Por que meu CPL subiu esta semana?":
    "📊 Analisando seus dados...\n\nSeu CPL subiu **+18.4%** esta semana. Principais fatores:\n\n1. **Frequência alta** — Ad Set Remarketing 7D com frequência 4.2x\n2. **CPM subiu 12%** no período\n3. **Queda na taxa de conversão da LP** — de 3.8% para 2.9%\n\n💡 **Recomendações:**\n- Pausar o Ad Set com frequência >4x\n- Revisar a landing page\n- Testar novos criativos",
  "Qual campanha devo pausar agora?":
    "🔍 Com base na análise:\n\n🔴 **Leads — Imóveis Premium (Meta)** — CPL de R$ 62,10 vs meta de R$ 40. ROAS negativo.\n\n**Redistribuição sugerida:**\n- +30% para **Marca — Search** (ROAS 9.21x)\n- +20% para **Shopping Principal** (ROAS 7.84x)",
  default:
    "🤔 Entendido! Com base nos dados das suas contas, o **Google Ads** tem o melhor ROAS médio de **5.63x**, enquanto o **TikTok** cresce **24.8%** em impressões.\n\nPosso aprofundar em algum aspecto específico?",
};

function getResponse(q: string) { return AI_RESPONSES[q] ?? AI_RESPONSES["default"]; }
function formatTime() { return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }

interface DisplayMsg { id: string; role: "user" | "ai"; content: string; time: string; }

export default function AIAgent() {
  const { user } = useAuth();
  const { data: savedMessages } = useChatMessages();
  const saveMessage = useSaveChatMessage();
  const [localMessages, setLocalMessages] = useState<DisplayMsg[]>([{
    id: "welcome", role: "ai",
    content: "Olá! Sou seu especialista em tráfego pago. Tenho acesso às métricas das suas contas conectadas. Como posso te ajudar hoje? 🚀",
    time: formatTime(),
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [localMessages, isTyping]);

  // Merge saved + local messages
  const displayMessages: DisplayMsg[] = savedMessages && savedMessages.length > 0
    ? savedMessages.map(m => ({
        id: m.id, role: m.role as "user" | "ai", content: m.content,
        time: new Date(m.created_at ?? "").toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }))
    : localMessages;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: DisplayMsg = { id: Date.now().toString(), role: "user", content: text, time: formatTime() };
    setLocalMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setLeftOpen(false);

    if (user) {
      await saveMessage.mutateAsync({ role: "user", content: text, userId: user.id }).catch(() => {});
    }

    setTimeout(async () => {
      const aiContent = getResponse(text);
      const aiMsg: DisplayMsg = { id: (Date.now() + 1).toString(), role: "ai", content: aiContent, time: formatTime() };
      setLocalMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      if (user) {
        await saveMessage.mutateAsync({ role: "ai", content: aiContent, userId: user.id }).catch(() => {});
      }
    }, 1600 + Math.random() * 800);
  };

  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.match(/^\d+\./) || line.startsWith("- ")) return <p key={i} className="mb-1 ml-2" dangerouslySetInnerHTML={{ __html: html }} />;
      return line ? <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: html }} /> : <br key={i} />;
    });
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      <button className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-surface-elevated border-b border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setLeftOpen(v => !v)}>
        <span className="font-medium text-foreground">Contexto & Sugestões</span>
        {leftOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <div className="flex flex-1 overflow-hidden">
        <div className={cn("border-r border-border bg-surface-elevated overflow-y-auto transition-all duration-300",
          "lg:w-72 lg:flex-shrink-0 lg:block",
          leftOpen ? "absolute inset-x-0 top-[calc(3.5rem+2.5rem)] z-20 max-h-[50vh] overflow-y-auto shadow-xl border-b" : "hidden lg:block"
        )}>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contexto das Contas</h3>
              <div className="space-y-1.5">
                {Object.entries(platformSummary).map(([key, p]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: p.color }}>
                        {key[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-foreground truncate">{p.name}</span>
                    </div>
                    <span className="text-xs text-success ml-1 flex-shrink-0">●</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resumo do Mês</h3>
              <div className="space-y-2">
                {[
                  { label: "Investimento total", value: `R$ ${(overviewKPIs.totalSpend / 1000).toFixed(1)}k` },
                  { label: "Campanhas ativas", value: overviewKPIs.activeCampaigns.toString() },
                  { label: "Melhor ROAS", value: "9.21x (Google)" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center gap-2">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="text-xs font-semibold metric-value text-foreground whitespace-nowrap">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Perguntas Sugeridas</h3>
              <div className="space-y-1.5">
                {suggestedQuestions.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)} disabled={isTyping}
                    className="w-full text-left text-xs text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 border border-border hover:border-primary/30 px-3 py-2 rounded-lg transition-all leading-relaxed disabled:opacity-50">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
            {displayMessages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2 sm:gap-3 animate-fade-up", msg.role === "user" && "flex-row-reverse")}>
                <div className={cn("flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center", msg.role === "ai" ? "bg-primary/20" : "bg-muted")}>
                  {msg.role === "ai" ? <Bot className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
                <div className={cn("max-w-[85%] sm:max-w-[75%] space-y-1", msg.role === "user" && "items-end flex flex-col")}>
                  <div className={cn("px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed",
                    msg.role === "ai" ? "chat-bubble-ai rounded-tl-sm" : "chat-bubble-user rounded-tr-sm")}>
                    {renderContent(msg.content)}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 sm:gap-3 animate-fade-up">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-primary" /></div>
                <div className="chat-bubble-ai px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3 sm:p-4 bg-surface-elevated flex-shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors min-w-0">
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte sobre suas campanhas..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                  disabled={isTyping}
                />
                <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0 hidden sm:block" />
              </div>
              <Button type="submit" size="icon"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex-shrink-0"
                disabled={isTyping || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
