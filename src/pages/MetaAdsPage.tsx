import { useEffect, useState } from "react";
import { useFacebookAPI } from "@/integrations/facebook/api";
import { FacebookAdAccount, FacebookAd } from "@/integrations/facebook/types";
import { useMetaAuth } from "@/hooks/useMetaAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, DollarSign, Eye, MousePointerClick, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MetaAds() {
  const { isAuthenticated, grantedScopes } = useMetaAuth();
  const { facebookAPI, setTokenFromSession } = useFacebookAPI();
  const [accounts, setAccounts] = useState<FacebookAdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [ads, setAds] = useState<FacebookAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

      const adAccounts = await facebookAPI.getAdAccounts();
      setAccounts(adAccounts);
      if (adAccounts.length > 0) {
        setSelectedAccount(adAccounts[0].id);
        const accountAds = await facebookAPI.getAdsByAccount(adAccounts[0].id.replace("act_", ""));
        setAds(accountAds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = async (accountId: string) => {
    setSelectedAccount(accountId);
    try {
      setLoading(true);
      const accountAds = await facebookAPI.getAdsByAccount(accountId.replace("act_", ""));
      setAds(accountAds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar anúncios");
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredScopes = grantedScopes.includes("ads_management") && grantedScopes.includes("ads_read");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Autenticação Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você precisa fazer login com Facebook para acessar seus anúncios.
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
              <li className="text-sm">
                • <code className="bg-muted px-2 py-1 rounded">ads_management</code>
              </li>
              <li className="text-sm">
                • <code className="bg-muted px-2 py-1 rounded">ads_read</code>
              </li>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Anúncios Meta</h1>
          <p className="text-muted-foreground">
            Gerencie suas campanhas e anúncios do Facebook, Instagram e Audience Network
          </p>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && accounts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Contas de Anúncios */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Contas de Anúncios</CardTitle>
                <CardDescription>Selecione uma conta para visualizar seus anúncios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => handleSelectAccount(account.id)}
                      className={`p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAccount === account.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{account.name}</p>
                          <p className="text-sm text-muted-foreground">{account.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {account.currency} {parseFloat(account.amount_spent).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Gasto Total</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <Badge variant={account.account_status === 1 ? "default" : "destructive"}>
                          {account.account_status === 1 ? "Ativo" : "Inativo"}
                        </Badge>
                        {account.ads_data_access_eligible && (
                          <Badge variant="outline">Data Access OK</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Anúncios */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Anúncios Ativos</CardTitle>
                <CardDescription>
                  {ads.length} anúncios encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : ads.length > 0 ? (
                  <div className="space-y-4">
                    {ads.map((ad) => (
                      <div
                        key={ad.id}
                        className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{ad.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{ad.id}</p>
                          </div>
                          <Badge
                            variant={ad.status === "ACTIVE" ? "default" : "secondary"}
                          >
                            {ad.status}
                          </Badge>
                        </div>

                        {ad.insights && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <DollarSign className="w-3 h-3" />
                                Gasto
                              </div>
                              <p className="font-semibold text-foreground">
                                ${parseFloat(ad.insights.spend).toFixed(2)}
                              </p>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <Eye className="w-3 h-3" />
                                Impressões
                              </div>
                              <p className="font-semibold text-foreground">
                                {ad.insights.impressions}
                              </p>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <MousePointerClick className="w-3 h-3" />
                                Cliques
                              </div>
                              <p className="font-semibold text-foreground">
                                {ad.insights.clicks}
                              </p>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <TrendingUp className="w-3 h-3" />
                                CTR
                              </div>
                              <p className="font-semibold text-foreground">
                                {ad.insights.impressions > 0
                                  ? ((ad.insights.clicks / ad.insights.impressions) * 100).toFixed(2)
                                  : 0}%
                              </p>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-3">
                          Criado em {new Date(ad.created_time).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">Nenhum anúncio encontrado</p>
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
