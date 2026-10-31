---
title: Remover restrições
description: Remova a proteção por senha, restrições de impressão, bloqueios de edição e limites de cópia de arquivos PDF.
---

# Remover restrições

Os PDFs podem ter dois tipos de senha: uma senha de usuário (necessária para abrir o arquivo) e uma senha de proprietário (controla o que você pode fazer com ele). Esta ferramenta remove ambas, junto com todas as restrições associadas: bloqueios de impressão, edição, cópia e anotação.

## Como funciona

1. Envie um arquivo PDF.
2. Se o PDF tiver uma senha de proprietário, digite-a no campo **Senha de proprietário**. Deixe em branco se o PDF tiver apenas restrições de uso sem senha.
3. Clique em **Remover Restrições**.
4. Baixe o PDF sem restrições.

A ferramenta usa as flags `--decrypt` e `--remove-restrictions` do QPDF para produzir uma cópia limpa e sem restrições.

## O que é removido

- Proteção por senha (senhas de usuário e de proprietário)
- Restrições de impressão
- Restrições de edição
- Restrições de cópia de texto e imagens
- Restrições de anotação e comentários
- Todas as outras limitações de segurança codificadas no PDF

## Casos de uso

- Desbloquear um PDF seu cuja senha você definiu anos atrás
- Remover restrições de impressão de um documento ao qual você tem acesso legítimo
- Permitir copiar e colar em materiais de referência para anotações
- Preparar PDFs para ferramentas de acessibilidade que não lidam com documentos restritos

## Dicas

- Você precisa saber a senha de proprietário, se houver uma. Esta ferramenta não quebra nem tenta adivinhar senhas por força bruta.
- Se você precisa manter o arquivo criptografado, mas alterar permissões específicas, use a ferramenta Alterar Permissões.
- O arquivo de saída não tem nenhuma criptografia: qualquer pessoa que o receber pode abri-lo livremente.

## Ferramentas relacionadas

- [Descriptografar PDF](./unlock-pdf): desbloqueie um PDF quando você souber a senha de usuário
- [Criptografar PDF](./protect-pdf): aplique a criptografia novamente com novas configurações
- [Alterar Permissões](./change-permissions): modifique seletivamente quais ações são permitidas
