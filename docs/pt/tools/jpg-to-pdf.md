---
title: JPG para PDF
description: Converta uma ou mais imagens JPG, JPEG e JPEG 2000 em um único arquivo PDF diretamente no navegador.
---

# JPG para PDF

Transforme imagens JPG em um PDF limpo. Envie um arquivo ou vários JPGs de uma vez: cada imagem se torna uma página em tamanho total no documento de saída.

## Formatos suportados

| Formato   | Extensões       |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Como funciona

1. Clique na área de upload ou arraste e solte seus arquivos JPG. A seleção múltipla é suportada.
2. Revise os arquivos enviados. Use o ícone da lixeira para remover arquivos individuais ou clique em **Adicionar mais arquivos** para acrescentar à lista.
3. Selecione um nível de **Qualidade do PDF**.
4. Clique em **Converter para PDF**. A ferramenta comprime as imagens conforme a qualidade escolhida, converte-as com o mecanismo PyMuPDF e baixa `from_jpgs.pdf`.

## Opções

A **Qualidade do PDF** ajusta a compressão aplicada a cada imagem antes de ela ser incorporada ao PDF:

- **Alta qualidade**: preserva o máximo de detalhes. Use para fotografia ou impressão.
- **Qualidade média** (padrão): um bom equilíbrio entre nitidez e tamanho de arquivo.
- **Baixa qualidade**: compressão agressiva para o menor resultado possível.

## Casos de uso

- Converter documentos digitalizados salvos como JPG em um único PDF para envio
- Reunir fotos de produtos em um catálogo para clientes
- Transformar imagens médicas ou de satélite em JPEG 2000 em um PDF portátil
- Criar um álbum de fotos imprimível a partir de exportações da câmera

## Dicas

- Arquivos JPEG 2000 (`.jp2`, `.jpx`) são totalmente suportados, não apenas o JPEG padrão. Isso é útil para imagens médicas e dados geoespaciais.
- Se seus JPGs vêm da câmera de um celular, a qualidade Média costuma gerar um arquivo 40-60% menor que a Alta, sem diferença visível na tela.

## Ferramentas relacionadas

- [Imagens para PDF](./image-to-pdf)
- [PNG para PDF](./png-to-pdf)
- [WebP para PDF](./webp-to-pdf)
