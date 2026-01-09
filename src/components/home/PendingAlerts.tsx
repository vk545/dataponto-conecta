import { AlertTriangle, FileText, Calendar, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "boleto" | "training" | "ticket";
  title: string;
  description: string;
  href: string;
  urgent?: boolean;
}

interface PendingAlertsProps {
  alerts: Alert[];
}

const alertIcons = {
  boleto: FileText,
  training: Calendar,
  ticket: Wrench,
};

export function PendingAlerts({ alerts }: PendingAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <h2 className="font-medium text-sm">Pendências</h2>
      </div>
      
      <div className="space-y-2">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <Link
              key={alert.id}
              to={alert.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border shadow-card card-interactive",
                alert.urgent 
                  ? "bg-destructive-light border-destructive/20" 
                  : "bg-warning-light border-warning/20"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg",
                alert.urgent ? "bg-destructive/10" : "bg-warning/10"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  alert.urgent ? "text-destructive" : "text-warning"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{alert.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
