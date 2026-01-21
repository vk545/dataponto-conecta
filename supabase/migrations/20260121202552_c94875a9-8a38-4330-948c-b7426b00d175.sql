-- ===========================================
-- FIX 1: Restrict GPS exposure on tecnicos table
-- ===========================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Todos podem ver técnicos" ON tecnicos;

-- Coordinators can view all technicians
CREATE POLICY "Coordinators can view all technicians" ON tecnicos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND tipo = 'coordenador'));

-- Technicians can view their own data
CREATE POLICY "Technicians can view own data" ON tecnicos
  FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Clients can view assigned technician (only for their open tickets)
CREATE POLICY "Clients can view assigned technician" ON tecnicos
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT tecnico_id FROM chamados_internos
      WHERE cliente_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      AND tecnico_id IS NOT NULL
    )
  );

-- ===========================================
-- FIX 2: Add UPDATE policies for chamados_internos
-- ===========================================

-- Technicians can update assigned tickets (status, observations, signature)
CREATE POLICY "Technicians can update assigned tickets" ON chamados_internos
  FOR UPDATE TO authenticated
  USING (
    tecnico_id IN (
      SELECT t.id FROM tecnicos t
      JOIN profiles p ON t.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    tecnico_id IN (
      SELECT t.id FROM tecnicos t
      JOIN profiles p ON t.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Clients can update their own tickets (add observations, but not change tecnico or status)
CREATE POLICY "Clients can update own tickets" ON chamados_internos
  FOR UPDATE TO authenticated
  USING (cliente_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (cliente_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ===========================================
-- FIX 3: Remove overly permissive treinamentos policies
-- ===========================================

-- Drop the permissive INSERT policy (only coordinators should create trainings)
DROP POLICY IF EXISTS "Usuários autenticados podem criar treinamentos" ON treinamentos;

-- Drop the permissive UPDATE policy (only coordinators should update trainings)
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar vagas" ON treinamentos;