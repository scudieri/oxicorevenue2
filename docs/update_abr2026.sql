-- ============================================================
-- UPDATE COMPLETO ABR 2026 — Oxicore Revenue
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- 1. CONFIG MÊS
-- ============================================================
DELETE FROM config_mes WHERE periodo = 'ABR 2026';

INSERT INTO config_mes (periodo, meta_total, meta_onetime, meta_mrr, investimento, canal_aquisicao, dias_uteis_mes, dias_uteis_hoje)
VALUES ('ABR 2026', 235000, 180000, 55000, 100000, 'LeadBroker', 22, 19);


-- 2. PIPELINE — limpa e re-insere os deals conhecidos
-- ============================================================
DELETE FROM pipeline WHERE periodo = 'ABR 2026';

INSERT INTO pipeline (cliente, valor, status, temperatura, data_lead, canal, produto, closer, sdr, data_assinatura, periodo) VALUES

-- FECHADOS
('Foton',                   12364.00,  'Fechado',   'Quente', '2026-03-01', 'LeadBroker',         'ONE TIME',    'Bruno',       'Daniel',        '2026-04-06', 'ABR 2026'),
('Vie Douce',               3301.01,   'Fechado',   'Quente', '2026-03-01', 'LeadBroker',         'Ass. Booking','João Gabriel', 'Daniel',        NULL,         'ABR 2026'),
('Vie Douce',               5479.92,   'Fechado',   'Quente', '2026-03-01', 'LeadBroker',         'ONE TIME',    'João Gabriel', 'Daniel',        NULL,         'ABR 2026'),
('Atlas',                   14050.00,  'Fechado',   'Quente', '2026-04-01', 'LeadBroker',         'ONE TIME',    'Bruno',       'Daniel',        '2026-04-10', 'ABR 2026'),
('Home Interiores',         17984.00,  'Fechado',   'Quente', '2026-04-01', 'LeadBroker',         'ONE TIME',    'João Gabriel', 'Daniel',        NULL,         'ABR 2026'),
('Ergon Vision',            2799.00,   'Fechado',   'Quente', '2026-04-01', 'LeadBroker',         'ONE TIME',    'João Gabriel', 'João Gabriel',  NULL,         'ABR 2026'),
('Ergon Vision',            3961.21,   'Fechado',   'Quente', '2026-04-01', 'LeadBroker',         'Ass. Booking','João Gabriel', 'João Gabriel',  NULL,         'ABR 2026'),
('Tornearia do Veinho',     3159.82,   'Fechado',   'Quente', '2026-04-01', 'LeadBroker',         'Ass. Booking','Bruno',       'Bruno',         '2026-04-16', 'ABR 2026'),
('ROTA MAQ',                3565.09,   'Fechado',   'Quente', '2026-03-01', 'LeadBroker',         'Ass. Booking','Bruno',       'João Gabriel',  NULL,         'ABR 2026'),
('AssessMan',               4182.18,   'Fechado',   'Quente', '2026-03-01', 'LeadBroker',         'Ass. Booking','Bruno',       'João Gabriel',  NULL,         'ABR 2026'),

-- PROPOSTA
('Faz Beauty',              23604.00,  'Proposta',  'Quente', '2026-04-01', 'LeadBroker',         'ONE TIME',    'Bruno',       'Bruno',         NULL,         'ABR 2026'),
('Essence Tercerização',    4500.00,   'Proposta',  'Morno',  '2026-04-01', 'LeadBroker',         'Ass. Booking','Bruno',       'João Gabriel',  NULL,         'ABR 2026'),
('La Ensenada',             45750.00,  'Proposta',  'Morno',  '2026-03-01', 'OutBound',           'ONE TIME',    'Luís Felipe', 'Luís Felipe',   NULL,         'ABR 2026'),
('Indusbello',              64633.80,  'Proposta',  'Morno',  '2026-03-01', 'OutBound',           'ONE TIME',    'Luís Felipe', 'Luís Felipe',   NULL,         'ABR 2026'),
('Joy',                     25000.00,  'Proposta',  'Morno',  '2026-04-01', 'Recomendação',       'ONE TIME',    'João Gabriel', NULL,            NULL,         'ABR 2026'),
('Confido',                 4200.00,   'Proposta',  'Morno',  '2026-04-01', 'LeadBroker',         'Ass. Booking','Bruno',       'João Gabriel',  NULL,         'ABR 2026'),
('Dra. Silvia Odete',       28100.00,  'Proposta',  'Morno',  '2026-03-01', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,            NULL,         'ABR 2026'),
('Arkan',                   20000.00,  'Proposta',  'Frio',   '2026-04-01', 'LeadBroker',         'ONE TIME',    'João Gabriel', NULL,            NULL,         'ABR 2026'),
('Hyleflex',                18000.00,  'Proposta',  'Frio',   '2026-04-01', 'Recomendação',       'ONE TIME',    'João Gabriel', NULL,            NULL,         'ABR 2026'),
('MELK',                    5500.00,   'Proposta',  'Frio',   '2026-04-01', 'LeadBroker',         'Ass. Booking','Bruno',       'João Gabriel',  NULL,         'ABR 2026'),
('Arrue',                   14050.00,  'Proposta',  'Frio',   '2026-04-01', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,            NULL,         'ABR 2026'),
('Erione',                  50000.00,  'Proposta',  'Frio',   '2026-04-01', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,            NULL,         'ABR 2026'),
('Silvio Brandão',          18000.00,  'Proposta',  'Frio',   '2026-04-01', 'LeadBroker',         'ONE TIME',    'João Gabriel', NULL,            NULL,         'ABR 2026'),
('Advan',                   3500.00,   'Proposta',  'Frio',   '2026-04-01', 'LeadBroker',         'Ass. Booking','João Gabriel', NULL,            NULL,         'ABR 2026'),

-- NEGATIVOU
('Clinica Amare',           3300.00,   'Negativou', 'Morno',  '2026-04-01', 'LeadBroker',         'Ass. Booking','Bruno',       'João Gabriel',  NULL,         'ABR 2026'),
('Arteled Iluminação',      NULL,      'Negativou', 'Frio',   '2026-04-01', 'LeadBroker',         'Ass. Booking','Bruno',       'Bruno',         NULL,         'ABR 2026'),
('Ótica Visão',             38113.08,  'Negativou', 'Frio',   '2026-04-01', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,            NULL,         'ABR 2026'),
('VegasOn',                 18000.00,  'Negativou', 'Frio',   '2026-04-01', 'Recomendação',       'ONE TIME',    'João Gabriel', NULL,            NULL,         'ABR 2026'),
('Buffet Primavera',        14050.00,  'Negativou', 'Frio',   '2026-04-01', 'LeadBroker',         'ONE TIME',    'Bruno',       'Daniel',        NULL,         'ABR 2026'),
('MariasBobinas',           14050.00,  'Negativou', 'Frio',   '2026-04-01', 'LeadBroker',         'ONE TIME',    'Bruno',       NULL,            NULL,         'ABR 2026'),
('Mendes Pereira e Taveira',36000.00,  'Negativou', 'Frio',   '2026-04-01', 'LeadBroker',         'ONE TIME',    'João Gabriel', NULL,            NULL,         'ABR 2026'),
('Mendes Pereira e Taveira',4000.00,   'Negativou', 'Frio',   '2026-04-01', 'LeadBroker',         'Ass. Booking','João Gabriel', NULL,            NULL,         'ABR 2026'),
('LuiOfalmologia',          18546.00,  'Negativou', 'Frio',   '2026-03-01', 'Recomendação',       'ONE TIME',    'Bruno',       NULL,            NULL,         'ABR 2026'),
('Radar de Licitações',     3000.00,   'Negativou', 'Frio',   '2026-04-01', 'LeadBroker',         'ONE TIME',    'João Gabriel', NULL,            NULL,         'ABR 2026'),
('Dr. Rafael',              3900.00,   'Negativou', 'Frio',   '2026-04-01', 'LeadBroker',         'Ass. Booking','Bruno',       NULL,            NULL,         'ABR 2026'),

-- STAND BY
('Tenext',                  5018.00,   'Stand by',  'Frio',   '2026-03-01', 'OutBound',           'Ass. Booking','Bruno',       'Marcelo',       NULL,         'ABR 2026');


-- 3. SDR DIÁRIO — João Gabriel (abril 2026)
-- ============================================================
DELETE FROM sdr_diario WHERE periodo = 'ABR 2026';

INSERT INTO sdr_diario (data, dia_semana, show, no_show, marcadas, remarcada, periodo) VALUES
('2026-04-01', 'Quarta',   8, 0, 0, 0, 'ABR 2026'),
('2026-04-02', 'Quinta',   0, 1, 4, 0, 'ABR 2026'),
('2026-04-03', 'Sexta',    0, 0, 0, 0, 'ABR 2026'),
('2026-04-06', 'Segunda',  3, 1, 5, 1, 'ABR 2026'),
('2026-04-07', 'Terça',    3, 0, 1, 2, 'ABR 2026'),
('2026-04-08', 'Quarta',   2, 0, 1, 2, 'ABR 2026'),
('2026-04-09', 'Quinta',   3, 0, 4, 0, 'ABR 2026'),
('2026-04-10', 'Sexta',    2, 1, 2, 0, 'ABR 2026'),
('2026-04-13', 'Segunda',  1, 1, 4, 0, 'ABR 2026'),
('2026-04-14', 'Terça',    1, 0, 3, 0, 'ABR 2026'),
('2026-04-15', 'Quarta',   2, 0, 6, 0, 'ABR 2026'),
('2026-04-16', 'Quinta',   2, 1, 1, 0, 'ABR 2026'),
('2026-04-17', 'Sexta',    1, 2, 3, 0, 'ABR 2026'),
('2026-04-20', 'Segunda',  0, 1, 2, 2, 'ABR 2026'),
('2026-04-21', 'Terça',    1, 1, 4, 0, 'ABR 2026'),
('2026-04-22', 'Quarta',   3, 2, 2, 0, 'ABR 2026'),
('2026-04-23', 'Quinta',   1, 0, 2, 0, 'ABR 2026'),
('2026-04-24', 'Sexta',    1, 0, 3, 0, 'ABR 2026'),
('2026-04-27', 'Segunda',  1, 0, 0, 0, 'ABR 2026');
