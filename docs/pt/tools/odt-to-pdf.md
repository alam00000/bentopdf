---
title: ODT para PDF
description: Converta arquivos OpenDocument Text (ODT) para PDF no seu navegador usando um mecanismo baseado no LibreOffice.
---

# ODT para PDF

Converta arquivos OpenDocument Text em PDF. ODT é o formato nativo do LibreOffice Writer, do Apache OpenOffice e de outros processadores de texto de código aberto. Esta ferramenta usa um mecanismo LibreOffice no navegador para produzir conversões precisas, que preservam formatação, tabelas, imagens e estilos.

## Formatos Suportados

| Formato           | Extensões |
| :---------------- | :-------- |
| OpenDocument Text | `.odt`    |

## Como Funciona

1. Clique na área de envio ou arraste e solte um ou mais arquivos ODT.
2. Revise a lista de arquivos. Adicione mais arquivos ou remova os indesejados.
3. Clique em **Converter para PDF**. O mecanismo do LibreOffice é inicializado (um indicador de progresso mostra o status do carregamento) e então cada arquivo é convertido.
4. Um único arquivo é baixado diretamente como PDF. Vários arquivos são empacotados em `odt-converted.zip`.

## Opções

Esta ferramenta não tem configurações adicionais. A conversão preserva o máximo possível a formatação do documento original.

## Saída

| Qtd. de Entrada | Saída                                                          |
| :-------------- | :------------------------------------------------------------- |
| 1 arquivo       | Download de um único PDF (ex.: `document.pdf`)                 |
| 2+ arquivos     | Arquivo ZIP (`odt-converted.zip`) com um PDF para cada arquivo |

## Casos de Uso

- Converter documentos do LibreOffice Writer em PDF para compartilhar com usuários do Microsoft Office
- Gerar PDFs prontos para impressão a partir de trabalhos acadêmicos escritos em formato OpenDocument
- Converter em lote uma pasta de modelos ODT em PDFs para distribuição
- Gerar PDFs a partir de arquivos ODT criados por sistemas automatizados de geração de documentos

## Dicas

- O mecanismo do LibreOffice é carregado no primeiro uso e fica em cache para as próximas conversões. O carregamento inicial leva alguns segundos; depois disso, as conversões são rápidas.
- Documentos complexos com objetos OLE incorporados ou fontes incomuns podem ser renderizados de forma ligeiramente diferente do LibreOffice para desktop. Teste com um exemplo antes de converter em lote.
- Para documentos do Word (`.doc`, `.docx`), use a ferramenta [Word para PDF](./word-to-pdf), que também usa o mecanismo do LibreOffice, mas aceita os formatos da Microsoft diretamente.

## Ferramentas Relacionadas

- [Word para PDF](./word-to-pdf)
- [RTF para PDF](./rtf-to-pdf)
- [Texto para PDF](./txt-to-pdf)
