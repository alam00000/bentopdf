---
title: PDF para BMP
description: Converta páginas de PDF em imagens BMP sem compressão. Útil para sistemas legados e fluxos de impressão que exigem bitmap.
---

# PDF para BMP

Converte cada página de um PDF em uma imagem BMP (Bitmap). BMP é um formato sem compressão, então a saída é perfeita em pixels, sem perda de qualidade, mas os arquivos são grandes.

## Como Funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela.
2. Clique em **Converter** para processar o arquivo.
3. Um único arquivo `.bmp` ou um arquivo ZIP é baixado automaticamente.

## Opções

Esta ferramenta não tem opções configuráveis. As páginas são renderizadas em escala fixa de 2x, produzindo imagens com aproximadamente o dobro das dimensões nativas da página do PDF.

## Formato de Saída

- **Página única**: `filename.bmp`
- **Várias páginas**: `filename_bmps.zip` contendo `page_1.bmp`, `page_2.bmp` etc.

## Casos de Uso

- Alimentar sistemas ou equipamentos legados que só aceitam BMP com páginas de PDF.
- Preparar imagens sem compressão para fluxos de impressão específicos.
- Usar a saída em bitmap como entrada para ferramentas de processamento de imagem que exigem dados de pixels brutos.

## Dicas

- Os arquivos BMP são muito grandes porque armazenam dados de pixels brutos sem compressão. Para a maioria dos usos, o [PDF para PNG](./pdf-to-png) oferece qualidade sem perdas com arquivos bem menores.
- Se o sistema de destino aceitar PNG ou TIFF, prefira esses formatos para economizar espaço em disco.

## Ferramentas Relacionadas

- [PDF para PNG](./pdf-to-png)
- [PDF para TIFF](./pdf-to-tiff)
- [PDF para JPG](./pdf-to-jpg)
