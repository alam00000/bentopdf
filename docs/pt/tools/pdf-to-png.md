---
title: PDF para PNG
description: Converta páginas de PDF em imagens PNG sem perdas, com escala ajustável. Ideal para capturas de tela de alta qualidade e fundos transparentes.
---

# PDF para PNG

Converte cada página de um PDF em uma imagem PNG. O PNG usa compressão sem perdas, então a saída preserva todos os detalhes da página original. PDFs de uma página são baixados como um arquivo `.png`; PDFs de várias páginas geram um ZIP.

## Como Funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela.
2. Ajuste o controle deslizante de **Escala** para definir a resolução de saída.
3. Clique em **Converter** para iniciar o processamento.
4. Um único PNG ou um arquivo ZIP é baixado automaticamente.

## Opções

- **Escala**: varia de 1.0x a 3.0x (padrão 2.0x). Em 2.0x, uma página padrão em tamanho Carta é renderizada com cerca de 1.224 x 1.584 pixels. Escalas maiores produzem imagens maiores e mais nítidas, ao custo de tamanho de arquivo e tempo de processamento.

## Formato de Saída

- **Página única**: `filename.png`
- **Várias páginas**: `filename_pngs.zip` contendo `page_1.png`, `page_2.png` etc.

## Casos de Uso

- Capturar imagens de alta fidelidade de páginas de PDF para apresentações.
- Extrair gráficos ou diagramas que precisam de bordas nítidas e sem artefatos de compressão.
- Preparar recursos para web design a partir de protótipos em PDF.
- Criar imagens de página sem perdas para pré-processamento de OCR.

## Dicas

- Os arquivos PNG são bem maiores que os JPG. Se o tamanho do arquivo importa mais que a qualidade perfeita, use [PDF para JPG](./pdf-to-jpg) ou [PDF para WebP](./pdf-to-webp).
- Na escala 1.0x, a saída corresponde à resolução nativa do PDF. Use 3.0x para exportações com qualidade de impressão.

## Ferramentas Relacionadas

- [PDF para JPG](./pdf-to-jpg)
- [PDF para WebP](./pdf-to-webp)
- [PDF para SVG](./pdf-to-svg)
