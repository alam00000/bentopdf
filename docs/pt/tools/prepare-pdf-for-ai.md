---
title: Preparar PDF para IA
description: Extraia o conteúdo do PDF para JSON estruturado, otimizado para LLMs e pipelines de IA como o LlamaIndex. Suporta processamento em lote.
---

# Preparar PDF para IA

Extrai o conteúdo de arquivos PDF e o estrutura como JSON otimizado para ingestão por modelos de linguagem (LLMs) e frameworks de IA como o LlamaIndex. O conteúdo de cada página é extraído e organizado em um formato estruturado, pronto para pipelines RAG, chatbots ou sistemas de busca semântica.

## Como funciona

1. Envie um ou mais PDFs clicando na área de soltar ou arrastando os arquivos para ela.
2. Clique em **Extrair** para iniciar o processamento.
3. Um único arquivo é baixado como `filename_llm.json`. Vários arquivos geram um arquivo `pdf-for-ai.zip`.

A ferramenta usa a integração do PyMuPDF com o LlamaIndex para extrair o conteúdo por página com metadados, produzindo uma saída que pode ser carregada diretamente em frameworks de IA.

## Opções

Esta ferramenta não tem opções configuráveis. Todas as páginas são extraídas com texto completo e metadados.

## Formato de saída

- **Um arquivo**: `filename_llm.json`
- **Vários arquivos**: `pdf-for-ai.zip` contendo um `_llm.json` por PDF de entrada.

A saída JSON segue o esquema de documento do LlamaIndex, com o texto de cada página e campos de metadados.

## Casos de uso

- Preparar documentos PDF para pipelines de geração aumentada por recuperação (RAG).
- Criar uma base de conhecimento pesquisável a partir de arquivos PDF para um chatbot de IA.
- Alimentar relatórios em PDF em fluxos de análise baseados em LLM.
- Pré-processar artigos científicos para busca semântica e sistemas de perguntas e respostas.
- Criar dados de treinamento estruturados a partir de coleções de documentos PDF.

## Dicas

- Para extração de texto simples, sem formatação específica para IA, use [PDF para Texto](./pdf-to-text).
- Para uma saída em Markdown que preserve títulos e estrutura, use [PDF para Markdown](./pdf-to-markdown).
- PDFs digitalizados produzem saída vazia ou mínima. Passe-os antes por OCR para adicionar uma camada de texto antes da extração.

## Ferramentas relacionadas

- [PDF para Texto](./pdf-to-text)
- [PDF para Markdown](./pdf-to-markdown)
- [PDF para JSON](./pdf-to-json)
