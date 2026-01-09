import { cn } from "@/lib/utils";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";

export type StatusType = "open" | "progress" | "done";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  open: {
    label: "Aberto",
    icon: Clock,
    className: "bg-warning-light text-warning",
  },
  progress: {
    label: "Em andamento",
    icon: Loader2,
    className: "bg-info-light text-info",
  },
  done: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "bg-success-light text-success",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn("status-badge", config.className, className)}>
      <Icon className={cn("h-3 w-3", status === "progress" && "animate-spin")} />
      {config.label}
    </span>
  );
}
