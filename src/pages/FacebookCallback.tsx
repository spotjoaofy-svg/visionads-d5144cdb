import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Página intermediária para o popup do OAuth do Facebook.
 * Lê os parâmetros da URL, envia um postMessage para a janela pai e fecha o popup.
 */
export default function FacebookCallback() {
  const [params] = useSearchParams();

  useEffect(() => {
    const success = params.get("fb_success");
    const error = params.get("fb_error");

    const payload = success
      ? { type: "fb_oauth", status: "success" }
      : { type: "fb_oauth", status: "error", error: error ?? "unknown" };

    if (window.opener) {
      window.opener.postMessage(payload, window.location.origin);
    }

    // Fecha o popup após enviar a mensagem
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
