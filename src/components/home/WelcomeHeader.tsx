import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
interface WelcomeHeaderProps {
  userName: string;
  companyName: string;
  notificationCount?: number;
}
export function WelcomeHeader({
  userName,
  companyName,
  notificationCount = 0
}: WelcomeHeaderProps) {
  return <div className="px-4 pt-6 pb-8 rounded-b-3xl bg-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary-foreground/80 text-sm">Olá,</p>
          <h1 className="text-xl font-bold text-primary-foreground">{userName}</h1>
          <p className="text-primary-foreground/70 text-sm mt-1">{companyName}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-pulse-soft">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>}
        </Button>
      </div>
    </div>;
}