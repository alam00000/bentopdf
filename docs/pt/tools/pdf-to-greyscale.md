---
title: PDF para tons de cinza
description: Converta um PDF colorido em uma versão em tons de cinza (preto e branco). Gera um novo PDF sem nenhuma cor em todas as páginas.
---

# PDF para tons de cinza

Converte um PDF colorido em uma versão em tons de cinza. Cada página é renderizada, dessaturada e reincorporada como imagem JPEG em um novo PDF. A saída preserva as dimensões originais das páginas.

## Como Funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela.
2. Clique em **Converter** para processar o arquivo.
3. Um novo `greyscale.pdf` é baixado com todas as páginas convertidas para preto e branco.

Nos bastidores, cada página é renderizada em escala 2x, os dados de pixels passam por um filtro de tons de cinza e depois são recodificados como JPEG com 90% de qualidade e colocados em um novo documento PDF.

## Opções

Esta ferramenta não tem opções configuráveis. A conversão para tons de cinza usa uma fórmula de luminância padrão e a qualidade do JPEG é fixa em 90%.

## Formato de Saída

- Um único arquivo `greyscale.pdf` com todas as páginas como imagens JPEG em tons de cinza.

## Casos de Uso

- Preparar documentos para impressão em preto e branco e economizar tinta colorida.
- Atender a exigências de envio de documentos jurídicos ou governamentais que determinam tons de cinza.
- Reduzir o tamanho de PDFs com muitas cores (imagens JPEG em tons de cinza são menores que as coloridas).
- Criar um estilo visual consistente em documentos com páginas coloridas e P&B misturadas.

## Dicas

- Como cada página é rasterizada e reincorporada como JPEG, a saída é baseada em imagens. O texto do PDF original deixa de poder ser selecionado ou pesquisado. Se você precisar de texto pesquisável depois, passe o resultado pela ferramenta de OCR.
- Para ter mais controle sobre os ajustes de cor (brilho, contraste, saturação), veja a ferramenta Ajustar Cores ou o nó Tons de Cinza no [Construtor de fluxo de trabalho PDF](./pdf-workflow).

## Ferramentas Relacionadas

- [PDF para JPG](./pdf-to-jpg)
- [PDF para PNG](./pdf-to-png)
- [Construtor de fluxo de trabalho PDF](./pdf-workflow)
