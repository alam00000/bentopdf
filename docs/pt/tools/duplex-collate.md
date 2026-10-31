---
title: Intercalar digitalização frente e verso
description: Reordene PDFs de digitalização frente e verso que têm as páginas da frente e do verso em blocos separados, colocando-os na ordem correta.
---

# Intercalar digitalização frente e verso

O Intercalar digitalização frente e verso foi pensado para fluxos de digitalização com alimentador automático (ADF) em que um PDF contém dois blocos de páginas:

- todas as frentes primeiro
- todos os versos depois

Em vez de dividir e remontar manualmente, esta ferramenta intercala os dois blocos na ordem natural de leitura: frente1, verso1, frente2, verso2 e assim por diante.

## Como funciona

1. Envie um único PDF criado a partir da digitalização de uma pilha frente e verso.
2. Defina o ponto de divisão onde termina o bloco das frentes.
3. Escolha como tratar o bloco dos versos:
   - **Inverter bloco dos versos** (comum quando a pilha é virada antes de digitalizar os versos)
   - **Manter bloco dos versos como está**
4. Clique em **Intercalar PDF** para baixar o resultado reordenado.

## Opções

- **Detectar divisão automaticamente (metade)**: define o ponto de divisão como `ceil(totalPages / 2)`.
- **Aviso de página ímpar**: avisa quando o total de páginas é ímpar (geralmente indica um erro de digitalização).
- **Confirmação de blocos desiguais**: pede confirmação quando os tamanhos dos blocos de frente e verso são diferentes.
- **Exportação agrupada**: divide a saída intercalada em PDFs separados com base na quantidade de páginas do documento original e baixa tudo como ZIP.

## Comportamento da saída

- **Padrão**: um PDF de saída (um PDF de entrada gera um PDF de saída).
- **Modo agrupado**: a saída é dividida conforme o valor de páginas por documento; se forem produzidos vários grupos, eles são baixados em um único ZIP; caso contrário, um único PDF é baixado.

Se os blocos tiverem tamanhos desiguais, as páginas pareadas são intercaladas primeiro e as páginas restantes sem par são adicionadas ao final.

## Casos de uso comuns

- Restaurar a ordem depois de digitalizar uma pilha de formulários frente e verso em duas passagens.
- Remontar pacotes de frente e verso de scanners de escritório que geram todas as frentes e depois todos os versos.
- Pós-processar digitalizações de arquivo antes de dividi-las em arquivos por documento.

## Dicas

- A maioria dos lotes frente e verso deve ter um número par de páginas.
- Se os versos aparecerem invertidos na saída, alterne entre **Inverter bloco dos versos** e **Manter bloco dos versos como está**.
- Para originais de 2 páginas (frente e verso), use a exportação agrupada com `2` páginas por documento.

## Ferramentas relacionadas

- [Alternar e Misturar Páginas](./alternate-merge)
- [Dividir PDF](./split-pdf)
- [Mesclar PDF](./merge-pdf)
- [Duplicar e Organizar](./organize-pdf)
