---
title: PDF para JPG
description: Converta páginas de PDF em imagens JPG com qualidade ajustável. PDFs de uma página são baixados diretamente; PDFs de várias páginas são exportados como ZIP.
---

# PDF para JPG

Converte cada página de um PDF em uma imagem JPG. Documentos de uma página são baixados como um arquivo `.jpg` independente. PDFs de várias páginas geram um arquivo ZIP com um JPG por página.

## Como Funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela. A ferramenta exibe o nome do arquivo, o tamanho e o número de páginas.
2. Ajuste o controle deslizante de **Qualidade** para definir a compressão do JPG.
3. Clique em **Converter** para iniciar o processamento.
4. O resultado é baixado automaticamente: um único JPG para PDFs de uma página ou um arquivo ZIP para documentos de várias páginas.

## Opções

- **Qualidade**: um controle deslizante de 0% a 100% (padrão 90%). Valores mais altos produzem imagens mais nítidas, com arquivos maiores. Valores mais baixos comprimem de forma mais agressiva.

Internamente, as páginas são renderizadas em escala 2x, então a resolução de saída é o dobro das dimensões da página do PDF. Uma página padrão em tamanho Carta gera uma imagem de cerca de 1.224 x 1.584 pixels.

## Formato de Saída

- **Página única**: `filename.jpg`
- **Várias páginas**: `filename_jpgs.zip` contendo `page_1.jpg`, `page_2.jpg` etc.

## Casos de Uso

- Gerar miniaturas de pré-visualização para um sistema de gerenciamento de documentos.
- Compartilhar uma página de um relatório em um chat ou e-mail que não aceita PDF.
- Criar recursos de imagem a partir de diagramas ou ilustrações em PDF.
- Arquivar documentos digitalizados como imagens individuais.

## Dicas

- Para uma saída sem perdas, use o [PDF para PNG](./pdf-to-png).
- Uma qualidade entre 80 e 90% oferece um bom equilíbrio entre tamanho do arquivo e fidelidade visual.
- Se você precisar de um formato específico por página, considere o [Construtor de fluxo de trabalho PDF](./pdf-workflow), que tem um nó de saída PDF para Imagens.

## Ferramentas Relacionadas

- [PDF para PNG](./pdf-to-png)
- [PDF para WebP](./pdf-to-webp)
- [PDF para BMP](./pdf-to-bmp)
- [PDF para TIFF](./pdf-to-tiff)
