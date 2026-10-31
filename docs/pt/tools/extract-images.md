---
title: Extrair imagens
description: Extraia todas as imagens incorporadas de arquivos PDF. Visualize-as em uma grade e baixe individualmente ou como um arquivo ZIP.
---

# Extrair imagens

Retira todas as imagens incorporadas de um ou mais arquivos PDF. As imagens extraídas são exibidas em uma grade de pré-visualização, onde você pode baixá-las individualmente ou pegar tudo de uma vez em um ZIP. Desenvolvido com PyMuPDF.

## Como funciona

1. Envie um ou mais PDFs clicando na área de soltar ou arrastando os arquivos para ela. Adicione mais arquivos ou remova alguns individualmente, conforme necessário.
2. Clique em **Extrair** para iniciar o processamento.
3. A ferramenta examina todas as páginas de todos os PDFs enviados, encontrando e extraindo as imagens incorporadas.
4. As imagens extraídas aparecem em uma grade com miniaturas. Cada imagem tem um botão de download.
5. Clique em **Baixar tudo** para salvar tudo como um arquivo ZIP.

## Opções

Esta ferramenta não tem opções configuráveis. Todas as imagens incorporadas são extraídas no formato original (normalmente PNG, JPEG ou o formato usado quando a imagem foi incorporada ao PDF).

## Formato de saída

- As imagens aparecem na grade de pré-visualização com nomes como `image_1.png`, `image_2.jpg` etc.
- **Baixar tudo** gera `extracted-images.zip` contendo todas as imagens.
- As imagens individuais podem ser baixadas uma a uma pela grade.

## Casos de uso

- Recuperar fotos ou gráficos de um PDF para reutilizar em outro projeto.
- Extrair imagens de produtos de um PDF de catálogo para um anúncio de e-commerce.
- Retirar diagramas de documentações técnicas para usar em apresentações.
- Auditar quais imagens estão incorporadas em um documento antes de compartilhá-lo.

## Dicas

- A ferramenta extrai as imagens exatamente como estão armazenadas no PDF. Ela não renderiza as páginas como imagens; para isso, use [PDF para PNG](./pdf-to-png) ou [PDF para JPG](./pdf-to-jpg).
- Se a ferramenta informar "Nenhuma imagem encontrada", o PDF pode usar gráficos vetoriais em vez de imagens raster incorporadas, ou pode ser um documento digitalizado em que a página inteira é uma única imagem grande.
- O processamento em lote funciona com vários PDFs. Todas as imagens de todos os arquivos são combinadas em uma única grade e em um único ZIP.

## Ferramentas relacionadas

- [PDF para PNG](./pdf-to-png)
- [PDF para JPG](./pdf-to-jpg)
- [Construtor de Fluxo de Trabalho PDF](./pdf-workflow)
