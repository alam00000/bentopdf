---
title: RTF para PDF
description: Converta arquivos Rich Text Format (RTF) em PDF no seu navegador usando um mecanismo baseado em LibreOffice.
---

# RTF para PDF

Converta documentos Rich Text Format em PDF. O RTF é um formato de documento multiplataforma suportado por praticamente todo processador de texto. Esta ferramenta usa um mecanismo LibreOffice no navegador para renderizar arquivos RTF com a formatação intacta: negrito, itálico, tabelas e imagens incorporadas são todos mantidos no PDF.

## Formatos suportados

| Formato | Extensões | Tipos MIME                    |
| :------ | :-------- | :---------------------------- |
| RTF     | `.rtf`    | `text/rtf`, `application/rtf` |

## Como funciona

1. Clique na área de envio ou arraste e solte um ou mais arquivos RTF.
2. Revise a lista de arquivos. Adicione mais ou remova conforme necessário.
3. Clique em **Converter para PDF**. O mecanismo LibreOffice é inicializado no primeiro uso e depois processa cada arquivo.
4. Um único arquivo é baixado diretamente como PDF. Vários arquivos são entregues como `rtf-converted.zip`.

## Opções

Esta ferramenta não tem configurações adicionais. A conversão preserva a formatação original do RTF.

## Saída

| Quantidade de entrada | Saída                                                    |
| :-------------------- | :------------------------------------------------------- |
| 1 arquivo             | Download de um único PDF (por exemplo, `letter.pdf`)     |
| 2+ arquivos           | Arquivo ZIP (`rtf-converted.zip`) com um PDF por arquivo |

## Casos de uso

- Converter documentos RTF legados de processadores de texto antigos em PDFs modernos
- Transformar modelos de e-mail em RTF em pré-visualizações em PDF
- Processar saídas em RTF de sistemas de software jurídicos ou médicos
- Converter em lote arquivos RTF de um sistema de gerenciamento de documentos em PDF para arquivamento

## Dicas

- O mecanismo LibreOffice é carregado uma vez e fica em cache. A primeira conversão em uma sessão leva alguns segundos a mais; as seguintes são mais rápidas.
- Arquivos RTF com objetos OLE incorporados podem não renderizar todos os objetos perfeitamente. Texto simples, imagens e formatação padrão são convertidos de forma confiável.
- Se seus arquivos RTF foram criados pelo Microsoft Word, você também pode convertê-los diretamente com a ferramenta [Word para PDF](./word-to-pdf), que aceita RTF junto com DOC e DOCX.

## Ferramentas relacionadas

- [Word para PDF](./word-to-pdf)
- [ODT para PDF](./odt-to-pdf)
- [Texto para PDF](./txt-to-pdf)
