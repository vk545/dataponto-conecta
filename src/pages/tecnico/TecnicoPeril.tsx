import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle2,
  Clock,
  Star,
  Award,
  LogOut,
  Settings,
  Bell
} from "lucide-react";

const technicianData = {
  name: "João Silva",
  id: "TEC-001",
  email: "joao.silva@dataponto.com.br",
  phone: "(11) 98852-0276",
  region: "São Paulo - Capital",
  startDate: "15/03/2022",
  specializations: ["Relógios de Ponto", "Catracas", "Controle de Acesso"],
  stats: {
    totalServices: 1247,
    monthServices: 45,
    avgRating: 4.9,
    completionRate: 98.5,
  },
};

export default function TecnicoPerfil() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("dataponto_auth");
    navigate("/login");
  };

  return (
    <MobileLayout showBottomNav={false}>
      <PageHeader 
        title="Meu Perfil" 
        subtitle="Área do Técnico"
        backTo="/tecnico"
      />

      <div className="p-4 space-y-4 pb-8">
        {/* Profile Card */}
        <Card className="shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarFallback className="bg-white text-primary text-xl font-bold">
                  JS
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h2 className="font-bold text-xl">{technicianData.name}</h2>
                <p className="text-white/80 font-mono">{technicianData.id}</p>
                <Badge className="mt-2 bg-white/20 text-white border-white/30">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  Técnico Sênior
                </Badge>
              </div>
            </div>
          </div>
          
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{technicianData.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{technicianData.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{technicianData.region}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Na empresa desde {technicianData.startDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-light rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary">{technicianData.stats.totalServices}</p>
                <p className="text-xs text-muted-foreground">Total de Atendimentos</p>
              </div>
              <div className="bg-success-light rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-success">{technicianData.stats.monthServices}</p>
                <p className="text-xs text-muted-foreground">Este Mês</p>
              </div>
              <div className="bg-warning-light rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 text-warning fill-warning" />
                  <p className="text-2xl font-bold text-warning">{technicianData.stats.avgRating}</p>
                </div>
                <p className="text-xs text-muted-foreground">Avaliação Média</p>
              </div>
              <div className="bg-info-light rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-info">{technicianData.stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Especializações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {technicianData.specializations.map((spec) => (
                <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {spec}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <button className="flex items-center gap-3 p-4 w-full hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-primary-light">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1 text-sm font-medium text-left">Notificações</span>
              <Badge variant="secondary">3</Badge>
            </button>
            <Separator />
            <button className="flex items-center gap-3 p-4 w-full hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-primary-light">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1 text-sm font-medium text-left">Configurações</span>
            </button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive-light"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair da Conta
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          DATAPONTO Técnico v1.0.0
        </p>
      </div>
    </MobileLayout>
  );
}
