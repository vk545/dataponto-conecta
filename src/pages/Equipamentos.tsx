import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  QrCode, 
  Wrench, 
  ChevronRight,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

import relogioPonto from "@/assets/relogio-ponto.png";
import controladorBiometrico from "@/assets/controlador-biometrico.png";
import catraca from "@/assets/catraca.png";

interface Equipment {
  id: string;
  name: string;
  model: string;
  serial: string;
  image: string;
  status: "active" | "maintenance" | "inactive";
  lastMaintenance?: Date;
  openTickets: number;
}

const mockEquipments: Equipment[] = [
  {
    id: "1",
    name: "Relógio de Ponto",
    model: "iDFace Max - Control iD",
    serial: "RP-2024-001",
    image: relogioPonto,
    status: "active",
    lastMaintenance: new Date(2025, 10, 15),
    openTickets: 0,
  },
  {
    id: "2",
    name: "Controlador Biométrico",
    model: "iDAccess - Control iD",
    serial: "CB-2024-002",
    image: controladorBiometrico,
    status: "maintenance",
    openTickets: 1,
  },
  {
    id: "3",
    name: "Catraca de Acesso",
    model: "iDBlock - Topdata",
    serial: "CA-2024-003",
    image: catraca,
    status: "active",
    lastMaintenance: new Date(2025, 11, 20),
    openTickets: 0,
  },
];

const statusConfig = {
  active: {
    label: "Ativo",
    icon: CheckCircle2,
    className: "bg-success-light text-success border-success/20",
  },
  maintenance: {
    label: "Em manutenção",
    icon: Wrench,
    className: "bg-warning-light text-warning border-warning/20",
  },
  inactive: {
    label: "Inativo",
    icon: AlertTriangle,
    className: "bg-destructive-light text-destructive border-destructive/20",
  },
};

export default function Equipamentos() {
  return (
    <MobileLayout>
      <PageHeader 
        title="Equipamentos" 
        subtitle="Seus equipamentos registrados"
      />

      <div className="p-4 space-y-4">
        {mockEquipments.map((equipment) => (
          <EquipmentCard key={equipment.id} equipment={equipment} />
        ))}
      </div>
    </MobileLayout>
  );
}

function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const config = statusConfig[equipment.status];
  const StatusIcon = config.icon;

  return (
    <Card className="shadow-card overflow-hidden card-interactive">
      <div className="flex">
        {/* Equipment Image */}
        <div className="w-28 h-32 flex-shrink-0">
          <img
            src={equipment.image}
            alt={equipment.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Equipment Info */}
        <CardContent className="flex-1 p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="outline" className={config.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            {equipment.openTickets > 0 && (
              <span className="flex items-center gap-1 text-xs text-warning">
                <Wrench className="h-3 w-3" />
                {equipment.openTickets}
              </span>
            )}
          </div>

          <h3 className="font-medium text-sm">{equipment.name}</h3>
          <p className="text-xs text-muted-foreground">{equipment.model}</p>

          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <QrCode className="h-3 w-3" />
            <span className="font-mono">{equipment.serial}</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <Link to={`/chamados/novo?equipment=${equipment.id}`}>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Wrench className="h-3 w-3" />
                Abrir Chamado
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
