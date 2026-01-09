import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Boleto {
  id: string;
  value: number;
  dueDate: Date;
  status: "pending" | "paid" | "overdue";
  reference: string;
}

interface NotaFiscal {
  id: string;
  number: string;
  value: number;
  date: Date;
  type: string;
}

const mockBoletos: Boleto[] = [
  {
    id: "1",
    value: 1250.00,
    dueDate: new Date(2026, 0, 15),
    status: "pending",
    reference: "Janeiro/2026",
  },
  {
    id: "2",
    value: 1250.00,
    dueDate: new Date(2025, 11, 15),
    status: "paid",
    reference: "Dezembro/2025",
  },
  {
    id: "3",
    value: 1250.00,
    dueDate: new Date(2025, 10, 15),
    status: "paid",
    reference: "Novembro/2025",
  },
];

const mockNotas: NotaFiscal[] = [
  {
    id: "1",
    number: "NFS-e 001234",
    value: 1250.00,
    date: new Date(2025, 11, 15),
    type: "Serviços de Manutenção",
  },
  {
    id: "2",
    number: "NFS-e 001198",
    value: 1250.00,
    date: new Date(2025, 10, 15),
    type: "Serviços de Manutenção",
  },
];

export default function Financeiro() {
  const pendingCount = mockBoletos.filter(b => b.status === "pending" || b.status === "overdue").length;

  return (
    <MobileLayout>
      <PageHeader 
        title="Financeiro" 
        subtitle="Boletos e notas fiscais"
      />

      <div className="p-4">
        <Tabs defaultValue="boletos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="boletos" className="relative">
              Boletos
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="notas">Notas Fiscais</TabsTrigger>
          </TabsList>

          <TabsContent value="boletos" className="space-y-3">
            {mockBoletos.map((boleto) => (
              <BoletoCard key={boleto.id} boleto={boleto} />
            ))}
          </TabsContent>

          <TabsContent value="notas" className="space-y-3">
            {mockNotas.map((nota) => (
              <NotaFiscalCard key={nota.id} nota={nota} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}

function BoletoCard({ boleto }: { boleto: Boleto }) {
  const statusConfig = {
    pending: {
      label: "Pendente",
      icon: Clock,
      className: "bg-warning-light text-warning border-warning/20",
    },
    paid: {
      label: "Pago",
      icon: CheckCircle2,
      className: "bg-success-light text-success border-success/20",
    },
    overdue: {
      label: "Vencido",
      icon: AlertCircle,
      className: "bg-destructive-light text-destructive border-destructive/20",
    },
  };

  const config = statusConfig[boleto.status];
  const Icon = config.icon;

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Referência</p>
            <p className="font-medium">{boleto.reference}</p>
          </div>
          <Badge variant="outline" className={config.className}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="text-lg font-bold text-foreground">
              R$ {boleto.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vencimento: {format(boleto.dueDate, "dd/MM/yyyy")}
            </p>
          </div>

          <div className="flex gap-2">
            {boleto.status !== "paid" && (
              <Button size="sm" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                Pagar
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1">
              <Download className="h-3 w-3" />
              PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotaFiscalCard({ nota }: { nota: NotaFiscal }) {
  return (
    <Card className="shadow-card card-interactive">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-light">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{nota.number}</p>
            <p className="text-xs text-muted-foreground">{nota.type}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(nota.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold">
              R$ {nota.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <Button size="sm" variant="ghost" className="h-8 px-2 mt-1">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
