-- Adicionar coluna de vagas padrão nos slots de treinamento
ALTER TABLE public.slots_treinamento
ADD COLUMN vagas_padrao integer NOT NULL DEFAULT 10;

-- Atualizar slots existentes com valor padrão
UPDATE public.slots_treinamento SET vagas_padrao = 10;