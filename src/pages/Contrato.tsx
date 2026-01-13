import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  MessageCircle, 
  Calendar,
  FileText,
  Users,
  Clock,
  Wrench,
  Phone
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const contractData = {
  planName: "Plano Prime",
  status: "active",
  startDate: new Date(2024, 0, 1),
  renewalDate: new Date(2026, 0, 1),
  monthlyValue: 1250.00,
  services: [
    { name: "Ponto Eletrônico", included: true },
    { name: "Controle de Acesso", included: true },
    { name: "Suporte 24h", included: true },
    { name: "Manutenção Preventiva", included: true },
    { name: "Treinamentos Online", included: true },
    { name: "Relatórios Avançados", included: true },
    { name: "Integração API", included: false },
    { name: "Backup em Nuvem", included: false },
  ],
  equipmentLimit: 10,
  userLimit: 500,
  supportHours: "24/7",
};

export default function Contrato() {
  const handleWhatsApp = () => {
    window.open("https://wa.me/5511988520276?text=Olá! Gostaria de falar sobre meu contrato ou fazer um upgrade de plano.", "_blank");
  };

  return (
    <MobileLayout>
      <PageHeader title="Contrato Ativo" showBack />

      <div className="p-4 space-y-4">
        {/* Contract Overview */}
        <Card className="shadow-card overflow-hidden">
          <div className="bg-primary p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Seu plano</p>
                <h2 className="text-xl font-bold text-primary-foreground">
                  {contractData.planName}
                </h2>
              </div>
              <Badge className="bg-success text-success-foreground">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Início do contrato
              </span>
              <span className="font-medium">
                {format(contractData.startDate, "dd/MM/yyyy")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próxima renovação
              </span>
              <span className="font-medium">
                {format(contractData.renewalDate, "dd/MM/yyyy")}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Valor mensal
              </span>
              <span className="font-bold text-lg">
                R$ {contractData.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Plan Limits */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Limites do Plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                Usuários
              </span>
              <span className="font-medium">Até {contractData.userLimit}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="flex items-center gap-2 text-sm">
                <Wrench className="h-4 w-4 text-primary" />
                Equipamentos
              </span>
              <span className="font-medium">Até {contractData.equipmentLimit}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                Suporte
              </span>
              <span className="font-medium">{contractData.supportHours}</span>
            </div>
          </CardContent>
        </Card>

        {/* Services Included */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Serviços do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contractData.services.map((service) => (
                <div 
                  key={service.name}
                  className={`flex items-center gap-2 py-2 ${
                    !service.included ? 'opacity-50' : ''
                  }`}
                >
                  <CheckCircle2 
                    className={`h-4 w-4 ${
                      service.included ? 'text-success' : 'text-muted-foreground'
                    }`}
                  />
                  <span className={`text-sm ${
                    service.included ? '' : 'line-through text-muted-foreground'
                  }`}>
                    {service.name}
                  </span>
                  {!service.included && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      Upgrade
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        <Card className="shadow-card border-accent/30 bg-accent-light">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1">Quer mais recursos?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Faça um upgrade do seu plano e tenha acesso a todos os recursos.
            </p>
            <Button 
              className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-4 w-4" />
              Falar sobre Upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
