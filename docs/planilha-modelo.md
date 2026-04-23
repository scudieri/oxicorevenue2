# Modelo de Planilha para o Dashboard

Este projeto usa dados vindos de duas planilhas do Google Sheets:

1. **Main Sheet**: arquivo principal com a aba `FEV 26`
2. **Funnel Sheet**: arquivo separado com a aba `FEV 26`

O dashboard lê automaticamente os dados usando a API do Google Sheets.

---

## 1. Estrutura da Main Sheet (`FEV 26`)

A planilha principal deve conter os seguintes pontos-chave:

- `META DO MÊS` em qualquer célula. O código busca esse texto e lê o valor na célula imediatamente à direita.
- `Dias úteis mês` em qualquer célula. O valor deve estar à direita.
- `Dias úteis hoje` em qualquer célula. O valor deve estar à direita.
- `CPV` em qualquer célula. O valor deve estar à direita.
- `Na Rua` em qualquer célula. O valor deve estar à direita.

### Tabela `METAS`

O código busca uma célula com `METAS` na coluna `M` (13ª coluna). A partir daí, a tabela deve ser montada assim:

- Linha do rótulo `METAS` em `M`
- `Reunião Marcadas` em `M` na linha seguinte
- `Reuniões realizadas` em `M` na linha seguinte
- `Conv %` em `M` na linha seguinte
- `Vendas` em `M` na linha seguinte
- `Ticket` em `M` na linha seguinte
- `Receita` em `M` na linha seguinte
- `TX SHOW` em `M` na linha seguinte
- `Na Rua` deve estar 5 linhas abaixo do `TX SHOW` e seu valor em `N`

As colunas N a R devem conter os valores, por exemplo:

- `N`: Meta
- `O`: João
- `P`: Bruno
- `Q`: Luis F.
- `R`: Total

### Seção SDR

O código precisa encontrar a célula `TOTAL SHOW` na coluna `A`. 

Acima dessa linha, deve existir uma linha de subtotal com as informações do SDR:

- Daniel: colunas `C`, `D`, `E`, `F`
- Marcelo: colunas `H`, `I`, `J`, `K`

O dashboard usa especialmente `Daniel Marcadas` e `Marcelo Marcadas`.

---

## 2. Estrutura da Funnel Sheet (`FEV 26`)

O dashboard busca os dados nesta aba usando o intervalo `B2:O52`.

A planilha de funil deve conter no mínimo os seguintes valores:

- `Investimento` em `C7` (dentro de `B2:O52`)
- `Leads` em `C17` (dentro de `B2:O52`)

O código atual também espera que existam métricas de funnel como `Marcados`, `Acontecidos`, `Vendas` e `Receita`, mas esses valores são complementares e, no modelo mínimo, o importante é garantir `Invest` e `Leads`.

---

## 3. Regras de formatação

- Use valores numéricos normais ou valores formatados em Real (`R$ 1.234,56`).
- O parser aceita números com `.` como separador de milhar e `,` como separador decimal.
- Percentuais podem ser texto como `20%` ou `0.20`.

---

## 4. Arquivos de exemplo

- `docs/planilha-modelo-main.csv`
- `docs/planilha-modelo-funnel.csv`

Importe esses CSVs no Google Sheets e renomeie a aba para `FEV 26`.

---

## 5. Dica de uso

- Crie duas planilhas diferentes no Google Sheets, cada uma com uma aba `FEV 26`.
- Atualize `SHEET_ID` e `FUNNEL_SHEET_ID` em `src/pages/Index.tsx` para os IDs desses arquivos.
- O dashboard ficará automaticamente sincronizado enquanto o intervalo de API estiver correto.
