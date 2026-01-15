import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  ClipboardList,
  MapPin,
  Phone,
  ChevronRight,
  Plus,
  LogOut,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tecnico {
  id: string;
  profile_id: string;
  nome: string;
  email: string;
  telefone: string | null;
  especialidade: string | null;
  regiao: string | null;
  disponivel: boolean;
}

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
  tecnico_id: string | null;
  cliente_id: string;
  tecnico_nome?: string;
  cliente_nome?: string;
}

const statusConfig = {
  aberto: { label: "Aberto", className: "bg-warning-light text-warning border-warning/20", icon: AlertCircle },
  em_andamento: { label: "Em Andamento", className: "bg-info-light text-info border-info/20", icon: Clock },
  finalizado: { label: "Finalizado", className: "bg-success-light text-success border-success/20", icon: CheckCircle2 },
};

const prioridadeConfig = {
  baixa: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", className: "bg-info-light text-info" },
  alta: { label: "Alta", className: "bg-warning-light text-warning" },
  urgente: { label: "Urgente", className: "bg-destructive-light text-destructive" },
};

export default function CoordenadorDashboard() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTecnicos();
    fetchChamados();
  }, []);

  const fetchTecnicos = async () => {
    try {
      const { data, error } = await supabase
        .from("tecnicos")
        .select(`
          id,
          profile_id,
          especialidade,
          regiao,
          disponivel,
          profiles:profile_id (
            nome,
            email,
            telefone
          )
        `);

      if (error) throw error;

      const formattedTecnicos: Tecnico[] = (data || []).map((t: any) => ({
        id: t.id,
        profile_id: t.profile_id,
        nome: t.profiles?.nome || "Técnico",
        email: t.profiles?.email || "",
        telefone: t.profiles?.telefone || null,
        especialidade: t.especialidade,
        regiao: t.regiao,
        disponivel: t.disponivel,
      }));

      setTecnicos(formattedTecnicos);
    } catch (error) {
      console.error("Erro ao buscar técnicos:", error);
    }
  };

  const fetchChamados = async () => {
    try {
      const { data, error } = await supabase
        .from("chamados_internos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setChamados(data || []);
    } catch (error) {
      console.error("Erro ao buscar chamados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const chamadosHoje = chamados.filter(c => {
    const today = new Date().toISOString().split("T")[0];
    return c.created_at?.startsWith(today);
  }).length;

  const chamadosAbertos = chamados.filter(c => c.status === "aberto").length;
  const chamadosEmAndamento = chamados.filter(c => c.status === "em_andamento").length;
  const chamadosFinalizados = chamados.filter(c => c.status === "finalizado").length;

  if (loading) {
    return (
      <MobileLayout showHeader={false} showBottomNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <div className="flex flex-col min-h-screen">
        <PageHeader 
          title={`Olá, ${profile?.nome?.split(" ")[0] || "Valdemar"}`} 
          subtitle="Painel do Coordenador"
        />

        <div className="flex-1 p-4 space-y-4 pb-20">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2">
            <Card className="shadow-card">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">{tecnicos.length}</p>
                <p className="text-[10px] text-muted-foreground">Técnicos</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-warning">{chamadosAbertos}</p>
                <p className="text-[10px] text-muted-foreground">Abertos</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-info">{chamadosEmAndamento}</p>
                <p className="text-[10px] text-muted-foreground">Em Andamento</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-success">{chamadosFinalizados}</p>
                <p className="text-[10px] text-muted-foreground">Finalizados</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="chamados" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chamados">
                <ClipboardList className="h-4 w-4 mr-1" />
                Chamados
              </TabsTrigger>
              <TabsTrigger value="tecnicos">
                <Users className="h-4 w-4 mr-1" />
                Técnicos
              </TabsTrigger>
              <TabsTrigger value="treinamentos">
                <Calendar className="h-4 w-4 mr-1" />
                Treinamentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chamados" className="space-y-3 mt-4">
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  onClick={() => navigate("/coordenador/chamados/novo")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Chamado
                </Button>
              </div>

              {chamados.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="p-6 text-center">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum chamado cadastrado ainda
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate("/coordenador/chamados/novo")}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Criar Primeiro Chamado
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                chamados.map((chamado) => {
                  const statusConf = statusConfig[chamado.status as keyof typeof statusConfig] || statusConfig.aberto;
                  const prioridadeConf = prioridadeConfig[chamado.prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.normal;
                  const StatusIcon = statusConf.icon;
                  const tecnicoAtribuido = tecnicos.find(t => t.id === chamado.tecnico_id);

                  return (
                    <Card 
                      key={chamado.id} 
                      className="shadow-card card-interactive"
                      onClick={() => navigate(`/coordenador/chamados/${chamado.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={statusConf.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConf.label}
                            </Badge>
                            <Badge className={prioridadeConf.className}>
                              {prioridadeConf.label}
                            </Badge>
                          </div>
                          {chamado.horario_agendado && (
                            <span className="text-xs text-muted-foreground">
                              {chamado.horario_agendado}
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-sm mb-1">{chamado.titulo}</h3>
                        {chamado.descricao && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {chamado.descricao}
                          </p>
                        )}

                        {chamado.endereco && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{chamado.endereco}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">
                              {tecnicoAtribuido ? tecnicoAtribuido.nome : "Não atribuído"}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="tecnicos" className="space-y-3 mt-4">
              {tecnicos.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum técnico cadastrado ainda.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Os técnicos aparecem aqui quando se cadastram como "Técnico" no app.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                tecnicos.map((tecnico) => (
                  <Card key={tecnico.id} className="shadow-card card-interactive">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {tecnico.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate">{tecnico.nome}</h3>
                            <Badge 
                              variant="outline" 
                              className={tecnico.disponivel 
                                ? "bg-success-light text-success border-success/20" 
                                : "bg-muted text-muted-foreground"
                              }
                            >
                              {tecnico.disponivel ? "Disponível" : "Ocupado"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {tecnico.regiao && (
                              <>
                                <MapPin className="h-3 w-3" />
                                <span>{tecnico.regiao}</span>
                              </>
                            )}
                            {tecnico.especialidade && (
                              <>
                                <span>•</span>
                                <span>{tecnico.especialidade}</span>
                              </>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">{tecnico.email}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/coordenador/chat/${tecnico.profile_id}`);
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          {tecnico.telefone && (
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${tecnico.telefone}`, "_self");
                              }}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="treinamentos" className="space-y-3 mt-4">
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  onClick={() => navigate("/coordenador/treinamentos")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Gerenciar
                </Button>
              </div>
              <Card className="shadow-card card-interactive" onClick={() => navigate("/coordenador/treinamentos")}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Gerenciar Treinamentos</h3>
                      <p className="text-xs text-muted-foreground">Criar datas e horários disponíveis</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
          <Button 
            variant="outline" 
            className="w-full text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
