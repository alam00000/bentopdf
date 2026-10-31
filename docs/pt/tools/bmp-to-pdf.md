---
title: BMP para PDF
description: Converta imagens bitmap BMP para o formato PDF diretamente no navegador, sem enviar nada a nenhum servidor.
---

# BMP para PDF

Converta arquivos Windows Bitmap (BMP) em PDF. O BMP é um formato de imagem sem compressão ainda encontrado em sistemas legados, imagens médicas e scanners industriais. Esta ferramenta os converte em PDF sem precisar instalar nada.

## Formatos Compatíveis

| Formato | Extensões |
| :------ | :-------- |
| BMP     | `.bmp`    |

## Como Funciona

1. Clique na área de envio ou arraste e solte seus arquivos BMP.
2. Revise a lista de arquivos. Adicione mais arquivos ou remova os indesejados.
3. Clique em **Converter para PDF**. A saída é baixada como `from_bmps.pdf`.

Cada BMP é desenhado em um canvas, exportado como PNG e depois incorporado ao PDF usando pdf-lib. O tamanho da página corresponde às dimensões originais da imagem.

## Opções

Esta ferramenta não expõe configurações adicionais de qualidade. As imagens são incorporadas na resolução original, como PNG sem perdas, dentro do PDF.

## Casos de Uso

- Converter documentos digitalizados legados armazenados como BMP em PDFs de arquivamento
- Transformar capturas de tela BMP de aplicativos mais antigos do Windows em documentos compartilháveis
- Processar a saída de scanners médicos ou industriais que usam BMP por padrão
- Migrar arquivos de imagens antigos para um formato mais portátil

## Dicas

- Os arquivos BMP não têm compressão, por isso tendem a ser grandes. O PDF resultante será bem menor, pois as imagens são recodificadas internamente como PNG.
- Se você tem arquivos BMP junto com outros formatos de imagem, use a ferramenta [Imagens para PDF](./image-to-pdf) para converter tudo em um único lote.

## Ferramentas Relacionadas

- [Imagens para PDF](./image-to-pdf)
- [PNG para PDF](./png-to-pdf)
- [TIFF para PDF](./tiff-to-pdf)
