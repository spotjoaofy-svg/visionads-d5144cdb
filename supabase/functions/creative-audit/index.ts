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

  let body: {
    mediaBase64?: string;
    mimeType: string;
    platform: string;
    placement: string;
    objective: string;
    audience?: string;
    isVideo?: boolean;
    mediaType: "image" | "video";
  };

  try {
    body = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { mediaBase64, mimeType, platform, placement, objective, audience, isVideo, mediaType } = body;

  // ============================================================
  // PLACEMENT-SPECIFIC BEST PRACTICES
  // ============================================================
  const placementBestPractices: Record<string, string> = {
    feed: `
BOAS PRÁTICAS PARA FEED (Facebook/Instagram Feed):
- Proporção ideal: 1:1 (quadrado) ou 4:5 (vertical)
- Zona segura: mantenha conteúdo principal fora das bordas de 14% em cada lado
- Texto: limite de 20% da área da imagem para melhor entrega (Meta recomenda mínimo texto)
- Safe zone: evite elementos importantes abaixo de 80% da altura (onde botão "Ver mais" aparece)
- CTA: botão de ação fica na parte inferior do card
- Evite elementos nos 60px inferiores para não sobrepor o botão de CTA da plataforma
- Cor de fundo: evite branco puro (#FFFFFF) pois se mescla com o feed
- Primeira linha do copy deve estar visível sem expandir
- Elementos interativos (logo, produto) devem ficar na faixa central 70% da imagem
`,
    reels: `
BOAS PRÁTICAS PARA REELS (Instagram/Facebook Reels):
- Proporção obrigatória: 9:16 (vertical), resolução mínima 1080x1920px
- Safe zone vertical: mantenha texto e elementos importantes entre 14% e 82% da altura
- CRÍTICO: zona inferior 18% é sobreposta pela interface do Reels (nome do usuário, descrição, botões de engajamento)
- CRÍTICO: zona superior 8% é sobreposta por ícones da plataforma
- Zona segura lateral: 8% de cada lado
- Texto: deve ter boa legibilidade em fundo dinâmico - use sombra ou box
- Gancho nos primeiros 3 segundos é essencial
- Texto na área inferior (últimos 20%) SERÁ CORTADO pelos botões de like, comment, share
- Logo: recomendado no terço superior, entre 8% e 30% de altura
`,
    stories: `
BOAS PRÁTICAS PARA STORIES (Instagram/Facebook Stories):
- Proporção obrigatória: 9:16 (vertical), resolução ideal 1080x1920px
- Safe zone: mantenha conteúdo importante entre 14% e 86% da altura
- CRÍTICO: zona inferior 14% é ocupada por botão "Deslize para cima" / CTA do Stories
- CRÍTICO: zona superior 14% é ocupada pelo header com foto de perfil, nome e botão de fechar
- Zona segura lateral: 6% de cada lado para evitar corte em dispositivos com notch
- Texto: máximo 20% da área, preferencialmente em zona central
- Logo: área superior entre 15% e 25% da altura (abaixo do header da plataforma)
- CTA próprio do anúncio deve estar na faixa entre 70% e 85% da altura
- Duração recomendada para stories em vídeo: 15 segundos
`,
    audience_network: `
BOAS PRÁTICAS PARA AUDIENCE NETWORK:
- Proporção: 1:1, 16:9 ou 9:16 dependendo do formato
- Keep safe zones amplas pois os apps parceiros têm interfaces variadas
- Texto deve ser grande e legível em telas pequenas
- CTA deve ser claro e centralizado
- Evite elementos muito detalhados que perdem qualidade em telas menores
`,
  };

  const placementGuide = placementBestPractices[placement?.toLowerCase()] || placementBestPractices["feed"];

  // ============================================================
  // OBJECTIVE-SPECIFIC CREATIVE GUIDANCE
  // ============================================================
  const objectiveGuidance: Record<string, string> = {
    "Conversão": "Para objetivo CONVERSÃO: o criativo deve ter urgência clara, benefício direto e CTA de ação imediata (Comprar, Adquirir, Garantir). O produto/serviço deve ser o protagonista. Social proof (estrelas, depoimentos) aumenta conversão. Desconto ou oferta limitada no tempo funciona bem.",
    "Tráfego": "Para objetivo TRÁFEGO: o criativo deve despertar curiosidade e ter uma promessa clara que justifique o clique. Headline deve criar um gap de informação. CTA deve ser 'Saiba Mais' ou 'Ver'. Evite dar todas as informações no criativo — deixe algo para o site.",
    "Geração de Leads": "Para objetivo LEADS: destaque claramente o que a pessoa vai receber (e-book, consultoria, orçamento). Use formulários simples e reduza fricção. CTA: 'Quero Saber', 'Cadastrar', 'Receber Grátis'. Mostre o benefício tangível de deixar os dados.",
    "Awareness": "Para objetivo AWARENESS: priorize identidade de marca. Logo deve estar visível. Mensagem simples e memorável. Foco em reconhecimento, não em conversão. Emoção e storytelling funcionam melhor que benefícios racionais.",
    "Engajamento": "Para objetivo ENGAJAMENTO: conteúdo que convida interação — perguntas, polêmica positiva, humor, identificação. Texto curto e impactante. Formatos carrossel e vídeos curtos têm alto engajamento. CTA: 'Comente', 'Salve', 'Compartilhe'.",
  };

  const objectiveHint = objectiveGuidance[objective] || objectiveGuidance["Conversão"];

  // ============================================================
  // AUDIENCE ANALYSIS
  // ============================================================
  const audienceHint = audience
    ? `\n\nANÁLISE DE PÚBLICO: O público-alvo é "${audience}". Analise se o criativo usa linguagem, estética, cores, personas visuais e apelos emocionais adequados para esse público. Verifique se o produto/serviço representado faz sentido para esse perfil demográfico/psicográfico.`
    : "";

  // ============================================================
  // SYSTEM PROMPT
  // ============================================================
  const systemPrompt = `Você é um especialista senior em criativos para tráfego pago com 10+ anos de experiência em Meta Ads (Facebook e Instagram).

Você deve analisar o criativo com EXTREMA precisão visual, identificando elementos específicos que você realmente vê.

${placementGuide}

${objectiveHint}
${audienceHint}

Retorne EXATAMENTE o seguinte JSON (sem texto extra, sem markdown, apenas JSON válido):

{
  "overall_score": <número de 0 a 100>,
  "placement_compliance": {
    "is_compliant": <true ou false>,
    "issues": ["<problema específico de safe zone ou proporção>"],
    "recommendations": ["<ação corretiva específica>"]
  },
  "breakdown": [
    { "label": "Atenção Visual / Thumb-stop", "score": <0-100>, "comment": "<o que você realmente vê que chama ou não atenção>" },
    { "label": "Clareza do CTA", "score": <0-100>, "comment": "<onde está o CTA, como está apresentado, é legível?>" },
    { "label": "Conformidade com Safe Zones (${placement})", "score": <0-100>, "comment": "<elementos estão respeitando as zonas seguras do ${placement}?>" },
    { "label": "Adequação ao Objetivo (${objective})", "score": <0-100>, "comment": "<o criativo comunica claramente o objetivo de ${objective}?>" },
    { "label": "Hierarquia Visual", "score": <0-100>, "comment": "<qual elemento chama mais atenção primeiro? A hierarquia faz sentido?>" },
    { "label": "Legibilidade do Texto", "score": <0-100>, "comment": "<textos visíveis, contraste adequado, tamanho legível em mobile?>" },
    { "label": "Qualidade e Profissionalismo", "score": <0-100>, "comment": "<resolução, qualidade de imagem, design profissional?>" }
  ],
  "strengths": [
    "<ponto forte ESPECÍFICO que você observou — mencione elementos concretos>",
    "<ponto forte ESPECÍFICO>",
    "<ponto forte ESPECÍFICO>"
  ],
  "improvements": [
    { "issue": "<problema ESPECÍFICO com localização no criativo>", "suggestion": "<ação corretiva concreta e acionável>" },
    { "issue": "<problema ESPECÍFICO>", "suggestion": "<ação corretiva>" },
    { "issue": "<problema ESPECÍFICO>", "suggestion": "<ação corretiva>" }
  ],
  "variations": [
    "<sugestão de teste A/B baseada no que você viu no criativo>",
    "<sugestão de teste A/B>",
    "<sugestão de teste A/B>"
  ],
  "audience_fit": ${audience ? '"<análise específica de adequação ao público ' + audience + '>"' : 'null'}
}

REGRAS ABSOLUTAS:
- NÃO use respostas genéricas. Mencione elementos específicos do criativo.
- NÃO invente elementos que não estão no criativo.
- Seja preciso sobre a localização de textos, botões, imagens e como eles se relacionam com as safe zones do ${placement}.
- Se for vídeo, baseie-se no frame/thumbnail enviado para avaliar composição visual.`;

  try {
    let messages: any[];

    if (mediaType === "video" && mediaBase64) {
      // For video, we analyze the thumbnail frame
      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise este frame/thumbnail de VÍDEO para ${platform} no posicionamento ${placement}.\n\nContexto:\n- Plataforma: ${platform}\n- Posicionamento: ${placement}\n- Objetivo: ${objective}${audience ? "\n- Público: " + audience : ""}\n\nRetorne apenas o JSON, sem markdown.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${mediaBase64}`,
              },
            },
          ],
        },
      ];
    } else if (mediaBase64) {
      // Image analysis
      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise esta IMAGEM para ${platform} no posicionamento ${placement}.\n\nContexto:\n- Plataforma: ${platform}\n- Posicionamento: ${placement}\n- Objetivo: ${objective}${audience ? "\n- Público: " + audience : ""}\n\nRetorne apenas o JSON, sem markdown.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${mediaBase64}`,
              },
            },
          ],
        },
      ];
    } else {
      return new Response(JSON.stringify({ error: "No media provided for analysis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 2500,
        temperature: 0.2,
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos nas configurações." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content ?? "";

    // Strip markdown code fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch (_) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    return new Response(JSON.stringify({ result }), {
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
