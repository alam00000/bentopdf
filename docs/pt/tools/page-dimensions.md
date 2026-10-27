---
title: Dimensões da página
description: Analise tamanhos, orientações, proporções e rotação das páginas de um PDF. Detecte documentos com tamanhos mistos e exporte os dados para CSV.
---

# Dimensões da página

Uma ferramenta de diagnóstico que lê cada página do seu PDF e informa suas dimensões exatas, orientação, nome do tamanho padrão, proporção, área e rotação. É útil para identificar páginas de tamanhos diferentes antes da impressão ou para documentar as propriedades de um PDF recebido.

## Como Funciona

1. Envie um arquivo PDF. A análise começa automaticamente, sem botão para clicar.
2. Um painel de resumo mostra o total de páginas, o número de tamanhos de página distintos e se o documento tem tamanhos mistos.
3. Navegue pela tabela completa de resultados com os detalhes de cada página.
4. Alterne a unidade de exibição entre Pontos, Polegadas, Milímetros ou Pixels.
5. Clique em **Exportar para CSV** para salvar os dados.

## Campos Informados

| Coluna         | Descrição                                                |
| -------------- | -------------------------------------------------------- |
| Nº da página   | Número sequencial da página                              |
| Dimensões      | Largura x Altura na unidade selecionada                  |
| Tamanho padrão | Nome correspondente (A4, Letter etc.) ou "Personalizado" |
| Orientação     | Retrato ou Paisagem                                      |
| Proporção      | Razão entre largura e altura em formato decimal          |
| Área           | Área da página na unidade selecionada ao quadrado        |
| Rotação        | Rotação da página em graus                               |

## Recursos

- Detecção automática de tamanhos de papel padrão (A3, A4, A5, Letter, Legal, Tabloid e mais)
- Aviso de documento com tamanhos mistos, com o detalhamento de quais tamanhos aparecem e quantas páginas usam cada um
- Conversão de unidades entre pontos, polegadas, milímetros e pixels (a 96 PPI)
- Exportação para CSV para uso em planilhas ou sistemas de documentação

## Casos de Uso

- Verificar se todas as páginas são A4 antes de enviar um documento a uma gráfica
- Descobrir por que um PDF mesclado é impresso com margens inesperadas em certas páginas
- Documentar o layout de páginas de um grande arquivo de PDFs para registros de metadados
- Identificar páginas giradas que precisam de correção

## Dicas

- Se o resumo mostrar "Tamanhos Mistos", use a ferramenta Ajustar Tamanho da Página para padronizar antes de imprimir.
- O campo de rotação ajuda a identificar páginas que são exibidas corretamente, mas têm um atributo de rotação diferente de zero, o que pode causar problemas em alguns fluxos de trabalho.

## Ferramentas Relacionadas

- [Ajustar Tamanho da Página](./fix-page-size): padronize as páginas depois de identificar tamanhos mistos
- [Comprimir PDF](./compress-pdf): otimize o PDF depois de corrigir os problemas de página
- [Girar PDF](./rotate-pdf): corrija páginas giradas
