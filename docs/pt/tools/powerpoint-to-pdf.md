---
title: PowerPoint para PDF
description: Converta apresentações do PowerPoint (PPT, PPTX) e arquivos ODP em PDF mantendo a formatação dos slides.
---

# PowerPoint para PDF

Converta arquivos de apresentação em PDF. Cada slide vira uma página no documento de saída, com texto, imagens, formas e transições renderizados por um mecanismo LibreOffice no navegador. Suporta formatos modernos e legados do PowerPoint, além do formato OpenDocument Presentation.

## Formatos suportados

| Formato                   | Extensões |
| :------------------------ | :-------- |
| PowerPoint (moderno)      | `.pptx`   |
| PowerPoint (legado)       | `.ppt`    |
| OpenDocument Presentation | `.odp`    |

## Como funciona

1. Clique na área de envio ou arraste e solte seus arquivos de apresentação.
2. Revise a lista de arquivos. Adicione mais ou remova conforme necessário.
3. Clique em **Converter para PDF**. O mecanismo LibreOffice é carregado no primeiro uso e depois converte cada arquivo.
4. Um único arquivo é baixado diretamente como PDF. Vários arquivos são empacotados em `powerpoint-converted.zip`.

## Opções

Esta ferramenta não tem configurações adicionais. Os slides são renderizados em suas dimensões originais.

## Saída

| Quantidade de entrada | Saída                                                           |
| :-------------------- | :-------------------------------------------------------------- |
| 1 arquivo             | Download de um único PDF (nome original com extensão `.pdf`)    |
| 2+ arquivos           | Arquivo ZIP (`powerpoint-converted.zip`) com um PDF por arquivo |

## Casos de uso

- Converter uma apresentação em PDF antes de compartilhar com um público que pode não ter o PowerPoint
- Criar uma versão imprimível de uma apresentação para uma conferência ou workshop
- Arquivar apresentações em um formato que é exibido de forma idêntica em qualquer dispositivo
- Converter em lote uma biblioteca de apresentações ODP do LibreOffice Impress em PDF
- Gerar uma versão em PDF de um pitch deck para enviar por e-mail

## Dicas

- Animações e transições de slides não são representadas no PDF. Cada slide é capturado como uma página estática.
- Vídeos incorporados não aparecem na saída. Substitua-os por uma captura de tela ou imagem de substituição, se necessário.
- As notas do apresentador não são incluídas na exportação padrão para PDF. Se precisar das notas, considere exportar antes pela visualização nativa "Imprimir Notas" do PowerPoint.
- O mecanismo LibreOffice fica em cache após o primeiro carregamento, então converter uma segunda apresentação na mesma sessão é muito mais rápido.

## Ferramentas relacionadas

- [Word para PDF](./word-to-pdf)
- [Excel para PDF](./excel-to-pdf)
- [Imagem para PDF](./image-to-pdf)
