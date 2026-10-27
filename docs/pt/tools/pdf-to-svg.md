---
title: PDF para SVG
description: Converta páginas de PDF em gráficos vetoriais SVG escaláveis. Preserva texto e formas como caminhos vetoriais para escala infinita.
---

# PDF para SVG

Converte cada página de um PDF em um arquivo SVG (Scalable Vector Graphics). Ao contrário dos formatos raster, o SVG preserva caminhos vetoriais, texto e formas, de modo que a saída pode ser ampliada a qualquer tamanho sem pixelização. Usa o PyMuPDF.

## Como Funciona

1. Envie um ou mais PDFs clicando na área de soltar ou arrastando arquivos para ela. Você pode adicionar vários arquivos e gerenciá-los individualmente.
2. Clique em **Converter** para processar todos os arquivos enviados.
3. Conversões de um único arquivo com uma única página são baixadas como um `.svg` independente. Todo o resto é baixado como um arquivo ZIP.

## Opções

Esta ferramenta não tem opções configuráveis. Cada página é convertida em SVG usando a exportação vetorial nativa do PyMuPDF.

## Formato de Saída

- **Um arquivo, uma página**: `filename.svg`
- **Um arquivo, várias páginas**: `filename_svg.zip` contendo `page_1.svg`, `page_2.svg` etc.
- **Vários arquivos**: `pdf_to_svg.zip` com os arquivos organizados pelo nome do documento de origem.

## Casos de Uso

- Extrair diagramas vetoriais, gráficos ou ilustrações de relatórios em PDF para usar em páginas web.
- Editar o conteúdo de páginas de PDF em um editor vetorial como o Inkscape ou o Illustrator.
- Incorporar pré-visualizações escaláveis de páginas em aplicativos web responsivos.
- Extrair logotipos ou gráficos de folhetos em PDF preservando bordas nítidas.

## Dicas

- O SVG funciona melhor com PDFs que contêm conteúdo vetorial. Documentos digitalizados ou PDFs com muitas imagens geram arquivos SVG grandes, com dados raster incorporados.
- Para saída raster de PDFs com muitas imagens, use [PDF para PNG](./pdf-to-png) ou [PDF para JPG](./pdf-to-jpg).
- Esta ferramenta suporta conversão em lote: envie vários PDFs de uma vez para convertê-los todos em uma única execução.

## Ferramentas Relacionadas

- [PDF para PNG](./pdf-to-png)
- [PDF para JPG](./pdf-to-jpg)
- [PDF para Markdown](./pdf-to-markdown)
