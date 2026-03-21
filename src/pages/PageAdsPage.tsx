import { useEffect, useState } from "react";
import { useFacebookAPI } from "@/integrations/facebook/api";
import { useMetaAuth } from "@/hooks/useMetaAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Megaphone, Plus, Edit2 } from "lucide-react";

export default function PageAdsPage() {
  const { isAuthenticated, grantedScopes } = useMetaAuth();
  const { facebookAPI, setTokenFromSession } = useFacebookAPI();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
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

      const pagesList = await facebookAPI.getPages();
      setPages(pagesList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar páginas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredScopes = grantedScopes.includes("pages_manage_ads");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Autenticação Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você precisa fazer login com Facebook para gerenciar anúncios de páginas.
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
              • <code className="bg-muted px-2 py-1 rounded">pages_manage_ads</code>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Anúncios de Páginas</h1>
            <p className="text-muted-foreground">
              Crie e gerencie anúncios para suas páginas do Facebook
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            Criar Anúncio
          </Button>
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
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Páginas Disponíveis</CardTitle>
              <CardDescription>
                Selecione uma página para gerenciar seus anúncios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pages.length > 0 ? (
                <div className="space-y-3">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{page.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{page.id}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Categoria: {page.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <Megaphone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {page.fan_count && (
                          <Badge variant="outline">
                            👥 {(page.fan_count).toLocaleString("pt-BR")} fãs
                          </Badge>
                        )}
                        {page.followers_count && (
                          <Badge variant="outline">
                            👁️ {(page.followers_count).toLocaleString("pt-BR")} seguidores
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Nenhuma página encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Guia de Criação */}
        <Card className="border-border mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Como Criar um Anúncio de Página</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3">
              <li className="flex gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <p className="font-medium text-foreground">Selecione uma página</p>
                  <p className="text-sm text-muted-foreground">
                    Escolha a página para a qual deseja criar um anúncio
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <p className="font-medium text-foreground">Defina o objetivo</p>
                  <p className="text-sm text-muted-foreground">
                    Escolha entre alcance, engajamento, conversões, etc.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <p className="font-medium text-foreground">Configure o público</p>
                  <p className="text-sm text-muted-foreground">
                    Defina a localização, idade, interesses e mais
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <p className="font-medium text-foreground">Escolha o formato</p>
                  <p className="text-sm text-muted-foreground">
                    Imagem, vídeo, carrossel ou coleção
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Badge className="mt-1">5</Badge>
                <div>
                  <p className="font-medium text-foreground">Defina o orçamento</p>
                  <p className="text-sm text-muted-foreground">
                    Escolha entre orçamento diário ou ao longo da vida
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
