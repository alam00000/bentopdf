---
title: WebP para PDF
description: Converta imagens WebP em PDF diretamente no seu navegador, com qualidade de compressão ajustável.
---

# WebP para PDF

Converta o formato de imagem WebP, do Google, em PDF. É especialmente útil quando você baixou imagens da web em WebP e precisa delas em um formato mais amplamente aceito para impressão ou compartilhamento.

## Formatos suportados

| Formato | Extensões |
| :------ | :-------- |
| WebP    | `.webp`   |

## Como funciona

1. Clique na área de upload ou arraste e solte seus arquivos WebP.
2. Revise a lista de arquivos e remova os que você não precisa.
3. Selecione um nível de **Qualidade do PDF**.
4. Clique em **Converter para PDF**. A saída é baixada como `from_webps.pdf`.

Internamente, cada imagem WebP é decodificada pela API canvas do navegador e depois incorporada ao PDF usando pdf-lib. Isso significa que a conversão funciona em qualquer navegador que suporte a decodificação de WebP (todos os navegadores modernos suportam).

## Opções

A **Qualidade do PDF** controla a compressão ao incorporar as imagens:

- **Alta Qualidade**: preserva o máximo de detalhes.
- **Qualidade Média** (padrão): saída equilibrada.
- **Baixa Qualidade**: menor tamanho de arquivo.

## Casos de uso

- Converter imagens baixadas da web e salvas como WebP em um PDF imprimível
- Reunir capturas de tela WebP do Chrome ou do Edge em uma documentação
- Criar um portfólio em PDF a partir de imagens exportadas por ferramentas de design que usam WebP por padrão
- Arquivar imagens WebP em um formato legível de forma mais universal

## Dicas

- O WebP é decodificado para PNG internamente antes de ser incorporado ao PDF, então imagens WebP sem perdas mantêm a qualidade na configuração Alta.
- Se você tem uma mistura de WebP e outros formatos de imagem, use a ferramenta [Imagem para PDF](./image-to-pdf), que aceita tudo de uma vez.

## Ferramentas relacionadas

- [Imagem para PDF](./image-to-pdf)
- [PNG para PDF](./png-to-pdf)
- [JPG para PDF](./jpg-to-pdf)
