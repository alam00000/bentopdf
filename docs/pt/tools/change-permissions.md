---
title: Alterar permissões
description: Defina ou modifique as permissões de uso do PDF para impressão, cópia, edição e anotações. Usa criptografia AES de 256 bits.
---

# Alterar permissões

Ajuste com precisão o que os destinatários podem fazer com seu PDF. Ao contrário da criptografia básica, que apenas tranca o arquivo com uma senha, esta ferramenta permite permitir ou negar seletivamente impressão, cópia, edição, anotações, preenchimento de formulários, montagem do documento e extração de páginas, tudo garantido pela criptografia AES de 256 bits.

## Como funciona

1. Envie um arquivo PDF.
2. Se o PDF já estiver criptografado, digite a **Senha atual**.
3. Defina uma **Nova senha de usuário** (necessária para abrir) e/ou uma **Nova senha de proprietário** (controla as permissões).
4. Ative ou desative cada permissão usando as caixas de seleção.
5. Clique em **Alterar permissões**.
6. Baixe o PDF atualizado.

Se você deixar os dois campos de nova senha vazios, a ferramenta descriptografa o PDF por completo, removendo toda a criptografia e as restrições.

## Controles de permissão

| Permissão                                 | O que controla                                               |
| ----------------------------------------- | ------------------------------------------------------------ |
| **Permitir impressão**                    | Se o documento pode ser impresso                             |
| **Permitir cópia**                        | Se texto e imagens podem ser selecionados e copiados         |
| **Permitir modificação**                  | Se o conteúdo do documento pode ser editado                  |
| **Permitir anotações**                    | Se comentários, destaques e carimbos podem ser adicionados   |
| **Permitir preenchimento de formulários** | Se os campos interativos de formulário podem ser preenchidos |
| **Permitir montagem do documento**        | Se páginas podem ser inseridas, excluídas ou giradas         |
| **Permitir extração de páginas**          | Se páginas individuais podem ser extraídas                   |

Todas as permissões exigem uma senha de proprietário para serem aplicadas. Sem uma senha de proprietário, os indicadores de permissão são ignorados pela maioria dos leitores de PDF.

## Como as permissões funcionam no PDF

As permissões do PDF fazem parte da especificação de criptografia. Elas são armazenadas como indicadores de bits no dicionário de criptografia e aplicadas por leitores de PDF compatíveis. A diferença principal:

- **Senha de usuário**: necessária para abrir o arquivo.
- **Senha de proprietário**: necessária para alterar permissões ou remover restrições. Sem ela, os indicadores de permissão controlam quais operações o usuário pode realizar.

Se você definir apenas uma senha de proprietário (sem senha de usuário), qualquer pessoa pode abrir o arquivo, mas fica restrita às operações permitidas. Se definir as duas, o arquivo exige uma senha para abrir e fica restrito após a autenticação.

## Casos de uso

- Distribuir um relatório que pode ser visualizado e impresso, mas não editado nem copiado
- Compartilhar um modelo de contrato que os destinatários podem preencher, mas não modificar
- Publicar um catálogo em PDF em que a cópia de imagens está desativada
- Permitir anotações em um rascunho de revisão e impedir alterações estruturais

## Dicas

- Para ser eficaz, sempre defina uma senha de proprietário. Permissões sem senha de proprietário não podem ser aplicadas.
- Algumas ferramentas de PDF de terceiros ignoram os indicadores de permissão. Para uma proteção mais forte, considere rasterizar o PDF ou usar DRM.
- Use esta ferramenta para atualizar PDFs antigos criptografados com RC4 para AES-256.

## Ferramentas relacionadas

- [Criptografar PDF](./protect-pdf): proteção simples por senha, sem permissões detalhadas
- [Descriptografar PDF](./unlock-pdf): remove a criptografia por completo
- [Remover Restrições](./remove-restrictions): elimina todas as restrições quando você tem a senha de proprietário
