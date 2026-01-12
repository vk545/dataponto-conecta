import { ReactNode } from "react";
import { ChevronLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  rightAction?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle,
  showBack = false, 
  backTo,
  showNotifications = false,
  notificationCount = 0,
  rightAction,
  className
}: PageHeaderProps) {
  const navigate = useNavigate();
  const hasBackButton = showBack || backTo;

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn("sticky top-0 z-40 glass-effect border-b border-border", className)}>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {hasBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl"
              onClick={handleBack}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {rightAction}
          {showNotifications && (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
