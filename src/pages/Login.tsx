import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useMetaAuth } from "@/hooks/useMetaAuth";

export default function Login() {
  const navigate = useNavigate();
  const { loginWithFacebook } = useMetaAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Conta criada!", description: "Verifique seu e-mail para confirmar." });
        navigate("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const handleFacebook = async () => {
    setLoading(true);
    try {
      await loginWithFacebook();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer login com Facebook",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
              background: `hsl(239, 84%, 67%)`,
              left: `${10 + i * 15}%`, top: `${10 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`, animationDuration: `${3 + i}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-primary-foreground fill-current" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">VisionAds</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "signin" ? "Gestão inteligente de tráfego pago" : "Criar nova conta"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full gap-3 h-11 border-border hover:bg-muted font-medium"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </Button>

          <Button
            variant="outline"
            className="w-full gap-3 h-11 border-border hover:bg-muted font-medium mt-3"
            onClick={handleFacebook}
            disabled={loading}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Entrar com Facebook
          </Button>

          <div className="flex items-center gap-3 my-6">
            <Separator className="flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-medium">ou</span>
            <Separator className="flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com.br" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border h-11 text-foreground placeholder:text-muted-foreground focus:border-primary"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"}
                  placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted border-border h-11 text-foreground placeholder:text-muted-foreground focus:border-primary pr-10"
                  required minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === "signin" ? "Entrando..." : "Criando conta..."}
                </span>
              ) : (
                mode === "signin" ? "Entrar" : "Criar conta"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signin" ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              onClick={() => setMode(m => m === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "signin" ? "Criar conta" : "Entrar"}
            </button>
          </p>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-xs text-muted-foreground mb-3">
              Precisa configurar o Facebook OAuth?
            </p>
            <Button
              variant="secondary"
              className="w-full text-sm"
              onClick={() => navigate("/setup-credentials")}
            >
              Ir para Configurações de Credenciais
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
