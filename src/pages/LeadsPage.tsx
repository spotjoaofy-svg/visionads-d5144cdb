import { useEffect, useState } from "react";
import { useFacebookAPI } from "@/integrations/facebook/api";
import { FacebookLead } from "@/integrations/facebook/types";
import { useMetaAuth } from "@/hooks/useMetaAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Calendar, User } from "lucide-react";

export default function LeadsPage() {
  const { isAuthenticated, grantedScopes } = useMetaAuth();
  const { facebookAPI, setTokenFromSession } = useFacebookAPI();
  const [leads, setLeads] = useState<FacebookLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
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

      // Para buscar leads, precisa de uma página específica
      // Primeiro obter páginas
      const pages = await facebookAPI.getPages();
      if (pages.length > 0) {
        const leadsList = await facebookAPI.getLeads(pages[0].id);
        setLeads(leadsList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar leads");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredScopes = grantedScopes.includes("leads_retrieval");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Autenticação Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você precisa fazer login com Facebook para acessar seus leads.
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
              • <code className="bg-muted px-2 py-1 rounded">leads_retrieval</code>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads e Formulários</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie os leads capturados através de seus formulários do Facebook
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
              <CardTitle>Leads Capturados</CardTitle>
              <CardDescription>
                {leads.length} lead(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length > 0 ? (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">Lead #{lead.id}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(lead.created_time).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge variant="outline">Novo</Badge>
                      </div>

                      <div className="space-y-2 mt-4">
                        {lead.field_data?.map((field, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="text-muted-foreground">{field.name}:</span>
                            <span className="ml-2 font-medium text-foreground">
                              {field.values?.join(", ") || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Nenhum lead encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
