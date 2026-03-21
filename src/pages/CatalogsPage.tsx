import { useEffect, useState } from "react";
import { useFacebookAPI } from "@/integrations/facebook/api";
import { FacebookCatalog, FacebookProduct } from "@/integrations/facebook/types";
import { useMetaAuth } from "@/hooks/useMetaAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Grid, ArrowRight } from "lucide-react";

export default function Catalogs() {
  const { isAuthenticated, grantedScopes } = useMetaAuth();
  const { facebookAPI, setTokenFromSession } = useFacebookAPI();
  const [catalogs, setCatalogs] = useState<FacebookCatalog[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [products, setProducts] = useState<FacebookProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
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

      const catalogList = await facebookAPI.getCatalogs();
      setCatalogs(catalogList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar catálogos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCatalog = async (catalogId: string) => {
    setSelectedCatalog(catalogId);
    try {
      setLoading(true);
      const productList = await facebookAPI.getProducts(catalogId);
      setProducts(productList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredScopes = grantedScopes.includes("catalog_management");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Autenticação Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você precisa fazer login com Facebook para acessar seus catálogos.
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
              • <code className="bg-muted px-2 py-1 rounded">catalog_management</code>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Catálogos de Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus catálogos de produtos do Facebook e Instagram
          </p>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && catalogs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Catálogos */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Seus Catálogos</CardTitle>
                <CardDescription>
                  {catalogs.length} catálogo(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {catalogs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catalogs.map((catalog) => (
                      <button
                        key={catalog.id}
                        onClick={() => handleSelectCatalog(catalog.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedCatalog === catalog.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Grid className="w-5 h-5 text-primary" />
                          </div>
                          <Badge variant="outline">{catalog.vertical || "N/A"}</Badge>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{catalog.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {catalog.category_default || "Sem categoria"}
                        </p>
                        <div className="bg-muted rounded px-2 py-1 text-xs text-muted-foreground">
                          {catalog.product_count} produtos
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">Nenhum catálogo encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Produtos */}
            {selectedCatalog && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Produtos do Catálogo</CardTitle>
                  <CardDescription>
                    {products.length} produto(s) encontrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : products.length > 0 ? (
                    <div className="space-y-4">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex gap-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
                        >
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-20 h-20 rounded-lg object-cover bg-muted"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{product.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {product.description || "Sem descrição"}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm text-foreground">
                                  <span className="font-semibold">
                                    {product.currency} {product.price.toFixed(2)}
                                  </span>{" "}
                                  <Badge
                                    variant={product.availability === "in stock" ? "default" : "secondary"}
                                    className="ml-2"
                                  >
                                    {product.availability}
                                  </Badge>
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary"
                                onClick={() => window.open(product.url, "_blank")}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">Nenhum produto encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
