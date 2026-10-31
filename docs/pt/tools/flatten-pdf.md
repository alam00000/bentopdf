---
title: Achatar PDF
description: Achate formulários interativos e anotações em conteúdo estático. Torna os campos do formulário não editáveis e incorpora as anotações à página.
---

# Achatar PDF

Achatar (flatten) mescla elementos interativos (campos de formulário, listas suspensas, caixas de seleção, anotações, destaques, notas adesivas) diretamente no conteúdo da página. A aparência visual permanece a mesma, mas nada mais é editável ou extraível. É o equivalente em PDF a imprimir um formulário preenchido e digitalizá-lo de volta, só que com a qualidade perfeita.

## Como funciona

1. Envie um ou mais arquivos PDF.
2. Clique em **Achatar PDF**.
3. Um único arquivo é baixado diretamente. Vários arquivos geram um arquivo ZIP.

A ferramenta usa o pdf-lib para achatar os campos de formulário (via `form.flatten()`) e um achatador de anotações dedicado para incorporar as anotações ao fluxo da página. Ambas as operações acontecem em uma única passagem.

## O que é achatado

- **Campos de formulário**: Campos de texto, caixas de seleção, botões de opção, listas suspensas, campos de assinatura
- **Anotações**: Comentários, destaques, tachado, sublinhado, notas adesivas, carimbos, anotações de tinta
- **Elementos interativos**: Botões, gatilhos de ação

## O que permanece inalterado

- Conteúdo de texto (continua selecionável e pesquisável)
- Imagens e gráficos
- Layout e dimensões da página
- Marcadores e sumário
- Hiperlinks (exceto os baseados em anotações)

## Casos de uso

- Bloquear um formulário preenchido para que os destinatários não alterem as respostas enviadas
- Preparar um PDF para arquivamento, onde elementos interativos são desnecessários
- Corrigir problemas de exibição causados por anotações renderizadas de forma diferente em cada visualizador
- Garantir que um documento assinado não possa ser modificado após a aplicação da assinatura
- Reduzir o tamanho do arquivo eliminando definições de campos de formulário e objetos de anotação

## Dicas

- Achate depois de concluir todas as edições. Não há como desfazer o achatamento de um PDF.
- Se você precisa achatar e também remover metadados, JavaScript e anexos, use a ferramenta Sanitizar PDF, que inclui o achatamento como uma de suas opções.
- Alguns PDFs informam "nenhum formulário encontrado". Isso é normal se o documento tem apenas anotações e nenhum campo de formulário.

## Ferramentas relacionadas

- [Sanitizar PDF](./sanitize-pdf): achate formulários e remova metadados, scripts e mais
- [Rasterizar PDF](./rasterize-pdf): converta para PDF baseado em imagem para o máximo de achatamento
- [Fonte para Contorno](./font-to-outline): converta fontes em caminhos vetoriais
- [Criptografar PDF](./protect-pdf): proteja o PDF achatado com uma senha
