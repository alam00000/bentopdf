---
title: Remover metadados
description: Remova todos os metadados ocultos de arquivos PDF, incluindo autor, título, data de criação, produtor, dados XMP e IDs do documento.
---

# Remover metadados

Todo PDF carrega metadados que podem revelar quem o criou, qual software foi usado, quando foi modificado pela última vez e mais. Esta ferramenta remove tudo isso (o dicionário de informações, os fluxos de metadados XMP, os IDs do documento e os dados específicos de aplicativos), deixando um documento limpo, sem nenhum rastro de sua origem.

## Como funciona

1. Envie um arquivo PDF.
2. Clique em **Remover Metadados**.
3. Baixe o arquivo limpo.

Não há opções para configurar. A ferramenta é completa por design: ela limpa tudo.

## O que é removido

- **Campos do dicionário de informações**: Título, Autor, Assunto, Palavras-chave, Criador, Produtor, data de criação, data de modificação
- **Fluxo de metadados XMP**: o bloco de metadados baseado em XML armazenado no catálogo do documento
- **IDs do documento**: identificadores exclusivos no trailer do PDF que podem ser usados para rastrear um documento entre sistemas
- **PieceInfo**: metadados específicos de aplicativos adicionados por programas como Illustrator ou InDesign

## O que permanece

- Todo o conteúdo visível da página (texto, imagens, gráficos)
- Campos de formulário e anotações
- Favoritos e links
- A própria estrutura do documento

## Casos de uso

- Remover seu nome e sua organização de um documento antes de publicá-lo anonimamente
- Remover carimbos de data de criação que revelam quando um documento foi preparado
- Limpar strings de produtor que identificam o software de PDF que você usa
- Preparar documentos para envios regulatórios que exigem PDFs sem metadados
- Remover rastros do histórico de edição antes de compartilhar um documento externamente

## Dicas

- Use primeiro a ferramenta Ver Metadados para ver exatamente quais metadados seu PDF contém antes de removê-los.
- Se você precisa remover metadados _e_ JavaScript, anotações e arquivos incorporados, use Sanitizar PDF para uma limpeza mais completa.
- A remoção de metadados é permanente. Guarde o original caso precise desses dados depois.

## Ferramentas relacionadas

- [Sanitizar PDF](./sanitize-pdf): remova metadados, além de scripts, anexos e mais
- [Criptografar PDF](./protect-pdf): proteja o PDF limpo com uma senha
- [Comprimir PDF](./compress-pdf): remover metadados pode reduzir levemente o tamanho do arquivo; comprima para economizar mais
