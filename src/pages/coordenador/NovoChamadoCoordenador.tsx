import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2, MapPin, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Tecnico {
  id: string;
  profile_id: string;
  nome: string;
  especialidade: string | null;
  regiao: string | null;
}

export default function NovoChamadoCoordenador() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    endereco: "",
    prioridade: "normal",
    tecnico_id: "",
    data_agendada: "",
    horario_agendado: "",
  });

  useEffect(() => {
    fetchTecnicos();
  }, []);

  const fetchTecnicos = async () => {
    try {
      const { data, error } = await supabase
        .from("tecnicos")
        .select(`
          id,
          profile_id,
          especialidade,
          regiao,
          profiles:profile_id (
            nome
          )
        `)
        .eq("disponivel", true);

      if (error) throw error;

      const formattedTecnicos: Tecnico[] = (data || []).map((t: any) => ({
        id: t.id,
        profile_id: t.profile_id,
        nome: t.profiles?.nome || "Técnico",
        especialidade: t.especialidade,
        regiao: t.regiao,
      }));

      setTecnicos(formattedTecnicos);
    } catch (error) {
      console.error("Erro ao buscar técnicos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("chamados_internos").insert({
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        endereco: formData.endereco.trim() || null,
        prioridade: formData.prioridade,
        tecnico_id: formData.tecnico_id || null,
        data_agendada: formData.data_agendada || null,
        horario_agendado: formData.horario_agendado || null,
        cliente_id: profile.id,
        status: "aberto",
      });

      if (error) throw error;

      toast({
        title: "Chamado criado!",
        description: formData.tecnico_id 
          ? "O chamado foi criado e atribuído ao técnico."
          : "O chamado foi criado com sucesso.",
      });

      navigate("/coordenador");
    } catch (error: any) {
      console.error("Erro ao criar chamado:", error);
      toast({
        title: "Erro ao criar chamado",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout showHeader={false} showBottomNav={false}>
      <PageHeader title="Novo Chamado" showBack backTo="/coordenador" />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Chamado *</Label>
              <Input
                id="titulo"
                placeholder="Ex: Relógio de ponto não registra"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o problema com detalhes..."
                className="min-h-[100px]"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">
                <MapPin className="h-4 w-4 inline mr-1" />
                Endereço
              </Label>
              <Input
                id="endereco"
                placeholder="Rua, número, bairro, cidade"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
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

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Atribuição e Agendamento</h3>

            <div className="space-y-2">
              <Label htmlFor="tecnico">Atribuir para Técnico</Label>
              <Select
                value={formData.tecnico_id}
                onValueChange={(value) => setFormData({ ...formData, tecnico_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um técnico (opcional)" />
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
              {tecnicos.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum técnico disponível no momento
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="data">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data_agendada}
                  onChange={(e) => setFormData({ ...formData, data_agendada: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Horário
                </Label>
                <Input
                  id="horario"
                  type="time"
                  value={formData.horario_agendado}
                  onChange={(e) => setFormData({ ...formData, horario_agendado: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full gap-2" 
          size="lg"
          disabled={isSubmitting || !formData.titulo.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Criar Chamado
            </>
          )}
        </Button>
      </form>
    </MobileLayout>
  );
}
