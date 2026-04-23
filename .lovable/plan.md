

## Problema

O codigo atual procura "TOTAL SHOW" e pega a linha imediatamente acima (`r - 1`). Porem, entre a linha de subtotais dos SDRs e o "TOTAL SHOW" existe uma linha intermediaria (como "CONNECT" ou uma linha em branco), entao `r - 1` retorna uma linha vazia `["",""," "]`.

Da planilha do usuario, os subtotais individuais ficam assim:
- Linha subtotal: `10 | 4 | 13 | 1 | 1 | 2 | 6 | 1`
- (linha CONNECT ou vazia)
- TOTAL SHOW 11
- TOTAL NO SHOW 6
- TOTAL MARCADAS 19
- TOTAL REMARCADAS 2

Os valores individuais (Daniel: 13 Marcadas, Marcelo: 6 Marcadas) so existem na linha de subtotal, nao nas linhas TOTAL combinadas.

## Solucao

Alterar a funcao `getSDRTotals` para, ao encontrar "TOTAL SHOW", buscar **para tras** (r-1, r-2, r-3...) ate encontrar uma linha que tenha dados numericos nas colunas dos SDRs, em vez de assumir que e sempre `r - 1`.

### Detalhes tecnicos

Na funcao `getSDRTotals` em `src/pages/Index.tsx` (linhas 118-152):

1. Manter a busca por "TOTAL SHOW" como ancora
2. Ao encontrar, iterar de `r-1` ate `r-5` procurando a primeira linha que tenha valor numerico > 0 nos indices esperados (2-5 para Daniel, 7-10 para Marcelo)
3. Extrair os dados dessa linha

```text
Logica:
  encontrar "TOTAL SHOW" na linha r
  para i de 1 ate 5:
    checar data[r - i]
    se alguma coluna (2..5 ou 7..10) tem valor > 0:
      usar essa linha como subtotal
      break
```

Isso resolve o problema independente de quantas linhas intermediarias existam entre o subtotal e os TOTAIs.

