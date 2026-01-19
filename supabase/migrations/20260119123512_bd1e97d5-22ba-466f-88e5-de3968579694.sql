-- Tabela para configurar os slots de horários de treinamento
CREATE TABLE public.slots_treinamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT true,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir slots padrão (09:00-11:00, 14:00-16:00, e um terceiro slot flexível)
INSERT INTO public.slots_treinamento (horario_inicio, horario_fim, descricao) VALUES
  ('09:00:00', '11:00:00', 'Período matutino'),
  ('14:00:00', '16:00:00', 'Período vespertino');

-- Tabela para exceções de horários por data específica
CREATE TABLE public.excecoes_horario_treinamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  slots_personalizados JSONB NOT NULL DEFAULT '[]',
  bloqueado BOOLEAN DEFAULT false,
  motivo TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slots_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excecoes_horario_treinamento ENABLE ROW LEVEL SECURITY;

-- Todos podem ver os slots
CREATE POLICY "Todos podem ver slots" ON public.slots_treinamento
  FOR SELECT USING (true);

-- Coordenadores podem gerenciar slots
CREATE POLICY "Coordenadores gerenciam slots" ON public.slots_treinamento
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND tipo = 'coordenador')
  );

-- Todos podem ver exceções
CREATE POLICY "Todos podem ver exceções" ON public.excecoes_horario_treinamento
  FOR SELECT USING (true);

-- Coordenadores podem gerenciar exceções
CREATE POLICY "Coordenadores gerenciam exceções" ON public.excecoes_horario_treinamento
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND tipo = 'coordenador')
  );