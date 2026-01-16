-- Remove a política restrictive e recria como permissive
DROP POLICY IF EXISTS "Coordenadores podem gerenciar todos chamados" ON public.chamados_internos;

CREATE POLICY "Coordenadores podem gerenciar todos chamados" 
ON public.chamados_internos 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.tipo = 'coordenador'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.tipo = 'coordenador'
  )
);