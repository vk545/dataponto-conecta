-- Permitir que usuários autenticados criem treinamentos (quando agendam)
CREATE POLICY "Usuários autenticados podem criar treinamentos"
ON public.treinamentos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir que usuários autenticados atualizem vagas (decrementar)
CREATE POLICY "Usuários autenticados podem atualizar vagas"
ON public.treinamentos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);