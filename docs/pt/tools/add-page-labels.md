---
title: Adicionar rótulos de página
description: Adicione rótulos de página ao PDF com algarismos romanos, prefixos de letras, numeração personalizada e várias regras por documento.
---

# Adicionar rótulos de página

Os rótulos de página controlam como os números de página aparecem nos leitores de PDF (o número mostrado na barra de ferramentas, não impresso na página). Esta ferramenta permite atribuir esquemas de rotulagem diferentes a intervalos de páginas diferentes: algarismos romanos para as páginas iniciais, números decimais para o corpo, apêndices com letras e muito mais.

## Como Funciona

1. Envie seu arquivo PDF.
2. O painel de opções aparece com uma regra de rótulo por padrão.
3. Configure cada regra com um intervalo de páginas, estilo, prefixo opcional e valor inicial.
4. Clique em **Adicionar Regra** para criar regras adicionais para outras seções.
5. Clique em **Adicionar rótulos de página** para aplicar todas as regras e baixar o resultado.

## Opções

Cada regra de rótulo tem estas configurações:

- **Intervalo de Páginas**: as páginas às quais a regra se aplica. Deixe vazio para todas as páginas. Aceita intervalos como `1-4`, `7`, `odd` ou `1-9,30-40`.
- **Estilo do Rótulo**: Arábico decimal, Romano minúsculo (i, ii, iii), Romano maiúsculo (I, II, III), Letras minúsculas (a, b, c), Letras maiúsculas (A, B, C) ou Sem rótulo (somente prefixo).
- **Prefixo do Rótulo**: texto opcional adicionado antes de cada rótulo, como "A-" para criar rótulos como A-1, A-2, A-3.
- **Valor Inicial**: o número a partir do qual a contagem começa. O padrão é 1. Defina como 0 para numeração começando em zero.
- **Continuar a numeração entre intervalos separados**: ative quando uma regra abranger páginas não contíguas (como `1-9,30-40` ou `odd`) e você quiser que a numeração continue em sequência.
- **Remover rótulos de página existentes**: marcado por padrão. Apaga quaisquer rótulos anteriores antes de aplicar as novas regras.

## Recursos

- Várias regras de rótulo por documento para esquemas de numeração complexos
- Seis estilos de rótulo que cobrem todos os sistemas de numeração padrão
- Suporte a prefixo personalizado para rotulagem por seção
- Suporte a intervalos separados com numeração progressiva
- Opção de manter ou remover os rótulos existentes

## Casos de Uso

- Definir rótulos em algarismos romanos (i, ii, iii) para o prefácio de um livro e rótulos decimais para o texto principal
- Rotular as páginas de apêndice com prefixos de letras como "A-1", "A-2", "B-1", "B-2"
- Corrigir os rótulos de página em um documento digitalizado em que os números físicos das páginas não correspondem à ordem das páginas do PDF
- Adicionar numeração iniciada em zero para documentos técnicos

## Dicas

- Os rótulos de página são metadados que os leitores de PDF exibem na barra de navegação. Eles não são impressos na página. Para números visíveis, use [Números de página](./page-numbers).
- Esta ferramenta exige que o CoherentPDF (CPDF) esteja configurado nas suas Configurações de WASM. Se não estiver, você será solicitado a configurá-lo.

## Ferramentas Relacionadas

- [Números de página](./page-numbers)
- [Numeração Bates](./bates-numbering)
- [Editar marcadores](./bookmark)
