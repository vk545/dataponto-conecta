import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ClipboardList, 
  MapPin, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Navigation,
  User,
  Phone,
  Building2,
  ChevronRight,
  Wrench,
  MessageCircle,
  Route
} from "lucide-react";

interface ServiceOrder {
  id: string;
  ticketNumber: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  reason: string;
  equipment: string;
  status: "pending" | "in_route" | "in_progress" | "completed";
  scheduledTime: string;
  priority: "low" | "medium" | "high";
}

const mockOrders: ServiceOrder[] = [
  {
    id: "1",
    ticketNumber: "CH-2025-001",
    clientName: "Empresa ABC Ltda",
    clientAddress: "Rua das Flores, 123 - Centro, São Paulo/SP",
    clientPhone: "(11) 99999-1234",
    reason: "Equipamento não liga",
    equipment: "Relógio de Ponto - iDFace Max",
    status: "in_progress",
    scheduledTime: "08:00",
    priority: "high",
  },
  {
    id: "2",
    ticketNumber: "CH-2025-002",
    clientName: "Indústria XYZ S.A.",
    clientAddress: "Av. Industrial, 456 - Distrito Industrial, São Paulo/SP",
    clientPhone: "(11) 99888-5678",
    reason: "Não está imprimindo",
    equipment: "Relógio de Ponto - Rep Plus",
    status: "pending",
    scheduledTime: "10:30",
    priority: "medium",
  },
  {
    id: "3",
    ticketNumber: "CH-2025-003",
    clientName: "Comércio Delta",
    clientAddress: "Rua do Comércio, 789 - Vila Nova, São Paulo/SP",
    clientPhone: "(11) 97777-9012",
    reason: "Leitor biométrico com falha",
    equipment: "Controlador Biométrico - iDAccess",
    status: "pending",
    scheduledTime: "14:00",
    priority: "low",
  },
  {
    id: "4",
    ticketNumber: "CH-2025-004",
    clientName: "Hotel Premium",
    clientAddress: "Av. Paulista, 1000 - Bela Vista, São Paulo/SP",
    clientPhone: "(11) 96666-3456",
    reason: "Catraca travada",
    equipment: "Catraca de Acesso - iDBlock",
    status: "completed",
    scheduledTime: "16:30",
    priority: "medium",
  },
];

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  in_route: {
    label: "Em Rota",
    icon: Navigation,
    className: "bg-info-light text-info border-info/20",
  },
  in_progress: {
    label: "Em Andamento",
    icon: Wrench,
    className: "bg-warning-light text-warning border-warning/20",
  },
  completed: {
    label: "Finalizado",
    icon: CheckCircle2,
    className: "bg-success-light text-success border-success/20",
  },
};

const priorityConfig = {
  low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  medium: { label: "Média", className: "bg-warning-light text-warning" },
  high: { label: "Alta", className: "bg-destructive-light text-destructive" },
};

export default function TecnicoDashboard() {
  const technician = {
    name: "João Silva",
    id: "TEC-001",
  };

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === "pending").length,
    inProgress: mockOrders.filter(o => o.status === "in_progress").length,
    completed: mockOrders.filter(o => o.status === "completed").length,
  };

  const currentOrder = mockOrders.find(o => o.status === "in_progress");
  const nextOrders = mockOrders.filter(o => o.status === "pending" || o.status === "in_route");

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Área Técnica</p>
            <h1 className="text-xl font-bold">{technician.name}</h1>
            <p className="text-xs opacity-70">{technician.id}</p>
          </div>
          <Link to="/tecnico/perfil">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Link to="/tecnico/rotas" className="flex-1">
            <Button variant="secondary" className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white border-0">
              <Route className="h-4 w-4" />
              Rotas
            </Button>
          </Link>
          <Link to="/tecnico/chat" className="flex-1">
            <Button variant="secondary" className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white border-0">
              <MessageCircle className="h-4 w-4" />
              Chat Valdemar
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-xs opacity-80">Total</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{stats.pending}</p>
            <p className="text-xs opacity-80">Pendente</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{stats.inProgress}</p>
            <p className="text-xs opacity-80">Em Andamento</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{stats.completed}</p>
            <p className="text-xs opacity-80">Finalizado</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Order */}
        {currentOrder && (
          <Card className="border-primary border-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Atendimento Atual
                </CardTitle>
                <Badge className={priorityConfig[currentOrder.priority].className}>
                  {priorityConfig[currentOrder.priority].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium">{currentOrder.ticketNumber}</span>
                <Badge className={statusConfig[currentOrder.status].className}>
                  {statusConfig[currentOrder.status].label}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{currentOrder.clientName}</p>
                    <p className="text-xs text-muted-foreground">{currentOrder.equipment}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">{currentOrder.clientAddress}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{currentOrder.clientPhone}</p>
                </div>
              </div>

              <div className="p-2 bg-destructive-light rounded-lg">
                <p className="text-xs font-medium text-destructive">Motivo: {currentOrder.reason}</p>
              </div>

              <div className="flex gap-2">
                <Link to={`/tecnico/ordem/${currentOrder.id}`} className="flex-1">
                  <Button className="w-full gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Abrir Checklist
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const address = encodeURIComponent(currentOrder.clientAddress);
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                  }}
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Orders */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Próximos Atendimentos
          </h2>
          
          <div className="space-y-3">
            {nextOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Completed Today */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Finalizados Hoje
          </h2>
          
          <div className="space-y-3">
            {mockOrders.filter(o => o.status === "completed").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

function OrderCard({ order }: { order: ServiceOrder }) {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const priorityConf = priorityConfig[order.priority];

  return (
    <Link to={`/tecnico/ordem/${order.id}`}>
      <Card className="card-interactive">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={config.className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              <Badge className={priorityConf.className + " text-xs"}>
                {priorityConf.label}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{order.scheduledTime}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xs text-muted-foreground">{order.ticketNumber}</p>
              <p className="font-medium text-sm">{order.clientName}</p>
              <p className="text-xs text-muted-foreground">{order.equipment}</p>
              <p className="text-xs text-destructive font-medium">{order.reason}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
