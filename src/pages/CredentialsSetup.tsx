import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Credentials {
  // Facebook
  facebookAppId: string;
  facebookAppSecret: string;
  facebookAppDomains: string;

  // Supabase
  supabaseProjectRef: string;
  supabaseUrl: string;
  supabaseAnonKey: string;

  // Facebook Redirect
  redirectUri: string;
}

interface ValidationStatus {
  facebookAppId: boolean;
  facebookAppSecret: boolean;
  supabaseUrl: boolean;
  supabaseAnonKey: boolean;
  redirectUri: boolean;
}

export default function CredentialsSetup() {
  const [credentials, setCredentials] = useState<Credentials>({
    facebookAppId: "",
    facebookAppSecret: "",
    facebookAppDomains: "localhost:5173",
    supabaseProjectRef: "",
    supabaseUrl: "",
    supabaseAnonKey: "",
    redirectUri: "",
  });

  const [showSecrets, setShowSecrets] = useState({
    facebookAppSecret: false,
    supabaseAnonKey: false,
  });

  const [validated, setValidated] = useState<ValidationStatus>({
    facebookAppId: false,
    facebookAppSecret: false,
    supabaseUrl: false,
    supabaseAnonKey: false,
    redirectUri: false,
  });

  const [activeTab, setActiveTab] = useState("facebook");

  const validateField = (field: string, value: string) => {
    const validations: Record<string, (v: string) => boolean> = {
      facebookAppId: (v) => v.length === 16 || v.match(/^\d{13,}$/),
      facebookAppSecret: (v) => v.length > 20,
      supabaseUrl: (v) => v.includes("supabase.co"),
      supabaseAnonKey: (v) => v.startsWith("eyJ") && v.length > 100,
      redirectUri: (v) => v.includes("supabase.co") && v.includes("callback"),
    };

    const validator = validations[field];
    if (validator) {
      setValidated((prev) => ({
        ...prev,
        [field]: validator(value),
      }));
    }
  };

  const handleInputChange = (field: keyof Credentials, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
    validateField(field, value);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência`,
    });
  };

  const isAllValid = Object.values(validated).every((v) => v);

  const generateEnvFile = () => {
    const envContent = `VITE_SUPABASE_URL=${credentials.supabaseUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${credentials.supabaseAnonKey}
FACEBOOK_APP_ID=${credentials.facebookAppId}
FACEBOOK_APP_SECRET=${credentials.facebookAppSecret}`;

    copyToClipboard(envContent, ".env content");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configuração de Credenciais
          </h1>
          <p className="text-muted-foreground">
            Insira as credenciais do Facebook e Supabase para integrar a autenticação OAuth
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="facebook">
              <Badge
                variant={
                  credentials.facebookAppId &&
                  credentials.facebookAppSecret &&
                  validated.facebookAppId &&
                  validated.facebookAppSecret
                    ? "default"
                    : "secondary"
                }
                className="mr-2"
              >
                {credentials.facebookAppId ? "✓" : ""}
              </Badge>
              Facebook
            </TabsTrigger>
            <TabsTrigger value="supabase">
              <Badge
                variant={
                  credentials.supabaseUrl &&
                  credentials.supabaseAnonKey &&
                  validated.supabaseUrl &&
                  validated.supabaseAnonKey
                    ? "default"
                    : "secondary"
                }
                className="mr-2"
              >
                {credentials.supabaseUrl ? "✓" : ""}
              </Badge>
              Supabase
            </TabsTrigger>
            <TabsTrigger value="resumo">
              <Badge
                variant={isAllValid ? "default" : "secondary"}
                className="mr-2"
              >
                {isAllValid ? "✓" : ""}
              </Badge>
              Resumo
            </TabsTrigger>
          </TabsList>

          {/* Facebook Tab */}
          <TabsContent value="facebook" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Credenciais do Facebook</CardTitle>
                <CardDescription>
                  Obtenha essas informações em{" "}
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Facebook Developers
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* App ID */}
                <div className="space-y-2">
                  <Label htmlFor="fb-app-id" className="flex items-center gap-2">
                    Facebook App ID
                    {validated.facebookAppId && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                  </Label>
                  <Input
                    id="fb-app-id"
                    placeholder="1234567890123456"
                    value={credentials.facebookAppId}
                    onChange={(e) =>
                      handleInputChange("facebookAppId", e.target.value)
                    }
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Settings → Basic → App ID
                  </p>
                </div>

                {/* App Secret */}
                <div className="space-y-2">
                  <Label htmlFor="fb-app-secret" className="flex items-center gap-2">
                    Facebook App Secret
                    {validated.facebookAppSecret && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="fb-app-secret"
                      type={showSecrets.facebookAppSecret ? "text" : "password"}
                      placeholder="abc123def456ghi789..."
                      value={credentials.facebookAppSecret}
                      onChange={(e) =>
                        handleInputChange("facebookAppSecret", e.target.value)
                      }
                      className="font-mono pr-10"
                    />
                    <button
                      onClick={() =>
                        setShowSecrets((prev) => ({
                          ...prev,
                          facebookAppSecret: !prev.facebookAppSecret,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSecrets.facebookAppSecret ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Settings → Basic → App Secret (clique para revelar)
                  </p>
                </div>

                {/* App Domains */}
                <div className="space-y-2">
                  <Label htmlFor="fb-domains">App Domains (adicione no Facebook)</Label>
                  <Input
                    id="fb-domains"
                    placeholder="localhost:5173, seu-dominio.com"
                    value={credentials.facebookAppDomains}
                    onChange={(e) =>
                      handleInputChange("facebookAppDomains", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure em: Settings → Basic → App Domains
                  </p>
                </div>

                {/* Info Box */}
                <Alert className="border-primary/20 bg-primary/5">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    Após obter essas credenciais, você deve adicioná-las no{" "}
                    <strong>Supabase Dashboard</strong> em{" "}
                    <strong>Authentication → Providers → Facebook</strong>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Supabase Tab */}
          <TabsContent value="supabase" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Configurações do Supabase</CardTitle>
                <CardDescription>
                  Obtenha essas informações em{" "}
                  <a
                    href="https://app.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Supabase Dashboard
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Ref */}
                <div className="space-y-2">
                  <Label htmlFor="supabase-ref">Project Reference ID</Label>
                  <Input
                    id="supabase-ref"
                    placeholder="btklpccneknufyqiwnaf"
                    value={credentials.supabaseProjectRef}
                    onChange={(e) =>
                      handleInputChange("supabaseProjectRef", e.target.value)
                    }
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Settings → General → Reference ID
                  </p>
                </div>

                {/* Supabase URL */}
                <div className="space-y-2">
                  <Label htmlFor="supabase-url" className="flex items-center gap-2">
                    Supabase Project URL
                    {validated.supabaseUrl && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                  </Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://seu-projeto.supabase.co"
                    value={credentials.supabaseUrl}
                    onChange={(e) =>
                      handleInputChange("supabaseUrl", e.target.value)
                    }
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Settings → API → Project URL
                  </p>
                </div>

                {/* Anon Key */}
                <div className="space-y-2">
                  <Label
                    htmlFor="supabase-key"
                    className="flex items-center gap-2"
                  >
                    Supabase Anon Public Key
                    {validated.supabaseAnonKey && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="supabase-key"
                      type={showSecrets.supabaseAnonKey ? "text" : "password"}
                      placeholder="eyJhbGciOiJIUzI1NiIs..."
                      value={credentials.supabaseAnonKey}
                      onChange={(e) =>
                        handleInputChange("supabaseAnonKey", e.target.value)
                      }
                      className="font-mono text-xs pr-10"
                    />
                    <button
                      onClick={() =>
                        setShowSecrets((prev) => ({
                          ...prev,
                          supabaseAnonKey: !prev.supabaseAnonKey,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSecrets.supabaseAnonKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Settings → API → Anon Public Key
                  </p>
                </div>

                {/* Facebook Redirect URI */}
                <div className="space-y-2">
                  <Label htmlFor="redirect-uri" className="flex items-center gap-2">
                    Facebook Redirect URI (gerado automaticamente)
                    {validated.redirectUri && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="redirect-uri"
                      placeholder="https://seu-projeto.supabase.co/auth/v1/callback?provider=facebook"
                      value={credentials.redirectUri}
                      onChange={(e) =>
                        handleInputChange("redirectUri", e.target.value)
                      }
                      className="font-mono text-xs"
                      readOnly
                    />
                    <button
                      onClick={() =>
                        copyToClipboard(credentials.redirectUri, "Redirect URI")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use isso em: Facebook → Produtos → Facebook Login → Settings → Valid OAuth Redirect URIs
                  </p>
                </div>

                {/* Auto-generate Button */}
                <Button
                  onClick={() => {
                    if (credentials.supabaseUrl) {
                      const newRedirectUri = `${credentials.supabaseUrl}/auth/v1/callback?provider=facebook`;
                      setCredentials((prev) => ({
                        ...prev,
                        redirectUri: newRedirectUri,
                      }));
                      validateField("redirectUri", newRedirectUri);
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Gerar Redirect URI Automaticamente
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resumo Tab */}
          <TabsContent value="resumo" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Resumo das Credenciais</CardTitle>
                <CardDescription>
                  Verifique se todos os campos estão preenchidos corretamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAllValid ? (
                  <Alert className="border-success/50 bg-success/5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">
                      Todas as credenciais foram validadas com sucesso! 🎉
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-warning/50 bg-warning/5">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <AlertDescription>
                      Complete todos os campos obrigatórios antes de continuar
                    </AlertDescription>
                  </Alert>
                )}

                {/* Credenciais Summary */}
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {/* Facebook */}
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        🔵 Facebook
                        {credentials.facebookAppId &&
                          credentials.facebookAppSecret && (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          )}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">App ID:</p>
                          <p className="font-mono text-foreground">
                            {credentials.facebookAppId || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">App Secret:</p>
                          <p className="font-mono text-foreground">
                            {credentials.facebookAppSecret
                              ? "●".repeat(8)
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">App Domains:</p>
                          <p className="font-mono text-foreground">
                            {credentials.facebookAppDomains}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Supabase */}
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        🟢 Supabase
                        {credentials.supabaseUrl && credentials.supabaseAnonKey && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Project URL:</p>
                          <p className="font-mono text-foreground">
                            {credentials.supabaseUrl || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Anon Key:</p>
                          <p className="font-mono text-foreground text-xs">
                            {credentials.supabaseAnonKey
                              ? credentials.supabaseAnonKey.slice(0, 20) +
                                "..." +
                                credentials.supabaseAnonKey.slice(-10)
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generate .env */}
                <div className="space-y-3">
                  <Button
                    onClick={generateEnvFile}
                    disabled={!isAllValid}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Copiar conteúdo do .env
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Cole o conteúdo no arquivo .env da raiz do projeto
                  </p>
                </div>

                {/* Next Steps */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-foreground">Próximos passos:</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Copie o conteúdo do .env acima</li>
                    <li>Cole no arquivo .env da raiz do projeto</li>
                    <li>
                      Adicione o Redirect URI no Facebook Developers (Settings → Facebook Login)
                    </li>
                    <li>
                      Habilite o Facebook Provider no Supabase Dashboard
                      (Authentication → Providers → Facebook)
                    </li>
                    <li>Cole as credenciais no Supabase e salve</li>
                    <li>Teste o login com Facebook na página /login</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
