-- ============================================================
-- MIGRATION: novos status + temperatura nullable + período flexível
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- 1. Atualizar CHECK constraint do status
ALTER TABLE pipeline DROP CONSTRAINT IF EXISTS pipeline_status_check;
ALTER TABLE pipeline ADD CONSTRAINT pipeline_status_check
  CHECK (status IN ('Fechado','Proposta','Negativou','Stand by','Lead','Sem Contato','Desqualificado','Perdido'));

-- 2. Permitir temperatura nula (lead bruto não tem temperatura)
ALTER TABLE pipeline ALTER COLUMN temperatura DROP NOT NULL;

-- 3. Garantir que data_lead está sempre preenchida (filtros do dashboard usam essa coluna)
UPDATE pipeline SET data_lead = '2026-04-01' WHERE data_lead IS NULL AND periodo = 'ABR 2026';
UPDATE pipeline SET data_lead = '2026-03-01' WHERE data_lead IS NULL AND periodo = 'MAR 2026';

-- 4. Índices para acelerar filtros por data
CREATE INDEX IF NOT EXISTS pipeline_data_lead_idx ON pipeline (data_lead);
CREATE INDEX IF NOT EXISTS sdr_diario_data_idx    ON sdr_diario (data);
