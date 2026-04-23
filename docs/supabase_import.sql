-- ============================================================
--  OXICORE REVENUE — Import Supabase
--  Gerado em: 23/04/2026
--  Dados: Abril 2026
-- ============================================================

-- ── 1. PIPELINE (deals) ─────────────────────────────────────
DROP TABLE IF EXISTS pipeline;
CREATE TABLE pipeline (
  id              SERIAL PRIMARY KEY,
  cliente         TEXT          NOT NULL,
  valor           NUMERIC(14,2),
  status          TEXT          CHECK (status IN ('Fechado','Proposta','Negativou','Stand by')),
  temperatura     TEXT          CHECK (temperatura IN ('Quente','Morno','Frio')),
  data_lead       TEXT,
  canal           TEXT,
  produto         TEXT          CHECK (produto IN ('ONE TIME','Ass. Booking')),
  closer          TEXT,
  sdr             TEXT,
  data_assinatura DATE,
  periodo         TEXT          DEFAULT 'ABR 2026',
  criado_em       TIMESTAMPTZ   DEFAULT NOW()
);

-- ── 2. SDR DIÁRIO ────────────────────────────────────────────
DROP TABLE IF EXISTS sdr_diario;
CREATE TABLE sdr_diario (
  id          SERIAL PRIMARY KEY,
  data        DATE          NOT NULL UNIQUE,
  dia_semana  TEXT,
  show        INTEGER       DEFAULT 0,
  no_show     INTEGER       DEFAULT 0,
  marcadas    INTEGER       DEFAULT 0,
  remarcada   INTEGER       DEFAULT 0,
  obs         TEXT,
  periodo     TEXT          DEFAULT 'ABR 2026',
  criado_em   TIMESTAMPTZ   DEFAULT NOW()
);

-- ── 3. CONFIG DO MÊS ─────────────────────────────────────────
DROP TABLE IF EXISTS config_mes;
CREATE TABLE config_mes (
  id                  SERIAL PRIMARY KEY,
  periodo             TEXT    UNIQUE NOT NULL,
  meta_total          NUMERIC(14,2),
  meta_onetime        NUMERIC(14,2),
  meta_mrr            NUMERIC(14,2),
  investimento        NUMERIC(14,2),
  canal_aquisicao     TEXT,
  dias_uteis_mes      INTEGER,
  dias_uteis_hoje     INTEGER,
  criado_em           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INSERTS
-- ============================================================

-- Config do mês
INSERT INTO config_mes (periodo, meta_total, meta_onetime, meta_mrr, investimento, canal_aquisicao, dias_uteis_mes, dias_uteis_hoje)
VALUES ('ABR 2026', 235000, 180000, 55000, 100000, 'Leadbroker', 22, 17);

-- Pipeline — 35 deals
INSERT INTO pipeline (cliente, valor, status, temperatura, data_lead, canal, produto, closer, sdr, data_assinatura) VALUES
('Foton',                    12364.00,  'Fechado',  'Quente', 'Março', 'LeadBroker',         'ONE TIME',    'Bruno',       'Daniel',       '2026-04-06'),
('Vie Douce',                3301.01,   'Fechado',  'Quente', 'Abril', 'LeadBroker',         'Ass. Booking','João',        'Daniel',       '2026-04-03'),
('Vie Douce',                5479.92,   'Fechado',  'Quente', 'Abril', 'LeadBroker',         'ONE TIME',    'João',        'Daniel',       '2026-04-07'),
('Atlas',                    14050.00,  'Fechado',  'Quente', 'Abril', 'LeadBroker',         'ONE TIME',    'Bruno',       'Daniel',       '2026-04-10'),
('Home Interiores',          17984.00,  'Fechado',  'Quente', 'Abril', 'LeadBroker',         'ONE TIME',    'João',        'Daniel',       '2026-04-15'),
('Ergon Vision',             2799.00,   'Fechado',  'Quente', 'Abril', 'LeadBroker',         'ONE TIME',    'João',        'João',         '2026-04-14'),
('Ergon Vision',             3961.21,   'Fechado',  'Quente', 'Abril', 'LeadBroker',         'Ass. Booking','João',        'João',         '2026-04-14'),
('Tornearia do Veinho',      3159.82,   'Fechado',  'Quente', 'Abril', 'LeadBroker',         'Ass. Booking','Bruno',       'Bruno',        '2026-04-16'),
('ROTA MAQ',                 3565.09,   'Fechado',  'Quente', 'Março', 'LeadBroker',         'Ass. Booking','Bruno',       'João',         NULL),
('Arkan',                    20000.00,  'Proposta', 'Quente', 'Abril', 'LeadBroker',         'ONE TIME',    'João',        NULL,           NULL),
('MELK',                     NULL,      'Proposta', 'Quente', 'Abril', 'LeadBroker',         'Ass. Booking','Bruno',       'João',         NULL),
('Essence Tercerização',     NULL,      'Proposta', 'Quente', 'Abril', 'LeadBroker',         'Ass. Booking','Bruno',       'João',         NULL),
('La ensenada',              45750.00,  'Proposta', 'Morno',  'Março', 'Evento',             'ONE TIME',    'Luis Felipe', 'Luis Felipe',  NULL),
('Indusbello',               64633.80,  'Proposta', 'Morno',  'Março', 'Evento',             'ONE TIME',    'Luis Felipe', 'Luis Felipe',  NULL),
('Hyleflex',                 18000.00,  'Proposta', 'Morno',  'Abril', 'Recuperação Broker', 'ONE TIME',    'João',        NULL,           NULL),
('Joy',                      25000.00,  'Proposta', 'Morno',  'Abril', 'Recuperação Broker', 'Ass. Booking','João',        NULL,           NULL),
('Arrue',                    14050.00,  'Proposta', 'Morno',  'Abril', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,           NULL),
('Clinica Amare',            3300.00,   'Proposta', 'Morno',  'Abril', 'LeadBroker',         'Ass. Booking','Bruno',       'João',         NULL),
('Confido',                  NULL,      'Proposta', 'Morno',  'Abril', 'LeadBroker',         'Ass. Booking','Bruno',       'João',         NULL),
('Erione',                   NULL,      'Proposta', 'Frio',   'Abril', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,           NULL),
('Silvio Brandão',           18000.00,  'Proposta', 'Frio',   'Abril', 'LeadBroker',         'ONE TIME',    'João',        NULL,           NULL),
('Advan',                    21000.00,  'Proposta', 'Frio',   'Abril', 'LeadBroker',         'Ass. Booking','João',        NULL,           NULL),
('Ótica Visão',              38113.08,  'Negativou','Frio',   'Abril', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,           NULL),
('Faz Beauty',               23604.00,  'Proposta', 'Frio',   'Abril', 'LeadBroker',         'ONE TIME',    'Bruno',       'Bruno',        NULL),
('Arteled Iluminação',       NULL,      'Proposta', 'Frio',   'Abril', 'LeadBroker',         'Ass. Booking','Bruno',       'Bruno',        NULL),
('VegasOn',                  18000.00,  'Negativou','Frio',   'Abril', 'Recuperação Broker', 'ONE TIME',    'João',        NULL,           NULL),
('Buffet Primavera',         14050.00,  'Negativou','Frio',   'Abril', 'LeadBroker',         'ONE TIME',    'Bruno',       'Daniel',       NULL),
('MariasBobinas',            14050.00,  'Negativou','Frio',   'Abril', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,           NULL),
('Mendes Pereira e Taveira', 36000.00,  'Negativou','Frio',   'Abril', 'LeadBroker',         'ONE TIME',    'João',        NULL,           NULL),
('Mendes Pereira e Taveira', 4000.00,   'Negativou','Frio',   'Abril', 'LeadBroker',         'Ass. Booking','João',        NULL,           NULL),
('LuiOfalmologia',           18546.00,  'Negativou','Frio',   'Março', 'Recomendação',       'ONE TIME',    'Bruno',       NULL,           NULL),
('Radar de Licitações',      3000.00,   'Negativou','Frio',   'Abril', 'LeadBroker',         'ONE TIME',    'João',        NULL,           NULL),
('Dr. Rafael',               3900.00,   'Negativou','Frio',   'Abril', 'LeadBroker',         'Ass. Booking','Bruno',       NULL,           NULL),
('Dra. Silvia Odete',        28100.00,  'Stand by', 'Morno',  'Março', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,           NULL),
('Tenext',                   5018.00,   'Stand by', 'Frio',   'Março', 'Box',                'Ass. Booking','Bruno',       'Marcelo',      NULL);

-- SDR Diário
INSERT INTO sdr_diario (data, dia_semana, show, no_show, marcadas, remarcada) VALUES
('2026-04-01', 'Qua', 8, 0, 0, 0),
('2026-04-02', 'Qui', 0, 1, 4, 0),
('2026-04-03', 'Sex', 0, 0, 0, 0),
('2026-04-06', 'Seg', 3, 1, 5, 1),
('2026-04-07', 'Ter', 3, 0, 1, 2),
('2026-04-08', 'Qua', 2, 0, 1, 2),
('2026-04-09', 'Qui', 3, 0, 4, 0),
('2026-04-10', 'Sex', 2, 1, 2, 0),
('2026-04-13', 'Seg', 1, 1, 4, 0),
('2026-04-14', 'Ter', 1, 0, 3, 0),
('2026-04-15', 'Qua', 2, 0, 6, 0),
('2026-04-16', 'Qui', 2, 1, 1, 0),
('2026-04-17', 'Sex', 1, 2, 3, 0),
('2026-04-20', 'Seg', 0, 1, 2, 2),
('2026-04-21', 'Ter', 1, 1, 4, 0),
('2026-04-22', 'Qua', 3, 2, NULL, NULL),
('2026-04-23', 'Qui', 1, NULL, NULL, NULL);

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

CREATE OR REPLACE VIEW v_pipeline_resumo AS
SELECT
  status,
  COUNT(*)                            AS qtd,
  ROUND(SUM(valor)::NUMERIC, 2)       AS valor_total,
  ROUND(AVG(valor)::NUMERIC, 2)       AS ticket_medio
FROM pipeline
WHERE valor IS NOT NULL
GROUP BY status
ORDER BY CASE status
  WHEN 'Fechado'  THEN 1
  WHEN 'Proposta' THEN 2
  WHEN 'Stand by' THEN 3
  WHEN 'Negativou'THEN 4
END;

CREATE OR REPLACE VIEW v_closer_resumo AS
SELECT
  closer,
  COUNT(*) FILTER (WHERE status = 'Fechado')   AS vendas,
  SUM(valor) FILTER (WHERE status = 'Fechado') AS receita_fechada,
  SUM(valor) FILTER (WHERE status = 'Proposta')AS pipeline_aberto,
  COUNT(*) FILTER (WHERE status = 'Proposta')  AS propostas_ativas
FROM pipeline
GROUP BY closer
ORDER BY receita_fechada DESC NULLS LAST;

CREATE OR REPLACE VIEW v_sdr_totais AS
SELECT
  SUM(show)     AS total_show,
  SUM(no_show)  AS total_no_show,
  SUM(marcadas) AS total_marcadas,
  SUM(remarcada)AS total_remarcadas,
  ROUND(SUM(show)::NUMERIC / NULLIF(SUM(show) + SUM(no_show), 0) * 100, 1) AS taxa_show_pct
FROM sdr_diario;
