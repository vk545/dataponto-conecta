import { FileCheck, ChevronRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ContractSummaryProps {
  planName: string;
  status: "active" | "pending" | "expired";
  services: string[];
}

const statusLabels = {
  active: { label: "Ativo", className: "text-success" },
  pending: { label: "Pendente", className: "text-warning" },
  expired: { label: "Expirado", className: "text-destructive" },
};

export function ContractSummary({ planName, status, services }: ContractSummaryProps) {
  const statusInfo = statusLabels[status];

  const handleWhatsApp = () => {
    window.open("https://wa.me/5511988520276?text=Olá! Gostaria de saber mais sobre upgrade de plano.", "_blank");
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary-light">
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">Contrato Ativo</h3>
            <span className={`text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
        <Link to="/perfil/contrato" className="text-primary">
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Plano</span>
          <span className="font-medium">{planName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Serviços</span>
          <span className="font-medium text-right">{services.slice(0, 2).join(", ")}</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        onClick={handleWhatsApp}
      >
        <MessageCircle className="h-4 w-4" />
        Falar sobre Upgrade
      </Button>
    </div>
  );
}
