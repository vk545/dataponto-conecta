import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  Trash2, 
  Edit,
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Treinamento {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: "online" | "presencial";
  data: string;
  horario_inicio: string;
  horario_fim: string;
  vagas_totais: number;
  vagas_disponiveis: number;
  link_online: string | null;
  endereco: string | null;
  instrutor: string | null;
  ativo: boolean;
}

export default function GerenciarTreinamentos() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"online" | "presencial">("online");
  const [horarioInicio, setHorarioInicio] = useState("09:00");
  const [horarioFim, setHorarioFim] = useState("10:00");
  const [vagasTotais, setVagasTotais] = useState("10");
  const [linkOnline, setLinkOnline] = useState("");
  const [endereco, setEndereco] = useState("");
  const [instrutor, setInstrutor] = useState("");

  useEffect(() => {
    fetchTreinamentos();
  }, []);

  const fetchTreinamentos = async () => {
    try {
      const { data, error } = await supabase
        .from("treinamentos")
        .select("*")
        .order("data", { ascending: true });

      if (error) throw error;
      
      setTreinamentos((data as Treinamento[]) || []);
    } catch (error) {
      console.error("Erro ao buscar treinamentos:", error);
      // Use mock data for now
      setTreinamentos([
        {
          id: "1",
          titulo: "Sistema de Ponto Eletrônico",
          descricao: "Treinamento completo sobre o sistema de ponto",
          tipo: "online",
          data: "2026-01-20",
          horario_inicio: "14:00",
          horario_fim: "16:00",
          vagas_totais: 20,
          vagas_disponiveis: 15,
          link_online: "https://meet.google.com/abc-defg-hij",
          endereco: null,
          instrutor: "Carlos Silva",
          ativo: true,
        },
        {
          id: "2",
          titulo: "Controle de Acesso Avançado",
          descricao: "Configuração avançada de controle de acesso",
          tipo: "presencial",
          data: "2026-01-22",
          horario_inicio: "10:00",
          horario_fim: "12:00",
          vagas_totais: 10,
          vagas_disponiveis: 5,
          link_online: null,
          endereco: "Rua das Empresas, 123 - São Paulo",
          instrutor: "André Santos",
          ativo: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTreinamento = async () => {
    if (!titulo || !selectedDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o título e a data.",
        variant: "destructive",
      });
      return;
    }

    try {
      const novoTreinamento = {
        titulo,
        descricao: descricao || null,
        tipo,
        data: format(selectedDate, "yyyy-MM-dd"),
        horario_inicio: horarioInicio,
        horario_fim: horarioFim,
        vagas_totais: parseInt(vagasTotais),
        vagas_disponiveis: parseInt(vagasTotais),
        link_online: tipo === "online" ? linkOnline : null,
        endereco: tipo === "presencial" ? endereco : null,
        instrutor: instrutor || null,
        ativo: true,
        created_by: profile?.id,
      };

      const { data, error } = await supabase
        .from("treinamentos")
        .insert(novoTreinamento)
        .select()
        .single();

      if (error) throw error;

      setTreinamentos(prev => [...prev, data as Treinamento]);
      
      toast({
        title: "Treinamento criado!",
        description: "O treinamento foi adicionado com sucesso.",
      });

      // Reset form
      setTitulo("");
      setDescricao("");
      setTipo("online");
      setHorarioInicio("09:00");
      setHorarioFim("10:00");
      setVagasTotais("10");
      setLinkOnline("");
      setEndereco("");
      setInstrutor("");
      setDialogOpen(false);
      
    } catch (error) {
      console.error("Erro ao criar treinamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o treinamento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTreinamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from("treinamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTreinamentos(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Treinamento excluído",
        description: "O treinamento foi removido.",
      });
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o treinamento.",
        variant: "destructive",
      });
    }
  };

  const treinamentosPorData = treinamentos.reduce((acc, t) => {
    if (!acc[t.data]) acc[t.data] = [];
    acc[t.data].push(t);
    return acc;
  }, {} as Record<string, Treinamento[]>);

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <PageHeader title="Gerenciar Treinamentos" showBack backTo="/coordenador" />

      <div className="p-4 space-y-4">
        {/* Add Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Treinamento
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Treinamento</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Ex: Sistema de Ponto Eletrônico"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descrição do treinamento..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data *</Label>
                <div className="border rounded-lg p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={ptBR}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input
                    type="time"
                    value={horarioInicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input
                    type="time"
                    value={horarioFim}
                    onChange={(e) => setHorarioFim(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vagas</Label>
                <Input
                  type="number"
                  value={vagasTotais}
                  onChange={(e) => setVagasTotais(e.target.value)}
                  min="1"
                />
              </div>

              {tipo === "online" && (
                <div className="space-y-2">
                  <Label>Link da reunião</Label>
                  <Input
                    placeholder="https://meet.google.com/..."
                    value={linkOnline}
                    onChange={(e) => setLinkOnline(e.target.value)}
                  />
                </div>
              )}

              {tipo === "presencial" && (
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    placeholder="Rua, número, cidade"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Instrutor</Label>
                <Input
                  placeholder="Nome do instrutor"
                  value={instrutor}
                  onChange={(e) => setInstrutor(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleCreateTreinamento}>
                Criar Treinamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lista de Treinamentos */}
        <div className="space-y-4">
          {Object.entries(treinamentosPorData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([data, lista]) => (
              <div key={data} className="space-y-2">
                <h3 className="font-medium text-sm flex items-center gap-2 px-1">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  {format(new Date(data + "T00:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                
                {lista.map((treinamento) => (
                  <Card key={treinamento.id} className="shadow-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {treinamento.tipo === "online" ? (
                                <>
                                  <Video className="h-3 w-3 mr-1" />
                                  Online
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Presencial
                                </>
                              )}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium text-sm">{treinamento.titulo}</h4>
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {treinamento.horario_inicio} - {treinamento.horario_fim}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {treinamento.vagas_disponiveis}/{treinamento.vagas_totais} vagas
                            </span>
                          </div>
                          
                          {treinamento.instrutor && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Instrutor: {treinamento.instrutor}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTreinamento(treinamento.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}

          {treinamentos.length === 0 && !loading && (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum treinamento cadastrado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em "Novo Treinamento" para começar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
