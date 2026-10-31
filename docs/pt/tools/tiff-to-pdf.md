---
title: TIFF para PDF
description: Converta imagens TIFF de uma ou várias páginas para o formato PDF no seu navegador, com suporte completo a páginas.
---

# TIFF para PDF

Converta arquivos TIFF em PDF, incluindo TIFFs de várias páginas. Cada página (ou "IFD") de um arquivo TIFF vira uma página separada no PDF de saída. Isso é especialmente útil para documentos digitalizados, faxes e imagens médicas, que costumam ser armazenados como TIFFs de várias páginas.

## Formatos suportados

| Formato | Extensões       |
| :------ | :-------------- |
| TIFF    | `.tiff`, `.tif` |

## Como funciona

1. Clique na área de envio ou arraste e solte seus arquivos TIFF.
2. Revise a lista de arquivos e gerencie-a conforme necessário.
3. Clique em **Converter para PDF**. O resultado é baixado como `from_tiff.pdf`.

A ferramenta decodifica cada arquivo TIFF usando um decodificador TIFF em JavaScript, extraindo os dados brutos de pixels RGBA de cada página. Cada página é renderizada em um canvas, exportada como PNG e incorporada ao PDF. As dimensões das páginas correspondem às das páginas originais do TIFF.

## Opções

Esta ferramenta não expõe configurações adicionais de qualidade. As imagens são incorporadas em sua resolução nativa.

## Casos de uso

- Converter documentos de fax de várias páginas (TIFF-F) em um formato PDF mais portátil
- Transformar arquivos de documentos digitalizados armazenados como TIFF em PDFs pesquisáveis (combine depois com a ferramenta de OCR)
- Processar arquivos de imagem médica (lâminas de patologia, exportações de radiologia) que usam TIFF
- Converter arquivos TIFF de GIS ou imagens de satélite em documentos compartilháveis

## Dicas

- TIFFs de várias páginas são totalmente suportados. Um TIFF de 10 páginas gera um PDF de 10 páginas. Você não precisa dividir o TIFF antes.
- Arquivos TIFF muito grandes (centenas de megabytes) podem demorar mais para processar, pois o arquivo inteiro precisa ser decodificado na memória do navegador.
- Se você precisa de OCR no PDF resultante, passe-o pela ferramenta [OCR para PDF](./ocr-pdf) após a conversão.

## Ferramentas relacionadas

- [Imagem para PDF](./image-to-pdf)
- [BMP para PDF](./bmp-to-pdf)
- [JPG para PDF](./jpg-to-pdf)
