---
title: Dividir PDF
description: Divida um PDF em arquivos menores por intervalo de páginas, seleção visual, favoritos, páginas pares/ímpares ou intervalos fixos.
---

# Dividir PDF

Divida um PDF em documentos menores usando um dos seis modos de divisão. De simples intervalos de páginas a divisão baseada em favoritos, esta ferramenta atende a todos os cenários de divisão de um documento.

## Como funciona

1. Envie um único arquivo PDF.
2. Escolha um modo de divisão no menu suspenso.
3. Configure as opções específicas do modo (intervalos de páginas, seleções etc.).
4. Clique no botão de processar.
5. O resultado é baixado como um único PDF ou como um arquivo ZIP, dependendo do modo e das configurações.

## Modos de divisão

| Modo                 | Descrição                                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Intervalo**        | Digite intervalos de páginas como `1-3, 5, 8-10`. Vários intervalos geram PDFs separados em um ZIP. Um único intervalo gera um PDF.     |
| **Seleção visual**   | Navegue pelas miniaturas das páginas e clique para selecionar as que você quer. As páginas selecionadas são extraídas para um novo PDF. |
| **Pares / Ímpares**  | Extraia apenas as páginas de número par ou ímpar.                                                                                       |
| **Todas as páginas** | Divida cada página em seu próprio arquivo PDF, baixado em um ZIP.                                                                       |
| **Favoritos**        | Divida nos limites dos favoritos. Escolha o nível do favorito para controlar onde ocorrem as divisões.                                  |
| **A cada N páginas** | Divida em blocos de N páginas cada (por exemplo, a cada 5 páginas). O último bloco pode ter menos páginas.                              |

## Recursos

- Seis modos de divisão distintos, cobrindo praticamente todos os casos de uso
- Seletor visual de páginas com miniaturas carregadas sob demanda
- Divisão baseada em favoritos com filtro por nível
- Opção de saída em ZIP para os modos de intervalo e visual
- Aceita intervalos de páginas com sintaxe mista (`1-3, 5, 8-10`)
- Aviso quando as divisões de N páginas resultam em blocos desiguais

## Casos de uso

- Extrair um capítulo ou seção específica de um documento grande
- Separar páginas ímpares e pares para fluxos de impressão frente e verso
- Dividir um PDF de livro em arquivos de capítulos individuais nos limites dos favoritos
- Isolar páginas específicas (como a página de assinatura) de um contrato
- Dividir um relatório compilado em arquivos por seção para distribuição

## Dicas

- Vários intervalos de páginas separados por vírgulas (por exemplo, `1-5, 10-15, 20-25`) geram PDFs separados, um por intervalo, reunidos em um ZIP.
- O modo de divisão por favoritos exige que o PDF realmente contenha favoritos. Se nenhum for encontrado, você verá uma mensagem de erro.
- A caixa "Baixar como ZIP" nos modos Intervalo e Seleção visual permite obter PDFs individuais por página em vez de um arquivo combinado.

## Ferramentas relacionadas

- [Mesclar PDF](./merge-pdf)
- [Extrair Páginas](./extract-pages)
- [Excluir Páginas](./delete-pages)
- [Multiferramenta PDF](./pdf-multi-tool)
