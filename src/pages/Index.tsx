import { MobileLayout } from "@/components/layout/MobileLayout";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { ContractSummary } from "@/components/home/ContractSummary";
import { PendingAlerts } from "@/components/home/PendingAlerts";
import { QuickActionCard } from "@/components/ui/quick-action-card";
import { 
  Calendar, 
  FileText, 
  Wrench, 
  Package,
  PlusCircle 
} from "lucide-react";

// Mock data
const mockUser = {
  name: "Carlos Silva",
  company: "Empresa ABC Ltda",
  notifications: 3,
};

const mockContract = {
  planName: "Plano Empresarial",
  status: "active" as const,
  services: ["Ponto Eletrônico", "Controle de Acesso", "Suporte 24h"],
};

const mockAlerts = [
  {
    id: "1",
    type: "boleto" as const,
    title: "Boleto em aberto",
    description: "Vencimento: 15/01/2026",
    href: "/financeiro",
    urgent: true,
  },
  {
    id: "2",
    type: "training" as const,
    title: "Treinamento amanhã",
    description: "Sistema de Ponto - 14:00",
    href: "/treinamentos",
  },
];

export default function Index() {
  return (
    <MobileLayout>
      <WelcomeHeader 
        userName={mockUser.name}
        companyName={mockUser.company}
        notificationCount={mockUser.notifications}
      />

      <div className="px-4 -mt-4 space-y-6 pb-6">
        {/* Contract Summary Card */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <ContractSummary 
            planName={mockContract.planName}
            status={mockContract.status}
            services={mockContract.services}
          />
        </div>

        {/* Pending Alerts */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <PendingAlerts alerts={mockAlerts} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-medium text-sm px-1">Acesso Rápido</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={PlusCircle}
              title="Novo Chamado"
              description="Abrir solicitação"
              href="/chamados/novo"
              variant="primary"
            />
            <QuickActionCard
              icon={Calendar}
              title="Agendar"
              description="Treinamento"
              href="/treinamentos/agendar"
              variant="accent"
            />
          </div>

          <QuickActionCard
            icon={Wrench}
            title="Meus Chamados"
            description="2 em andamento"
            href="/chamados"
            badge={2}
          />

          <QuickActionCard
            icon={FileText}
            title="Financeiro"
            description="Boletos e notas fiscais"
            href="/financeiro"
            badge={1}
          />

          <QuickActionCard
            icon={Package}
            title="Meus Equipamentos"
            description="3 equipamentos registrados"
            href="/equipamentos"
          />
        </div>
      </div>
    </MobileLayout>
  );
}
