import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { message: string; campaign_context?: string };
  try {
    body = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { message, campaign_context } = body;

  const systemPrompt = `Você é um especialista sênior em tráfego pago e performance de anúncios digitais com mais de 10 anos de experiência em Meta Ads, Google Ads e TikTok Ads.

REGRAS ABSOLUTAS:
1. Analise EXCLUSIVAMENTE os dados fornecidos no contexto. Nunca invente números, benchmarks ou KPIs que não estejam nos dados.
2. Se não houver dados suficientes, diga claramente que precisa de mais informações.
3. Cite sempre os números exatos do contexto nas suas análises.
4. Todas as suas recomendações devem ser baseadas nos KPIs reais fornecidos.
5. Nunca use frases genéricas como "geralmente campanhas de conversão têm X%" - use sempre os dados reais.

FORMATO DAS RESPOSTAS:
- Use **negrito** para métricas e pontos críticos
- Use listas com bullets para recomendações
- Seja direto e acionável
- Responda SEMPRE em português brasileiro
- Estruture: Diagnóstico → Problemas identificados → Recomendações específicas com base nos dados

Se houver dados de campanha no contexto, faça uma análise profunda incluindo:
- Avaliação do ROAS vs benchmarks do setor (Meta Ads: ROAS bom = 3x+, ótimo = 5x+)
- Análise do CTR (Meta Ads: CTR bom = 1.5%+, ótimo = 2.5%+)
- Análise do CPC relativo ao gasto
- Eficiência do funil (impressões → cliques → conversões)
- Identificação de gargalos
- Ações específicas de otimização`;

  const userContent = campaign_context
    ? `DADOS REAIS DA CAMPANHA:\n${campaign_context}\n\n---\nPERGUNTA DO USUÁRIO: ${message}`
    : `PERGUNTA (sem campanha selecionada): ${message}\n\nNota: Responda de forma geral, pois nenhuma campanha específica foi selecionada.`;

  try {
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Configurações." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const reply = aiData.choices?.[0]?.message?.content ?? "Não foi possível gerar uma resposta.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
