import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save, Loader2 } from "lucide-react";

export default function DadosEmpresa() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [empresa, setEmpresa] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    if (profile) {
      setEmpresa(profile.empresa || "");
      setCargo(profile.cargo || "");
      setTelefone(profile.telefone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          empresa,
          cargo,
          telefone,
        })
        .eq("id", profile.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Dados atualizados!",
        description: "Os dados da empresa foram salvos com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout>
      <PageHeader 
        title="Dados da Empresa" 
        subtitle="Informações da sua organização"
        backTo="/perfil"
        showBack
      />

      <div className="p-4 space-y-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa">Nome da Empresa</Label>
              <Input
                id="empresa"
                placeholder="Nome da empresa"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Seu Cargo</Label>
              <Input
                id="cargo"
                placeholder="Ex: Gerente de RH"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone de Contato</Label>
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="shadow-card bg-primary-light border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-primary">
              Estes dados são usados para identificar sua empresa nos chamados e contratos.
            </p>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
