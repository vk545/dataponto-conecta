import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CheckCircle2, Loader2 } from "lucide-react";
import { format, addDays, isWeekend, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Slot {
  id: string;
  horario_inicio: string;
  horario_fim: string;
  descricao: string | null;
  vagas_padrao: number;
}

interface Treinamento {
  id: string;
  titulo: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  vagas_disponiveis: number;
  vagas_totais: number;
  descricao: string | null;
}

interface Agendamento {
  treinamento_id: string;
  confirmado: boolean;
}

// Slots padrão caso não tenha no banco
const DEFAULT_SLOTS: Omit<Slot, "id">[] = [
  { horario_inicio: "09:00:00", horario_fim: "11:00:00", descricao: "Manhã", vagas_padrao: 10 },
  { horario_inicio: "14:00:00", horario_fim: "16:00:00", descricao: "Tarde", vagas_padrao: 10 },
];

const DEFAULT_VAGAS = 10;

export default function Treinamentos() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      // Buscar slots configurados
      const { data: slotsData } = await supabase
        .from("slots_treinamento")
        .select("*")
        .eq("ativo", true)
        .order("horario_inicio");

      // Buscar treinamentos existentes
      const { data: treinamentosData } = await supabase
        .from("treinamentos")
        .select("*")
        .eq("ativo", true)
        .gte("data", format(new Date(), "yyyy-MM-dd"))
        .order("data", { ascending: true });

      // Buscar agendamentos do usuário
      if (profile) {
        const { data: agendamentosData } = await supabase
          .from("agendamentos_treinamento")
          .select("treinamento_id, confirmado")
          .eq("profile_id", profile.id);

        setAgendamentos(agendamentosData || []);
      }

      setSlots(slotsData || []);
      setTreinamentos(treinamentosData || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gera slots virtuais para uma data (dias úteis apenas)
  const getSlotsParaData = (date: Date) => {
    if (isWeekend(date)) return [];
    
    const dateStr = format(date, "yyyy-MM-dd");
    const activeSlots = slots.length > 0 ? slots : DEFAULT_SLOTS.map((s, i) => ({ ...s, id: `default-${i}` }));
    
    return activeSlots.map(slot => {
      // Verifica se já existe um treinamento para este slot nesta data
      const treinamentoExistente = treinamentos.find(
        t => t.data === dateStr && t.horario_inicio === slot.horario_inicio
      );

      const vagasPadrao = slot.vagas_padrao || DEFAULT_VAGAS;

      return {
        ...slot,
        dateStr,
        treinamento: treinamentoExistente,
        vagasDisponiveis: treinamentoExistente?.vagas_disponiveis ?? vagasPadrao,
        vagasTotais: treinamentoExistente?.vagas_totais ?? vagasPadrao,
      };
    });
  };

  const handleAgendar = async (slot: ReturnType<typeof getSlotsParaData>[0]) => {
    if (!profile) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para agendar.",
        variant: "destructive",
      });
      return;
    }

    if (slot.vagasDisponiveis <= 0) {
      toast({
        title: "Sem vagas",
        description: "Este horário já está lotado.",
        variant: "destructive",
      });
      return;
    }

    const bookingKey = `${slot.dateStr}-${slot.horario_inicio}`;
    setBooking(bookingKey);

    try {
      const treinamentoId = slot.treinamento?.id;

      // Clients can only book existing trainings created by coordinators
      if (!treinamentoId) {
        toast({
          title: "Horário não disponível",
          description: "Este horário ainda não está aberto para agendamento. Por favor, escolha outro horário com vagas disponíveis.",
          variant: "destructive",
        });
        setBooking(null);
        return;
      }

      // The decrement_vagas trigger will handle slot updates automatically
      // when we insert into agendamentos_treinamento

      // Cria o agendamento
      const { error: agendamentoError } = await supabase
        .from("agendamentos_treinamento")
        .insert({
          treinamento_id: treinamentoId,
          profile_id: profile.id,
          confirmado: true,
        });

      if (agendamentoError) throw agendamentoError;

      // Update local state to reflect the booking
      setTreinamentos(prev =>
        prev.map(t =>
          t.id === treinamentoId
            ? { ...t, vagas_disponiveis: t.vagas_disponiveis - 1 }
            : t
        )
      );
      setAgendamentos(prev => [...prev, { treinamento_id: treinamentoId!, confirmado: true }]);

      toast({
        title: "Agendado com sucesso!",
        description: `Treinamento em ${format(new Date(slot.dateStr), "dd/MM")} às ${slot.horario_inicio.substring(0, 5)}`,
      });

    } catch (error: any) {
      console.error("Erro ao agendar:", error);
      toast({
        title: "Erro ao agendar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setBooking(null);
    }
  };

  const isAgendado = (treinamentoId: string | undefined) => {
    if (!treinamentoId) return false;
    return agendamentos.some(a => a.treinamento_id === treinamentoId);
  };

  // Datas que têm treinamentos
  const trainingDates = [...new Set(treinamentos.map(t => t.data))];

  // Slots para a data selecionada
  const selectedSlots = selectedDate ? getSlotsParaData(selectedDate) : [];

  // Próximos 5 dias úteis com slots disponíveis
  const proximosDiasUteis = [];
  let checkDate = addDays(new Date(), 1);
  while (proximosDiasUteis.length < 5) {
    if (!isWeekend(checkDate)) {
      proximosDiasUteis.push(new Date(checkDate));
    }
    checkDate = addDays(checkDate, 1);
  }

  if (loading) {
    return (
      <MobileLayout>
        <PageHeader title="Treinamentos" subtitle="Agende seu treinamento" />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <PageHeader title="Treinamentos" subtitle="Agende seu treinamento" />

      <div className="p-4 space-y-6">
        {/* Info */}
        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Escolha um dia útil (segunda a sexta) e um horário disponível para agendar seu treinamento. 
              As vagas são limitadas - primeiro a agendar, garante a vaga!
            </p>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="shadow-card">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="w-full"
              disabled={(date) => isWeekend(date) || startOfDay(date) < startOfDay(new Date())}
              modifiers={{
                hasTraining: (date) => trainingDates.includes(format(date, "yyyy-MM-dd")),
              }}
              modifiersStyles={{
                hasTraining: { 
                  backgroundColor: 'hsl(var(--primary-light))',
                  color: 'hsl(var(--primary))',
                  fontWeight: 600,
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Slots da data selecionada */}
        {selectedDate && !isWeekend(selectedDate) && (
          <div className="space-y-3">
            <h2 className="font-medium text-sm px-1">
              Horários em {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </h2>
            
            {selectedSlots.length > 0 ? (
              selectedSlots.map((slot) => (
                <SlotCard
                  key={`${slot.dateStr}-${slot.horario_inicio}`}
                  slot={slot}
                  confirmed={isAgendado(slot.treinamento?.id)}
                  onAgendar={() => handleAgendar(slot)}
                  booking={booking === `${slot.dateStr}-${slot.horario_inicio}`}
                />
              ))
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum horário disponível neste dia
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {selectedDate && isWeekend(selectedDate) && (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não há treinamentos aos fins de semana
              </p>
            </CardContent>
          </Card>
        )}

        {/* Meus agendamentos */}
        {agendamentos.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-medium text-sm px-1">Meus Agendamentos</h2>
            {treinamentos
              .filter(t => agendamentos.some(a => a.treinamento_id === t.id))
              .map(training => (
                <Card key={training.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-success-light text-success border-success/20 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Confirmado
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm">{training.titulo}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(training.data + "T00:00:00"), "dd/MM/yyyy")}
                      </span>
                      <span>•</span>
                      <span>{training.horario_inicio.substring(0, 5)} - {training.horario_fim.substring(0, 5)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

interface SlotCardProps {
  slot: {
    horario_inicio: string;
    horario_fim: string;
    descricao: string | null;
    vagasDisponiveis: number;
    vagasTotais: number;
    treinamento?: Treinamento;
  };
  confirmed: boolean;
  onAgendar: () => void;
  booking: boolean;
}

function SlotCard({ slot, confirmed, onAgendar, booking }: SlotCardProps) {
  const spotsLeft = slot.vagasDisponiveis;
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0;
  const isFull = spotsLeft <= 0;

  return (
    <Card className="shadow-card card-interactive">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                {slot.horario_inicio.substring(0, 5)} - {slot.horario_fim.substring(0, 5)}
              </span>
              {slot.descricao && (
                <Badge variant="outline" className="text-xs">
                  {slot.descricao}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className={`text-xs ${isFull ? 'text-destructive font-medium' : isAlmostFull ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                {isFull ? "Sem vagas" : `${spotsLeft} de ${slot.vagasTotais} vagas`}
              </span>
            </div>

            {confirmed && (
              <Badge variant="outline" className="bg-success-light text-success border-success/20 text-xs mt-2">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Você está agendado
              </Badge>
            )}
          </div>

          {!confirmed && !isFull && (
            <Button 
              size="sm" 
              onClick={onAgendar}
              disabled={booking}
            >
              {booking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Agendar"
              )}
            </Button>
          )}

          {isFull && !confirmed && (
            <Badge variant="secondary" className="text-xs">
              Lotado
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
