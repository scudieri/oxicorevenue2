# Oxicore Revenue — Guia do Banco de Dados

## Estrutura das Tabelas

### Como funciona no NocoDB / Supabase

```
periodos  ──┬── metas_mensais
            ├── dias_uteis_trabalhados
            ├── investimento_marketing
            ├── leads
            ├── reunioes ──── pessoas (sdr + closer)
            └── vendas   ──── pessoas (closer)
```

---

## Tabelas (o que preencher)

### `periodos` — Criado uma vez por mês
| Campo | Tipo | Exemplo |
|---|---|---|
| nome | texto | FEV 2026 |
| mes | número | 2 |
| ano | número | 2026 |
| data_inicio | data | 2026-02-01 |
| data_fim | data | 2026-02-28 |
| ativo | sim/não | sim |

---

### `pessoas` — Cadastro fixo (closers e SDRs)
| Campo | Tipo | Exemplo |
|---|---|---|
| nome | texto | Bruno |
| papel | opção | closer / sdr / ambos |
| avatar_url | texto | (URL da foto) |
| ativo | sim/não | sim |

---

### `metas_mensais` — Preencher no início do mês
| Campo | Tipo | Exemplo |
|---|---|---|
| periodo_id | link | FEV 2026 |
| meta_receita | valor | 150000 |
| dias_uteis_mes | número | 20 |
| meta_reunioes | número | 60 |
| meta_vendas | número | 12 |
| ticket_meta | valor | 12500 |

---

### `dias_uteis_trabalhados` — Preencher todo dia útil
| Campo | Tipo | Exemplo |
|---|---|---|
| periodo_id | link | FEV 2026 |
| data | data | 2026-02-03 |

> Dica no NocoDB: crie um botão ou formulário simples para dar "check-in" do dia.

---

### `investimento_marketing` — Preencher conforme lança verba
| Campo | Tipo | Exemplo |
|---|---|---|
| periodo_id | link | FEV 2026 |
| data_lancamento | data | 2026-02-01 |
| valor | valor | 15000 |
| canal | texto | Meta Ads |
| descricao | texto | Campanha Topo |

---

### `leads` — Preencher conforme chegam leads
| Campo | Tipo | Exemplo |
|---|---|---|
| periodo_id | link | FEV 2026 |
| data_entrada | data | 2026-02-03 |
| quantidade | número | 47 |
| origem | texto | Instagram |

> Pode lançar diário ou semanal — é acumulativo.

---

### `reunioes` — Preencher a cada reunião marcada pelo SDR
| Campo | Tipo | Exemplo |
|---|---|---|
| periodo_id | link | FEV 2026 |
| sdr_id | link | Daniel |
| closer_id | link | Bruno |
| data_agendamento | data | 2026-02-03 |
| data_reuniao | data | 2026-02-05 |
| status | opção | marcada → show / no_show / remarcada |
| observacao | texto | Cliente é CEO de startup |

**Fluxo do status:**
```
marcada  →  show (aconteceu)
         →  no_show (não apareceu)
         →  remarcada (adiou)
         →  cancelada
```

---

### `vendas` — Preencher a cada fechamento
| Campo | Tipo | Exemplo |
|---|---|---|
| periodo_id | link | FEV 2026 |
| closer_id | link | Bruno |
| reuniao_id | link | (opcional, link com a reunião) |
| data_venda | data | 2026-02-07 |
| valor | valor | 14900 |
| status | opção | confirmado / na_rua / cancelado |
| cliente_nome | texto | Empresa XPTO |

**Status de venda:**
- `confirmado` — recebeu / contrato assinado
- `na_rua` — proposta aceita, aguardando pagamento
- `cancelado` — não concretizou

---

## Views (leitura automática, não precisa preencher)

| View | O que mostra |
|---|---|
| `v_funil_por_periodo` | Funil completo: leads → vendas + investimento |
| `v_kpis_por_periodo` | CPL, CPC, CPM, CPR, CPV, ROAS, Ticket Médio, Pacing |
| `v_closer_por_periodo` | Receita + taxa de conversão por closer |
| `v_sdr_por_periodo` | Shows, no-shows, marcadas por SDR |

---

## Configuração no Supabase

1. Acesse **SQL Editor** no painel do Supabase
2. Cole o conteúdo de `database_schema.sql`
3. Execute (Run)
4. Vá em **Table Editor** para preencher os dados
5. Use **Views** para consultar os KPIs

## Configuração no NocoDB

1. Crie um novo projeto e conecte ao Supabase (ou use SQLite local)
2. Importe as tabelas via **SQL** na aba de configuração
3. Configure as **Relations** entre as tabelas (já estão no schema com FK)
4. As views aparecem automaticamente como tabelas somente leitura
5. Crie **Forms** para facilitar o preenchimento diário

---

## Fluxo diário recomendado

```
Manhã:
  ✅ Adicionar dia útil em dias_uteis_trabalhados
  ✅ Atualizar leads do dia anterior

Durante o dia:
  ✅ SDR registra reunião ao marcar (status: marcada)
  ✅ SDR atualiza status após a reunião (show/no_show)

Ao fechar venda:
  ✅ Closer registra em vendas (status: na_rua)
  ✅ Atualizar para confirmado após pagamento

Início do mês:
  ✅ Criar novo período em periodos
  ✅ Definir metas em metas_mensais
  ✅ Lançar investimento de marketing previsto
```
