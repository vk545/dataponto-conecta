import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Chamado {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  prioridade: string | null;
  data_agendada: string | null;
  horario_agendado: string | null;
  endereco: string | null;
  created_at: string;
  tecnico_id: string | null;
}

interface Tecnico {
  id: string;
  nome: string;
  regiao: string | null;
}

const statusConfig = {
  aberto: { label: "Aberto", className: "bg-warning-light text-warning border-warning/20", icon: AlertCircle },
  em_andamento: { label: "Em Andamento", className: "bg-info-light text-info border-info/20", icon: Clock },
  finalizado: { label: "Finalizado", className: "bg-success-light text-success border-success/20", icon: CheckCircle2 },
};

const prioridadeConfig = {
  baixa: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", className: "bg-info-light text-info" },
  alta: { label: "Alta", className: "bg-warning-light text-warning" },
  urgente: { label: "Urgente", className: "bg-destructive-light text-destructive" },
};

export default function DetalheChamado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChamado();
      fetchTecnicos();
    }
  }, [id]);

  const fetchChamado = async () => {
    try {
      const { data, error } = await supabase
        .from("chamados_internos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setChamado(data);
    } catch (error) {
      console.error("Erro ao buscar chamado:", error);
      toast({
        title: "Erro",
        description: "Chamado não encontrado",
        variant: "destructive",
      });
      navigate("/coordenador");
    } finally {
      setLoading(false);
    }
  };

  const fetchTecnicos = async () => {
    try {
      const { data, error } = await supabase
        .from("tecnicos")
        .select(`
          id,
          regiao,
          profiles:profile_id (nome)
        `);

      if (error) throw error;

      const formattedTecnicos = (data || []).map((t: any) => ({
        id: t.id,
        nome: t.profiles?.nome || "Técnico",
        regiao: t.regiao,
      }));

      setTecnicos(formattedTecnicos);
    } catch (error) {
      console.error("Erro ao buscar técnicos:", error);
    }
  };

  const updateChamado = async (field: string, value: string | null) => {
    if (!chamado) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("chamados_internos")
        .update({ [field]: value })
        .eq("id", chamado.id);

      if (error) throw error;

      setChamado({ ...chamado, [field]: value });
      toast({
        title: "Atualizado!",
        description: "Chamado atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteChamado = async () => {
    if (!chamado) return;

    try {
      const { error } = await supabase
        .from("chamados_internos")
        .delete()
        .eq("id", chamado.id);

      if (error) throw error;

      toast({
        title: "Chamado excluído",
        description: "O chamado foi removido com sucesso.",
      });
      navigate("/coordenador");
    } catch (error: any) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <MobileLayout showHeader={false} showBottomNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!chamado) return null;

  const statusConf = statusConfig[chamado.status as keyof typeof statusConfig] || statusConfig.aberto;
  const prioridadeConf = prioridadeConfig[chamado.prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.normal;
  const tecnicoAtual = tecnicos.find(t => t.id === chamado.tecnico_id);

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <PageHeader title="Detalhes do Chamado" showBack backTo="/coordenador" />

      <div className="p-4 space-y-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">{chamado.titulo}</CardTitle>
              <Badge className={prioridadeConf.className}>
                {prioridadeConf.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {chamado.descricao && (
              <p className="text-sm text-muted-foreground">{chamado.descricao}</p>
            )}

            {chamado.endereco && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{chamado.endereco}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary"
                    onClick={() => {
                      const address = encodeURIComponent(chamado.endereco || "");
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, "_blank");
                    }}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Abrir no Maps
                  </Button>
                </div>
              </div>
            )}

            {(chamado.data_agendada || chamado.horario_agendado) && (
              <div className="flex items-center gap-4 text-sm">
                {chamado.data_agendada && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(chamado.data_agendada).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
                {chamado.horario_agendado && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{chamado.horario_agendado}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Criado em {new Date(chamado.created_at).toLocaleDateString("pt-BR")} às{" "}
              {new Date(chamado.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={chamado.status}
                onValueChange={(value) => updateChamado("status", value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Técnico Responsável</Label>
              <Select
                value={chamado.tecnico_id || ""}
                onValueChange={(value) => updateChamado("tecnico_id", value || null)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id}>
                      {tecnico.nome}
                      {tecnico.regiao && ` - ${tecnico.regiao}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tecnicoAtual && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Atribuído para: {tecnicoAtual.nome}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={chamado.prioridade || "normal"}
                onValueChange={(value) => updateChamado("prioridade", value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir Chamado
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir chamado?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O chamado será removido permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deleteChamado}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MobileLayout>
  );
}
