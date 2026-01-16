-- Garantir que políticas em chamados_internos sejam PERMISSIVE (as antigas estavam RESTRICTIVE e bloqueavam o coordenador)
DROP POLICY IF EXISTS "Clientes podem criar chamados" ON public.chamados_internos;
DROP POLICY IF EXISTS "Clientes podem ver próprios chamados" ON public.chamados_internos;
DROP POLICY IF EXISTS "Coordenadores podem gerenciar todos chamados" ON public.chamados_internos;
DROP POLICY IF EXISTS "Técnicos podem ver chamados atribuídos" ON public.chamados_internos;

-- Coordenador (Valdemar) pode ver/criar/atualizar/excluir qualquer chamado
CREATE POLICY "Coordenadores podem gerenciar todos chamados"
ON public.chamados_internos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.tipo = 'coordenador'::user_type
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.tipo = 'coordenador'::user_type
  )
);

-- Cliente cria chamado somente em seu próprio profile_id
CREATE POLICY "Clientes podem criar chamados"
ON public.chamados_internos
FOR INSERT
TO authenticated
WITH CHECK (
  cliente_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Cliente vê apenas os próprios chamados
CREATE POLICY "Clientes podem ver próprios chamados"
ON public.chamados_internos
FOR SELECT
TO authenticated
USING (
  cliente_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Técnico vê apenas chamados atribuídos ao seu registro em tecnicos
CREATE POLICY "Técnicos podem ver chamados atribuídos"
ON public.chamados_internos
FOR SELECT
TO authenticated
USING (
  tecnico_id IN (
    SELECT t.id
    FROM tecnicos t
    JOIN profiles p ON p.id = t.profile_id
    WHERE p.user_id = auth.uid()
  )
);
