import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Página intermediária para o popup do OAuth do Facebook.
 * Lê os parâmetros da URL (query e hash), persiste o token quando presente,
 * envia um postMessage para a janela pai com o resultado e fecha o popup.
 */
export default function FacebookCallback() {
  const [params] = useSearchParams();

  useEffect(() => {
    const origin = window.location.origin;
    const fbSuccess = params.get("fb_success");
    const fbError = params.get("fb_error") || params.get("error") || params.get("error_description");
    const code = params.get("code");
    const qAccess = params.get("access_token");

    // Lê hash (ex: #access_token=...)
    let hashAccess: string | null = null;
    try {
      if (window.location.hash) {
        const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        hashAccess = h.get("access_token");
      }
    } catch (e) {
      // ignore
    }
    const accessToken = qAccess || hashAccess || null;

    // Persiste token se houver e notifica a janela pai
    if (accessToken) {
      try {
        localStorage.setItem("facebook_access_token", accessToken);
      } catch (e) {
        // ignore storage errors
      }

      const payload = { type: "fb_oauth", status: "success", access_token: accessToken };
      if (window.opener) {
        try {
          window.opener.postMessage(payload, origin);
        } catch (_) {
          window.opener.postMessage(payload, "*");
        }
      }

      setTimeout(() => window.close(), 300);
      return;
    }

    // If we received a code, the edge function should have exchanged it already
    // and redirected with access_token. If we still only have code, pass it to opener.
    if (code) {
      const payload = { type: "fb_oauth", status: "code", code };
      if (window.opener) {
        try {
          window.opener.postMessage(payload, origin);
        } catch (_) {
          window.opener.postMessage(payload, "*");
        }
      }
      setTimeout(() => window.close(), 600);
      return;
    }

    // Fallback para fb_success/fb_error
    if (fbSuccess) {
      const payload = { type: "fb_oauth", status: "success" };
      if (window.opener) {
        try {
          window.opener.postMessage(payload, origin);
        } catch (_) {
          window.opener.postMessage(payload, "*");
        }
      }
      setTimeout(() => window.close(), 300);
      return;
    }

    const payload = { type: "fb_oauth", status: "error", error: fbError ?? "no_token_or_code" };
    if (window.opener) {
      try {
        window.opener.postMessage(payload, origin);
      } catch (_) {
        window.opener.postMessage(payload, "*");
      }
    }
    setTimeout(() => window.close(), 300);
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Finalizando conexão…</p>
      </div>
    </div>
  );
}
