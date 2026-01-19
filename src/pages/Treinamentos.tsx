import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Video, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Training {
  id: string;
  titulo: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  tipo: "online" | "presencial";
  vagas_disponiveis: number;
  vagas_totais: number;
  endereco: string | null;
  link_online: string | null;
  descricao: string | null;
  instrutor: string | null;
}

interface Agendamento {
  treinamento_id: string;
  confirmado: boolean;
}

export default function Treinamentos() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchTrainings();
    if (profile) {
      fetchAgendamentos();
    }
  }, [profile]);

  const fetchTrainings = async () => {
    try {
      const { data, error } = await supabase
        .from("treinamentos")
        .select("*")
        .eq("ativo", true)
        .gte("data", format(new Date(), "yyyy-MM-dd"))
        .order("data", { ascending: true });

      if (error) throw error;
      setTrainings(data || []);
    } catch (error) {
      console.error("Erro ao buscar treinamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgendamentos = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from("agendamentos_treinamento")
        .select("treinamento_id, confirmado")
        .eq("profile_id", profile.id);

      if (error) throw error;
      setAgendamentos(data || []);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const handleAgendar = async (treinamentoId: string) => {
    if (!profile) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para agendar.",
        variant: "destructive",
      });
      return;
    }

    setBooking(treinamentoId);
    try {
      const { error } = await supabase
        .from("agendamentos_treinamento")
        .insert({
          treinamento_id: treinamentoId,
          profile_id: profile.id,
          confirmado: true,
        });

      if (error) throw error;

      toast({
        title: "Agendado com sucesso!",
        description: "Você receberá os detalhes por email.",
      });

      // Atualizar lista local
      setAgendamentos((prev) => [...prev, { treinamento_id: treinamentoId, confirmado: true }]);
      
      // Atualizar vagas disponíveis
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === treinamentoId
            ? { ...t, vagas_disponiveis: t.vagas_disponiveis - 1 }
            : t
        )
      );
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

  const trainingDates = trainings.map((t) => new Date(t.data + "T00:00:00").toDateString());
  
  const selectedTrainings = trainings.filter(
    (t) => new Date(t.data + "T00:00:00").toDateString() === selectedDate?.toDateString()
  );

  const upcomingTrainings = trainings
    .filter(
      (t) =>
        new Date(t.data + "T00:00:00") >= new Date() &&
        !selectedTrainings.includes(t)
    )
    .slice(0, 3);

  const isAgendado = (treinamentoId: string) => {
    return agendamentos.some((a) => a.treinamento_id === treinamentoId);
  };

  if (loading) {
    return (
      <MobileLayout>
        <PageHeader title="Treinamentos" subtitle="Agende e gerencie seus treinamentos" />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <PageHeader title="Treinamentos" subtitle="Agende e gerencie seus treinamentos" />

      <div className="p-4 space-y-6">
        {/* Calendar */}
        <Card className="shadow-card">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="w-full"
              modifiers={{
                hasTraining: (date) => trainingDates.includes(date.toDateString()),
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

        {/* Selected Date Trainings */}
        {selectedDate && (
          <div className="space-y-3">
            <h2 className="font-medium text-sm px-1">
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </h2>
            
            {selectedTrainings.length > 0 ? (
              selectedTrainings.map((training) => (
                <TrainingCard 
                  key={training.id} 
                  training={training} 
                  confirmed={isAgendado(training.id)}
                  onAgendar={handleAgendar}
                  booking={booking === training.id}
                />
              ))
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum treinamento nesta data
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Upcoming Trainings */}
        {upcomingTrainings.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-medium text-sm px-1">Próximos Treinamentos</h2>
            {upcomingTrainings.map((training) => (
              <TrainingCard 
                key={training.id} 
                training={training} 
                compact 
                confirmed={isAgendado(training.id)}
                onAgendar={handleAgendar}
                booking={booking === training.id}
              />
            ))}
          </div>
        )}

        {trainings.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum treinamento disponível no momento
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}

interface TrainingCardProps {
  training: Training;
  compact?: boolean;
  confirmed?: boolean;
  onAgendar: (id: string) => void;
  booking?: boolean;
}

function TrainingCard({ training, compact = false, confirmed, onAgendar, booking }: TrainingCardProps) {
  const spotsLeft = training.vagas_disponiveis;
  const isAlmostFull = spotsLeft <= 3;
  const isFull = spotsLeft <= 0;

  return (
    <Card className="shadow-card card-interactive">
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {confirmed && (
                <Badge variant="outline" className="bg-success-light text-success border-success/20 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Confirmado
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {training.tipo === "online" ? (
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
            
            <h3 className="font-medium text-sm">{training.titulo}</h3>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(training.data + "T00:00:00"), "dd/MM")} às {training.horario_inicio.substring(0, 5)}
              </span>
              <span>•</span>
              <span>{training.horario_inicio.substring(0, 5)} - {training.horario_fim.substring(0, 5)}</span>
            </div>

            {!compact && (
              <div className="flex items-center gap-1 mt-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className={`text-xs ${isAlmostFull ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                  {isFull ? "Sem vagas" : `${spotsLeft} vagas restantes`}
                </span>
              </div>
            )}
          </div>

          {!confirmed && !isFull && (
            <Button 
              size="sm" 
              className="shrink-0"
              onClick={() => onAgendar(training.id)}
              disabled={booking}
            >
              {booking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Agendar"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
