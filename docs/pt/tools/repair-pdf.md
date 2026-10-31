---
title: Reparar PDF
description: Recupere dados de arquivos PDF corrompidos ou danificados usando o mecanismo de reparo do QPDF. Suporta processamento em lote.
---

# Reparar PDF

Quando um PDF se recusa a abrir, exibe conteúdo embaralhado ou gera erros no seu leitor, esta ferramenta tenta reconstruir sua estrutura interna. Ela usa o mecanismo de reparo do QPDF, que consegue recuperar dados de muitos tipos de corrupção: tabelas de referência cruzada quebradas, fluxos truncados, referências de objeto inválidas e mais.

## Como funciona

1. Envie um ou mais arquivos PDF danificados.
2. Clique em **Reparar PDF**.
3. Um único arquivo reparado é baixado diretamente. Vários arquivos geram um arquivo ZIP.

A ferramenta passa cada arquivo pelo QPDF com a flag `--decrypt`, que força o QPDF a ler e reescrever toda a estrutura do PDF, corrigindo no caminho os problemas recuperáveis.

## Recursos

- Reparo em lote de vários PDFs em uma única operação
- Detecção automática de arquivos recuperáveis e irrecuperáveis
- Relatório de sucesso/falha por arquivo ao processar vários arquivos
- Usa o QPDF (WebAssembly), uma biblioteca de transformação de PDF testada em campo

## O que ela pode corrigir

- Tabelas de referência cruzada quebradas ou ausentes
- Finais de arquivo truncados por downloads incompletos
- Numeração de objetos e comprimentos de fluxo inválidos
- Pequenas inconsistências estruturais de geradores de PDF com bugs
- Artefatos de criptografia de tentativas de descriptografia que falharam

## O que ela não pode corrigir

- Arquivos muito truncados, em que a maior parte dos dados de conteúdo está ausente
- PDFs criptografados com uma senha que você não tem
- Arquivos que na verdade não são PDFs (extensão de arquivo errada)
- Corrupção de imagem dentro do PDF (a estrutura é corrigida, mas os dados de pixels não são regenerados)

## Casos de uso

- Recuperar um PDF de um download de e-mail que falhou
- Abrir arquivos produzidos por geradores de PDF legados ou fora do padrão
- Corrigir PDFs que funcionam em um leitor, mas não em outro
- Preparar documentos de arquivo danificados para armazenamento de longo prazo

## Dicas

- Se o reparo falhar, tente abrir o arquivo primeiro em um navegador: os navegadores têm sua própria lógica de recuperação e podem renderizar conteúdo suficiente para salvá-lo de novo.
- Para PDFs criptografados em que o reparo falha, tente primeiro Descriptografar PDF e depois repare a saída descriptografada.

## Ferramentas relacionadas

- [Comprimir PDF](./compress-pdf): limpe ainda mais a estrutura do PDF reparado
- [Linearizar PDF](./linearize-pdf): otimize o arquivo reparado para entrega na web
- [Achatar PDF (Flatten)](./flatten-pdf): achate formulários que possam ter sido danificados
