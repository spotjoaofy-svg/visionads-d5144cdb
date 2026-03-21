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
        "relative bg-card border border-border rounded-xl p-3 sm:p-4 card-hover animate-fade-up overflow-hidden min-w-0",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-1.5 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate mb-1">
            {title}
          </p>
          <p className="metric-value text-base sm:text-xl md:text-2xl text-foreground leading-tight truncate">{value}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 sm:mt-3 flex items-center justify-between gap-1">
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium min-w-0",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
            ) : (
              <ArrowDownRight className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="truncate">{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
        <div className="h-7 sm:h-8 w-14 sm:w-20 flex-shrink-0 ml-auto">
          <SparklineChart data={sparkData} positive={isPositive} />
        </div>
      </div>
    </div>
  );
}
