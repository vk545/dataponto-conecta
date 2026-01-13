import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { 
  User,
  Building2,
  FileCheck,
  Package,
  Bell,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  LogOut,
  Settings
} from "lucide-react";

const menuItems = [
  {
    icon: Building2,
    label: "Dados da Empresa",
    href: "/perfil/empresa",
  },
  {
    icon: FileCheck,
    label: "Contrato Ativo",
    href: "/perfil/contrato",
  },
  {
    icon: Package,
    label: "Meus Equipamentos",
    href: "/equipamentos",
  },
  {
    icon: Bell,
    label: "Notificações",
    href: "/perfil/notificacoes",
  },
  {
    icon: Settings,
    label: "Configurações",
    href: "/perfil/configuracoes",
  },
];

const supportItems = [
  {
    icon: HelpCircle,
    label: "Central de Ajuda",
    href: "/ajuda",
  },
  {
    icon: MessageCircle,
    label: "Falar com Suporte",
    action: () => {
      window.open("https://wa.me/5511988520276?text=Olá! Preciso de suporte.", "_blank");
    },
  },
];

export default function Perfil() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("dataponto_auth");
    navigate("/login");
  };

  return (
    <MobileLayout>
      <PageHeader title="Perfil" />

      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-primary-light text-primary text-lg font-semibold">
                  CS
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Carlos Silva</h2>
                <p className="text-sm text-muted-foreground">carlos@empresaabc.com.br</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Empresa ABC Ltda
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <Link key={item.label} to={item.href}>
                <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary-light">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                {index < menuItems.length - 1 && <Separator />}
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Support Items */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            {supportItems.map((item, index) => {
              const content = (
                <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-accent-light">
                    <item.icon className="h-4 w-4 text-accent" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              );

              if (item.action) {
                return (
                  <div key={item.label}>
                    <div onClick={item.action}>
                      {content}
                    </div>
                    {index < supportItems.length - 1 && <Separator />}
                  </div>
                );
              }

              return (
                <div key={item.label}>
                  <Link to={item.href!}>{content}</Link>
                  {index < supportItems.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive-light"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair da Conta
        </Button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground">
          DATAPONTO App v1.0.0
        </p>
      </div>
    </MobileLayout>
  );
}
