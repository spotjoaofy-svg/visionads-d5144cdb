import { Construction } from "lucide-react";

export default function TikTokDashboard() {
  return (
    <div className="relative h-[calc(100dvh-3.5rem)] overflow-hidden">
      {/* Blurred content underneath */}
      <div className="absolute inset-0 blur-md pointer-events-none select-none opacity-40">
        <div className="p-6 space-y-5">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-card border border-border rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-card border border-border rounded-xl" />
          <div className="h-64 bg-card border border-border rounded-xl" />
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-background/60 backdrop-blur-[2px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-600/20 flex items-center justify-center">
          <Construction className="w-8 h-8 text-slate-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">TikTok Ads</h2>
          <p className="text-muted-foreground mt-1 text-sm">Em breve</p>
          <p className="text-xs text-muted-foreground/60 mt-2 max-w-xs">
            A integração com TikTok Ads está em desenvolvimento e estará disponível em breve.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">Em desenvolvimento</span>
        </div>
      </div>
    </div>
  );
}
