import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Clock, 
  Users, 
  Trash2, 
  Settings,
  Calendar as CalendarIcon,
  Loader2,
  User
} from "lucide-react";
import { format, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Treinamento {
  id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  vagas_totais: number;
  vagas_disponiveis: number;
  ativo: boolean;
}

interface Slot {
  id: string;
  horario_inicio: string;
  horario_fim: string;
  ativo: boolean;
  descricao: string | null;
}

interface Agendamento {
  id: string;
  treinamento_id: string;
  profile_id: string;
  confirmado: boolean;
  presente: boolean | null;
  profile?: {
    nome: string;
    email: string;
    empresa: string | null;
  };
}

const MAX_TREINAMENTOS_POR_DIA = 3;
const DEFAULT_VAGAS = 10;

export default function GerenciarTreinamentos() {
  const { toast } = useToast();
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsDialogOpen, setSlotsDialogOpen] = useState(false);
  const [agendamentosDialogOpen, setAgendamentosDialogOpen] = useState(false);
  const [selectedTreinamento, setSelectedTreinamento] = useState<Treinamento | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  
  // Slots form
  const [novoSlotInicio, setNovoSlotInicio] = useState("09:00");
  const [novoSlotFim, setNovoSlotFim] = useState("11:00");
  const [novoSlotDescricao, setNovoSlotDescricao] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [treinamentosRes, slotsRes] = await Promise.all([
        supabase.from("treinamentos").select("*").order("data", { ascending: true }),
        supabase.from("slots_treinamento").select("*").order("horario_inicio")
      ]);

      if (treinamentosRes.error) throw treinamentosRes.error;
      if (slotsRes.error) throw slotsRes.error;
      
      setTreinamentos((treinamentosRes.data as Treinamento[]) || []);
      setSlots((slotsRes.data as Slot[]) || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgendamentos = async (treinamentoId: string) => {
    try {
      const { data, error } = await supabase
        .from("agendamentos_treinamento")
        .select(`
          id,
          treinamento_id,
          profile_id,
          confirmado,
          presente,
          profiles:profile_id (
            nome,
            email,
            empresa
          )
        `)
        .eq("treinamento_id", treinamentoId);

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        treinamento_id: item.treinamento_id,
        profile_id: item.profile_id,
        confirmado: item.confirmado,
        presente: item.presente,
        profile: item.profiles
      }));
      
      setAgendamentos(transformedData);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const getTreinamentosPorData = (data: string) => {
    return treinamentos.filter(t => t.data === data && t.ativo);
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

  const handleAddSlot = async () => {
    if (!novoSlotInicio || !novoSlotFim) {
      toast({
        title: "Campos obrigatórios",
        description: "Informe o horário de início e fim.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("slots_treinamento")
        .insert({
          horario_inicio: novoSlotInicio + ":00",
          horario_fim: novoSlotFim + ":00",
          descricao: novoSlotDescricao || null,
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;

      setSlots(prev => [...prev, data as Slot]);
      setNovoSlotInicio("09:00");
      setNovoSlotFim("11:00");
      setNovoSlotDescricao("");

      toast({
        title: "Horário adicionado!",
        description: "O novo slot de horário foi criado.",
      });
    } catch (error) {
      console.error("Erro ao adicionar slot:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o horário.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSlot = async (slotId: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from("slots_treinamento")
        .update({ ativo })
        .eq("id", slotId);

      if (error) throw error;

      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, ativo } : s));

      toast({
        title: ativo ? "Horário ativado" : "Horário desativado",
      });
    } catch (error) {
      console.error("Erro ao atualizar slot:", error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from("slots_treinamento")
        .delete()
        .eq("id", slotId);

      if (error) throw error;

      setSlots(prev => prev.filter(s => s.id !== slotId));
      
      toast({
        title: "Horário removido",
      });
    } catch (error) {
      console.error("Erro ao remover slot:", error);
    }
  };

  const handleViewAgendamentos = (treinamento: Treinamento) => {
    setSelectedTreinamento(treinamento);
    fetchAgendamentos(treinamento.id);
    setAgendamentosDialogOpen(true);
  };

  const handleTogglePresenca = async (agendamentoId: string, presente: boolean) => {
    try {
      const { error } = await supabase
        .from("agendamentos_treinamento")
        .update({ presente })
        .eq("id", agendamentoId);

      if (error) throw error;

      setAgendamentos(prev => 
        prev.map(a => a.id === agendamentoId ? { ...a, presente } : a)
      );

      toast({
        title: presente ? "Presença confirmada" : "Presença removida",
      });
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
    }
  };

  const treinamentosPorData = treinamentos.reduce((acc, t) => {
    if (!acc[t.data]) acc[t.data] = [];
    acc[t.data].push(t);
    return acc;
  }, {} as Record<string, Treinamento[]>);

  const trainingDates = Object.keys(treinamentosPorData);

  // Verificar datas com limite atingido
  const datasLotadas = trainingDates.filter(
    data => treinamentosPorData[data].length >= MAX_TREINAMENTOS_POR_DIA
  );

  if (loading) {
    return (
      <MobileLayout showHeader={false} showBottomNav={false}>
        <PageHeader title="Gerenciar Treinamentos" showBack backTo="/coordenador" />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <PageHeader title="Gerenciar Treinamentos" showBack backTo="/coordenador" />

      <div className="p-4 space-y-4">
        <Tabs defaultValue="calendario" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="lista">Agendados</TabsTrigger>
            <TabsTrigger value="config">Horários</TabsTrigger>
          </TabsList>

          <TabsContent value="calendario" className="space-y-4 mt-4">
            {/* Info */}
            <Card className="shadow-card bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Os clientes podem agendar treinamentos em qualquer dia útil. 
                  Aqui você vê os treinamentos que foram agendados.
                </p>
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card className="shadow-card">
              <CardContent className="p-3">
                <Calendar
                  mode="single"
                  selected={calendarDate}
                  onSelect={(date) => date && setCalendarDate(date)}
                  locale={ptBR}
                  className="w-full"
                  disabled={(date) => isWeekend(date)}
                  modifiers={{
                    hasTraining: (date) => trainingDates.includes(format(date, "yyyy-MM-dd")),
                    isFull: (date) => datasLotadas.includes(format(date, "yyyy-MM-dd")),
                  }}
                  modifiersStyles={{
                    hasTraining: { 
                      backgroundColor: 'hsl(var(--primary-light))',
                      color: 'hsl(var(--primary))',
                      fontWeight: 600,
                    },
                    isFull: {
                      backgroundColor: 'hsl(var(--warning-light))',
                      color: 'hsl(var(--warning))',
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Treinamentos do dia selecionado */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">
                  {format(calendarDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                {!isWeekend(calendarDate) && (
                  <Badge variant="outline" className="text-xs">
                    {getTreinamentosPorData(format(calendarDate, "yyyy-MM-dd")).length} agendamento(s)
                  </Badge>
                )}
              </div>

              {isWeekend(calendarDate) ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Não há treinamentos aos fins de semana
                </p>
              ) : (
                <>
                  {getTreinamentosPorData(format(calendarDate, "yyyy-MM-dd")).map((treinamento) => (
                    <TreinamentoCard 
                      key={treinamento.id} 
                      treinamento={treinamento} 
                      onDelete={handleDeleteTreinamento}
                      onViewAgendamentos={() => handleViewAgendamentos(treinamento)}
                    />
                  ))}

                  {getTreinamentosPorData(format(calendarDate, "yyyy-MM-dd")).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum treinamento agendado para este dia
                    </p>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lista" className="space-y-4 mt-4">
            {/* Lista de todos os treinamentos agendados */}
            {Object.entries(treinamentosPorData)
              .filter(([data]) => new Date(data + "T00:00:00") >= new Date())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([data, lista]) => (
                <div key={data} className="space-y-2">
                  <h3 className="font-medium text-sm flex items-center gap-2 px-1">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {format(new Date(data + "T00:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })}
                    <Badge variant="outline" className="text-xs ml-auto">
                      {lista.length} treinamento(s)
                    </Badge>
                  </h3>
                  
                  {lista.map((treinamento) => (
                    <TreinamentoCard 
                      key={treinamento.id} 
                      treinamento={treinamento} 
                      onDelete={handleDeleteTreinamento}
                      onViewAgendamentos={() => handleViewAgendamentos(treinamento)}
                    />
                  ))}
                </div>
              ))}

            {treinamentos.filter(t => new Date(t.data + "T00:00:00") >= new Date()).length === 0 && (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum treinamento agendado pelos clientes
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="config" className="space-y-4 mt-4">
            {/* Configuração de Horários */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Horários Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure os horários em que os clientes podem agendar treinamentos.
                </p>

                {/* Slots existentes */}
                <div className="space-y-2">
                  {slots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <span className="font-medium text-sm">
                            {slot.horario_inicio.substring(0, 5)} - {slot.horario_fim.substring(0, 5)}
                          </span>
                          {slot.descricao && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({slot.descricao})
                            </span>
                          )}
                        </div>
                        <Badge variant={slot.ativo ? "default" : "secondary"} className="text-xs">
                          {slot.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleSlot(slot.id, !slot.ativo)}
                        >
                          {slot.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {slots.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum horário configurado. Adicione horários abaixo.
                    </p>
                  )}
                </div>

                {/* Adicionar novo slot */}
                <div className="border-t pt-4 space-y-3">
                  <Label className="text-sm font-medium">Adicionar Novo Horário</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Início</Label>
                      <Input
                        type="time"
                        value={novoSlotInicio}
                        onChange={(e) => setNovoSlotInicio(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fim</Label>
                      <Input
                        type="time"
                        value={novoSlotFim}
                        onChange={(e) => setNovoSlotFim(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Descrição (opcional)</Label>
                    <Input
                      placeholder="Ex: Manhã, Tarde..."
                      value={novoSlotDescricao}
                      onChange={(e) => setNovoSlotDescricao(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddSlot} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Horário
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Agendamentos */}
      <Dialog open={agendamentosDialogOpen} onOpenChange={setAgendamentosDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Participantes</DialogTitle>
          </DialogHeader>
          
          {selectedTreinamento && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium text-sm">{selectedTreinamento.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedTreinamento.data + "T00:00:00"), "dd/MM/yyyy")} às {selectedTreinamento.horario_inicio.substring(0, 5)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {selectedTreinamento.vagas_totais - selectedTreinamento.vagas_disponiveis} de {selectedTreinamento.vagas_totais} vagas preenchidas
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {agendamentos.length > 0 ? (
                  agendamentos.map(agendamento => (
                    <div key={agendamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{agendamento.profile?.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {agendamento.profile?.empresa || agendamento.profile?.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={agendamento.presente ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTogglePresenca(agendamento.id, !agendamento.presente)}
                      >
                        {agendamento.presente ? "Presente" : "Marcar presença"}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum participante agendado
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

interface TreinamentoCardProps {
  treinamento: Treinamento;
  onDelete: (id: string) => void;
  onViewAgendamentos: () => void;
}

function TreinamentoCard({ treinamento, onDelete, onViewAgendamentos }: TreinamentoCardProps) {
  const vagasPreenchidas = treinamento.vagas_totais - treinamento.vagas_disponiveis;

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{treinamento.titulo}</h4>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {treinamento.horario_inicio.substring(0, 5)} - {treinamento.horario_fim.substring(0, 5)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {vagasPreenchidas}/{treinamento.vagas_totais}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={onViewAgendamentos}>
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(treinamento.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
