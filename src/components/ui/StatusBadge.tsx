import { cn } from "@/lib/utils";

type Severity = "danger" | "warning" | "success" | "info";

interface StatusBadgeProps {
  severity?: Severity;
  label: string;
  className?: string;
}

const severityMap: Record<Severity, string> = {
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  success: "bg-success/15 text-success border-success/30",
  info: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({ severity = "info", label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        severityMap[severity],
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full flex-shrink-0",
          severity === "danger" && "bg-destructive",
          severity === "warning" && "bg-warning",
          severity === "success" && "bg-success",
          severity === "info" && "bg-primary"
        )}
      />
      {label}
    </span>
  );
}
