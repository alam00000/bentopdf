---
title: Validar Assinatura
description: Verifique assinaturas digitais em arquivos PDF. Confira a validade do certificado, a identidade do signatário, a integridade do documento e o status da cadeia de confiança.
---

# Validar Assinatura

Envie um PDF assinado e esta ferramenta extrai todas as assinaturas digitais, identifica o signatário, verifica a validade do certificado e informa se o documento foi modificado após a assinatura. Você também pode fornecer um certificado confiável para verificar a cadeia da assinatura.

## Como funciona

1. Envie um arquivo PDF assinado. A validação começa automaticamente.
2. A ferramenta exibe um resumo: número de assinaturas encontradas e quantas são válidas.
3. Cada assinatura recebe um cartão detalhado com nome do signatário, emissor, datas e status.
4. Opcionalmente, envie um **certificado confiável** (.pem, .crt, .cer, .der) para verificar a assinatura em relação a uma âncora de confiança específica. A revalidação é executada automaticamente.

## O que é verificado

### Análise da assinatura

A ferramenta extrai os objetos de assinatura PKCS#7 do PDF, decodifica a estrutura ASN.1 e obtém o certificado X.509 do signatário, junto com qualquer cadeia de certificados incorporada na assinatura.

### Validade do certificado

- **Expiração**: o certificado está dentro do período de validade no momento?
- **Detecção de autoassinatura**: o certificado é o próprio emissor?
- **Cadeia de confiança**: quando um certificado confiável é fornecido, o certificado do signatário remonta a ele?

### Verificação criptográfica

- A ferramenta reconstrói os bytes cobertos pelo `/ByteRange` da assinatura, calcula o hash deles com o algoritmo declarado pelo signatário e compara o resultado com o atributo `messageDigest` dentro da assinatura.
- Em seguida, ela reserializa os atributos assinados como um SET DER e verifica a assinatura com a chave pública do certificado do signatário.
- **Uma assinatura só é considerada válida quando todas essas verificações passam.** Se os bytes do PDF foram modificados após a assinatura, ou se a assinatura incorporada não corresponde à chave do signatário, o status mostra "Inválido: falha na verificação criptográfica" com o motivo específico.

#### Algoritmos de assinatura suportados

| Algoritmo               | Caminho de verificação                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, com fallback para Web Crypto                                |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                         |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` após a conversão da assinatura DER → IEEE P1363 |

Se uma assinatura usa um algoritmo fora dessa lista (por exemplo Ed25519, SM2 ou RSA com um OID de digest incomum), o cartão mostra **"Não verificada: algoritmo de assinatura não compatível"** em amarelo, junto com o OID ou o motivo específico. Trata-se de uma distinção deliberada em três estados:

- **Válida**: assinatura verificada criptograficamente com a chave pública do signatário.
- **Inválida**: a verificação foi executada e deu resultado negativo (bytes alterados, chave incompatível).
- **Não verificada**: a ferramenta não conseguiu executar a verificação para esse algoritmo. Os metadados do certificado continuam sendo exibidos, mas você deve tratar a assinatura como "desconhecida" e verificá-la com o Adobe Acrobat ou `openssl cms -verify`.

### Algoritmos de digest inseguros

- Assinaturas que usam **MD5 ou SHA-1** são rejeitadas como inválidas e sinalizadas com o status "Resumo inseguro". Ambos os algoritmos têm ataques de colisão publicados, então uma assinatura sobre um hash SHA-1 ou MD5 não oferece garantia de integridade.
- SHA-224, SHA-256, SHA-384 e SHA-512 são todos aceitos.

### Cobertura do documento

- **Cobertura total**: a assinatura cobre todo o arquivo PDF, ou seja, nenhum byte foi adicionado ou alterado após a assinatura.
- **Cobertura parcial**: a assinatura cobre apenas parte do arquivo. Isso pode indicar que houve modificações após a assinatura (não necessariamente maliciosas: salvamentos incrementais produzem cobertura parcial).

## Detalhes da assinatura

Cada cartão de assinatura mostra:

- **Assinado por**: nome comum, organização e e-mail do certificado do signatário
- **Emissor**: a autoridade certificadora que emitiu o certificado do signatário
- **Assinado em**: o carimbo de data e hora incorporado na assinatura
- **Válido de / Válido até**: o período de validade do certificado
- **Motivo**: por que o documento foi assinado (se informado)
- **Local**: onde foi assinado (se informado)
- **Status de cobertura**: total ou parcial
- **Selo de confiança**: confiável ou fora da cadeia de confiança (somente quando um certificado personalizado é fornecido)

### Detalhes técnicos

Expanda a seção de detalhes técnicos para ver:

- Número de série do certificado do signatário
- Algoritmo de digest (SHA-256, SHA-512 etc.)
- Algoritmo de assinatura (RSA com SHA-256, ECDSA com SHA-256 etc.)
- Mensagens de erro para assinaturas inválidas

## Casos de uso

- Verificar um contrato assinado digitalmente antes de assinar em seguida
- Auditar documentos assinados para confirmar que não foram adulterados
- Conferir se um certificado expirou desde que o documento foi assinado
- Validar assinaturas com o certificado raiz da sua organização
- Inspecionar os detalhes de assinatura de documentos governamentais ou jurídicos

## Dicas

- Um certificado autoassinado não significa que a assinatura é inválida: significa que a identidade do signatário não pode ser verificada por meio de um terceiro confiável. Isso é comum em documentos internos.
- A cobertura parcial nem sempre indica adulteração. Muitos fluxos de trabalho de PDF adicionam atualizações incrementais (como uma segunda assinatura) que criam cobertura parcial.
- Envie o certificado raiz ou intermediário da sua organização como certificado confiável para obter a verificação da cadeia de confiança.

## Ferramentas relacionadas

- [Assinatura Digital PDF](./digital-sign-pdf): assine PDFs com seu próprio certificado
- [Achatar PDF (Flatten)](./flatten-pdf): achate um PDF antes de assinar para evitar modificações após a assinatura
- [Remover Metadados](./remove-metadata): limpe um PDF antes de aplicar uma assinatura
