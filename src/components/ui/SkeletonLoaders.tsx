import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-4 space-y-3", className)}>
      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
      <div className="h-7 bg-muted rounded animate-pulse w-3/4" />
      {lines > 2 && <div className="h-3 bg-muted rounded animate-pulse w-1/3" />}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center p-3 rounded-lg bg-muted/30">
          {[35, 15, 12, 12, 12, 10].map((w, j) => (
            <div
              key={j}
              className="h-3 bg-muted rounded animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 80 + j * 30}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 240 }: { height?: number }) {
  return (
    <div
      className="bg-muted/30 rounded-lg animate-pulse"
      style={{ height }}
    />
  );
}
