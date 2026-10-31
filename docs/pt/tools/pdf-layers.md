---
title: Camadas OCG do PDF
description: Visualize, alterne, adicione e exclua camadas de Grupo de Conteúdo Opcional (OCG) em um documento PDF.
---

# Camadas OCG do PDF

Gerencie os Grupos de Conteúdo Opcional (OCG), comumente chamados de "camadas", dentro de um PDF. Você pode alternar a visibilidade das camadas, adicionar novas camadas (inclusive camadas filhas aninhadas), excluir camadas e salvar o PDF modificado.

## Como Funciona

1. Envie um arquivo PDF.
2. Clique no botão de processar para carregar o documento com o mecanismo PyMuPDF.
3. A ferramenta exibe todas as camadas existentes com o estado de visibilidade, o status de bloqueio e a hierarquia de aninhamento.
4. Use as caixas de seleção para mostrar ou ocultar camadas. Camadas bloqueadas não podem ser alternadas.
5. Adicione novas camadas de nível superior digitando um nome e clicando no botão de adicionar, ou adicione camadas filhas sob uma camada pai existente.
6. Exclua as camadas de que não precisa mais.
7. Clique em **Salvar** para baixar o PDF modificado com as alterações de camadas aplicadas.

## Recursos

- Exibe a hierarquia de camadas com recuo adequado para camadas aninhadas
- Ativa ou desativa a visibilidade das camadas
- Indicador de camada bloqueada que evita alterações acidentais
- Adiciona camadas de nível superior ou filhas com nomes personalizados
- Exclui camadas individuais
- Salva todas as alterações em um novo arquivo PDF

## Casos de Uso

- Alternar a visibilidade de camadas de marcação em desenhos de arquitetura ou engenharia
- Adicionar novas camadas de anotação a um documento de design com várias camadas
- Remover camadas obsoletas de um modelo antes de distribuí-lo
- Inspecionar quais camadas existem em um PDF complexo recebido de terceiros

## Dicas

- Se o PDF não tiver camadas, a ferramenta mostra um estado vazio com um convite para adicionar uma. Nem todos os PDFs usam camadas OCG, que são mais comuns em exportações de CAD e arquivos de design.
- As camadas filhas aparecem recuadas sob a camada pai. Você pode aninhar camadas em qualquer profundidade.
- As camadas bloqueadas são exibidas com um ícone de cadeado e suas caixas de seleção ficam desativadas. Esses bloqueios são definidos pelo criador do PDF.

## Ferramentas Relacionadas

- [Ver Metadados](./view-metadata)
- [Editar Metadados](./edit-metadata)
- [Duplicar e Organizar](./organize-pdf)
