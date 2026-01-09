import { ReactNode } from "react";
import { LucideIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon?: LucideIcon;
  title: string;
  value: string | ReactNode;
  subtitle?: string;
  href?: string;
  className?: string;
}

export function InfoCard({ icon: Icon, title, value, subtitle, href, className }: InfoCardProps) {
  const content = (
    <>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-primary-light">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <div className="font-medium text-foreground mt-0.5">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {href && <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
      </div>
    </>
  );

  const baseClasses = cn(
    "block p-4 rounded-xl border border-border bg-card shadow-card",
    href && "card-interactive",
    className
  );

  if (href) {
    return <Link to={href} className={baseClasses}>{content}</Link>;
  }

  return <div className={baseClasses}>{content}</div>;
}
