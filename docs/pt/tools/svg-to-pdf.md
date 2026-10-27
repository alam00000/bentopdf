---
title: SVG para PDF
description: Converta gráficos vetoriais SVG em PDF com controle de qualidade, inteiramente no seu navegador.
---

# SVG para PDF

Converta arquivos Scalable Vector Graphics (SVG) em PDF. A ferramenta rasteriza cada SVG pelo mecanismo de renderização do navegador e depois incorpora o resultado em sua resolução nativa. É útil para transformar ícones vetoriais, diagramas e ilustrações em documentos portáteis.

## Formatos suportados

| Formato | Extensões |
| :------ | :-------- |
| SVG     | `.svg`    |

## Como funciona

1. Clique na área de envio ou arraste e solte um ou mais arquivos SVG.
2. Revise e gerencie a lista de arquivos.
3. Escolha um nível de **Qualidade do PDF**.
4. Clique em **Converter para PDF**. O resultado é baixado como `from_svgs.pdf`.

Cada SVG é lido como texto, renderizado em um canvas com sua largura e altura intrínsecas (usando 800x600 por padrão se nenhuma dimensão for especificada) e exportado como PNG. Esse PNG é então incorporado ao PDF usando o pdf-lib. As áreas transparentes são preenchidas com um fundo branco.

## Opções

A **Qualidade do PDF** controla a compressão após a rasterização:

- **Alta qualidade**: o mais próximo da renderização original.
- **Qualidade média** (padrão): bom equilíbrio.
- **Baixa qualidade**: menor arquivo, com alguma perda de detalhes.

## Casos de uso

- Converter diagramas de arquitetura ou engenharia de SVG em um PDF pronto para impressão
- Reunir conjuntos de ícones em um PDF de referência para um sistema de design
- Transformar visualizações de dados (D3.js, exportações de bibliotecas de gráficos) em PDFs prontos para relatórios
- Criar versões imprimíveis de infográficos baseados em SVG

## Dicas

- Arquivos SVG sem os atributos `width` e `height` explícitos são renderizados em 800x600 pixels. Para obter os melhores resultados, defina as dimensões no código-fonte do SVG antes de converter.
- SVGs complexos com referências externas a fontes ou imagens vinculadas podem não ser renderizados perfeitamente. Incorpore todos os recursos no SVG para uma saída confiável.
- Como o SVG é rasterizado, o PDF conterá uma imagem bitmap em vez de caminhos vetoriais. Para uma saída em PDF realmente vetorial, é necessária uma ferramenta vetorial dedicada.

## Ferramentas relacionadas

- [Imagem para PDF](./image-to-pdf)
- [PNG para PDF](./png-to-pdf)
- [BMP para PDF](./bmp-to-pdf)
