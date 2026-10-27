---
title: HEIC para PDF
description: Converta imagens HEIC e HEIF de iPhones e iPads para PDF diretamente no navegador.
---

# HEIC para PDF

Converta imagens HEIC/HEIF em PDF. O HEIC é o formato de foto padrão em iPhones e iPads desde o iOS 11. Esta ferramenta permite transformar essas fotos em PDFs sem instalar nenhum software de desktop e sem enviar arquivos para um servidor.

## Formatos suportados

| Formato | Extensões |
| :------ | :-------- |
| HEIC    | `.heic`   |
| HEIF    | `.heif`   |

## Como funciona

1. Clique na área de upload ou arraste e solte seus arquivos HEIC/HEIF.
2. Revise a lista de arquivos e remova os indesejados.
3. Clique em **Converter para PDF**. O resultado é baixado como `from_heic.pdf`.

Cada arquivo HEIC é decodificado com a biblioteca heic2any, que o converte para PNG com 92% de qualidade. O PNG é então incorporado ao PDF com o pdf-lib, com cada imagem em sua própria página, em resolução total.

## Opções

Esta ferramenta não expõe configurações adicionais. As imagens HEIC são convertidas em alta qualidade (0,92) para PNG antes de serem incorporadas.

## Casos de uso

- Criar um PDF a partir de fotos do iPhone para anexar a um pedido de seguro ou relatório
- Converter fotos HEIC de um anúncio imobiliário em um único documento imprimível
- Transformar capturas de tela do iPad (formato HEIF) em um PDF compartilhável
- Converter em lote fotos de férias para um diário de viagem

## Dicas

- A decodificação de HEIC acontece inteiramente no navegador, usando WebAssembly. A primeira conversão pode demorar um pouco enquanto o decodificador é carregado.
- Se você precisa misturar HEIC com outros formatos de imagem (JPG, PNG etc.), use a ferramenta [Imagens para PDF](./image-to-pdf), que trata HEIC junto com todos os outros formatos.
- Arquivos HEIC de iPhones costumam conter dados EXIF, incluindo coordenadas de GPS. O PDF gerado não carrega esses metadados.

## Ferramentas relacionadas

- [Imagens para PDF](./image-to-pdf)
- [JPG para PDF](./jpg-to-pdf)
- [PNG para PDF](./png-to-pdf)
