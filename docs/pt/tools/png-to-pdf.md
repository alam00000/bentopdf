---
title: PNG para PDF
description: Converta uma ou mais imagens PNG em um documento PDF com qualidade ajustável, inteiramente no seu navegador.
---

# PNG para PDF

Converta imagens PNG em PDF preservando a resolução total. Cada PNG vira uma página própria, com o tamanho igual ao das dimensões originais da imagem. A transparência é tratada automaticamente.

## Formatos Suportados

| Formato | Extensões |
| :------ | :-------- |
| PNG     | `.png`    |

## Como Funciona

1. Clique na área de envio ou arraste e solte arquivos PNG. Você pode selecionar vários de uma vez.
2. Gerencie a lista de arquivos: remova os indesejados ou adicione mais.
3. Escolha um nível de **Qualidade do PDF** na lista suspensa.
4. Clique em **Converter para PDF**. A saída é baixada como `from_jpgs.pdf`.

A ferramenta usa o pdf-lib para incorporar cada imagem diretamente. Se um PNG não puder ser incorporado de forma nativa (por exemplo, por causa de um perfil de cor incomum), ele é renderizado novamente em um canvas como JPEG.

## Opções

A **Qualidade do PDF** controla a compressão aplicada antes da incorporação:

- **Alta Qualidade**: compressão mínima, maior tamanho de arquivo.
- **Qualidade Média** (padrão): bom equilíbrio entre tamanho e nitidez.
- **Baixa Qualidade**: compressão máxima, menor saída.

## Casos de Uso

- Converter capturas de tela em um PDF de várias páginas para relatórios de bugs ou documentação
- Empacotar exportações de design de interface em um único arquivo para revisão
- Transformar exportações de diagramas (draw.io, Excalidraw) em um PDF compartilhável
- Reunir um conjunto de imagens de gráficos em um relatório

## Dicas

- Arquivos PNG com transparência recebem um fundo branco no PDF. Se você precisar de outro fundo, edite as imagens antes.
- Para capturas de tela e diagramas com bordas nítidas e texto, a qualidade Alta evita artefatos de compressão JPEG. Média ou Baixa podem converter para JPEG internamente.

## Ferramentas Relacionadas

- [Imagem para PDF](./image-to-pdf)
- [JPG para PDF](./jpg-to-pdf)
- [SVG para PDF](./svg-to-pdf)
