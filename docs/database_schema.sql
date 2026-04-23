-- ============================================================
--  OXICORE REVENUE — Schema de Banco de Dados
--  Compatível com: Supabase (PostgreSQL) e NocoDB
--  Versão: 1.0
-- ============================================================

-- ============================================================
-- 1. PERÍODOS (Meses)
--    Cada mês de operação vira um registro aqui.
-- ============================================================
CREATE TABLE periodos (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(20)  NOT NULL,          -- ex: "FEV 2026"
  mes         INTEGER      NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano         INTEGER      NOT NULL,
  data_inicio DATE         NOT NULL,
  data_fim    DATE         NOT NULL,
  ativo       BOOLEAN      DEFAULT true,
  criado_em   TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(mes, ano)
);

-- ============================================================
-- 2. PESSOAS (Closers + SDRs)
--    Uma tabela só, com papel (role) diferenciando.
-- ============================================================
CREATE TABLE pessoas (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  papel     VARCHAR(10)  NOT NULL CHECK (papel IN ('closer', 'sdr', 'ambos')),
  avatar_url TEXT,
  ativo     BOOLEAN DEFAULT true
);

-- ============================================================
-- 3. METAS MENSAIS (por período)
--    Uma linha por período. Preenche no começo do mês.
-- ============================================================
CREATE TABLE metas_mensais (
  id               SERIAL PRIMARY KEY,
  periodo_id       INTEGER REFERENCES periodos(id) ON DELETE CASCADE,
  meta_receita     NUMERIC(14,2) NOT NULL DEFAULT 0,  -- Meta do Mês (R$)
  dias_uteis_mes   INTEGER       NOT NULL DEFAULT 22, -- Dias úteis no mês
  meta_reunioes    INTEGER       DEFAULT 0,           -- Meta reuniões marcadas
  meta_vendas      INTEGER       DEFAULT 0,           -- Meta de vendas
  ticket_meta      NUMERIC(14,2) DEFAULT 0,           -- Ticket médio meta
  UNIQUE(periodo_id)
);

-- ============================================================
-- 4. DIAS ÚTEIS TRABALHADOS (atualizar diariamente)
--    Controla o progresso de pacing.
-- ============================================================
CREATE TABLE dias_uteis_trabalhados (
  id         SERIAL PRIMARY KEY,
  periodo_id INTEGER REFERENCES periodos(id) ON DELETE CASCADE,
  data       DATE    NOT NULL,
  UNIQUE(periodo_id, data)
);

-- ============================================================
-- 5. INVESTIMENTO DE MARKETING (por período)
--    Dados da verba de mídia paga.
-- ============================================================
CREATE TABLE investimento_marketing (
  id              SERIAL PRIMARY KEY,
  periodo_id      INTEGER      REFERENCES periodos(id) ON DELETE CASCADE,
  data_lancamento DATE         NOT NULL DEFAULT CURRENT_DATE,
  valor           NUMERIC(14,2) NOT NULL,
  descricao       TEXT,                           -- ex: "Meta Ads - Campanha X"
  canal           VARCHAR(50),                   -- ex: "Meta Ads", "Google Ads"
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. LEADS (por período)
--    Total de leads gerados. Pode ser um acumulado ou por lote.
-- ============================================================
CREATE TABLE leads (
  id              SERIAL PRIMARY KEY,
  periodo_id      INTEGER      REFERENCES periodos(id) ON DELETE CASCADE,
  data_entrada    DATE         NOT NULL DEFAULT CURRENT_DATE,
  quantidade      INTEGER      NOT NULL DEFAULT 1,
  origem          VARCHAR(100),                  -- ex: "Instagram", "Google"
  criado_em       TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- 7. REUNIÕES (agenda SDR → Closer)
--    Cada reunião marcada pelos SDRs vira um registro.
-- ============================================================
CREATE TABLE reunioes (
  id              SERIAL PRIMARY KEY,
  periodo_id      INTEGER     REFERENCES periodos(id) ON DELETE CASCADE,
  sdr_id          INTEGER     REFERENCES pessoas(id),
  closer_id       INTEGER     REFERENCES pessoas(id),
  data_agendamento DATE       NOT NULL DEFAULT CURRENT_DATE,
  data_reuniao    DATE        NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'marcada'
                  CHECK (status IN ('marcada', 'show', 'no_show', 'remarcada', 'cancelada')),
  observacao      TEXT,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. VENDAS (fechamentos)
--    Cada venda fechada pelos closers.
-- ============================================================
CREATE TABLE vendas (
  id              SERIAL PRIMARY KEY,
  periodo_id      INTEGER      REFERENCES periodos(id) ON DELETE CASCADE,
  closer_id       INTEGER      REFERENCES pessoas(id),
  reuniao_id      INTEGER      REFERENCES reunioes(id),  -- opcional (link com reunião)
  data_venda      DATE         NOT NULL DEFAULT CURRENT_DATE,
  valor           NUMERIC(14,2) NOT NULL,
  status          VARCHAR(20)  NOT NULL DEFAULT 'confirmado'
                  CHECK (status IN ('confirmado', 'na_rua', 'cancelado')),
  cliente_nome    VARCHAR(200),
  observacao      TEXT,
  criado_em       TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- VIEWS ÚTEIS (geradas automaticamente)
-- ============================================================

-- View: Resumo do funil de conversão por período
CREATE OR REPLACE VIEW v_funil_por_periodo AS
SELECT
  p.id                                       AS periodo_id,
  p.nome                                     AS periodo,
  COALESCE(SUM(l.quantidade), 0)             AS total_leads,
  COUNT(r.id) FILTER (WHERE r.status != 'cancelada')              AS reunioes_marcadas,
  COUNT(r.id) FILTER (WHERE r.status = 'show')                    AS reunioes_acontecidas,
  COUNT(r.id) FILTER (WHERE r.status = 'no_show')                 AS no_shows,
  COUNT(r.id) FILTER (WHERE r.status = 'remarcada')               AS remarcadas,
  COUNT(v.id) FILTER (WHERE v.status IN ('confirmado','na_rua'))  AS vendas_total,
  COALESCE(SUM(v.valor) FILTER (WHERE v.status = 'confirmado'), 0) AS receita_confirmada,
  COALESCE(SUM(v.valor) FILTER (WHERE v.status = 'na_rua'), 0)    AS receita_na_rua,
  COALESCE(SUM(im.valor), 0)                                       AS investimento_total
FROM periodos p
LEFT JOIN leads          l  ON l.periodo_id  = p.id
LEFT JOIN reunioes       r  ON r.periodo_id  = p.id
LEFT JOIN vendas         v  ON v.periodo_id  = p.id
LEFT JOIN investimento_marketing im ON im.periodo_id = p.id
GROUP BY p.id, p.nome;

-- View: KPIs calculados por período
CREATE OR REPLACE VIEW v_kpis_por_periodo AS
SELECT
  f.*,
  mm.meta_receita,
  mm.dias_uteis_mes,
  COUNT(dut.id)                                        AS dias_uteis_hoje,
  -- Custo por Lead
  CASE WHEN f.total_leads > 0
    THEN ROUND(f.investimento_total / f.total_leads, 2) ELSE 0 END AS cpl,
  -- Custo por Contato (reunião marcada = contato qualificado)
  CASE WHEN f.reunioes_marcadas > 0
    THEN ROUND(f.investimento_total / f.reunioes_marcadas, 2) ELSE 0 END AS cpc,
  -- Custo por Reunião Marcada
  CASE WHEN f.reunioes_marcadas > 0
    THEN ROUND(f.investimento_total / f.reunioes_marcadas, 2) ELSE 0 END AS cpm,
  -- Custo por Reunião Realizada
  CASE WHEN f.reunioes_acontecidas > 0
    THEN ROUND(f.investimento_total / f.reunioes_acontecidas, 2) ELSE 0 END AS cpr,
  -- Custo por Venda
  CASE WHEN f.vendas_total > 0
    THEN ROUND(f.investimento_total / f.vendas_total, 2) ELSE 0 END AS cpv,
  -- Ticket Médio
  CASE WHEN f.vendas_total > 0
    THEN ROUND(f.receita_confirmada / f.vendas_total, 2) ELSE 0 END AS ticket_medio,
  -- ROAS
  CASE WHEN f.investimento_total > 0
    THEN ROUND(f.receita_confirmada / f.investimento_total, 2) ELSE 0 END AS roas,
  -- Progresso Real (%)
  CASE WHEN mm.meta_receita > 0
    THEN ROUND((f.receita_confirmada / mm.meta_receita) * 100, 1) ELSE 0 END AS progresso_real_pct,
  -- Progresso Ideal (%) baseado em pacing
  CASE WHEN mm.meta_receita > 0 AND mm.dias_uteis_mes > 0
    THEN ROUND(
      ((mm.meta_receita / mm.dias_uteis_mes) * COUNT(dut.id) / mm.meta_receita) * 100, 1
    ) ELSE 0 END AS progresso_ideal_pct
FROM v_funil_por_periodo f
LEFT JOIN metas_mensais mm ON mm.periodo_id = f.periodo_id
LEFT JOIN dias_uteis_trabalhados dut ON dut.periodo_id = f.periodo_id
GROUP BY
  f.periodo_id, f.periodo, f.total_leads, f.reunioes_marcadas,
  f.reunioes_acontecidas, f.no_shows, f.remarcadas, f.vendas_total,
  f.receita_confirmada, f.receita_na_rua, f.investimento_total,
  mm.meta_receita, mm.dias_uteis_mes;

-- View: Performance por Closer
CREATE OR REPLACE VIEW v_closer_por_periodo AS
SELECT
  p.id   AS periodo_id,
  p.nome AS periodo,
  ps.id  AS closer_id,
  ps.nome AS closer_nome,
  COUNT(v.id) FILTER (WHERE v.status IN ('confirmado','na_rua'))  AS vendas,
  COALESCE(SUM(v.valor) FILTER (WHERE v.status = 'confirmado'), 0) AS receita_confirmada,
  COALESCE(SUM(v.valor) FILTER (WHERE v.status = 'na_rua'), 0)    AS receita_na_rua,
  COUNT(r.id) FILTER (WHERE r.status = 'show')                    AS reunioes_show,
  COUNT(r.id) FILTER (WHERE r.status = 'no_show')                 AS reunioes_no_show,
  CASE WHEN COUNT(r.id) FILTER (WHERE r.status IN ('show','no_show')) > 0
    THEN ROUND(
      COUNT(r.id) FILTER (WHERE r.status = 'show')::NUMERIC /
      COUNT(r.id) FILTER (WHERE r.status IN ('show','no_show')) * 100, 1
    ) ELSE 0 END AS taxa_show_pct,
  CASE WHEN COUNT(r.id) FILTER (WHERE r.status = 'show') > 0
    THEN ROUND(
      COUNT(v.id) FILTER (WHERE v.status IN ('confirmado','na_rua'))::NUMERIC /
      COUNT(r.id) FILTER (WHERE r.status = 'show') * 100, 1
    ) ELSE 0 END AS conversao_pct
FROM periodos p
CROSS JOIN pessoas ps
LEFT JOIN reunioes r ON r.periodo_id = p.id AND r.closer_id = ps.id
LEFT JOIN vendas   v ON v.periodo_id = p.id AND v.closer_id = ps.id
WHERE ps.papel IN ('closer', 'ambos')
GROUP BY p.id, p.nome, ps.id, ps.nome;

-- View: Performance por SDR
CREATE OR REPLACE VIEW v_sdr_por_periodo AS
SELECT
  p.id   AS periodo_id,
  p.nome AS periodo,
  ps.id  AS sdr_id,
  ps.nome AS sdr_nome,
  COUNT(r.id)                                                      AS total_agendamentos,
  COUNT(r.id) FILTER (WHERE r.status = 'show')                    AS shows,
  COUNT(r.id) FILTER (WHERE r.status = 'no_show')                 AS no_shows,
  COUNT(r.id) FILTER (WHERE r.status = 'remarcada')               AS remarcadas,
  COUNT(r.id) FILTER (WHERE r.status = 'cancelada')               AS canceladas,
  COUNT(r.id) FILTER (WHERE r.status = 'marcada')                 AS marcadas_pendentes
FROM periodos p
CROSS JOIN pessoas ps
LEFT JOIN reunioes r ON r.periodo_id = p.id AND r.sdr_id = ps.id
WHERE ps.papel IN ('sdr', 'ambos')
GROUP BY p.id, p.nome, ps.id, ps.nome;

-- ============================================================
-- DADOS INICIAIS (seed)
-- ============================================================

-- Período inicial: FEV 2026
INSERT INTO periodos (nome, mes, ano, data_inicio, data_fim)
VALUES ('FEV 2026', 2, 2026, '2026-02-01', '2026-02-28');

-- Closers
INSERT INTO pessoas (nome, papel) VALUES
  ('Bruno',  'closer'),
  ('João',   'closer');

-- SDRs
INSERT INTO pessoas (nome, papel) VALUES
  ('Daniel',  'sdr'),
  ('Marcelo', 'sdr');

-- Meta do período FEV 2026 (ajuste o valor)
INSERT INTO metas_mensais (periodo_id, meta_receita, dias_uteis_mes, meta_reunioes, meta_vendas, ticket_meta)
VALUES (1, 0, 20, 0, 0, 0);
