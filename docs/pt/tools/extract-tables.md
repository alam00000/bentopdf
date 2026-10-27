---
title: Extrair Tabelas
description: Detecte e extraia tabelas de documentos PDF. Exporte como CSV, JSON ou Markdown com granularidade por tabela.
---

# Extrair Tabelas

Detecta todas as tabelas de um PDF e permite exportá-las no formato que você escolher: CSV, JSON ou Markdown. Cada tabela é extraída individualmente com metadados de página e posição. Desenvolvido com o mecanismo de detecção de tabelas do PyMuPDF.

## Como funciona

1. Envie um PDF clicando na área de soltar ou arrastando um arquivo para ela.
2. Selecione o **formato de exportação** de sua preferência: CSV, JSON ou Markdown.
3. Clique em **Extrair** para iniciar o processamento.
4. Se uma tabela for encontrada, ela é baixada como um único arquivo. Várias tabelas geram um arquivo ZIP com um arquivo por tabela.

## Opções

- **Formato de exportação**: escolha entre:
  - **CSV**: valores separados por vírgula, com aspas adequadas em campos que contêm vírgulas, aspas ou quebras de linha. Adequado para planilhas e bancos de dados.
  - **JSON**: estrutura de arrays de arrays, formatada com indentação de 2 espaços. Adequado para consumo programático.
  - **Markdown**: formato de tabela delimitado por barras verticais, renderizado pelo PyMuPDF. Adequado para documentação e arquivos README.

## Formato de saída

- **Uma tabela**: `filename_table.csv` (ou `.json` / `.md`)
- **Várias tabelas**: `filename_tables.zip` contendo arquivos nomeados `table_1_page3.csv`, `table_2_page5.csv` etc.

## Casos de uso

- Extrair tabelas específicas de relatórios PDF extensos sem puxar os dados do documento inteiro.
- Obter tabelas em formato Markdown para colar diretamente em issues do GitHub, wikis ou documentação.
- Retirar dados JSON estruturados de tabelas de PDF para integrações de API ou scripts.
- Comparar tabelas entre diferentes versões de PDF exportando ambas para CSV e comparando as diferenças.

## Dicas

- Esta ferramenta dá controle por tabela. Se você só quer todas as tabelas reunidas em um único CSV, use [PDF para CSV](./pdf-to-csv). Para uma pasta de trabalho completa do Excel, use [PDF para Excel](./pdf-to-excel).
- Tabelas que abrangem várias páginas podem ser detectadas como tabelas separadas por página. Talvez seja necessário concatená-las manualmente.
- Se nenhuma tabela for detectada, o PDF pode ser uma imagem digitalizada. Passe-o antes pelo OCR para adicionar uma camada de texto.

## Ferramentas relacionadas

- [PDF para CSV](./pdf-to-csv)
- [PDF para Excel](./pdf-to-excel)
- [PDF para Texto](./pdf-to-text)
