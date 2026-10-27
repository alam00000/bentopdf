---
title: PDF para WebP
description: Converta páginas de PDF em imagens WebP com qualidade ajustável. Arquivos menores que o JPG com qualidade visual comparável.
---

# PDF para WebP

Converte cada página de um PDF em uma imagem WebP. O WebP costuma gerar arquivos 25-35% menores que o JPG com a mesma qualidade percebida, o que o torna uma ótima escolha para uso na web.

## Como Funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela.
2. Ajuste o controle deslizante de **Qualidade**.
3. Clique em **Converter** para processar o arquivo.
4. Um único arquivo `.webp` ou um arquivo ZIP é baixado automaticamente.

## Opções

- **Qualidade**: um controle deslizante de 0% a 100% (padrão 85%). Controla o nível de compressão com perdas. Valores mais altos retêm mais detalhes.

Internamente, as páginas são renderizadas em escala 2x, gerando imagens com aproximadamente o dobro das dimensões nativas do PDF.

## Formato de Saída

- **Página única**: `filename.webp`
- **Várias páginas**: `filename_webps.zip` contendo `page_1.webp`, `page_2.webp` etc.

## Casos de Uso

- Preparar pré-visualizações de páginas para sites em que a largura de banda importa.
- Gerar versões de imagem leves de panfletos ou folhetos para redes sociais.
- Converter em lote documentos de várias páginas em um conjunto de imagens otimizado para a web.

## Dicas

- O WebP é suportado em todos os navegadores modernos. Para compatibilidade com navegadores antigos, use [PDF para JPG](./pdf-to-jpg) como alternativa.
- Uma qualidade de 80-85% costuma ser indistinguível do original na tela, mantendo os arquivos pequenos.

## Ferramentas Relacionadas

- [PDF para JPG](./pdf-to-jpg)
- [PDF para PNG](./pdf-to-png)
- [PDF para BMP](./pdf-to-bmp)
