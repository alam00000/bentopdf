---
title: Excel para PDF
description: Converta planilhas do Excel (XLS, XLSX), ODS e arquivos CSV em PDF com a formatação preservada.
---

# Excel para PDF

Converta arquivos de planilha em PDF. A ferramenta lida com arquivos modernos do Excel, o formato legado XLS, planilhas OpenDocument e até CSV, tudo renderizado por um mecanismo LibreOffice no navegador que preserva a formatação das células, as fórmulas (como valores calculados), os gráficos e os layouts de várias planilhas.

## Formatos compatíveis

| Formato               | Extensões |
| :-------------------- | :-------- |
| Excel (moderno)       | `.xlsx`   |
| Excel (legado)        | `.xls`    |
| Planilha OpenDocument | `.ods`    |
| CSV                   | `.csv`    |

## Como funciona

1. Clique na área de upload ou arraste e solte seus arquivos de planilha.
2. Revise a lista de arquivos. Adicione mais arquivos ou remova os indesejados.
3. Clique em **Converter para PDF**. O mecanismo LibreOffice é inicializado no primeiro uso e depois processa cada arquivo.
4. Um único arquivo é baixado diretamente como PDF. Vários arquivos são entregues como `excel-converted.zip`.

## Opções

Esta ferramenta não tem configurações adicionais. O mecanismo LibreOffice determina o layout da página, a escala e a área de impressão com base nas configurações internas da planilha.

## Saída

| Quantidade de entrada | Saída                                                                   |
| :-------------------- | :---------------------------------------------------------------------- |
| 1 arquivo             | Download de um único PDF (nome original do arquivo com extensão `.pdf`) |
| 2 ou mais arquivos    | Arquivo ZIP (`excel-converted.zip`) contendo um PDF por arquivo         |

## Casos de uso

- Converter relatórios financeiros ou orçamentos do Excel em PDF para distribuição
- Criar PDFs prontos para impressão a partir de planilhas de estoque ou de catálogo de produtos
- Compartilhar resultados de análises de dados com partes interessadas que não têm o Excel instalado
- Arquivar relatórios trimestrais em um formato não editável
- Converter arquivos ODS do LibreOffice Calc em PDF

## Dicas

- Os gráficos incorporados na planilha são renderizados no PDF. Confira se eles estão corretos no arquivo de origem antes de converter.
- Se a sua planilha tem várias planilhas (abas), todas são incluídas na saída em PDF.
- Para dados CSV simples sem formatação, a ferramenta [CSV para PDF](./csv-to-pdf) oferece uma conversão mais leve. Use Excel para PDF quando precisar preservar formatação, gráficos ou várias planilhas.

## Ferramentas relacionadas

- [CSV para PDF](./csv-to-pdf)
- [Word para PDF](./word-to-pdf)
- [PowerPoint para PDF](./powerpoint-to-pdf)
