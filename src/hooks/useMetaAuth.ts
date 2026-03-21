import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFacebookAPI } from "@/integrations/facebook/api";
import { FACEBOOK_SCOPES } from "@/integrations/facebook/types";

export interface FacebookScope {
  scope: string;
  granted: boolean;
  description: string;
}

export function useMetaAuth() {
  const { setTokenFromSession } = useFacebookAPI();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [grantedScopes, setGrantedScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      if (data.session?.provider === "facebook" && data.session?.provider_token) {
        setIsAuthenticated(true);
        await setTokenFromSession();

        // Obter escopos concedidos do token (decodificar JWT se necessário)
        const grantedScopesFromToken = parseGrantedScopes(data.session.provider_token);
        setGrantedScopes(grantedScopesFromToken);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: FACEBOOK_SCOPES.join(","),
        },
      });

      if (authError) throw authError;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(message);
      console.error("Erro no login:", err);
    } finally {
      setLoading(false);
    }
  };

  const requestAdditionalScopes = async (scopes: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const missingScopes = scopes.filter((s) => !grantedScopes.includes(s));
      if (missingScopes.length === 0) {
        return true;
      }

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: missingScopes.join(","),
        },
      });

      if (authError) throw authError;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao solicitar escopos";
      setError(message);
      console.error("Erro:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setGrantedScopes([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    grantedScopes,
    loading,
    error,
    loginWithFacebook,
    requestAdditionalScopes,
    logout,
    checkAuth,
  };
}

function parseGrantedScopes(token: string): string[] {
  try {
    // Se for um JWT/token do Supabase, tentar decodificar
    const parts = token.split(".");
    if (parts.length === 3) {
      const decoded = JSON.parse(atob(parts[1]));
      if (decoded.scopes) {
        return decoded.scopes.split(",").filter((s: string) => s.trim());
      }
    }
  } catch (e) {
    console.log("Não foi possível decodificar scopes do token");
  }

  // Fallback: assumir todos os escopos se token válido
  return FACEBOOK_SCOPES;
}
