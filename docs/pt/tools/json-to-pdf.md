---
title: JSON para PDF
description: Reconstrua arquivos PDF a partir do formato JSON do BentoPDF. Converta exportações JSON de volta aos documentos PDF originais.
---

# JSON para PDF

Reconstrua documentos PDF a partir de arquivos JSON criados anteriormente pela ferramenta **PDF para JSON** do BentoPDF. É uma ferramenta de conversão de ida e volta: ela pega a representação estruturada em JSON de um PDF e reconstrói o documento original.

::: warning
Esta ferramenta aceita apenas arquivos JSON produzidos pelo conversor PDF para JSON do BentoPDF. Arquivos JSON comuns de APIs, bancos de dados ou outras ferramentas não são suportados.
:::

## Formatos suportados

| Entrada | Descrição                                                          |
| :------ | :----------------------------------------------------------------- |
| `.json` | Arquivos JSON exportados pela ferramenta PDF para JSON do BentoPDF |

## Como funciona

1. Clique na área de upload ou arraste e solte um ou mais arquivos JSON.
2. A lista de arquivos mostra cada arquivo selecionado com seu tamanho.
3. Clique em **Converter para PDF**. A ferramenta processa todos os arquivos com um Web Worker e o mecanismo CPDF.
4. O resultado é baixado como `jsons-to-pdf.zip`, contendo um PDF para cada arquivo JSON de entrada.

A conversão roda em um Web Worker em segundo plano, então a interface continua responsiva mesmo com arquivos grandes.

## Opções

Esta ferramenta não tem opções configuráveis. A estrutura do JSON determina totalmente o PDF de saída.

## Saída

Ao converter vários arquivos JSON, os resultados são entregues em um arquivo ZIP. Cada PDF recebe o nome do arquivo JSON de origem (por exemplo, `report.json` vira `report.pdf`).

## Casos de uso

- Restaurar PDFs a partir de um backup ou pipeline de arquivamento baseado em JSON
- Fazer o caminho de ida e volta de um PDF por JSON para inspeção e depois de volta para PDF
- Reconstruir documentos após modificações programáticas na estrutura JSON
- Verificar se uma exportação de PDF para JSON capturou todo o conteúdo do documento, convertendo-a de volta

## Dicas

- Se você precisa converter dados JSON arbitrários (como respostas de API ou arquivos de configuração) em um PDF formatado, a ferramenta [Texto para PDF](./txt-to-pdf) é mais adequada. Cole o JSON como texto e ele será renderizado com a formatação correta.
- O mecanismo WebAssembly CPDF precisa estar disponível para esta ferramenta funcionar. Instâncias auto-hospedadas precisam ter os arquivos WASM do CPDF configurados.

## Ferramentas relacionadas

- [Texto para PDF](./txt-to-pdf)
- [Markdown para PDF](./markdown-to-pdf)
- [CSV para PDF](./csv-to-pdf)
