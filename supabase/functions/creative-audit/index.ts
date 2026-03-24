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
    imageBase64: string;
    mimeType: string;
    platform: string;
    objective: string;
    brand?: string;
    audience?: string;
    isVideo?: boolean;
  };

  try {
    body = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { imageBase64, mimeType, platform, objective, brand, audience, isVideo } = body;

  const systemPrompt = `Você é um especialista em criativos para tráfego pago com vasta experiência em Meta Ads, Google Ads e TikTok Ads.

Analise o criativo fornecido e retorne EXATAMENTE o seguinte JSON (sem texto extra, apenas JSON válido):

{
  "overall_score": <número de 0 a 100>,
  "breakdown": [
    { "label": "Atenção Visual", "score": <0-100>, "comment": "<observação específica>" },
    { "label": "Clareza do CTA", "score": <0-100>, "comment": "<observação específica>" },
    { "label": "Thumb-stop Estimado", "score": <0-100>, "comment": "<observação específica>" },
    { "label": "Boas Práticas da Plataforma", "score": <0-100>, "comment": "<observação específica>" },
    { "label": "Elemento Humano/Emoção", "score": <0-100>, "comment": "<observação específica>" }
  ],
  "strengths": [
    "<ponto forte específico observado no criativo>",
    "<ponto forte específico observado no criativo>",
    "<ponto forte específico observado no criativo>"
  ],
  "improvements": [
    { "issue": "<problema específico identificado>", "suggestion": "<ação corretiva concreta>" },
    { "issue": "<problema específico identificado>", "suggestion": "<ação corretiva concreta>" },
    { "issue": "<problema específico identificado>", "suggestion": "<ação corretiva concreta>" }
  ],
  "variations": [
    "<sugestão de variação de teste A/B específica>",
    "<sugestão de variação de teste A/B específica>",
    "<sugestão de variação de teste A/B específica>"
  ]
}

Seja ESPECÍFICO sobre o que você vê na imagem. Não use respostas genéricas.`;

  const contextInfo = [
    `Plataforma: ${platform}`,
    `Objetivo: ${objective}`,
    brand ? `Marca: ${brand}` : null,
    audience ? `Público-alvo: ${audience}` : null,
    isVideo ? "Tipo: Vídeo (analisando frame/thumbnail)" : "Tipo: Imagem",
  ].filter(Boolean).join("\n");

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
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise este criativo para ${platform}.\n\nContexto:\n${contextInfo}\n\nRetorne apenas o JSON, sem markdown.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      // Attempt to extract JSON from response
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
