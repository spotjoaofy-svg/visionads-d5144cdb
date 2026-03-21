import { useEffect, useState } from "react";
import { useFacebookAPI } from "@/integrations/facebook/api";
import { FacebookEngagementData } from "@/integrations/facebook/types";
import { useMetaAuth } from "@/hooks/useMetaAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3, Heart, MessageCircle, Share2, Eye } from "lucide-react";

export default function EngagementPage() {
  const { isAuthenticated, grantedScopes } = useMetaAuth();
  const { facebookAPI, setTokenFromSession } = useFacebookAPI();
  const [engagementData, setEngagementData] = useState<FacebookEngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEngagement();
  }, []);

  const loadEngagement = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        setError("Você precisa estar autenticado com Facebook");
        return;
      }

      const tokenSet = await setTokenFromSession();
      if (!tokenSet) {
        setError("Token não disponível");
        return;
      }

      // Obter páginas primeiro
      const pages = await facebookAPI.getPages();
      if (pages.length > 0) {
        const insights = await facebookAPI.getEngagementInsights(pages[0].id);
        setEngagementData(insights);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar engajamento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredScopes = grantedScopes.includes("pages_read_engagement");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Autenticação Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você precisa fazer login com Facebook para acessar dados de engajamento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasRequiredScopes) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-border">
          <CardHeader>
            <CardTitle className="text-warning">Permissão Faltando</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Esta página requer a seguinte permissão:
            </p>
            <div className="text-sm">
              • <code className="bg-muted px-2 py-1 rounded">pages_read_engagement</code>
            </div>
            <Button className="w-full bg-primary">Solicitar Permissão</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Análise de Engajamento</h1>
          <p className="text-muted-foreground">
            Visualize métricas de engajamento, curtidas, comentários e compartilhamentos
          </p>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {engagementData.length > 0 ? (
              <>
                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-border">
                    <CardContent>
                      <div className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className="w-4 h-4 text-destructive" />
                          <p className="text-sm text-muted-foreground">Curtidas</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {engagementData.reduce((sum, d) => sum + d.like_count, 0).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardContent>
                      <div className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          <p className="text-sm text-muted-foreground">Comentários</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {engagementData.reduce((sum, d) => sum + d.comment_count, 0).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardContent>
                      <div className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Share2 className="w-4 h-4 text-success" />
                          <p className="text-sm text-muted-foreground">Compartilhamentos</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {engagementData.reduce((sum, d) => sum + d.share_count, 0).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardContent>
                      <div className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Visualizações</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {engagementData.reduce((sum, d) => sum + d.engagement_count, 0).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detalhes */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Detalhes por Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {engagementData.map((data, idx) => (
                        <div key={idx} className="p-3 border border-border rounded-lg">
                          <p className="font-medium text-foreground text-sm mb-2">
                            {data.page_name} - {data.period}
                          </p>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>❤️ {data.like_count}</div>
                            <div>💬 {data.comment_count}</div>
                            <div>🔄 {data.share_count}</div>
                            <div>👁️ {data.engagement_count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Nenhum dado de engajamento encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
