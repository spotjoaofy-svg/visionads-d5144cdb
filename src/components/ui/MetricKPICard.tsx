import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SparklineChart } from "./SparklineChart";
import { generateSparkline } from "@/data/mockData"; // fallback quando sparklineByMetric não é passado
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface MetricOption {
  key: string;
  label: string;
  format: (v: number) => string;
  description?: string;
}

interface MetricKPICardProps {
  metrics: MetricOption[];
  defaultMetric: string;
  data: Record<string, number>;
  /** Séries diárias por chave de métrica (ex.: dados reais do Meta). Se omitido, usa sparkline sintético. */
  sparklineByMetric?: Partial<Record<string, number[]>>;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
  isLoading?: boolean;
}

export function MetricKPICard({
  metrics,
  defaultMetric,
  data,
  sparklineByMetric,
  change,
  icon,
  className,
  delay = 0,
  isLoading = false,
}: MetricKPICardProps) {
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(defaultMetric);

  const selected = metrics.find((m) => m.key === selectedKey) ?? metrics[0];
  const rawValue = data[selected.key] ?? 0;
  const displayValue = selected.format(rawValue);
  const isPositive = (change ?? 0) >= 0;
  const seriesRaw =
    sparklineByMetric?.[selectedKey] ??
    sparklineByMetric?.[defaultMetric] ??
    [];
  const sparkData =
    sparklineByMetric !== undefined
      ? (seriesRaw.length >= 2
          ? seriesRaw.map((v) => ({ v }))
          : seriesRaw.length === 1
            ? [{ v: seriesRaw[0] }, { v: seriesRaw[0] }]
            : [{ v: 0 }, { v: 0 }])
      : generateSparkline(7, 20, 100);

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
          {/* Metric selector */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors group mb-1 max-w-full"
                title="Clique para trocar a métrica"
              >
                <span className="truncate">{selected.label}</span>
                <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-52 p-1 bg-card border-border"
              align="start"
              side="bottom"
            >
              <div className="space-y-0.5">
                {metrics.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => { setSelectedKey(m.key); setOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors",
                      m.key === selectedKey
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">{m.label}</span>
                      {m.description && (
                        <span className="text-[10px] opacity-60">{m.description}</span>
                      )}
                    </div>
                    {m.key === selectedKey && <Check className="w-3 h-3 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Value */}
          {isLoading ? (
            <div className="flex items-center gap-2 h-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="metric-value text-2xl text-foreground leading-tight">{displayValue}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", isPositive ? "text-success" : "text-destructive")}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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
