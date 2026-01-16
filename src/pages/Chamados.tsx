import { useEffect, useMemo, useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge, StatusType } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { PlusCircle, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type ChamadoStatusDb = "aberto" | "em_andamento" | "finalizado" | "cancelado";

interface ChamadoRow {
  id: string;
  titulo: string;
  descricao: string | null;
  status: ChamadoStatusDb;
  created_at: string;
}

interface ChamadoUI {
  id: string;
  title: string;
  description: string;
  status: StatusType;
  createdAt: Date;
}

function mapStatus(status: ChamadoStatusDb): StatusType {
  switch (status) {
    case "aberto":
      return "open";
    case "em_andamento":
      return "progress";
    case "finalizado":
      return "done";
    case "cancelado":
    default:
      return "open";
  }
}

export default function Chamados() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chamados, setChamados] = useState<ChamadoUI[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!profile?.id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("chamados_internos")
          .select("id,titulo,descricao,status,created_at")
          .eq("cliente_id", profile.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped = (data as ChamadoRow[] | null)?.map((c) => ({
          id: c.id,
          title: c.titulo,
          description: c.descricao || "",
          status: mapStatus(c.status),
          createdAt: new Date(c.created_at),
        })) ?? [];

        setChamados(mapped);
      } catch (e) {
        console.error(e);
        setChamados([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [profile?.id]);

  const openCount = useMemo(() => chamados.filter((c) => c.status === "open").length, [chamados]);
  const progressCount = useMemo(() => chamados.filter((c) => c.status === "progress").length, [chamados]);

  const filterChamados = (status?: StatusType) => {
    if (!status) return chamados;
    return chamados.filter((c) => c.status === status);
  };

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
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
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
              {filterChamados().map((chamado) => (
                <ChamadoCard key={chamado.id} chamado={chamado} />
              ))}
              {chamados.length === 0 && (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="open" className="space-y-3">
              {filterChamados("open").map((chamado) => (
                <ChamadoCard key={chamado.id} chamado={chamado} />
              ))}
            </TabsContent>

            <TabsContent value="progress" className="space-y-3">
              {filterChamados("progress").map((chamado) => (
                <ChamadoCard key={chamado.id} chamado={chamado} />
              ))}
            </TabsContent>

            <TabsContent value="done" className="space-y-3">
              {filterChamados("done").map((chamado) => (
                <ChamadoCard key={chamado.id} chamado={chamado} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MobileLayout>
  );
}

function EmptyState() {
  return (
    <Card className="shadow-card">
      <CardContent className="p-6 text-center text-sm text-muted-foreground">
        Nenhum chamado encontrado.
      </CardContent>
    </Card>
  );
}

function ChamadoCard({ chamado }: { chamado: ChamadoUI }) {
  return (
    <Link to={`/chamados/${chamado.id}`}>
      <Card className="shadow-card card-interactive">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">{chamado.id.slice(0, 8).toUpperCase()}</span>
                <StatusBadge status={chamado.status} />
              </div>
              <h3 className="font-medium text-sm line-clamp-2">{chamado.title}</h3>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          {chamado.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{chamado.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
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
