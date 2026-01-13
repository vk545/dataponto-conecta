import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileSignature,
  Eraser,
  Send,
  CheckCircle2,
  Building2,
  Wrench,
  Calendar,
  User,
  Download,
  PartyPopper,
  Navigation
} from "lucide-react";

// Mock order data
const mockOrder = {
  id: "1",
  ticketNumber: "CH-2025-001",
  clientName: "Empresa ABC Ltda",
  equipment: "Relógio de Ponto - iDFace Max",
  serial: "RP-2024-001",
  reason: "Equipamento não liga",
  technicianName: "João Silva",
  technicianId: "TEC-001",
  date: new Date().toLocaleDateString('pt-BR'),
  time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
};

// Mock remaining clients
const remainingClients = [
  { name: "Indústria XYZ S.A.", time: "10:30" },
  { name: "Comércio Delta", time: "14:00" },
  { name: "Hotel Premium", time: "16:30" },
];

export default function AssinaturaDigital() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const ctx = getContext();
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvasRef.current!.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = getContext();
    if (!ctx) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const ctx = getContext();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
  };

  const handleSubmit = async () => {
    if (!hasSignature) {
      toast.error("Por favor, colete a assinatura do cliente");
      return;
    }
    if (!signerName.trim()) {
      toast.error("Por favor, informe o nome do responsável");
      return;
    }

    setIsSubmitting(true);

    // Simula envio
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
      
      if (sendEmail && signerEmail) {
        toast.success(`Relatório enviado para ${signerEmail}`);
      }
    }, 1500);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    navigate("/tecnico");
  };

  const navigateToNextClient = () => {
    if (remainingClients.length > 0) {
      const nextClient = remainingClients[0];
      const address = encodeURIComponent(`${nextClient.name}, São Paulo, SP`);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
    }
    setShowSuccessModal(false);
    navigate("/tecnico");
  };

  return (
    <MobileLayout showBottomNav={false}>
      <PageHeader 
        title="Assinatura Digital" 
        subtitle="Finalizar Ordem de Serviço"
        backTo={`/tecnico/ordem/${id}`}
      />

      <div className="p-4 space-y-4 pb-32">
        {/* Service Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumo do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Chamado:</span>
                <span className="font-mono font-medium">{mockOrder.ticketNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">{mockOrder.date}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{mockOrder.clientName}</p>
                  <p className="text-xs text-muted-foreground">{mockOrder.equipment}</p>
                  <p className="text-xs text-muted-foreground font-mono">S/N: {mockOrder.serial}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Motivo</p>
                  <p className="text-sm font-medium text-destructive">{mockOrder.reason}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Técnico Responsável</p>
                  <p className="text-sm font-medium">{mockOrder.technicianName} ({mockOrder.technicianId})</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signer Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados do Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signerName">Nome Completo *</Label>
              <Input
                id="signerName"
                placeholder="Nome do responsável pela assinatura"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signerEmail">E-mail (para receber cópia)</Label>
              <Input
                id="signerEmail"
                type="email"
                placeholder="email@empresa.com.br"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <Label htmlFor="sendEmail" className="text-sm cursor-pointer">
                Enviar relatório de serviço por e-mail
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Signature Canvas */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-primary" />
                Assinatura do Cliente
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSignature}
                className="text-muted-foreground"
              >
                <Eraser className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={320}
                height={200}
                className="w-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Assine com o dedo ou caneta stylus
            </p>
          </CardContent>
        </Card>

        {/* Legal Text */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Ao assinar, o cliente confirma que o serviço foi realizado conforme descrito 
            no checklist e autoriza a DATAPONTO a utilizar os dados para fins de documentação.
          </p>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-2 z-50">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => toast.info("Baixando PDF...")}
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
          <Button 
            className="flex-1 gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting || !hasSignature}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Finalizar
              </>
            )}
          </Button>
        </div>
        {sendEmail && signerEmail && (
          <Button 
            variant="secondary" 
            className="w-full gap-2"
            onClick={() => toast.info("Enviando por e-mail...")}
          >
            <Send className="h-4 w-4" />
            Enviar por E-mail e Finalizar
          </Button>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-background rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            {/* Success Header */}
            <div className="bg-success p-6 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <PartyPopper className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-white">Serviço Finalizado!</h2>
              <p className="text-white/80 text-sm mt-1">
                Chamado {mockOrder.ticketNumber} concluído
              </p>
            </div>

            {/* Next Client Info */}
            <div className="p-6 space-y-4">
              {remainingClients.length > 0 ? (
                <>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Próximo cliente</p>
                    <p className="font-semibold text-lg">{remainingClients[0].name}</p>
                    <p className="text-sm text-muted-foreground">Horário: {remainingClients[0].time}</p>
                  </div>

                  <div className="bg-primary-light rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{remainingClients.length}</p>
                    <p className="text-sm text-muted-foreground">
                      {remainingClients.length === 1 ? 'cliente restante' : 'clientes restantes'} hoje
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full gap-2" 
                      onClick={navigateToNextClient}
                    >
                      <Navigation className="h-4 w-4" />
                      Ir para Próximo Cliente
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleContinue}
                    >
                      Voltar ao Dashboard
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">Parabéns!</h3>
                    <p className="text-muted-foreground text-sm">
                      Você finalizou todos os atendimentos do dia!
                    </p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleContinue}
                  >
                    Voltar ao Dashboard
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
