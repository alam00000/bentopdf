---
title: PDF para JSON
description: Converta arquivos PDF em formato JSON estruturado usando o CPDF. Exporta a estrutura interna do PDF como dados JSON legíveis por máquina.
---

# PDF para JSON

Converte um ou mais arquivos PDF em formato JSON. A ferramenta usa o CPDF (Coherent PDF) para serializar a estrutura interna de cada PDF em uma representação JSON legível por máquina. A saída é sempre entregue como um arquivo ZIP.

## Como Funciona

1. Selecione um ou mais arquivos PDF usando o seletor de arquivos.
2. Clique em **Converter** para iniciar o processamento. A conversão é executada em um web worker em segundo plano.
3. Um arquivo ZIP é baixado com um arquivo JSON para cada PDF de entrada.

A barra de status mostra o progresso das etapas de conversão e de criação do ZIP.

## Opções

Esta ferramenta não tem opções configuráveis. Cada PDF é convertido para sua representação JSON completa.

## Formato de Saída

- Um arquivo `pdfs-to-json.zip` contendo `filename.json` para cada PDF de entrada.

A saída JSON representa a estrutura interna de objetos do PDF, incluindo árvores de páginas, referências de fontes, metadados e fluxos de conteúdo.

## Casos de Uso

- Inspecionar a estrutura interna de um PDF para depuração ou validação.
- Extrair metadados estruturados e propriedades de página de forma programática.
- Alimentar pipelines de processamento personalizados com dados da estrutura do PDF.
- Auditar documentos PDF quanto à conformidade analisando suas árvores de objetos.

## Dicas

- Esta ferramenta gera a estrutura bruta de objetos do PDF, não o conteúdo de texto extraído. Se você precisar do texto das páginas em formato JSON, use [Preparar PDF para IA](./prepare-pdf-for-ai).
- Para extração de texto simples, [PDF para Texto](./pdf-to-text) é mais direto.
- PDFs grandes com estruturas complexas geram arquivos JSON muito grandes.

## Ferramentas Relacionadas

- [PDF para Texto](./pdf-to-text)
- [Preparar PDF para IA](./prepare-pdf-for-ai)
- [Extrair Tabelas PDF](./extract-tables)
