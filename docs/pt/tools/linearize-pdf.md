---
title: Linearizar PDF
description: Otimize arquivos PDF para visualização rápida na web com carregamento progressivo. Também conhecido como otimização "Fast Web View".
---

# Linearizar PDF

A linearização reestrutura um PDF para que a primeira página possa ser exibida antes de o arquivo inteiro ser baixado. A Adobe chama isso de "Fast Web View". Se você hospeda PDFs em um site ou os serve por um portal de documentos, a linearização faz com que eles abram de forma bem mais rápida.

## Como funciona

1. Envie um ou mais arquivos PDF.
2. Clique em **Linearizar PDF(s)**.
3. Baixe os resultados como um arquivo ZIP contendo todos os arquivos linearizados.

Não há configurações a ajustar. A ferramenta usa a opção `--linearize` do QPDF, que reorganiza a estrutura interna do PDF sem alterar seu conteúdo visual.

## O que a linearização faz

- Reordena os objetos do PDF para que os dados da primeira página fiquem no início do arquivo
- Adiciona um dicionário de linearização e tabelas de dicas para que os visualizadores saibam onde encontrar cada página
- Habilita requisições por intervalo de bytes: o navegador pode buscar apenas a primeira página sem baixar o arquivo inteiro
- Limpa a tabela de referências cruzadas para acesso aleatório eficiente

## Recursos

- Processamento em lote de vários PDFs em uma única operação
- A saída preserva todo o conteúdo, fontes, imagens e elementos interativos
- Usa o QPDF (WebAssembly) para uma linearização confiável e compatível com os padrões
- Os resultados são empacotados em um ZIP para facilitar o download

## Casos de uso

- Hospedar relatórios em PDF em um site em que os usuários esperam exibição instantânea da página
- Incorporar PDFs em aplicações web com visualizadores no navegador
- Publicar catálogos ou manuais em PDF acessados por conexões móveis lentas
- Preparar documentos para redes de distribuição de conteúdo (CDNs) que suportam entrega por intervalo de bytes

## Dicas

- Linearize depois de concluir todas as outras edições. Qualquer modificação posterior (mesclar, adicionar páginas) quebra a linearização.
- Combine com Comprimir PDF para obter os PDFs menores e mais rápidos de carregar possíveis.
- A linearização adiciona uma pequena sobrecarga ao tamanho do arquivo (normalmente menos de 1%).

## Ferramentas relacionadas

- [Comprimir PDF](./compress-pdf): reduza o tamanho do arquivo antes de linearizar
- [Reparar PDF](./repair-pdf): corrija problemas estruturais que impedem a linearização
- [Remover Metadados](./remove-metadata): remova metadados antes de publicar online
