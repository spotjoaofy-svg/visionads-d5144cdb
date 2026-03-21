import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suggestedQuestions, overviewKPIs, platformSummary } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  time: string;
}

const AI_RESPONSES: Record<string, string> = {
  "Por que meu CPL subiu esta semana?":
    "📊 Analisando seus dados...\n\nSeu CPL subiu **+18.4%** esta semana em relação à semana passada. Os principais fatores identificados:\n\n1. **Frequência alta no Ad Set 'Remarketing 7D'** — frequência de 4.2x, causando fadiga no público\n2. **Aumento de concorrência no CPM** — CPM subiu 12% no período\n3. **Queda na taxa de conversão da LP** — de 3.8% para 2.9%\n\n💡 **Recomendações:**\n- Pausar o Ad Set com frequência >4x e criar novo com público similar mais amplo\n- Revisar a landing page da campanha\n- Testar novos criativos com abordagem diferente",
  "Qual campanha devo pausar agora?":
    "🔍 Com base na análise de todas as suas campanhas ativas:\n\n**Recomendo pausar:**\n\n🔴 **Leads — Imóveis Premium (Meta)** — CPL de R$ 62,10 vs meta de R$ 40. ROAS negativo. Está consumindo R$ 1.180/mês sem retorno adequado.\n\n🟡 **Display Remarketing (Google)** — já está pausada por critério interno, mas o orçamento alocado pode ser redistribuído.\n\n**Para redistribuir o budget:**\n- +30% para **Marca — Search** (ROAS 9.21x)\n- +20% para **Shopping Principal** (melhor escala com bom ROAS)",
  default:
    "🤔 Entendido! Estou analisando os dados das suas contas conectadas.\n\nCom base nas métricas do último período, posso dizer que suas campanhas no **Google Ads** estão apresentando o melhor desempenho com ROAS médio de **5.63x**, enquanto o **TikTok** tem o maior volume de impressões com crescimento de **24.8%**.\n\nPosso aprofundar em algum aspecto específico?",
};

function getResponse(question: string): string {
  return AI_RESPONSES[question] ?? AI_RESPONSES["default"];
}

function formatTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function AIAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Olá! Sou seu especialista em tráfego pago. Tenho acesso às métricas das suas contas conectadas. Como posso te ajudar hoje? 🚀",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: getResponse(text), time: formatTime() };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1600 + Math.random() * 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Render markdown-like formatting
  function renderContent(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
      if (line.startsWith("🔴") || line.startsWith("🟡") || line.startsWith("🟢") || line.startsWith("💡") || line.startsWith("📊") || line.startsWith("🔍") || line.startsWith("🤔")) {
        return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      if (line.match(/^\d+\./)) {
        return <p key={i} className="mb-1 ml-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      if (line.startsWith("- ")) {
        return <p key={i} className="mb-0.5 ml-3" dangerouslySetInnerHTML={{ __html: "• " + formatted.slice(2) }} />;
      }
      return line ? <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} /> : <br key={i} />;
    });
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel */}
      <div className="lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-surface-elevated overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Account Context */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Contexto das Contas
            </h3>
            <div className="space-y-2">
              {Object.entries(platformSummary).map(([key, p]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {key[0].toUpperCase()}
                    </div>
                    <span className="text-xs text-foreground truncate">{p.name}</span>
                  </div>
                  <span className="text-xs text-success ml-1">●</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Resumo do Mês
            </h3>
            <div className="space-y-2">
              {[
                { label: "Investimento total", value: "R$ 284,8k" },
                { label: "Campanhas ativas", value: "23" },
                { label: "Melhor ROAS", value: "9.21x (Google)" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-xs font-semibold metric-value text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
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
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3 animate-fade-up", msg.role === "user" && "flex-row-reverse")}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                  msg.role === "ai" ? "bg-primary/20" : "bg-muted"
                )}
              >
                {msg.role === "ai" ? (
                  <Bot className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Bubble */}
              <div className={cn("max-w-[75%] space-y-1", msg.role === "user" && "items-end flex flex-col")}>
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "ai" ? "chat-bubble-ai rounded-tl-sm" : "chat-bubble-user rounded-tr-sm"
                  )}
                >
                  {renderContent(msg.content)}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
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
                placeholder="Pergunte sobre suas campanhas..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                disabled={isTyping}
              />
              <button
                type="button"
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>
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
            Alimentado por dados reais das suas contas • As respostas são baseadas nos dados históricos
          </p>
        </div>
      </div>
    </div>
  );
}
