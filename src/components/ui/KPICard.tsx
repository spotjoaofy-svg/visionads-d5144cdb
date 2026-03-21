import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SparklineChart } from "./SparklineChart";
import { generateSparkline } from "@/data/mockData";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function KPICard({ title, value, change, icon, className, delay = 0 }: KPICardProps) {
  const isPositive = (change ?? 0) >= 0;
  const sparkData = generateSparkline(7, 20, 100);

  return (
    <div
      className={cn(
        "relative bg-card border border-border rounded-xl p-4 card-hover animate-fade-up overflow-hidden",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate mb-1">
            {title}
          </p>
          <p className="metric-value text-2xl text-foreground leading-tight">{value}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}% vs período anterior
          </div>
        )}
        <div className="h-8 w-20 flex-shrink-0 ml-auto">
          <SparklineChart data={sparkData} positive={isPositive} />
        </div>
      </div>
    </div>
  );
}
