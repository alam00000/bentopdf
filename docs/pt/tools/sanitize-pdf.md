---
title: Sanitizar PDF
description: Remova conteúdo oculto e potencialmente perigoso de PDFs, incluindo metadados, JavaScript, arquivos incorporados, anotações e camadas.
---

# Sanitizar PDF

Os PDFs podem carregar muito mais do que você vê na tela. Metadados ocultos, JavaScript incorporado, anexos, dados de formulário e informações de camadas podem vazar dados sensíveis ou representar riscos de segurança. A sanitização remove tudo isso, deixando você com um documento limpo e seguro para compartilhar publicamente.

## Como funciona

1. Envie um arquivo PDF.
2. Selecione na lista quais elementos remover.
3. Clique em **Sanitizar PDF**.
4. Baixe o arquivo limpo.

## Opções de sanitização

Todas as opções vêm ativadas por padrão. Desmarque as que você quiser preservar.

| Opção                             | O que remove                                                               |
| --------------------------------- | -------------------------------------------------------------------------- |
| **Achatar Formulários**           | Converte campos de formulário interativos em conteúdo estático             |
| **Remover Metadados**             | Remove autor, título, data de criação, informações do software e dados XMP |
| **Remover Anotações**             | Exclui comentários, destaques, notas adesivas e marcações                  |
| **Remover JavaScript**            | Elimina scripts incorporados que poderiam ser executados ao abrir          |
| **Remover Arquivos Incorporados** | Remove anexos incorporados ao PDF                                          |
| **Remover Camadas (OCG)**         | Achata os grupos de conteúdo opcional em uma única camada                  |
| **Remover Links**                 | Remove hiperlinks e referências de URL                                     |
| **Remover Árvore de Estrutura**   | Remove a estrutura do documento usada para marcação de acessibilidade      |
| **Remover MarkInfo**              | Remove as informações de conteúdo marcado                                  |
| **Remover Fontes**                | Remove os dados de fontes incorporadas (use com cuidado)                   |

## Casos de uso

- Preparar um PDF para publicação removendo metadados internos (nomes de autores, versões de software, histórico de edição)
- Remover JavaScript de um PDF recebido de uma fonte não confiável antes de abri-lo
- Limpar um PDF antes de enviá-lo a um cliente que não deve ver comentários incorporados ou nomes de campos de formulário
- Remover camadas ocultas de um desenho arquitetônico antes de compartilhar a versão final
- Cumprir requisitos de minimização de dados previstos em regulamentos de privacidade

## Dicas

- Deixe "Remover Fontes" desmarcado, a menos que você tenha certeza de que o PDF ainda será exibido corretamente. Remover fontes pode tornar o texto invisível em alguns leitores.
- Se você só precisa remover metadados, a ferramenta dedicada Remover Metadados é mais rápida e mais focada.
- A sanitização é irreversível. Guarde seu arquivo original.

## Ferramentas relacionadas

- [Remover Metadados](./remove-metadata): remova apenas os metadados sem mexer no restante do conteúdo
- [Achatar PDF (Flatten)](./flatten-pdf): achate especificamente formulários e anotações
- [Criptografar PDF](./protect-pdf): adicione proteção por senha depois de sanitizar
- [Rasterizar PDF](./rasterize-pdf): a opção radical, converter em imagens para eliminar todo o conteúdo oculto
