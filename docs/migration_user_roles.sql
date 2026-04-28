-- ============================================================
-- MIGRATION: cria tabela user_roles e cadastra admins
-- Rodar no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS user_roles (
  email TEXT PRIMARY KEY,
  nome  TEXT,
  role  TEXT NOT NULL CHECK (role IN ('admin','closer','sdr','spectator')),
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Admin principal
INSERT INTO user_roles (email, nome, role) VALUES
  ('paulogabriel.scudieri@v4company.com', 'Paulo Scudieri', 'admin'),
  ('daniel.canquerino@v4company.com',     'Daniel Canquerino', 'admin'),
  ('bruno@v4company.com',                 'Bruno',          'closer'),
  ('luisfelipe@v4company.com',            'Luís Felipe',    'closer'),
  ('joaogabriel@v4company.com',           'João Gabriel',   'sdr')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, nome = EXCLUDED.nome;
