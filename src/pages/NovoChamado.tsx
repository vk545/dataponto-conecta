import { useState } from "react";
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
import { Camera, X, Upload, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const mockEquipments = [
  { id: "1", name: "Leitor Bio Pro X1", serial: "BP-2024-001" },
  { id: "2", name: "Relógio DP-500", serial: "DP-2024-002" },
  { id: "3", name: "Catraca CA-200", serial: "CA-2024-003" },
];

export default function NovoChamado() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    equipment: "",
    description: "",
  });

  const handlePhotoAdd = () => {
    // Simulating photo capture/upload
    const mockPhotos = [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop",
    ];
    if (photos.length < 5) {
      setPhotos([...photos, mockPhotos[photos.length % 2]]);
    }
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Chamado aberto com sucesso!",
      description: "Você receberá atualizações sobre o status.",
    });

    navigate("/chamados");
  };

  return (
    <MobileLayout>
      <PageHeader title="Novo Chamado" showBack />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Problema *</Label>
              <Input
                id="title"
                placeholder="Ex: Leitor não reconhece digital"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Equipamento Relacionado</Label>
              <Select
                value={formData.equipment}
                onValueChange={(value) => setFormData({ ...formData, equipment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {mockEquipments.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} ({eq.serial})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Problema *</Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema com detalhes..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos Section */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <Label className="mb-3 block">Fotos (opcional)</Label>
            
            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handlePhotoRemove(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={handlePhotoAdd}
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-[10px]">Adicionar</span>
                </button>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              Adicione até 5 fotos para ajudar a identificar o problema
            </p>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full gap-2" 
          size="lg"
          disabled={isSubmitting || !formData.title || !formData.description}
        >
          {isSubmitting ? (
            <>
              <Upload className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Abrir Chamado
            </>
          )}
        </Button>
      </form>
    </MobileLayout>
  );
}
