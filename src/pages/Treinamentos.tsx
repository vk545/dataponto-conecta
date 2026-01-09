import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Video, MapPin, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Training {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  type: "online" | "presencial";
  spots: number;
  totalSpots: number;
  confirmed?: boolean;
}

const mockTrainings: Training[] = [
  {
    id: "1",
    title: "Sistema de Ponto Eletrônico",
    date: new Date(2026, 0, 12),
    time: "14:00",
    duration: "2h",
    type: "online",
    spots: 5,
    totalSpots: 20,
    confirmed: true,
  },
  {
    id: "2",
    title: "Controle de Acesso Avançado",
    date: new Date(2026, 0, 15),
    time: "10:00",
    duration: "3h",
    type: "presencial",
    spots: 2,
    totalSpots: 10,
  },
  {
    id: "3",
    title: "Relatórios e Dashboards",
    date: new Date(2026, 0, 20),
    time: "15:00",
    duration: "1h30",
    type: "online",
    spots: 12,
    totalSpots: 30,
  },
];

export default function Treinamentos() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const trainingDates = mockTrainings.map(t => t.date.toDateString());
  
  const selectedTrainings = mockTrainings.filter(
    t => t.date.toDateString() === selectedDate?.toDateString()
  );

  const upcomingTrainings = mockTrainings.filter(
    t => t.date >= new Date() && !selectedTrainings.includes(t)
  ).slice(0, 3);

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
                <TrainingCard key={training.id} training={training} />
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
              <TrainingCard key={training.id} training={training} compact />
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

function TrainingCard({ training, compact = false }: { training: Training; compact?: boolean }) {
  const spotsLeft = training.spots;
  const isAlmostFull = spotsLeft <= 3;

  return (
    <Card className="shadow-card card-interactive">
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {training.confirmed && (
                <Badge variant="outline" className="bg-success-light text-success border-success/20 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Confirmado
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {training.type === "online" ? (
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
            
            <h3 className="font-medium text-sm">{training.title}</h3>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(training.date, "dd/MM")} às {training.time}
              </span>
              <span>•</span>
              <span>{training.duration}</span>
            </div>

            {!compact && (
              <div className="flex items-center gap-1 mt-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className={`text-xs ${isAlmostFull ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                  {spotsLeft} vagas restantes
                </span>
              </div>
            )}
          </div>

          {!training.confirmed && (
            <Button size="sm" className="shrink-0">
              Agendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
