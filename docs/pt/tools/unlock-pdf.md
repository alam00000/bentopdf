---
title: Desbloquear PDF
description: Remova a proteção por senha de PDFs criptografados. Suporta descriptografia em lote com uma única senha para vários arquivos.
---

# Desbloquear PDF

Se você tem a senha de um PDF criptografado, esta ferramenta remove a criptografia por completo e gera uma cópia desbloqueada que qualquer pessoa pode abrir sem credenciais. Ela suporta descriptografia em lote quando vários PDFs compartilham a mesma senha.

## Como funciona

1. Envie um ou mais arquivos PDF criptografados.
2. Digite a **senha** usada para proteger os arquivos.
3. Clique em **Descriptografar PDF**.
4. Um único arquivo é baixado diretamente. Vários arquivos geram um arquivo ZIP com todos os PDFs desbloqueados.

## Recursos

- Descriptografia de um único arquivo e em lote
- Funciona com senhas de usuário e senhas de proprietário
- Gera uma saída totalmente sem criptografia e sem restrições residuais
- Relatório de erros claro para senhas incorretas ou arquivos corrompidos
- Acompanhamento de sucesso/falha por arquivo no modo em lote

## Diferença em relação a Remover Restrições

**Descriptografar PDF** exige a senha e remove toda a criptografia. **Remover Restrições** atua sobre as restrições de uso (impressão, cópia, edição) e pode não exigir senha se apenas uma senha de proprietário foi definida. Use Descriptografar quando o PDF não abre de jeito nenhum sem senha.

## Casos de uso

- Desbloquear de forma permanente PDFs que você criptografou antes, quando a senha não é mais necessária
- Remover a criptografia de um lote de documentos arquivados para facilitar o acesso a longo prazo
- Preparar PDFs protegidos por senha para um sistema de gerenciamento de documentos que não suporta arquivos criptografados
- Desbloquear PDFs antes de mesclá-los com outros documentos (muitas ferramentas de mesclagem não processam arquivos criptografados)

## Dicas

- O campo de senha vale para todos os arquivos enviados. Se seus PDFs têm senhas diferentes, processe-os em lotes separados.
- Se aparecer o erro "Senha incorreta", verifique se há espaços no final ou se o Caps Lock está ativado.
- Após a descriptografia, a saída não tem nenhuma segurança. Criptografe novamente com Criptografar PDF se precisar aplicar uma nova senha.

## Ferramentas relacionadas

- [Criptografar PDF](./protect-pdf): aplique a criptografia novamente com uma nova senha
- [Remover Restrições](./remove-restrictions): remova restrições de uso sem descriptografar totalmente
- [Alterar Permissões](./change-permissions): modifique permissões específicas de um PDF criptografado
