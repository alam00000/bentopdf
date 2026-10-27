---
title: Rasterizar PDF
description: Converta páginas de PDF em PDF baseado em imagem. Achate todas as camadas, remova texto selecionável e controle o DPI e o formato da imagem.
---

# Rasterizar PDF

A rasterização converte cada página de um PDF em uma imagem e remonta essas imagens em um PDF. O resultado é idêntico ao original, mas não tem texto selecionável, elementos interativos nem camadas editáveis. É, na prática, uma fotocópia de alta qualidade.

## Como funciona

1. Envie um ou mais arquivos PDF.
2. Defina o **DPI** (resolução) da saída rasterizada.
3. Escolha um **Formato da imagem**: PNG para qualidade sem perdas ou JPEG para arquivos menores.
4. Opcionalmente, marque **Converter para tons de cinza**.
5. Clique em **Rasterizar PDF**. Vários arquivos são baixados em um ZIP.

## Opções

| Configuração          | Valores                        | Padrão    |
| --------------------- | ------------------------------ | --------- |
| **DPI**               | 72, 150, 200, 300, 600         | 150       |
| **Formato da imagem** | PNG (sem perdas), JPEG (menor) | PNG       |
| **Tons de cinza**     | Ligado/Desligado               | Desligado |

## Orientações de DPI

- **72**: apenas visualização em tela, menor tamanho de arquivo
- **150**: bom equilíbrio para uso geral
- **200**: texto mais nítido, tamanho de arquivo moderado
- **300**: saída com qualidade de impressão
- **600**: arquivamento de alta qualidade ou impressão profissional

## Casos de uso

- Impedir a extração de texto de documentos confidenciais antes de compartilhar
- Eliminar problemas de dependência de fontes convertendo o texto em pixels
- Criar uma versão "plana" de um PDF com camadas complexas ou transparência que é exibida de forma diferente em cada leitor
- Preparar um PDF para um sistema que só aceita entrada baseada em imagem
- Remover conteúdo oculto (como alterações controladas ou dados de formulário) reduzindo o PDF a imagens puras

## Dicas

- 150 DPI em PNG é um bom padrão. Só aumente se precisar de saída para impressão ou de zoom em detalhes finos.
- O JPEG produz arquivos visivelmente menores, mas introduz artefatos de compressão nas bordas nítidas do texto.
- A rasterização é irreversível: guarde o PDF original caso precise de texto editável depois.

## Ferramentas relacionadas

- [Comprimir PDF](./compress-pdf): reduza o tamanho do PDF rasterizado
- [Desinclinar PDF](./deskew-pdf): endireite as páginas antes de rasterizar documentos digitalizados
- [Fonte para Contorno](./font-to-outline): converta fontes em caminhos vetoriais se quiser manter a escalabilidade
- [Achatar PDF (Flatten)](./flatten-pdf): achate formulários sem converter em imagens
