import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  FileText, 
  Wrench, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/treinamentos", icon: Calendar, label: "Treinamentos" },
  { path: "/financeiro", icon: FileText, label: "Financeiro" },
  { path: "/chamados", icon: Wrench, label: "Chamados" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-border shadow-float z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                isActive 
                  ? "text-primary bg-primary-light" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
