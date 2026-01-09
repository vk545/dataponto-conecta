import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  href: string;
  variant?: "default" | "primary" | "accent" | "warning";
  badge?: string | number;
}

const variantStyles = {
  default: "bg-card hover:bg-muted/50",
  primary: "bg-primary-light hover:bg-primary/10",
  accent: "bg-accent-light hover:bg-accent/10",
  warning: "bg-warning-light hover:bg-warning/10",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-warning/10 text-warning",
};

export function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  variant = "default",
  badge 
}: QuickActionCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border border-border shadow-card card-interactive relative",
        variantStyles[variant]
      )}
    >
      <div className={cn("p-2.5 rounded-xl", iconStyles[variant])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-foreground truncate">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        )}
      </div>
      {badge !== undefined && (
        <span className="absolute top-2 right-2 h-5 min-w-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
