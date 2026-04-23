-- ============================================================
--  OXICORE — Novas tabelas (rodar no SQL Editor do Supabase)
-- ============================================================

-- 1. Roles de usuários (admin define quem é quem)
CREATE TABLE IF NOT EXISTS user_roles (
  email   TEXT PRIMARY KEY,
  role    TEXT NOT NULL CHECK (role IN ('admin','closer','sdr','spectator')),
  nome    TEXT NOT NULL
);

-- Seed inicial de roles
INSERT INTO user_roles (email, role, nome) VALUES
  ('paulogabriel.scudieri@v4company.com', 'admin',   'Paulo Gabriel'),
  ('bruno@v4company.com',                 'closer',  'Bruno'),
  ('luisfelipe@v4company.com',            'closer',  'Luís Felipe'),
  ('joaogabriel@v4company.com',           'sdr',     'João Gabriel')
ON CONFLICT (email) DO NOTHING;

-- 2. Atividades (log de interações SDR/Closer por deal)
CREATE TABLE IF NOT EXISTS atividades (
  id         SERIAL PRIMARY KEY,
  deal_id    INTEGER REFERENCES pipeline(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL CHECK (tipo IN ('sdr','closer')),
  usuario    TEXT NOT NULL,
  status     TEXT NOT NULL,
  -- SDR:    show | no_show | marcada | remarcada
  -- Closer: balizar_cliente | apresentacao_proposta | venda_realizada | venda_nao_realizada
  data       DATE DEFAULT CURRENT_DATE,
  obs        TEXT,
  periodo    TEXT DEFAULT 'ABR 2026',
  criado_em  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS — liberar tudo (dashboard interno)
ALTER TABLE user_roles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_user_roles" ON user_roles;
DROP POLICY IF EXISTS "allow_all_atividades" ON atividades;

CREATE POLICY "allow_all_user_roles" ON user_roles  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_atividades" ON atividades  FOR ALL USING (true) WITH CHECK (true);

-- 4. RLS nas tabelas existentes (libera de vez)
ALTER TABLE pipeline   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdr_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_mes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_pipeline"   ON pipeline;
DROP POLICY IF EXISTS "allow_all_sdr"        ON sdr_diario;
DROP POLICY IF EXISTS "allow_all_config"     ON config_mes;

CREATE POLICY "allow_all_pipeline"   ON pipeline   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_sdr"        ON sdr_diario FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_config"     ON config_mes FOR ALL USING (true) WITH CHECK (true);
