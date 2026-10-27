---
title: Proteger PDF
description: Proteja arquivos PDF com senha usando criptografia AES de 256 bits. Defina senhas de usuário e de proprietário com restrições de uso configuráveis.
---

# Proteger PDF

Bloqueie seu PDF com uma senha para que só pessoas autorizadas possam abri-lo. O BentoPDF usa criptografia AES de 256 bits, o mesmo padrão usado por bancos e órgãos governamentais, aplicada inteiramente no seu navegador via QPDF.

## Como funciona

1. Envie um arquivo PDF.
2. Digite uma **Senha de usuário** (obrigatória). É a senha que as pessoas precisarão para abrir o arquivo.
3. Opcionalmente, digite uma **Senha de proprietário**. Quando definida, o PDF ganha restrições de uso que impedem imprimir, editar, copiar e anotar.
4. Clique em **Criptografar PDF**.
5. Baixe o arquivo criptografado.

## Tipos de senha

### Senha de usuário (obrigatória)

A senha de usuário é o que os destinatários digitam para abrir o PDF. Sem ela, o documento fica totalmente inacessível. Todo PDF criptografado precisa de uma.

### Senha de proprietário (opcional)

A senha de proprietário controla o que um usuário autorizado pode fazer depois de abrir o arquivo. Quando você define uma senha de proprietário diferente, o BentoPDF aplica automaticamente o conjunto de restrições mais rígido:

- Modificação desativada
- Extração/cópia desativada
- Impressão desativada
- Anotação desativada
- Preenchimento de formulários desativado
- Montagem de documento desativada

Se você deixar a senha de proprietário em branco, o PDF é criptografado (ainda exige a senha de usuário para abrir), mas não tem restrições de uso depois de aberto.

## Detalhes da criptografia

- **Algoritmo**: AES-256 (Advanced Encryption Standard de 256 bits)
- **Tamanho da chave**: 256 bits
- **Padrão**: criptografia PDF 2.0 (implementação do QPDF)

Com a tecnologia atual, é computacionalmente inviável quebrar o AES-256 por força bruta. A segurança do seu PDF criptografado depende inteiramente da força da sua senha.

## Casos de uso

- Proteger relatórios financeiros confidenciais antes de enviá-los por e-mail
- Proteger documentos jurídicos compartilhados com a parte contrária
- Adicionar senha a prontuários médicos ou informações de identificação pessoal
- Distribuir conteúdo pago (e-books, relatórios) com controle de acesso
- Cumprir políticas de proteção de dados que exigem criptografia em repouso

## Dicas

- Use uma senha forte e exclusiva. Uma frase-senha de 12 ou mais caracteres com maiúsculas, minúsculas, números e símbolos é o ideal.
- Compartilhe a senha por um canal separado (telefone, mensagem de texto), nunca no mesmo e-mail do PDF.
- Se você só precisa restringir ações (sem imprimir, sem copiar) sem exigir senha para abrir, use a ferramenta Alterar Permissões.

## Ferramentas relacionadas

- [Descriptografar PDF](./unlock-pdf): remova a criptografia quando você souber a senha
- [Alterar Permissões](./change-permissions): modifique restrições de uso específicas
- [Remover Restrições](./remove-restrictions): remova toda a segurança de um PDF
- [Sanitizar PDF](./sanitize-pdf): remova conteúdo oculto antes de criptografar
