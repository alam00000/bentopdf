---
title: PDF para Excel
description: Extraia tabelas de documentos PDF para uma planilha do Excel. Cada tabela ganha sua própria planilha com a referência da página.
---

# PDF para Excel

Extrai tabelas de um PDF e as salva como uma planilha do Excel (`.xlsx`). Cada tabela detectada é colocada em sua própria planilha, identificada pelo número da tabela e pela página de origem. Usa o PyMuPDF para detectar as tabelas e a biblioteca SheetJS para gerar o Excel.

## Como Funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela.
2. Clique em **Converter** para iniciar a extração de tabelas.
3. A ferramenta varre todas as páginas em busca de tabelas e depois monta uma pasta de trabalho do Excel.
4. Um arquivo `.xlsx` é baixado com uma planilha por tabela.

## Opções

Esta ferramenta não tem opções configuráveis. Todas as tabelas detectadas são extraídas automaticamente.

## Formato de Saída

- Um único arquivo `filename.xlsx`.
- **Uma tabela**: uma única planilha chamada "Table".
- **Várias tabelas**: planilhas chamadas "Table 1 (Page 3)", "Table 2 (Page 5)" etc. Os nomes das planilhas são truncados em 31 caracteres (o limite do Excel).

## Casos de Uso

- Converter relatórios financeiros em PDF em planilhas editáveis para análises posteriores.
- Extrair tabelas de estoque ou de pedidos de PDFs de fornecedores.
- Levar dados estruturados de formulários ou catálogos em PDF para o Excel para classificar e filtrar.
- Arquivar dados tabulares de PDFs em um formato com o qual colegas não técnicos consigam trabalhar.

## Dicas

- Se a ferramenta informar "Nenhuma Tabela Encontrada", o PDF provavelmente usa um layout de texto livre em vez de tabelas estruturadas. Experimente [PDF para Texto](./pdf-to-text) para obter o conteúdo bruto.
- Para um formato mais simples e plano, use [PDF para CSV](./pdf-to-csv). Para downloads por tabela em vários formatos, use [Extrair Tabelas PDF](./extract-tables).
- Confira os nomes das planilhas para identificar de qual página cada tabela veio.

## Ferramentas Relacionadas

- [PDF para CSV](./pdf-to-csv)
- [Extrair Tabelas PDF](./extract-tables)
- [PDF para Texto](./pdf-to-text)
