---
title: PDF para texto
description: Extraia o conteúdo de texto simples de arquivos PDF. Suporta extração em lote de vários PDFs com saída em arquivos TXT.
---

# PDF para texto

Extrai todo o conteúdo de texto de arquivos PDF e o salva como arquivos `.txt` simples. Suporta processamento em lote: envie vários PDFs e tenha o texto de cada um extraído em uma única operação. Usa o PyMuPDF.

## Como Funciona

1. Envie um ou mais PDFs clicando na área de soltar ou arrastando arquivos para ela. Gerencie sua lista de arquivos com os botões Adicionar Mais e Limpar.
2. Clique em **Extrair** para iniciar o processamento.
3. Um único arquivo é baixado como `filename.txt`. Vários arquivos geram um arquivo `pdf-to-text.zip`.

## Opções

Esta ferramenta não tem opções configuráveis. Todo o conteúdo de texto é extraído de todas as páginas na ordem de leitura.

## Formato de Saída

- **Arquivo único**: `filename.txt`
- **Vários arquivos**: `pdf-to-text.zip` contendo um `.txt` para cada PDF de entrada.

## Casos de Uso

- Extrair o texto principal de relatórios em PDF para indexação de pesquisa de texto completo.
- Converter e-books ou artigos em PDF para texto simples para ler em dispositivos de tinta eletrônica.
- Extrair texto de contratos ou documentos jurídicos para análise de palavras-chave.
- Remover a formatação de PDFs para obter texto limpo para scripts de processamento de dados.
- Preparar um corpus de texto a partir de arquivos PDF para processamento de linguagem natural.

## Dicas

- PDFs digitalizados (apenas imagem) geram arquivos de texto vazios, pois não há camada de texto para extrair. Passe primeiro os documentos digitalizados por OCR.
- A saída preserva a ordem de leitura como interpretada pelo PyMuPDF, que em geral segue da esquerda para a direita e de cima para baixo. Layouts de várias colunas podem gerar texto intercalado.
- Para uma saída estruturada com títulos e formatação, experimente [PDF para Markdown](./pdf-to-markdown). Para JSON estruturado pronto para IA, use [Preparar PDF para IA](./prepare-pdf-for-ai).

## Ferramentas Relacionadas

- [PDF para Markdown](./pdf-to-markdown)
- [Preparar PDF para IA](./prepare-pdf-for-ai)
- [PDF para Word](./pdf-to-word)
