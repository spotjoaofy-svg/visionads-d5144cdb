import { useEffect, useState } from "react";
import { useFacebookAPI } from "@/integrations/facebook/api";
import { FacebookThread } from "@/integrations/facebook/types";
import { useMetaAuth } from "@/hooks/useMetaAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare, User } from "lucide-react";

export default function ThreadsPage() {
  const { isAuthenticated, grantedScopes } = useMetaAuth();
  const { facebookAPI, setTokenFromSession } = useFacebookAPI();
  const [threads, setThreads] = useState<FacebookThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
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

      const threadsList = await facebookAPI.getThreads();
      setThreads(threadsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar threads");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredScopes = grantedScopes.includes("threads_business_basic");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Autenticação Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você precisa fazer login com Facebook para acessar seus threads.
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
              • <code className="bg-muted px-2 py-1 rounded">threads_business_basic</code>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Threads for Business</h1>
          <p className="text-muted-foreground">
            Gerencie conversas com clientes através do Threads
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
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Seus Threads</CardTitle>
              <CardDescription>
                {threads.length} thread(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {threads.length > 0 ? (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{thread.subject}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(thread.updated_time).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {thread.senders && thread.senders.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Participantes:</p>
                          <div className="flex flex-wrap gap-2">
                            {thread.senders.map((sender, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 bg-muted rounded-full px-3 py-1"
                              >
                                <User className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs">{sender.name || sender.email}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Nenhum thread encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
