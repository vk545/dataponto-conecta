import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { 
  ClipboardList, 
  MapPin, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Navigation,
  User,
  Phone,
  Building2,
  ChevronRight,
  Wrench,
  MessageCircle,
  Route,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Chamado {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  prioridade: string | null;
  data_agendada: string | null;
  horario_agendado: string | null;
  endereco: string | null;
  created_at: string;
}

const statusConfig = {
  aberto: {
    label: "Pendente",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  em_andamento: {
    label: "Em Andamento",
    icon: Wrench,
    className: "bg-warning-light text-warning border-warning/20",
  },
  finalizado: {
    label: "Finalizado",
    icon: CheckCircle2,
    className: "bg-success-light text-success border-success/20",
  },
};

const priorityConfig = {
  baixa: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", className: "bg-info-light text-info" },
  alta: { label: "Alta", className: "bg-warning-light text-warning" },
  urgente: { label: "Urgente", className: "bg-destructive-light text-destructive" },
};

export default function TecnicoDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [tecnicoId, setTecnicoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchTecnicoId();
    }
  }, [profile]);

  useEffect(() => {
    if (tecnicoId) {
      fetchChamados();
      subscribeToChanges();
    }
  }, [tecnicoId]);

  const fetchTecnicoId = async () => {
    try {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("id")
        .eq("profile_id", profile?.id)
        .single();

      if (error) {
        console.log("Técnico não encontrado, pode ser novo cadastro");
        setLoading(false);
        return;
      }

      setTecnicoId(data.id);
    } catch (error) {
      console.error("Erro ao buscar técnico:", error);
      setLoading(false);
    }
  };

  const fetchChamados = async () => {
    if (!tecnicoId) return;

    try {
      const { data, error } = await supabase
        .from("chamados_internos")
        .select("*")
        .eq("tecnico_id", tecnicoId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setChamados(data || []);
    } catch (error) {
      console.error("Erro ao buscar chamados:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel("chamados-tecnico")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chamados_internos",
          filter: `tecnico_id=eq.${tecnicoId}`,
        },
        () => {
          fetchChamados();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const stats = {
    total: chamados.length,
    pending: chamados.filter(o => o.status === "aberto").length,
    inProgress: chamados.filter(o => o.status === "em_andamento").length,
    completed: chamados.filter(o => o.status === "finalizado").length,
  };

  const currentOrder = chamados.find(o => o.status === "em_andamento");
  const nextOrders = chamados.filter(o => o.status === "aberto");
  const completedOrders = chamados.filter(o => o.status === "finalizado");

  if (loading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Área Técnica</p>
            <h1 className="text-xl font-bold">{profile?.nome || "Técnico"}</h1>
            <p className="text-xs opacity-70">Técnico de Campo</p>
          </div>
          <Link to="/tecnico/perfil">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Link to="/tecnico/rotas" className="flex-1">
            <Button variant="secondary" className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white border-0">
              <Route className="h-4 w-4" />
              Rotas
            </Button>
          </Link>
          <Link to="/tecnico/chat" className="flex-1">
            <Button variant="secondary" className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white border-0">
              <MessageCircle className="h-4 w-4" />
              Chat Valdemar
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-xs opacity-80">Total</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{stats.pending}</p>
            <p className="text-xs opacity-80">Pendente</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{stats.inProgress}</p>
            <p className="text-xs opacity-80">Em Andamento</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{stats.completed}</p>
            <p className="text-xs opacity-80">Finalizado</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {chamados.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Nenhum chamado atribuído</p>
              <p className="text-xs text-muted-foreground mt-1">
                Aguarde o coordenador atribuir chamados para você.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Current Order */}
            {currentOrder && (
              <Card className="border-primary border-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Atendimento Atual
                    </CardTitle>
                    <Badge className={priorityConfig[currentOrder.prioridade as keyof typeof priorityConfig]?.className || priorityConfig.normal.className}>
                      {priorityConfig[currentOrder.prioridade as keyof typeof priorityConfig]?.label || "Normal"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{currentOrder.titulo}</span>
                    <Badge className={statusConfig.em_andamento.className}>
                      {statusConfig.em_andamento.label}
                    </Badge>
                  </div>
                  
                  {currentOrder.descricao && (
                    <p className="text-xs text-muted-foreground">{currentOrder.descricao}</p>
                  )}

                  {currentOrder.endereco && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-xs text-muted-foreground">{currentOrder.endereco}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/tecnico/ordem/${currentOrder.id}`} className="flex-1">
                      <Button className="w-full gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Abrir Checklist
                      </Button>
                    </Link>
                    {currentOrder.endereco && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          const address = encodeURIComponent(currentOrder.endereco || "");
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                        }}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Orders */}
            {nextOrders.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Próximos Atendimentos
                </h2>
                
                <div className="space-y-3">
                  {nextOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Today */}
            {completedOrders.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Finalizados
                </h2>
                
                <div className="space-y-3">
                  {completedOrders.slice(0, 3).map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}

function OrderCard({ order }: { order: Chamado }) {
  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.aberto;
  const StatusIcon = config.icon;
  const priorityConf = priorityConfig[order.prioridade as keyof typeof priorityConfig] || priorityConfig.normal;

  return (
    <Link to={`/tecnico/ordem/${order.id}`}>
      <Card className="card-interactive">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={config.className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              <Badge className={priorityConf.className + " text-xs"}>
                {priorityConf.label}
              </Badge>
            </div>
            {order.horario_agendado && (
              <span className="text-xs text-muted-foreground">{order.horario_agendado}</span>
            )}
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm">{order.titulo}</p>
              {order.descricao && (
                <p className="text-xs text-muted-foreground line-clamp-1">{order.descricao}</p>
              )}
              {order.endereco && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{order.endereco}</span>
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
