import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle2,
  Star,
  Award,
  LogOut,
  Settings,
  Bell,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TecnicoData {
  profile: {
    nome: string;
    email: string;
    telefone: string | null;
    created_at: string | null;
  };
  tecnico: {
    id: string;
    especialidade: string | null;
    regiao: string | null;
    disponivel: boolean | null;
  };
  stats: {
    totalServices: number;
    monthServices: number;
    completedServices: number;
  };
}

export default function TecnicoPerfil() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tecnicoData, setTecnicoData] = useState<TecnicoData | null>(null);

  useEffect(() => {
    if (profile) {
      fetchTecnicoData();
    }
  }, [profile]);

  const fetchTecnicoData = async () => {
    if (!profile) return;

    try {
      // Buscar dados do técnico
      const { data: tecnico, error: tecnicoError } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (tecnicoError) throw tecnicoError;

      // Buscar estatísticas de chamados
      let totalServices = 0;
      let monthServices = 0;
      let completedServices = 0;

      if (tecnico) {
        // Total de chamados
        const { count: total } = await supabase
          .from("chamados_internos")
          .select("*", { count: "exact", head: true })
          .eq("tecnico_id", tecnico.id);

        totalServices = total || 0;

        // Chamados finalizados
        const { count: completed } = await supabase
          .from("chamados_internos")
          .select("*", { count: "exact", head: true })
          .eq("tecnico_id", tecnico.id)
          .eq("status", "finalizado");

        completedServices = completed || 0;

        // Chamados deste mês
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthly } = await supabase
          .from("chamados_internos")
          .select("*", { count: "exact", head: true })
          .eq("tecnico_id", tecnico.id)
          .gte("created_at", startOfMonth.toISOString());

        monthServices = monthly || 0;
      }

      setTecnicoData({
        profile: {
          nome: profile.nome,
          email: profile.email,
          telefone: profile.telefone,
          created_at: profile.created_at,
        },
        tecnico: tecnico || {
          id: "",
          especialidade: null,
          regiao: null,
          disponivel: true,
        },
        stats: {
          totalServices,
          monthServices,
          completedServices,
        },
      });
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const completionRate = tecnicoData?.stats.totalServices 
    ? Math.round((tecnicoData.stats.completedServices / tecnicoData.stats.totalServices) * 100)
    : 0;

  const specializations = tecnicoData?.tecnico.especialidade
    ? tecnicoData.tecnico.especialidade.split(",").map((s) => s.trim())
    : ["Relógios de Ponto", "Catracas", "Controle de Acesso"];

  if (loading) {
    return (
      <MobileLayout showBottomNav={false}>
        <PageHeader title="Meu Perfil" subtitle="Área do Técnico" backTo="/tecnico" />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

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
                  {tecnicoData ? getInitials(tecnicoData.profile.nome) : "??"}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h2 className="font-bold text-xl">{tecnicoData?.profile.nome}</h2>
                <p className="text-white/80 font-mono text-sm">
                  TEC-{tecnicoData?.tecnico.id?.substring(0, 6).toUpperCase() || "000000"}
                </p>
                <Badge className="mt-2 bg-white/20 text-white border-white/30">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {tecnicoData?.tecnico.disponivel ? "Disponível" : "Ocupado"}
                </Badge>
              </div>
            </div>
          </div>
          
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{tecnicoData?.profile.email}</span>
            </div>
            {tecnicoData?.profile.telefone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{tecnicoData.profile.telefone}</span>
              </div>
            )}
            {tecnicoData?.tecnico.regiao && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{tecnicoData.tecnico.regiao}</span>
              </div>
            )}
            {tecnicoData?.profile.created_at && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Na empresa desde{" "}
                  {format(new Date(tecnicoData.profile.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
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
                <p className="text-2xl font-bold text-primary">
                  {tecnicoData?.stats.totalServices || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total de Atendimentos</p>
              </div>
              <div className="bg-success-light rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-success">
                  {tecnicoData?.stats.monthServices || 0}
                </p>
                <p className="text-xs text-muted-foreground">Este Mês</p>
              </div>
              <div className="bg-warning-light rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-warning">
                  {tecnicoData?.stats.completedServices || 0}
                </p>
                <p className="text-xs text-muted-foreground">Finalizados</p>
              </div>
              <div className="bg-info-light rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-info">{completionRate}%</p>
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
              {specializations.map((spec) => (
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
