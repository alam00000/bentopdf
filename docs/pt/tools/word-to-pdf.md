---
title: Word para PDF
description: Converta documentos Word (DOC, DOCX), ODT e RTF em PDF no seu navegador, preservando toda a formatação.
---

# Word para PDF

Converta documentos do Microsoft Word e formatos compatíveis em PDF. A ferramenta usa um mecanismo LibreOffice executado no navegador, que lida com arquivos DOC, DOCX, ODT e RTF e preserva formatação, tabelas, imagens, cabeçalhos, rodapés e estilos na saída.

## Formatos suportados

| Formato           | Extensões |
| :---------------- | :-------- |
| Word (moderno)    | `.docx`   |
| Word (legado)     | `.doc`    |
| OpenDocument Text | `.odt`    |
| Rich Text Format  | `.rtf`    |

## Como funciona

1. Clique na área de upload ou arraste e solte seus documentos Word. Vários arquivos podem ser selecionados de uma vez.
2. Revise e gerencie a lista de arquivos.
3. Clique em **Converter para PDF**. O mecanismo LibreOffice é carregado no primeiro uso (um indicador de progresso mostra o status da inicialização) e depois cada arquivo é convertido.
4. Um único arquivo é baixado diretamente como PDF. Vários arquivos são empacotados em `word-converted.zip`.

## Opções

Esta ferramenta não tem configurações adicionais. O mecanismo LibreOffice gera a saída usando seu perfil padrão de exportação para PDF.

## Saída

| Quantidade de entrada | Saída                                                                   |
| :-------------------- | :---------------------------------------------------------------------- |
| 1 arquivo             | Download de um único PDF (nome original do arquivo com extensão `.pdf`) |
| 2+ arquivos           | Arquivo ZIP (`word-converted.zip`) com um PDF por arquivo               |

## Casos de uso

- Converter um currículo ou uma carta de apresentação de DOCX para PDF antes de enviar uma candidatura
- Converter em lote um conjunto de contratos ou propostas em PDF para entregar a um cliente
- Transformar arquivos `.doc` legados em PDFs modernos para arquivamento de longo prazo
- Converter documentos colaborativos do Google Docs (exportados como DOCX) em PDF
- Produzir PDFs prontos para impressão a partir de modelos do Word usados na geração automatizada de documentos

## Dicas

- O mecanismo LibreOffice é baixado uma vez por sessão e fica em cache. Espere alguns segundos de carregamento na primeira conversão, com as conversões seguintes bem mais rápidas.
- Formatação complexa (macros, controles ActiveX, SmartArt avançado) pode não ser convertida perfeitamente. Elementos padrão de documento (texto, tabelas, imagens, cabeçalhos, notas de rodapé) são convertidos com confiabilidade.
- Como esta ferramenta também aceita ODT e RTF, você pode usá-la como conversor único para todos os formatos de processamento de texto.

## Ferramentas relacionadas

- [ODT para PDF](./odt-to-pdf)
- [RTF para PDF](./rtf-to-pdf)
- [Excel para PDF](./excel-to-pdf)
- [PowerPoint para PDF](./powerpoint-to-pdf)
