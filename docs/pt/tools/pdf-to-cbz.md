---
title: PDF para CBZ
description: Converta um PDF em um arquivo CBZ (Comic Book Archive) para leitores de quadrinhos como Komga, Kavita, CDisplayEx e Calibre.
---

# PDF para CBZ

Converte um PDF em um arquivo CBZ (Comic Book ZIP), o formato padrão para quadrinhos e mangás digitais. Cada página do PDF vira uma imagem dentro do arquivo. A ferramenta gera metadados em três formatos para máxima compatibilidade: ComicInfo.xml, metadata.opf e ComicBookInfo JSON.

## Como Funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela.
2. Escolha o formato da imagem, a qualidade, a escala e os metadados opcionais.
3. Clique em **Converter** para gerar o arquivo CBZ.
4. O arquivo `.cbz` é baixado automaticamente.

## Opções

| Opção             | Valores          | Padrão    | Descrição                                                                                     |
| ----------------- | ---------------- | --------- | --------------------------------------------------------------------------------------------- |
| Formato da Imagem | JPEG, PNG, WebP  | JPEG      | JPEG para quadrinhos coloridos, PNG para mangá P&B sem perdas, WebP para a melhor compressão. |
| Qualidade         | 50–100%          | 85%       | Controla a compressão JPEG/WebP. Oculta para PNG (sempre sem perdas).                         |
| Escala            | 1.0x–4.0x        | 2.0x      | Escalas maiores produzem imagens mais nítidas para telas de alta resolução.                   |
| Tons de cinza     | Ligado/Desligado | Desligado | Converte as páginas para tons de cinza. Reduz o tamanho do arquivo em conteúdo P&B.           |
| Modo mangá        | Ligado/Desligado | Desligado | Define a direção de leitura da direita para a esquerda nos metadados.                         |
| Incluir metadados | Ligado/Desligado | Ligado    | Incorpora ComicInfo.xml, metadata.opf e ComicBookInfo JSON.                                   |

## Campos de Metadados

Quando os metadados estão ativados, você pode preencher:

- **Título**: detectado automaticamente a partir do nome do arquivo PDF.
- **Série**: o nome da série (ex.: "Naruto").
- **Número (#)**: número da edição dentro da série.
- **Volume (Vol.)**: número do volume.
- **Autor(es)**: nome do roteirista ou criador.
- **Editora**: empresa responsável pela publicação.
- **Tags / Gênero**: tags separadas por vírgula (ex.: "Ação, Aventura").
- **Ano de Publicação**: ano da publicação (1900–2100).
- **Avaliação**: avaliação da comunidade de 0 a 5.

## Compatibilidade de Metadados

A ferramenta grava os metadados em três formatos para que todo leitor consiga encontrá-los:

| Formato            | Local                      | Suportado por                               |
| ------------------ | -------------------------- | ------------------------------------------- |
| ComicInfo.xml      | Arquivo dentro do ZIP      | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Arquivo dentro do ZIP      | Calibre                                     |
| ComicBookInfo JSON | Campo de comentário do ZIP | Calibre (alternativa)                       |

## Formato de Saída

- `filename.cbz`: um arquivo ZIP contendo as imagens das páginas numeradas e os arquivos de metadados.

As imagens das páginas são nomeadas com números preenchidos com zeros (`01.jpg`, `02.jpg` etc.) para que os leitores as exibam na ordem correta.

## Casos de Uso

- Converter PDFs de mangá ou quadrinhos para uso com leitores de quadrinhos.
- Montar uma biblioteca digital de quadrinhos no Komga, Kavita ou Calibre.
- Converter quadrinhos digitalizados em um formato amigável para leitores.
- Compartilhar quadrinhos em um formato que preserva a direção de leitura e os metadados.

## Dicas

- Use **JPEG** para quadrinhos coloridos e **PNG** para mangás em preto e branco: o PNG comprime conteúdo P&B com muita eficiência.
- Ative **Tons de cinza** para mangás para reduzir bastante o tamanho do arquivo.
- Preencha os campos **Série** e **Número** para que gerenciadores de biblioteca (Komga, Calibre) organizem sua coleção automaticamente.
- O **WebP** oferece a melhor compressão, mas leitores de quadrinhos mais antigos podem não suportá-lo.

## Ferramentas Relacionadas

- [PDF para JPG](./pdf-to-jpg)
- [PDF para PNG](./pdf-to-png)
- [PDF para TIFF](./pdf-to-tiff)
- [Extrair Imagens](./extract-images)
