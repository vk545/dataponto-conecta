import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  User,
  Phone,
  Building2,
  Route,
  Play,
  ChevronRight
} from "lucide-react";

interface RouteStop {
  id: string;
  order: number;
  ticketNumber: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  scheduledTime: string;
  estimatedArrival: string;
  status: "pending" | "in_route" | "arrived" | "completed";
  technicianName: string;
  reason: string;
}

const mockRouteStops: RouteStop[] = [
  {
    id: "1",
    order: 1,
    ticketNumber: "CH-2025-001",
    clientName: "Empresa ABC Ltda",
    clientAddress: "Rua das Flores, 123 - Centro, São Paulo/SP",
    clientPhone: "(11) 99999-1234",
    scheduledTime: "08:00",
    estimatedArrival: "08:00",
    status: "completed",
    technicianName: "João Silva",
    reason: "Equipamento não liga",
  },
  {
    id: "2",
    order: 2,
    ticketNumber: "CH-2025-002",
    clientName: "Indústria XYZ S.A.",
    clientAddress: "Av. Industrial, 456 - Distrito Industrial, São Paulo/SP",
    clientPhone: "(11) 99888-5678",
    scheduledTime: "10:30",
    estimatedArrival: "10:45",
    status: "in_route",
    technicianName: "João Silva",
    reason: "Não está imprimindo",
  },
  {
    id: "3",
    order: 3,
    ticketNumber: "CH-2025-003",
    clientName: "Comércio Delta",
    clientAddress: "Rua do Comércio, 789 - Vila Nova, São Paulo/SP",
    clientPhone: "(11) 97777-9012",
    scheduledTime: "14:00",
    estimatedArrival: "14:15",
    status: "pending",
    technicianName: "João Silva",
    reason: "Leitor biométrico com falha",
  },
  {
    id: "4",
    order: 4,
    ticketNumber: "CH-2025-004",
    clientName: "Hotel Premium",
    clientAddress: "Av. Paulista, 1000 - Bela Vista, São Paulo/SP",
    clientPhone: "(11) 96666-3456",
    scheduledTime: "16:30",
    estimatedArrival: "16:45",
    status: "pending",
    technicianName: "João Silva",
    reason: "Catraca travada",
  },
];

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
    lineColor: "bg-muted-foreground/30",
  },
  in_route: {
    label: "Em Rota",
    icon: Navigation,
    className: "bg-info-light text-info border-info/20",
    lineColor: "bg-info",
  },
  arrived: {
    label: "No Local",
    icon: MapPin,
    className: "bg-warning-light text-warning border-warning/20",
    lineColor: "bg-warning",
  },
  completed: {
    label: "Finalizado",
    icon: CheckCircle2,
    className: "bg-success-light text-success border-success/20",
    lineColor: "bg-success",
  },
};

export default function TecnicoRotas() {
  const completedStops = mockRouteStops.filter(s => s.status === "completed").length;
  const totalStops = mockRouteStops.length;

  return (
    <MobileLayout showBottomNav={false}>
      <PageHeader 
        title="Rota do Dia" 
        subtitle={`${completedStops} de ${totalStops} atendimentos`}
        backTo="/tecnico"
      />

      <div className="p-4">
        {/* Route Progress */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                <span className="font-medium">Progresso da Rota</span>
              </div>
              <span className="text-sm font-medium text-primary">
                {Math.round((completedStops / totalStops) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${(completedStops / totalStops) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{completedStops} finalizados</span>
              <span>{totalStops - completedStops} restantes</span>
            </div>
          </CardContent>
        </Card>

        {/* Technician Info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">João Silva</p>
            <p className="text-xs text-muted-foreground">TEC-001</p>
          </div>
        </div>

        {/* Route Timeline */}
        <div className="space-y-0">
          {mockRouteStops.map((stop, index) => {
            const config = statusConfig[stop.status];
            const StatusIcon = config.icon;
            const isLast = index === mockRouteStops.length - 1;

            return (
              <div key={stop.id} className="relative flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stop.status === "completed" ? "bg-success text-white" :
                    stop.status === "in_route" ? "bg-info text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {stop.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{stop.order}</span>
                    )}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-24 ${config.lineColor}`} />
                  )}
                </div>

                {/* Stop Card */}
                <div className="flex-1 pb-4">
                  <Card className={`${stop.status === "in_route" ? "border-info border-2" : ""}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className={config.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Previsão</p>
                          <p className="text-sm font-medium">{stop.estimatedArrival}</p>
                        </div>
                      </div>

                      <p className="font-mono text-xs text-muted-foreground mb-1">
                        {stop.ticketNumber}
                      </p>
                      <p className="font-medium text-sm">{stop.clientName}</p>
                      <p className="text-xs text-destructive font-medium mb-2">{stop.reason}</p>

                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <p className="text-xs text-muted-foreground flex-1">{stop.clientAddress}</p>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a href={`tel:${stop.clientPhone}`} className="text-xs text-primary">
                          {stop.clientPhone}
                        </a>
                      </div>

                      <div className="flex gap-2">
                        {stop.status === "pending" && (
                          <Button size="sm" variant="outline" className="flex-1 gap-1">
                            <Play className="h-3 w-3" />
                            Iniciar Rota
                          </Button>
                        )}
                        {stop.status === "in_route" && (
                          <>
                            <Button size="sm" className="flex-1 gap-1">
                              <MapPin className="h-3 w-3" />
                              Cheguei
                            </Button>
                            <Button size="sm" variant="outline">
                              <Navigation className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {stop.status === "completed" && (
                          <Link to={`/tecnico/ordem/${stop.id}`} className="flex-1">
                            <Button size="sm" variant="ghost" className="w-full gap-1">
                              Ver Detalhes
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
