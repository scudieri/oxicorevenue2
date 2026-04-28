-- ============================================================
-- MIGRATION: tabela funil_periodo (snapshot manual do funil)
-- Rodar no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS funil_periodo (
  periodo        TEXT PRIMARY KEY,
  total_leads    INTEGER,
  marcados       INTEGER,
  acontecidos    INTEGER,
  vendas         INTEGER,
  receita        NUMERIC(14,2),
  investimento   NUMERIC(14,2),
  obs            TEXT,
  atualizado_em  TIMESTAMPTZ DEFAULT now()
);

-- Snapshot ABR 2026 (Funil Completo - Todos os Canais)
INSERT INTO funil_periodo (periodo, total_leads, marcados, acontecidos, vendas, receita, investimento)
VALUES ('ABR 2026', 75, 47, 34, 8, 70846.23, 52236.80)
ON CONFLICT (periodo) DO UPDATE SET
  total_leads   = EXCLUDED.total_leads,
  marcados      = EXCLUDED.marcados,
  acontecidos   = EXCLUDED.acontecidos,
  vendas        = EXCLUDED.vendas,
  receita       = EXCLUDED.receita,
  investimento  = EXCLUDED.investimento,
  atualizado_em = now();
