import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge, StatusType } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { PlusCircle, ChevronRight, Package, Calendar, Image } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Chamado {
  id: string;
  title: string;
  description: string;
  status: StatusType;
  createdAt: Date;
  updatedAt: Date;
  equipment?: string;
  hasPhotos: boolean;
}

const mockChamados: Chamado[] = [
  {
    id: "CH-2026-001",
    title: "Leitor biométrico não reconhece digital",
    description: "O equipamento da entrada principal não está reconhecendo as digitais cadastradas.",
    status: "progress",
    createdAt: new Date(2026, 0, 8),
    updatedAt: new Date(2026, 0, 9),
    equipment: "Leitor Bio Pro X1",
    hasPhotos: true,
  },
  {
    id: "CH-2026-002",
    title: "Erro no relógio de ponto",
    description: "Display apresentando falhas intermitentes.",
    status: "open",
    createdAt: new Date(2026, 0, 7),
    updatedAt: new Date(2026, 0, 7),
    equipment: "Relógio DP-500",
    hasPhotos: false,
  },
  {
    id: "CH-2025-098",
    title: "Manutenção preventiva catraca",
    description: "Substituição de peças desgastadas.",
    status: "done",
    createdAt: new Date(2025, 11, 20),
    updatedAt: new Date(2025, 11, 23),
    equipment: "Catraca CA-200",
    hasPhotos: true,
  },
];

export default function Chamados() {
  const [activeTab, setActiveTab] = useState("all");

  const filterChamados = (status?: StatusType) => {
    if (!status) return mockChamados;
    return mockChamados.filter(c => c.status === status);
  };

  const openCount = mockChamados.filter(c => c.status === "open").length;
  const progressCount = mockChamados.filter(c => c.status === "progress").length;

  return (
    <MobileLayout>
      <PageHeader 
        title="Chamados" 
        subtitle="Acompanhe suas solicitações"
        rightAction={
          <Link to="/chamados/novo">
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Novo
            </Button>
          </Link>
        }
      />

      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="open" className="relative">
              Abertos
              {openCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning text-warning-foreground text-[10px] font-bold flex items-center justify-center">
                  {openCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="progress" className="relative">
              Andamento
              {progressCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-info text-info-foreground text-[10px] font-bold flex items-center justify-center">
                  {progressCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="done">Concluídos</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filterChamados().map(chamado => (
              <ChamadoCard key={chamado.id} chamado={chamado} />
            ))}
          </TabsContent>

          <TabsContent value="open" className="space-y-3">
            {filterChamados("open").map(chamado => (
              <ChamadoCard key={chamado.id} chamado={chamado} />
            ))}
          </TabsContent>

          <TabsContent value="progress" className="space-y-3">
            {filterChamados("progress").map(chamado => (
              <ChamadoCard key={chamado.id} chamado={chamado} />
            ))}
          </TabsContent>

          <TabsContent value="done" className="space-y-3">
            {filterChamados("done").map(chamado => (
              <ChamadoCard key={chamado.id} chamado={chamado} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}

function ChamadoCard({ chamado }: { chamado: Chamado }) {
  return (
    <Link to={`/chamados/${chamado.id}`}>
      <Card className="shadow-card card-interactive">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">{chamado.id}</span>
                <StatusBadge status={chamado.status} />
              </div>
              <h3 className="font-medium text-sm line-clamp-2">{chamado.title}</h3>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {chamado.description}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {chamado.equipment && (
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {chamado.equipment}
                </span>
              )}
              {chamado.hasPhotos && (
                <span className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  Fotos
                </span>
              )}
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(chamado.createdAt, "dd/MM/yy")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
