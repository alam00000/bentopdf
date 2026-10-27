---
title: Remover páginas em branco
description: Detecte e remova automaticamente páginas em branco ou quase em branco do seu PDF, com sensibilidade ajustável.
---

# Remover páginas em branco

Analise seu PDF em busca de páginas em branco ou quase em branco e remova-as automaticamente. A ferramenta renderiza cada página e analisa o conteúdo dos pixels para determinar se está em branco, e depois deixa você confirmar quais páginas remover antes de processar.

## Como funciona

1. Envie seu arquivo PDF.
2. Ajuste o controle deslizante de **Sensibilidade** para definir o rigor com que "em branco" é definido.
3. Clique em **Detectar Páginas em Branco** para analisar o documento.
4. A ferramenta mostra miniaturas das páginas em branco detectadas para você revisar.
5. Confirme a seleção e baixe o PDF limpo, sem as páginas em branco.

## Opções

- **Sensibilidade**: um controle deslizante de 0% a 100% (padrão 80%). Valores mais altos são mais rigorosos e só marcam páginas completamente ou quase brancas. Valores mais baixos são mais permissivos e pegam páginas com conteúdo mínimo, como um único ponto ou uma marca d'água discreta.

## Recursos

- Análise em nível de pixel de cada página para detectar conteúdo em branco
- Controle deslizante de sensibilidade ajustável para refinar a detecção
- Pré-visualização em miniatura das páginas em branco detectadas para verificação manual
- Preserva todas as páginas que não estão em branco exatamente como estão
- Lida com documentos de qualquer tamanho ou número de páginas
- Indicação de progresso durante a análise

## Casos de uso

- Limpar documentos digitalizados em que o scanner capturou versos vazios de originais de face única
- Remover páginas separadoras de lotes de documentos digitalizados em massa
- Remover páginas em branco inseridas por sistemas de gerenciamento de documentos
- Limpar PDFs exportados de processadores de texto que às vezes incluem páginas em branco no final
- Reduzir o tamanho do arquivo removendo páginas vazias desnecessárias

## Dicas

- Comece com a sensibilidade padrão de 80% e ajuste a partir daí. Se a ferramenta deixar passar páginas que parecem em branco para você, diminua a sensibilidade. Se ela marcar páginas com conteúdo leve que você quer manter, aumente.
- A ferramenta renderiza cada página para analisar o conteúdo, então o tempo de processamento cresce com o número de páginas. Em documentos muito grandes, espere uma pequena espera.
- Revise as páginas em branco detectadas na pré-visualização em miniatura antes de confirmar a remoção. Páginas com cabeçalhos, rodapés ou marcas d'água discretos podem ser marcadas, dependendo da sensibilidade.

## Ferramentas relacionadas

- [Cortar PDF](./crop-pdf)
- [Editor de PDF](./edit-pdf)
- [Números de Página](./page-numbers)
