---
title: PDF para CSV
description: Extraia tabelas de documentos PDF e exporte-as como um único arquivo CSV. Trata PDFs com várias páginas com detecção automática de tabelas.
---

# PDF para CSV

Extrai tabelas de um PDF e as exporta como um arquivo CSV. A ferramenta varre cada página em busca de dados tabulares usando o mecanismo de detecção de tabelas do PyMuPDF e grava todas as linhas encontradas em uma única saída separada por vírgulas.

## Como Funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela.
2. Clique em **Converter** para iniciar a extração de tabelas.
3. A ferramenta varre cada página e identifica as tabelas automaticamente.
4. Um arquivo `.csv` é baixado com todos os dados das tabelas extraídas.

As tabelas de páginas diferentes são separadas por linhas em branco na saída. Células que contêm vírgulas, aspas ou quebras de linha são escapadas corretamente, seguindo a RFC 4180.

## Opções

Esta ferramenta não tem opções configuráveis. Todas as tabelas encontradas no documento são extraídas e combinadas em um único CSV.

## Formato de Saída

- Um único arquivo `filename.csv` contendo todas as tabelas detectadas.

## Casos de Uso

- Levar dados financeiros de extratos bancários ou faturas em PDF para uma planilha.
- Extrair tabelas de preços de orçamentos de fornecedores para comparação.
- Converter dados tabulares de pesquisas em artigos PDF para um formato adequado a ferramentas de análise.
- Migrar dados de relatórios PDF legados para bancos de dados.

## Dicas

- Se nenhuma tabela for encontrada, a ferramenta exibe a mensagem "Nenhuma Tabela Encontrada". Isso normalmente significa que o PDF usa um layout de texto que parece tabular, mas não está estruturado como uma tabela de verdade.
- Para ter mais controle sobre cada tabela, use [Extrair Tabelas PDF](./extract-tables), que permite escolher entre os formatos de saída CSV, JSON e Markdown.
- Se você precisar dos dados em formato Excel, com uma planilha separada para cada tabela, use [PDF para Excel](./pdf-to-excel).

## Ferramentas Relacionadas

- [PDF para Excel](./pdf-to-excel)
- [Extrair Tabelas PDF](./extract-tables)
- [PDF para Texto](./pdf-to-text)
