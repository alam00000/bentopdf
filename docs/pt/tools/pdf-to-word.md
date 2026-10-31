---
title: PDF para Word
description: Converta arquivos PDF em documentos editáveis do Word (DOCX). Suporta conversão em lote de vários PDFs de uma só vez.
---

# PDF para Word

Converte arquivos PDF em documentos editáveis do Word (`.docx`). A ferramenta usa o PyMuPDF para reconstruir o conteúdo do documento, preservando o texto, a formatação básica e o layout. Suporta conversão individual e em lote.

## Como Funciona

1. Envie um ou mais PDFs clicando na área de soltar ou arrastando arquivos para ela. Você pode adicionar mais arquivos ou remover arquivos individuais da lista.
2. Clique em **Converter** para iniciar o processamento.
3. Um único arquivo é baixado como `filename.docx`. Vários arquivos são empacotados em `converted-documents.zip`.

## Opções

Esta ferramenta não tem opções configuráveis. Cada PDF é convertido em DOCX usando o mecanismo de conversão integrado do PyMuPDF.

## Formato de Saída

- **Arquivo único**: `filename.docx`
- **Vários arquivos**: `converted-documents.zip` contendo um `.docx` para cada PDF de entrada.

## Casos de Uso

- Editar o texto de um PDF que você recebeu e precisa modificar.
- Converter relatórios arquivados em PDF para um formato que colegas possam editar no Microsoft Word ou no Google Docs.
- Levar o conteúdo de contratos ou propostas em PDF para o Word para fazer revisões.
- Migrar documentação legada em PDF para um formato editável.

## Dicas

- Layouts complexos com texto em várias colunas, formulários incorporados ou muitos gráficos podem não ser convertidos perfeitamente. Revise a saída e ajuste a formatação no seu processador de texto.
- PDFs digitalizados (apenas imagem) geram arquivos DOCX vazios ou quase vazios. Passe-os primeiro por OCR para adicionar uma camada de texto.
- O modo em lote é eficiente para converter pastas inteiras de PDFs: envie todos de uma vez.

## Ferramentas Relacionadas

- [PDF para Texto](./pdf-to-text)
- [PDF para Markdown](./pdf-to-markdown)
- [Construtor de fluxo de trabalho PDF](./pdf-workflow)
