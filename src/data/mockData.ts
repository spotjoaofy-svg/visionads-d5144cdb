// AdMind Mock Data — all values in BRL, Brazilian Portuguese labels

// ─── Date helpers ────────────────────────────────────────────────────────────
const today = new Date();
function daysAgo(n: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
function rand(min: number, max: number, decimals = 0) {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(decimals));
}

// ─── Daily time series (30 days) ─────────────────────────────────────────────
export const dailyMetrics = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  return {
    date: daysAgo(day),
    metaSpend: rand(3200, 8500, 2),
    googleSpend: rand(1800, 4200, 2),
    tiktokSpend: rand(900, 2800, 2),
    metaRoas: rand(2.1, 5.8, 2),
    googleRoas: rand(3.2, 7.1, 2),
    tiktokRoas: rand(1.8, 4.4, 2),
    metaConversions: rand(42, 180),
    googleConversions: rand(28, 110),
    tiktokConversions: rand(15, 75),
    metaImpressions: rand(85000, 320000),
    googleImpressions: rand(45000, 180000),
    tiktokImpressions: rand(120000, 450000),
    metaCtr: rand(1.1, 3.8, 2),
    googleCtr: rand(2.4, 6.2, 2),
    tiktokCtr: rand(0.8, 2.9, 2),
  };
});

// ─── KPI Totals ───────────────────────────────────────────────────────────────
export const overviewKPIs = {
  totalSpend: 284750.32,
  totalSpendChange: 12.4,
  totalConversions: 3842,
  totalConversionsChange: 8.7,
  avgRoas: 4.21,
  avgRoasChange: 3.2,
  activeCampaigns: 23,
  activeCampaignsChange: 2,
};

// ─── Platform summaries ───────────────────────────────────────────────────────
export const platformSummary = {
  meta: {
    name: "Meta Ads",
    account: "Loja Exemplo BR",
    spend: 158420.15,
    ctr: 2.4,
    roas: 4.82,
    status: "active" as const,
    color: "#1877F2",
  },
  google: {
    name: "Google Ads",
    account: "Loja Exemplo",
    spend: 87340.8,
    ctr: 4.1,
    roas: 5.63,
    status: "active" as const,
    color: "#EA4335",
  },
  tiktok: {
    name: "TikTok Ads",
    account: "Loja Exemplo TK",
    spend: 38989.37,
    ctr: 1.8,
    roas: 2.94,
    status: "active" as const,
    color: "#010101",
  },
};

// ─── Active Alerts ────────────────────────────────────────────────────────────
export const activeAlerts = [
  {
    id: "a1",
    severity: "danger" as const,
    title: "Budget esgotando",
    description: "Campanha Black Friday — Meta Ads",
    platform: "Meta",
    time: "há 12 min",
  },
  {
    id: "a2",
    severity: "warning" as const,
    title: "Frequência alta",
    description: "Ad Set Remarketing 7D — Meta Ads",
    platform: "Meta",
    time: "há 38 min",
  },
  {
    id: "a3",
    severity: "success" as const,
    title: "ROAS acima da meta",
    description: "Campanha Marca — Google Ads",
    platform: "Google",
    time: "há 1h",
  },
  {
    id: "a4",
    severity: "warning" as const,
    title: "CTR abaixo da média",
    description: "TikTok — Coleção Inverno",
    platform: "TikTok",
    time: "há 2h",
  },
  {
    id: "a5",
    severity: "danger" as const,
    title: "CPL acima da meta",
    description: "Campanha Leads — Meta Ads",
    platform: "Meta",
    time: "há 3h",
  },
];

// ─── Meta Campaigns ───────────────────────────────────────────────────────────
export const metaCampaigns = [
  {
    id: "mc1",
    name: "Black Friday — Conversão",
    objective: "Conversão",
    status: "active",
    budget: 1500,
    spend: 1247.32,
    impressions: 284930,
    ctr: 2.8,
    cpc: 1.42,
    cpl: 28.5,
    roas: 5.12,
    reach: 198400,
    clicks: 7978,
    conversions: 43,
  },
  {
    id: "mc2",
    name: "Remarketing — 7 Dias",
    objective: "Conversão",
    status: "active",
    budget: 800,
    spend: 743.8,
    impressions: 142300,
    ctr: 3.4,
    cpc: 1.54,
    cpl: 22.8,
    roas: 7.34,
    reach: 62100,
    clicks: 4838,
    conversions: 32,
  },
  {
    id: "mc3",
    name: "Prospecção — Lookalike 3%",
    objective: "Tráfego",
    status: "active",
    budget: 600,
    spend: 588.21,
    impressions: 312800,
    ctr: 1.9,
    cpc: 0.99,
    cpl: 48.2,
    roas: 2.87,
    reach: 241500,
    clicks: 5943,
    conversions: 12,
  },
  {
    id: "mc4",
    name: "Leads — Imóveis Premium",
    objective: "Geração de Leads",
    status: "active",
    budget: 1200,
    spend: 1180.5,
    impressions: 198700,
    ctr: 2.1,
    cpc: 2.83,
    cpl: 62.1,
    roas: 0,
    reach: 154000,
    clicks: 4173,
    conversions: 19,
  },
  {
    id: "mc5",
    name: "Awareness — Marca",
    objective: "Reconhecimento",
    status: "paused",
    budget: 400,
    spend: 0,
    impressions: 0,
    ctr: 0,
    cpc: 0,
    cpl: 0,
    roas: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
  },
  {
    id: "mc6",
    name: "Coleção Inverno 2024",
    objective: "Conversão",
    status: "ended",
    budget: 2000,
    spend: 1998.72,
    impressions: 425600,
    ctr: 2.6,
    cpc: 1.81,
    cpl: 35.7,
    roas: 4.21,
    reach: 312800,
    clicks: 11066,
    conversions: 56,
  },
];

// ─── Meta KPIs ────────────────────────────────────────────────────────────────
export const metaKPIs = {
  impressions: { value: 1843200, change: 14.2 },
  reach: { value: 987400, change: 11.8 },
  clicks: { value: 43820, change: 7.3 },
  ctr: { value: 2.38, change: -0.4 },
  spend: { value: 158420.15, change: 12.4 },
  roas: { value: 4.82, change: 5.1 },
};

// ─── Meta breakdowns ──────────────────────────────────────────────────────────
export const metaPlacementBreakdown = [
  { name: "Feed", value: 42 },
  { name: "Stories", value: 23 },
  { name: "Reels", value: 18 },
  { name: "Messenger", value: 8 },
  { name: "Audience Network", value: 6 },
  { name: "Outros", value: 3 },
];

export const metaAgeBreakdown = [
  { age: "18–24", ctr: 2.1, spend: 18400 },
  { age: "25–34", ctr: 3.4, spend: 52800 },
  { age: "35–44", ctr: 2.9, spend: 48200 },
  { age: "45–54", ctr: 2.2, spend: 28100 },
  { age: "55–64", ctr: 1.8, spend: 10920 },
  { age: "65+", ctr: 1.2, spend: 0 },
];

export const metaDeviceBreakdown = [
  { device: "Mobile", spend: 112400, ctr: 2.6 },
  { device: "Desktop", spend: 38200, ctr: 2.1 },
  { device: "Tablet", spend: 7820, ctr: 1.9 },
];

// CTR heatmap: 7 days x 24 hours (simplified to 7x8 blocks)
export const ctrHeatmap = Array.from({ length: 7 }, (_, dayIdx) => {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return Array.from({ length: 8 }, (_, hourIdx) => ({
    day: days[dayIdx],
    hour: `${hourIdx * 3}h`,
    ctr: rand(0.5, 4.2, 2),
  }));
}).flat();

// ─── Google Campaigns ─────────────────────────────────────────────────────────
export const googleCampaigns = [
  {
    id: "gc1",
    name: "Marca — Search",
    type: "Search",
    status: "active",
    budget: 800,
    spend: 742.8,
    impressions: 48200,
    clicks: 3924,
    ctr: 8.1,
    avgCpc: 0.19,
    conversions: 87,
    cpa: 8.54,
    roas: 9.21,
  },
  {
    id: "gc2",
    name: "Shopping — Produto Principal",
    type: "Shopping",
    status: "active",
    budget: 1200,
    spend: 1148.3,
    impressions: 142800,
    clicks: 8742,
    ctr: 6.1,
    avgCpc: 0.13,
    conversions: 142,
    cpa: 8.09,
    roas: 7.84,
  },
  {
    id: "gc3",
    name: "Performance Max — Conversão",
    type: "Perf. Max",
    status: "active",
    budget: 2000,
    spend: 1987.4,
    impressions: 284900,
    clicks: 14820,
    ctr: 5.2,
    avgCpc: 0.13,
    conversions: 198,
    cpa: 10.04,
    roas: 6.32,
  },
  {
    id: "gc4",
    name: "Concorrência — Search",
    type: "Search",
    status: "active",
    budget: 600,
    spend: 582.1,
    impressions: 28400,
    clicks: 1824,
    ctr: 6.4,
    avgCpc: 0.32,
    conversions: 28,
    cpa: 20.79,
    roas: 3.12,
  },
  {
    id: "gc5",
    name: "Display Remarketing",
    type: "Display",
    status: "paused",
    budget: 400,
    spend: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    avgCpc: 0,
    conversions: 0,
    cpa: 0,
    roas: 0,
  },
];

export const googleKPIs = {
  impressions: { value: 842100, change: 18.3 },
  clicks: { value: 39832, change: 12.1 },
  ctr: { value: 4.73, change: 1.2 },
  avgCpc: { value: 2.19, change: -4.8 },
  conversions: { value: 1284, change: 15.7 },
  cpa: { value: 68.01, change: -8.3 },
  roas: { value: 5.63, change: 9.2 },
};

export const searchTerms = [
  { term: "loja de roupas online", impressions: 12800, clicks: 1248, ctr: 9.75, conversions: 38, cpa: 32.8 },
  { term: "comprar calça jeans feminina", impressions: 8400, clicks: 924, ctr: 11.0, conversions: 29, cpa: 31.9 },
  { term: "moda feminina 2024", impressions: 6200, clicks: 521, ctr: 8.4, conversions: 14, cpa: 37.2 },
  { term: "vestido de festa barato", impressions: 4900, clicks: 388, ctr: 7.9, conversions: 8, cpa: 48.5 },
  { term: "blusa social feminina", impressions: 3800, clicks: 298, ctr: 7.8, conversions: 6, cpa: 49.7 },
];

export const qualityScoreData = [
  { score: "1–2", count: 3 },
  { score: "3–4", count: 8 },
  { score: "5–6", count: 21 },
  { score: "7–8", count: 34 },
  { score: "9–10", count: 14 },
];

// ─── TikTok Campaigns ─────────────────────────────────────────────────────────
export const tiktokCampaigns = [
  {
    id: "tc1",
    name: "UGC — Coleção Verão",
    objective: "Conversão",
    status: "active",
    budget: 600,
    spend: 548.2,
    impressions: 284900,
    clicks: 4274,
    ctr: 1.5,
    cpm: 19.24,
    videoViews: 198400,
    cpv: 0.00276,
    conversions: 28,
    roas: 3.84,
  },
  {
    id: "tc2",
    name: "Challenge — #LojaExemplo",
    objective: "Awareness",
    status: "active",
    budget: 800,
    spend: 782.4,
    impressions: 842000,
    clicks: 7578,
    ctr: 0.9,
    cpm: 9.29,
    videoViews: 724000,
    cpv: 0.00108,
    conversions: 18,
    roas: 1.42,
  },
  {
    id: "tc3",
    name: "Produto Destaque — Video",
    objective: "Conversão",
    status: "active",
    budget: 500,
    spend: 487.9,
    impressions: 198400,
    clicks: 3768,
    ctr: 1.9,
    cpm: 24.59,
    videoViews: 148200,
    cpv: 0.00329,
    conversions: 24,
    roas: 4.12,
  },
  {
    id: "tc4",
    name: "Remarketing — Visitantes",
    objective: "Conversão",
    status: "paused",
    budget: 300,
    spend: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cpm: 0,
    videoViews: 0,
    cpv: 0,
    conversions: 0,
    roas: 0,
  },
];

export const tiktokKPIs = {
  impressions: { value: 1984200, change: 24.8 },
  clicks: { value: 28420, change: 18.4 },
  ctr: { value: 1.43, change: -0.2 },
  cpm: { value: 19.64, change: 3.1 },
  videoViews: { value: 1482400, change: 31.2 },
  cpv: { value: 0.0026, change: -8.4 },
  conversions: { value: 842, change: 22.7 },
  roas: { value: 2.94, change: 4.8 },
};

export const videoPerformance = [
  { name: "UGC Verão #1", avgWatchTime: 14.2, vtr: 62.4, ctr: 2.1 },
  { name: "Challenge Destaque", avgWatchTime: 8.7, vtr: 41.8, ctr: 0.9 },
  { name: "Produto Close-up", avgWatchTime: 18.4, vtr: 71.2, ctr: 2.8 },
  { name: "Depoimento Cliente", avgWatchTime: 22.1, vtr: 78.9, ctr: 3.2 },
  { name: "Tutorial Uso", avgWatchTime: 31.8, vtr: 84.1, ctr: 1.7 },
];

// ─── Rankings — Creatives ─────────────────────────────────────────────────────
export const creativesRanking = [
  {
    id: "cr1",
    rank: 1,
    platform: "meta",
    format: "Video",
    thumbnail: "https://picsum.photos/seed/cr1/400/300",
    name: "UGC Depoimento — Produto A",
    ctr: 3.8,
    convRate: 4.2,
    roas: 7.34,
    frequency: 1.8,
    aiScore: 92,
    auditAvailable: true,
  },
  {
    id: "cr2",
    rank: 2,
    platform: "tiktok",
    format: "Video",
    thumbnail: "https://picsum.photos/seed/cr2/400/300",
    name: "Trending Sound — Coleção",
    ctr: 3.2,
    convRate: 3.8,
    roas: 6.12,
    frequency: 2.1,
    aiScore: 87,
    auditAvailable: false,
  },
  {
    id: "cr3",
    rank: 3,
    platform: "meta",
    format: "Carousel",
    thumbnail: "https://picsum.photos/seed/cr3/400/300",
    name: "Antes e Depois — Produto B",
    ctr: 2.9,
    convRate: 3.4,
    roas: 5.88,
    frequency: 2.4,
    aiScore: 81,
    auditAvailable: true,
  },
  {
    id: "cr4",
    rank: 4,
    platform: "google",
    format: "Image",
    thumbnail: "https://picsum.photos/seed/cr4/400/300",
    name: "Display Promoção 50%",
    ctr: 2.7,
    convRate: 2.9,
    roas: 5.42,
    frequency: 1.2,
    aiScore: 74,
    auditAvailable: false,
  },
  {
    id: "cr5",
    rank: 5,
    platform: "meta",
    format: "Image",
    thumbnail: "https://picsum.photos/seed/cr5/400/300",
    name: "Produto com Preço Destacado",
    ctr: 2.4,
    convRate: 2.6,
    roas: 4.92,
    frequency: 3.1,
    aiScore: 68,
    auditAvailable: true,
  },
  {
    id: "cr6",
    rank: 6,
    platform: "tiktok",
    format: "Video",
    thumbnail: "https://picsum.photos/seed/cr6/400/300",
    name: "Tutorial Produto 15s",
    ctr: 2.1,
    convRate: 2.3,
    roas: 4.21,
    frequency: 1.9,
    aiScore: 62,
    auditAvailable: false,
  },
  {
    id: "cr7",
    rank: 7,
    platform: "meta",
    format: "Video",
    thumbnail: "https://picsum.photos/seed/cr7/400/300",
    name: "Slideshow Inverno 2024",
    ctr: 1.8,
    convRate: 1.9,
    roas: 3.48,
    frequency: 4.2,
    aiScore: 44,
    auditAvailable: false,
  },
  {
    id: "cr8",
    rank: 8,
    platform: "google",
    format: "Image",
    thumbnail: "https://picsum.photos/seed/cr8/400/300",
    name: "Banner Genérico 728x90",
    ctr: 1.2,
    convRate: 1.4,
    roas: 2.18,
    frequency: 1.4,
    aiScore: 31,
    auditAvailable: false,
  },
];

// ─── Rankings — Campaigns ─────────────────────────────────────────────────────
export const campaignsRanking = [
  { rank: 1, name: "Marca — Search", platform: "google", objective: "Conversão", spend: 742.8, roas: 9.21, conversions: 87, aiScore: 94, trend: [7.8, 8.2, 8.9, 9.1, 9.21] },
  { rank: 2, name: "Remarketing 7D", platform: "meta", objective: "Conversão", spend: 743.8, roas: 7.34, conversions: 32, aiScore: 88, trend: [6.2, 6.8, 7.0, 7.2, 7.34] },
  { rank: 3, name: "Shopping Principal", platform: "google", objective: "Conversão", spend: 1148.3, roas: 7.84, conversions: 142, aiScore: 86, trend: [7.1, 7.4, 7.6, 7.8, 7.84] },
  { rank: 4, name: "Black Friday", platform: "meta", objective: "Conversão", spend: 1247.32, roas: 5.12, conversions: 43, aiScore: 72, trend: [4.8, 4.9, 5.0, 5.1, 5.12] },
  { rank: 5, name: "Produto Destaque", platform: "tiktok", objective: "Conversão", spend: 487.9, roas: 4.12, conversions: 24, aiScore: 65, trend: [3.4, 3.7, 3.9, 4.0, 4.12] },
];

// ─── AI Agent — Suggested questions ──────────────────────────────────────────
export const suggestedQuestions = [
  "Por que meu CPL subiu esta semana?",
  "Qual campanha devo pausar agora?",
  "Quais criativos estão com fadiga?",
  "Como está meu ROAS comparado ao mês passado?",
  "Onde devo redistribuir meu orçamento?",
  "Quais são as melhores horas para veicular anúncios?",
];

// ─── Creative Audit History ───────────────────────────────────────────────────
export const auditHistory = [
  {
    id: "ah1",
    date: daysAgo(2),
    thumbnail: "https://picsum.photos/seed/audit1/200/150",
    platform: "meta",
    type: "Video",
    score: 88,
    objective: "Conversão",
    name: "UGC Depoimento Produto A.mp4",
  },
  {
    id: "ah2",
    date: daysAgo(5),
    thumbnail: "https://picsum.photos/seed/audit2/200/150",
    platform: "tiktok",
    type: "Video",
    score: 72,
    objective: "Tráfego",
    name: "Trending_ColecaoV2.mp4",
  },
  {
    id: "ah3",
    date: daysAgo(9),
    thumbnail: "https://picsum.photos/seed/audit3/200/150",
    platform: "meta",
    type: "Image",
    score: 44,
    objective: "Conversão",
    name: "banner_promo_30off.jpg",
  },
];

// ─── Team members ─────────────────────────────────────────────────────────────
export const teamMembers = [
  { id: "tm1", name: "Ana Oliveira", email: "ana@lojaexemplo.com.br", role: "Admin", avatar: "AO", joinedAt: daysAgo(120) },
  { id: "tm2", name: "Bruno Mendes", email: "bruno@lojaexemplo.com.br", role: "Editor", avatar: "BM", joinedAt: daysAgo(45) },
];

// ─── Alert rules ──────────────────────────────────────────────────────────────
export const alertRules = [
  { id: "ar1", type: "Budget threshold", description: "Budget esgotando (<10% restante)", enabled: true, threshold: 10, unit: "%" },
  { id: "ar2", type: "CTR drop", description: "Queda no CTR (>20% comparado à semana)", enabled: true, threshold: 20, unit: "%" },
  { id: "ar3", type: "Frequency", description: "Frequência alta (>4x por semana)", enabled: true, threshold: 4, unit: "x" },
  { id: "ar4", type: "ROAS below target", description: "ROAS abaixo da meta", enabled: false, threshold: 2.5, unit: "x" },
  { id: "ar5", type: "CPL above target", description: "CPL acima da meta", enabled: true, threshold: 80, unit: "R$" },
];

// ─── Billing plans ────────────────────────────────────────────────────────────
export const billingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 197,
    features: ["1 Workspace", "Até R$50k em spend gerenciado", "3 contas de anúncios", "AI Agent básico", "Relatórios semanais"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 497,
    features: ["3 Workspaces", "Até R$200k em spend gerenciado", "10 contas de anúncios", "AI Agent avançado", "Auditorias ilimitadas", "Alertas em tempo real"],
    current: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: 997,
    features: ["Workspaces ilimitados", "Spend ilimitado", "Contas ilimitadas", "White-label", "Suporte prioritário", "API access"],
  },
];

// ─── Sparkline data generator ─────────────────────────────────────────────────
export function generateSparkline(length = 7, min = 10, max = 100) {
  return Array.from({ length }, () => ({ v: rand(min, max, 1) }));
}
