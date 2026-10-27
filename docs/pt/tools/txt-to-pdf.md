---
title: Texto para PDF
description: Converta arquivos de texto simples ou texto digitado em PDF com fontes, cores e tamanhos de página personalizados.
---

# Texto para PDF

Converta texto simples em um PDF formatado. Você pode enviar arquivos `.txt` ou digitar diretamente no editor de texto integrado. A ferramenta suporta várias fontes, cores de texto personalizadas e uma ampla variedade de tamanhos de página, de A0 a A10, além de US Letter, Legal e Tabloid.

## Formatos suportados

| Entrada                   | Extensões                |
| :------------------------ | :----------------------- |
| Arquivos de texto simples | `.txt`                   |
| Entrada direta de texto   | Digite ou cole no editor |

## Como funciona

1. Escolha o modo de entrada usando a chave no topo: **Enviar arquivos** ou **Digitar texto**.
2. Se for enviar, arraste e solte ou clique para selecionar um ou mais arquivos `.txt`. Se for digitar, insira o texto diretamente na área de texto.
3. Configure as opções de formatação: família da fonte, tamanho da fonte, cor do texto e tamanho da página.
4. Clique em **Criar PDF**. A saída é baixada como `text_to_pdf.pdf`.

Ao enviar vários arquivos, o conteúdo deles é concatenado, com linhas em branco entre eles.

## Opções

| Opção                 | Valores                                                                           | Padrão          |
| :-------------------- | :-------------------------------------------------------------------------------- | :-------------- |
| **Família da fonte**  | Helvetica (sem serifa), Tiro (serifada), Courier (monoespaçada), Times (serifada) | Helvetica       |
| **Tamanho da fonte**  | 6 a 72 pt                                                                         | 12              |
| **Cor do texto**      | Qualquer cor pelo seletor de cores                                                | Preto (#000000) |
| **Tamanho da página** | ISO A0 a A10, B0 a B10, C0 a C10, US Letter, Legal, Tabloid, Ledger, 11x17        | A4              |

Idiomas RTL (árabe, hebraico, persa, urdu) são detectados automaticamente. Quando texto RTL é encontrado, a direção e o alinhamento do texto mudam de acordo.

## Casos de uso

- Converter trechos de código ou arquivos de log em um PDF imprimível com a fonte Courier
- Criar rapidamente um PDF a partir de anotações de reunião digitadas na hora
- Formatar um manuscrito em texto simples com uma fonte e um tamanho de página específicos para envio
- Produzir uma versão em PDF de um README ou changelog para distribuição offline

## Dicas

- Use o modo **Digitar texto** quando quiser converter rapidamente o conteúdo da área de transferência sem salvá-lo antes como arquivo.
- Courier (monoespaçada) é a melhor escolha de fonte para código, logs ou qualquer conteúdo em que o alinhamento das colunas importe.
- As margens da página são fixas em 72 pontos (1 polegada) em todos os lados.

## Ferramentas relacionadas

- [Markdown para PDF](./markdown-to-pdf)
- [CSV para PDF](./csv-to-pdf)
- [Word para PDF](./word-to-pdf)
