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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  Trash2, 
  Settings,
  Calendar as CalendarIcon,
  AlertCircle,
  Loader2
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

interface Slot {
  id: string;
  horario_inicio: string;
  horario_fim: string;
  ativo: boolean;
  descricao: string | null;
}

const MAX_TREINAMENTOS_POR_DIA = 3;

export default function GerenciarTreinamentos() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [slotsDialogOpen, setSlotsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  
  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"online" | "presencial">("online");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [vagasTotais, setVagasTotais] = useState("10");
  const [linkOnline, setLinkOnline] = useState("");
  const [endereco, setEndereco] = useState("");
  const [instrutor, setInstrutor] = useState("");

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
        supabase.from("slots_treinamento").select("*").eq("ativo", true).order("horario_inicio")
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

  const getTreinamentosPorData = (data: string) => {
    return treinamentos.filter(t => t.data === data);
  };

  const getSlotsDisponiveis = (data: string) => {
    const treinamentosDoDia = getTreinamentosPorData(data);
    const horariosUsados = treinamentosDoDia.map(t => t.horario_inicio);
    
    return slots.filter(slot => !horariosUsados.includes(slot.horario_inicio));
  };

  const handleCreateTreinamento = async () => {
    if (!titulo || !selectedDate || !selectedSlot) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título, data e horário.",
        variant: "destructive",
      });
      return;
    }

    const dataStr = format(selectedDate, "yyyy-MM-dd");
    const treinamentosDoDia = getTreinamentosPorData(dataStr);

    if (treinamentosDoDia.length >= MAX_TREINAMENTOS_POR_DIA) {
      toast({
        title: "Limite atingido",
        description: `Máximo de ${MAX_TREINAMENTOS_POR_DIA} treinamentos por dia.`,
        variant: "destructive",
      });
      return;
    }

    const slot = slots.find(s => s.id === selectedSlot);
    if (!slot) return;

    try {
      const novoTreinamento = {
        titulo,
        descricao: descricao || null,
        tipo,
        data: dataStr,
        horario_inicio: slot.horario_inicio,
        horario_fim: slot.horario_fim,
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

      resetForm();
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

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setTipo("online");
    setSelectedSlot("");
    setVagasTotais("10");
    setLinkOnline("");
    setEndereco("");
    setInstrutor("");
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
          horario_inicio: novoSlotInicio,
          horario_fim: novoSlotFim,
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

      if (ativo) {
        // Reativar - buscar o slot novamente
        const { data } = await supabase
          .from("slots_treinamento")
          .select("*")
          .eq("id", slotId)
          .single();
        
        if (data) {
          setSlots(prev => [...prev, data as Slot]);
        }
      } else {
        setSlots(prev => prev.filter(s => s.id !== slotId));
      }

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>

          <TabsContent value="calendario" className="space-y-4 mt-4">
            {/* Calendar View */}
            <Card className="shadow-card">
              <CardContent className="p-3">
                <Calendar
                  mode="single"
                  selected={calendarDate}
                  onSelect={(date) => date && setCalendarDate(date)}
                  locale={ptBR}
                  className="w-full"
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
                  {format(calendarDate, "d 'de' MMMM", { locale: ptBR })}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {getTreinamentosPorData(format(calendarDate, "yyyy-MM-dd")).length}/{MAX_TREINAMENTOS_POR_DIA}
                </Badge>
              </div>
              
              {getTreinamentosPorData(format(calendarDate, "yyyy-MM-dd")).map((treinamento) => (
                <TreinamentoCard 
                  key={treinamento.id} 
                  treinamento={treinamento} 
                  onDelete={handleDeleteTreinamento}
                />
              ))}

              {getTreinamentosPorData(format(calendarDate, "yyyy-MM-dd")).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum treinamento neste dia
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lista" className="space-y-4 mt-4">
            {/* Lista de Treinamentos */}
            {Object.entries(treinamentosPorData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([data, lista]) => (
                <div key={data} className="space-y-2">
                  <h3 className="font-medium text-sm flex items-center gap-2 px-1">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {format(new Date(data + "T00:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })}
                    <Badge variant="outline" className="text-xs ml-auto">
                      {lista.length}/{MAX_TREINAMENTOS_POR_DIA}
                    </Badge>
                  </h3>
                  
                  {lista.map((treinamento) => (
                    <TreinamentoCard 
                      key={treinamento.id} 
                      treinamento={treinamento} 
                      onDelete={handleDeleteTreinamento}
                    />
                  ))}
                </div>
              ))}

            {treinamentos.length === 0 && (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum treinamento cadastrado
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
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
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setSelectedSlot("");
                        }
                      }}
                      locale={ptBR}
                      className="w-full"
                      disabled={(date) => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        return datasLotadas.includes(dateStr);
                      }}
                    />
                  </div>
                  {datasLotadas.includes(format(selectedDate, "yyyy-MM-dd")) && (
                    <p className="text-xs text-warning flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Este dia já atingiu o limite de treinamentos
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSlotsDisponiveis(format(selectedDate, "yyyy-MM-dd")).map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.horario_inicio.substring(0, 5)} - {slot.horario_fim.substring(0, 5)}
                          {slot.descricao && ` (${slot.descricao})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getSlotsDisponiveis(format(selectedDate, "yyyy-MM-dd")).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Todos os horários já estão ocupados nesta data
                    </p>
                  )}
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

          <Dialog open={slotsDialogOpen} onOpenChange={setSlotsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Horários</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Configure os horários disponíveis para treinamentos.
                  Máximo de {MAX_TREINAMENTOS_POR_DIA} treinamentos por dia.
                </p>

                {/* Lista de slots */}
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {slot.horario_inicio.substring(0, 5)} - {slot.horario_fim.substring(0, 5)}
                        </p>
                        {slot.descricao && (
                          <p className="text-xs text-muted-foreground">{slot.descricao}</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteSlot(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Adicionar novo slot */}
                <div className="border-t pt-4 space-y-3">
                  <Label>Adicionar novo horário</Label>
                  <div className="grid grid-cols-2 gap-2">
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
                  <Input
                    placeholder="Descrição (opcional)"
                    value={novoSlotDescricao}
                    onChange={(e) => setNovoSlotDescricao(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleAddSlot}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Horário
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MobileLayout>
  );
}

interface TreinamentoCardProps {
  treinamento: Treinamento;
  onDelete: (id: string) => void;
}

function TreinamentoCard({ treinamento, onDelete }: TreinamentoCardProps) {
  return (
    <Card className="shadow-card">
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
                {treinamento.horario_inicio.substring(0, 5)} - {treinamento.horario_fim.substring(0, 5)}
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

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(treinamento.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
