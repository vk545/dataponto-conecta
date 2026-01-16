import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin,
  Phone,
  Building2,
  Navigation,
  ClipboardCheck,
  FileSignature,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Battery,
  Cpu,
  Zap,
  Fingerprint,
  Keyboard,
  Printer,
  CircuitBoard,
  Sparkles,
  TestTube,
  MessageSquare,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ElementType;
  checked: boolean;
  observation: string;
}

const initialChecklist: ChecklistItem[] = [
  { id: "battery", label: "Bateria", icon: Battery, checked: false, observation: "" },
  { id: "memory", label: "Memória", icon: Cpu, checked: false, observation: "" },
  { id: "power", label: "Fonte de Alimentação", icon: Zap, checked: false, observation: "" },
  { id: "biometric", label: "Leitor Biométrico", icon: Fingerprint, checked: false, observation: "" },
  { id: "keyboard", label: "Teclado", icon: Keyboard, checked: false, observation: "" },
  { id: "printer", label: "Impressora", icon: Printer, checked: false, observation: "" },
  { id: "board", label: "Placa Principal", icon: CircuitBoard, checked: false, observation: "" },
  { id: "cleaning", label: "Limpeza Geral", icon: Sparkles, checked: false, observation: "" },
  { id: "test", label: "Teste de Funcionalidade", icon: TestTube, checked: false, observation: "" },
];

interface ChamadoData {
  id: string;
  titulo: string;
  descricao: string | null;
  endereco: string | null;
  prioridade: string | null;
  status: string;
  data_agendada: string | null;
  horario_agendado: string | null;
  cliente?: {
    nome: string;
    email: string;
    telefone: string | null;
    empresa: string | null;
  } | null;
}


export default function OrdemServico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chamado, setChamado] = useState<ChamadoData | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [generalObservation, setGeneralObservation] = useState("");
  const [solution, setSolution] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("chamados_internos")
          .select(
            `
            id,
            titulo,
            descricao,
            endereco,
            prioridade,
            status,
            data_agendada,
            horario_agendado,
            cliente:cliente_id (
              nome,
              email,
              telefone,
              empresa
            )
          `
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        setChamado(data as any);
      } catch (err: any) {
        console.error(err);
        toast.error("Não foi possível carregar este chamado.");
        navigate("/tecnico");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, navigate]);

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, checked } : item
      )
    );
  };

  const handleObservationChange = (itemId: string, observation: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, observation } : item
      )
    );
  };

  const handleAddPhoto = () => {
    // Simula adição de foto
    const newPhoto = `photo_${photos.length + 1}.jpg`;
    setPhotos(prev => [...prev, newPhoto]);
    toast.success("Foto adicionada com sucesso!");
  };

  const completedItems = checklist.filter(item => item.checked).length;
  const progress = Math.round((completedItems / checklist.length) * 100);

  if (loading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!chamado) return null;

  const ticketNumber = `CH-${chamado.id.slice(0, 8).toUpperCase()}`;

  return (
    <MobileLayout showBottomNav={false}>
      <PageHeader title="Ordem de Serviço" subtitle={ticketNumber} backTo="/tecnico" />

      <div className="p-4 space-y-4 pb-24">
        {/* Client Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">{chamado.cliente?.empresa || chamado.cliente?.nome || "Cliente"}</p>
              <p className="text-sm text-muted-foreground">{chamado.titulo}</p>
              <p className="text-xs text-muted-foreground font-mono">ID: {chamado.id.slice(0, 8).toUpperCase()}</p>
            </div>

            <Separator />

            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{chamado.endereco || "Endereço não informado"}</p>
              </div>
              {chamado.endereco && (
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    const address = encodeURIComponent(chamado.endereco || "");
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, "_blank");
                  }}
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              )}
            </div>

            {chamado.cliente?.telefone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${chamado.cliente.telefone}`} className="text-sm text-primary">
                  {chamado.cliente.telefone}
                </a>
              </div>
            )}

            <div className="p-3 bg-destructive-light rounded-lg">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Motivo: {chamado.titulo}
              </p>
              {chamado.descricao && (
                <p className="text-xs text-destructive/90 mt-2 whitespace-pre-wrap">{chamado.descricao}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Checklist de Manutenção
              </CardTitle>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {completedItems}/{checklist.length}
              </Badge>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={(checked) => 
                        handleChecklistChange(item.id, checked as boolean)
                      }
                    />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <Label 
                      htmlFor={item.id} 
                      className={`flex-1 cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {item.label}
                    </Label>
                    {item.checked && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                  </div>
                  {item.checked && (
                    <Textarea
                      placeholder={`Observação sobre ${item.label.toLowerCase()}...`}
                      value={item.observation}
                      onChange={(e) => handleObservationChange(item.id, e.target.value)}
                      className="text-sm h-16 ml-8"
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Fotos do Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((photo, index) => (
                <div 
                  key={index}
                  className="aspect-square bg-muted rounded-lg flex items-center justify-center"
                >
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
              ))}
              <button
                onClick={handleAddPhoto}
                className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Camera className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Adicionar</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Solution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Solução Aplicada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva a solução aplicada e serviços realizados..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="min-h-24"
            />
          </CardContent>
        </Card>

        {/* General Observation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Observações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Observações adicionais sobre o atendimento..."
              value={generalObservation}
              onChange={(e) => setGeneralObservation(e.target.value)}
              className="min-h-20"
            />
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-2 z-50">
        <Link to={`/tecnico/ordem/${id}/assinatura`}>
          <Button className="w-full gap-2" size="lg">
            <FileSignature className="h-5 w-5" />
            Coletar Assinatura e Finalizar
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </MobileLayout>
  );
}
