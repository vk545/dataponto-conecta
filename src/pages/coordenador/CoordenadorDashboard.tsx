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
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tecnico {
  id: string;
  profile: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
  };
  especialidade: string | null;
  regiao: string | null;
  disponivel: boolean;
  chamadosHoje: number;
  chamadosFinalizados: number;
}

export default function CoordenadorDashboard() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - will be replaced with real data
  const mockTecnicos: Tecnico[] = [
    {
      id: "1",
      profile: { id: "p1", nome: "Carlos Silva", email: "carlos@email.com", telefone: "11 99999-1111" },
      especialidade: "Ponto Eletrônico",
      regiao: "Zona Sul",
      disponivel: true,
      chamadosHoje: 5,
      chamadosFinalizados: 3,
    },
    {
      id: "2",
      profile: { id: "p2", nome: "André Santos", email: "andre@email.com", telefone: "11 99999-2222" },
      especialidade: "Controle de Acesso",
      regiao: "Zona Norte",
      disponivel: true,
      chamadosHoje: 4,
      chamadosFinalizados: 2,
    },
    {
      id: "3",
      profile: { id: "p3", nome: "Roberto Lima", email: "roberto@email.com", telefone: "11 99999-3333" },
      especialidade: "Catraca",
      regiao: "Centro",
      disponivel: false,
      chamadosHoje: 3,
      chamadosFinalizados: 3,
    },
    {
      id: "4",
      profile: { id: "p4", nome: "Fernando Costa", email: "fernando@email.com", telefone: "11 99999-4444" },
      especialidade: "Biometria",
      regiao: "Zona Leste",
      disponivel: true,
      chamadosHoje: 6,
      chamadosFinalizados: 4,
    },
    {
      id: "5",
      profile: { id: "p5", nome: "Paulo Oliveira", email: "paulo@email.com", telefone: "11 99999-5555" },
      especialidade: "Ponto Eletrônico",
      regiao: "Zona Oeste",
      disponivel: true,
      chamadosHoje: 4,
      chamadosFinalizados: 1,
    },
    {
      id: "6",
      profile: { id: "p6", nome: "Marcos Pereira", email: "marcos@email.com", telefone: "11 99999-6666" },
      especialidade: "Controle de Acesso",
      regiao: "ABC",
      disponivel: true,
      chamadosHoje: 5,
      chamadosFinalizados: 2,
    },
  ];

  useEffect(() => {
    // For now, use mock data
    setTecnicos(mockTecnicos);
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const totalChamadosHoje = tecnicos.reduce((acc, t) => acc + t.chamadosHoje, 0);
  const totalFinalizados = tecnicos.reduce((acc, t) => acc + t.chamadosFinalizados, 0);
  const tecnicosAtivos = tecnicos.filter(t => t.disponivel).length;

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <div className="flex flex-col min-h-screen">
        <PageHeader 
          title={`Olá, ${profile?.nome?.split(" ")[0] || "Valdemar"}`} 
          subtitle="Painel do Coordenador"
        />

        <div className="flex-1 p-4 space-y-4 pb-20">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="shadow-card">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-primary">{tecnicos.length}</p>
                <p className="text-xs text-muted-foreground">Técnicos</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-warning">{totalChamadosHoje}</p>
                <p className="text-xs text-muted-foreground">Chamados Hoje</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-success">{totalFinalizados}</p>
                <p className="text-xs text-muted-foreground">Finalizados</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="tecnicos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tecnicos">
                <Users className="h-4 w-4 mr-1" />
                Técnicos
              </TabsTrigger>
              <TabsTrigger value="chamados">
                <ClipboardList className="h-4 w-4 mr-1" />
                Chamados
              </TabsTrigger>
              <TabsTrigger value="treinamentos">
                <Calendar className="h-4 w-4 mr-1" />
                Treinamentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tecnicos" className="space-y-3 mt-4">
              {tecnicos.map((tecnico) => (
                <Card key={tecnico.id} className="shadow-card card-interactive">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {tecnico.profile.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{tecnico.profile.nome}</h3>
                          <Badge 
                            variant="outline" 
                            className={tecnico.disponivel 
                              ? "bg-success-light text-success border-success/20" 
                              : "bg-muted text-muted-foreground"
                            }
                          >
                            {tecnico.disponivel ? "Ativo" : "Ocupado"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{tecnico.regiao}</span>
                          <span>•</span>
                          <span>{tecnico.especialidade}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs">
                            <span className="font-medium text-warning">{tecnico.chamadosHoje - tecnico.chamadosFinalizados}</span> pendentes
                          </span>
                          <span className="text-xs">
                            <span className="font-medium text-success">{tecnico.chamadosFinalizados}</span> finalizados
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8"
                          onClick={() => navigate(`/coordenador/chat/${tecnico.profile.id}`)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8"
                          onClick={() => window.open(`tel:${tecnico.profile.telefone}`, "_self")}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="chamados" className="space-y-3 mt-4">
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Visualização de todos os chamados será integrada com seu CRM
                  </p>
                </CardContent>
              </Card>
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
