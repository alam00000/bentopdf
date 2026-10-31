---
title: Fonte para contorno
description: Converta todas as fontes do PDF em contornos vetoriais para uma renderização consistente em todos os dispositivos. Elimina problemas de dependência de fontes.
---

# Fonte para contorno

Converter fontes em contornos transforma cada caractere de texto de um glifo baseado em fonte em um caminho vetorial. O PDF deixa de depender de qualquer fonte instalada e é renderizado de forma idêntica em todos os dispositivos, sistemas operacionais e impressoras. Esta é uma etapa padrão em fluxos de pré-impressão.

## Como funciona

1. Envie um ou mais arquivos PDF.
2. Clique em **Converter em Contornos**.
3. O Ghostscript converte todo o texto em caminhos vetoriais.
4. Baixe o resultado. Vários arquivos geram um arquivo ZIP.

Não há configurações a ajustar. A ferramenta usa o Ghostscript (WebAssembly) para converter todas as referências de fontes em caminhos contornados em uma única passagem.

## O que muda

- Os caracteres de texto se tornam curvas vetoriais (caminhos bézier)
- A incorporação de fontes deixa de ser necessária: o PDF fica autossuficiente no nível do glifo
- O tamanho do arquivo pode aumentar, pois caminhos vetoriais costumam ser maiores que referências de fontes
- A aparência visual é preservada exatamente

## O que você perde

- Seleção e cópia de texto
- Pesquisa de texto (Ctrl+F deixa de funcionar)
- A capacidade de editar o conteúdo do texto
- Acessibilidade para leitores de tela

## Casos de uso

- Enviar PDFs para uma gráfica que exige fontes em contorno
- Compartilhar documentos que usam fontes personalizadas ou licenciadas com pessoas que não têm essas fontes
- Evitar a substituição de fontes que muda a aparência do documento em outros sistemas
- Preparar PDFs para gravação a laser ou corte CNC que exigem entrada vetorial
- Garantir que um PDF com muitos logotipos seja exibido corretamente em todas as plataformas

## Dicas

- Guarde o PDF original. O contorno é irreversível: não é possível converter os caminhos de volta em texto editável.
- Se você precisa que o texto continue pesquisável, considere usar a ferramenta Rasterizar PDF seguida de OCR.
- PDFs contornados tendem a ser maiores. Execute Comprimir PDF depois, se o tamanho do arquivo importar.

## Ferramentas relacionadas

- [Achatar PDF](./flatten-pdf): achate formulários e anotações sem mexer nas fontes
- [Rasterizar PDF](./rasterize-pdf): converta para PDF baseado em imagem em vez de contornos vetoriais
- [Comprimir PDF](./compress-pdf): reduza o tamanho do arquivo após o contorno
- [PDF para PDF/A](./pdf-to-pdfa): converta para arquivamento depois de garantir a independência de fontes
