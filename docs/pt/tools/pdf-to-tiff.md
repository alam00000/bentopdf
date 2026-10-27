---
title: PDF para TIFF
description: Converta páginas de PDF em imagens TIFF, muito usadas em fluxos de impressão, fax e arquivamento. Usa PNG como alternativa se a codificação falhar.
---

# PDF para TIFF

Converte cada página de um PDF em uma imagem TIFF. O TIFF é o formato padrão para produção gráfica, sistemas de fax e arquivamento de documentos. A ferramenta usa a compressão PackBits para codificar o TIFF e recorre ao PNG caso uma página não possa ser codificada.

## Como Funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela.
2. Clique em **Converter** para processar o arquivo.
3. Um único arquivo TIFF ou um arquivo ZIP é baixado automaticamente.

## Opções

Esta ferramenta não tem opções configuráveis. As páginas são renderizadas em escala fixa de 2x.

## Formato de Saída

- **Página única**: `filename.tiff`
- **Várias páginas**: `filename_tiffs.zip` contendo `page_1.tiff`, `page_2.tiff` etc.

Se a codificação TIFF falhar em uma página específica (por problemas de compressão), essa página é salva como um arquivo `.png`. Nesse caso, o ZIP conterá uma mistura de arquivos TIFF e PNG.

## Casos de Uso

- Enviar documentos a órgãos governamentais ou sistemas jurídicos que exigem o formato TIFF.
- Preparar páginas para transmissão por fax em serviços de fax digital.
- Arquivar documentos digitalizados em um formato sem perdas amplamente suportado.
- Alimentar sistemas corporativos de gerenciamento de documentos com as páginas.

## Dicas

- Os arquivos TIFF são grandes. Se você só precisa de qualidade sem perdas para uso na web ou na tela, [PDF para PNG](./pdf-to-png) é uma escolha melhor.
- Confira o conteúdo do ZIP se algumas páginas precisaram da alternativa em PNG: talvez você queira convertê-las separadamente.

## Ferramentas Relacionadas

- [PDF para PNG](./pdf-to-png)
- [PDF para BMP](./pdf-to-bmp)
- [PDF para JPG](./pdf-to-jpg)
