import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Navigation, Clock, CheckCircle2, AlertCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ChamadoStatus = "aberto" | "em_andamento" | "finalizado" | "cancelado";

interface ChamadoDetalheRow {
  id: string;
  titulo: string;
  descricao: string | null;
  status: ChamadoStatus;
  prioridade: string | null;
  data_agendada: string | null;
  horario_agendado: string | null;
  endereco: string | null;
  created_at: string;
  tecnico_id: string | null;
  tecnico?: {
    id: string;
    profiles?: {
      nome: string;
    } | null;
  } | null;
}

const statusConfig: Record<ChamadoStatus, { label: string; icon: any; className: string }> = {
  aberto: { label: "Aberto", icon: AlertCircle, className: "bg-warning-light text-warning border-warning/20" },
  em_andamento: { label: "Em andamento", icon: Clock, className: "bg-info-light text-info border-info/20" },
  finalizado: { label: "Finalizado", icon: CheckCircle2, className: "bg-success-light text-success border-success/20" },
  cancelado: { label: "Cancelado", icon: AlertCircle, className: "bg-muted text-muted-foreground border-border" },
};

export default function ChamadoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chamado, setChamado] = useState<ChamadoDetalheRow | null>(null);

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
            status,
            prioridade,
            data_agendada,
            horario_agendado,
            endereco,
            created_at,
            tecnico_id,
            tecnico:tecnico_id (
              id,
              profiles:profile_id ( nome )
            )
          `
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        setChamado(data as any);
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Erro",
          description: "Chamado não encontrado.",
          variant: "destructive",
        });
        navigate("/chamados");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, navigate]);

  const status = chamado?.status;
  const statusConf = useMemo(() => (status ? statusConfig[status] : null), [status]);
  const StatusIcon = statusConf?.icon;

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!chamado) return null;

  return (
    <MobileLayout>
      <PageHeader title="Detalhes do Chamado" showBack backTo="/chamados" />

      <div className="p-4 space-y-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">{chamado.titulo}</CardTitle>
              {statusConf && StatusIcon && (
                <Badge variant="outline" className={statusConf.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConf.label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {chamado.descricao && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{chamado.descricao}</p>
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
                    <Clock className="h-4 w-4 text-muted-foreground" />
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

            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>
                Técnico: {chamado.tecnico?.profiles?.nome || "Ainda não atribuído"}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Criado em {new Date(chamado.created_at).toLocaleDateString("pt-BR")} às{" "}
              {new Date(chamado.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
