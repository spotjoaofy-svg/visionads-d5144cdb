import { useEffect, useState } from "react";
import { useMetaAuth } from "@/hooks/useMetaAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { FACEBOOK_SCOPES } from "@/integrations/facebook/types";

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  email: "Acesso ao e-mail da conta",
  catalog_management: "Gerenciar catálogos de produtos",
  threads_business_basic: "Acessar Threads for Business",
  pages_show_list: "Listar suas páginas do Facebook",
  ads_management: "Criar e gerenciar anúncios",
  ads_read: "Ler dados de anúncios e campanhas",
  business_management: "Gerenciar empresas e contas",
  leads_retrieval: "Acessar leads e formulários",
  pages_read_engagement: "Ler engajamento de páginas",
  pages_manage_metadata: "Gerenciar metadados de páginas",
  pages_manage_ads: "Gerenciar anúncios de páginas",
  public_profile: "Acesso ao perfil público",
};

export default function Permissions() {
  const { grantedScopes, loading, requestAdditionalScopes } = useMetaAuth();
  const [requestingScopes, setRequestingScopes] = useState<string[]>([]);

  const handleRequestScopes = async (scopes: string[]) => {
    setRequestingScopes(scopes);
    try {
      await requestAdditionalScopes(scopes);
    } finally {
      setRequestingScopes([]);
    }
  };

  const missingScopes = FACEBOOK_SCOPES.filter((scope) => !grantedScopes.includes(scope));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Permissões do Facebook</h1>
          <p className="text-muted-foreground">
            Gerencie as permissões concedidas ao VisionAds para acessar seus dados do Facebook
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Permissões Concedidas */}
            {grantedScopes.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <CardTitle>Permissões Ativas</CardTitle>
                  </div>
                  <CardDescription>Escopos que foram concedidos ao VisionAds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {grantedScopes.map((scope) => (
                      <div
                        key={scope}
                        className="flex items-start justify-between p-3 bg-success/5 border border-success/20 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">{scope}</p>
                            <p className="text-sm text-muted-foreground">
                              {SCOPE_DESCRIPTIONS[scope] || "Escopo do Facebook"}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-success/20 text-success hover:bg-success/30">
                          Ativo
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permissões Faltando */}
            {missingScopes.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <CardTitle>Permissões Pendentes</CardTitle>
                  </div>
                  <CardDescription>Escopos que ainda não foram concedidos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {missingScopes.map((scope) => (
                      <div
                        key={scope}
                        className="flex items-start justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">{scope}</p>
                            <p className="text-sm text-muted-foreground">
                              {SCOPE_DESCRIPTIONS[scope] || "Escopo do Facebook"}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-warning/30 text-warning">
                          Pendente
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleRequestScopes(missingScopes)}
                    disabled={requestingScopes.length > 0}
                    className="w-full mt-4 bg-primary hover:bg-primary/90"
                  >
                    {requestingScopes.length > 0 ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Solicitando permissões...
                      </>
                    ) : (
                      `Solicitar ${missingScopes.length} Permissões`
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {grantedScopes.length === FACEBOOK_SCOPES.length && (
              <Card className="border-border bg-success/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-success">
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                      <p className="font-medium">Todas as permissões concedidas!</p>
                      <p className="text-sm opacity-75">
                        Você tem acesso total a todos os recursos do VisionAds
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumo */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Resumo das Permissões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Permissões Concedidas</p>
                    <p className="text-2xl font-bold text-success">{grantedScopes.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Permissões Pendentes</p>
                    <p className="text-2xl font-bold text-warning">{missingScopes.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Escopos</p>
                    <p className="text-2xl font-bold text-foreground">{FACEBOOK_SCOPES.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progresso</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round((grantedScopes.length / FACEBOOK_SCOPES.length) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
