---
title: CBZ para PDF
description: Converta arquivos de quadrinhos CBZ e CBR em PDF no seu navegador. Grátis, privado, sem upload.
---

# CBZ para PDF

Transforme arquivos de quadrinhos em PDFs. CBZ e CBR são os formatos padrão para quadrinhos digitais: são apenas arquivos ZIP ou RAR cheios de imagens. Esta ferramenta extrai cada página, preserva a ordem de leitura e gera um PDF limpo em que cada imagem vira uma página em tamanho real.

## Formatos compatíveis

| Formato | Extensão | Observações                                                              |
| :------ | :------- | :----------------------------------------------------------------------- |
| CBZ     | `.cbz`   | Arquivo de quadrinhos baseado em ZIP (processado localmente com pdf-lib) |
| CBR     | `.cbr`   | Arquivo de quadrinhos baseado em RAR (processado pelo mecanismo PyMuPDF) |

O conversor de CBZ reconhece imagens JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC e JXL dentro do arquivo. Formatos não padrão são convertidos automaticamente para PNG antes de serem incorporados.

## Como funciona

1. Clique na área de upload ou arraste e solte seus arquivos CBZ ou CBR. Você pode misturar os dois formatos em um único lote.
2. Revise os arquivos listados. Remova os que não precisa ou clique em **Adicionar mais arquivos** para incluir outros.
3. Clique em **Converter para PDF**. Para arquivos CBZ, a ferramenta descompacta o arquivo, ordena as imagens pelo nome em ordem natural, detecta o formato real de cada imagem e as incorpora em um PDF usando pdf-lib. Os arquivos CBR são processados pelo mecanismo PyMuPDF.
4. Um único arquivo é baixado como PDF. Vários arquivos geram um arquivo ZIP chamado `comic-converted.zip`.

## Opções

Nenhuma configuração é necessária. Cada imagem vira uma página com o mesmo tamanho original, então páginas duplas continuam largas e páginas simples continuam estreitas.

## Casos de uso

- Ler quadrinhos em um tablet ou aplicativo de celular que aceita PDF, mas não CBZ/CBR
- Imprimir páginas específicas de um quadrinho digital
- Arquivar uma coleção de quadrinhos em um formato que qualquer leitor de arquivos consegue abrir
- Compartilhar um quadrinho com alguém que não tem um leitor de quadrinhos dedicado

## Dicas

- As imagens dentro do arquivo são ordenadas em ordem natural (assim `page2.jpg` vem antes de `page10.jpg`). Nomeie seus arquivos com numeração consistente para obter a sequência correta de páginas.
- O conversor detecta os formatos de imagem pelas assinaturas binárias, não pelas extensões. Um PNG nomeado por engano como `.jpg` ainda será incorporado corretamente.
- Os arquivos CBZ são processados inteiramente no navegador, sem carregar o mecanismo PyMuPDF, então são convertidos mais rápido que os arquivos CBR.

## Ferramentas relacionadas

- [EPUB para PDF](./epub-to-pdf)
- [MOBI para PDF](./mobi-to-pdf)
- [Imagem para PDF](./image-to-pdf)
