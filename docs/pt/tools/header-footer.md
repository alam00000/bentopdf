---
title: Cabeçalho e rodapé
description: Adicione texto personalizável de cabeçalho e rodapé às páginas do PDF com variáveis dinâmicas de número de página.
---

# Cabeçalho e rodapé

Adicione texto em seis posições das páginas do PDF: cabeçalho à esquerda, ao centro e à direita, e rodapé à esquerda, ao centro e à direita. A ferramenta suporta variáveis dinâmicas para o número da página e o total de páginas, para que você crie modelos como "Página 3 de 10" que se atualizam automaticamente em cada página.

## Como funciona

1. Envie seu arquivo PDF.
2. O painel de opções aparece com os controles de formatação e seis campos de texto.
3. Digite o texto desejado em qualquer uma das posições de cabeçalho/rodapé.
4. Use os marcadores `{page}` e `{total}` para numeração dinâmica de páginas.
5. Ajuste o tamanho e a cor da fonte e, se quiser, limite a um intervalo de páginas específico.
6. Clique em **Adicionar Cabeçalho e Rodapé** para processar e baixar.

## Opções

- **Intervalo de páginas**: Limite, se quiser, quais páginas recebem cabeçalho e rodapé. Deixe vazio para aplicar a todas as páginas. Formato: "1-3, 5" (intervalos separados por vírgula).
- **Tamanho da fonte**: Entre 6 e 24 pontos. O padrão é 10.
- **Cor da fonte**: Escolha qualquer cor com o seletor de cores.
- **Cabeçalho esquerda / centro / direita**: Campos de texto para o topo de cada página.
- **Rodapé esquerda / centro / direita**: Campos de texto para a parte inferior de cada página.

## Recursos

- Seis posições de texto independentes por página
- Variável dinâmica `{page}` que insere o número da página atual
- Variável dinâmica `{total}` que insere o total de páginas
- Filtro de intervalo de páginas para atingir páginas específicas
- Tamanho e cor da fonte personalizáveis
- Fonte Helvetica para um resultado limpo e profissional

## Casos de uso

- Adicionar "Página {page} de {total}" ao centro do rodapé de um relatório
- Colocar o nome da empresa no cabeçalho à esquerda e a data do documento no cabeçalho à direita
- Adicionar avisos de confidencialidade ao rodapé de documentos jurídicos
- Carimbar números de revisão do documento em intervalos de páginas específicos

## Dicas

- Combine `{page}` e `{total}` em um único campo para formatos como "Página {page} de {total}" ou "{page}/{total}".
- Você pode deixar a maioria dos campos vazios e preencher apenas as posições de que precisa. Campos vazios são simplesmente ignorados.
- Para cabeçalhos mais complexos com imagens ou logotipos, considere usar a ferramenta [Adicionar Marca d'Água](./add-watermark) posicionada no topo da página.

## Ferramentas relacionadas

- [Números de Página](./page-numbers)
- [Adicionar Marca d'Água](./add-watermark)
- [Numeração Bates](./bates-numbering)
