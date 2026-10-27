---
title: PDF para Markdown
description: Converta documentos PDF para o formato Markdown, com extração opcional de imagens. Suporta conversão em lote de vários arquivos.
---

# PDF para Markdown

Converte arquivos PDF para o formato Markdown (`.md`), preservando títulos, parágrafos, listas e a formatação básica. Opcionalmente, extrai e inclui as imagens incorporadas. Suporta conversão individual e em lote. Usa o PyMuPDF.

## Como Funciona

1. Envie um ou mais PDFs clicando na área de soltar ou arrastando arquivos para ela.
2. Se quiser, ative **Incluir Imagens** para incorporar as imagens extraídas na saída em Markdown.
3. Clique em **Converter** para iniciar o processamento.
4. Um único arquivo é baixado como `filename.md`. Vários arquivos geram um `markdown-files.zip`.

## Opções

- **Incluir Imagens**: quando marcada, as imagens incorporadas no PDF são extraídas e referenciadas na saída em Markdown. Quando desmarcada, apenas o conteúdo de texto é convertido.

## Formato de Saída

- **Arquivo único**: `filename.md`
- **Vários arquivos**: `markdown-files.zip` contendo um `.md` para cada PDF de entrada.

## Casos de Uso

- Converter documentação em PDF para Markdown para um gerador de sites estáticos como VitePress, Hugo ou Jekyll.
- Transformar artigos científicos em PDF em Markdown editável para aplicativos de anotações como o Obsidian.
- Migrar bases de conhecimento legadas em PDF para um formato de texto compatível com o Git.
- Extrair conteúdo estruturado de e-books em PDF para reformatação.

## Dicas

- A opção Incluir Imagens é útil quando o PDF contém diagramas ou figuras essenciais ao conteúdo. Desative-a em documentos com muito texto para manter a saída limpa.
- Layouts complexos com barras laterais, notas de rodapé ou texto em várias colunas podem gerar um Markdown imperfeito. Revise e ajuste a saída conforme necessário.
- Para texto bruto, sem nenhuma formatação, use [PDF para Texto](./pdf-to-text).

## Ferramentas Relacionadas

- [PDF para Texto](./pdf-to-text)
- [PDF para Word](./pdf-to-word)
- [Preparar PDF para IA](./prepare-pdf-for-ai)
