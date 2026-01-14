-- Enum para tipos de usuário
CREATE TYPE public.user_type AS ENUM ('cliente', 'tecnico', 'coordenador');

-- Enum para status de chamado
CREATE TYPE public.chamado_status AS ENUM ('aberto', 'em_andamento', 'finalizado', 'cancelado');

-- Enum para tipo de treinamento
CREATE TYPE public.treinamento_tipo AS ENUM ('online', 'presencial');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  tipo user_type NOT NULL DEFAULT 'cliente',
  avatar_url TEXT,
  empresa TEXT,
  cargo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de técnicos (informações adicionais)
CREATE TABLE public.tecnicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  especialidade TEXT,
  regiao TEXT,
  disponivel BOOLEAN DEFAULT true,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de treinamentos disponíveis
CREATE TABLE public.treinamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo treinamento_tipo NOT NULL DEFAULT 'online',
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  vagas_totais INTEGER NOT NULL DEFAULT 10,
  vagas_disponiveis INTEGER NOT NULL DEFAULT 10,
  link_online TEXT,
  endereco TEXT,
  instrutor TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Tabela de agendamentos de treinamentos
CREATE TABLE public.agendamentos_treinamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treinamento_id UUID REFERENCES public.treinamentos(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  confirmado BOOLEAN DEFAULT false,
  presente BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(treinamento_id, profile_id)
);

-- Tabela de mensagens do chat
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  audio_url TEXT,
  is_audio BOOLEAN DEFAULT false,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de chamados internos
CREATE TABLE public.chamados_internos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tecnico_id UUID REFERENCES public.tecnicos(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  status chamado_status NOT NULL DEFAULT 'aberto',
  prioridade TEXT DEFAULT 'normal',
  endereco TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  data_agendada DATE,
  horario_agendado TIME,
  observacoes TEXT,
  assinatura_url TEXT,
  finalizado_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados_internos ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Usuários podem ver todos os perfis" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir próprio perfil" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policies for tecnicos
CREATE POLICY "Todos podem ver técnicos" ON public.tecnicos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Técnicos podem atualizar próprios dados" ON public.tecnicos
  FOR UPDATE TO authenticated 
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Policies for treinamentos
CREATE POLICY "Todos podem ver treinamentos ativos" ON public.treinamentos
  FOR SELECT TO authenticated USING (ativo = true);

CREATE POLICY "Coordenadores podem gerenciar treinamentos" ON public.treinamentos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND tipo = 'coordenador'
    )
  );

-- Policies for agendamentos
CREATE POLICY "Usuários podem ver próprios agendamentos" ON public.agendamentos_treinamento
  FOR SELECT TO authenticated 
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Usuários podem criar agendamentos" ON public.agendamentos_treinamento
  FOR INSERT TO authenticated 
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coordenadores podem ver todos agendamentos" ON public.agendamentos_treinamento
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND tipo = 'coordenador'
    )
  );

-- Policies for chat
CREATE POLICY "Usuários podem ver próprias mensagens" ON public.chat_messages
  FOR SELECT TO authenticated 
  USING (
    sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR receiver_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Usuários podem enviar mensagens" ON public.chat_messages
  FOR INSERT TO authenticated 
  WITH CHECK (sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar próprias mensagens" ON public.chat_messages
  FOR UPDATE TO authenticated 
  USING (
    receiver_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Policies for chamados
CREATE POLICY "Clientes podem ver próprios chamados" ON public.chamados_internos
  FOR SELECT TO authenticated 
  USING (cliente_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Técnicos podem ver chamados atribuídos" ON public.chamados_internos
  FOR SELECT TO authenticated
  USING (
    tecnico_id IN (
      SELECT t.id FROM public.tecnicos t 
      JOIN public.profiles p ON t.profile_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Coordenadores podem gerenciar todos chamados" ON public.chamados_internos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND tipo = 'coordenador'
    )
  );

CREATE POLICY "Clientes podem criar chamados" ON public.chamados_internos
  FOR INSERT TO authenticated 
  WITH CHECK (cliente_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chamados_updated_at
  BEFORE UPDATE ON public.chamados_internos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para decrementar vagas ao agendar
CREATE OR REPLACE FUNCTION public.decrement_vagas()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.treinamentos 
  SET vagas_disponiveis = vagas_disponiveis - 1 
  WHERE id = NEW.treinamento_id AND vagas_disponiveis > 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_agendamento_insert
  AFTER INSERT ON public.agendamentos_treinamento
  FOR EACH ROW EXECUTE FUNCTION public.decrement_vagas();

-- Trigger para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();