-- ============================================================
-- MIGRATION COMPLETA: pipeline real ABR 2026 + funil snapshot
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- 1. Atualizar CHECK constraint com novos status
ALTER TABLE pipeline DROP CONSTRAINT IF EXISTS pipeline_status_check;
ALTER TABLE pipeline ADD CONSTRAINT pipeline_status_check
  CHECK (status IN (
    'Fechado','Proposta','Negativou','Stand by',
    'Lead','Sem Contato','Em Contato',
    'Reunião Agendada','Reunião Acontecida','No Show',
    'Desqualificado','Perdido'
  ));

-- 2. Tabela funil_periodo (snapshot manual)
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

INSERT INTO funil_periodo (periodo, total_leads, marcados, acontecidos, vendas, receita, investimento)
VALUES ('ABR 2026', 75, 47, 34, 8, 70846.23, 52236.80)
ON CONFLICT (periodo) DO UPDATE SET
  total_leads=EXCLUDED.total_leads, marcados=EXCLUDED.marcados,
  acontecidos=EXCLUDED.acontecidos, vendas=EXCLUDED.vendas,
  receita=EXCLUDED.receita, investimento=EXCLUDED.investimento,
  atualizado_em=now();

-- 3. Pipeline real ABR 2026 — limpa e recarrega com os 82 leads do broker
DELETE FROM pipeline WHERE periodo = 'ABR 2026';

INSERT INTO pipeline (cliente, valor, status, temperatura, data_lead, canal, closer, sdr, periodo) VALUES
-- DESQUALIFICADO
('Mentoria M PARK',                  534.00,   'Desqualificado', NULL,    '2026-04-01', 'LeadBroker', NULL,    'Marcelo', 'ABR 2026'),
('Chute Boxe',                       270.00,   'Desqualificado', NULL,    '2026-04-02', 'LeadBroker', NULL,    'Marcelo', 'ABR 2026'),
('Dal Santo Odontologia',            374.40,   'Desqualificado', NULL,    '2026-04-06', 'LeadBroker', NULL,    'Marcelo', 'ABR 2026'),
('Alma Colors',                      374.40,   'Desqualificado', NULL,    '2026-04-08', 'LeadBroker', 'Bruno', 'Marcelo', 'ABR 2026'),
('Clínica Lumina Santé',             468.00,   'Desqualificado', NULL,    '2026-04-09', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Eletrotec Geradores',              608.00,   'Desqualificado', NULL,    '2026-04-13', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Carlos Calixto Medicina Capilar',  889.20,   'Desqualificado', NULL,    '2026-04-13', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Budel Transportes',                944.00,   'Desqualificado', NULL,    '2026-04-13', 'LeadBroker', NULL,    'Daniel',  'ABR 2026'),
('Maksell Refrigeração',             1234.80,  'Desqualificado', NULL,    '2026-04-14', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Clinica Concon',                   486.00,   'Desqualificado', NULL,    '2026-04-14', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Rede POC International Education', 1094.40,  'Desqualificado', NULL,    '2026-04-15', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Mafeireira Mafrense',              1306.80,  'Desqualificado', NULL,    '2026-04-15', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('OdontoNeufert',                    907.20,   'Desqualificado', NULL,    '2026-04-15', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Dona Castanha',                    486.00,   'Desqualificado', NULL,    '2026-04-20', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Nutroeste Nutrição Animal',        2052.00,  'Desqualificado', NULL,    '2026-04-21', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Mariah Cosméticos',                1216.80,  'Desqualificado', NULL,    '2026-04-22', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Clinica Odontológica',             468.00,   'Desqualificado', NULL,    '2026-04-23', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Taybetec',                         374.40,   'Desqualificado', NULL,    '2026-04-24', 'LeadBroker', NULL,    'João',    'ABR 2026'),

-- REUNIÃO AGENDADA
('D''Spa Odontologia',               374.40,   'Reunião Agendada',NULL,   '2026-04-22', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Futurefit',                        468.00,   'Reunião Agendada',NULL,   '2026-04-09', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Alti Odontologia',                 468.00,   'Reunião Agendada',NULL,   '2026-04-13', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Qualigeo Engenharia',              907.20,   'Reunião Agendada','Quente','2026-04-14','LeadBroker','Bruno', 'João',    'ABR 2026'),
('Polo Soldas',                      1094.40,  'Reunião Agendada','Quente','2026-04-16','LeadBroker','Bruno', 'João',    'ABR 2026'),
('Valhalla',                         1076.40,  'Reunião Agendada',NULL,   '2026-04-17', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Laboratório Alvorada',             486.00,   'Reunião Agendada',NULL,   '2026-04-20', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Nuhouse / BOWI',                   374.40,   'Reunião Agendada','Quente','2026-04-22','LeadBroker', NULL,    'João',    'ABR 2026'),
('Itekton Construtora',              889.20,   'Reunião Agendada','Quente','2026-04-24','LeadBroker','Bruno', 'João',    'ABR 2026'),
('SJ Materiais para Construção',     1627.20,  'Reunião Agendada','Quente','2026-04-24','LeadBroker','Bruno', 'João',    'ABR 2026'),

-- EM CONTATO
('Sierra Gardens Imóveis',           374.40,   'Em Contato', NULL,        '2026-04-02', 'LeadBroker', NULL,    'Marcelo', 'ABR 2026'),
('San Saúde',                        994.00,   'Em Contato', NULL,        '2026-04-14', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Clinicor',                         698.00,   'Em Contato', NULL,        '2026-04-15', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Hotel Fazenda',                    1038.00,  'Em Contato', NULL,        '2026-04-16', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('One House Revestimentos',          1076.40,  'Em Contato', NULL,        '2026-04-16', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('FirmeFortFiber',                   280.00,   'Em Contato', NULL,        '2026-04-20', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Tácito Barros Odontologia',        468.00,   'Em Contato', NULL,        '2026-04-20', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Caucaia Fer',                      374.40,   'Em Contato', NULL,        '2026-04-21', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Ortholike',                        468.00,   'Em Contato', NULL,        '2026-04-22', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('EurOÓtica',                        468.00,   'Em Contato', NULL,        '2026-04-22', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('MBrokers Negócios Imobiliários',   889.20,   'Em Contato', NULL,        '2026-04-22', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('EBM Mármores & Acabamentos',       1076.40,  'Em Contato', NULL,        '2026-04-23', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('North Pizza Blumenau',             270.00,   'Em Contato', NULL,        '2026-04-23', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Econtech',                         468.00,   'Em Contato', NULL,        '2026-04-23', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Paris 6 SBC',                      686.00,   'Em Contato', NULL,        '2026-04-23', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Atena',                            1076.40,  'Em Contato', NULL,        '2026-04-26', 'LeadBroker', NULL,    'João',    'ABR 2026'),

-- FECHADO
('Atlas Medicina Regenerativa',      594.00,   'Fechado', 'Quente',       '2026-04-01', 'LeadBroker', 'Bruno', 'Daniel',  'ABR 2026'),
('Home Interiores',                  486.00,   'Fechado', 'Quente',       '2026-04-09', 'LeadBroker', 'João',  'Daniel',  'ABR 2026'),
('Tornearia do Veinho',              522.00,   'Fechado', 'Quente',       '2026-04-09', 'LeadBroker', 'Bruno', 'Daniel',  'ABR 2026'),
('Ergon Vision Systems',             468.00,   'Fechado', 'Quente',       '2026-04-10', 'LeadBroker', 'João',  'Daniel',  'ABR 2026'),
('Rota Maq',                         280.00,   'Fechado', 'Quente',       '2026-04-21', 'LeadBroker', 'Bruno', 'João',    'ABR 2026'),
('AssessMan',                        374.40,   'Fechado', 'Quente',       '2026-04-24', 'LeadBroker', 'Bruno', 'João',    'ABR 2026'),

-- NO SHOW
('Odontotop Goiânia',                1112.40,  'No Show', NULL,           '2026-04-14', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Exclusiva Móveis Planejados',      280.00,   'No Show', 'Morno',        '2026-04-14', 'LeadBroker', 'Bruno', 'João',    'ABR 2026'),
('Plutus',                           889.20,   'No Show', NULL,           '2026-04-15', 'LeadBroker', NULL,    'João',    'ABR 2026'),

-- PERDIDO
('Arkan',                            1094.40,  'Perdido', 'Frio',         '2026-04-02', 'LeadBroker', 'João',  'Marcelo', 'ABR 2026'),
('Ótica Visão',                      468.00,   'Perdido', 'Frio',         '2026-04-09', 'LeadBroker', 'Bruno', 'Daniel',  'ABR 2026'),
('Ari Schiefelbein / Tornipeças',    504.00,   'Perdido', NULL,           '2026-04-14', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Glauco Ramos Advogados',           889.20,   'Perdido', 'Morno',        '2026-04-21', 'LeadBroker', 'Bruno', 'João',    'ABR 2026'),

-- PROPOSTA APRESENTADA
('Empresa MariasBobina',             270.00,   'Proposta', NULL,          '2026-04-06', 'LeadBroker', NULL,    'Daniel',  'ABR 2026'),
('Faz Beauty Business',              374.40,   'Proposta', NULL,          '2026-04-14', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('Clínica Amare',                    374.40,   'Proposta', NULL,          '2026-04-15', 'LeadBroker', NULL,    'João',    'ABR 2026'),
('PopCred',                          1591.20,  'Proposta', 'Quente',      '2026-04-21', 'LeadBroker', 'Bruno', 'João',    'ABR 2026'),

-- REUNIÃO ACONTECIDA
('Tip Top',                          270.00,   'Reunião Acontecida','Morno','2026-04-02','LeadBroker','João',  'Daniel',  'ABR 2026'),
('Intervir / Dr Rafael',             889.20,   'Reunião Acontecida','Frio', '2026-04-02','LeadBroker','Bruno', 'Daniel',  'ABR 2026'),
('Advan Ind. e Com. de Conf.',       889.20,   'Reunião Acontecida','Frio', '2026-04-02','LeadBroker','João',  'Daniel',  'ABR 2026'),
('Madetintas',                       1004.00,  'Reunião Acontecida','Frio', '2026-04-08','LeadBroker','João',  'Daniel',  'ABR 2026'),
('Artled Iluminação',                1076.40,  'Reunião Acontecida','Frio', '2026-04-15','LeadBroker','Bruno', 'João',    'ABR 2026'),
('Aluminium / Confido',              468.00,   'Reunião Acontecida','Morno','2026-04-17','LeadBroker','Bruno', 'João',    'ABR 2026'),
('Essence Terceirização',            1609.20,  'Reunião Acontecida','Morno','2026-04-20','LeadBroker','Bruno', 'João',    'ABR 2026'),
('Curtlo',                           468.00,   'Reunião Acontecida','Quente','2026-04-22','LeadBroker','Bruno', 'João',   'ABR 2026'),

-- SEM CONTATO
('CONE - Centro Oftalmológico do Nordeste', 270.00, 'Sem Contato', NULL, '2026-04-02', 'LeadBroker', NULL, 'Daniel',  'ABR 2026'),
('Clínica Bitar Barreto',            486.00,   'Sem Contato', NULL,      '2026-04-02', 'LeadBroker', NULL, 'Marcelo', 'ABR 2026'),
('Heteronymos',                      320.00,   'Sem Contato', NULL,      '2026-04-09', 'LeadBroker', NULL, 'Daniel',  'ABR 2026'),
('Heteronymos (2)',                  486.00,   'Sem Contato', NULL,      '2026-04-09', 'LeadBroker', NULL, 'Daniel',  'ABR 2026'),
('Global Crossing',                  904.00,   'Sem Contato', NULL,      '2026-04-09', 'LeadBroker', NULL, 'Marcelo', 'ABR 2026'),
('Do Follow',                        504.00,   'Sem Contato', NULL,      '2026-04-14', 'LeadBroker', NULL, 'João',    'ABR 2026'),
('Conect',                           678.00,   'Sem Contato', NULL,      '2026-04-14', 'LeadBroker', NULL, 'João',    'ABR 2026'),
('Academia Parque Esportes',         1627.20,  'Sem Contato', NULL,      '2026-04-17', 'LeadBroker', NULL, 'João',    'ABR 2026'),
('Ampere',                           524.00,   'Sem Contato', NULL,      '2026-04-17', 'LeadBroker', NULL, 'João',    'ABR 2026'),
('Newtec',                           468.00,   'Sem Contato', NULL,      '2026-04-20', 'LeadBroker', NULL, 'João',    'ABR 2026'),
('Engmalls',                         504.00,   'Sem Contato', NULL,      '2026-04-21', 'LeadBroker', NULL, 'João',    'ABR 2026'),
('Kentô Agro',                       998.00,   'Sem Contato', NULL,      '2026-04-26', 'LeadBroker', NULL, 'João',    'ABR 2026'),
('Metafit',                          608.00,   'Sem Contato', NULL,      '2026-04-26', 'LeadBroker', NULL, 'João',    'ABR 2026');
