import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Clock, 
  Users, 
  Trash2, 
  Settings,
  Calendar as CalendarIcon,
  Loader2,
  User,
  Building2,
  Phone,
  Mail,
  Bell,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, isWeekend, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  vagas_padrao: number;
}

interface Agendamento {
  id: string;
  treinamento_id: string;
  profile_id: string;
  confirmado: boolean;
  presente: boolean | null;
  created_at: string;
  profile?: {
    nome: string;
    email: string;
    empresa: string | null;
    cnpj: string | null;
    telefone: string | null;
  };
}

const MAX_TREINAMENTOS_POR_DIA = 3;
const DEFAULT_VAGAS = 10;

export default function GerenciarTreinamentos() {
  const { toast } = useToast();
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [allAgendamentos, setAllAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingAgenda, setOpeningAgenda] = useState(false);
  const [agendamentosDialogOpen, setAgendamentosDialogOpen] = useState(false);
  const [selectedTreinamento, setSelectedTreinamento] = useState<Treinamento | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mesAgenda, setMesAgenda] = useState(() => format(new Date(), "yyyy-MM"));
  const [recentAgendamentos, setRecentAgendamentos] = useState<Agendamento[]>([]);
  
  // Slots form
  const [novoSlotInicio, setNovoSlotInicio] = useState("09:00");
  const [novoSlotFim, setNovoSlotFim] = useState("11:00");
  const [novoSlotDescricao, setNovoSlotDescricao] = useState("");
  const [novoSlotVagas, setNovoSlotVagas] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [treinamentosRes, slotsRes, agendamentosRes] = await Promise.all([
        supabase.from("treinamentos").select("*").order("data", { ascending: true }),
        supabase.from("slots_treinamento").select("*").order("horario_inicio"),
        supabase.from("agendamentos_treinamento").select(`
          id,
          treinamento_id,
          profile_id,
          confirmado,
          presente,
          created_at,
          profiles:profile_id (
            nome,
            email,
            empresa,
            cnpj,
            telefone
          )
        `).order("created_at", { ascending: false })
      ]);

      if (treinamentosRes.error) throw treinamentosRes.error;
      if (slotsRes.error) throw slotsRes.error;
      
      const transformedAgendamentos = (agendamentosRes.data || []).map((item: any) => ({
        id: item.id,
        treinamento_id: item.treinamento_id,
        profile_id: item.profile_id,
        confirmado: item.confirmado,
        presente: item.presente,
        created_at: item.created_at,
        profile: item.profiles
      }));
      
      setTreinamentos((treinamentosRes.data as Treinamento[]) || []);
      setSlots((slotsRes.data as Slot[]) || []);
      setAllAgendamentos(transformedAgendamentos);
      
      // Agendamentos recentes (últimas 24h)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      setRecentAgendamentos(
        transformedAgendamentos.filter(a => new Date(a.created_at) > oneDayAgo)
      );
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription for new bookings
  useEffect(() => {
    const channel = supabase
      .channel("agendamentos-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agendamentos_treinamento"
        },
        async (payload) => {
          // Fetch profile data for the new booking
          const { data: profileData } = await supabase
            .from("profiles")
            .select("nome, email, empresa, cnpj, telefone")
            .eq("id", payload.new.profile_id)
            .single();
          
          const newAgendamento: Agendamento = {
            id: payload.new.id,
            treinamento_id: payload.new.treinamento_id,
            profile_id: payload.new.profile_id,
            confirmado: payload.new.confirmado,
            presente: payload.new.presente,
            created_at: payload.new.created_at,
            profile: profileData || undefined
          };
          
          setAllAgendamentos(prev => [newAgendamento, ...prev]);
          setRecentAgendamentos(prev => [newAgendamento, ...prev]);
          
          // Update treinamento vagas
          setTreinamentos(prev => prev.map(t => 
            t.id === payload.new.treinamento_id 
              ? { ...t, vagas_disponiveis: Math.max(0, t.vagas_disponiveis - 1) }
              : t
          ));
          
          // Show notification toast
          const treinamento = treinamentos.find(t => t.id === payload.new.treinamento_id);
          toast({
            title: "🔔 Novo agendamento!",
            description: `${profileData?.empresa || profileData?.nome || "Cliente"} agendou para ${treinamento?.data ? format(new Date(treinamento.data), "dd/MM") : ""} às ${treinamento?.horario_inicio?.substring(0, 5) || ""}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [treinamentos, toast]);

  const getTreinamentosPorData = (data: string) => {
    return treinamentos.filter(t => t.data === data);
  };

  const getAgendamentosPorTreinamento = (treinamentoId: string) => {
    return allAgendamentos.filter(a => a.treinamento_id === treinamentoId);
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
          vagas_padrao: novoSlotVagas,
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;

      setSlots(prev => [...prev, data as Slot]);
      setNovoSlotInicio("09:00");
      setNovoSlotFim("11:00");
      setNovoSlotDescricao("");
      setNovoSlotVagas(10);

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

  const handleAbrirAgendaDoMes = async () => {
    const activeSlots = slots.filter((s) => s.ativo);
    if (activeSlots.length === 0) {
      toast({
        title: "Nenhum horário ativo",
        description: "Ative ou adicione ao menos 1 horário para abrir a agenda.",
        variant: "destructive",
      });
      return;
    }

    if (activeSlots.length > MAX_TREINAMENTOS_POR_DIA) {
      toast({
        title: "Muitos horários ativos",
        description: `Você tem ${activeSlots.length} horários ativos, mas o máximo por dia é ${MAX_TREINAMENTOS_POR_DIA}. Desative alguns horários para continuar.`,
        variant: "destructive",
      });
      return;
    }

    const [yearStr, monthStr] = mesAgenda.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;

    if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      toast({
        title: "Mês inválido",
        description: "Selecione um mês válido para abrir a agenda.",
        variant: "destructive",
      });
      return;
    }

    setOpeningAgenda(true);
    try {
      const existingKeys = new Set(treinamentos.map((t) => `${t.data}-${t.horario_inicio}`));
      const countByDay = treinamentos.reduce((acc, t) => {
        acc[t.data] = (acc[t.data] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const days: string[] = [];
      let d = new Date(year, monthIndex, 1);
      while (d.getMonth() === monthIndex) {
        if (!isWeekend(d)) {
          days.push(format(d, "yyyy-MM-dd"));
        }
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      }

      const inserts: Array<{
        titulo: string;
        descricao: string | null;
        data: string;
        horario_inicio: string;
        horario_fim: string;
        vagas_totais: number;
        vagas_disponiveis: number;
        ativo: boolean;
      }> = [];

      let skippedDuplicates = 0;
      let skippedLimit = 0;

      for (const dateStr of days) {
        const currentCount = countByDay[dateStr] || 0;
        let remaining = MAX_TREINAMENTOS_POR_DIA - currentCount;

        for (const slot of activeSlots) {
          if (remaining <= 0) {
            skippedLimit++;
            continue;
          }

          const key = `${dateStr}-${slot.horario_inicio}`;
          if (existingKeys.has(key)) {
            skippedDuplicates++;
            continue;
          }

          const vagas = slot.vagas_padrao || DEFAULT_VAGAS;
          inserts.push({
            titulo: `Treinamento ${slot.descricao || slot.horario_inicio.substring(0, 5)}`,
            descricao: null,
            data: dateStr,
            horario_inicio: slot.horario_inicio,
            horario_fim: slot.horario_fim,
            vagas_totais: vagas,
            vagas_disponiveis: vagas,
            ativo: true,
          });

          existingKeys.add(key);
          countByDay[dateStr] = (countByDay[dateStr] || 0) + 1;
          remaining--;
        }
      }

      if (inserts.length === 0) {
        toast({
          title: "Nada para criar",
          description: "A agenda desse mês já está aberta (ou não há dias úteis/horários válidos).",
        });
        return;
      }

      const { data, error } = await supabase
        .from("treinamentos")
        .insert(inserts)
        .select("*");

      if (error) throw error;

      setTreinamentos((prev) => [...prev, ...((data as Treinamento[]) || [])]);

      toast({
        title: "Agenda aberta!",
        description: `${inserts.length} treinamento(s) criado(s) para ${mesAgenda}.` +
          (skippedDuplicates || skippedLimit
            ? ` (Ignorados: ${skippedDuplicates} duplicado(s), ${skippedLimit} por limite diário.)`
            : ""),
      });
    } catch (error) {
      console.error("Erro ao abrir agenda do mês:", error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir a agenda do mês.",
        variant: "destructive",
      });
    } finally {
      setOpeningAgenda(false);
    }
  };

  const handleViewAgendamentos = (treinamento: Treinamento) => {
    setSelectedTreinamento(treinamento);
    setAgendamentosDialogOpen(true);
  };

  const handleTogglePresenca = async (agendamentoId: string, presente: boolean) => {
    try {
      const { error } = await supabase
        .from("agendamentos_treinamento")
        .update({ presente })
        .eq("id", agendamentoId);

      if (error) throw error;

      setAllAgendamentos(prev => 
        prev.map(a => a.id === agendamentoId ? { ...a, presente } : a)
      );

      toast({
        title: presente ? "Presença confirmada" : "Presença removida",
      });
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
    }
  };

  // Calendar helpers
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const treinamentosPorData = treinamentos.reduce((acc, t) => {
    if (!acc[t.data]) acc[t.data] = [];
    acc[t.data].push(t);
    return acc;
  }, {} as Record<string, Treinamento[]>);

  const trainingDates = Object.keys(treinamentosPorData);
  
  // Selected day trainings
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDayTrainings = getTreinamentosPorData(selectedDateStr);

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
        {/* Notificações recentes */}
        {recentAgendamentos.length > 0 && (
          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Agendamentos recentes</span>
                <Badge variant="secondary" className="text-xs ml-auto">
                  {recentAgendamentos.length} novo(s)
                </Badge>
              </div>
              <div className="space-y-2">
                {recentAgendamentos.slice(0, 3).map(agendamento => {
                  const treinamento = treinamentos.find(t => t.id === agendamento.treinamento_id);
                  return (
                    <div key={agendamento.id} className="flex items-center gap-2 text-xs">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="font-medium truncate">
                        {agendamento.profile?.empresa || agendamento.profile?.nome}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-muted-foreground truncate">
                        {treinamento && `${format(new Date(treinamento.data), "dd/MM")} ${treinamento.horario_inicio.substring(0, 5)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="calendario" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="lista">Agendados</TabsTrigger>
            <TabsTrigger value="config">Horários</TabsTrigger>
          </TabsList>

          <TabsContent value="calendario" className="space-y-4 mt-4">
            {/* Visual Calendar with side panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Calendar */}
              <Card className="shadow-card">
                <CardContent className="p-4">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium">
                      {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                      <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before first day of month */}
                    {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-10" />
                    ))}
                    
                    {daysInMonth.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const dayTrainings = getTreinamentosPorData(dateStr);
                      const hasTrainings = dayTrainings.length > 0;
                      const totalBookings = dayTrainings.reduce((sum, t) => 
                        sum + (t.vagas_totais - t.vagas_disponiveis), 0
                      );
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrentDay = isToday(day);
                      const isWeekendDay = isWeekend(day);
                      
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(day)}
                          disabled={isWeekendDay}
                          className={cn(
                            "h-10 rounded-lg flex flex-col items-center justify-center relative transition-colors",
                            isWeekendDay && "opacity-30 cursor-not-allowed",
                            isSelected && "bg-primary text-primary-foreground",
                            !isSelected && isCurrentDay && "ring-1 ring-primary",
                            !isSelected && hasTrainings && "bg-primary/10",
                            !isSelected && !hasTrainings && !isWeekendDay && "hover:bg-muted"
                          )}
                        >
                          <span className="text-sm">{format(day, "d")}</span>
                          {hasTrainings && (
                            <span className={cn(
                              "text-[10px] leading-none",
                              isSelected ? "text-primary-foreground/80" : "text-primary"
                            )}>
                              {totalBookings > 0 ? `${totalBookings}` : "•"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded bg-primary/10" />
                      <span>Com agenda</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded bg-primary" />
                      <span>Selecionado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Side panel - Selected day details */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isWeekend(selectedDate) ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Não há treinamentos aos fins de semana
                    </p>
                  ) : selectedDayTrainings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum treinamento neste dia
                    </p>
                  ) : (
                    <ScrollArea className="h-[300px] pr-2">
                      <div className="space-y-3">
                        {selectedDayTrainings.map((treinamento) => {
                          const bookings = getAgendamentosPorTreinamento(treinamento.id);
                          return (
                            <div key={treinamento.id} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-sm">
                                    {treinamento.horario_inicio.substring(0, 5)} - {treinamento.horario_fim.substring(0, 5)}
                                  </span>
                                </div>
                                <Badge variant={bookings.length > 0 ? "default" : "secondary"} className="text-xs">
                                  {bookings.length}/{treinamento.vagas_totais}
                                </Badge>
                              </div>
                              
                              {/* Clientes agendados */}
                              {bookings.length > 0 ? (
                                <div className="space-y-1 pl-6">
                                  {bookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center gap-2 text-xs py-1 border-l-2 border-primary/20 pl-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                          {booking.profile?.empresa || booking.profile?.nome}
                                        </p>
                                        {booking.profile?.empresa && booking.profile?.nome && (
                                          <p className="text-muted-foreground truncate">
                                            {booking.profile.nome}
                                          </p>
                                        )}
                                      </div>
                                      <Badge 
                                        variant={booking.presente ? "default" : "outline"} 
                                        className="text-[10px] flex-shrink-0"
                                      >
                                        {booking.presente ? "✓" : "—"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground pl-6">
                                  Nenhum cliente agendado
                                </p>
                              )}
                              
                              <div className="flex items-center gap-1 pt-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs h-7"
                                  onClick={() => handleViewAgendamentos(treinamento)}
                                >
                                  <Users className="h-3 w-3 mr-1" />
                                  Gerenciar
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs h-7"
                                  onClick={() => handleDeleteTreinamento(treinamento.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
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
                      {lista.reduce((sum, t) => sum + (t.vagas_totais - t.vagas_disponiveis), 0)} agendado(s)
                    </Badge>
                  </h3>
                  
                  {lista.map((treinamento) => {
                    const bookings = getAgendamentosPorTreinamento(treinamento.id);
                    return (
                      <Card key={treinamento.id} className="shadow-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">
                                {treinamento.horario_inicio.substring(0, 5)} - {treinamento.horario_fim.substring(0, 5)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleViewAgendamentos(treinamento)}>
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTreinamento(treinamento.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Lista de clientes inline */}
                          {bookings.length > 0 ? (
                            <div className="space-y-1">
                              {bookings.map((booking) => (
                                <div key={booking.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                                  <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="font-medium truncate flex-1">
                                    {booking.profile?.empresa || booking.profile?.nome}
                                  </span>
                                  {booking.profile?.telefone && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {booking.profile.telefone}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Nenhum cliente agendado ainda
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ))}

            {treinamentos.filter(t => new Date(t.data + "T00:00:00") >= new Date()).length === 0 && (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum treinamento agendado
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

                {/* Abrir agenda do mês */}
                <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Abrir agenda do mês</p>
                    <p className="text-xs text-muted-foreground">
                      Isso cria automaticamente os treinamentos (dias úteis) para os horários ativos.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Mês</Label>
                      <Input
                        type="month"
                        value={mesAgenda}
                        onChange={(e) => setMesAgenda(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        className="w-full"
                        onClick={handleAbrirAgendaDoMes}
                        disabled={openingAgenda}
                      >
                        {openingAgenda ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Abrindo...
                          </>
                        ) : (
                          "Abrir agenda"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

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
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {slot.vagas_padrao} vagas
                        </Badge>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Descrição (opcional)</Label>
                      <Input
                        placeholder="Ex: Manhã, Tarde..."
                        value={novoSlotDescricao}
                        onChange={(e) => setNovoSlotDescricao(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Vagas</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={novoSlotVagas}
                        onChange={(e) => setNovoSlotVagas(parseInt(e.target.value) || 10)}
                      />
                    </div>
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
                {getAgendamentosPorTreinamento(selectedTreinamento.id).length > 0 ? (
                  getAgendamentosPorTreinamento(selectedTreinamento.id).map(agendamento => (
                    <div key={agendamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {agendamento.profile?.empresa || agendamento.profile?.nome || "Sem nome"}
                          </p>
                          {agendamento.profile?.cnpj && (
                            <p className="text-xs text-muted-foreground">
                              CNPJ: {agendamento.profile.cnpj}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {agendamento.profile?.nome && (
                              <span>{agendamento.profile.nome}</span>
                            )}
                            {agendamento.profile?.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {agendamento.profile.telefone}
                              </span>
                            )}
                          </div>
                          {agendamento.profile?.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {agendamento.profile.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant={agendamento.presente ? "default" : "outline"}
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => handleTogglePresenca(agendamento.id, !agendamento.presente)}
                      >
                        {agendamento.presente ? "Presente" : "Marcar"}
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
