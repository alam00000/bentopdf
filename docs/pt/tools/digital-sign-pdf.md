---
title: Assinatura Digital
description: Adicione assinaturas digitais criptográficas a PDFs usando certificados X.509. Aceita os formatos PKCS#12 e PEM, com opções de assinatura visível.
---

# Assinatura Digital

Uma assinatura digital é uma prova criptográfica de que uma pessoa específica assinou um documento e de que ele não foi alterado desde então. Ao contrário de uma assinatura desenhada (que é apenas uma imagem), a assinatura digital usa certificados X.509 e padrões PKCS#7 para oferecer autenticidade e integridade verificáveis.

O BentoPDF aplica assinaturas digitais inteiramente no seu navegador. Sua chave privada nunca sai do seu dispositivo.

## Como funciona

1. Envie um arquivo PDF.
2. Envie o arquivo do seu certificado (.pfx, .p12 ou .pem).
3. Digite a senha do certificado para desbloqueá-lo. A ferramenta exibe o titular, o emissor e o período de validade do certificado.
4. Se quiser, configure os metadados da assinatura (motivo, local, informações de contato).
5. Se quiser, ative uma **assinatura visível** com personalização de posição, tamanho, imagem e texto.
6. Clique em **Assinar PDF**.

## Formatos de certificado compatíveis

| Formato     | Extensões  | Descrição                                                                                                                      |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **PKCS#12** | .pfx, .p12 | Pacote padrão do setor contendo a chave privada e a cadeia de certificados. Formato mais comum.                                |
| **PEM**     | .pem       | Formato baseado em texto. Deve conter o certificado e a chave privada no mesmo arquivo. Aceita chaves privadas criptografadas. |

## Opções de assinatura visível

Quando ativado, um bloco de assinatura visível é renderizado na página do PDF:

- **Posição**: coordenadas X/Y e largura/altura em pontos
- **Página**: primeira página, última página, todas as páginas ou um número de página específico
- **Imagem**: envie uma imagem PNG, JPG ou WebP (sua assinatura manuscrita, selo da empresa etc.)
- **Texto**: texto personalizado com cor e tamanho de fonte configuráveis. Se nenhuma imagem ou texto for fornecido, a ferramenta gera automaticamente um texto a partir do nome comum do certificado e da data atual.

## Metadados da assinatura

- **Motivo**: por que o documento foi assinado (por exemplo, "Aprovado", "Revisado")
- **Local**: onde a assinatura ocorreu (por exemplo, "São Paulo, SP")
- **Informações de contato**: como falar com o signatário (por exemplo, endereço de e-mail)

## Nota sobre conexão com a internet

A assinatura pode exigir conexão com a internet. A biblioteca de assinatura busca a cadeia de certificados em URLs incorporadas na extensão Authority Information Access (AIA) do seu certificado. Se esses servidores estiverem inacessíveis, a assinatura falhará para certificados que exigem validação da cadeia.

## Casos de uso

- Assinar contratos, propostas e acordos com assinaturas digitais juridicamente vinculantes
- Certificar documentos oficiais em fluxos de trabalho que exigem autenticação baseada em PKI
- Assinar notas fiscais em PDF para conformidade regulatória (muitos países da UE exigem faturas eletrônicas assinadas digitalmente)
- Adicionar aprovação organizacional a desenhos de engenharia ou documentos de qualidade

## Dicas

- Certificados autoassinados servem para testes, mas exibem avisos no Adobe Reader. Use um certificado de uma Autoridade Certificadora confiável para documentos em produção.
- A assinatura visível é puramente visual. A assinatura criptográfica é incorporada independentemente de o bloco visível estar ativado.
- Verifique seu PDF assinado com a ferramenta Validar Assinatura PDF para confirmar que a assinatura está intacta.

## Ferramentas relacionadas

- [Validar Assinatura PDF](./validate-signature-pdf): verifique assinaturas digitais em PDFs assinados
- [Achatar PDF (Flatten)](./flatten-pdf): achate formulários antes de assinar para impedir modificações
- [Criptografar PDF](./protect-pdf): adicione proteção por senha além da assinatura digital
- [Remover Metadados](./remove-metadata): elimine metadados antes de assinar
