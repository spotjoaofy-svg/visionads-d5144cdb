import { useEffect, useState } from "react";
import { useFacebookAPI } from "@/integrations/facebook/api";
import { FacebookPage } from "@/integrations/facebook/types";
import { useMetaAuth } from "@/hooks/useMetaAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, ThumbsUp, Edit2 } from "lucide-react";

export default function PagesManagement() {
  const { isAuthenticated, grantedScopes } = useMetaAuth();
  const { facebookAPI, setTokenFromSession } = useFacebookAPI();
  const [pages, setPages] = useState<FacebookPage[]>([]);
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

  const hasRequiredScopes = grantedScopes.includes("pages_show_list") && grantedScopes.includes("pages_manage_metadata");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Autenticação Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você precisa fazer login com Facebook para acessar suas páginas.
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
            <CardTitle className="text-warning">Permissões Faltando</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Esta página requer as seguintes permissões:
            </p>
            <ul className="space-y-2">
              <li className="text-sm">• <code className="bg-muted px-2 py-1 rounded">pages_show_list</code></li>
              <li className="text-sm">• <code className="bg-muted px-2 py-1 rounded">pages_manage_metadata</code></li>
            </ul>
            <Button className="w-full bg-primary">Solicitar Permissões</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Páginas do Facebook</h1>
          <p className="text-muted-foreground">
            Gerencie suas páginas do Facebook, informações e configurações
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
          <div className="grid gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Suas Páginas</CardTitle>
                <CardDescription>
                  {pages.length} página(s) encontrada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pages.length > 0 ? (
                  <div className="space-y-4">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{page.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{page.id}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{page.category}</Badge>
                            <Button size="sm" variant="ghost" className="text-primary">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                              <Users className="w-3 h-3" />
                              Fãs
                            </div>
                            <p className="font-semibold text-foreground">
                              {(page.fan_count || 0).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                              <ThumbsUp className="w-3 h-3" />
                              Seguidores
                            </div>
                            <p className="font-semibold text-foreground">
                              {(page.followers_count || 0).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                              Token
                            </div>
                            <p className="font-semibold text-foreground text-xs truncate">
                              {page.access_token?.slice(0, 10)}...
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">
                            Editar Informações
                          </Button>
                          <Button size="sm" variant="outline">
                            Ver Publicações
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">Nenhuma página encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
